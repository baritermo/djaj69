import 'dotenv/config';
import { pool, db } from './index';
import { seedDatabase } from './seed';

async function setup() {
  console.log('⏳ Starting Database Setup & Migration...');
  try {
    // Drop outdated wilayas table if missing required 'code' column
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wilayas') THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wilayas' AND column_name = 'code') THEN
            DROP TABLE "wilayas" CASCADE;
          END IF;
        END IF;
      END $$;
    `);

    // 1. Create tables if they do not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY NOT NULL,
        "full_name" text NOT NULL,
        "phone" text NOT NULL UNIQUE,
        "password" text NOT NULL,
        "role" text DEFAULT 'farmer' NOT NULL,
        "wilaya_code" text,
        "commune" text,
        "subscription_status" text DEFAULT 'none' NOT NULL,
        "receipt_url" text,
        "id_card_url" text,
        "rejection_reason" text,
        "subscription_date" timestamp,
        "created_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "wilayas" (
        "id" serial PRIMARY KEY NOT NULL,
        "code" text NOT NULL UNIQUE,
        "name_ar" text NOT NULL,
        "name_fr" text NOT NULL,
        "region" text NOT NULL,
        "active_farms_count" integer DEFAULT 0,
        "slaughterhouses_count" integer DEFAULT 0
      );

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
        "notes" text,
        "verified" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now()
      );

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
        "verified" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "b2b_companies" (
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

      CREATE TABLE IF NOT EXISTS "jobs" (
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

      CREATE TABLE IF NOT EXISTS "workers" (
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

      CREATE TABLE IF NOT EXISTS "unified_b2b_offers" (
        "id" serial PRIMARY KEY NOT NULL,
        "offer_category" text NOT NULL,
        "intent_type" text DEFAULT 'sell' NOT NULL,
        "title" text NOT NULL,
        "item_type" text,
        "brand_or_breed" text,
        "item_condition" text DEFAULT 'live',
        "quantity" text,
        "price" integer NOT NULL,
        "price_unit" text DEFAULT 'رأس',
        "wilaya_code" text NOT NULL,
        "wilaya_name" text NOT NULL,
        "commune" text,
        "publisher_name" text NOT NULL,
        "phone" text NOT NULL,
        "images" text,
        "details" text,
        "delivery_available" boolean DEFAULT false,
        "verified" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "b2b_escrow_requests" (
        "id" serial PRIMARY KEY NOT NULL,
        "offer_id" integer NOT NULL,
        "offer_title" text NOT NULL,
        "buyer_name" text NOT NULL,
        "buyer_phone" text NOT NULL,
        "seller_name" text NOT NULL,
        "seller_phone" text NOT NULL,
        "agreed_price" integer,
        "notes" text,
        "status" text DEFAULT 'pending',
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('✅ All 8 database tables checked/created successfully!');

    // 2. Mux auto-increment sequences if tables exist
    await pool.query(`
      SELECT setval(pg_get_serial_sequence('poultry_prices', 'id'), COALESCE(max(id), 1)) FROM poultry_prices;
      SELECT setval(pg_get_serial_sequence('wilayas', 'id'), COALESCE(max(id), 1)) FROM wilayas;
      SELECT setval(pg_get_serial_sequence('price_reports', 'id'), COALESCE(max(id), 1)) FROM price_reports;
      SELECT setval(pg_get_serial_sequence('market_offers', 'id'), COALESCE(max(id), 1)) FROM market_offers;
      SELECT setval(pg_get_serial_sequence('b2b_companies', 'id'), COALESCE(max(id), 1)) FROM b2b_companies;
      SELECT setval(pg_get_serial_sequence('jobs', 'id'), COALESCE(max(id), 1)) FROM jobs;
      SELECT setval(pg_get_serial_sequence('workers', 'id'), COALESCE(max(id), 1)) FROM workers;
      SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(max(id), 1)) FROM users;
    `).catch(() => {});

    // 3. Wipe any legacy mock seed data (offers, jobs, workers, b2b companies, reports)
    await pool.query(`
      DELETE FROM "market_offers";
      DELETE FROM "b2b_companies";
      DELETE FROM "jobs";
      DELETE FROM "workers";
      DELETE FROM "price_reports";
    `).catch(() => {});

    // 4. Seed initial essential data
    console.log('🌱 Seeding initial database data...');
    await seedDatabase();
    console.log('🎉 Setup completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Setup failed:', err);
    process.exit(1);
  }
}

setup();
