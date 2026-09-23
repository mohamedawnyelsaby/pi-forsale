import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { SearchForm } from "@/components/SearchForm";
import { getDict, getLocale } from "@/lib/i18n";
import { searchListings } from "@/lib/listings";

export default async function Home() {
  const locale = await getLocale();
  const t = getDict(locale);
  const { items, demo, error } = await searchListings({ limit: 6 });
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1 className="hero-title">{t.heroTitle}</h1>
          <p className="hero-sub">{t.heroSub}</p>
          <SearchForm t={t} />
        </div>
      </section>
      <section className="wrap section">
        {demo && <p className="notice">{t.demoNotice}</p>}
        <h2 className="section-title">{t.latest}</h2>
        {error ? (
          <p className="empty">{t.loadError}</p>
        ) : items.length === 0 ? (
          <div className="empty">
            <p>{t.emptyListings}</p>
            <Link href="/listings/new" className="btn btn-primary">
              {t.emptyCta}
            </Link>
          </div>
        ) : (
          <div className="grid">
            {items.map((item) => (
              <ListingCard key={item.id} item={item} t={t} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
