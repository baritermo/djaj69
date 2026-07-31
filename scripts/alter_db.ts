import { pool } from '../src/db/index';

async function fix() {
  console.log('Altering official_prices table in Supabase...');
  try {
    await pool.query(`
      ALTER TABLE "official_prices" ALTER COLUMN "khashna_farmer" DROP NOT NULL;
      ALTER TABLE "official_prices" ALTER COLUMN "khashna_slaughter" DROP NOT NULL;
      ALTER TABLE "official_prices" ALTER COLUMN "khashna_intermediary" DROP NOT NULL;
      ALTER TABLE "official_prices" ALTER COLUMN "motawassita_farmer" DROP NOT NULL;
      ALTER TABLE "official_prices" ALTER COLUMN "motawassita_slaughter" DROP NOT NULL;
      ALTER TABLE "official_prices" ALTER COLUMN "motawassita_intermediary" DROP NOT NULL;
      ALTER TABLE "official_prices" ALTER COLUMN "raqiqa_farmer" DROP NOT NULL;
      ALTER TABLE "official_prices" ALTER COLUMN "raqiqa_slaughter" DROP NOT NULL;
      ALTER TABLE "official_prices" ALTER COLUMN "raqiqa_intermediary" DROP NOT NULL;
    `);
    console.log('Successfully dropped NOT NULL constraints!');
  } catch (err: any) {
    console.error('Error altering table:', err.message);
  } finally {
    await pool.end();
  }
}

fix();
