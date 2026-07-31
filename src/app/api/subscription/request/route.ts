import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, receiptUrl, idCardUrl } = body;

    if (!phone) {
      return NextResponse.json(
        { status: 'error', message: 'يرجى إدخال رقم الهاتف المسجل' },
        { status: 400 }
      );
    }

    if (!receiptUrl || !idCardUrl) {
      return NextResponse.json(
        { status: 'error', message: 'يرجى إرفاق صورة وصل الدفع وصورة بطاقة الهوية / بطاقة الفلاح' },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).trim();

    const [user] = await db.select().from(users).where(eq(users.phone, cleanPhone));

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'الحساب غير موجود. يرجى إنشاء حساب جديد أولاً' },
        { status: 404 }
      );
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        subscriptionStatus: 'pending',
        receiptUrl: String(receiptUrl),
        idCardUrl: String(idCardUrl),
        rejectionReason: null,
      })
      .where(eq(users.phone, cleanPhone))
      .returning();

    return NextResponse.json({
      status: 'success',
      message: 'تم إرسال وصل الاشتراك ووثيقة الهوية بنجاح. طلبك قيد المراجعة من طرف إدارة البورصة',
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        role: updatedUser.role,
        wilayaCode: updatedUser.wilayaCode,
        subscriptionStatus: updatedUser.subscriptionStatus,
      },
    });
  } catch (error: any) {
    console.error('Subscription request error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'خطأ أثناء إرسال طلب الاشتراك' },
      { status: 500 }
    );
  }
}
