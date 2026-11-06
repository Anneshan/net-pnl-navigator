// Server-only: order storage + product delivery. Never import from client code.
//
// Env vars (set in Vercel → Settings → Environment Variables, and in Lovable Cloud secrets):
//   ACCESS_URL                 – the link buyers get (e.g. your Google Sheet "…/copy" link or a Drive PDF)
//   RESEND_API_KEY             – https://resend.com API key (free tier: 3,000 emails/month)
//   EMAIL_FROM                 – e.g. "Amniverse Advisory <orders@yourdomain.com>" (domain verified in Resend)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY – for the orders table
import { business } from "./business";

export type OrderRow = {
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  name: string;
  email: string;
  phone: string;
  amount_paise: number;
  currency: string;
  status: "created" | "paid" | "failed";
  paid_via: "checkout" | "webhook" | null;
  emailed_at: string | null;
};

export function getAccessUrl(): string | null {
  return process.env["ACCESS_URL"] || null;
}

// Supabase types.ts is generated with no tables yet, so use an untyped handle here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any | null> {
  if (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
    console.warn("[orders] Supabase service role not configured — orders are not being stored.");
    return null;
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function recordCreatedOrder(input: {
  orderId: string;
  name: string;
  email: string;
  phone: string;
  amount: number;
  currency: string;
}): Promise<void> {
  try {
    const client = await db();
    if (!client) return;
    const { error } = await client.from("orders").insert({
      razorpay_order_id: input.orderId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      amount_paise: input.amount,
      currency: input.currency,
      status: "created",
    });
    if (error) console.error("[orders] insert failed", error);
  } catch (error) {
    console.error("[orders] insert crashed", error);
  }
}

type PaidResult = {
  /** True only for the first call that moved this order to "paid". */
  firstTransition: boolean;
  order: OrderRow | null;
  dbAvailable: boolean;
};

/** Marks an order paid exactly once (safe to call from both checkout and webhook). */
export async function markOrderPaid(
  orderId: string,
  paymentId: string,
  via: "checkout" | "webhook",
): Promise<PaidResult> {
  try {
    const client = await db();
    if (!client) return { firstTransition: false, order: null, dbAvailable: false };

    const { data, error } = await client
      .from("orders")
      .update({
        status: "paid",
        razorpay_payment_id: paymentId,
        paid_via: via,
        paid_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", orderId)
      .neq("status", "paid")
      .select()
      .maybeSingle();
    if (error) {
      console.error("[orders] mark paid failed", error);
      return { firstTransition: false, order: null, dbAvailable: false };
    }
    if (data) return { firstTransition: true, order: data as OrderRow, dbAvailable: true };

    const existing = await client
      .from("orders")
      .select()
      .eq("razorpay_order_id", orderId)
      .maybeSingle();
    return {
      firstTransition: false,
      order: (existing.data as OrderRow) ?? null,
      dbAvailable: true,
    };
  } catch (error) {
    console.error("[orders] mark paid crashed", error);
    return { firstTransition: false, order: null, dbAvailable: false };
  }
}

async function markEmailed(orderId: string): Promise<void> {
  try {
    const client = await db();
    if (!client) return;
    await client
      .from("orders")
      .update({ emailed_at: new Date().toISOString() })
      .eq("razorpay_order_id", orderId);
  } catch (error) {
    console.error("[orders] mark emailed crashed", error);
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export async function sendAccessEmail(input: {
  orderId: string;
  paymentId: string;
  name: string;
  email: string;
}): Promise<boolean> {
  const apiKey = process.env["RESEND_API_KEY"];
  const from = process.env["EMAIL_FROM"];
  const accessUrl = getAccessUrl();
  if (!apiKey || !from || !accessUrl) {
    console.warn(
      "[email] RESEND_API_KEY / EMAIL_FROM / ACCESS_URL not set — access email not sent.",
    );
    return false;
  }

  const name = escapeHtml(input.name.split(" ")[0] || "there");
  const url = escapeHtml(accessUrl);
  const html = `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111">
  <h2>You're in, ${name} 🎉</h2>
  <p>Thanks for buying the <b>Amniverse Crypto Trading Journal</b>. Your payment of ₹999 was received.</p>
  <p style="margin:28px 0">
    <a href="${url}" style="background:#10b981;color:#fff;padding:14px 22px;border-radius:8px;text-decoration:none;font-weight:bold">
      Open your journal
    </a>
  </p>
  <p><b>Setup in 3 steps:</b></p>
  <ol>
    <li>Sign in to your Google account and open the link above.</li>
    <li>Click <b>Make a copy</b> — the copy is saved to your own Google Drive.</li>
    <li>Start with the "Settings" tab, then log your first trade.</li>
  </ol>
  <p>If the button doesn't work, paste this link into your browser:<br/>${url}</p>
  <p style="color:#666;font-size:12px">Payment ID: ${escapeHtml(input.paymentId)} · Order ID: ${escapeHtml(input.orderId)}<br/>
  Need help? Reply to this email or write to ${escapeHtml(business.supportEmail)}.</p>
</div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [input.email],
        reply_to: business.supportEmail.startsWith("TODO") ? undefined : business.supportEmail,
        subject: "Your Amniverse Crypto Trading Journal access",
        html,
      }),
    });
    if (!res.ok) {
      console.error("[email] Resend error", res.status, await res.text());
      return false;
    }
    await markEmailed(input.orderId);
    return true;
  } catch (error) {
    console.error("[email] send crashed", error);
    return false;
  }
}

/**
 * Called after a payment is confirmed. Sends the access email once:
 * whichever of checkout / webhook confirms first sends it.
 */
export async function fulfillPaidOrder(input: {
  orderId: string;
  paymentId: string;
  via: "checkout" | "webhook";
  fallbackBuyer?: { name: string; email: string } | undefined;
}): Promise<void> {
  const result = await markOrderPaid(input.orderId, input.paymentId, input.via);
  const buyer = result.order ?? input.fallbackBuyer;
  // No DB, or the order row is missing: let the checkout path send so buyers still get access.
  const shouldSend =
    result.dbAvailable && result.order ? result.firstTransition : input.via === "checkout";

  if (shouldSend && buyer?.email) {
    await sendAccessEmail({
      orderId: input.orderId,
      paymentId: input.paymentId,
      name: buyer.name,
      email: buyer.email,
    });
  }
}
