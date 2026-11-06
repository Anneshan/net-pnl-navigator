import { createFileRoute } from "@tanstack/react-router";

// Razorpay Dashboard → Settings → Webhooks → Add:
//   URL:    https://<your-domain>/api/razorpay-webhook
//   Secret: same value as the RAZORPAY_WEBHOOK_SECRET env var
//   Events: payment.captured, order.paid
// This makes delivery work even if the buyer closes the tab right after paying.
export const Route = createFileRoute("/api/razorpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("x-razorpay-signature") ?? "";

        const { verifyRazorpayWebhook } = await import("@/lib/razorpay.server");
        if (!(await verifyRazorpayWebhook(rawBody, signature))) {
          return new Response("invalid signature", { status: 401 });
        }

        type PaymentEntity = {
          id?: string;
          order_id?: string;
          email?: string;
          notes?: Record<string, string>;
        };
        let event: { event?: string; payload?: { payment?: { entity?: PaymentEntity } } };
        try {
          event = JSON.parse(rawBody);
        } catch {
          return new Response("bad json", { status: 400 });
        }

        if (event.event === "payment.captured" || event.event === "order.paid") {
          const payment = event.payload?.payment?.entity;
          if (payment?.id && payment.order_id) {
            const { fulfillPaidOrder } = await import("@/lib/fulfillment.server");
            await fulfillPaidOrder({
              orderId: payment.order_id,
              paymentId: payment.id,
              via: "webhook",
              fallbackBuyer: payment.email
                ? { name: payment.notes?.["name"] ?? "", email: payment.email }
                : undefined,
            });
          }
        }

        // Always 200 for valid, signed events so Razorpay doesn't keep retrying.
        return new Response("ok", { status: 200 });
      },
    },
  },
});
