
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';

// 0. Registered Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('farmer'), // farmer | slaughterhouse | broker | b2b | worker | admin
  wilayaCode: text('wilaya_code'),
  commune: text('commune'),
  subscriptionStatus: text('subscription_status').notNull().default('none'), // none | pending | active | rejected
  receiptUrl: text('receipt_url'),
  idCardUrl: text('id_card_url'),
  rejectionReason: text('rejection_reason'),
  subscriptionDate: timestamp('subscription_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 1. Algerian Wilayas
export const wilayas = pgTable('wilayas', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  nameAr: text('name_ar').notNull(),
  nameFr: text('name_fr').notNull(),
  region: text('region').notNull(),
  activeFarmsCount: integer('active_farms_count').default(0),
  slaughterhousesCount: integer('slaughterhouses_count').default(0),
});

// 2. Daily Poultry Prices — الفئة × البائع
export const poultryPrices = pgTable('poultry_prices', {
  id: serial('id').primaryKey(),
  wilayaCode: text('wilaya_code').notNull(),
  date: text('date').notNull(),
  category: text('category').notNull(), // خشنة | متوسطة | رقيقة
  farmerPrice: integer('farmer_price').notNull(),
  slaughterPrice: integer('slaughter_price').notNull(),
  intermediaryPrice: integer('intermediary_price').notNull(),
  trend: text('trend').notNull().default('stable'),
  trendChangePercent: text('trend_change_percent').default('0%'),
  notesAr: text('notes_ar'),
  reportedBy: text('reported_by').default('الغرفة الفلاحية'),
  status: text('status').default('official'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2b. Fixed Official Prices Table for 58 Wilayas (Admin Direct UPDATE)
export const officialPrices = pgTable('official_prices', {
  wilayaCode: text('wilaya_code').primaryKey(),
  nameAr: text('name_ar').notNull(),
  nameFr: text('name_fr').notNull(),
  region: text('region').notNull(),
  trend: text('trend').notNull().default('stable'),
  trendPercent: text('trend_percent').default('0%'),
  farmerPrice: integer('farmer_price'),
  slaughterPrice: integer('slaughter_price'),
  intermediaryPrice: integer('intermediary_price'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. Community price reports
export const priceReports = pgTable('price_reports', {
  id: serial('id').primaryKey(),
  wilayaCode: text('wilaya_code').notNull(),
  wilayaName: text('wilaya_name').notNull(),
  reporterName: text('reporter_name').notNull(),
  reporterRole: text('reporter_role').notNull(),
  phone: text('phone').notNull(),
  khashna_farmer: integer('khashna_farmer'),
  khashna_slaughter: integer('khashna_slaughter'),
  khashna_intermediary: integer('khashna_intermediary'),
  motawassita_farmer: integer('motawassita_farmer'),
  motawassita_slaughter: integer('motawassita_slaughter'),
  motawassita_intermediary: integer('motawassita_intermediary'),
  raqiqa_farmer: integer('raqiqa_farmer'),
  raqiqa_slaughter: integer('raqiqa_slaughter'),
  raqiqa_intermediary: integer('raqiqa_intermediary'),
  notes: text('notes'),
  verified: boolean('verified').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. MARKET OFFERS — منفصلة: الفلاح (بيع) مقابل المذبح/الكورتي (شراء)
//    كل عرض يرتبط بولاية واحدة ولا يختلط مع النوع الآخر.
export const marketOffers = pgTable('market_offers', {
  id: serial('id').primaryKey(),
  // نوع المنشور: الفلاح (يبيع) — المذبح (يشتري) — الكورتي (يشتري)
  offerType: text('offer_type').notNull(), // 'farmer' | 'slaughterhouse' | 'broker'
  // اسم الفلاح / المذبح / الكورتي
  name: text('name').notNull(),
  // الولاية
  wilayaCode: text('wilaya_code').notNull(),
  wilayaName: text('wilaya_name').notNull(),
  commune: text('commune').notNull(),
  // الهاتف للتواصل المباشر
  phone: text('phone').notNull(),
  // --- للفلاح ---
  // فئات الدجاج المتاحة (فلاح يمكنه أن يعلن أكثر من فئة)
  chickenCategories: text('chicken_categories'), // خشنة، متوسطة، رقيقة
  weightRange: text('weight_range'), // مثال: 2.0-2.5 كغ
  availableQuantity: text('available_quantity'), // مثال: 5,000 طير
  breedType: text('breed_type'), // سلالة: Ross 308 ، Cobb 500 ، محلي
  farmAcreage: text('farm_acreage'), // مساحة المزرعة
  chickenAge: text('chicken_age'), // العمر بالأيام
  details: text('details'),
  // --- للمذبح والكورتي (أسعار الشراء لكل فئة) ---
  buyKhashna: integer('buy_khashna'), // سعر شراء الخشنة د.ج/كغ
  buyMotawassita: integer('buy_motawassita'), // سعر شراء المتوسطة
  buyRaqiqa: integer('buy_raqiqa'), // سعر شراء الرقيقة
  maxPurchaseKg: text('max_purchase_kg'), // أقصى كمّية يشتركون
  deliveryArea: text('delivery_area'), // نطاق التوزيع/الشراء
  buyingDetails: text('buying_details'),
  // مشترك
  verified: boolean('verified').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. B2B Directory
export const b2bCompanies = pgTable('b2b_companies', {
  id: serial('id').primaryKey(),
  nameAr: text('name_ar').notNull(),
  nameFr: text('name_fr'),
  type: text('type').notNull(),
  wilayaCode: text('wilaya_code').notNull(),
  wilayaName: text('wilaya_name').notNull(),
  commune: text('commune').notNull(),
  address: text('address'),
  phone: text('phone').notNull(),
  email: text('email'),
  capacity: text('capacity'),
  certifications: text('certifications'),
  verified: boolean('verified').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Job Openings
export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  titleAr: text('title_ar').notNull(),
  companyName: text('company_name').notNull(),
  companyType: text('company_type').notNull(),
  wilayaCode: text('wilaya_code').notNull(),
  wilayaName: text('wilaya_name').notNull(),
  commune: text('commune').notNull(),
  jobType: text('job_type').notNull(),
  salaryRange: text('salary_range').notNull(),
  housingProvided: boolean('housing_provided').default(true),
  requirements: text('requirements').notNull(),
  contactPhone: text('contact_phone').notNull(),
  contactEmail: text('contact_email'),
  status: text('status').default('open'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. Workers
export const workers = pgTable('workers', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  specialty: text('specialty').notNull(),
  wilayaCode: text('wilaya_code').notNull(),
  wilayaName: text('wilaya_name').notNull(),
  experienceYears: integer('experience_years').notNull(),
  willingToRelocate: boolean('willing_to_relocate').default(true),
  phone: text('phone').notNull(),
  bio: text('bio').notNull(),
  availableNow: boolean('available_now').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
