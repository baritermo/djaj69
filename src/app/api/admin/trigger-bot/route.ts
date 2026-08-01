import { NextResponse } from 'next/server';
import { seedOffersForWilaya, seedAllWilayas } from '@/lib/bot-seeder';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wilayaCode = searchParams.get('wilayaCode') || searchParams.get('code');
  const priceStr = searchParams.get('farmerPrice') || searchParams.get('price');
  const action = searchParams.get('action');

  try {
    if (action === 'all' || searchParams.get('all') === 'true') {
      const basePrice = priceStr ? Number(priceStr) : 280;
      const res = await seedAllWilayas(basePrice);
      return NextResponse.json({
        status: 'success',
        message: `تم تحديث الـ 58 ولاية بنجاح بنسبة متوسطة ${basePrice} د.ج للفلاح.`,
        result: res,
      });
    }

    if (wilayaCode && priceStr) {
      const res = await seedOffersForWilaya({
        wilayaCode: String(wilayaCode).padStart(2, '0'),
        farmerPrice: Number(priceStr),
      });
      return NextResponse.json({
        status: 'success',
        message: `تم تحديث ولاية ${res.wilayaName} (${res.wilayaCode}) بنجاح بسعر فلاح ${res.farmerPrice} د.ج وتم إنشاء 15 عرضاً.`,
        result: res,
      });
    }

    return NextResponse.json({
      status: 'info',
      instructions: 'تحديث ولاية: /api/admin/trigger-bot?code=19&price=285 | تحديث الكل: /api/admin/trigger-bot?action=all&price=280',
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
