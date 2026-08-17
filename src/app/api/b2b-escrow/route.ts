import { NextResponse } from 'next/server';
import { db, pool } from '@/db';
import { b2bEscrowRequests } from '@/db/schema';

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
        "created_at" timestamp DEFAULT now()
      );
    `);
  } catch (e) {
    console.error('ensureTable escrow error:', e);
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();

    const body = await request.json();
    const { offerId, offerTitle, buyerName, buyerPhone, sellerName, sellerPhone, agreedPrice, notes } = body;

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
      })
      .returning();

    return NextResponse.json({
      status: 'success',
      escrowRequest: created,
      message: 'تم إرسال طلب الوساطة الآمنة لإدارة المنصة بنجاح! سيتواصل معك أحد ممثلي البورصة لتأمين المعاملة.',
    });
  } catch (error: any) {
    console.error('B2B escrow post error:', error);
    return NextResponse.json({ status: 'error', message: error.message || 'حدث خطأ أثناء تقديم طلب الوساطة' }, { status: 500 });
  }
}
