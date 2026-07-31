import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { b2bCompanies } from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { getWilayaByCode } from '@/lib/algeria-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wilayaCode = searchParams.get('wilayaCode');
    const type = searchParams.get('type');

    let conditions = [];
    if (wilayaCode && wilayaCode !== 'all') {
      conditions.push(eq(b2bCompanies.wilayaCode, wilayaCode));
    }
    if (type && type !== 'all') {
      conditions.push(eq(b2bCompanies.type, type));
    }

    const results = conditions.length > 0
      ? await db
          .select()
          .from(b2bCompanies)
          .where(and(...conditions))
          .orderBy(desc(b2bCompanies.createdAt))
      : await db.select().from(b2bCompanies).orderBy(desc(b2bCompanies.createdAt));

    return NextResponse.json({ status: 'success', companies: results });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nameAr,
      nameFr,
      type = 'farm',
      wilayaCode,
      commune,
      address,
      phone,
      email,
      capacity,
      certifications,
    } = body;

    if (!nameAr || !wilayaCode || !phone) {
      return NextResponse.json(
        { status: 'error', message: 'اسم المؤسسة، الولاية، ورقم الهاتف مطلوبة' },
        { status: 400 }
      );
    }

    const wilayaInfo = getWilayaByCode(wilayaCode);
    const wilayaName = wilayaInfo ? wilayaInfo.nameAr : `الولاية ${wilayaCode}`;

    const [newComp] = await db
      .insert(b2bCompanies)
      .values({
        nameAr,
        nameFr: nameFr || '',
        type,
        wilayaCode,
        wilayaName,
        commune: commune || wilayaName,
        address: address || '',
        phone,
        email: email || '',
        capacity: capacity || '',
        certifications: certifications || 'مسجل في منصة دواجن الجزائر B2B',
        verified: true,
      })
      .returning();

    return NextResponse.json({ status: 'success', company: newComp });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
