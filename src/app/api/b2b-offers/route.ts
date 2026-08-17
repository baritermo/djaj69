import { NextResponse } from 'next/server';
import { db, pool } from '@/db';
import { unifiedB2bOffers } from '@/db/schema';
import { getWilayaByCode } from '@/lib/algeria-data';
import { eq } from 'drizzle-orm';

async function ensureTable() {
  try {
    await pool.query(`
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
    `);
  } catch (e) {
    console.error('ensureTable error:', e);
  }
}

export async function GET(request: Request) {
  try {
    await ensureTable();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const intentType = searchParams.get('intentType');
    const wilayaCode = searchParams.get('wilayaCode');
    const search = searchParams.get('search');

    let sqlQuery = `
      SELECT 
        "id",
        "offer_category" AS "offerCategory",
        "intent_type" AS "intentType",
        "title",
        "item_type" AS "itemType",
        "brand_or_breed" AS "brandOrBreed",
        "item_condition" AS "itemCondition",
        "quantity",
        "price",
        "price_unit" AS "priceUnit",
        "wilaya_code" AS "wilayaCode",
        "wilaya_name" AS "wilayaName",
        "commune",
        "publisher_name" AS "publisherName",
        "phone",
        "images",
        "details",
        "delivery_available" AS "deliveryAvailable",
        "verified",
        "created_at" AS "createdAt"
      FROM "unified_b2b_offers"
      WHERE 1=1
    `;

    const params: any[] = [];

    if (category && category !== 'all') {
      params.push(category);
      sqlQuery += ` AND "offer_category" = $${params.length}`;
    }

    if (intentType && intentType !== 'all') {
      params.push(intentType);
      sqlQuery += ` AND "intent_type" = $${params.length}`;
    }

    if (wilayaCode && wilayaCode !== 'all') {
      const padded = String(wilayaCode).padStart(2, '0');
      params.push(padded);
      sqlQuery += ` AND "wilaya_code" = $${params.length}`;
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      sqlQuery += ` AND ("title" ILIKE $${params.length} OR "details" ILIKE $${params.length} OR "item_type" ILIKE $${params.length} OR "brand_or_breed" ILIKE $${params.length})`;
    }

    sqlQuery += ` ORDER BY "id" DESC`;

    const res = await pool.query(sqlQuery, params);
    
    // Parse images array safely for each item
    const formattedRows = res.rows.map((row) => {
      let parsedImages: string[] = [];
      if (row.images) {
        try {
          parsedImages = JSON.parse(row.images);
        } catch {
          parsedImages = [row.images];
        }
      }
      return {
        ...row,
        imagesList: parsedImages,
      };
    });

    return NextResponse.json({ status: 'success', offers: formattedRows });
  } catch (error: any) {
    console.error('B2B offers fetch error:', error);
    return NextResponse.json({ status: 'success', offers: [] });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();

    const body = await request.json();
    const {
      offerCategory,
      intentType,
      title,
      itemType,
      brandOrBreed,
      itemCondition,
      quantity,
      price,
      priceUnit,
      wilayaCode,
      commune,
      publisherName,
      phone,
      images, // array of image base64 strings or URLs (up to 20)
      details,
      deliveryAvailable,
    } = body;

    if (!title || !price || !publisherName || !phone || !wilayaCode || !offerCategory) {
      return NextResponse.json(
        { status: 'error', message: 'يرجى ملء جميع الحقول الإجبارية (العنوان، السعر، الفئة، الاسم، الهاتف، والولاية).' },
        { status: 400 }
      );
    }

    const wilaya = getWilayaByCode(wilayaCode);
    const wilayaName = wilaya?.nameAr || `الولاية ${wilayaCode}`;

    let imagesJsonString = '[]';
    if (Array.isArray(images)) {
      // Limit to max 20 images
      const slicedImages = images.slice(0, 20);
      imagesJsonString = JSON.stringify(slicedImages);
    } else if (typeof images === 'string') {
      imagesJsonString = JSON.stringify([images]);
    }

    const [created] = await db
      .insert(unifiedB2bOffers)
      .values({
        offerCategory: offerCategory || 'poultry',
        intentType: intentType || 'sell',
        title: title.trim(),
        itemType: itemType || null,
        brandOrBreed: brandOrBreed || null,
        itemCondition: itemCondition || 'live',
        quantity: quantity || null,
        price: Number(price),
        priceUnit: priceUnit || 'رأس',
        wilayaCode: String(wilayaCode).padStart(2, '0'),
        wilayaName,
        commune: commune || wilayaName,
        publisherName: publisherName.trim(),
        phone: phone.trim(),
        images: imagesJsonString,
        details: details || null,
        deliveryAvailable: Boolean(deliveryAvailable),
        verified: true,
      })
      .returning();

    let parsedImages: string[] = [];
    try {
      parsedImages = JSON.parse(created.images || '[]');
    } catch {
      parsedImages = [];
    }

    return NextResponse.json({
      status: 'success',
      offer: {
        ...created,
        imagesList: parsedImages,
      },
    });
  } catch (error: any) {
    console.error('B2B offer post error:', error);
    return NextResponse.json({ status: 'error', message: error.message || 'حدث خطأ أثناء حفظ الإعلان' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ status: 'error', message: 'معرف الإعلان مطلوب' }, { status: 400 });
    }
    await db.delete(unifiedB2bOffers).where(eq(unifiedB2bOffers.id, Number(id)));
    return NextResponse.json({ status: 'success', id: Number(id) });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
