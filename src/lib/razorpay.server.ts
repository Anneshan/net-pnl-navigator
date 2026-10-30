// Server-only Razorpay helpers. Never import from client-reachable code.
export const PRODUCT_AMOUNT_PAISE = 99900; // ₹999

export function getRazorpayCredentials() {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  return { keyId, keySecret, configured: Boolean(keyId && keySecret) };
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

export async function createRazorpayOrder(
  receipt: string,
  notes: Record<string, string>,
): Promise<RazorpayOrder> {
  const { keyId, keySecret, configured } = getRazorpayCredentials();
  if (!configured || !keyId || !keySecret) {
    throw new Error("razorpay_not_configured");
  }

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
    },
    body: JSON.stringify({
      amount: PRODUCT_AMOUNT_PAISE,
      currency: "INR",
      receipt,
      notes,
    }),
  });

  if (!res.ok) {
    throw new Error(`razorpay_order_failed_${res.status}`);
  }

  const order = (await res.json()) as { id: string; amount: number; currency: string };
  if (!order.id || typeof order.amount !== "number") {
    throw new Error("razorpay_order_invalid_response");
  }
  return { id: order.id, amount: order.amount, currency: order.currency };
}

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
}

/** Verifies Razorpay's checkout signature: HMAC-SHA256(secret, `${orderId}|${paymentId}`). */
export async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): Promise<boolean> {
  const { keySecret } = getRazorpayCredentials();
  if (!keySecret) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keySecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${orderId}|${paymentId}`),
  );

  const expected = toHex(mac);
  const received = signature.toLowerCase();
  if (expected.length !== received.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ received.charCodeAt(i);
  }
  return diff === 0;
}
