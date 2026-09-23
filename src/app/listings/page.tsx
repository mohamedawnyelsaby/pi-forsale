import { ListingCard } from "@/components/ListingCard";
import { SearchForm } from "@/components/SearchForm";
import { formatNumber } from "@/lib/format";
import { getDict, getLocale } from "@/lib/i18n";
import { searchListings } from "@/lib/listings";

type Params = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function Listings({ searchParams }: { searchParams: Params }) {
  const sp = await searchParams;
  const q = first(sp.q);
  const kind = first(sp.kind);
  const type = first(sp.type);

  const locale = await getLocale();
  const t = getDict(locale);
  const { items, demo, error } = await searchListings({ q, kind, type });

  return (
    <section className="wrap section">
      <SearchForm t={t} defaults={{ q, kind, type }} />
      {demo && <p className="notice">{t.demoNotice}</p>}
      <h1 className="section-title">
        {formatNumber(items.length, locale)} {t.results}
      </h1>
      {error ? (
        <p className="empty">{t.loadError}</p>
      ) : items.length === 0 ? (
        <p className="empty">{t.noResults}</p>
      ) : (
        <div className="grid">
          {items.map((item) => (
            <ListingCard key={item.id} item={item} t={t} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}
