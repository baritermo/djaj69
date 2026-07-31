import { NextResponse } from 'next/server';
import { pool, db } from '@/db/index';
import { poultryPrices, wilayas, officialPrices } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { seedDatabase } from '@/db/seed';

async function ensureTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "official_prices" (
        "wilaya_code" text PRIMARY KEY NOT NULL,
        "name_ar" text NOT NULL,
        "name_fr" text NOT NULL,
        "region" text NOT NULL,
        "trend" text DEFAULT 'stable' NOT NULL,
        "trend_percent" text DEFAULT '0%',
        "khashna_farmer" integer DEFAULT 300 NOT NULL,
        "khashna_slaughter" integer DEFAULT 290 NOT NULL,
        "khashna_intermediary" integer DEFAULT 310 NOT NULL,
        "motawassita_farmer" integer DEFAULT 290 NOT NULL,
        "motawassita_slaughter" integer DEFAULT 280 NOT NULL,
        "motawassita_intermediary" integer DEFAULT 300 NOT NULL,
        "raqiqa_farmer" integer DEFAULT 280 NOT NULL,
        "raqiqa_slaughter" integer DEFAULT 270 NOT NULL,
        "raqiqa_intermediary" integer DEFAULT 290 NOT NULL,
        "updated_at" timestamp DEFAULT now()
      );
    `);
  } catch (e) {
    // Ignore if table already exists
  }
}

export async function GET(request: Request) {
  try {
    await ensureTables();
    let officialList = await db.select().from(officialPrices);
    if (officialList.length === 0) {
      await seedDatabase();
      officialList = await db.select().from(officialPrices);
    }

    const historicalPrices = await db.select().from(poultryPrices).orderBy(desc(poultryPrices.id)).limit(300);

    return NextResponse.json({
      status: 'success',
      officialPrices: officialList,
      prices: historicalPrices,
      count: officialList.length,
    });
  } catch (error: any) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureTables();
    const body = await request.json();

    const sanitizeInt = (val: any, fallback = 0) => {
      const num = Number(val);
      return isNaN(num) ? fallback : Math.round(num);
    };

    if (Array.isArray(body)) {
      const firstItem = body[0] || {};
      const targetWilayaCode = String(firstItem.wilayaCode || '16').padStart(2, '0');
      const trend = firstItem.trend || 'stable';

      const khashnaItem = body.find((b: any) => b.category === 'خشنة') || {};
      const motawassitaItem = body.find((b: any) => b.category === 'متوسطة') || {};
      const raqiqaItem = body.find((b: any) => b.category === 'رقيقة') || {};

      const khashnaFarmer = sanitizeInt(khashnaItem.farmerPrice, 320);
      const khashnaSlaughter = sanitizeInt(khashnaItem.slaughterPrice, 310);
      const khashnaIntermediary = sanitizeInt(khashnaItem.intermediaryPrice, 330);

      const motawassitaFarmer = sanitizeInt(motawassitaItem.farmerPrice, 300);
      const motawassitaSlaughter = sanitizeInt(motawassitaItem.slaughterPrice, 290);
      const motawassitaIntermediary = sanitizeInt(motawassitaItem.intermediaryPrice, 310);

      const raqiqaFarmer = sanitizeInt(raqiqaItem.farmerPrice, 280);
      const raqiqaSlaughter = sanitizeInt(raqiqaItem.slaughterPrice, 270);
      const raqiqaIntermediary = sanitizeInt(raqiqaItem.intermediaryPrice, 290);

      // Fast direct UPDATE query on the 58 fixed wilayas table
      await db
        .update(officialPrices)
        .set({
          khashnaFarmer,
          khashnaSlaughter,
          khashnaIntermediary,
          motawassitaFarmer,
          motawassitaSlaughter,
          motawassitaIntermediary,
          raqiqaFarmer,
          raqiqaSlaughter,
          raqiqaIntermediary,
          trend,
          updatedAt: new Date(),
        })
        .where(eq(officialPrices.wilayaCode, targetWilayaCode));

      return NextResponse.json({ status: 'success', wilayaCode: targetWilayaCode });
    }

    const targetWilayaCode = String(body.wilayaCode || '16').padStart(2, '0');
    const farmerPrice = sanitizeInt(body.farmerPrice, 300);

    await db
      .update(officialPrices)
      .set({
        motawassitaFarmer: farmerPrice,
        motawassitaSlaughter: body.slaughterPrice !== undefined ? sanitizeInt(body.slaughterPrice, farmerPrice - 10) : farmerPrice - 10,
        motawassitaIntermediary: body.intermediaryPrice !== undefined ? sanitizeInt(body.intermediaryPrice, farmerPrice + 10) : farmerPrice + 10,
        trend: body.trend || 'stable',
        updatedAt: new Date(),
      })
      .where(eq(officialPrices.wilayaCode, targetWilayaCode));

    return NextResponse.json({ status: 'success', wilayaCode: targetWilayaCode });
  } catch (error: any) {
    console.error('Error updating official price:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'فشل تحديث أسعار الولاية' },
      { status: 500 }
    );
  }
}
