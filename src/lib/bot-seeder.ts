import { db } from '@/db';
import { marketOffers, officialPrices } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { ALGERIA_WILAYAS, getWilayaByCode } from '@/lib/algeria-data';
import { pool } from '@/db';

// Ensure required tables & columns exist
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
  } catch (e) {
    console.error('ensureTables bot-seeder error:', e);
  }
}

const FIRST_NAMES = [
  'أحمد', 'محمد', 'عبد القادر', 'مصطفى', 'سفيان', 'بوعلام', 'كريم', 'ياسين', 'فاروق', 'حمزة',
  'رشيد', 'سليم', 'عمار', 'رضا', 'أمين', 'خالد', 'زبير', 'بلال', 'عمر', 'هشام',
  'وليد', 'عثمان', 'إسماعيل', 'توفيق', 'سمير', 'زهير', 'عبد السلام', 'شريف', 'حكيم', 'مالك',
  'فتحي', 'إسلام', 'يوسف', 'طاهر', 'منير', 'عادل', 'سامي', 'رفيق', 'فيصل', 'صالح',
  'فؤاد', 'مجيد', 'زكريا', 'شكيب', 'أنيس', 'إلياس', 'حسام', 'حميد', 'نبيل', 'مرزوق',
  'وسيم', 'بشير', 'عبد الحق', 'مراد', 'عنتر', 'بن علي', 'بوزيان', 'مقداد', 'العربي', 'طاهر'
];

const LAST_NAMES = [
  'كوان', 'زروقي', 'بلحاج', 'براهيمي', 'مزياني', 'دراجي', 'بوقرة', 'طاهري', 'عمارة', 'سعدي',
  'بوزيد', 'بلمختار', 'مرابط', 'غانم', 'عثماني', 'تومي', 'سليماني', 'جبار', 'عيادي', 'شريف',
  'قادري', 'بوسالم', 'بلمدني', 'حداد', 'مزهود', 'سعيد', 'عيساوي', 'بلخير', 'بوزيان', 'منصوري',
  'قاسم', 'مرزوق', 'بن عيسى', 'حدادي', 'بوغرة', 'بوجمعة', 'مزغنة', 'بن سالم', 'عاشور', 'يحياوي',
  'مصباحي', 'مدني', 'رحماني', 'بشيري', 'بوعزة', 'مزيان', 'طهراوي', 'رباحي', 'ناصري', 'مسعودي'
];

const FARM_PREFIXES = [
  'مزرعة البركة', 'مزرعة الأمل', 'مزرعة التيسير', 'مزارع الهضاب', 'مزرعة الخير',
  'مزرعة النور', 'مزرعة الواحة', 'مزارع الأوراس', 'مزرعة الصداقة', 'مزرعة الريان',
  'مزارع السهول', 'مزرعة الوفاء', 'مزرعة الفجر', 'مزارع متيجة', 'مزرعة السلام',
  'مزرعة الأفق', 'مزارع الزيبان', 'مزرعة البستان', 'مزرعة النخيل', 'مزارع الحضنة',
  'مزرعة الشهاب', 'مزرعة التضامن', 'مزارع التيطري', 'مزرعة السرور', 'مزرعة النهضة'
];

const BROKER_PREFIXES = [
  'الكورتي', 'الوسيط', 'مكتب الكورتي', 'مكتب الوساطة الفلاحية', 'مكتب التوزيع السريع',
  'الوسيط الفلاحي', 'مكتب الأمانة للتوزيع', 'مكتب النجم للوساطة', 'مكتب الفرسان للجملة',
  'مكتب الوفاق للتوزيع', 'مكتب المدى الفلاحي', 'مكتب الاتحاد الفلاحي', 'مكتب الجودة والتوزيع'
];

