// Pure calculation helpers for the free tools. No React, so they're easy to test.

export type Side = "long" | "short";

const pct = (v: number) => v / 100;

// ---------------------------------------------------------------- Net PnL

export interface NetPnlInput {
  side: Side;
  entryPrice: number;
  exitPrice: number;
  quantity: number; // units of the coin
  leverage: number; // 1 for spot
  entryFeePct: number; // e.g. 0.05 for 0.05%
  exitFeePct: number;
  fundingRatePct: number; // per 8h funding interval, e.g. 0.01
  holdingHours: number;
  otherCosts: number; // gas, withdrawal, etc. in quote currency
}

export interface NetPnlResult {
  entryNotional: number;
  exitNotional: number;
  margin: number;
  grossPnl: number;
  fees: number;
  funding: number; // positive = you paid, negative = you received
  fundingIntervals: number;
  otherCosts: number;
  totalCosts: number;
  netPnl: number;
  roiOnMarginPct: number;
  costShareOfGrossPct: number | null; // how much of the gross profit the costs ate
  breakEvenExit: number | null;
}

export function calcNetPnl(i: NetPnlInput): NetPnlResult {
  const dir = i.side === "long" ? 1 : -1;
  const entryNotional = i.entryPrice * i.quantity;
  const exitNotional = i.exitPrice * i.quantity;
  const lev = i.leverage > 0 ? i.leverage : 1;
  const margin = entryNotional / lev;

  const grossPnl = (i.exitPrice - i.entryPrice) * i.quantity * dir;
  const fees = entryNotional * pct(i.entryFeePct) + exitNotional * pct(i.exitFeePct);
  const fundingIntervals = Math.max(0, Math.floor(i.holdingHours / 8));
  // Positive funding rate: longs pay shorts.
  const funding = entryNotional * pct(i.fundingRatePct) * fundingIntervals * dir;
  const totalCosts = fees + funding + i.otherCosts;
  const netPnl = grossPnl - totalCosts;

  const q = i.quantity;
  const fe = pct(i.entryFeePct);
  const fx = pct(i.exitFeePct);
  const fixed = funding + i.otherCosts;
  let breakEvenExit: number | null = null;
  if (q > 0) {
    breakEvenExit =
      i.side === "long"
        ? (i.entryPrice * q * (1 + fe) + fixed) / (q * (1 - fx))
        : (i.entryPrice * q * (1 - fe) - fixed) / (q * (1 + fx));
    if (!Number.isFinite(breakEvenExit) || breakEvenExit <= 0) breakEvenExit = null;
  }

  return {
    entryNotional,
    exitNotional,
    margin,
    grossPnl,
    fees,
    funding,
    fundingIntervals,
    otherCosts: i.otherCosts,
    totalCosts,
    netPnl,
    roiOnMarginPct: margin > 0 ? (netPnl / margin) * 100 : 0,
    costShareOfGrossPct: grossPnl > 0 ? (totalCosts / grossPnl) * 100 : null,
    breakEvenExit,
  };
}

// ---------------------------------------------------------- Position size

export interface PositionSizeInput {
  side: Side;
  accountBalance: number;
  riskPct: number; // e.g. 1 for 1%
  entryPrice: number;
  stopPrice: number;
  leverage: number;
  feePct: number; // taker fee per side
  maintenanceMarginPct: number; // e.g. 0.5
}

export interface PositionSizeResult {
  riskAmount: number;
  stopDistancePct: number;
  quantity: number;
  notional: number;
  margin: number;
  liquidationPrice: number | null;
  stopIsValid: boolean; // stop on the correct side of entry
  stopBeyondLiquidation: boolean; // you'd be liquidated before your stop
  marginExceedsBalance: boolean;
  maxSafeLeverage: number | null; // highest leverage that keeps liquidation beyond the stop
}

