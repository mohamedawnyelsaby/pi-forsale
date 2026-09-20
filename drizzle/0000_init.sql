CREATE TYPE "public"."commission_status" AS ENUM('pending', 'invoiced', 'paid', 'waived');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('draft', 'pending_review', 'active', 'reserved', 'sold', 'archived');--> statement-breakpoint
CREATE TYPE "public"."listing_type" AS ENUM('sale', 'rent');--> statement-breakpoint
CREATE TYPE "public"."payment_purpose" AS ENUM('commission', 'promotion', 'deposit');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('created', 'approved', 'completed', 'cancelled', 'failed');--> statement-breakpoint
CREATE TYPE "public"."plot_status" AS ENUM('available', 'reserved', 'sold');--> statement-breakpoint
CREATE TYPE "public"."property_kind" AS ENUM('apartment', 'villa', 'land', 'commercial', 'chalet', 'building');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('buyer', 'owner', 'broker', 'developer', 'admin');--> statement-breakpoint
CREATE TYPE "public"."verification_level" AS ENUM('none', 'documents', 'site_visit');--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"deal_value_minor" bigint NOT NULL,
	"currency" varchar(3) NOT NULL,
	"platform_minor" bigint NOT NULL,
	"broker_minor" bigint DEFAULT 0 NOT NULL,
	"status" "commission_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flagged_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"url" text NOT NULL,
	"kind" varchar(16) DEFAULT 'photo' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_plots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"label" text NOT NULL,
	"area_sqm" numeric(12, 2) NOT NULL,
	"price_minor" bigint NOT NULL,
	"status" "plot_status" DEFAULT 'available' NOT NULL,
	"geometry" jsonb
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"broker_id" uuid,
	"type" "listing_type" NOT NULL,
	"kind" "property_kind" NOT NULL,
	"status" "listing_status" DEFAULT 'draft' NOT NULL,
	"verification" "verification_level" DEFAULT 'none' NOT NULL,
	"title_ar" text,
	"title_en" text,
	"description_ar" text,
	"description_en" text,
	"price_minor" bigint NOT NULL,
	"currency" varchar(3) NOT NULL,
	"area_sqm" numeric(12, 2),
	"bedrooms" integer,
	"bathrooms" integer,
	"country" varchar(2) NOT NULL,
	"city" text NOT NULL,
	"district" text,
	"lat" double precision,
	"lng" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pi_payment_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"listing_id" uuid,
	"purpose" "payment_purpose" NOT NULL,
	"amount_pi" numeric(20, 7) NOT NULL,
	"status" "payment_status" DEFAULT 'created' NOT NULL,
	"txid" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pi_uid" text NOT NULL,
	"pi_username" text NOT NULL,
	"display_name" text,
	"role" "user_role" DEFAULT 'buyer' NOT NULL,
	"locale" varchar(5) DEFAULT 'ar' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flagged_listings" ADD CONSTRAINT "flagged_listings_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_media" ADD CONSTRAINT "listing_media_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_plots" ADD CONSTRAINT "listing_plots_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_broker_id_users_id_fk" FOREIGN KEY ("broker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listings_status_idx" ON "listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "listings_geo_idx" ON "listings" USING btree ("country","city");--> statement-breakpoint
CREATE INDEX "listings_price_idx" ON "listings" USING btree ("currency","price_minor");--> statement-breakpoint
CREATE INDEX "messages_conv_idx" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_pi_payment_idx" ON "payments" USING btree ("pi_payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_pi_uid_idx" ON "users" USING btree ("pi_uid");