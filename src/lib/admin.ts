import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { getDb, hasDatabase } from "./db";
import { getSession } from "./session";

/** Reads the role from the database (never from the cookie) so demotions apply immediately. */
export async function isAdmin(): Promise<boolean> {
  if (!hasDatabase()) return false;
  const session = await getSession().catch(() => null);
  if (!session) return false;
  const [u] = await getDb().select({ role: users.role }).from(users).where(eq(users.id, session.userId)).limit(1);
  return u?.role === "admin";
}
