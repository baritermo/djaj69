import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    // Platform Owner Admin Check
    if (cleanPhone.toUpperCase() === 'BARIHDANAJMA' && cleanPassword === 'BARIHDANAJMA') {
      return NextResponse.json({
        status: 'success',
        message: 'تم الدخول كـ إدارة البورصة',
        user: {
          id: 999999,
          fullName: 'إدارة البورصة',
          phone: 'BARIHDANAJMA',
          role: 'admin',
          wilayaCode: '16',
        },
      });
    }

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
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
