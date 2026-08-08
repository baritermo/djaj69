import 'dotenv/config';
import { db } from './index';
import { users, wilayas, poultryPrices, priceReports, marketOffers, b2bCompanies, jobs, workers, officialPrices } from './schema';
import { ALGERIA_WILAYAS } from '../lib/algeria-data';

export async function seedDatabase() {
  try {
    const existingWilayas = await db.select().from(wilayas).limit(1);
    if (existingWilayas.length === 0) {
      const wilayaList = ALGERIA_WILAYAS.map((w) => ({
        code: w.code,
        nameAr: w.nameAr,
        nameFr: w.nameFr,
        region: w.region,
        activeFarmsCount: Math.floor(Math.random() * 80) + 15,
        slaughterhousesCount: Math.floor(Math.random() * 12) + 2,
      }));
      await db.insert(wilayas).values(wilayaList);
    }

    const existingOfficialPrices = await db.select().from(officialPrices).limit(1);
    if (existingOfficialPrices.length === 0) {
      const officialList = ALGERIA_WILAYAS.map((w) => ({
        wilayaCode: w.code,
        nameAr: w.nameAr,
        nameFr: w.nameFr,
        region: w.region,
        trend: 'stable',
        trendPercent: '0%',
        farmerPrice: null,
        slaughterPrice: null,
        intermediaryPrice: null,
        updatedAt: new Date(),
      }));
      await db.insert(officialPrices).values(officialList);
    }
    const existingPrices = await db.select().from(poultryPrices).limit(1);
    if (existingPrices.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      const priceList = [];
      for (const w of ALGERIA_WILAYAS) {
        priceList.push(
          { wilayaCode: w.code, date: today, category: 'خشنة', farmerPrice: w.khashna_farmer, slaughterPrice: w.khashna_slaughter, intermediaryPrice: w.khashna_intermediary, trend: w.trend, trendChangePercent: w.trendPercent, notesAr: `أسعار الخشن في ولاية ${w.nameAr}`, reportedBy: 'بورصة الدواجن', status: 'official' },
          { wilayaCode: w.code, date: today, category: 'متوسطة', farmerPrice: w.motawassita_farmer, slaughterPrice: w.motawassita_slaughter, intermediaryPrice: w.motawassita_intermediary, trend: w.trend, trendChangePercent: w.trendPercent, notesAr: `أسعار المتوسط في ولاية ${w.nameAr}`, reportedBy: 'بورصة الدواجن', status: 'official' },
          { wilayaCode: w.code, date: today, category: 'رقيقة', farmerPrice: w.raqiqa_farmer, slaughterPrice: w.raqiqa_slaughter, intermediaryPrice: w.raqiqa_intermediary, trend: w.trend, trendChangePercent: w.trendPercent, notesAr: `أسعار الرقيق في ولاية ${w.nameAr}`, reportedBy: 'بورصة الدواجن', status: 'official' }
        );
      }
      await db.insert(poultryPrices).values(priceList);
    }
    const existingReports = await db.select().from(priceReports).limit(1);
    if (existingReports.length === 0) {
      await db.insert(priceReports).values([
        { wilayaCode: '10', wilayaName: 'البويرة', reporterName: 'عبد القادر', reporterRole: 'farmer', phone: '0551234567', khashna_farmer: 305, khashna_slaughter: 295, khashna_intermediary: 315, motawassita_farmer: 290, motawassita_slaughter: 280, motawassita_intermediary: 300, raqiqa_farmer: 275, raqiqa_slaughter: 265, raqiqa_intermediary: 285, notes: 'أسعار مستقرة', verified: true },
        { wilayaCode: '19', wilayaName: 'سطيف', reporterName: 'مذبح الهضاب', reporterRole: 'slaughterhouse', phone: '0662345678', khashna_farmer: 305, khashna_slaughter: 295, khashna_intermediary: 315, motawassita_farmer: 290, motawassita_slaughter: 280, motawassita_intermediary: 300, raqiqa_farmer: 275, raqiqa_slaughter: 265, raqiqa_intermediary: 285, notes: 'مذبح آلي معتمد', verified: true },
        { wilayaCode: '09', wilayaName: 'البليدة', reporterName: 'تعاونية المتيجة', reporterRole: 'syndicate', phone: '0773456789', khashna_farmer: 310, khashna_slaughter: 300, khashna_intermediary: 320, motawassita_farmer: 295, motawassita_slaughter: 285, motawassita_intermediary: 305, raqiqa_farmer: 280, raqiqa_slaughter: 270, raqiqa_intermediary: 290, notes: 'تراجع طفيف', verified: true },
        { wilayaCode: '31', wilayaName: 'وهران', reporterName: 'بوفلجة', reporterRole: 'wholesaler', phone: '0554567890', khashna_farmer: 330, khashna_slaughter: 320, khashna_intermediary: 340, motawassita_farmer: 315, motawassita_slaughter: 305, motawassita_intermediary: 325, raqiqa_farmer: 300, raqiqa_slaughter: 290, raqiqa_intermediary: 310, notes: 'طلب مرتفع', verified: true },
        { wilayaCode: '16', wilayaName: 'الجزائر العاصمة', reporterName: 'الساحل للتوزيع', reporterRole: 'wholesaler', phone: '0665678901', khashna_farmer: 330, khashna_slaughter: 320, khashna_intermediary: 340, motawassita_farmer: 315, motawassita_slaughter: 305, motawassita_intermediary: 325, raqiqa_farmer: 300, raqiqa_slaughter: 290, raqiqa_intermediary: 310, notes: 'أسعار متوازنة', verified: true },
      ]);
    }
    // ---- Farmers / Market Offers ----
    // Default seed offers disabled (العروض تدار حصرياً عبر المستخدمين والمدير)
    const existingCompanies = await db.select().from(b2bCompanies).limit(1);
    if (existingCompanies.length === 0) {
      await db.insert(b2bCompanies).values([
        { nameAr: 'مزرعة الأطلس', nameFr: 'Ferme Atlas', type: 'farm', wilayaCode: '10', wilayaName: 'البويرة', commune: 'الأخضرية', address: 'طريق عين بسام', phone: '0551002030', capacity: '40,000 طير/دورة', certifications: 'اعتماد بيطري', verified: true },
        { nameAr: 'المذبح الآلي المتيجة', nameFr: 'Abattoir Mitidja', type: 'slaughterhouse', wilayaCode: '09', wilayaName: 'البليدة', commune: 'بوفاريك', address: 'المنطقة الصناعية', phone: '025405060', capacity: '15 طن/يوم', certifications: 'ذبح حلال ISO 22000', verified: true },
        { nameAr: 'أوناب الشرق', nameFr: 'ONAB Est', type: 'feed_supplier', wilayaCode: '19', wilayaName: 'سطيف', commune: 'العلمة', address: 'المنطقة الصناعية', phone: '036809010', capacity: '120 طن/يوم', certifications: 'وزارة الفلاحة', verified: true },
        { nameAr: 'مفقس الشروق', nameFr: 'Couvoir Echourouk', type: 'hatchery', wilayaCode: '26', wilayaName: 'المدية', commune: 'البرواقية', address: 'شارع الشهداء', phone: '0556708090', capacity: '60,000 صوص/أسبوع', certifications: 'Cobb 500, Ross 308', verified: true },
        { nameAr: 'الغرب للنقل المبرد', nameFr: 'Ouest Froid', type: 'distributor', wilayaCode: '31', wilayaName: 'وهران', commune: 'السانية', address: 'طريق المطار', phone: '041203040', capacity: '10 شاحنات تبريد', certifications: 'ترخيص نقل', verified: true },
        { nameAr: 'بيطرة فارم', nameFr: 'VetPharm', type: 'vet_equipment', wilayaCode: '16', wilayaName: 'الجزائر العاصمة', commune: 'باب الزوار', address: 'حي باب الزوار', phone: '023807060', capacity: 'تجهيز مزارع', certifications: 'أنظمة أوروبية', verified: true },
      ]);
    }
    const existingJobs = await db.select().from(jobs).limit(1);
    if (existingJobs.length === 0) {
      await db.insert(jobs).values([
        { titleAr: 'مطلوب عمال تربية دواجن (مبيت وإعاشة)', companyName: 'مزرعة الأطلس', companyType: 'farm', wilayaCode: '10', wilayaName: 'البويرة', commune: 'الأخضرية', jobType: 'full_time', salaryRange: '48,000 - 55,000 د.ج', housingProvided: true, requirements: 'خبرة في الحرارة والتهوية', contactPhone: '0551002030', status: 'open' },
        { titleAr: 'طبيب بيطري مشرف', companyName: 'مجموعة الهضاب', companyType: 'vet', wilayaCode: '19', wilayaName: 'سطيف', commune: 'سطيف', jobType: 'full_time', salaryRange: '70,000 - 90,000 د.ج', housingProvided: false, requirements: 'شهادة بيطري خبرة سنتين', contactPhone: '0662345678', status: 'open' },
        { titleAr: 'عمال ذبح وسلخ', companyName: 'المذبح المتيجة', companyType: 'slaughterhouse', wilayaCode: '09', wilayaName: 'البليدة', commune: 'بوفاريك', jobType: 'full_time', salaryRange: '45,000 - 52,000 د.ج', housingProvided: false, requirements: 'الالتزام بالذبح الحلال', contactPhone: '025405060', status: 'open' },
        { titleAr: 'سائق شاحنة تبريد (صنف ج)', companyName: 'الغرب للنقل', companyType: 'logistics', wilayaCode: '31', wilayaName: 'وهران', commune: 'السانية', jobType: 'full_time', salaryRange: '55,000 - 65,000 د.ج', housingProvided: false, requirements: 'رخصة ج + خبرة تبريد', contactPhone: '041203040', status: 'open' },
        { titleAr: 'عامل رعاية صوص مفقس', companyName: 'مفقس الشروق', companyType: 'hatchery', wilayaCode: '26', wilayaName: 'المدية', commune: 'البرواقية', jobType: 'seasonal', salaryRange: '40,000 د.ج/دورة', housingProvided: true, requirements: 'مراقبة حرارة الحاضنات', contactPhone: '0556708090', status: 'open' },
        { titleAr: 'مشرف عنبر تربية', companyName: 'تعاونية الشروق', companyType: 'farm', wilayaCode: '13', wilayaName: 'تلمسان', commune: 'الحناية', jobType: 'full_time', salaryRange: '50,000 - 60,000 د.ج', housingProvided: true, requirements: 'إدارة فريق 4 عمال', contactPhone: '0771223344', status: 'open' },
      ]);
    }
    const existingWorkers = await db.select().from(workers).limit(1);
    if (existingWorkers.length === 0) {
      await db.insert(workers).values([
        { fullName: 'رشيد بن عمارة', specialty: 'poultry_worker', wilayaCode: '10', wilayaName: 'البويرة', experienceYears: 7, willingToRelocate: true, phone: '0558112233', bio: 'عامل تربية خبرة 7 سنوات، متمرس في التدفئة والتهوية.', availableNow: true },
        { fullName: 'د. سفيان لعور', specialty: 'veterinarian', wilayaCode: '16', wilayaName: 'الجزائر العاصمة', experienceYears: 4, willingToRelocate: true, phone: '0661998877', bio: 'طبيب بيطري مختص في دواجن التسمين والبيض.', availableNow: true },
        { fullName: 'كريم قادري', specialty: 'slaughter_worker', wilayaCode: '09', wilayaName: 'البليدة', experienceYears: 5, willingToRelocate: false, phone: '0770445566', bio: 'خبرة في المذابح الآلية، مختص في الذبح والتغليف.', availableNow: true },
        { fullName: 'عمر بوزيد', specialty: 'farm_supervisor', wilayaCode: '19', wilayaName: 'سطيف', experienceYears: 10, willingToRelocate: true, phone: '0552334455', bio: 'مشرف مزارع 10 سنوات خبرة.', availableNow: true },
        { fullName: 'أمين طاهري', specialty: 'driver_refrigerated', wilayaCode: '31', wilayaName: 'وهران', experienceYears: 6, willingToRelocate: true, phone: '0668776655', bio: 'سائق تبريد خبرة توزيع لحوم بيضاء.', availableNow: true },
      ]);
    }

    // ---- Users (حسابات الاختبار لجميع الفئات) ----
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      await db.insert(users).values([
        { fullName: 'إدارة البورصة (مدير المنصة)', phone: 'BARIHDANAJMA', password: 'BARIHDANAJMA', role: 'admin', subscriptionStatus: 'active', wilayaCode: '16' },
        { fullName: 'فلاح الجزائر (مزرعة الأطلس)', phone: '0551002030', password: '123456', role: 'farmer', subscriptionStatus: 'active', wilayaCode: '10' },
        { fullName: 'مذبح الهضاب المعتمد', phone: '0662345678', password: '123456', role: 'slaughterhouse', subscriptionStatus: 'active', wilayaCode: '19' },
        { fullName: 'كورتي ووسيط توزيع', phone: '0556789012', password: '123456', role: 'broker', subscriptionStatus: 'active', wilayaCode: '09' },
        { fullName: 'شركة أعلاف ومطاحن B2B', phone: '036809010', password: '123456', role: 'b2b', subscriptionStatus: 'active', wilayaCode: '19' },
        { fullName: 'رشيد بن عمارة (عامل دواجن)', phone: '0558112233', password: '123456', role: 'worker', subscriptionStatus: 'active', wilayaCode: '10' },
        { fullName: 'مستخدم تجريبي (غير مشترك)', phone: '0550000000', password: '123456', role: 'farmer', subscriptionStatus: 'none', wilayaCode: '16' },
      ]);
    }
  } catch (error) {
    console.error('Seed error:', error);
  }
}

// Only auto-run CLI if called directly via node/tsx
if (typeof require !== 'undefined' && require.main === module) {
  seedDatabase().then(() => {
    console.log('✅ Seed completed successfully!');
    process.exit(0);
  }).catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
}
