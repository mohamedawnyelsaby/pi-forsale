// Demo data used until the database is connected (see README). Not real listings.
export type SampleListing = {
  id: string;
  type: "sale" | "rent";
  kind: "apartment" | "villa" | "land" | "commercial" | "chalet" | "building";
  titleAr: string;
  titleEn: string;
  cityAr: string;
  cityEn: string;
  priceMinor: number;
  currency: string;
  areaSqm: number;
  bedrooms?: number;
  verified: boolean;
};

export const sampleListings: SampleListing[] = [
  { id: "demo-1", type: "sale", kind: "apartment", titleAr: "شقة 3 غرف بإطلالة على النيل", titleEn: "3-bedroom apartment with Nile view", cityAr: "دمياط", cityEn: "Damietta", priceMinor: 2_400_000_00, currency: "EGP", areaSqm: 145, bedrooms: 3, verified: true },
  { id: "demo-2", type: "sale", kind: "land", titleAr: "قطعة أرض على الكورنيش قابلة للتقسيم", titleEn: "Corniche land plot, subdividable", cityAr: "شربين", cityEn: "Sharbeen", priceMinor: 18_500_000_00, currency: "EGP", areaSqm: 2400, verified: true },
  { id: "demo-3", type: "sale", kind: "chalet", titleAr: "شاليه بالدور الأول قريب من البحر", titleEn: "First-floor chalet near the beach", cityAr: "رأس البر", cityEn: "Ras El Bar", priceMinor: 3_100_000_00, currency: "EGP", areaSqm: 95, bedrooms: 2, verified: false },
  { id: "demo-4", type: "rent", kind: "commercial", titleAr: "محل تجاري على شارع رئيسي", titleEn: "Retail shop on a main street", cityAr: "المنصورة", cityEn: "Mansoura", priceMinor: 35_000_00, currency: "EGP", areaSqm: 60, verified: true },
  { id: "demo-5", type: "sale", kind: "villa", titleAr: "فيلا مستقلة بحديقة خاصة", titleEn: "Detached villa with private garden", cityAr: "القاهرة الجديدة", cityEn: "New Cairo", priceMinor: 14_800_000_00, currency: "EGP", areaSqm: 420, bedrooms: 5, verified: true },
  { id: "demo-6", type: "sale", kind: "apartment", titleAr: "شقة في برج على الواجهة البحرية", titleEn: "Apartment in a waterfront tower", cityAr: "دبي", cityEn: "Dubai", priceMinor: 1_250_000_00, currency: "AED", areaSqm: 88, bedrooms: 1, verified: false },
];
