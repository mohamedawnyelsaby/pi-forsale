import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { listings } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { approveListing, rejectListing } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) notFound(); // do not reveal that this page exists
  const rows = await getDb()
    .select()
    .from(listings)
    .where(eq(listings.status, "pending_review"))
    .orderBy(desc(listings.createdAt))
    .limit(50);

  return (
    <section className="wrap section" dir="rtl" lang="ar">
      <h1 className="section-title">مراجعة الإعلانات ({rows.length})</h1>
      {rows.length === 0 && <p className="empty">لا توجد إعلانات تنتظر المراجعة.</p>}
      <div className="review-list">
        {rows.map((r) => (
          <article key={r.id} className="review-item">
            <h2>{r.titleAr ?? r.titleEn}</h2>
            <p className="card-meta">
              <span>{r.kind}</span>
              <span>{r.type}</span>
              <span>
                {r.city}
                {r.district ? ` / ${r.district}` : ""}
              </span>
              <span>{r.country}</span>
            </p>
            <p className="card-price">{formatMoney(r.priceMinor, r.currency, "ar")}</p>
            {(r.descriptionAr ?? r.descriptionEn) && <p>{r.descriptionAr ?? r.descriptionEn}</p>}
            <div className="review-actions">
              <form action={approveListing}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="btn btn-primary">نشر</button>
              </form>
              <form action={rejectListing}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="btn btn-danger">رفض</button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
