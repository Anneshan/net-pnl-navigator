import { createFileRoute, Link } from "@tanstack/react-router";
import { ToolLayout, toolHead } from "@/components/ToolLayout";

export const Route = createFileRoute("/tools/")({
  head: () =>
    toolHead(
      "Free Crypto Trading Calculators — Net PnL, Position Size, India Tax | Amniverse",
      "Free calculators for crypto traders: true Net PnL after fees and funding, position size and liquidation price, and India's Section 115BBH crypto tax.",
    ),
  component: ToolsIndex,
});

const tools = [
  {
    to: "/tools/net-pnl-calculator",
    kicker: "Tool 01",
    title: "Net PnL Calculator",
    body: "See your real profit after maker/taker fees, funding and gas — and your exact break-even exit.",
  },
  {
    to: "/tools/position-size-calculator",
    kicker: "Tool 02",
    title: "Position Size & Liquidation",
    body: "Size every trade from your risk %, check your liquidation price and the max safe leverage.",
  },
  {
    to: "/tools/crypto-tax-calculator",
    kicker: "Tool 03",
    title: "Crypto Tax (115BBH)",
    body: "Estimate 30% VDA tax + cess, net off TDS, and see what the no-loss-set-off rule costs you.",
  },
] as const;

function ToolsIndex() {
  return (
    <ToolLayout
      kicker="Free tools"
      title="Free calculators for serious crypto traders"
      source="tools-index"
      intro={
        <p>No sign-up needed. Everything runs in your browser — nothing you type is stored.</p>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        {tools.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="panel flex flex-col p-6 transition-colors hover:border-primary/50"
          >
            <p className="font-mono text-xs uppercase tracking-widest text-primary">{t.kicker}</p>
            <h2 className="mt-3 font-display text-xl font-semibold text-foreground">{t.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
            <span className="mt-4 text-sm font-semibold text-primary">Open calculator →</span>
          </Link>
        ))}
      </div>
    </ToolLayout>
  );
}
