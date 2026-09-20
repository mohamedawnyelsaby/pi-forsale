import { cookies } from "next/headers";

export type Locale = "ar" | "en";
export const LOCALE_COOKIE = "lang";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : "ar";
}

const dict = {
  ar: {
    brand: "ForSale",
    tagline: "اشترِ وبِع العقارات بثقة",
    heroTitle: "ابحث عن عقارك في أي مكان",
    heroSub: "شقق وفيلات وأراضٍ ومحلات، من ملّاك ووسطاء موثّقين. الدفع عبر Pi Network.",
    searchPlaceholder: "مثال: شقة 3 غرف قريبة من البحر",
    search: "ابحث",
    allKinds: "كل الأنواع",
    kind: {
      apartment: "شقة",
      villa: "فيلا",
      land: "أرض",
      commercial: "محل / تجاري",
      chalet: "شاليه",
      building: "عمارة",
    },
    type: { sale: "للبيع", rent: "للإيجار" },
    verified: "موثّق",
    unverified: "غير موثّق",
    sqm: "م²",
    beds: "غرف",
    latest: "أحدث العقارات",
    results: "نتيجة",
    noResults: "لا توجد عقارات مطابقة. جرّب تغيير البحث أو النوع.",
    demoNotice: "بيانات تجريبية للعرض فقط. الإعلانات الحقيقية تظهر بعد ربط قاعدة البيانات.",
    loginPi: "الدخول عبر Pi",
    loginPiHint: "افتح التطبيق من Pi Browser لتسجيل الدخول.",
    loggedIn: "تم الدخول",
    back: "رجوع للنتائج",
    price: "السعر",
    area: "المساحة",
    location: "الموقع",
    contactSeller: "تواصل مع البائع",
    contactSoon: "الشات الداخلي وحجز المعاينة قادمان في المرحلة التالية.",
    commissionTitle: "كيف تعمل العمولة؟",
    commissionBody:
      "المنصة وسيط: لا نستلم ثمن العقار. نأخذ عمولة على الصفقة فقط بعد إتمامها، وتُدفع بعملة Pi.",
    switchLang: "English",
  },
  en: {
    brand: "ForSale",
    tagline: "Buy and sell property with confidence",
    heroTitle: "Find property anywhere",
    heroSub: "Apartments, villas, land and shops from verified owners and brokers. Pay with Pi Network.",
    searchPlaceholder: "e.g. 3-bedroom apartment near the sea",
    search: "Search",
    allKinds: "All types",
    kind: {
      apartment: "Apartment",
      villa: "Villa",
      land: "Land",
      commercial: "Commercial",
      chalet: "Chalet",
      building: "Building",
    },
    type: { sale: "For sale", rent: "For rent" },
    verified: "Verified",
    unverified: "Not verified",
    sqm: "m²",
    beds: "beds",
    latest: "Latest listings",
    results: "results",
    noResults: "No matching properties. Try changing the search or the type.",
    demoNotice: "Demo data for preview only. Real listings appear once the database is connected.",
    loginPi: "Sign in with Pi",
    loginPiHint: "Open the app in Pi Browser to sign in.",
    loggedIn: "Signed in",
    back: "Back to results",
    price: "Price",
    area: "Area",
    location: "Location",
    contactSeller: "Contact seller",
    contactSoon: "In-app chat and viewing bookings arrive in the next phase.",
    commissionTitle: "How does the commission work?",
    commissionBody:
      "The platform is an intermediary: we never hold the property payment. We charge a commission on the deal only after it closes, paid in Pi.",
    switchLang: "العربية",
  },
} as const;

export type Dict = (typeof dict)["ar"];

export function getDict(locale: Locale): Dict {
  return dict[locale] as Dict;
}
