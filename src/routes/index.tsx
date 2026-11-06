import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PolicyLinks } from "@/components/LegalPage";
import { whatsappLink } from "@/lib/business";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Amniverse Crypto Trading Journal — True Net PnL & Position Sizing" },
      {
        name: "description",
        content:
          "Track your true Net PnL, automatically calculate hidden fees, and size your positions like an institution. The Amniverse Crypto Trading Journal for Spot & Perps — ₹999 one-time.",
      },
      {
        property: "og:title",
        content: "Amniverse Crypto Trading Journal — Stop Bleeding Capital on Trades You Won",
      },
      {
        property: "og:description",
        content:
          "The market isn't rigged against you — your math is. True Net PnL after maker/taker fees, funding rates and gas, plus an institutional-grade position sizer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Amniverse Crypto Trading Journal" },
      {
        name: "twitter:description",
        content:
          "True Net PnL, hidden-fee accounting and the 'Never Liquidated' position sizer — an automated Google Sheets engine for Spot & Perps traders.",
      },
    ],
  }),
  component: Index,
});

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="mt-0.5 h-4 w-4 shrink-0 text-pnl-positive"
      aria-hidden="true"
    >
      <path
        d="M4 10.5l4 4 8-9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Logo() {
  return (
    <a href="#top" className="flex items-baseline gap-2">
      <span className="font-display text-lg font-bold tracking-[0.18em] text-foreground">
        AMNIVERSE
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        Advisory
      </span>
    </a>
  );
}

function Nav() {
  return (
    <header className="glass-nav fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-3">
          <a
            href="#inside"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:block"
          >
            What's inside
          </a>
          <a href="#pricing" className="btn-primary px-4 py-2 text-sm">
            Get Access — ₹999
          </a>
        </div>
      </div>
    </header>
  );
}

function TerminalMock() {
  const trades = [
    {
      pair: "BTC/USDT·P",
      side: "LONG",
      gross: "+₹2,140",
      fees: "−₹186",
      funding: "−₹64",
      net: "+₹1,890",
      win: true,
    },
    {
      pair: "ETH/USDT·P",
      side: "LONG",
      gross: "+₹980",
      fees: "−₹142",
      funding: "−₹48",
      net: "+₹790",
      win: true,
    },
    {
      pair: "SOL/USDT·P",
      side: "SHORT",
      gross: "+₹1,460",
      fees: "−₹201",
      funding: "−₹97",
      net: "+₹1,162",
      win: true,
    },
    {
      pair: "DOGE/USDT·P",
      side: "LONG",
      gross: "+₹640",
      fees: "−₹173",
      funding: "−₹120",
      net: "+₹347",
      win: true,
    },
    {
      pair: "XRP/USDT·P",
      side: "LONG",
      gross: "+₹520",
      fees: "−₹188",
      funding: "−₹142",
      net: "+₹190",
      win: true,
    },
  ];

  return (
    <div className="panel overflow-hidden bg-terminal shadow-2xl">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-pnl-positive/70" />
        <span className="ml-3 font-mono text-[11px] tracking-wider text-muted-foreground">
          Amniverse Journal · Google Sheets — NET PnL LEDGER
        </span>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Net PnL · 30d
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-pnl-positive sm:text-xl">
              +₹4,379
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Hidden Costs
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-pnl-negative sm:text-xl">
              −₹1,561
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Win Rate
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-foreground sm:text-xl">60%</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full font-mono text-[10px] sm:text-[11px]">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-muted-foreground">
                <th className="px-2 py-2 text-left font-medium">PAIR</th>
                <th className="px-2 py-2 text-left font-medium">SIDE</th>
                <th className="px-2 py-2 text-right font-medium">GROSS</th>
                <th className="hidden px-2 py-2 text-right font-medium sm:table-cell">FEES</th>
                <th className="hidden px-2 py-2 text-right font-medium sm:table-cell">FUNDING</th>
                <th className="px-2 py-2 text-right font-medium">NET</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.pair} className="border-b border-border/60 last:border-0">
                  <td className="px-2 py-2 text-foreground">{t.pair}</td>
                  <td
                    className={`px-2 py-2 ${t.side === "LONG" ? "text-pnl-positive" : "text-muted-foreground"}`}
                  >
                    {t.side}
                  </td>
                  <td className="px-2 py-2 text-right text-muted-foreground">{t.gross}</td>
                  <td className="hidden px-2 py-2 text-right text-pnl-negative sm:table-cell">
                    {t.fees}
                  </td>
                  <td className="hidden px-2 py-2 text-right text-pnl-negative sm:table-cell">
                    {t.funding}
                  </td>
                  <td
                    className={`px-2 py-2 text-right font-semibold ${t.win ? "text-pnl-positive" : "text-pnl-negative"}`}
                  >
                    {t.net}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-border bg-background p-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Equity Curve
            </p>
            <p className="font-mono text-[10px] text-pnl-positive">+8.4% net</p>
          </div>
          <svg
            viewBox="0 0 320 64"
            className="mt-2 h-16 w-full"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline
              points="0,52 30,48 60,50 90,38 120,42 150,30 180,34 210,22 240,26 270,14 320,8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-pnl-positive"
            />
            <polyline
              points="0,52 30,48 60,50 90,38 120,42 150,30 180,34 210,22 240,26 270,14 320,8 320,64 0,64"
              fill="currentColor"
              className="text-pnl-positive opacity-10"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div
        className="terminal-grid pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
      />
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Amniverse Advisory · Trading Analytics Desk
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
            Stop Bleeding Capital on Trades You Actually{" "}
            <span className="text-pnl-negative">&ldquo;Won.&rdquo;</span> And Stop Surprising Your
            CA at Tax Time.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Track true <span className="font-semibold text-foreground">Net PnL</span>, size
            positions like an institution, and automatically audit your{" "}
            <span className="font-semibold text-foreground">Section 115BBH tax liability</span> with
            the{" "}
            <span className="font-semibold text-foreground">Amniverse Crypto Trading Journal</span>.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <a href="#pricing" className="btn-primary px-7 py-3.5 text-base">
              Get Immediate Access — ₹999
            </a>
            <a href="#inside" className="btn-outline px-5 py-3.5 text-sm">
              See what&rsquo;s inside ↓
            </a>
          </div>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            ✓ Guaranteed secure checkout via UPI / Razorpay
          </p>
        </div>
        <TerminalMock />
      </div>
    </section>
  );
}

