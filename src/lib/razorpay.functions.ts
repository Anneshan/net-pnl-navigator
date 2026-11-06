import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createRazorpayOrder,
  getRazorpayCredentials,
  verifyRazorpaySignature,
} from "./razorpay.server";

const buyerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9][0-9\s-]{5,17}$/, "Enter a valid phone number")
    .max(20),
});

export type CreateOrderInput = z.infer<typeof buyerSchema>;

export type CreateOrderResult =
  | { ok: true; orderId: string; amount: number; currency: string; keyId: string }
  | { ok: false; error: "not_configured" | "order_failed" | "invalid_input" };

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => buyerSchema.parse(data))
  .handler(async ({ data }): Promise<CreateOrderResult> => {
    try {
      const order = await createRazorpayOrder(`amniverse-${Date.now()}`, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        product: "crypto-trading-journal",
      });
      const { recordCreatedOrder } = await import("./fulfillment.server");
      await recordCreatedOrder({
        orderId: order.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        amount: order.amount,
        currency: order.currency,
      });
      const { keyId } = getRazorpayCredentials();
      return {
        ok: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: keyId ?? "",
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { ok: false, error: "invalid_input" };
      }
      if (error instanceof Error && error.message === "razorpay_not_configured") {
        return { ok: false, error: "not_configured" };
      }
      return { ok: false, error: "order_failed" };
    }
  });

const verifySchema = z.object({
  razorpayOrderId: z.string().trim().min(1).max(120),
  razorpayPaymentId: z.string().trim().min(1).max(120),
  razorpaySignature: z.string().trim().min(1).max(256),
  // Used only if the orders table isn't available, so the buyer still gets their email.
  name: z.string().trim().max(120).optional(),
  email: z.string().trim().email().max(200).optional(),
});

export type VerifyPaymentInput = z.infer<typeof verifySchema>;

export type VerifyPaymentResult =
  { ok: true; accessUrl: string | null } | { ok: false; error: "verify_failed" };

export const verifyPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => verifySchema.parse(data))
  .handler(async ({ data }): Promise<VerifyPaymentResult> => {
    const verified = await verifyRazorpaySignature(
      data.razorpayOrderId,
      data.razorpayPaymentId,
      data.razorpaySignature,
    );
    if (!verified) return { ok: false, error: "verify_failed" };

    const { fulfillPaidOrder, getAccessUrl } = await import("./fulfillment.server");
    await fulfillPaidOrder({
      orderId: data.razorpayOrderId,
      paymentId: data.razorpayPaymentId,
      via: "checkout",
      fallbackBuyer: data.email ? { name: data.name ?? "", email: data.email } : undefined,
    });
    return { ok: true, accessUrl: getAccessUrl() };
  });
