import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, hasDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

const EXPECTED_TABLES = [
  "users",
  "listings",
  "listing_media",
  "listing_plots",
  "conversations",
  "messages",
  "payments",
  "commissions",
  "flagged_listings",
];

/**
 * Setup check. Reports only yes/no flags, never values or error details,
 * so it is safe to leave public.
 */
export async function GET() {
  const result = {
    database: "not_configured" as "not_configured" | "connected" | "error",
    tablesFound: 0,
    tablesExpected: EXPECTED_TABLES.length,
    sessionSecretSet: (process.env.SESSION_SECRET?.length ?? 0) >= 32,
    piApiKeySet: Boolean(process.env.PI_API_KEY),
    piSandbox: process.env.NEXT_PUBLIC_PI_SANDBOX !== "false",
  };

  if (hasDatabase()) {
    try {
      const rows = await getDb().execute(
        sql`select count(*)::int as n from information_schema.tables
            where table_schema = 'public' and table_name in (${sql.join(
              EXPECTED_TABLES.map((t) => sql`${t}`),
              sql`, `,
            )})`,
      );
      result.database = "connected";
      result.tablesFound = Number((rows as unknown as { n: number }[])[0]?.n ?? 0);
    } catch {
      result.database = "error";
    }
  }

  const ready =
    result.database === "connected" &&
    result.tablesFound === result.tablesExpected &&
    result.sessionSecretSet;
  return NextResponse.json({ ready, ...result }, { status: ready ? 200 : 503 });
}
