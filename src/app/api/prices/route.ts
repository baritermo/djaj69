import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { poultryPrices, wilayas } from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { seedDatabase } from '@/db/seed';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wilayaCode = searchParams.get('wilayaCode');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '500');

    const checkWilayas = await db.select().from(wilayas).limit(1);
    if (checkWilayas.length === 0) {
      await seedDatabase();
    }

    const allWilayas = await db.select().from(wilayas);

    let conditions = [];
    if (wilayaCode && wilayaCode !== 'all') {
      conditions.push(eq(poultryPrices.wilayaCode, wilayaCode));
    }
    if (category && category !== 'all') {
      conditions.push(eq(poultryPrices.category, category));
    }

    const prices = conditions.length > 0
      ? await db
          .select()
          .from(poultryPrices)
          .where(and(...conditions))
          .orderBy(desc(poultryPrices.date), desc(poultryPrices.id))
          .limit(limit)
      : await db
          .select()
          .from(poultryPrices)
          .orderBy(desc(poultryPrices.date), desc(poultryPrices.id))
          .limit(limit);

    const enrichedPrices = prices.map((item) => {
      const wilaya = allWilayas.find((w) => w.code === item.wilayaCode);
      return {
        ...item,
        wilayaNameAr: wilaya?.nameAr || `ولاية ${item.wilayaCode}`,
        wilayaNameFr: wilaya?.nameFr || item.wilayaCode,
        region: wilaya?.region || 'الجزائر',
      };
    });

    return NextResponse.json({
      status: 'success',
      count: enrichedPrices.length,
      wilayas: allWilayas,
      prices: enrichedPrices,
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
    const body = await request.json();

    // If body is an array of price updates
    if (Array.isArray(body)) {
      const insertedList = [];
      for (const item of body) {
        const today = item.date || new Date().toISOString().split('T')[0];
        const [inserted] = await db
          .insert(poultryPrices)
          .values({
            wilayaCode: String(item.wilayaCode),
            date: today,
            category: item.category || 'متوسطة',
            farmerPrice: Number(item.farmerPrice || 0),
            slaughterPrice: Number(item.slaughterPrice || 0),
            intermediaryPrice: Number(item.intermediaryPrice || 0),
            trend: item.trend || 'stable',
            trendChangePercent: String(item.trendChangePercent || '0%'),
            notesAr: item.notesAr || 'تحديث من إدارة المنصة',
            reportedBy: 'إدارة المنصة (صاحب الموقع)',
            status: 'official',
          })
          .returning();
        insertedList.push(inserted);
      }
      return NextResponse.json({ status: 'success', count: insertedList.length, prices: insertedList });
    }

    const {
      wilayaCode,
      date,
      category = 'متوسطة',
      farmerPrice,
      slaughterPrice,
      intermediaryPrice,
      trend = 'stable',
      trendChangePercent = '0%',
      notesAr,
      reportedBy = 'إدارة المنصة (صاحب الموقع)',
    } = body;

    if (!wilayaCode || farmerPrice === undefined) {
      return NextResponse.json(
        { status: 'error', message: 'wilayaCode and farmerPrice are required' },
        { status: 400 }
      );
    }

    const today = date || new Date().toISOString().split('T')[0];

    const [inserted] = await db
      .insert(poultryPrices)
      .values({
        wilayaCode: String(wilayaCode),
        date: today,
        category,
        farmerPrice: Number(farmerPrice),
        slaughterPrice: Number(slaughterPrice || Number(farmerPrice) - 10),
        intermediaryPrice: Number(intermediaryPrice || Number(farmerPrice) + 10),
        trend,
        trendChangePercent: String(trendChangePercent),
        notesAr: notesAr || `تحديث أسعار الدواجن لولاية ${wilayaCode}`,
        reportedBy,
        status: 'official',
      })
      .returning();

    return NextResponse.json({ status: 'success', price: inserted });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
