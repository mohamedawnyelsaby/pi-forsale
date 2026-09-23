import type { Metadata } from "next";
import Script from "next/script";
import { Header } from "@/components/Header";
import { getDict, getLocale } from "@/lib/i18n";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDict(await getLocale());
  return { title: `${t.brand} | ${t.tagline}`, description: t.heroSub };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;700&family=Markazi+Text:wght@500;600;700&display=swap"
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
