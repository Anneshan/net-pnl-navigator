import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  source: z.string().trim().max(60).optional(),
  // Honeypot: real people never fill this hidden field.
  company: z.string().max(200).optional(),
});

export type SubscribeResult = { ok: true } | { ok: false; error: "invalid" | "unavailable" };

export const subscribe = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => subscribeSchema.parse(data))
  .handler(async ({ data }): Promise<SubscribeResult> => {
    if (data.company) return { ok: true }; // silently drop bots

    if (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
      console.warn("[subscribe] Supabase service role not configured.");
      return { ok: false, error: "unavailable" };
    }
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabaseAdmin as any;
      const { error } = await client
        .from("subscribers")
        .upsert(
          { email: data.email, source: data.source ?? null },
          { onConflict: "email", ignoreDuplicates: true },
        );
      if (error) {
        console.error("[subscribe] insert failed", error);
        return { ok: false, error: "unavailable" };
      }
      return { ok: true };
    } catch (error) {
      console.error("[subscribe] crashed", error);
      return { ok: false, error: "unavailable" };
    }
  });
