import 'dotenv/config';
import { db } from './index';
import { users, wilayas, officialPrices } from './schema';
import { ALGERIA_WILAYAS } from '../lib/algeria-data';

export async function seedDatabase() {
  try {
    // 1. Seed 58 Algeria Wilayas (Static Administrative List)
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

    // 2. Seed Official Price Structure for 58 Wilayas (Default empty/null prices)
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

    // 3. Seed Essential Platform Admin User ONLY
    const existingAdmin = await db.select().from(users).limit(1);
    if (existingAdmin.length === 0) {
      await db.insert(users).values([
        {
          fullName: 'إدارة البورصة (مدير المنصة)',
          phone: 'BARIHDANAJMA',
          password: 'BARIHDANAJMA',
          role: 'admin',
          subscriptionStatus: 'active',
          wilayaCode: '16',
        },
      ]);
    }
  } catch (error) {
    console.error('Seed error:', error);
  }
}

// Only auto-run CLI if called directly via node/tsx
if (typeof require !== 'undefined' && require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Clean Seed completed successfully!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seed failed:', err);
      process.exit(1);
    });
}
