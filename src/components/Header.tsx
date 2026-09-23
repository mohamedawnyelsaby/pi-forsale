import Link from "next/link";
import { getDict, getLocale } from "@/lib/i18n";
import { LangSwitch } from "./LangSwitch";
import { PiAuth } from "./PiAuth";

export async function Header() {
  const locale = await getLocale();
  const t = getDict(locale);
  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link href="/" className="brand">
          {t.brand}
        </Link>
        <nav className="header-actions" aria-label="Main">
          <Link href="/listings/new" className="btn btn-link">
            {t.newListing}
          </Link>
          <LangSwitch current={locale} label={t.switchLang} />
          <PiAuth label={t.loginPi} hint={t.loginPiHint} done={t.loggedIn} />
        </nav>
      </div>
    </header>
  );
}
