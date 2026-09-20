import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { completePayment, getPayment } from "@/lib/pi";
import { getSession } from "@/lib/session";
import { payments } from "@/db/schema";

const body = z.object({ paymentId: z.string().min(1).max(128), txid: z.string().min(1).max(256) });

/** Called by the Pi SDK's onReadyForServerCompletion, after the blockchain transaction exists. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { paymentId, txid } = parsed.data;

  const db = getDb();
  const [row] = await db
    .select()
    .from(payments)
    .where(and(eq(payments.piPaymentId, paymentId), eq(payments.userId, session.userId)))
    .limit(1);
  if (!row || row.status !== "approved") {
    return NextResponse.json({ error: "No approved payment found" }, { status: 404 });
  }

  // Confirm with Pi that this txid really belongs to this payment before completing.
  const payment = await getPayment(paymentId).catch(() => null);
  if (!payment || payment.transaction?.txid !== txid) {
    return NextResponse.json({ error: "Transaction mismatch" }, { status: 409 });
  }

  await completePayment(paymentId, txid);
  await db
    .update(payments)
    .set({ status: "completed", txid, completedAt: new Date() })
    .where(eq(payments.id, row.id));
  return NextResponse.json({ ok: true });
}
