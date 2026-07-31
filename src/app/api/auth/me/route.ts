import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const TEST_ACCOUNTS: Record<string, any> = {
  BARIHDANAJMA: { id: 999999, fullName: 'إدارة البورصة (مدير المنصة)', phone: 'BARIHDANAJMA', password: 'BARIHDANAJMA', role: 'admin', subscriptionStatus: 'active', wilayaCode: '16' },
  '0551002030': { id: 999901, fullName: 'فلاح الجزائر (مزرعة الأطلس)', phone: '0551002030', password: '123456', role: 'farmer', subscriptionStatus: 'active', wilayaCode: '10' },
  '0662345678': { id: 999902, fullName: 'مذبح الهضاب المعتمد', phone: '0662345678', password: '123456', role: 'slaughterhouse', subscriptionStatus: 'active', wilayaCode: '19' },
  '0556789012': { id: 999903, fullName: 'كورتي ووسيط توزيع', phone: '0556789012', password: '123456', role: 'broker', subscriptionStatus: 'active', wilayaCode: '09' },
  '036809010': { id: 999904, fullName: 'شركة أعلاف ومطاحن B2B', phone: '036809010', password: '123456', role: 'b2b', subscriptionStatus: 'active', wilayaCode: '19' },
  '0558112233': { id: 999905, fullName: 'رشيد بن عمارة (عامل دواجن)', phone: '0558112233', password: '123456', role: 'worker', subscriptionStatus: 'active', wilayaCode: '10' },
  '0550000000': { id: 999906, fullName: 'مستخدم تجريبي (غير مشترك)', phone: '0550000000', password: '123456', role: 'farmer', subscriptionStatus: 'none', wilayaCode: '16' },
};

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
    const testAcc = TEST_ACCOUNTS[cleanPhone] || (cleanPhone.toUpperCase() === 'BARIHDANAJMA' ? TEST_ACCOUNTS.BARIHDANAJMA : null);

    const [user] = await db.select().from(users).where(eq(users.phone, cleanPhone));

    if (user) {
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
    }

    if (testAcc) {
      return NextResponse.json({
        status: 'success',
        user: testAcc,
      });
    }

    return NextResponse.json(
      { status: 'error', message: 'المستخدم غير موجود' },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: 'خطأ أثناء جلب بيانات المستخدم' },
      { status: 500 }
    );
  }
}
