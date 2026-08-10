import { NextResponse } from 'next/server';
import { seedDatabase } from '@/db/seed';

export async function GET() {
  try {
    await seedDatabase();
    return NextResponse.json({ status: 'success', checked: true });
  } catch (error: any) {
    console.error('Error in seed route:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    await seedDatabase();
    return NextResponse.json({ status: 'success', seeded: true });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

