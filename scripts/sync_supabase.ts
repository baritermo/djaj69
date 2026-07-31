import { pool } from '../src/db/index';

async function syncSupabase() {
  console.log('🔄 Starting Supabase Database Table Synchronization...');
  try {
    // 1. official_prices
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "official_prices" (
        "wilaya_code" text PRIMARY KEY NOT NULL,
        "name_ar" text NOT NULL,
        "name_fr" text NOT NULL,
        "region" text NOT NULL,
        "trend" text DEFAULT 'stable' NOT NULL,
        "trend_percent" text DEFAULT '0%',
        "khashna_farmer" integer,
        "khashna_slaughter" integer,
        "khashna_intermediary" integer,
        "motawassita_farmer" integer,
        "motawassita_slaughter" integer,
        "motawassita_intermediary" integer,
        "raqiqa_farmer" integer,
        "raqiqa_slaughter" integer,
        "raqiqa_intermediary" integer,
        "updated_at" timestamp DEFAULT now()
      );
      ALTER TABLE "official_prices" ALTER COLUMN "khashna_farmer" DROP NOT NULL;
      ALTER TABLE "official_prices" ALTER COLUMN "khashna_slaughter" DROP NOT NULL;
      ALTER TABLE "official_prices" ALTER COLUMN "khashna_intermediary" DROP NOT NULL;
      ALTER TABLE "official_prices" ALTER COLUMN "motawassita_farmer" DROP NOT NULL;
      ALTER TABLE "official_prices" ALTER COLUMN "motawassita_slaughter" DROP NOT NULL;
      ALTER TABLE "official_prices" ALTER COLUMN "motawassita_intermediary" DROP NOT NULL;
      ALTER TABLE "official_prices" ALTER COLUMN "raqiqa_farmer" DROP NOT NULL;
      ALTER TABLE "official_prices" ALTER COLUMN "raqiqa_slaughter" DROP NOT NULL;
      ALTER TABLE "official_prices" ALTER COLUMN "raqiqa_intermediary" DROP NOT NULL;
    `);

    // 2. b2b_companies
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "b2b_companies" (
        "id" serial PRIMARY KEY NOT NULL,
        "name_ar" text NOT NULL,
        "name_fr" text NOT NULL,
        "type" text DEFAULT 'farm' NOT NULL,
        "wilaya_code" text NOT NULL,
        "wilaya_name" text NOT NULL,
        "commune" text NOT NULL,
        "address" text NOT NULL,
        "phone" text NOT NULL,
        "email" text NOT NULL,
        "capacity" text NOT NULL,
        "certifications" text NOT NULL,
        "verified" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now()
      );
    `);

    // 3. market_offers
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "market_offers" (
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
        "verified" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now()
      );
    `);

    // 4. workers
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "workers" (
        "id" serial PRIMARY KEY NOT NULL,
        "full_name" text NOT NULL,
        "specialty" text DEFAULT 'poultry_worker' NOT NULL,
        "wilaya_code" text NOT NULL,
        "wilaya_name" text NOT NULL,
        "experience_years" integer DEFAULT 1 NOT NULL,
        "willing_to_relocate" boolean DEFAULT true NOT NULL,
        "phone" text NOT NULL,
        "bio" text NOT NULL,
        "available_now" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now()
      );
    `);

    // 5. jobs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "jobs" (
        "id" serial PRIMARY KEY NOT NULL,
        "title_ar" text NOT NULL,
        "company_name" text NOT NULL,
        "company_type" text DEFAULT 'farm' NOT NULL,
        "wilaya_code" text NOT NULL,
        "wilaya_name" text NOT NULL,
        "commune" text NOT NULL,
        "job_type" text DEFAULT 'full_time' NOT NULL,
        "salary_range" text NOT NULL,
        "housing_provided" boolean DEFAULT true NOT NULL,
        "requirements" text NOT NULL,
        "contact_phone" text NOT NULL,
        "contact_email" text,
        "status" text DEFAULT 'open' NOT NULL,
        "created_at" timestamp DEFAULT now()
      );
    `);

    // 6. price_reports
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "price_reports" (
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
        "notes_ar" text,
        "trend" text DEFAULT 'stable',
        "created_at" timestamp DEFAULT now()
      );
    `);

    // 7. poultry_prices
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "poultry_prices" (
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
    `);

    console.log('✅ All Supabase tables successfully synchronized!');
  } catch (err: any) {
    console.error('Error synchronizing database tables:', err.message);
  } finally {
    await pool.end();
  }
}

syncSupabase();
