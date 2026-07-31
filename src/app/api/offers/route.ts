import { and, desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { marketOffers } from '@/db/schema';
import { getWilayaByCode } from '@/lib/algeria-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offerType = searchParams.get('offerType');
    const wilayaCode = searchParams.get('wilayaCode');

    const conditions = [];
    if (offerType && offerType !== 'all') {
      conditions.push(eq(marketOffers.offerType, offerType));
    }
    if (wilayaCode && wilayaCode !== 'all') {
      conditions.push(eq(marketOffers.wilayaCode, wilayaCode));
    }

    const offers = conditions.length > 0
      ? await db.select().from(marketOffers).where(and(...conditions)).orderBy(desc(marketOffers.createdAt))
      : await db.select().from(marketOffers).orderBy(desc(marketOffers.createdAt));

    return NextResponse.json({ status: 'success', offers });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { offerType, name, wilayaCode, commune, phone, chickenCategories, weightRange, availableQuantity, breedType, farmAcreage, chickenAge, details, buyKhashna, buyMotawassita, buyRaqiqa, maxPurchaseKg, deliveryArea, buyingDetails } = body;

    if (!offerType || !name || !wilayaCode || !phone) {
      return NextResponse.json({ status: 'error', message: 'يرجى إكمال جميع الحقول المطلوبة.' }, { status: 400 });
    }

    if (!['farmer', 'slaughterhouse', 'broker'].includes(offerType)) {
      return NextResponse.json({ status: 'error', message: 'نوع العرض غير صالح.' }, { status: 400 });
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
        phone,
        chickenCategories: chickenCategories || null,
        weightRange: weightRange || null,
        availableQuantity: availableQuantity || null,
        breedType: breedType || null,
        farmAcreage: farmAcreage || null,
        chickenAge: chickenAge || null,
        details: details || null,
        buyKhashna: buyKhashna ? Number(buyKhashna) : null,
        buyMotawassita: buyMotawassita ? Number(buyMotawassita) : null,
        buyRaqiqa: buyRaqiqa ? Number(buyRaqiqa) : null,
        maxPurchaseKg: maxPurchaseKg || null,
        deliveryArea: deliveryArea || null,
        buyingDetails: buyingDetails || null,
        verified: true,
      })
      .returning();

    return NextResponse.json({ status: 'success', offer: created });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
