import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, hasDatabase } from "@/lib/db";
import { verifyAccessToken } from "@/lib/pi";
import { createSession } from "@/lib/session";
import { users } from "@/db/schema";

const body = z.object({ accessToken: z.string().min(10).max(4096) });

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!hasDatabase()) {
    return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  }

  let piUser;
  try {
    piUser = await verifyAccessToken(parsed.data.accessToken);
  } catch {
    return NextResponse.json({ error: "Pi token could not be verified" }, { status: 401 });
  }

  const db = getDb();
  const [user] = await db
    .insert(users)
    .values({ piUid: piUser.uid, piUsername: piUser.username })
    .onConflictDoUpdate({ target: users.piUid, set: { piUsername: piUser.username } })
    .returning();

  await createSession({ userId: user.id, piUid: user.piUid, role: user.role });
  return NextResponse.json({ ok: true, username: user.piUsername });
}
