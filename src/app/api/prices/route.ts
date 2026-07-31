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
  } catch (e) {
    // Ignore if already altered
  }
}

export async function GET(request: Request) {
  try {
    let officialList: any[] = [];
    try {
      officialList = await db.select().from(officialPrices);
      if (officialList.length === 0) {
        await seedDatabase();
        officialList = await db.select().from(officialPrices);
      }
    } catch (e: any) {
      console.warn('officialPrices query failed, self-healing table...', e.message);
      await ensureTables();
      await seedDatabase();
      try {
        officialList = await db.select().from(officialPrices);
      } catch (err) {
        officialList = [];
      }
    }

    let historicalPrices: any[] = [];
    try {
      historicalPrices = await db.select().from(poultryPrices).orderBy(desc(poultryPrices.id)).limit(300);
    } catch (err) {
      historicalPrices = [];
    }

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

    const parsePrice = (val: any) => {
      if (val === null || val === undefined || val === '' || isNaN(Number(val))) return null;
      return Math.round(Number(val));
    };

    const targetWilayaCode = String((Array.isArray(body) ? body[0]?.wilayaCode : body.wilayaCode) || '16').padStart(2, '0');
    const trend = (Array.isArray(body) ? body[0]?.trend : body.trend) || 'stable';

    let farmerPrice: number | null = null;
    let slaughterPrice: number | null = null;
    let intermediaryPrice: number | null = null;

    if (Array.isArray(body)) {
      const fItem = body.find((b: any) => b.farmerPrice !== null && b.farmerPrice !== undefined);
      const sItem = body.find((b: any) => b.slaughterPrice !== null && b.slaughterPrice !== undefined);
      const iItem = body.find((b: any) => b.intermediaryPrice !== null && b.intermediaryPrice !== undefined);

      farmerPrice = parsePrice(fItem?.farmerPrice);
      slaughterPrice = parsePrice(sItem?.slaughterPrice);
      intermediaryPrice = parsePrice(iItem?.intermediaryPrice);
    } else {
      farmerPrice = parsePrice(body.farmerPrice);
      slaughterPrice = parsePrice(body.slaughterPrice);
      intermediaryPrice = parsePrice(body.intermediaryPrice);
    }

    let calculatedTrend = 'stable';
    let calculatedPercent = '0.0%';

    try {
      const [existingRow] = await db
        .select()
        .from(officialPrices)
        .where(eq(officialPrices.wilayaCode, targetWilayaCode))
        .limit(1);

      calculatedTrend = existingRow?.trend || 'stable';
      calculatedPercent = existingRow?.trendPercent || '0.0%';

      const oldPrice = existingRow?.motawassitaFarmer ?? existingRow?.khashnaFarmer;
      const newPrice = farmerPrice !== null ? farmerPrice : (slaughterPrice !== null ? slaughterPrice : intermediaryPrice);

      if (oldPrice && newPrice && oldPrice > 0) {
        const diff = newPrice - oldPrice;
        const pct = Math.abs((diff / oldPrice) * 100);
        if (diff > 0) {
          calculatedTrend = 'up';
          calculatedPercent = `+${pct.toFixed(1)}%`;
        } else if (diff < 0) {
          calculatedTrend = 'down';
          calculatedPercent = `-${pct.toFixed(1)}%`;
        } else {
          calculatedTrend = 'stable';
          calculatedPercent = '0.0%';
        }
      }
    } catch (err) {
      // Safe fallback if trend fetch fails
    }

    await db
      .update(officialPrices)
      .set({
        khashnaFarmer: farmerPrice,
        khashnaSlaughter: slaughterPrice,
        khashnaIntermediary: intermediaryPrice,
        motawassitaFarmer: farmerPrice,
        motawassitaSlaughter: slaughterPrice,
        motawassitaIntermediary: intermediaryPrice,
        raqiqaFarmer: farmerPrice,
        raqiqaSlaughter: slaughterPrice,
        raqiqaIntermediary: intermediaryPrice,
        trend: calculatedTrend,
        trendPercent: calculatedPercent,
        updatedAt: new Date(),
      })
      .where(eq(officialPrices.wilayaCode, targetWilayaCode));

    return NextResponse.json({ status: 'success', wilayaCode: targetWilayaCode, trend: calculatedTrend, trendPercent: calculatedPercent });
  } catch (error: any) {
    console.error('Error updating official price:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'فشل تحديث أسعار الولاية' },
      { status: 500 }
    );
  }
}
