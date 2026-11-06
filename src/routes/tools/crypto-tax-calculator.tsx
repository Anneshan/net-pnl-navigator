import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Stat, ToolLayout, Toggle, n, toolHead } from "@/components/ToolLayout";
import { calcFuturesTax, calcVdaTax, fmtMoney, fmtNum } from "@/lib/calculators";

export const Route = createFileRoute("/tools/crypto-tax-calculator")({
  head: () =>
    toolHead(
      "Crypto Tax Calculator India — Spot (115BBH) & Delta Futures | Amniverse",
      "Free India crypto tax calculator. Spot sales: 30% VDA tax + cess under Section 115BBH with TDS credit. INR-settled futures (Delta Exchange): compare the 30% VDA reading with speculative business income at your slab rate.",
    ),
  component: TaxPage,
});

type Row = { id: number; label: string; cost: string; sale: string };

let nextId = 4;

type Mode = "spot" | "futures";

const modeOptions = [
  { value: "spot", label: "Spot / USDT-settled" },
  { value: "futures", label: "Delta INR futures" },
] as const;

function TaxPage() {
  const [mode, setMode] = useState<Mode>("spot");
  return (
    <ToolLayout
      kicker="Free tool · India · FY 2025-26"
      title="Crypto Tax Calculator (India)"
      source="crypto-tax-calculator"
      intro={
        <p>
          Spot crypto sales are taxed at a flat 30% plus 4% cess under Section 115BBH, with no loss
          set-off. INR-settled futures on Delta Exchange are different: there&rsquo;s no official
          ruling yet, so we show both ways CAs file them, side by side.
        </p>
      }
      explainer={<Explainer />}
    >
      <div className="mb-6 max-w-md">
        <Toggle label="What did you trade?" value={mode} options={modeOptions} onChange={setMode} />
      </div>
      {mode === "spot" ? <SpotCalculator /> : <FuturesCalculator />}
    </ToolLayout>
  );
}

type FRow = { id: number; label: string; pnl: string };
let nextFId = 4;
const slabOptions = ["0", "5", "10", "15", "20", "25", "30"];

function FuturesCalculator() {
  const [rows, setRows] = useState<FRow[]>([
    { id: 1, label: "BTCUSD long", pnl: "45000" },
    { id: 2, label: "ETHUSD short", pnl: "-28000" },
    { id: 3, label: "SOLUSD long", pnl: "12000" },
  ]);
  const [slab, setSlab] = useState("20");

  const update = (id: number, key: "label" | "pnl") => (v: string) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: v } : r)));
  const add = () => setRows((rs) => [...rs, { id: nextFId++, label: "", pnl: "" }]);
  const remove = (id: number) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs));

  const r = useMemo(
    () =>
      calcFuturesTax(
        rows.map((x) => n(x.pnl)),
        n(slab),
      ),
    [rows, slab],
  );
  const m = (v: number) => fmtMoney(v, "₹");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="panel p-6">
        <p className="text-sm text-muted-foreground">
          Enter the realised PnL of each closed trade in ₹, after fees (Delta shows this in your
          trade history). Use a minus sign for losses.
        </p>
        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2"
            >
              <input
                aria-label="Trade"
                value={row.label}
                onChange={(e) => update(row.id, "label")(e.target.value)}
                placeholder="e.g. BTCUSD long"
                className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm"
              />
              <input
                aria-label="Realised PnL in rupees"
                type="number"
                inputMode="decimal"
                value={row.pnl}
                onChange={(e) => update(row.id, "pnl")(e.target.value)}
                placeholder="PnL (₹)"
                className={`h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 font-mono text-sm ${
                  n(row.pnl) > 0 ? "text-pnl-positive" : n(row.pnl) < 0 ? "text-pnl-negative" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => remove(row.id)}
                aria-label="Remove row"
                className="h-8 w-7 rounded text-muted-foreground hover:text-pnl-negative"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={add} className="btn-outline mt-4 px-4 py-2 text-sm">
          + Add a trade
        </button>
        <div className="mt-5 space-y-1.5">
          <label htmlFor="slab" className="text-sm text-foreground">
            Your income-tax slab rate
          </label>
          <select
            id="slab"
            value={slab}
            onChange={(e) => setSlab(e.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-background px-3 font-mono text-sm"
          >
            {slabOptions.map((s) => (
              <option key={s} value={s}>
                {s}%
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            The highest slab your total income falls in. Used only for the business-income reading.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Profitable closes" value={m(r.totalProfits)} tone="positive" />
          <Stat label="Losing closes" value={m(-r.totalLosses)} tone="negative" />
          <Stat
            label="Net PnL"
            value={m(r.netPnl)}
            tone={r.netPnl >= 0 ? "positive" : "negative"}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="panel bg-terminal p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Reading A · Conservative
            </p>
            <p className="mt-1 font-display text-base font-semibold">VDA under Section 115BBH</p>
            <p className="mt-3 font-mono text-2xl font-semibold text-pnl-negative">{m(r.vdaTax)}</p>
            <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              <li>• 30% + 4% cess on every profitable close</li>
              <li>• Losses can&rsquo;t be set off or carried forward</li>
              <li>• The safer position if your CA treats futures as VDA</li>
            </ul>
          </div>
          <div className="panel bg-terminal p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Reading B · Business income
            </p>
            <p className="mt-1 font-display text-base font-semibold">
              Speculative income at {slab}% slab
            </p>
            <p className="mt-3 font-mono text-2xl font-semibold text-foreground">
              {m(r.businessTax)}
            </p>
            <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              <li>• Tax on net PnL (profits minus losses) + 4% cess</li>
              <li>
                •{" "}
                {r.lossToCarryForward > 0
                  ? `Net loss of ${m(r.lossToCarryForward)} can be carried forward (speculative, 4 years)`
                  : "Losses reduce your taxable profit"}
              </li>
              <li>• Commonly argued for INR-settled contracts like Delta&rsquo;s</li>
            </ul>
          </div>
        </div>
        {Math.abs(r.difference) > 0.5 ? (
          <p className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-foreground">
            The two readings differ by{" "}
            <span className="font-mono font-semibold">{m(Math.abs(r.difference))}</span>. That gap
            is why you should decide the treatment with a CA <em>before</em> filing, and stay
            consistent year to year.
          </p>
        ) : null}
        <p className="rounded-lg border border-border px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          No TDS is shown because Delta&rsquo;s INR-settled futures generally don&rsquo;t deduct the
          1% TDS — check your Form 26AS / AIS. India has not issued an official ruling on crypto
          futures; this is an estimate, not tax advice. Surcharge, presumptive taxation and audit
          thresholds aren&rsquo;t included.
        </p>
      </div>
    </div>
  );
}

function SpotCalculator() {
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
  );
}

function Explainer() {
  return (
    <>
      <h2>How spot crypto is taxed in India</h2>
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
      <h2>What about Delta Exchange futures?</h2>
      <p>
        Delta&rsquo;s futures are settled in rupees, so no crypto actually changes hands. Some CAs
        treat the profits as speculative business income taxed at your slab rate, where losses can
        be set off and carried forward for 4 years. Others take the conservative view that Section
        115BBH still applies: 30% on every profitable trade, with no set-off. India has not issued
        an official ruling. Pick one approach with your CA and apply it consistently.
      </p>
      <h2>What this calculator doesn&rsquo;t cover</h2>
      <p>
        Surcharge on high incomes, crypto received as gifts, airdrops, staking or mining income, and
        crypto-settled derivatives on foreign exchanges. This is an estimate for planning — confirm
        your final numbers with a chartered accountant.
      </p>
    </>
  );
}
