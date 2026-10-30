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

export type VerifyPaymentInput = z.infer<typeof verifySchema>;

const verifySchema = z.object({
  razorpayOrderId: z.string().trim().min(1).max(120),
  razorpayPaymentId: z.string().trim().min(1).max(120),
  razorpaySignature: z.string().trim().min(1).max(256),
});

export type VerifyPaymentResult = { ok: boolean; error?: "verify_failed" };

export const verifyPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => verifySchema.parse(data))
  .handler(async ({ data }): Promise<VerifyPaymentResult> => {
    const verified = await verifyRazorpaySignature(
      data.razorpayOrderId,
      data.razorpayPaymentId,
      data.razorpaySignature,
    );
    return verified ? { ok: true } : { ok: false, error: "verify_failed" };
  });
