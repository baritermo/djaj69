import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, phone, fullName, wilayaCode, commune, currentPassword, newPassword } = body;

    if (!phone) {
      return NextResponse.json(
        { status: 'error', message: 'معرف المستخدم غير موجود' },
        { status: 400 }
      );
    }

    // Admin account special update
    if (phone === 'BARIHDANAJMA') {
      return NextResponse.json({
        status: 'success',
        message: 'تم تحديث بيانات حساب الإدارة بنجاح',
        user: {
          id: 999999,
          fullName: fullName || 'إدارة البورصة',
          phone: 'BARIHDANAJMA',
          role: 'admin',
          wilayaCode: wilayaCode || '16',
        },
      });
    }

    const [user] = await db.select().from(users).where(eq(users.phone, String(phone)));

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'الحساب غير موجود' },
        { status: 404 }
      );
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword || currentPassword !== user.password) {
        return NextResponse.json(
          { status: 'error', message: 'كلمة السر الحالية غير صحيحة' },
          { status: 400 }
        );
      }
    }

    const updateFields: any = {};
    if (fullName) updateFields.fullName = String(fullName).trim();
    if (wilayaCode) updateFields.wilayaCode = String(wilayaCode);
    if (commune) updateFields.commune = String(commune).trim();
    if (newPassword) updateFields.password = String(newPassword).trim();

    const [updatedUser] = await db
      .update(users)
      .set(updateFields)
      .where(eq(users.phone, String(phone)))
      .returning();

    return NextResponse.json({
      status: 'success',
      message: 'تم تحديث إعدادات الحساب بنجاح',
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        role: updatedUser.role,
        wilayaCode: updatedUser.wilayaCode,
        password: updatedUser.password,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'خطأ أثناء تحديث الحساب' },
      { status: 500 }
    );
  }
}
