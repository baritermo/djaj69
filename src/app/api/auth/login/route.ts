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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { status: 'error', message: 'يرجى إدخال رقم الهاتف وكلمة السر' },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).trim();
    const cleanPassword = String(password).trim();

    // Check Predefined Test Accounts First
    const testAcc = TEST_ACCOUNTS[cleanPhone] || (cleanPhone.toUpperCase() === 'BARIHDANAJMA' ? TEST_ACCOUNTS.BARIHDANAJMA : null);
    if (testAcc) {
      if (cleanPassword !== testAcc.password) {
        return NextResponse.json(
          { status: 'error', message: 'كلمة السر غير صحيحة' },
          { status: 401 }
        );
      }
      
      // Auto-upsert into DB in background if possible
      try {
        const [existing] = await db.select().from(users).where(eq(users.phone, cleanPhone));
        if (!existing) {
          await db.insert(users).values({
            fullName: testAcc.fullName,
            phone: testAcc.phone,
            password: testAcc.password,
            role: testAcc.role,
            subscriptionStatus: testAcc.subscriptionStatus,
            wilayaCode: testAcc.wilayaCode,
          });
        }
      } catch (e) {
        console.error('Test user auto-insert note:', e);
      }

      return NextResponse.json({
        status: 'success',
        message: 'تم تسجيل الدخول بنجاح كحساب تجريبي',
        user: testAcc,
      });
    }

    // Standard User DB Login Check
    const [user] = await db.select().from(users).where(eq(users.phone, cleanPhone));

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'رقم الهاتف غير مسجل. يرجى إنشاء حساب جديد' },
        { status: 404 }
      );
    }

    if (user.password !== cleanPassword) {
      return NextResponse.json(
        { status: 'error', message: 'كلمة السر غير صحيحة' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'تم تسجيل الدخول بنجاح',
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
      { status: 'error', message: 'خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
