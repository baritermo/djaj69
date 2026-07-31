import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { workers } from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { getWilayaByCode } from '@/lib/algeria-data';

export async function GET(request: Request) {
  try {
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
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
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
