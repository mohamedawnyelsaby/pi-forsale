import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { listingMedia, listings } from "@/db/schema";
import { getDb, hasDatabase } from "./db";
import { parseQuery } from "./nlq";
import { type ListingView, sampleListings } from "./sample-data";

export type ListingFilters = { q?: string; kind?: string; type?: string; limit?: number };
export type ListingResult = { items: ListingView[]; demo: boolean; error: boolean };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Row = typeof listings.$inferSelect;

function toView(r: Row, photos?: string[]): ListingView {
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
    photos,
  };
}

/** Fetches the first photo (by position) for each listing id, for card thumbnails. */
async function firstPhotosByListing(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const rows = await getDb()
    .select({ listingId: listingMedia.listingId, url: listingMedia.url, position: listingMedia.position })
    .from(listingMedia)
    .where(and(inArray(listingMedia.listingId, ids), eq(listingMedia.kind, "photo")))
    .orderBy(asc(listingMedia.position));
  const map = new Map<string, string>();
  for (const row of rows) if (!map.has(row.listingId)) map.set(row.listingId, row.url);
  return map;
}

/** Escapes LIKE wildcards so user input is matched literally. */
function likePattern(q: string): string {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export async function searchListings(filters: ListingFilters = {}): Promise<ListingResult> {
  const limit = Math.min(filters.limit ?? 50, 100);

  const parsed = filters.q ? parseQuery(filters.q) : null;
  const kind = filters.kind || parsed?.kind;
  const type = filters.type || parsed?.type;
  const minBedrooms = parsed?.minBedrooms;
  const maxPriceMinor = parsed?.maxPriceEgp ? Math.round(parsed.maxPriceEgp * 100) : undefined;
  const textQuery = (parsed?.remainder ?? filters.q ?? "").trim();

  if (!hasDatabase()) {
    const q = textQuery.toLowerCase();
    const items = sampleListings
      .filter((l) => (!kind || l.kind === kind) && (!type || l.type === type))
      .filter((l) => minBedrooms === undefined || (l.bedrooms ?? 0) >= minBedrooms)
      .filter((l) => maxPriceMinor === undefined || l.priceMinor <= maxPriceMinor)
      .filter((l) => !q || [l.titleAr, l.titleEn, l.cityAr, l.cityEn].some((s) => s.toLowerCase().includes(q)))
      .slice(0, limit);
    return { items, demo: true, error: false };
  }

  try {
    const conditions = [eq(listings.status, "active")];
    if (kind) conditions.push(eq(listings.kind, kind as Row["kind"]));
    if (type) conditions.push(eq(listings.type, type as Row["type"]));
    if (minBedrooms !== undefined) conditions.push(gte(listings.bedrooms, minBedrooms));
    if (maxPriceMinor !== undefined) conditions.push(lte(listings.priceMinor, maxPriceMinor));
    const q = textQuery.slice(0, 100);
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
    const photoMap = await firstPhotosByListing(rows.map((r) => r.id));
    return {
      items: rows.map((r) => toView(r, photoMap.has(r.id) ? [photoMap.get(r.id)!] : undefined)),
      demo: false,
      error: false,
    };
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
    if (!row) return { item: null, demo: false };
    const photoRows = await getDb()
      .select({ url: listingMedia.url })
      .from(listingMedia)
      .where(and(eq(listingMedia.listingId, id), eq(listingMedia.kind, "photo")))
      .orderBy(asc(listingMedia.position));
    return { item: toView(row, photoRows.map((p) => p.url)), demo: false };
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
