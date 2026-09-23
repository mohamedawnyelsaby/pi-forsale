"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { listings } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function review(formData: FormData, status: "active" | "archived") {
  if (!(await isAdmin())) throw new Error("Forbidden");
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return;
  await getDb()
    .update(listings)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(listings.id, id), eq(listings.status, "pending_review")));
  revalidatePath("/admin");
  revalidatePath("/listings");
  revalidatePath("/");
}

export async function approveListing(formData: FormData) {
  await review(formData, "active");
}

export async function rejectListing(formData: FormData) {
  await review(formData, "archived");
}
