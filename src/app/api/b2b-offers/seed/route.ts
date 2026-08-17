import { NextResponse } from 'next/server';
import { pool } from '@/db/index';

const SEED_OFFERS = [
  {
    offerCategory: 'poultry',
    intentType: 'sell',
    title: 'دجاج لحم حي سلالة كب 500 وزن متوسط 2.5 كغ — دفعة 2500 دجاجة',
    itemType: 'دجاج لحم',
    brandOrBreed: 'Cobb 500',
    itemCondition: 'live',
    quantity: '2500',
    price: 380,
    priceUnit: 'كغ',
    wilayaCode: '19',
    wilayaName: 'سطيف',
    commune: 'العلمة',
    publisherName: 'مزرعة الهضاب لتربية الدواجن',
    phone: '0550112233',
    hidePhone: true,
    images: JSON.stringify(['https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80']),
    details: 'دجاج لحم بصحة ممتازة ورعاية بيطرية كاملة. الوزن بين 2.3 إلى 2.7 كغ. جاهز للتحميل والبيع المباشر. تم إخفاء الرقم، المعاملة حصراً عبر وسيط المنصة الآمن لحماية حقوق الطرفين.',
    deliveryAvailable: true,
    verified: true,
  },
  {
    offerCategory: 'livestock',
    intentType: 'sell',
    title: 'خرفان وحولي سلالة أولاد جلال حرة للعيد والتسمين',
    itemType: 'حولي',
    brandOrBreed: 'أولاد جلال',
    itemCondition: 'live',
    quantity: '45',
    price: 59000,
    priceUnit: 'رأس',
    wilayaCode: '17',
    wilayaName: 'الجلفة',
    commune: 'عين وسارة',
    publisherName: 'حاج بلقاسم مربي مواشي السهوب',
    phone: '0661445566',
    hidePhone: true,
    images: JSON.stringify(['https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=800&q=80']),
    details: 'دفعة ممتازة من كباش وحولي أولاد جلال أصيلة عمر 6 إلى 8 أشهر، معلوفة شعير وتبن، خالية من كافة الأمراض. الشراء والمعاينة متوفرة عبر وسيط المنصة (بريدي موب).',
    deliveryAvailable: true,
    verified: true,
  },
  {
    offerCategory: 'equipment',
    intentType: 'sell',
    title: 'مفقسة أوتوماتيكية ذكية سعة 5,280 بيضة بنظام تقليب وتحكم رقمي',
    itemType: 'مفقسة',
    brandOrBreed: 'Smart Hatch',
    itemCondition: 'new',
    quantity: '3',
    price: 320000,
    priceUnit: 'قطعة',
    wilayaCode: '16',
    wilayaName: 'الجزائر',
    commune: 'الرويبة',
    publisherName: 'الشركة الوطنية لعتاد الدواجن',
    phone: '0770889900',
    hidePhone: true,
    images: JSON.stringify(['https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80']),
    details: 'حاضنة ومفقسة جديدة كلياً بنظام تحكم ذكي في الرطوبة والحرارة مع إنذار أوتوماتيكي ومولد طاقة احتياطي. التوصيل متوفر لـ 58 ولاية، الطلب حصراً عبر وسيط المنصة.',
    deliveryAvailable: true,
    verified: true,
  },
  {
    offerCategory: 'feed',
    intentType: 'sell',
    title: 'ذرة صفراء مجروشة مستوردة نوعية ممتازة + كسبة صويا 48%',
    itemType: 'ذرة وصويا',
    brandOrBreed: 'مستورد',
    itemCondition: 'fresh',
    quantity: '20 طن',
    price: 7400,
    priceUnit: 'قنطار',
    wilayaCode: '31',
    wilayaName: 'وهران',
    commune: 'السانية',
    publisherName: 'مستودعات الغرب لتجارة الأعلاف',
    phone: '0540667788',
    hidePhone: true,
    images: JSON.stringify(['https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80']),
    details: 'أعلاف ومواد خام مستوردة خالية من الرطوبة والشوائب، معبأة في أكياس 50 كغ. متوفر كميات كبيرة لشاحنات نصف مقطورة. الدفع الآمن محمي عبر بريدي موب.',
    deliveryAvailable: true,
    verified: true,
  },
  {
    offerCategory: 'poultry',
    intentType: 'sell',
    title: 'صوص دجاج بياض عمر يوم واحد سلالة لوهمان براون Lohmann Brown',
    itemType: 'صوص بياض',
    brandOrBreed: 'Lohmann',
    itemCondition: 'live',
    quantity: '5000',
    price: 185,
    priceUnit: 'كتكوت',
    wilayaCode: '26',
    wilayaName: 'المدية',
    commune: 'البرواقية',
    publisherName: 'مفرخة الأطلس النموذجية',
    phone: '0555332211',
    hidePhone: false,
    images: JSON.stringify(['https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&w=800&q=80']),
    details: 'كتاكيت بيضاء وبنية سلالة أصلية عالية الإنتاجية للبيض، ملقحة بالماريك والنيوكاسل، تسليم أسبوعي منتظم.',
    deliveryAvailable: false,
    verified: true,
  },
  {
    offerCategory: 'services',
    intentType: 'sell',
    title: 'شاحنة نقل كبرى مجهزة لنقل الدواجن الحية بين الولايات 58 ولاية',
    itemType: 'نقل دواجن',
    brandOrBreed: 'ISUZU',
    itemCondition: 'used',
    quantity: '1',
    price: 18000,
    priceUnit: 'رحلة',
    wilayaCode: '28',
    wilayaName: 'المسيلة',
    commune: 'بوسعادة',
    publisherName: 'مؤسسة النقل الفلاحي السريع',
    phone: '0660113355',
    hidePhone: true,
    images: JSON.stringify(['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80']),
    details: 'خدمة نقل الدواجن والبيض على مدار 24 ساعة بتهوية كاملة وأقفاص معقمة لتقليل نسبة النفوق أثناء السفر. التواصل وحجز الرحلة عبر وسيط المنصة.',
    deliveryAvailable: true,
    verified: true,
  },
];

