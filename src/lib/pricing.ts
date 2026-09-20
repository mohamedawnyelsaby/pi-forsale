import { z } from "zod";

export const paymentMetadata = z.object({
  purpose: z.enum(["commission", "promotion", "deposit"]),
  listingId: z.string().uuid().optional(),
});
export type PaymentMetadata = z.infer<typeof paymentMetadata>;

/**
 * Returns the amount (in Pi) the server expects for a payment, or null if the payment
 * must be rejected. The client-supplied amount is NEVER trusted.
 *
 * Phase 3 (payments) fills this in: commission amounts come from the `commissions` table,
 * promotion prices from a fixed price list, deposits from the listing's deposit rule.
 * Until then every payment is rejected, so approving payments stays disabled by design.
 */
export async function expectedAmountPi(_metadata: PaymentMetadata): Promise<number | null> {
  return null;
}
