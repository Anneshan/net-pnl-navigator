import { describe, expect, it } from "vitest";
import { calcNetPnl, calcPositionSize, calcVdaTax } from "@/lib/calculators";

describe("calcNetPnl", () => {
  const base = {
    side: "long" as const,
    entryPrice: 100,
    exitPrice: 110,
    quantity: 10,
    leverage: 10,
    entryFeePct: 0.05,
    exitFeePct: 0.05,
    fundingRatePct: 0.01,
    holdingHours: 24,
    otherCosts: 1,
  };

  it("subtracts fees, funding and other costs from gross", () => {
    const r = calcNetPnl(base);
    expect(r.grossPnl).toBe(100);
    expect(r.fees).toBeCloseTo(1000 * 0.0005 + 1100 * 0.0005); // 1.05
    expect(r.fundingIntervals).toBe(3);
    expect(r.funding).toBeCloseTo(1000 * 0.0001 * 3); // 0.3
    expect(r.netPnl).toBeCloseTo(100 - 1.05 - 0.3 - 1);
    expect(r.margin).toBe(100);
  });

  it("break-even exit gives ~zero net PnL", () => {
    const r = calcNetPnl(base);
    const atBe = calcNetPnl({ ...base, exitPrice: r.breakEvenExit! });
    expect(atBe.netPnl).toBeCloseTo(0, 6);
    const short = calcNetPnl({ ...base, side: "short", exitPrice: 90 });
    const shortBe = calcNetPnl({ ...base, side: "short", exitPrice: short.breakEvenExit! });
    expect(shortBe.netPnl).toBeCloseTo(0, 6);
  });

  it("shorts receive positive funding", () => {
    const r = calcNetPnl({ ...base, side: "short", exitPrice: 90 });
    expect(r.grossPnl).toBe(100);
    expect(r.funding).toBeLessThan(0);
  });
});

describe("calcPositionSize", () => {
  it("sizes so a stop-out loses the risk amount (incl. fees)", () => {
    const r = calcPositionSize({
      side: "long",
      accountBalance: 100000,
      riskPct: 1,
      entryPrice: 100,
      stopPrice: 95,
      leverage: 5,
      feePct: 0.05,
      maintenanceMarginPct: 0.5,
    });
    expect(r.riskAmount).toBe(1000);
    const lossIfStopped = r.quantity * 5 + r.quantity * (100 + 95) * 0.0005;
    expect(lossIfStopped).toBeCloseTo(1000);
    expect(r.liquidationPrice).toBeCloseTo(100 * (1 - 0.2 + 0.005));
    expect(r.stopBeyondLiquidation).toBe(false);
    expect(r.maxSafeLeverage).toBe(Math.floor(1 / (0.05 + 0.005)));
  });

  it("flags stops past liquidation and invalid stops", () => {
    const high = calcPositionSize({
      side: "long",
      accountBalance: 1000,
      riskPct: 1,
      entryPrice: 100,
      stopPrice: 90,
      leverage: 20,
      feePct: 0,
      maintenanceMarginPct: 0.5,
    });
    expect(high.stopBeyondLiquidation).toBe(true);
    const wrong = calcPositionSize({
      side: "short",
      accountBalance: 1000,
      riskPct: 1,
      entryPrice: 100,
      stopPrice: 90,
      leverage: 2,
      feePct: 0,
      maintenanceMarginPct: 0.5,
    });
    expect(wrong.stopIsValid).toBe(false);
    expect(wrong.quantity).toBe(0);
  });
});

describe("calcVdaTax", () => {
  it("taxes gains at 30% + cess with no loss set-off", () => {
    const r = calcVdaTax(
      [
        { cost: 100000, saleValue: 150000 },
        { cost: 80000, saleValue: 50000 },
      ],
      true,
    );
    expect(r.totalGains).toBe(50000);
    expect(r.totalLosses).toBe(30000);
    expect(r.netResult).toBe(20000);
    expect(r.totalTax).toBeCloseTo(50000 * 0.3 * 1.04); // 15,600
    expect(r.tdsCredit).toBeCloseTo(2000);
    expect(r.balancePayable).toBeCloseTo(13600);
    expect(r.taxIfLossesCouldOffset).toBeCloseTo(20000 * 0.312);
  });
});
