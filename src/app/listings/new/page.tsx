import { NewListingForm } from "@/components/NewListingForm";
import { getDict, getLocale } from "@/lib/i18n";
import { getSession } from "@/lib/session";

export default async function NewListing() {
  const locale = await getLocale();
  const t = getDict(locale);
  const session = await getSession().catch(() => null);

  return (
    <section className="wrap section narrow">
      <h1 className="section-title">{t.form.heading}</h1>
      {session ? (
        <NewListingForm t={t} locale={locale} />
      ) : (
        <div className="panel">
          <p>{t.form.signIn}</p>
          <p className="hint">{t.form.signInHint}</p>
        </div>
      )}
    </section>
  );
}