const SLAUGHTER_PREFIXES = [
  'مذبح البركة للجملة', 'مذابح الأمل الحديثة', 'مذبح السلام الصناعي', 'مذابح النور الوطنية',
  'مذبح المتيجة العصري', 'مذابح الهضاب الكبرى', 'مذبح الأوراس الصناعي', 'مذابح الواحة لتبريد اللحوم',
  'مذبح التيسير لحوم بيضاء', 'مذابح الحضنة الحديثة', 'مذبح الأفق للصناعات الغذائية', 'مذابح الزيبان للدواجن',
  'مذبح التيطري العصري', 'مذابح الوفاق لتجهيز اللحوم', 'مذبح النجم للحوم البيضاء', 'مذابح الشرق الوطنية',
  'مذبح الغرب العصري', 'مذابح الوسط الصناعية', 'مذبح الفجر للتبريد', 'مذابح السهول للدواجن'
];

// Helper to generate 350+ unique clean human names per category (no "مزرعة", "فلاح", "كورتي", "مذبح")
function generateAccountPools() {
  const farmers: string[] = [];
  const brokers: string[] = [];
  const slaughters: string[] = [];

  // Generate 350 Farmers (Clean Human Names)
  let fIdx = 0;
  while (farmers.length < 350) {
    const fn = FIRST_NAMES[fIdx % FIRST_NAMES.length];
    const ln = LAST_NAMES[(fIdx * 3) % LAST_NAMES.length];
    const name = `${fn} ${ln}`;
    if (!farmers.includes(name)) farmers.push(name);
    fIdx++;
  }

  // Generate 350 Brokers (Clean Human Names)
  let bIdx = 0;
  while (brokers.length < 350) {
    const fn = FIRST_NAMES[(bIdx * 2) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(bIdx * 5) % LAST_NAMES.length];
    const name = `${fn} ${ln}`;
    if (!farmers.includes(name) && !brokers.includes(name)) brokers.push(name);
    bIdx++;
  }

  // Generate 350 Slaughterhouses (Clean Human Names)
  let sIdx = 0;
  while (slaughters.length < 350) {
    const fn = FIRST_NAMES[(sIdx * 4) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(sIdx * 7) % LAST_NAMES.length];
    const name = `${fn} ${ln}`;
    if (!farmers.includes(name) && !brokers.includes(name) && !slaughters.includes(name)) slaughters.push(name);
    sIdx++;
  }

  return { farmers, brokers, slaughters };
}

const { farmers: FARMER_NAMES, brokers: BROKER_NAMES, slaughters: SLAUGHTERHOUSE_NAMES } = generateAccountPools();

// Helper to get random integer between min and max inclusive
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to format quantity with commas
function formatQuantity(num: number): string {
  return `${num.toLocaleString('ar-DZ')} كغ (${num.toLocaleString('ar-DZ')} طير)`;
}

export interface SeedWilayaOptions {
  wilayaCode: string;
  farmerPrice?: number;
  minFarmerPrice?: number;
  maxFarmerPrice?: number;
}

/**
 * Seed 15 realistic offers (5 Farmers, 5 Brokers, 5 Slaughterhouses) for a given Wilaya.
 * Enforces pricing hierarchy, exact quantity ranges, phone privacy, and anti-repeat memory.
 */
