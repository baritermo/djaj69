import { NextResponse } from 'next/server';
import { seedDatabase } from '@/db/seed';
import { pool } from '@/db/index';

export async function GET() {
  try {
    await pool.query(`
      DELETE FROM "market_offers";
      DELETE FROM "b2b_companies";
      DELETE FROM "jobs";
      DELETE FROM "workers";
      DELETE FROM "price_reports";
    `).catch(() => {});
    await seedDatabase();
    return NextResponse.json({ status: 'success', checked: true });
  } catch (error: any) {
    console.error('Error in seed route:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    await pool.query(`
      DELETE FROM "market_offers";
      DELETE FROM "b2b_companies";
      DELETE FROM "jobs";
      DELETE FROM "workers";
      DELETE FROM "price_reports";
    `).catch(() => {});
    await seedDatabase();
    return NextResponse.json({ status: 'success', seeded: true });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