export async function GET() {
  try {
    // 1. Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "unified_b2b_offers" (
        "id" serial PRIMARY KEY NOT NULL,
        "offer_category" text NOT NULL,
        "intent_type" text NOT NULL,
        "title" text NOT NULL,
        "item_type" text,
        "brand_or_breed" text,
        "item_condition" text,
        "quantity" text,
        "price" numeric,
        "price_unit" text,
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
    `);

    // 2. Ensure hide_phone column
    try {
      await pool.query(`ALTER TABLE "unified_b2b_offers" ADD COLUMN IF NOT EXISTS "hide_phone" boolean DEFAULT false;`);
    } catch {}

    // 3. Clear existing seed items if needed to prevent duplicates
    await pool.query(`
      DELETE FROM "unified_b2b_offers" 
      WHERE "publisher_name" IN (
        'مزرعة الهضاب لتربية الدواجن',
        'حاج بلقاسم مربي مواشي السهوب',
        'الشركة الوطنية لعتاد الدواجن',
        'مستودعات الغرب لتجارة الأعلاف',
        'مفرخة الأطلس النموذجية',
        'مؤسسة النقل الفلاحي السريع'
      )
    `);

    // 4. Insert all seed offers
    let insertedCount = 0;
    for (const item of SEED_OFFERS) {
      await pool.query(
        `
        INSERT INTO "unified_b2b_offers" 
        ("offer_category", "intent_type", "title", "item_type", "brand_or_breed", "item_condition", "quantity", "price", "price_unit", "wilaya_code", "wilaya_name", "commune", "publisher_name", "phone", "hide_phone", "images", "details", "delivery_available", "verified")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      `,
        [
          item.offerCategory,
          item.intentType,
          item.title,
          item.itemType,
          item.brandOrBreed,
          item.itemCondition,
          item.quantity,
          item.price,
          item.priceUnit,
          item.wilayaCode,
          item.wilayaName,
          item.commune,
          item.publisherName,
          item.phone,
          item.hidePhone,
          item.images,
          item.details,
          item.deliveryAvailable,
          item.verified,
        ]
      );
      insertedCount++;
    }

    const totalInDb = await pool.query('SELECT COUNT(*) FROM "unified_b2b_offers"');

    return NextResponse.json({
      status: 'success',
      message: '✅ تم بنجاح حقن وتثبيت جميع العروض النموذجية بالصور وأرقام الهواتف المخفية في قاعدة البيانات مباشرة!',
      insertedCount,
      totalInDb: totalInDb.rows[0].count,
    });
  } catch (error: any) {
    console.error('Seed offers error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'فشل إدخال البيانات في قاعدة البيانات' },
      { status: 500 }
    );
  }
}
