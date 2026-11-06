import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { NumField, Stat, ToolLayout, Toggle, n, toolHead } from "@/components/ToolLayout";
import { calcNetPnl, fmtMoney, fmtNum, type Side } from "@/lib/calculators";

export const Route = createFileRoute("/tools/net-pnl-calculator")({
  head: () =>
    toolHead(
      "Crypto Net PnL Calculator — Fees, Funding & Break-even | Amniverse",
      "Free crypto futures & spot Net PnL calculator. See your real profit after maker/taker fees, perpetual funding rates and gas — plus your exact break-even exit price.",
    ),
  component: NetPnlPage,
});

const sideOptions = [
  { value: "long", label: "Long" },
  { value: "short", label: "Short" },
] as const;

const currencyOptions = [
  { value: "USDT", label: "USDT" },
  { value: "₹", label: "INR ₹" },
] as const;

function NetPnlPage() {
  const [side, setSide] = useState<Side>("long");
  const [currency, setCurrency] = useState<"USDT" | "₹">("USDT");
  const [f, setF] = useState({
    entry: "60000",
    exit: "61200",
    qty: "0.05",
    lev: "10",
    entryFee: "0.05",
    exitFee: "0.05",
    funding: "0.01",
    hours: "48",
    other: "0",
  });
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const r = useMemo(
    () =>
      calcNetPnl({
        side,
        entryPrice: n(f.entry),
        exitPrice: n(f.exit),
        quantity: n(f.qty),
        leverage: n(f.lev),
        entryFeePct: n(f.entryFee),
        exitFeePct: n(f.exitFee),
        fundingRatePct: n(f.funding),
        holdingHours: n(f.hours),
        otherCosts: n(f.other),
      }),
    [side, f],
  );
  const m = (v: number) => fmtMoney(v, currency);
  const tone = (v: number): "positive" | "negative" | "neutral" =>
    v > 0 ? "positive" : v < 0 ? "negative" : "neutral";

  return (
    <ToolLayout
      kicker="Free tool · Spot & perpetual futures"
      title="Crypto Net PnL Calculator"
      source="net-pnl-calculator"
      intro={
        <p>
          Your exchange shows gross PnL. This shows what actually lands in your account after
          maker/taker fees, funding payments and gas — and the exit price you need just to break
          even.
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
              id="entry"
              label="Entry price"
              value={f.entry}
              onChange={set("entry")}
              suffix={currency}
            />
            <NumField
              id="exit"
              label="Exit price"
              value={f.exit}
              onChange={set("exit")}
              suffix={currency}
            />
            <NumField id="qty" label="Quantity (coins)" value={f.qty} onChange={set("qty")} />
            <NumField
              id="lev"
              label="Leverage"
              value={f.lev}
              onChange={set("lev")}
              suffix="×"
              hint="1 for spot"
            />
            <NumField
              id="entryFee"
              label="Entry fee"
              value={f.entryFee}
              onChange={set("entryFee")}
              suffix="%"
              hint="Taker ~0.05%, maker ~0.02%"
            />
            <NumField
              id="exitFee"
              label="Exit fee"
              value={f.exitFee}
              onChange={set("exitFee")}
              suffix="%"
            />
            <NumField
              id="funding"
              label="Funding rate / 8h"
              value={f.funding}
              onChange={set("funding")}
              suffix="%"
              hint="0 for spot. Negative if shorts pay."
            />
            <NumField
              id="hours"
              label="Holding time"
              value={f.hours}
              onChange={set("hours")}
              suffix="hours"
            />
            <NumField
              id="other"
              label="Gas / other costs"
              value={f.other}
              onChange={set("other")}
              suffix={currency}
            />
          </div>
        </div>

        <div className="panel space-y-4 bg-terminal p-6">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Gross PnL" value={m(r.grossPnl)} tone={tone(r.grossPnl)} />
            <Stat label="Net PnL" value={m(r.netPnl)} tone={tone(r.netPnl)} big />
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full font-mono text-xs">
              <tbody className="[&_td]:px-3 [&_td]:py-2.5 [&_tr]:border-b [&_tr]:border-border/60 [&_tr:last-child]:border-0">
                <tr>
                  <td className="text-muted-foreground">Trading fees</td>
                  <td className="text-right text-pnl-negative">{m(-r.fees)}</td>
                </tr>
                <tr>
                  <td className="text-muted-foreground">
                    Funding ({r.fundingIntervals} payment{r.fundingIntervals === 1 ? "" : "s"})
                  </td>
                  <td
                    className={`text-right ${r.funding > 0 ? "text-pnl-negative" : "text-pnl-positive"}`}
                  >
                    {m(-r.funding)}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted-foreground">Gas / other</td>
                  <td className="text-right text-pnl-negative">{m(-r.otherCosts)}</td>
                </tr>
                <tr>
                  <td className="font-semibold text-foreground">Total hidden costs</td>
                  <td className="text-right font-semibold text-pnl-negative">{m(-r.totalCosts)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat
              label="Break-even exit"
              value={r.breakEvenExit === null ? "—" : `${fmtNum(r.breakEvenExit, 4)} ${currency}`}
            />
            <Stat
              label="ROI on margin"
              value={`${fmtNum(r.roiOnMarginPct, 2)}%`}
              tone={tone(r.roiOnMarginPct)}
            />
            <Stat label="Position size" value={m(r.entryNotional)} />
            <Stat label="Margin used" value={m(r.margin)} />
          </div>
          {r.costShareOfGrossPct !== null ? (
            <p
              className={`rounded-lg border px-4 py-3 text-sm ${
                r.costShareOfGrossPct >= 30
                  ? "border-pnl-negative/40 bg-pnl-negative/10 text-foreground"
                  : "border-border text-muted-foreground"
              }`}
            >
              Costs ate{" "}
              <span className="font-mono font-semibold">{fmtNum(r.costShareOfGrossPct, 1)}%</span>{" "}
              of this trade&rsquo;s gross profit.
            </p>
          ) : null}
        </div>
      </div>
    </ToolLayout>
  );
}

function Explainer() {
  return (
    <>
      <h2>How Net PnL is calculated</h2>
      <ul>
        <li>
          <strong>Gross PnL</strong> = (exit − entry) × quantity for longs, (entry − exit) ×
          quantity for shorts.
        </li>
        <li>
          <strong>Fees</strong> = entry value × entry fee % + exit value × exit fee %. Fees are
          charged on the full position size, not your margin — so 10× leverage means 10× the fees on
          your capital.
        </li>
        <li>
          <strong>Funding</strong> = position value × funding rate × number of 8-hour funding times
          you held through. When the rate is positive, longs pay shorts.
        </li>
        <li>
          <strong>Break-even exit</strong> is the price where all of the above nets to zero.
        </li>
      </ul>
      <h2>Why it matters</h2>
      <p>
        On small, frequent, leveraged trades, fees and funding can eat a third or more of your gross
        profit. A strategy that wins 60% of the time can still lose money once costs are counted.
        Tracking Net PnL per trade is the only way to see which setups actually pay.
      </p>
    </>
  );
}
