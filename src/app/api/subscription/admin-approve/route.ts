import { NextResponse } from 'next/server';
import { pool } from '@/db/index';

async function ensureTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY NOT NULL,
        "full_name" text NOT NULL,
        "phone" text UNIQUE NOT NULL,
        "password" text NOT NULL,
        "role" text DEFAULT 'farmer' NOT NULL,
        "subscription_status" text DEFAULT 'none' NOT NULL,
        "subscription_date" timestamp,
        "wilaya_code" text NOT NULL,
        "commune" text,
        "receipt_url" text,
        "id_card_url" text,
        "rejection_reason" text,
        "created_at" timestamp DEFAULT now()
      );
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_status" text DEFAULT 'none';
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_date" timestamp;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "receipt_url" text;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "id_card_url" text;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "rejection_reason" text;
    `);
  } catch (e) {}
}

export async function POST(request: Request) {
  try {
    await ensureTables();
    const body = await request.json().catch(() => ({}));
    const { targetPhone, action, rejectionReason } = body;

    if (!targetPhone || !action) {
      return NextResponse.json(
        { status: 'error', message: 'يرجى تحديد رقم هاتف المستخدم والإجراء' },
        { status: 400 }
      );
    }

    const cleanTargetPhone = String(targetPhone).trim();

    if (action === 'make_all_free') {
      await pool.query(`UPDATE "users" SET "subscription_status" = 'active', "subscription_date" = NOW(), "rejection_reason" = NULL WHERE "role" != 'admin'`);
      return NextResponse.json({
        status: 'success',
        message: 'تم تحويل جميع الحسابات إلى مجانية ومفعلة بنجاح ✅',
      });
    }

    if (action === 'make_all_require') {
      await pool.query(`UPDATE "users" SET "subscription_status" = 'pending' WHERE "role" != 'admin'`);
      return NextResponse.json({
        status: 'success',
        message: 'تم تفعيل إلزامية الاشتراك على جميع الحسابات بنجاح 🔒',
      });
    }

    if (action === 'approve') {
      const res = await pool.query(
        `
        UPDATE "users" 
        SET "subscription_status" = 'active', 
            "subscription_date" = NOW(), 
            "rejection_reason" = NULL 
        WHERE LOWER(TRIM("phone")) = LOWER(TRIM($1))
        RETURNING "id", "full_name" AS "fullName", "phone", "subscription_status" AS "subscriptionStatus"
      `,
        [cleanTargetPhone]
      );

      const updatedUser = (res.rows && res.rows[0]) ? res.rows[0] : { fullName: cleanTargetPhone, phone: cleanTargetPhone };

      return NextResponse.json({
        status: 'success',
        message: `تم تفعيل واعتماد الحساب (${updatedUser.fullName}) بنجاح ✅`,
        user: updatedUser,
      });
    } else if (action === 'require_subscription') {
      const res = await pool.query(
        `
        UPDATE "users" 
        SET "subscription_status" = 'pending', 
            "rejection_reason" = 'مطالب بدفع وتأكيد الاشتراك' 
        WHERE LOWER(TRIM("phone")) = LOWER(TRIM($1))
        RETURNING "id", "full_name" AS "fullName", "phone", "subscription_status" AS "subscriptionStatus"
      `,
        [cleanTargetPhone]
      );

      const updatedUser = (res.rows && res.rows[0]) ? res.rows[0] : { fullName: cleanTargetPhone, phone: cleanTargetPhone };

      return NextResponse.json({
        status: 'success',
        message: `تم إلزام الحساب (${updatedUser.fullName}) بالاشتراك 🔒`,
        user: updatedUser,
      });
    } else if (action === 'reject') {
      const res = await pool.query(
        `
        UPDATE "users" 
        SET "subscription_status" = 'rejected', 
            "rejection_reason" = $2 
        WHERE LOWER(TRIM("phone")) = LOWER(TRIM($1))
        RETURNING "id", "full_name" AS "fullName", "phone", "subscription_status" AS "subscriptionStatus"
      `,
        [cleanTargetPhone, rejectionReason || 'عدم وضوح البيانات']
      );

      const updatedUser = (res.rows && res.rows[0]) ? res.rows[0] : { fullName: cleanTargetPhone, phone: cleanTargetPhone };

      return NextResponse.json({
        status: 'success',
        message: `تم رفض/إيقاف الحساب للمستخدم (${updatedUser.fullName}) ❌`,
        user: updatedUser,
      });
    }

    return NextResponse.json({ status: 'error', message: 'إجراء غير معروف' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin approve error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'حدث خطأ أثناء تفعيل الحساب' },
      { status: 500 }
    );
  }
}
