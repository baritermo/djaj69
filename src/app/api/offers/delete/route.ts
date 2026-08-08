import { NextResponse } from 'next/server';
import { db } from '@/db';
import { marketOffers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ status: 'error', message: 'معرف العرض مطلوب' }, { status: 400 });
    }
    await db.delete(marketOffers).where(eq(marketOffers.id, Number(id)));
    return NextResponse.json({ status: 'success', id: Number(id) });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return DELETE(request);
}
