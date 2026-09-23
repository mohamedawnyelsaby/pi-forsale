import Link from "next/link";
import { getDict, getLocale } from "@/lib/i18n";
import { getTheme } from "@/lib/theme";
import { LangSwitch } from "./LangSwitch";
import { ThemeToggle } from "./ThemeToggle";
import { PiAuth } from "./PiAuth";

export async function Header() {
  const locale = await getLocale();
  const t = getDict(locale);
  const theme = await getTheme();
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
          <ThemeToggle current={theme} dayLabel={t.dayMode} nightLabel={t.nightMode} />
          <LangSwitch current={locale} label={t.switchLang} />
          <PiAuth label={t.loginPi} hint={t.loginPiHint} done={t.loggedIn} />
        </nav>
      </div>
    </header>
  );
}
