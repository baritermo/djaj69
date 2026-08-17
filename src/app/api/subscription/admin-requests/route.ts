import { NextResponse } from 'next/server';
import { pool } from '@/db/index';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function ensureTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY NOT NULL,
        "full_name" text NOT NULL,
        "phone" text UNIQUE NOT NULL,
        "password" text NOT NULL,
        "role" text DEFAULT 'farmer' NOT NULL,
        "subscription_status" text DEFAULT 'none' NOT NULL,
        "subscription_date" timestamp,
        "wilaya_code" text NOT NULL,
        "commune" text,
        "receipt_url" text,
        "id_card_url" text,
        "rejection_reason" text,
        "created_at" timestamp DEFAULT now()
      );
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_status" text DEFAULT 'none';
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_date" timestamp;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "receipt_url" text;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "id_card_url" text;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "rejection_reason" text;
    `);
  } catch (e) {}
}

export async function GET() {
  try {
    await ensureTables();
    const res = await pool.query(`
      SELECT 
        "id",
        "full_name" AS "fullName",
        "phone",
        "password",
        "role",
        "subscription_status" AS "subscriptionStatus",
        "subscription_date" AS "subscriptionDate",
        "wilaya_code" AS "wilayaCode",
        "commune",
        "receipt_url" AS "receiptUrl",
        "id_card_url" AS "idCardUrl",
        "rejection_reason" AS "rejectionReason",
        "created_at" AS "createdAt"
      FROM "users"
      ORDER BY "id" DESC
    `);

    const allUsers = res.rows || [];

    // Also get platform mode
    const modeRes = await pool.query(
      `SELECT "value" FROM "platform_settings" WHERE "key" = 'platform_access_mode' LIMIT 1`
    );
    const platformMode = modeRes.rows?.[0]?.value || 'free';

    return NextResponse.json({
      status: 'success',
      requests: allUsers,
      platformMode,
    });
  } catch (error: any) {
    console.error('Fetch admin subscription requests error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'خطأ أثناء جلب طلبات الاشتراك' },
      { status: 500 }
    );
  }
}
