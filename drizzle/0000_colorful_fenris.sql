CREATE TABLE "b2b_companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_ar" text NOT NULL,
	"name_fr" text,
	"type" text NOT NULL,
	"wilaya_code" text NOT NULL,
	"wilaya_name" text NOT NULL,
	"commune" text NOT NULL,
	"address" text,
	"phone" text NOT NULL,
	"email" text,
	"capacity" text,
	"certifications" text,
	"verified" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title_ar" text NOT NULL,
	"company_name" text NOT NULL,
	"company_type" text NOT NULL,
	"wilaya_code" text NOT NULL,
	"wilaya_name" text NOT NULL,
	"commune" text NOT NULL,
	"job_type" text NOT NULL,
	"salary_range" text NOT NULL,
	"housing_provided" boolean DEFAULT true,
	"requirements" text NOT NULL,
	"contact_phone" text NOT NULL,
	"contact_email" text,
	"status" text DEFAULT 'open',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "market_offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"offer_type" text NOT NULL,
	"name" text NOT NULL,
	"wilaya_code" text NOT NULL,
	"wilaya_name" text NOT NULL,
	"commune" text NOT NULL,
	"phone" text NOT NULL,
	"chicken_categories" text,
	"weight_range" text,
	"available_quantity" text,
	"breed_type" text,
	"farm_acreage" text,
	"chicken_age" text,
	"details" text,
	"buy_khashna" integer,
	"buy_motawassita" integer,
	"buy_raqiqa" integer,
	"max_purchase_kg" text,
	"delivery_area" text,
	"buying_details" text,
	"verified" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "poultry_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"wilaya_code" text NOT NULL,
	"date" text NOT NULL,
	"category" text NOT NULL,
	"farmer_price" integer NOT NULL,
	"slaughter_price" integer NOT NULL,
	"intermediary_price" integer NOT NULL,
	"trend" text DEFAULT 'stable' NOT NULL,
	"trend_change_percent" text DEFAULT '0%',
	"notes_ar" text,
	"reported_by" text DEFAULT 'الغرفة الفلاحية',
	"status" text DEFAULT 'official',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "price_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"wilaya_code" text NOT NULL,
	"wilaya_name" text NOT NULL,
	"reporter_name" text NOT NULL,
	"reporter_role" text NOT NULL,
	"phone" text NOT NULL,
	"khashna_farmer" integer,
	"khashna_slaughter" integer,
	"khashna_intermediary" integer,
	"motawassita_farmer" integer,
	"motawassita_slaughter" integer,
	"motawassita_intermediary" integer,
	"raqiqa_farmer" integer,
	"raqiqa_slaughter" integer,
	"raqiqa_intermediary" integer,
	"notes" text,
	"verified" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'farmer' NOT NULL,
	"wilaya_code" text,
	"commune" text,
	"subscription_status" text DEFAULT 'none' NOT NULL,
	"receipt_url" text,
	"id_card_url" text,
	"rejection_reason" text,
	"subscription_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "wilayas" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name_ar" text NOT NULL,
	"name_fr" text NOT NULL,
	"region" text NOT NULL,
	"active_farms_count" integer DEFAULT 0,
	"slaughterhouses_count" integer DEFAULT 0,
	CONSTRAINT "wilayas_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "workers" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"specialty" text NOT NULL,
	"wilaya_code" text NOT NULL,
	"wilaya_name" text NOT NULL,
	"experience_years" integer NOT NULL,
	"willing_to_relocate" boolean DEFAULT true,
	"phone" text NOT NULL,
	"bio" text NOT NULL,
	"available_now" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
