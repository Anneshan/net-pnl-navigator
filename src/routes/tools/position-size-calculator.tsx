import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { NumField, Stat, ToolLayout, Toggle, n, toolHead } from "@/components/ToolLayout";
import { calcPositionSize, fmtMoney, fmtNum, type Side } from "@/lib/calculators";

export const Route = createFileRoute("/tools/position-size-calculator")({
  head: () =>
    toolHead(
      "Crypto Position Size & Liquidation Price Calculator | Amniverse",
      "Free crypto futures position size calculator. Enter your balance, risk % and stop-loss to get the exact position size, margin, liquidation price and the maximum safe leverage.",
    ),
  component: PositionSizePage,
});

const sideOptions = [
  { value: "long", label: "Long" },
  { value: "short", label: "Short" },
] as const;

const currencyOptions = [
  { value: "USDT", label: "USDT" },
  { value: "₹", label: "INR ₹" },
] as const;

function PositionSizePage() {
  const [side, setSide] = useState<Side>("long");
  const [currency, setCurrency] = useState<"USDT" | "₹">("USDT");
  const [f, setF] = useState({
    balance: "1000",
    risk: "1",
    entry: "60000",
    stop: "58800",
    lev: "10",
    fee: "0.05",
    mmr: "0.5",
    gst: "18",
  });
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const r = useMemo(
    () =>
      calcPositionSize({
        side,
        accountBalance: n(f.balance),
        riskPct: n(f.risk),
        entryPrice: n(f.entry),
        stopPrice: n(f.stop),
        leverage: n(f.lev),
        feePct: n(f.fee),
        maintenanceMarginPct: n(f.mmr),
        gstPct: n(f.gst),
      }),
    [side, f],
  );
  const m = (v: number) => fmtMoney(v, currency);

  const warnings: { tone: "bad" | "warn"; text: string }[] = [];
  if (!r.stopIsValid)
    warnings.push({
      tone: "bad",
      text:
        side === "long"
          ? "For a long, your stop-loss must be below the entry price."
          : "For a short, your stop-loss must be above the entry price.",
    });
  if (r.stopBeyondLiquidation)
    warnings.push({
      tone: "bad",
      text: `At ${f.lev}× you'd be liquidated before your stop is hit. Lower leverage to ${r.maxSafeLeverage ?? 1}× or less.`,
    });
  if (r.marginExceedsBalance)
    warnings.push({
      tone: "warn",
      text: "The margin needed is more than your balance. Increase leverage (within the safe limit) or reduce risk.",
    });
  if (n(f.risk) > 2)
    warnings.push({
      tone: "warn",
      text: "Risking more than 2% per trade makes a losing streak very costly.",
    });

  return (
    <ToolLayout
      kicker="Free tool · Risk management"
      title="Position Size & Liquidation Calculator"
      source="position-size-calculator"
      intro={
        <p>
          Decide how much you&rsquo;re willing to lose first, then let the math pick the size. This
          tells you the exact position to open so a stop-out costs only your chosen risk — fees
          included — and warns you if liquidation would hit before your stop.
        </p>
      }
      explainer={<Explainer />}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <Toggle label="Direction" value={side} options={sideOptions} onChange={setSide} />
            <Toggle
              label="Quote currency"
              value={currency}
              options={currencyOptions}
              onChange={setCurrency}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <NumField
              id="balance"
              label="Account balance"
              value={f.balance}
              onChange={set("balance")}
              suffix={currency}
            />
            <NumField
              id="risk"
              label="Risk per trade"
              value={f.risk}
              onChange={set("risk")}
              suffix="%"
              hint="Pros use 0.5–2%"
            />
            <NumField
              id="entry"
              label="Entry price"
              value={f.entry}
              onChange={set("entry")}
              suffix={currency}
            />
            <NumField
              id="stop"
              label="Stop-loss price"
              value={f.stop}
              onChange={set("stop")}
              suffix={currency}
            />
            <NumField id="lev" label="Leverage" value={f.lev} onChange={set("lev")} suffix="×" />
            <NumField
              id="fee"
              label="Taker fee"
              value={f.fee}
              onChange={set("fee")}
              suffix="%"
              hint="Delta India: 0.05%"
            />
            <NumField
              id="gst"
              label="GST on fees"
              value={f.gst}
              onChange={set("gst")}
              suffix="%"
              hint="18% in India"
            />
            <NumField
              id="mmr"
              label="Maintenance margin"
              value={f.mmr}
              onChange={set("mmr")}
              suffix="%"
              hint="Usually 0.4–1% on major pairs"
            />
          </div>
        </div>

        <div className="panel space-y-4 bg-terminal p-6">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Position size (coins)" value={fmtNum(r.quantity, 6)} big />
            <Stat label="Position value" value={m(r.notional)} big />
            <Stat label="Max loss if stopped" value={m(-r.riskAmount)} tone="negative" />
            <Stat label="Margin needed" value={m(r.margin)} />
            <Stat label="Stop distance" value={`${fmtNum(r.stopDistancePct, 2)}%`} />
            <Stat
              label="Est. liquidation price"
              value={
                r.liquidationPrice === null
                  ? "None (1×)"
                  : `${fmtNum(r.liquidationPrice, 2)} ${currency}`
              }
              tone={r.stopBeyondLiquidation ? "negative" : "neutral"}
            />
          </div>
          <Stat
            label="Max safe leverage for this stop"
            value={r.maxSafeLeverage === null ? "—" : `${r.maxSafeLeverage}×`}
            tone="positive"
          />
          {warnings.length === 0 ? (
            <p className="rounded-lg border border-pnl-positive/40 bg-pnl-positive/10 px-4 py-3 text-sm text-foreground">
              ✓ Your stop sits safely before liquidation.
            </p>
          ) : (
            <ul className="space-y-2">
              {warnings.map((w) => (
                <li
                  key={w.text}
                  className={`rounded-lg border px-4 py-3 text-sm text-foreground ${
                    w.tone === "bad"
                      ? "border-pnl-negative/40 bg-pnl-negative/10"
                      : "border-accent/40 bg-accent/10"
                  }`}
                >
                  {w.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

function Explainer() {
  return (
    <>
      <h2>How the position size is worked out</h2>
      <ul>
        <li>
          <strong>Risk amount</strong> = account balance × risk %. This is the most you lose if the
          stop is hit.
        </li>
        <li>
          <strong>Loss per coin</strong> = distance from entry to stop + entry and exit fees (with
          18% GST on Indian exchanges).
        </li>
        <li>
          <strong>Position size</strong> = risk amount ÷ loss per coin.
        </li>
        <li>
          <strong>Leverage doesn&rsquo;t change your risk</strong> — it only changes how much margin
          you lock up and how close liquidation is.
        </li>
      </ul>
      <h2>About the liquidation estimate</h2>
      <p>
        For isolated margin, liquidation is roughly entry × (1 − 1/leverage + maintenance margin)
        for longs and entry × (1 + 1/leverage − maintenance margin) for shorts. Exchanges use tiered
        maintenance margins and include fees, so treat this as an estimate and keep a buffer.
      </p>
    </>
  );
}
