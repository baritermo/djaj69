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
        "hide_phone" boolean DEFAULT false,
        "images" text,
        "details" text,
        "delivery_available" boolean DEFAULT false,
        "verified" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now()
      );
      ALTER TABLE "unified_b2b_offers" ADD COLUMN IF NOT EXISTS "hide_phone" boolean DEFAULT false;
    `);

    // Fix any existing offers that have empty or missing images
    await pool.query(`
      UPDATE "unified_b2b_offers"
      SET "images" = '["https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&auto=format&fit=crop&q=80"]'
      WHERE ("images" IS NULL OR "images" = '[]' OR "images" = '' OR "images" = '[""]') AND "offer_category" = 'poultry';

      UPDATE "unified_b2b_offers"
      SET "images" = '["https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=600&auto=format&fit=crop&q=80"]'
      WHERE ("images" IS NULL OR "images" = '[]' OR "images" = '' OR "images" = '[""]') AND "offer_category" = 'livestock';

      UPDATE "unified_b2b_offers"
      SET "images" = '["https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&auto=format&fit=crop&q=80"]'
      WHERE ("images" IS NULL OR "images" = '[]' OR "images" = '' OR "images" = '[""]') AND "offer_category" = 'equipment';

      UPDATE "unified_b2b_offers"
      SET "images" = '["https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80"]'
      WHERE ("images" IS NULL OR "images" = '[]' OR "images" = '' OR "images" = '[""]') AND "offer_category" = 'feed';

      UPDATE "unified_b2b_offers"
      SET "images" = '["https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80"]'
      WHERE ("images" IS NULL OR "images" = '[]' OR "images" = '' OR "images" = '[""]') AND ("offer_category" = 'services' OR "offer_category" IS NULL);
    `);

    // Check if table has fewer than 6 offers to insert the full rich set
    const checkCount = await pool.query('SELECT COUNT(*) FROM "unified_b2b_offers"');
    if (parseInt(checkCount.rows[0].count, 10) < 6) {
      await pool.query(`
        INSERT INTO "unified_b2b_offers" 
        ("offer_category", "intent_type", "title", "item_type", "brand_or_breed", "item_condition", "quantity", "price", "price_unit", "wilaya_code", "wilaya_name", "commune", "publisher_name", "phone", "hide_phone", "images", "details", "delivery_available", "verified")
        VALUES 
        (
          'poultry', 'sell', 'دجاج لحم حي سلالة كب 500 وزن متوسط 2.5 كغ — دفعة 2500 دجاجة', 'دجاج لحم', 'Cobb 500', 'live', '2500', 380, 'كغ',
          '19', 'سطيف', 'العلمة', 'مزرعة الهضاب لتربية الدواجن', '0550112233', true,
          '["https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&auto=format&fit=crop&q=80"]',
          'دجاج لحم بصحة ممتازة ورعاية بيطرية كاملة. الوزن بين 2.3 إلى 2.7 كغ. جاهز للتحميل والبيع المباشر. تم إخفاء الرقم، المعاملة حصراً عبر وسيط المنصة الآمن لحماية حقوق الطرفين.',
          true, true
        ),
        (
          'livestock', 'sell', 'خرفان وحولي سلالة أولاد جلال حرة للعيد والتسمين', 'حولي', 'أولاد جلال', 'live', '45', 59000, 'رأس',
          '17', 'الجلفة', 'عين وسارة', 'حاج بلقاسم مربي مواشي السهوب', '0661445566', true,
          '["https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=600&auto=format&fit=crop&q=80"]',
          'دفعة ممتازة من كباش وحولي أولاد جلال أصيلة عمر 6 إلى 8 أشهر، معلوفة شعير وتبن، خالية من كافة الأمراض. الشراء والمعاينة متوفرة عبر وسيط المنصة (بريدي موب).',
          true, true
        ),
        (
          'equipment', 'sell', 'مفقسة أوتوماتيكية ذكية سعة 5,280 بيضة بنظام تقليب وتحكم رقمي', 'مفقسة', 'Smart Hatch', 'new', '3', 320000, 'قطعة',
          '16', 'الجزائر', 'الرويبة', 'الشركة الوطنية لعتاد الدواجن', '0770889900', true,
          '["https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&auto=format&fit=crop&q=80"]',
          'حاضنة ومفقسة جديدة كلياً بنظام تحكم ذكي في الرطوبة والحرارة مع إنذار أوتوماتيكي ومولد طاقة احتياطي. التوصيل متوفر لـ 58 ولاية، الطلب حصراً عبر وسيط المنصة.',
          true, true
        ),
        (
          'feed', 'sell', 'ذرة صفراء مجروشة مستوردة نوعية ممتازة + كسبة صويا 48%', 'ذرة وصويا', 'مستورد', 'fresh', '20 طن', 7400, 'قنطار',
          '31', 'وهران', 'السانية', 'مستودعات الغرب لتجارة الأعلاف', '0540667788', true,
          '["https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80"]',
          'أعلاف ومواد خام مستوردة خالية من الرطوبة والشوائب، معبأة في أكياس 50 كغ. متوفر كميات كبيرة لشاحنات نصف مقطورة. الدفع الآمن محمي عبر بريدي موب.',
          true, true
        ),
        (
          'poultry', 'sell', 'صوص دجاج بياض عمر يوم واحد سلالة لوهمان براون Lohmann Brown', 'صوص بياض', 'Lohmann', 'live', '5000', 185, 'كتكوت',
          '26', 'المدية', 'البرواقية', 'مفرخة الأطلس النموذجية', '0555332211', false,
          '["https://images.unsplash.com/photo-1563281577-a7be47e20db9?w=600&auto=format&fit=crop&q=80"]',
          'كتاكيت بيضاء وبنية سلالة أصلية عالية الإنتاجية للبيض، ملقحة بالماريك والنيوكاسل، تسليم أسبوعي منتظم.',
          false, true
        ),
        (
          'services', 'sell', 'شاحنة نقل كبرى مجهزة لنقل الدواجن الحية بين الولايات 58 ولاية', 'نقل دواجن', 'ISUZU', 'used', '1', 18000, 'رحلة',
          '28', 'المسيلة', 'بوسعادة', 'مؤسسة النقل الفلاحي السريع', '0660113355', true,
          '["https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80"]',
          'خدمة نقل الدواجن والبيض على مدار 24 ساعة بتهوية كاملة وأقفاص معقمة لتقليل نسبة النفوق أثناء السفر. التواصل وحجز الرحلة عبر وسيط المنصة.',
          true, true
        );
      `);
    }
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
        "hide_phone" AS "hidePhone",
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
      hidePhone,
      images, // array of image base64 strings or URLs (up to 20)
      details,
      deliveryAvailable,
    } = body;

    if (!title || price === undefined || price === null || !offerCategory) {
      return NextResponse.json(
        { status: 'error', message: 'يرجى تحديد الفئة، اسم الإعلان، والسعر على الأقل.' },
        { status: 400 }
      );
    }

    const finalWilayaCode = wilayaCode ? String(wilayaCode).padStart(2, '0') : '16';
    const wilaya = getWilayaByCode(finalWilayaCode);
    const wilayaName = wilaya?.nameAr || `الولاية ${finalWilayaCode}`;
    const finalPublisherName = publisherName?.trim() || 'فلاح / تاجر';
    const finalPhone = phone?.trim() || '0550000000';

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
        price: Number(price) || 0,
        priceUnit: priceUnit || 'د.ج',
        wilayaCode: finalWilayaCode,
        wilayaName,
        commune: commune || wilayaName,
        publisherName: finalPublisherName,
        phone: finalPhone,
        hidePhone: Boolean(hidePhone),
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
