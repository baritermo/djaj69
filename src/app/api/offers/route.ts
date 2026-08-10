import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { marketOffers } from '@/db/schema';
import { getWilayaByCode } from '@/lib/algeria-data';

import { pool } from '@/db/index';

async function ensureTables() {
  try {
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
        "farmer_price" integer,
        "details" text,
        "buy_khashna" integer,
        "buy_motawassita" integer,
        "buy_raqiqa" integer,
        "max_purchase_kg" text,
        "delivery_area" text,
        "buying_details" text,
        "verified" boolean DEFAULT true NOT NULL,
        "is_bot_generated" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now()
      );
      ALTER TABLE "market_offers" ADD COLUMN IF NOT EXISTS "farmer_price" integer;
      ALTER TABLE "market_offers" ADD COLUMN IF NOT EXISTS "is_bot_generated" boolean DEFAULT false;
    `);
  } catch (e) {}
}

export async function GET(request: Request) {
  try {
    await ensureTables();

    // Auto-Cleanup: Delete expired offers older than 48 hours to preserve active daily offers safely
    try {
      await pool.query(`DELETE FROM "market_offers" WHERE "created_at" < NOW() - INTERVAL '48 hours'`);
    } catch (e) {}

    const { searchParams } = new URL(request.url);
    const offerType = searchParams.get('offerType');
    const wilayaCode = searchParams.get('wilayaCode');

    const conditions: any[] = [];
    if (offerType && offerType !== 'all') {
      conditions.push(eq(marketOffers.offerType, offerType));
    }
    if (wilayaCode && wilayaCode !== 'all') {
      conditions.push(eq(marketOffers.wilayaCode, wilayaCode));
    }

    const offers = await db
      .select()
      .from(marketOffers)
      .where(and(...conditions))
      .orderBy(desc(marketOffers.createdAt));

    return NextResponse.json({ status: 'success', offers });
  } catch (error: any) {
    console.warn('Offers fetch error:', error.message);
    return NextResponse.json({ status: 'success', offers: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { offerType, name, wilayaCode, commune, phone, chickenCategories, weightRange, availableQuantity, breedType, farmAcreage, chickenAge, farmerPrice, details, buyKhashna, buyMotawassita, buyRaqiqa, maxPurchaseKg, deliveryArea, buyingDetails, isBotGenerated, isBot } = body;

    if (!offerType || !name || !wilayaCode || !phone) {
      return NextResponse.json({ status: 'error', message: 'يرجى إكمال جميع الحقول المطلوبة.' }, { status: 400 });
    }

    if (!['farmer', 'slaughterhouse', 'broker'].includes(offerType)) {
      return NextResponse.json({ status: 'error', message: 'نوع العرض غير صالح.' }, { status: 400 });
    }

    const isBotPost = isBotGenerated === true || isBot === true;

    // Rate Limit for Real Users: Max 3 posts per calendar day (اليوم نفسه)
    if (!isBotPost) {
      const userTodayOffersRes = await pool.query(
        `SELECT id FROM "market_offers" WHERE "phone" = $1 AND "created_at" >= CURRENT_DATE`,
        [phone]
      );

      if (userTodayOffersRes.rows.length >= 3) {
        return NextResponse.json(
          {
            status: 'error',
            message: '🛑 لقد تجاوزت الحد اليومي المسموح به للنشر (3 عروض في اليوم نفسه). يرجى الانتظار لليوم التالي أو التواصل مع إدارة البورصة.',
          },
          { status: 400 }
        );
      }
    }

    const wilaya = getWilayaByCode(wilayaCode);

    const [created] = await db
      .insert(marketOffers)
      .values({
        offerType,
        name,
        wilayaCode,
        wilayaName: wilaya?.nameAr || `الولاية ${wilayaCode}`,
        commune: commune || wilaya?.nameAr || '',
        phone: isBotPost ? '🔒 رقم الهاتف مخفي بناءً على رغبة الناشر' : phone,
        chickenCategories: chickenCategories || null,
        weightRange: weightRange || null,
        availableQuantity: availableQuantity || null,
        breedType: breedType || null,
        farmAcreage: farmAcreage || null,
        chickenAge: chickenAge || null,
        farmerPrice: farmerPrice ? Number(farmerPrice) : null,
        details: details || null,
        buyKhashna: buyKhashna ? Number(buyKhashna) : null,
        buyMotawassita: buyMotawassita ? Number(buyMotawassita) : null,
        buyRaqiqa: buyRaqiqa ? Number(buyRaqiqa) : null,
        maxPurchaseKg: maxPurchaseKg || null,
        deliveryArea: deliveryArea || null,
        buyingDetails: buyingDetails || null,
        verified: true,
        isBotGenerated: isBotPost,
      })
      .returning();

    return NextResponse.json({ status: 'success', offer: created });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ status: 'error', message: 'معرف العرض مطلوب' }, { status: 400 });
    }
    await db.delete(marketOffers).where(eq(marketOffers.id, Number(id)));
    return NextResponse.json({ status: 'success', id: Number(id) });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
