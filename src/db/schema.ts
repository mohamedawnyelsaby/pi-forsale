import {
  bigint,
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["buyer", "owner", "broker", "developer", "admin"]);
export const listingType = pgEnum("listing_type", ["sale", "rent"]);
export const propertyKind = pgEnum("property_kind", [
  "apartment",
  "villa",
  "land",
  "commercial",
  "chalet",
  "building",
]);
export const listingStatus = pgEnum("listing_status", [
  "draft",
  "pending_review",
  "active",
  "reserved",
  "sold",
  "archived",
]);
export const verificationLevel = pgEnum("verification_level", ["none", "documents", "site_visit"]);
export const plotStatus = pgEnum("plot_status", ["available", "reserved", "sold"]);
export const paymentPurpose = pgEnum("payment_purpose", ["commission", "promotion", "deposit"]);
export const paymentStatus = pgEnum("payment_status", [
  "created",
  "approved",
  "completed",
  "cancelled",
  "failed",
]);
export const commissionStatus = pgEnum("commission_status", ["pending", "invoiced", "paid", "waived"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    piUid: text("pi_uid").notNull(),
    piUsername: text("pi_username").notNull(),
    displayName: text("display_name"),
    role: userRole("role").notNull().default("buyer"),
    locale: varchar("locale", { length: 5 }).notNull().default("ar"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_pi_uid_idx").on(t.piUid)],
);

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").notNull().references(() => users.id),
    brokerId: uuid("broker_id").references(() => users.id),
    type: listingType("type").notNull(),
    kind: propertyKind("kind").notNull(),
    status: listingStatus("status").notNull().default("draft"),
    verification: verificationLevel("verification").notNull().default("none"),
    titleAr: text("title_ar"),
    titleEn: text("title_en"),
    descriptionAr: text("description_ar"),
    descriptionEn: text("description_en"),
    // Money is always stored as integer minor units (e.g. piasters/cents) + ISO currency.
    priceMinor: bigint("price_minor", { mode: "number" }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    areaSqm: numeric("area_sqm", { precision: 12, scale: 2 }),
    bedrooms: integer("bedrooms"),
    bathrooms: integer("bathrooms"),
    country: varchar("country", { length: 2 }).notNull(),
    city: text("city").notNull(),
    district: text("district"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("listings_status_idx").on(t.status),
    index("listings_geo_idx").on(t.country, t.city),
    index("listings_price_idx").on(t.currency, t.priceMinor),
  ],
);

export const listingMedia = pgTable("listing_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  kind: varchar("kind", { length: 16 }).notNull().default("photo"), // photo | document | site_visit
  position: integer("position").notNull().default(0),
});

// Land subdivision: one parent listing (kind = land) split into individually sellable plots.
export const listingPlots = pgTable("listing_plots", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  areaSqm: numeric("area_sqm", { precision: 12, scale: 2 }).notNull(),
  priceMinor: bigint("price_minor", { mode: "number" }).notNull(),
  status: plotStatus("status").notNull().default("available"),
  geometry: jsonb("geometry"), // GeoJSON polygon drawn on the map
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id").notNull().references(() => listings.id),
  buyerId: uuid("buyer_id").notNull().references(() => users.id),
  sellerId: uuid("seller_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id").notNull().references(() => users.id),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_conv_idx").on(t.conversationId, t.createdAt)],
);

// Financial ledger for every Pi payment. Rows are never deleted; status only moves forward.
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    piPaymentId: text("pi_payment_id").notNull(),
    userId: uuid("user_id").notNull().references(() => users.id),
    listingId: uuid("listing_id").references(() => listings.id),
    purpose: paymentPurpose("purpose").notNull(),
    amountPi: numeric("amount_pi", { precision: 20, scale: 7 }).notNull(),
    status: paymentStatus("status").notNull().default("created"),
    txid: text("txid"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("payments_pi_payment_idx").on(t.piPaymentId)],
);

// Commission owed to the platform when a deal closes.
export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id").notNull().references(() => listings.id),
  dealValueMinor: bigint("deal_value_minor", { mode: "number" }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  platformMinor: bigint("platform_minor", { mode: "number" }).notNull(),
  brokerMinor: bigint("broker_minor", { mode: "number" }).notNull().default(0),
  status: commissionStatus("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const flagged = pgTable("flagged_listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
