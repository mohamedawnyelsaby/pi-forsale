import { ListingCard } from "@/components/ListingCard";
import { SearchForm } from "@/components/SearchForm";
import { formatNumber } from "@/lib/format";
import { getDict, getLocale } from "@/lib/i18n";
import { sampleListings } from "@/lib/sample-data";

type Params = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function Listings({ searchParams }: { searchParams: Params }) {
  const sp = await searchParams;
  const q = first(sp.q).trim().toLowerCase();
  const kind = first(sp.kind);
  const type = first(sp.type);

  const locale = await getLocale();
  const t = getDict(locale);

  const results = sampleListings.filter((l) => {
    if (kind && l.kind !== kind) return false;
    if (type && l.type !== type) return false;
    if (!q) return true;
    return [l.titleAr, l.titleEn, l.cityAr, l.cityEn].some((s) => s.toLowerCase().includes(q));
  });

  return (
    <section className="wrap section">
      <SearchForm t={t} defaults={{ q: first(sp.q), kind, type }} />
      <p className="notice">{t.demoNotice}</p>
      <h1 className="section-title">
        {formatNumber(results.length, locale)} {t.results}
      </h1>
      {results.length === 0 ? (
        <p className="empty">{t.noResults}</p>
      ) : (
        <div className="grid">
          {results.map((item) => (
            <ListingCard key={item.id} item={item} t={t} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}
