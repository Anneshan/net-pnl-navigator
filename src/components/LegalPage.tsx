import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { business } from "@/lib/business";

export const policyLinks = [
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/refund-policy", label: "Refund & Cancellation" },
  { to: "/shipping-policy", label: "Shipping & Delivery" },
  { to: "/contact", label: "Contact Us" },
] as const;

export function PolicyLinks({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Policies" className={`flex flex-wrap gap-x-5 gap-y-2 ${className}`}>
      {policyLinks.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

export function legalHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — ${business.brand}` },
      { name: "description", content: description },
    ],
  };
}

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="glass-nav">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold tracking-[0.18em] text-foreground">
              AMNIVERSE
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Advisory
            </span>
          </Link>
          <Link to="/checkout" className="btn-primary px-4 py-2 text-sm">
            Get Access — ₹999
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          Last updated: {business.policiesUpdated}
        </p>
        <div className="legal-body mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
          {children}
        </div>
      </main>
      <footer className="border-t border-border bg-terminal py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <PolicyLinks />
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} {business.brand}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
