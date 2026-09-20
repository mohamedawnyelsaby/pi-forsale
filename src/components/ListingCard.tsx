import Link from "next/link";
import type { Dict, Locale } from "@/lib/i18n";
import { formatMoney, formatNumber } from "@/lib/format";
import type { SampleListing } from "@/lib/sample-data";

export function ListingCard({ item, t, locale }: { item: SampleListing; t: Dict; locale: Locale }) {
  const title = locale === "ar" ? item.titleAr : item.titleEn;
  const city = locale === "ar" ? item.cityAr : item.cityEn;
  return (
    <Link href={`/listings/${item.id}`} className="card">
      <div className={`card-media kind-${item.kind}`} aria-hidden="true">
        <span className="card-kind">{t.kind[item.kind]}</span>
      </div>
      <div className="card-body">
        <div className="card-price">
          {formatMoney(item.priceMinor, item.currency, locale)}
          {item.type === "rent" && <span className="card-type"> / {t.type.rent}</span>}
        </div>
        <h3 className="card-title">{title}</h3>
        <p className="card-meta">
          <span>{city}</span>
          <span>
            {formatNumber(item.areaSqm, locale)} {t.sqm}
          </span>
          {item.bedrooms ? (
            <span>
              {formatNumber(item.bedrooms, locale)} {t.beds}
            </span>
          ) : null}
        </p>
        <span className={item.verified ? "badge badge-ok" : "badge"}>
          {item.verified ? t.verified : t.unverified}
        </span>
      </div>
    </Link>
  );
}
