import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { priceReports } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getWilayaByCode } from '@/lib/algeria-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wilayaCode = searchParams.get('wilayaCode');

    const query = wilayaCode && wilayaCode !== 'all'
      ? await db
          .select()
          .from(priceReports)
          .where(eq(priceReports.wilayaCode, wilayaCode))
          .orderBy(desc(priceReports.createdAt))
      : await db.select().from(priceReports).orderBy(desc(priceReports.createdAt));

    return NextResponse.json({ status: 'success', reports: query });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      wilayaCode,
      reporterName,
      reporterRole,
      phone,
      khashna_farmer,
      khashna_slaughter,
      khashna_intermediary,
      motawassita_farmer,
      motawassita_slaughter,
      motawassita_intermediary,
      raqiqa_farmer,
      raqiqa_slaughter,
      raqiqa_intermediary,
      notes,
    } = body;

    if (!wilayaCode || !reporterName) {
      return NextResponse.json(
        { status: 'error', message: 'يرجى إدخال الولاية والاسم على الأقل' },
        { status: 400 }
      );
    }

    const wilayaInfo = getWilayaByCode(wilayaCode);
    const wilayaName = wilayaInfo ? wilayaInfo.nameAr : `الولاية ${wilayaCode}`;

    const [newReport] = await db
      .insert(priceReports)
      .values({
        wilayaCode,
        wilayaName,
        reporterName,
        reporterRole: reporterRole || 'farmer',
        phone: phone || '',
        khashna_farmer: khashna_farmer ? Number(khashna_farmer) : null,
        khashna_slaughter: khashna_slaughter ? Number(khashna_slaughter) : null,
        khashna_intermediary: khashna_intermediary ? Number(khashna_intermediary) : null,
        motawassita_farmer: motawassita_farmer ? Number(motawassita_farmer) : null,
        motawassita_slaughter: motawassita_slaughter ? Number(motawassita_slaughter) : null,
        motawassita_intermediary: motawassita_intermediary ? Number(motawassita_intermediary) : null,
        raqiqa_farmer: raqiqa_farmer ? Number(raqiqa_farmer) : null,
        raqiqa_slaughter: raqiqa_slaughter ? Number(raqiqa_slaughter) : null,
        raqiqa_intermediary: raqiqa_intermediary ? Number(raqiqa_intermediary) : null,
        notes: notes || '',
        verified: true,
      })
      .returning();

    return NextResponse.json({ status: 'success', report: newReport });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