const hiddenCosts = [
  {
    title: "Maker / Taker Execution Fees",
    body: "Eating into your margin on every single entry and exit.",
  },
  {
    title: "Perpetual Funding Rates",
    body: "Quietly deducting from your account balance every 8 hours while you hold a leveraged position.",
  },
  {
    title: "DEX Gas Fees",
    body: "Destroying your profit margins on on-chain swaps during peak network congestion.",
  },
];

function Problem() {
  return (
    <section id="inside" className="border-t border-border py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-pnl-negative">
          The agitation — the problem you are ignoring
        </p>
        <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          You aren&rsquo;t just trading against the market. You are trading against the exchange.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">
          Most retail crypto traders look at their Gross PnL, see a green number, and assume they
          are profitable.{" "}
          <span className="font-semibold text-foreground">They are lying to themselves.</span>
        </p>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
          If you are trading Spot or Perpetual Futures without tracking the hidden costs, you are
          slowly draining your account through:
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {hiddenCosts.map((c, i) => (
            <div key={c.title} className="panel p-6">
              <p className="font-mono text-xs text-muted-foreground">/0{i + 1}</p>
              <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="panel mt-10 bg-terminal p-6 sm:p-8">
          <p className="font-display text-xl font-semibold text-foreground sm:text-2xl">
            The Result?
          </p>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            You win{" "}
            <span className="font-mono font-semibold text-pnl-positive">6 out of 10 trades</span>,
            but your portfolio balance keeps{" "}
            <span className="font-mono font-semibold text-pnl-negative">going down.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    kicker: "Module 01",
    title: "The True “Net PnL” Calculator",
    body: "Simply input your entry/exit, leverage, and fees. The journal automatically calculates your exact break-even point and true Net PnL after all exchange cuts.",
  },
  {
    kicker: "Module 02",
    title: "The “Never Liquidated” Position Sizer",
    body: "Stop guessing your leverage. Input your total account balance, your strict risk limit (e.g., 1%), and your stop-loss. The journal instantly tells you the exact maximum position size you are allowed to take.",
  },
  {
    kicker: "Module 03",
    title: "The Visual Analytics Dashboard",
    body: "A fully automated rolling 30-day dashboard that visualizes your Win/Loss ratio, equity curve, and strategy heatmap so you know exactly which setups are actually making you money.",
  },
  {
    kicker: "Module 04",
    title: "Section 115BBH Tax Engine",
    body: "Automates Section 115BBH 30% VDA tax calculations, enforces zero loss set-off rules, reconciles Section 194S TDS credits, and exports ready-to-file Schedule VDA reports for ITR-2/ITR-3.",
  },
];

function Solution() {
  return (
    <section className="border-t border-border py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">The solution</p>
        <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          The Amniverse Crypto Trading Journal
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">
          Built by the analytical desk at Amniverse Advisory, this automated Google Sheets engine
          removes the guesswork from your execution. It forces you to manage risk and exposes your
          true profitability.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.kicker} className="panel flex flex-col p-6">
              <p className="font-mono text-xs uppercase tracking-widest text-primary">{f.kicker}</p>
              <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-foreground">
                {f.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Authority() {
  return (
    <section className="border-t border-border py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="panel relative overflow-hidden p-8 sm:p-12">
          <div
            className="hero-glow pointer-events-none absolute inset-0 opacity-70"
            aria-hidden="true"
          />
          <div className="relative max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Why trust this system?
            </p>
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Amniverse Advisory is a dedicated financial research and analytics publisher.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              We don&rsquo;t sell &ldquo;get-rich-quick&rdquo; signals, algorithmic trading bots, or
              VIP Telegram groups. We build the{" "}
              <span className="font-semibold text-foreground">
                strict mathematical frameworks and data tools
              </span>{" "}
              that separate professional execution from retail gambling.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-3 font-mono text-xs text-muted-foreground sm:grid-cols-3">
              <span className="rounded-lg border border-border bg-background px-4 py-3">
                ✕ No signal groups
              </span>
              <span className="rounded-lg border border-border bg-background px-4 py-3">
                ✕ No trading bots
              </span>
              <span className="rounded-lg border border-border bg-background px-4 py-3">
                ✓ Math frameworks &amp; data tools
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const included = [
  "The Amniverse Crypto Trading Journal (Spot & Perps)",
  "The Automated Position Sizing Tool",
  "The Visual Performance Dashboard",
  "The Section 115BBH Tax Engine (Schedule VDA export)",
  "Step-by-step instructions to lock your formulas and secure your data",
];

function Pricing() {
  return (
    <section id="pricing" className="border-t border-border py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            The offer
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Stop trading blind. Lock down your risk management today.
          </h2>
        </div>

        <div className="panel relative mx-auto mt-12 max-w-xl overflow-hidden p-8 shadow-2xl sm:p-10">
          <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-xl font-semibold text-foreground">
                Instant download
              </h3>
              <span className="rounded-full border border-pnl-positive/40 bg-pnl-positive/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-pnl-positive">
                Launch price
              </span>
            </div>

            <ul className="mt-6 space-y-3">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-end gap-4 border-t border-border pt-6">
              <div>
                <p className="font-mono text-xs text-muted-foreground line-through">
                  Regular Price ₹2,499
                </p>
                <p className="font-display text-4xl font-bold text-foreground">
                  ₹999
                  <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                    one-time · lifetime access
                  </span>
                </p>
              </div>
            </div>

            <Link to="/checkout" className="btn-primary mt-8 w-full px-6 py-4 text-base">
              Download the Journal Now
            </Link>
            <p className="mt-3 text-center font-mono text-xs text-muted-foreground">
              Guaranteed secure checkout via UPI / Razorpay
            </p>

            <div className="mt-6 rounded-lg border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <CheckIcon />
                <div>
                  <p className="text-sm font-semibold text-foreground">Bulletproof formulas</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    All complex math cells are locked by default so you can&rsquo;t accidentally
                    break the sheet.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3 border-t border-border/60 pt-4">
                <CheckIcon />
                <div>
                  <p className="text-sm font-semibold text-foreground">Instant setup</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Includes a 3-step quick-start guide to duplicate the file safely into your own
                    Google Drive.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-terminal py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Logo />
          <Link to="/checkout" className="btn-primary px-5 py-2.5 text-sm">
            Get Immediate Access — ₹999
          </Link>
        </div>
        <div className="mt-10 border-t border-border pt-8">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Legal disclaimer &amp; terms of use
          </p>
          <p className="mt-3 max-w-4xl text-xs leading-relaxed text-muted-foreground">
            Amniverse Advisory and its proprietor are strictly financial software and education
            publishers, NOT registered financial or investment advisors. This spreadsheet is a
            mathematical tool provided for educational and informational purposes only. It does not
            constitute financial advice, trade recommendations, or an endorsement of any digital
            asset. Cryptocurrency and derivatives trading carry extreme risk, and you can lose your
            entire capital. By using this tool, you acknowledge that you are solely responsible for
            your own trading decisions, risk management, and tax liabilities.
          </p>
          <PolicyLinks className="mt-6" />
          <p className="mt-6 font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} Amniverse Advisory. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Amniverse Advisory on WhatsApp"
      title="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-[60] inline-flex min-h-14 items-center gap-3 rounded-full border border-background/20 bg-primary px-4 text-primary-foreground shadow-xl transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:bottom-7 sm:right-7"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0" fill="currentColor" aria-hidden="true">
        <path d="M16.02 3.2A12.74 12.74 0 0 0 5.1 22.51L3.3 29l6.64-1.74a12.74 12.74 0 1 0 6.08-24.06Zm0 23.18c-1.9 0-3.77-.51-5.4-1.48l-.39-.23-3.94 1.03 1.05-3.84-.25-.4a10.42 10.42 0 1 1 8.93 4.92Zm5.72-7.81c-.31-.16-1.85-.91-2.14-1.02-.29-.1-.5-.15-.71.16-.2.31-.82 1.02-1 1.23-.19.2-.37.23-.68.07-.31-.15-1.31-.48-2.5-1.53-.92-.82-1.54-1.84-1.72-2.15-.18-.31-.02-.48.14-.64.14-.14.31-.37.46-.55.15-.18.2-.31.31-.52.1-.2.05-.39-.03-.55-.08-.15-.71-1.7-.98-2.32-.26-.6-.52-.51-.71-.52h-.61c-.2 0-.55.08-.84.39-.29.31-1.1 1.07-1.1 2.61s1.13 3.03 1.28 3.24c.16.2 2.22 3.39 5.38 4.75.75.32 1.34.52 1.8.66.75.24 1.43.2 1.97.12.6-.09 1.85-.76 2.11-1.49.26-.74.26-1.36.18-1.49-.08-.13-.28-.21-.59-.36Z" />
      </svg>
      <span className="hidden text-sm font-semibold sm:inline">Chat with us</span>
    </a>
  );
}

const faqs = [
  {
    q: "Do I need Microsoft Excel?",
    a: "No. This journal is built natively for Google Sheets. You only need a free Google account to duplicate the template and start using it immediately.",
  },
  {
    q: "Is this a subscription?",
    a: "No. The ₹999 launch price is a flat, one-time payment. You own the sheet forever.",
  },
  {
    q: "Does this connect to my exchange API?",
    a: "No. To ensure absolute security of your exchange API keys, this is a manual entry journal. It takes less than 15 seconds to log a trade, forcing you to consciously review your execution.",
  },
  {
    q: "How do I get access after paying?",
    a: "Right after a successful UPI or card payment, your private access link appears on the confirmation screen, and the same link plus setup instructions is emailed to you.",
  },
];

function FAQ() {
  return (
    <section id="faq" className="border-t border-border py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Questions, answered
        </p>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Everything you need to know before you buy
        </h2>

        <Accordion type="single" collapsible className="panel mt-10 px-4 sm:px-6">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`} className="border-border/60 last:border-0">
              <AccordionTrigger className="py-5 text-left font-display text-base font-semibold text-foreground hover:no-underline sm:text-lg">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

const fitList = [
  "System-driven traders who log every execution",
  "Risk managers who treat position sizing as non-negotiable",
  "Anyone treating crypto as a business, not a lottery ticket",
];

const notFitList = [
  "Gamblers looking for 100x leverage signal groups",
  "Meme-coin lottery players chasing the next pump",
  "Anyone expecting guaranteed returns without doing the math",
];

function WhoFor() {
  return (
    <section className="border-t border-border py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Is this for you?
        </p>
        <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Who this is for (and who it isn&rsquo;t for)
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="panel border-pnl-positive/30 p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-pnl-positive">
              ✓ This is for you if you are
            </p>
            <ul className="mt-5 space-y-3">
              {fitList.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-relaxed text-foreground"
                >
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel border-pnl-negative/30 p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-pnl-negative">
              ✕ This is NOT for you if you are
            </p>
            <ul className="mt-5 space-y-3">
              {notFitList.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                >
                  <span className="mt-0.5 font-mono text-pnl-negative">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Authority />
        <WhoFor />
        <FAQ />
        <Pricing />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
