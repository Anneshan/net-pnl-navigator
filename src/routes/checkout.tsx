import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createOrder, verifyPayment } from "@/lib/razorpay.functions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PolicyLinks } from "@/components/LegalPage";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout — Amniverse Crypto Trading Journal (₹999)" },
      {
        name: "description",
        content:
          "One-time ₹999 payment for the Amniverse Crypto Trading Journal — true Net PnL tracking, the 'Never Liquidated' position sizer and a CA-ready crypto tax summary. Secure checkout via UPI / cards / netbanking.",
      },
      { property: "og:title", content: "Secure Checkout — Amniverse Crypto Trading Journal" },
      {
        property: "og:description",
        content:
          "One-time ₹999 payment. True Net PnL tracking, institutional position sizing and a CA-ready crypto tax summary.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Secure Checkout — Amniverse Crypto Trading Journal" },
      {
        name: "twitter:description",
        content: "One-time ₹999 payment for the Amniverse Crypto Trading Journal.",
      },
    ],
  }),
  component: Checkout,
});

type RazorpayCheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (payload: unknown) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

type Phase = "idle" | "working" | "paying" | "success" | "error";

const RZP_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RZP_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = RZP_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Logo() {
  return (
    <Link to="/" className="flex items-baseline gap-2">
      <span className="font-display text-lg font-bold tracking-[0.18em] text-foreground">
        AMNIVERSE
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        Advisory
      </span>
    </Link>
  );
}

type OrderError = "not_configured" | "order_failed" | "invalid_input";

const errorCopy: { [K in OrderError]: string } = {
  not_configured:
    "Checkout is being set up on our side — payment credentials are not connected yet. Please try again shortly.",
  order_failed: "We couldn't start your order. Please try again in a moment.",
  invalid_input: "Please check your details and try again.",
};

