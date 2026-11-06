import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Stat, ToolLayout, n, toolHead } from "@/components/ToolLayout";
import { calcVdaTax, fmtMoney, fmtNum } from "@/lib/calculators";

export const Route = createFileRoute("/tools/crypto-tax-calculator")({
  head: () =>
    toolHead(
      "Crypto Tax Calculator India (Section 115BBH, 30% VDA) | Amniverse",
      "Free India crypto tax calculator. Estimate 30% VDA tax + 4% cess under Section 115BBH, see what the no-loss-set-off rule costs you, and net off your 1% TDS (Section 194S).",
    ),
  component: TaxPage,
});

type Row = { id: number; label: string; cost: string; sale: string };

let nextId = 4;

function TaxPage() {
  const [rows, setRows] = useState<Row[]>([
    { id: 1, label: "BTC", cost: "200000", sale: "260000" },
    { id: 2, label: "ETH", cost: "150000", sale: "110000" },
    { id: 3, label: "SOL", cost: "50000", sale: "72000" },
  ]);
  const [tds, setTds] = useState(true);

  const update = (id: number, key: keyof Omit<Row, "id">) => (v: string) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: v } : r)));
  const add = () => setRows((rs) => [...rs, { id: nextId++, label: "", cost: "", sale: "" }]);
  const remove = (id: number) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs));

  const r = useMemo(
    () =>
      calcVdaTax(
        rows.map((x) => ({ cost: n(x.cost), saleValue: n(x.sale) })),
        tds,
      ),
    [rows, tds],
  );
  const m = (v: number) => fmtMoney(v, "₹");
  const extraTax = r.totalTax - r.taxIfLossesCouldOffset;

  return (
    <ToolLayout
      kicker="Free tool · India · FY 2025-26"
      title="Crypto Tax Calculator (Section 115BBH)"
      source="crypto-tax-calculator"
      intro={
        <p>
          India taxes each profitable crypto sale at a flat 30% plus 4% cess, and losses on one coin
          can&rsquo;t reduce gains on another. Add your sales below to estimate your tax, your TDS
          credit, and how much the no-set-off rule is costing you.
        </p>
      }
      explainer={<Explainer />}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="panel p-6">
          <div className="hidden grid-cols-[1fr_1.2fr_1.2fr_0.9fr_auto] gap-2 pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:grid">
            <span>Asset</span>
            <span>Cost (₹)</span>
            <span>Sale value (₹)</span>
            <span className="text-right">Gain</span>
            <span className="w-7" />
          </div>
          <div className="space-y-3">
            {rows.map((row) => {
              const gain = n(row.sale) - n(row.cost);
              return (
                <div
                  key={row.id}
                  className="grid grid-cols-2 gap-2 rounded-lg border border-border/60 p-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center sm:border-0 sm:p-0"
                >
                  <input
                    aria-label="Asset"
                    value={row.label}
                    onChange={(e) => update(row.id, "label")(e.target.value)}
                    placeholder="e.g. BTC"
                    className="col-span-2 h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm sm:col-span-1"
                  />
                  <input
                    aria-label="Cost of acquisition in rupees"
                    type="number"
                    inputMode="decimal"
                    value={row.cost}
                    onChange={(e) => update(row.id, "cost")(e.target.value)}
                    placeholder="Cost"
                    className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 font-mono text-sm"
                  />
                  <input
                    aria-label="Sale value in rupees"
                    type="number"
                    inputMode="decimal"
                    value={row.sale}
                    onChange={(e) => update(row.id, "sale")(e.target.value)}
                    placeholder="Sale"
                    className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 font-mono text-sm"
                  />
                  <span
                    className={`whitespace-nowrap text-right font-mono text-sm ${gain > 0 ? "text-pnl-positive" : gain < 0 ? "text-pnl-negative" : "text-muted-foreground"}`}
                  >
                    {m(gain)}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(row.id)}
                    aria-label="Remove row"
                    className="h-8 w-7 justify-self-end rounded text-muted-foreground hover:text-pnl-negative"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
          <button type="button" onClick={add} className="btn-outline mt-4 px-4 py-2 text-sm">
            + Add a sale
          </button>
          <label className="mt-5 flex items-start gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={tds}
              onChange={(e) => setTds(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--primary)]"
            />
            <span>
              1% TDS was deducted on these sales (Section 194S)
              <span className="block text-xs text-muted-foreground">
                Usually yes on Indian exchanges. Check Form 26AS / AIS.
              </span>
            </span>
          </label>
        </div>

        <div className="panel space-y-4 bg-terminal p-6">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Taxable gains" value={m(r.taxableIncome)} />
            <Stat label="Losses (not deductible)" value={m(-r.totalLosses)} tone="negative" />
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full font-mono text-xs">
              <tbody className="[&_td]:px-3 [&_td]:py-2.5 [&_tr]:border-b [&_tr]:border-border/60 [&_tr:last-child]:border-0">
                <tr>
                  <td className="text-muted-foreground">Tax @ 30%</td>
                  <td className="text-right">{m(r.baseTax)}</td>
                </tr>
                <tr>
                  <td className="text-muted-foreground">Health &amp; education cess @ 4%</td>
                  <td className="text-right">{m(r.cess)}</td>
                </tr>
                <tr>
                  <td className="font-semibold text-foreground">Total tax</td>
                  <td className="text-right font-semibold text-pnl-negative">{m(r.totalTax)}</td>
                </tr>
                <tr>
                  <td className="text-muted-foreground">Less: TDS already deducted</td>
                  <td className="text-right text-pnl-positive">{m(-r.tdsCredit)}</td>
                </tr>
                <tr>
                  <td className="font-semibold text-foreground">
                    {r.balancePayable >= 0 ? "Balance tax to pay" : "Refund due"}
                  </td>
                  <td className="text-right font-semibold">{m(Math.abs(r.balancePayable))}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat
              label="Your actual net result"
              value={m(r.netResult)}
              tone={r.netResult >= 0 ? "positive" : "negative"}
            />
            <Stat
              label="Effective tax on net"
              value={
                r.effectiveRateOnNetPct === null ? "—" : `${fmtNum(r.effectiveRateOnNetPct, 1)}%`
              }
              tone="negative"
            />
          </div>
          {extraTax > 0.5 ? (
            <p className="rounded-lg border border-pnl-negative/40 bg-pnl-negative/10 px-4 py-3 text-sm text-foreground">
              The no-loss-set-off rule costs you an extra{" "}
              <span className="font-mono font-semibold">{m(extraTax)}</span> — you pay tax on gains
              even though your losses wiped out part of them.
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
      <h2>How crypto is taxed in India</h2>
      <ul>
        <li>
          <strong>30% flat tax</strong> on gains from transferring virtual digital assets (Section
          115BBH), plus 4% cess. Your income slab doesn&rsquo;t matter, and there&rsquo;s no lower
          rate for long-term holding.
        </li>
        <li>
          <strong>No loss set-off:</strong> a loss on one crypto can&rsquo;t reduce a gain on
          another, can&rsquo;t be set off against other income, and can&rsquo;t be carried forward.
        </li>
        <li>
          <strong>Only cost of acquisition is deductible</strong> — not exchange fees, internet, or
          other expenses.
        </li>
        <li>
          <strong>1% TDS</strong> (Section 194S) is deducted on sales above the threshold.
          It&rsquo;s a credit against your final tax — claim it when you file.
        </li>
        <li>
          Report everything in <strong>Schedule VDA</strong> of ITR-2 or ITR-3.
        </li>
      </ul>
      <h2>What this calculator doesn&rsquo;t cover</h2>
      <p>
        Surcharge on high incomes, crypto received as gifts, airdrops, staking or mining income, and
        the treatment of crypto futures and derivatives (which some CAs report differently). This is
        an estimate for planning — confirm your final numbers with a chartered accountant.
      </p>
    </>
  );
}
