import { createClient } from "@supabase/supabase-js";

export const PHOTO_BUCKET = "listing-photos";
export const MAX_PHOTOS = 6;
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB — the client resizes images before upload
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function hasStorage(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let cached: ReturnType<typeof createClient> | null = null;

/** Server-only: uses the service-role key, which bypasses Row Level Security entirely. */
function client() {
  if (!cached) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Supabase storage is not configured");
    cached = createClient(url, key, { auth: { persistSession: false } });
  }
  return cached;
}

export function isAllowedPhoto(file: File): boolean {
  return ALLOWED_TYPES.has(file.type) && file.size > 0 && file.size <= MAX_PHOTO_BYTES;
}

export function photoPath(listingId: string, index: number): string {
  return `${listingId}/${index}.jpg`;
}

/** Uploads one photo and returns its public URL, or null if the upload failed. */
export async function uploadListingPhoto(listingId: string, index: number, file: File): Promise<string | null> {
  const path = photoPath(listingId, index);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await client()
    .storage.from(PHOTO_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: true });
  if (error) return null;
  return client().storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}
