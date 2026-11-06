import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { EmailSignup } from "@/components/EmailSignup";
import { PolicyLinks } from "@/components/LegalPage";

export const toolLinks = [
  { to: "/tools/net-pnl-calculator", label: "Net PnL Calculator", short: "Net PnL" },
  {
    to: "/tools/position-size-calculator",
    label: "Position Size & Liquidation",
    short: "Position Size",
  },
  {
    to: "/tools/crypto-tax-calculator",
    label: "Crypto Tax Calculator (India)",
    short: "Crypto Tax",
  },
] as const;

export function toolHead(title: string, description: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  };
}

export function ToolLayout({
  kicker,
  title,
  intro,
  source,
  children,
  explainer,
}: {
  kicker: string;
  title: string;
  intro: ReactNode;
  source: string;
  children: ReactNode;
  explainer?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="glass-nav sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold tracking-[0.18em] text-foreground">
              AMNIVERSE
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:inline">
              Advisory
            </span>
          </Link>
          <nav className="hidden items-center gap-5 md:flex" aria-label="Free tools">
            {toolLinks.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="text-sm text-muted-foreground hover:text-foreground"
                activeProps={{ className: "text-sm text-foreground" }}
              >
                {t.short}
              </Link>
            ))}
          </nav>
          <Link to="/" hash="pricing" className="btn-primary px-4 py-2 text-sm">
            Full Journal — ₹999
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">{kicker}</p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <div className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {intro}
        </div>

        <div className="mt-8">{children}</div>

        <div className="panel mt-10 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-lg font-semibold">
              Want this for every trade, automatically?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              The Amniverse Journal logs every trade with true Net PnL, sizes positions, tracks your
              equity curve and keeps a tax summary ready for your CA.
            </p>
          </div>
          <Link to="/" hash="pricing" className="btn-primary shrink-0 px-5 py-3 text-sm">
            See the Journal — ₹999
          </Link>
        </div>

        <div className="mt-10">
          <EmailSignup source={source} />
        </div>

        {explainer ? (
          <section className="mt-12 max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
            {explainer}
          </section>
        ) : null}

        <section className="mt-12">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            More free tools
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {toolLinks.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="panel p-4 text-sm font-semibold hover:border-primary/50"
              >
                {t.label} →
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-terminal py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="max-w-4xl text-xs leading-relaxed text-muted-foreground">
            These calculators are for education only and are not financial, investment or tax
            advice. Results are estimates based on the numbers you enter; exchanges calculate fees,
            funding and liquidation slightly differently. Verify tax figures with a chartered
            accountant before filing.
          </p>
          <PolicyLinks className="mt-4" />
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} Amniverse Advisory. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ------------------------------------------------------------------ inputs

export function NumField({
  id,
  label,
  value,
  onChange,
  suffix,
  hint,
  step = "any",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  hint?: string;
  step?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm text-foreground">
        {label}
      </label>
      <div className="flex items-center rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full min-w-0 bg-transparent px-3 font-mono text-sm text-foreground focus:outline-none"
        />
        {suffix ? (
          <span className="pr-3 font-mono text-xs text-muted-foreground">{suffix}</span>
        ) : null}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function Toggle<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-foreground">{label}</p>
      <div
        className="grid grid-cols-2 gap-1 rounded-lg border border-input bg-background p-1"
        role="radiogroup"
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`h-9 rounded-md text-sm font-medium transition-colors ${
              value === o.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Stat({
  label,
  value,
  tone = "neutral",
  big = false,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
  big?: boolean;
}) {
  const color =
    tone === "positive"
      ? "text-pnl-positive"
      : tone === "negative"
        ? "text-pnl-negative"
        : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 break-words font-mono font-semibold ${color} ${big ? "text-xl sm:text-2xl" : "text-base"}`}
      >
        {value}
      </p>
    </div>
  );
}

export const n = (v: string) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : 0;
};

// ------------------------------------------------------------- fee presets

export const feePresets = [
  { id: "delta-taker", label: "Delta India · market", entry: "0.05", exit: "0.05", gst: "18" },
  { id: "delta-maker", label: "Delta India · limit", entry: "0.02", exit: "0.02", gst: "18" },
  { id: "custom", label: "Custom", entry: "", exit: "", gst: "" },
] as const;

export type FeePresetId = (typeof feePresets)[number]["id"];

export function FeePresetPicker({
  value,
  onPick,
}: {
  value: FeePresetId;
  onPick: (p: (typeof feePresets)[number]) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-foreground">Exchange fees</p>
      <div className="flex flex-wrap gap-2">
        {feePresets.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={value === p.id}
            onClick={() => onPick(p)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              value === p.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Delta Exchange India futures: 0.05% taker, 0.02% maker, plus 18% GST on fees.
      </p>
    </div>
  );
}
