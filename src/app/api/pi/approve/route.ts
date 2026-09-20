import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { approvePayment, getPayment } from "@/lib/pi";
import { expectedAmountPi, paymentMetadata } from "@/lib/pricing";
import { getSession } from "@/lib/session";
import { payments } from "@/db/schema";

const body = z.object({ paymentId: z.string().min(1).max(128) });

/** Called by the Pi SDK's onReadyForServerApproval. Validates everything server-side. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const payment = await getPayment(parsed.data.paymentId).catch(() => null);
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  // The payment must belong to the signed-in user.
  if (payment.user_uid !== session.piUid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const meta = paymentMetadata.safeParse(payment.metadata);
  if (!meta.success) return NextResponse.json({ error: "Unsupported payment" }, { status: 422 });

  // Never trust the client's amount: compare with what the server expects.
  const expected = await expectedAmountPi(meta.data);
  if (expected === null || Math.abs(expected - payment.amount) > 1e-7) {
    return NextResponse.json({ error: "Payments are not enabled for this purpose" }, { status: 422 });
  }

  await getDb()
    .insert(payments)
    .values({
      piPaymentId: payment.identifier,
      userId: session.userId,
      listingId: meta.data.listingId,
      purpose: meta.data.purpose,
      amountPi: String(payment.amount),
      status: "approved",
      metadata: payment.metadata,
    })
    .onConflictDoNothing();

  await approvePayment(payment.identifier);
  return NextResponse.json({ ok: true });
}
