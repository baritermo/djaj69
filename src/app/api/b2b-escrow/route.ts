import { NextResponse } from 'next/server';
import { db, pool } from '@/db';
import { b2bEscrowRequests } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

async function ensureTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "b2b_escrow_requests" (
        "id" serial PRIMARY KEY NOT NULL,
        "offer_id" integer NOT NULL,
        "offer_title" text NOT NULL,
        "buyer_name" text NOT NULL,
        "buyer_phone" text NOT NULL,
        "seller_name" text NOT NULL,
        "seller_phone" text NOT NULL,
        "agreed_price" integer,
        "notes" text,
        "status" text DEFAULT 'pending',
        "payment_receipt" text,
        "transaction_ref" text,
        "admin_notes" text,
        "created_at" timestamp DEFAULT now()
      );
      ALTER TABLE "b2b_escrow_requests" ADD COLUMN IF NOT EXISTS "payment_receipt" text;
      ALTER TABLE "b2b_escrow_requests" ADD COLUMN IF NOT EXISTS "transaction_ref" text;
      ALTER TABLE "b2b_escrow_requests" ADD COLUMN IF NOT EXISTS "admin_notes" text;
    `);
  } catch (e) {
    console.error('ensureTable escrow error:', e);
  }
}

export async function GET(request: Request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    let rows;
    if (phone && phone.trim()) {
      const cleanPhone = phone.replace(/\D/g, '');
      const last8Digits = cleanPhone.length >= 8 ? cleanPhone.slice(-8) : cleanPhone;
      const res = await pool.query(
        `SELECT * FROM "b2b_escrow_requests" 
         WHERE "seller_phone" ILIKE $1 OR "buyer_phone" ILIKE $1 
         ORDER BY "id" DESC`,
        [`%${last8Digits}%`]
      );
      rows = res.rows;
    } else {
      const res = await pool.query(`SELECT * FROM "b2b_escrow_requests" ORDER BY "id" DESC`);
      rows = res.rows;
    }

    return NextResponse.json({
      status: 'success',
      requests: rows,
    });
  } catch (error: any) {
    console.error('B2B escrow GET error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'فشل جلب طلبات الوساطة' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();

    const body = await request.json();
    const {
      offerId,
      offerTitle,
      buyerName,
      buyerPhone,
      sellerName,
      sellerPhone,
      agreedPrice,
      notes,
      paymentReceipt,
      transactionRef,
    } = body;

    if (!offerId || !buyerName || !buyerPhone || !sellerName || !sellerPhone) {
      return NextResponse.json(
        { status: 'error', message: 'يرجى إكمال جميع حقول اسم المشتري وهاتفه وبيانات الإعلان.' },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(b2bEscrowRequests)
      .values({
        offerId: Number(offerId),
        offerTitle: offerTitle || 'عرض في السوق الشامل',
        buyerName: buyerName.trim(),
        buyerPhone: buyerPhone.trim(),
        sellerName: sellerName.trim(),
        sellerPhone: sellerPhone.trim(),
        agreedPrice: agreedPrice ? Number(agreedPrice) : null,
        notes: notes || null,
        status: 'pending',
        paymentReceipt: paymentReceipt || null,
        transactionRef: transactionRef || null,
      })
      .returning();

    return NextResponse.json({
      status: 'success',
      escrowRequest: created,
      message: 'تم إرسال طلب الوساطة الآمنة لإدارة المنصة بنجاح! سيتواصل معك أحد ممثلي البورصة لتأمين المعاملة.',
    });
  } catch (error: any) {
    console.error('B2B escrow post error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'حدث خطأ أثناء تقديم طلب الوساطة' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureTable();

    const body = await request.json();
    const { id, status, adminNotes } = body;

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'معرف طلب الوساطة مطلوب' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const [updated] = await db
      .update(b2bEscrowRequests)
      .set(updateData)
      .where(eq(b2bEscrowRequests.id, Number(id)))
      .returning();

    return NextResponse.json({
      status: 'success',
      escrowRequest: updated,
      message: 'تم تحديث حالة طلب الوساطة بنجاح.',
    });
  } catch (error: any) {
    console.error('B2B escrow PATCH error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'فشل تحديث حالة الوساطة' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureTable();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'معرف طلب الوساطة مطلوب' },
        { status: 400 }
      );
    }

    await db
      .delete(b2bEscrowRequests)
      .where(eq(b2bEscrowRequests.id, Number(id)));

    return NextResponse.json({
      status: 'success',
      message: 'تم حذف طلب الوساطة بنجاح.',
    });
  } catch (error: any) {
    console.error('B2B escrow DELETE error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'فشل حذف طلب الوساطة' },
      { status: 500 }
    );
  }
}