function Checkout() {
  const createOrderFn = useServerFn(createOrder);
  const verifyPaymentFn = useServerFn(verifyPayment);

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [accessUrl, setAccessUrl] = useState<string | null>(null);
  const scriptReady = useRef<Promise<boolean> | null>(null);

  useEffect(() => {
    scriptReady.current ??= loadRazorpayScript();
  }, []);

  function updateField(field: keyof typeof form) {
    return (event: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handlePay() {
    if (phase === "working" || phase === "paying") return;
    setErrorMsg(null);

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setErrorMsg("Please fill in your name, email and phone number.");
      setPhase("error");
      return;
    }

    setPhase("working");

    let result: Awaited<ReturnType<typeof createOrderFn>>;
    try {
      result = await createOrderFn({ data: form });
    } catch {
      setErrorMsg(errorCopy.order_failed);
      setPhase("error");
      return;
    }

    if (!result.ok) {
      const msg =
        (result.error && errorCopy[result.error]) ??
        "We couldn't start your order. Please try again in a moment.";
      setErrorMsg(msg);
      setPhase("error");
      return;
    }

    const ready = await (scriptReady.current ?? loadRazorpayScript());
    if (!ready || !window.Razorpay) {
      setErrorMsg("The payment window couldn't load. Please check your connection and retry.");
      setPhase("error");
      return;
    }

    setPhase("paying");
    const checkout = new window.Razorpay({
      key: result.keyId,
      order_id: result.orderId,
      amount: result.amount,
      currency: result.currency,
      name: "Amniverse Advisory",
      description: "Crypto Trading Journal (Spot & Perps)",
      prefill: { name: form.name, email: form.email, contact: form.phone },
      theme: { color: "#34d399" },
      handler: async (response: RazorpayCheckoutResponse) => {
        const verification = await verifyPaymentFn({
          data: {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            name: form.name,
            email: form.email,
          },
        }).catch(() => ({ ok: false as const, error: "verify_failed" as const }));
        if (verification.ok) {
          setAccessUrl(verification.accessUrl);
          setPaymentId(response.razorpay_payment_id);
          setPhase("success");
        } else {
          setErrorMsg(
            "Your payment went through, but we couldn't verify it automatically. Contact support with your payment ID and we'll sort it out.",
          );
          setPaymentId(response.razorpay_payment_id);
          setPhase("error");
        }
      },
      modal: {
        ondismiss: () => setPhase("idle"),
      },
    });
    checkout.open();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="glass-nav">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Secure checkout
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Instant access · One-time payment
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Complete your purchase
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You will be redirected to Razorpay's secure window to pay. UPI, cards, netbanking and
          wallets are supported.
        </p>

        {phase === "success" ? (
          <div className="panel mt-10 border-pnl-positive/40 p-8 text-center sm:p-12">
            <p className="font-mono text-xs uppercase tracking-widest text-pnl-positive">
              ✓ Payment successful
            </p>
            <h2 className="mt-4 font-display text-2xl font-bold text-foreground">
              You're in — welcome to the desk.
            </h2>
            {accessUrl ? (
              <a
                href={accessUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary mt-6 inline-block px-6 py-3 text-base"
              >
                Open your journal now →
              </a>
            ) : null}
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              ₹999 received. A copy of your access link and setup instructions is on its way to{" "}
              <span className="font-semibold text-foreground">{form.email}</span> (check
              spam/promotions if you don&rsquo;t see it in a few minutes).
            </p>
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              Payment ID: {paymentId}
            </p>
            <Link to="/" className="btn-outline mt-8 inline-block px-6 py-3 text-sm">
              Back to home
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="panel h-fit p-6">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Order summary
              </p>
              <p className="mt-4 font-display text-lg font-semibold leading-snug text-foreground">
                The Amniverse Crypto Trading Journal (Spot &amp; Perps)
              </p>
              <ul className="mt-4 space-y-2 font-mono text-[11px] text-muted-foreground">
                <li>+ True Net PnL calculator</li>
                <li>+ &ldquo;Never Liquidated&rdquo; position sizer</li>
                <li>+ Visual performance dashboard</li>
                <li>+ Crypto tax summary (115BBH estimate + TDS)</li>
              </ul>
              <div className="mt-6 border-t border-border pt-4">
                <p className="font-mono text-xs text-muted-foreground line-through">
                  Regular Price ₹2,499
                </p>
                <p className="font-display text-3xl font-bold text-foreground">
                  ₹999
                  <span className="ml-2 font-mono text-[11px] font-normal text-muted-foreground">
                    one-time
                  </span>
                </p>
              </div>
            </div>

            <div className="panel p-6">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Your details
              </p>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-foreground">
                    Full name
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={updateField("name")}
                    placeholder="Your name"
                    autoComplete="name"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-foreground">
                    Email (access link is sent here)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={updateField("email")}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm text-foreground">
                    Phone (for payment updates)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={updateField("phone")}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    className="bg-background"
                  />
                </div>
              </div>

              {phase === "error" && errorMsg ? (
                <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {errorMsg}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handlePay}
                disabled={phase === "working" || phase === "paying"}
                className="btn-primary mt-6 w-full px-6 py-4 text-base disabled:cursor-not-allowed disabled:opacity-70"
              >
                {phase === "working"
                  ? "Preparing your order…"
                  : phase === "paying"
                    ? "Complete the payment in the Razorpay window"
                    : "Pay ₹999 Securely"}
              </button>
              <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
                Guaranteed secure checkout via Razorpay · UPI / cards / netbanking
              </p>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
                By paying you agree to our{" "}
                <Link to="/terms" className="underline">
                  Terms
                </Link>
                ,{" "}
                <Link to="/refund-policy" className="underline">
                  Refund Policy
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-terminal py-8">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
            Amniverse Advisory is a financial software and education publisher, NOT a registered
            investment advisor. This tool is for educational purposes only and does not constitute
            financial advice. Cryptocurrency trading carries extreme risk.
          </p>
          <PolicyLinks className="mt-4 justify-center" />
        </div>
      </footer>
    </div>
  );
}
