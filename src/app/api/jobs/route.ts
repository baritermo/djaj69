import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { jobs } from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { getWilayaByCode } from '@/lib/algeria-data';

import { pool } from '@/db/index';

async function ensureTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "jobs" (
        "id" serial PRIMARY KEY NOT NULL,
        "title_ar" text NOT NULL,
        "company_name" text NOT NULL,
        "company_type" text DEFAULT 'farm' NOT NULL,
        "wilaya_code" text NOT NULL,
        "wilaya_name" text NOT NULL,
        "commune" text NOT NULL,
        "job_type" text DEFAULT 'full_time' NOT NULL,
        "salary_range" text NOT NULL,
        "housing_provided" boolean DEFAULT true NOT NULL,
        "requirements" text NOT NULL,
        "contact_phone" text NOT NULL,
        "contact_email" text,
        "status" text DEFAULT 'open' NOT NULL,
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
    const jobType = searchParams.get('jobType');
    const companyType = searchParams.get('companyType');

    let conditions = [];
    if (wilayaCode && wilayaCode !== 'all') {
      conditions.push(eq(jobs.wilayaCode, wilayaCode));
    }
    if (jobType && jobType !== 'all') {
      conditions.push(eq(jobs.jobType, jobType));
    }
    if (companyType && companyType !== 'all') {
      conditions.push(eq(jobs.companyType, companyType));
    }

    const results = conditions.length > 0
      ? await db
          .select()
          .from(jobs)
          .where(and(...conditions))
          .orderBy(desc(jobs.createdAt))
      : await db.select().from(jobs).orderBy(desc(jobs.createdAt));

    return NextResponse.json({ status: 'success', jobs: results });
  } catch (error: any) {
    console.warn('Jobs fetch error:', error.message);
    return NextResponse.json({ status: 'success', jobs: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      titleAr,
      companyName,
      companyType = 'farm',
      wilayaCode,
      commune,
      jobType = 'full_time',
      salaryRange,
      housingProvided = true,
      requirements,
      contactPhone,
      contactEmail,
    } = body;

    if (!titleAr || !companyName || !wilayaCode || !contactPhone) {
      return NextResponse.json(
        { status: 'error', message: 'يرجى إدخال عنوان الوظيفة، اسم الشركة، الولاية، ورقم الهاتف' },
        { status: 400 }
      );
    }

    const wilayaInfo = getWilayaByCode(wilayaCode);
    const wilayaName = wilayaInfo ? wilayaInfo.nameAr : `الولاية ${wilayaCode}`;

    const [newJob] = await db
      .insert(jobs)
      .values({
        titleAr,
        companyName,
        companyType,
        wilayaCode,
        wilayaName,
        commune: commune || wilayaName,
        jobType,
        salaryRange: salaryRange || 'حسب الاتفاق مع توفير الإعاشة',
        housingProvided: Boolean(housingProvided),
        requirements: requirements || 'الجدية والالتزام بقواعد العمل والسلامة البيطرية',
        contactPhone,
        contactEmail: contactEmail || null,
        status: 'open',
      })
      .returning();

    return NextResponse.json({ status: 'success', job: newJob });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ status: 'error', message: 'معرف الوظيفة مطلوب' }, { status: 400 });
    }
    await db.delete(jobs).where(eq(jobs.id, Number(id)));
    return NextResponse.json({ status: 'success', id: Number(id) });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
