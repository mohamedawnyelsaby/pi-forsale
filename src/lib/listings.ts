import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { listings } from "@/db/schema";
import { getDb, hasDatabase } from "./db";
import { type ListingView, sampleListings } from "./sample-data";

export type ListingFilters = { q?: string; kind?: string; type?: string; limit?: number };
export type ListingResult = { items: ListingView[]; demo: boolean; error: boolean };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Row = typeof listings.$inferSelect;

function toView(r: Row): ListingView {
  const titleAr = r.titleAr ?? r.titleEn ?? "";
  const titleEn = r.titleEn ?? r.titleAr ?? "";
  return {
    id: r.id,
    type: r.type,
    kind: r.kind,
    titleAr,
    titleEn,
    cityAr: r.city,
    cityEn: r.city,
    priceMinor: r.priceMinor,
    currency: r.currency,
    areaSqm: r.areaSqm ? Number(r.areaSqm) : 0,
    bedrooms: r.bedrooms ?? undefined,
    verified: r.verification !== "none",
    descriptionAr: r.descriptionAr ?? r.descriptionEn ?? undefined,
    descriptionEn: r.descriptionEn ?? r.descriptionAr ?? undefined,
  };
}

/** Escapes LIKE wildcards so user input is matched literally. */
function likePattern(q: string): string {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export async function searchListings(filters: ListingFilters = {}): Promise<ListingResult> {
  const limit = Math.min(filters.limit ?? 50, 100);

  if (!hasDatabase()) {
    const q = filters.q?.trim().toLowerCase();
    const items = sampleListings
      .filter((l) => (!filters.kind || l.kind === filters.kind) && (!filters.type || l.type === filters.type))
      .filter((l) => !q || [l.titleAr, l.titleEn, l.cityAr, l.cityEn].some((s) => s.toLowerCase().includes(q)))
      .slice(0, limit);
    return { items, demo: true, error: false };
  }

  try {
    const conditions = [eq(listings.status, "active")];
    if (filters.kind) conditions.push(eq(listings.kind, filters.kind as Row["kind"]));
    if (filters.type) conditions.push(eq(listings.type, filters.type as Row["type"]));
    const q = filters.q?.trim().slice(0, 100);
    if (q) {
      const p = likePattern(q);
      conditions.push(
        or(
          ilike(listings.titleAr, p),
          ilike(listings.titleEn, p),
          ilike(listings.city, p),
          ilike(listings.district, p),
          ilike(listings.descriptionAr, p),
          ilike(listings.descriptionEn, p),
        )!,
      );
    }
    const rows = await getDb()
      .select()
      .from(listings)
      .where(and(...conditions))
      .orderBy(desc(listings.createdAt))
      .limit(limit);
    return { items: rows.map(toView), demo: false, error: false };
  } catch {
    return { items: [], demo: false, error: true };
  }
}

export async function getListing(id: string): Promise<{ item: ListingView | null; demo: boolean }> {
  if (!hasDatabase()) {
    return { item: sampleListings.find((l) => l.id === id) ?? null, demo: true };
  }
  if (!UUID.test(id)) return { item: null, demo: false };
  try {
    const [row] = await getDb()
      .select()
      .from(listings)
      .where(and(eq(listings.id, id), eq(listings.status, "active")))
      .limit(1);
    return { item: row ? toView(row) : null, demo: false };
  } catch {
    return { item: null, demo: false };
  }
}

export async function countPending(): Promise<number> {
  const [r] = await getDb()
    .select({ n: sql<number>`count(*)::int` })
    .from(listings)
    .where(eq(listings.status, "pending_review"));
  return r?.n ?? 0;
}
