import Link from "next/link";
import { notFound } from "next/navigation";
import { commissionConfig, computeCommission } from "@/lib/commission";
import { formatMoney, formatNumber } from "@/lib/format";
import { getDict, getLocale } from "@/lib/i18n";
import { sampleListings } from "@/lib/sample-data";

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = sampleListings.find((l) => l.id === id);
  if (!item) notFound();

  const locale = await getLocale();
  const t = getDict(locale);
  const { commissionBps } = commissionConfig();
  const commission = computeCommission(item.priceMinor, commissionBps);

  return (
    <section className="wrap section detail">
      <Link href="/listings" className="back">
        {t.back}
      </Link>
      <div className={`detail-media kind-${item.kind}`} aria-hidden="true">
        <span className="card-kind">{t.kind[item.kind]}</span>
      </div>
      <h1 className="detail-title">{locale === "ar" ? item.titleAr : item.titleEn}</h1>
      <dl className="facts">
        <div>
          <dt>{t.price}</dt>
          <dd>{formatMoney(item.priceMinor, item.currency, locale)}</dd>
        </div>
        <div>
          <dt>{t.area}</dt>
          <dd>
            {formatNumber(item.areaSqm, locale)} {t.sqm}
          </dd>
        </div>
        <div>
          <dt>{t.location}</dt>
          <dd>{locale === "ar" ? item.cityAr : item.cityEn}</dd>
        </div>
      </dl>
      <span className={item.verified ? "badge badge-ok" : "badge"}>
        {item.verified ? t.verified : t.unverified}
      </span>

      <div className="panel">
        <h2>{t.commissionTitle}</h2>
        <p>{t.commissionBody}</p>
        <p className="panel-figure">{formatMoney(commission.totalMinor, item.currency, locale)}</p>
      </div>

      <button type="button" className="btn btn-primary" disabled>
        {t.contactSeller}
      </button>
      <p className="notice">{t.contactSoon}</p>
    </section>
  );
}