export function calcPositionSize(i: PositionSizeInput): PositionSizeResult {
  const riskAmount = i.accountBalance * pct(i.riskPct);
  const stopIsValid = i.side === "long" ? i.stopPrice < i.entryPrice : i.stopPrice > i.entryPrice;
  const stopDistance = Math.abs(i.entryPrice - i.stopPrice);
  const stopDistancePct = i.entryPrice > 0 ? (stopDistance / i.entryPrice) * 100 : 0;

  // Loss per unit if the stop is hit, including fees on entry and exit.
  const perUnitLoss = stopDistance + (i.entryPrice + i.stopPrice) * pct(i.feePct);
  const quantity = stopIsValid && perUnitLoss > 0 ? riskAmount / perUnitLoss : 0;
  const notional = quantity * i.entryPrice;
  const lev = i.leverage > 0 ? i.leverage : 1;
  const margin = notional / lev;

  const mmr = pct(i.maintenanceMarginPct);
  let liquidationPrice: number | null = null;
  if (lev > 1) {
    liquidationPrice =
      i.side === "long" ? i.entryPrice * (1 - 1 / lev + mmr) : i.entryPrice * (1 + 1 / lev - mmr);
    if (liquidationPrice <= 0) liquidationPrice = null;
  }
  const stopBeyondLiquidation =
    liquidationPrice !== null &&
    stopIsValid &&
    (i.side === "long" ? i.stopPrice <= liquidationPrice : i.stopPrice >= liquidationPrice);

  // Liquidation distance ≈ 1/lev − mmr must exceed the stop distance.
  const stopFrac = stopDistancePct / 100;
  const maxSafeLeverage =
    stopIsValid && stopFrac + mmr > 0 ? Math.floor(1 / (stopFrac + mmr)) : null;

  return {
    riskAmount,
    stopDistancePct,
    quantity,
    notional,
    margin,
    liquidationPrice,
    stopIsValid,
    stopBeyondLiquidation,
    marginExceedsBalance: margin > i.accountBalance,
    maxSafeLeverage,
  };
}

// ------------------------------------------------- Section 115BBH VDA tax

export interface VdaTrade {
  cost: number; // cost of acquisition
  saleValue: number; // full sale consideration
}

export const VDA_TAX_RATE = 0.3;
export const CESS_RATE = 0.04;
export const TDS_RATE = 0.01;

export interface VdaTaxResult {
  totalGains: number; // sum of profitable trades only
  totalLosses: number; // sum of losing trades (as a positive number) — cannot be set off
  netResult: number; // gains − losses, what most traders think they "made"
  taxableIncome: number;
  baseTax: number;
  cess: number;
  totalTax: number;
  tdsCredit: number;
  balancePayable: number; // negative = refund due
  taxIfLossesCouldOffset: number; // to show the cost of the no-set-off rule
  effectiveRateOnNetPct: number | null;
}

export function calcVdaTax(trades: VdaTrade[], tdsDeducted: boolean): VdaTaxResult {
  let totalGains = 0;
  let totalLosses = 0;
  let totalSales = 0;
  for (const t of trades) {
    const gain = t.saleValue - t.cost;
    if (gain > 0) totalGains += gain;
    else totalLosses += -gain;
    totalSales += t.saleValue;
  }
  const taxableIncome = totalGains;
  const baseTax = taxableIncome * VDA_TAX_RATE;
  const cess = baseTax * CESS_RATE;
  const totalTax = baseTax + cess;
  const tdsCredit = tdsDeducted ? totalSales * TDS_RATE : 0;
  const netResult = totalGains - totalLosses;
  const taxIfLossesCouldOffset = Math.max(0, netResult) * VDA_TAX_RATE * (1 + CESS_RATE);

  return {
    totalGains,
    totalLosses,
    netResult,
    taxableIncome,
    baseTax,
    cess,
    totalTax,
    tdsCredit,
    balancePayable: totalTax - tdsCredit,
    taxIfLossesCouldOffset,
    effectiveRateOnNetPct: netResult > 0 ? (totalTax / netResult) * 100 : null,
  };
}

// ---------------------------------------------------------------- Format

export function fmtMoney(value: number, currency: string): string {
  const sign = value < 0 ? "−" : "";
  const abs = Math.abs(value);
  const digits = abs !== 0 && abs < 1 ? 4 : 2;
  const body = abs.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  });
  return currency === "₹" ? `${sign}₹${body}` : `${sign}${body} ${currency}`;
}

export function fmtNum(value: number, maxDigits = 4): string {
  return value.toLocaleString("en-IN", { maximumFractionDigits: maxDigits });
}
