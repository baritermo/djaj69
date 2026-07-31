import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { workers } from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { getWilayaByCode } from '@/lib/algeria-data';

import { pool } from '@/db/index';

async function ensureTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "workers" (
        "id" serial PRIMARY KEY NOT NULL,
        "full_name" text NOT NULL,
        "specialty" text DEFAULT 'poultry_worker' NOT NULL,
        "wilaya_code" text NOT NULL,
        "wilaya_name" text NOT NULL,
        "experience_years" integer DEFAULT 1 NOT NULL,
        "willing_to_relocate" boolean DEFAULT true NOT NULL,
        "phone" text NOT NULL,
        "bio" text NOT NULL,
        "available_now" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now()
      );
    `);
  } catch (e) {}
}

export async function GET(request: Request) {
  try {
    await ensureTables();
    const { searchParams } = new URL(request.url);
    const wilayaCode = searchParams.get('wilayaCode');
    const specialty = searchParams.get('specialty');

    let conditions = [];
    if (wilayaCode && wilayaCode !== 'all') {
      conditions.push(eq(workers.wilayaCode, wilayaCode));
    }
    if (specialty && specialty !== 'all') {
      conditions.push(eq(workers.specialty, specialty));
    }

    const results = conditions.length > 0
      ? await db
          .select()
          .from(workers)
          .where(and(...conditions))
          .orderBy(desc(workers.createdAt))
      : await db.select().from(workers).orderBy(desc(workers.createdAt));

    return NextResponse.json({ status: 'success', workers: results });
  } catch (error: any) {
    console.warn('Workers fetch error:', error.message);
    return NextResponse.json({ status: 'success', workers: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      specialty = 'poultry_worker',
      wilayaCode,
      experienceYears = 1,
      willingToRelocate = true,
      phone,
      bio,
    } = body;

    if (!fullName || !wilayaCode || !phone) {
      return NextResponse.json(
        { status: 'error', message: 'الاسم الكامل والولاية ورقم الهاتف مطلوبة' },
        { status: 400 }
      );
    }

    const wilayaInfo = getWilayaByCode(wilayaCode);
    const wilayaName = wilayaInfo ? wilayaInfo.nameAr : `الولاية ${wilayaCode}`;

    const [newWorker] = await db
      .insert(workers)
      .values({
        fullName,
        specialty,
        wilayaCode,
        wilayaName,
        experienceYears: Number(experienceYears),
        willingToRelocate: Boolean(willingToRelocate),
        phone,
        bio: bio || `عامل في قطاع الدواجن جاهز للعمل الفوري في ${wilayaName} أو الولايات الأخرى.`,
        availableNow: true,
      })
      .returning();

    return NextResponse.json({ status: 'success', worker: newWorker });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
