import { and, eq, gt, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { listingMedia, listings } from "@/db/schema";
import { COUNTRIES, CURRENCIES, KINDS, TYPES } from "@/lib/constants";
import { getDb, hasDatabase } from "@/lib/db";
import { getSession } from "@/lib/session";
import { MAX_PHOTOS, hasStorage, isAllowedPhoto, uploadListingPhoto } from "@/lib/storage";

const DAILY_LIMIT = 10;
const ARABIC = /[\u0600-\u06FF]/;

const fields = z.object({
  type: z.enum(TYPES),
  kind: z.enum(KINDS),
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().max(4000).optional(),
  price: z.coerce.number().positive().max(1e12),
  currency: z.enum(CURRENCIES),
  areaSqm: z.coerce.number().positive().max(10_000_000).optional(),
  bedrooms: z.coerce.number().int().min(0).max(50).optional(),
  country: z.enum(COUNTRIES),
  city: z.string().trim().min(2).max(80),
  district: z.string().trim().max(80).optional(),
});

/** New listings always start as "pending_review"; an admin publishes them. */
export async function POST(req: Request) {
  const session = await getSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!hasDatabase()) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const raw = Object.fromEntries(
    ["type", "kind", "title", "description", "price", "currency", "areaSqm", "bedrooms", "country", "city", "district"].map(
      (k) => [k, form.get(k) === null ? undefined : String(form.get(k))],
    ),
  );
  const parsed = fields.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const d = parsed.data;

  const priceMinor = Math.round(d.price * 100);
  if (!Number.isSafeInteger(priceMinor)) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const photoFiles = form
    .getAll("photos")
    .filter((v): v is File => v instanceof File && v.size > 0)
    .slice(0, MAX_PHOTOS);
  if (photoFiles.some((f) => !isAllowedPhoto(f))) {
    return NextResponse.json({ error: "invalid_photo" }, { status: 400 });
  }

  const db = getDb();
  const [recent] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(listings)
    .where(and(eq(listings.ownerId, session.userId), gt(listings.createdAt, new Date(Date.now() - 86_400_000))));
  if ((recent?.n ?? 0) >= DAILY_LIMIT) return NextResponse.json({ error: "limit" }, { status: 429 });

  // Text is stored in the field matching its script; the UI falls back to the other one.
  const isAr = ARABIC.test(d.title);
  const [row] = await db
    .insert(listings)
    .values({
      ownerId: session.userId,
      type: d.type,
      kind: d.kind,
      status: "pending_review",
      titleAr: isAr ? d.title : null,
      titleEn: isAr ? null : d.title,
      descriptionAr: d.description && ARABIC.test(d.description) ? d.description : null,
      descriptionEn: d.description && !ARABIC.test(d.description) ? d.description : null,
      priceMinor,
      currency: d.currency,
      areaSqm: d.areaSqm !== undefined ? String(d.areaSqm) : null,
      bedrooms: d.bedrooms ?? null,
      country: d.country,
      city: d.city,
      district: d.district || null,
    })
    .returning({ id: listings.id });

  let photosSaved = 0;
  if (photoFiles.length > 0 && hasStorage()) {
    const urls = await Promise.all(photoFiles.map((f, i) => uploadListingPhoto(row.id, i, f)));
    const okUrls = urls.filter((u): u is string => Boolean(u));
    if (okUrls.length > 0) {
      await db.insert(listingMedia).values(
        okUrls.map((url, i) => ({ listingId: row.id, url, kind: "photo" as const, position: i })),
      );
      photosSaved = okUrls.length;
    }
  }

  return NextResponse.json(
    { ok: true, id: row.id, photosAttempted: photoFiles.length, photosSaved },
    { status: 201 },
  );
}
