import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { subscribe } from "@/lib/subscribe.functions";

export function EmailSignup({
  source,
  title = "Get the free weekly fee & tax breakdown",
  blurb = "One email a week: how fees, funding and India's VDA tax rules hit real trades — plus new free tools. No signals, no spam. Unsubscribe any time.",
}: {
  source: string;
  title?: string;
  blurb?: string;
}) {
  const subscribeFn = useServerFn(subscribe);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await subscribeFn({ data: { email, source, company } });
      if (res.ok) {
        setState("done");
        setMessage("You're on the list. Watch your inbox.");
      } else {
        setState("error");
        setMessage("Couldn't save that right now — please try again in a bit.");
      }
    } catch {
      setState("error");
      setMessage("Please enter a valid email address.");
    }
  }

  return (
    <div className="panel relative overflow-hidden p-6 sm:p-8">
      <div
        className="hero-glow pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
      />
      <div className="relative">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
          Free newsletter
        </p>
        <h3 className="mt-3 font-display text-xl font-semibold text-foreground sm:text-2xl">
          {title}
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{blurb}</p>
        {state === "done" ? (
          <p className="mt-5 font-mono text-sm text-pnl-positive">✓ {message}</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <label htmlFor={`email-${source}`} className="sr-only">
              Email address
            </label>
            <input
              id={`email-${source}`}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="h-12 w-full rounded-lg sm:flex-1 border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="hidden"
              name="company"
            />
            <button
              type="submit"
              disabled={state === "sending"}
              className="btn-primary h-12 px-6 text-sm disabled:opacity-70"
            >
              {state === "sending" ? "Joining…" : "Join free"}
            </button>
          </form>
        )}
        {state === "error" ? <p className="mt-3 text-sm text-destructive">{message}</p> : null}
      </div>
    </div>
  );
}
