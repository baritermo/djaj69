import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminPhone, targetPhone, action, rejectionReason } = body;

    if (adminPhone !== 'BARIHDANAJMA') {
      return NextResponse.json(
        { status: 'error', message: 'غير مصرح لك بتأكيد أو رفض الاشتراكات' },
        { status: 403 }
      );
    }

    if (!targetPhone || !action) {
      return NextResponse.json(
        { status: 'error', message: 'يرجى تحديد رقم هاتف المستخدم والإجراء' },
        { status: 400 }
      );
    }

    const cleanTargetPhone = String(targetPhone).trim();

    if (action === 'approve') {
      const [updatedUser] = await db
        .update(users)
        .set({
          subscriptionStatus: 'active',
          subscriptionDate: new Date(),
          rejectionReason: null,
        })
        .where(eq(users.phone, cleanTargetPhone))
        .returning();

      return NextResponse.json({
        status: 'success',
        message: `تم قبول وتفعيل اشتراك المستخدم (${updatedUser.fullName}) بنجاح`,
        user: updatedUser,
      });
    } else if (action === 'reject') {
      const [updatedUser] = await db
        .update(users)
        .set({
          subscriptionStatus: 'rejected',
          rejectionReason: rejectionReason || 'عدم وضوح المستندات أو وصل الدفع',
        })
        .where(eq(users.phone, cleanTargetPhone))
        .returning();

      return NextResponse.json({
        status: 'success',
        message: `تم رفض طلب الاشتراك للمستخدم (${updatedUser.fullName})`,
        user: updatedUser,
      });
    }

    return NextResponse.json(
      { status: 'error', message: 'إجراء غير معروف' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Admin approve error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'خطأ أثناء المعالجة' },
      { status: 500 }
    );
  }
}