export async function seedOffersForWilaya(options: SeedWilayaOptions) {
  await ensureTables();
  const { wilayaCode } = options;
  const minPrice = options.minFarmerPrice ?? options.farmerPrice ?? 280;
  const maxPrice = options.maxFarmerPrice ?? options.farmerPrice ?? minPrice;
  const baseFarmerPrice = Math.round((minPrice + maxPrice) / 2);

  const wilaya = getWilayaByCode(wilayaCode);
  if (!wilaya) {
    throw new Error(`الولاية ذات الرمز ${wilayaCode} غير موجودة.`);
  }

  const hiddenPhone = '🔒 رقم الهاتف غير معلن بطلب من الناشر';

  // 1. Calculate Prices according to Pricing Hierarchy Rule:
  // Farmer Price = Random within [minPrice, maxPrice] for each farmer
  // Broker Buying Price = BaseFarmerPrice - (5 to 10 DA) (Always lower than farmer)
  // Slaughterhouse Buying Price = BaseFarmerPrice - (12 to 18 DA) (Always lower than farmer and broker)

  // 2. Select 5 unique Farmers, 5 unique Brokers, 5 unique Slaughterhouses
  const shuffledFarmers = [...FARMER_NAMES].sort(() => Math.random() - 0.5).slice(0, 5);
  const shuffledBrokers = [...BROKER_NAMES].sort(() => Math.random() - 0.5).slice(0, 5);
  const shuffledSlaughters = [...SLAUGHTERHOUSE_NAMES].sort(() => Math.random() - 0.5).slice(0, 5);

  const selectedAccountNames = [...shuffledFarmers, ...shuffledBrokers, ...shuffledSlaughters];

  // 3. Auto-Cleanup: Remove previous bot-generated offers for these account names across all wilayas
  try {
    for (const accName of selectedAccountNames) {
      await db
        .delete(marketOffers)
        .where(
          and(
            eq(marketOffers.name, accName),
            eq(marketOffers.isBotGenerated, true)
          )
        );
    }
  } catch (e) {
    console.warn('Auto-cleanup previous offers warning:', e);
  }

  const generatedOffers: any[] = [];

  // A. Generate 5 Farmer Offers (🌾)
  // Quantities: 3,000 to 15,000 kg
  const breedOptions = ['Ross 308', 'Cobb 500', 'محلي', 'محلي محسّن'];
  const categoryOptions = ['خشنة', 'متوسطة', 'رقيقة', 'خشنة، متوسطة'];

  for (let i = 0; i < shuffledFarmers.length; i++) {
    const name = shuffledFarmers[i];
    // Distribute farmer prices across the minPrice to maxPrice range if range given
    const pFarmer = minPrice === maxPrice 
      ? minPrice + getRandomInt(-2, 2)
      : getRandomInt(minPrice, maxPrice);
    const qtyNum = getRandomInt(3000, 15000);
    const weightNum = (getRandomInt(20, 27) / 10).toFixed(1);

    const offerData = {
      offerType: 'farmer',
      name,
      wilayaCode: wilaya.code,
      wilayaName: wilaya.nameAr,
      commune: wilaya.nameAr,
      phone: hiddenPhone,
      farmerPrice: pFarmer,
      chickenCategories: categoryOptions[i % categoryOptions.length],
      weightRange: `${weightNum} - ${(parseFloat(weightNum) + 0.4).toFixed(1)} كغ`,
      availableQuantity: formatQuantity(qtyNum),
      breedType: breedOptions[i % breedOptions.length],
      farmAcreage: `${getRandomInt(2, 6)} عنابر × ${getRandomInt(3000, 8000)} م²`,
      chickenAge: `${getRandomInt(38, 46)} يوم`,
      details: `دواجن تسمين ذات صحة ممتازة، ملقحة ومجهزة للاستلام المباشر من المزرعة في ${wilaya.nameAr}.`,
      verified: true,
      isBotGenerated: true,
    };

    generatedOffers.push(offerData);
  }

  // B. Generate 5 Broker Offers (🤝)
  // Quantities: 1,000 to 1,300 kg (Smallest)
  // Prices: P_farmer - (5 to 10 DA)
  for (let i = 0; i < shuffledBrokers.length; i++) {
    const name = shuffledBrokers[i];
    const pMotawassita = baseFarmerPrice - getRandomInt(5, 10);
    const pKhashna = pMotawassita + getRandomInt(5, 10);
    const pRaqiqa = pMotawassita - getRandomInt(5, 10);
    const qtyNum = getRandomInt(1000, 1300);

    const offerData = {
      offerType: 'broker',
      name,
      wilayaCode: wilaya.code,
      wilayaName: wilaya.nameAr,
      commune: wilaya.nameAr,
      phone: hiddenPhone,
      buyKhashna: pKhashna,
      buyMotawassita: pMotawassita,
      buyRaqiqa: pRaqiqa,
      maxPurchaseKg: `${qtyNum.toLocaleString('ar-DZ')} كغ يومياً`,
      deliveryArea: `ولايات ${wilaya.nameAr} والولايات المجاورة`,
      buyingDetails: `شراء وتوزيع كورتي فوري بنقد الاستلام والدفع الحين لحساب المذابح والتجار.`,
      verified: true,
      isBotGenerated: true,
    };

    generatedOffers.push(offerData);
  }

  // C. Generate 5 Slaughterhouse Offers (🔪)
  // Quantities: 6,000 to 24,000 kg (Largest)
  // Prices: P_farmer - (12 to 18 DA) (Always lower than farmer and broker)
  for (let i = 0; i < shuffledSlaughters.length; i++) {
    const name = shuffledSlaughters[i];
    const pMotawassita = baseFarmerPrice - getRandomInt(12, 18);
    const pKhashna = pMotawassita + getRandomInt(5, 10);
    const pRaqiqa = pMotawassita - getRandomInt(5, 10);
    const qtyNum = getRandomInt(6000, 24000);

    const offerData = {
      offerType: 'slaughterhouse',
      name,
      wilayaCode: wilaya.code,
      wilayaName: wilaya.nameAr,
      commune: wilaya.nameAr,
      phone: hiddenPhone,
      buyKhashna: pKhashna,
      buyMotawassita: pMotawassita,
      buyRaqiqa: pRaqiqa,
      maxPurchaseKg: `${qtyNum.toLocaleString('ar-DZ')} كغ يومياً`,
      deliveryArea: `كافة بلديات ولاية ${wilaya.nameAr}`,
      buyingDetails: `ذبح حلال معتمد ومعاينة بيطرية كاملة، دفع سريع عند وزن الحمولات.`,
      verified: true,
      isBotGenerated: true,
    };

    generatedOffers.push(offerData);
  }

  // 4. Batch Insert 15 Offers into DB
  for (const offer of generatedOffers) {
    await db.insert(marketOffers).values(offer);
  }

  // 5. Update Official Price Board for this Wilaya
  try {
    const brokerAvg = baseFarmerPrice - 7;
    const slaughterAvg = baseFarmerPrice - 15;

    await pool.query(
      `
      INSERT INTO "official_prices" ("wilaya_code", "name_ar", "name_fr", "region", "farmer_price", "slaughter_price", "intermediary_price", "trend", "trend_percent", "updated_at")
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'stable', '0%', NOW())
      ON CONFLICT ("wilaya_code")
      DO UPDATE SET
        "farmer_price" = EXCLUDED.farmer_price,
        "slaughter_price" = EXCLUDED.slaughter_price,
        "intermediary_price" = EXCLUDED.intermediary_price,
        "updated_at" = NOW();
    `,
      [wilaya.code, wilaya.nameAr, wilaya.nameFr, wilaya.region, baseFarmerPrice, slaughterAvg, brokerAvg]
    );
  } catch (e) {
    console.warn('Official price board update warning:', e);
  }

  return {
    success: true,
    wilayaCode: wilaya.code,
    wilayaName: wilaya.nameAr,
    farmerPrice: baseFarmerPrice,
    minFarmerPrice: minPrice,
    maxFarmerPrice: maxPrice,
    generatedOffersCount: generatedOffers.length,
  };
}

/**
 * Seed all 58 Wilayas with regional price variations around a base farmer price.
 */
export async function seedAllWilayas(baseFarmerPrice: number) {
  const results = [];
  for (const wilaya of ALGERIA_WILAYAS) {
    // Add regional price variation (e.g. South +10 DA, Central/East/West ± 5 DA)
    let regionOffset = 0;
    if (wilaya.region === 'الجنوب') regionOffset = getRandomInt(8, 15);
    else if (wilaya.region === 'الهضاب العليا') regionOffset = getRandomInt(2, 6);
    else regionOffset = getRandomInt(-4, 4);

    const wilayaFarmerPrice = baseFarmerPrice + regionOffset;
    const res = await seedOffersForWilaya({
      wilayaCode: wilaya.code,
      farmerPrice: wilayaFarmerPrice,
    });
    results.push(res);
  }

  return {
    success: true,
    totalWilayasSeeded: results.length,
    totalOffersGenerated: results.length * 15,
  };
}
