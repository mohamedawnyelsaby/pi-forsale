import { ListingCard } from "@/components/ListingCard";
import { SearchForm } from "@/components/SearchForm";
import { getDict, getLocale } from "@/lib/i18n";
import { sampleListings } from "@/lib/sample-data";

export default async function Home() {
  const locale = await getLocale();
  const t = getDict(locale);
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
        <p className="notice">{t.demoNotice}</p>
        <h2 className="section-title">{t.latest}</h2>
        <div className="grid">
          {sampleListings.map((item) => (
            <ListingCard key={item.id} item={item} t={t} locale={locale} />
          ))}
        </div>
      </section>
    </>
  );
}
