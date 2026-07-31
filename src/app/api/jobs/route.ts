import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { jobs } from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { getWilayaByCode } from '@/lib/algeria-data';

export async function GET(request: Request) {
  try {
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
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
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
