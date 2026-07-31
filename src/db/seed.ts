import 'dotenv/config';
import { db } from './index';
import { wilayas, poultryPrices, priceReports, marketOffers, b2bCompanies, jobs, workers, officialPrices } from './schema';
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
    // ---- Farmers (بيع) ----
    const existingOffers = await db.select().from(marketOffers).limit(1);
    if (existingOffers.length === 0) {
      await db.insert(marketOffers).values([
        // فلاحين — كل واحد في ولايته
        { offerType: 'farmer', name: 'مزرعة الأطلس — الأخضرية', wilayaCode: '10', wilayaName: 'البويرة', commune: 'الأخضرية', phone: '0551002030', chickenCategories: 'خشنة، متوسطة', weightRange: '2.0-2.6 كغ', availableQuantity: '12,000 طير', breedType: 'Ross 308', farmAcreage: '3 عنابر × 5,000 م²', chickenAge: '45 يوم', details: 'دجاج لحمي جاهز للبيع، تلقيح كامل، استلام مباشر من المزرعة.', verified: true },
        { offerType: 'farmer', name: 'مزرعة الهضاب — العلمة', wilayaCode: '19', wilayaName: 'سطيف', commune: 'العلمة', phone: '0552334455', chickenCategories: 'متوسطة، رقيقة', weightRange: '1.6-2.2 كغ', availableQuantity: '8,500 طير', breedType: 'Cobb 500', farmAcreage: '2 عنبر × 4,000 م²', chickenAge: '42 يوم', details: 'منتج محلي عالي الجودة، متاح للمذابح وتجار الجملة.', verified: true },
        { offerType: 'farmer', name: 'تعاونية المتيجة — بوفاريك', wilayaCode: '09', wilayaName: 'البليدة', commune: 'بوفاريك', phone: '0773456789', chickenCategories: 'رقيقة', weightRange: '1.2-1.6 كغ', availableQuantity: '6,000 طير', breedType: 'محلي', farmAcreage: 'عنبر واحد 3,000 م²', chickenAge: '35 يوم', details: 'دجاج رقيق مناسب لمتاجر التجزئة.', verified: true },
        { offerType: 'farmer', name: 'مزرعة غرب الدواجن — السانية', wilayaCode: '31', wilayaName: 'وهران', commune: 'السانية', phone: '0554567890', chickenCategories: 'خشنة', weightRange: '2.4-3.0 كغ', availableQuantity: '10,000 طير', breedType: 'Ross 308', farmAcreage: '5 عنابر', chickenAge: '48 يوم', details: 'بيع مباشر من الفلاح، كميات كبيرة.', verified: true },
        { offerType: 'farmer', name: 'مزرعة الواحات — طولقة', wilayaCode: '07', wilayaName: 'بسكرة', commune: 'طولقة', phone: '0667010203', chickenCategories: 'متوسطة', weightRange: '1.8-2.3 كغ', availableQuantity: '4,000 طير', breedType: 'محلي محسّن', farmAcreage: 'عنبران × 3,500 م²', chickenAge: '40 يوم', details: 'إنتاج جنوب متوفر.', verified: true },
        { offerType: 'farmer', name: 'مزرعة القبائل — ذراع بن خدة', wilayaCode: '15', wilayaName: 'تيزي وزو', commune: 'ذراع بن خدة', phone: '0554112233', chickenCategories: 'رقيقة', weightRange: '1.0-1.5 كغ', availableQuantity: '3,500 طير', breedType: 'Cobb 500', farmAcreage: 'عنبر 2,500 م²', chickenAge: '30 يوم', details: 'إنتاج يومي مع متابعة بيطرية.', verified: true },
        { offerType: 'farmer', name: 'مزرعة الهضاب العليا — الجلفة', wilayaCode: '17', wilayaName: 'الجلفة', commune: 'حاسي بحبح', phone: '0555667788', chickenCategories: 'خشنة، متوسطة', weightRange: '2.2-2.8 كغ', availableQuantity: '7,000 طير', breedType: 'Ross 308', farmAcreage: '4 عنابر', chickenAge: '44 يوم', details: 'مزرعة حديثة تهوية آلية.', verified: true },
        { offerType: 'farmer', name: 'مزرعة الشرق — باتنة', wilayaCode: '05', wilayaName: 'باتنة', commune: 'عين التوتة', phone: '0668901234', chickenCategories: 'متوسطة، رقيقة', weightRange: '1.5-2.0 كغ', availableQuantity: '5,200 طير', breedType: 'Cobb 500', farmAcreage: 'عنبران × 4,000 م²', chickenAge: '38 يوم', details: 'دجاج جاهز للبيع.', verified: true },
        // مذابح — أسعار الشراء لكل فئة
        { offerType: 'slaughterhouse', name: 'المذبح الآلي المتيجة', wilayaCode: '09', wilayaName: 'البليدة', commune: 'بوفاريك', phone: '025405060', buyKhashna: 300, buyMotawassita: 280, buyRaqiqa: 265, maxPurchaseKg: '15 طن يومياً', deliveryArea: 'البليدة، الجزائر، البويرة، تيبازة', buyingDetails: 'ذبح حلال آلي، تنظيف وتغليف صحي، شاحنات تبريد.', verified: true },
        { offerType: 'slaughterhouse', name: 'مذبح الهضاب المعتمد', wilayaCode: '19', wilayaName: 'سطيف', commune: 'سطيف المركز', phone: '0662345678', buyKhashna: 295, buyMotawassita: 278, buyRaqiqa: 260, maxPurchaseKg: '8 طن يومياً', deliveryArea: 'سطيف، المسيلة، برج بوعريريج', buyingDetails: 'ذبح آلي وتعبئة، عرض خاص لتجار الجملة.', verified: true },
        { offerType: 'slaughterhouse', name: 'مذبح الساحل — العاصمة', wilayaCode: '16', wilayaName: 'الجزائر العاصمة', commune: 'الرويبة', phone: '021778899', buyKhashna: 318, buyMotawassita: 300, buyRaqiqa: 285, maxPurchaseKg: '12 طن يومياً', deliveryArea: 'العاصمة و 48 ولاية مجاورة', buyingDetails: 'توزيع مبرد داخل العاصمة والضواحي.', verified: true },
        { offerType: 'slaughterhouse', name: 'مذبح وهران الحديث', wilayaCode: '31', wilayaName: 'وهران', commune: 'السانية', phone: '041223344', buyKhashna: 315, buyMotawassita: 298, buyRaqiqa: 280, maxPurchaseKg: '5 طن يومياً', deliveryArea: 'وهران، تيارت، عين تموشنت', buyingDetails: 'دجاج مذبوح مبرد للمحلات والمطاعم.', verified: true },
        { offerType: 'slaughterhouse', name: 'مذبح الشرق — قسنطينة', wilayaCode: '25', wilayaName: 'قسنطينة', commune: 'الخروب', phone: '031112233', buyKhashna: 300, buyMotawassita: 285, buyRaqiqa: 270, maxPurchaseKg: '7 طن يومياً', deliveryArea: 'قسنطينة، تبسة، سوق أهراس', buyingDetails: 'تعبئة أكياس غذائية مع نقل مبرد.', verified: true },
        { offerType: 'slaughterhouse', name: 'مذبح الجنوب الحلال', wilayaCode: '30', wilayaName: 'ورقلة', commune: 'ورقلة المركز', phone: '029556677', buyKhashna: 330, buyMotawassita: 315, buyRaqiqa: 300, maxPurchaseKg: '4 طن يومياً', deliveryArea: 'ورقلة، غرداية، ورقلة، تقرت', buyingDetails: 'ذبح حلال وتوزيع إقليمي نحو الجنوب.', verified: true },
        // كورتي / وسطاء — أسعار الشراء لكل فئة
        { offerType: 'broker', name: 'بوفلجة لتوزيع الدواجن', wilayaCode: '31', wilayaName: 'وهران', commune: 'المدينة الجديدة', phone: '0554567890', buyKhashna: 310, buyMotawassita: 295, buyRaqiqa: 278, maxPurchaseKg: '6 طن/أسبوع', deliveryArea: 'ولاية وهران والشلف وتلمسان', buyingDetails: 'وسيط معتمد توريد سريع للمحلات والقصابات.', verified: true },
        { offerType: 'broker', name: 'شبكة الوسط للتوزيع', wilayaCode: '16', wilayaName: 'الجزائر العاصمة', commune: 'باب الزوار', phone: '0665678901', buyKhashna: 320, buyMotawassita: 305, buyRaqiqa: 288, maxPurchaseKg: '10 طن/أسبوع', deliveryArea: 'العاصمة والبليدة وتيبازة وبومرداس', buyingDetails: 'توريد دجاج مبرد من مذابح متعددة للقصابات والفنادق.', verified: true },
        { offerType: 'broker', name: 'كورتي الشرق للحوم البيضاء', wilayaCode: '25', wilayaName: 'قسنطينة', commune: 'قسنطينة المركز', phone: '0771122334', buyKhashna: 305, buyMotawassita: 290, buyRaqiqa: 275, maxPurchaseKg: '4 طن/أسبوع', deliveryArea: 'قسنطينة، تيزي وزو، بجاية', buyingDetails: 'توزيع رقيق للمطاعم والأسواق اليومية.', verified: true },
        { offerType: 'broker', name: 'موزع المتيجة السريع', wilayaCode: '09', wilayaName: 'البليدة', commune: 'البليدة المركز', phone: '0556789012', buyKhashna: 298, buyMotawassita: 283, buyRaqiqa: 268, maxPurchaseKg: '5 طن/أسبوع', deliveryArea: 'البليدة، الجزائر، البويرة', buyingDetails: 'وسيط يضمن التوصيل المبرد.', verified: true },
        { offerType: 'broker', name: 'كورتي الهضاب', wilayaCode: '19', wilayaName: 'سطيف', commune: 'العلمة', phone: '0663344556', buyKhashna: 302, buyMotawassita: 288, buyRaqiqa: 272, maxPurchaseKg: '7 طن/أسبوع', deliveryArea: 'سطيف، المسيلة، عين الدفلى', buyingDetails: 'توزيع يومي من مزارع ومذابح الشرق.', verified: true },
        { offerType: 'broker', name: 'وسيط الواحات', wilayaCode: '07', wilayaName: 'بسكرة', commune: 'بسكرة المركز', phone: '0559090807', buyKhashna: 320, buyMotawassita: 305, buyRaqiqa: 290, maxPurchaseKg: '3 طن/أسبوع', deliveryArea: 'بسكرة، عنابة، قالمة', buyingDetails: 'توصيل للأسواق الجنوبية والقصابات المحلية.', verified: true },
      ]);
    }
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
