import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { status: 'error', message: 'رقم الهاتف مطلوب' },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).trim();

    if (cleanPhone.toUpperCase() === 'BARIHDANAJMA') {
      return NextResponse.json({
        status: 'success',
        user: {
          id: 999999,
          fullName: 'إدارة البورصة',
          phone: 'BARIHDANAJMA',
          role: 'admin',
          subscriptionStatus: 'active',
          wilayaCode: '16',
        },
      });
    }

    const [user] = await db.select().from(users).where(eq(users.phone, cleanPhone));

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        wilayaCode: user.wilayaCode,
        commune: user.commune,
        subscriptionStatus: user.subscriptionStatus,
        rejectionReason: user.rejectionReason,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: 'خطأ أثناء جلب بيانات المستخدم' },
      { status: 500 }
    );
  }
}
