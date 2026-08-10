import { NextResponse } from 'next/server';
import {
  seedOffersForWilaya,
  seedOffersForMultipleWilayas,
  seedAllWilayas,
  updateOfficialPriceBoard,
  updateMultipleOfficialPrices,
  updateAllOfficialPrices,
} from '@/lib/bot-seeder';

async function handleBotTrigger(params: {
  action?: string;
  mode?: string;
  wilayaCode?: string;
  wilayaCodes?: string[];
  farmerPrice?: number;
  minFarmerPrice?: number;
  maxFarmerPrice?: number;
  slaughterPrice?: number;
  intermediaryPrice?: number;
  pumpOffers?: boolean;
}) {
  const {
    action,
    mode = 'single',
    wilayaCode,
    wilayaCodes,
    farmerPrice = 280,
    minFarmerPrice,
    maxFarmerPrice,
    slaughterPrice,
    intermediaryPrice,
    pumpOffers = true,
  } = params;

  const minP = minFarmerPrice ?? farmerPrice;
  const maxP = maxFarmerPrice ?? farmerPrice;

  // Mode 1: ALL 58 Wilayas
  if (action === 'all' || mode === 'all') {
    if (pumpOffers) {
      const res = await seedAllWilayas(farmerPrice, minP, maxP);
      return {
        status: 'success',
        message: `تم ضخ 15 عرضاً بالحسابات الوهمية وتحديث الأسعار لجميع الـ 58 ولاية بنجاح.`,
        result: res,
      };
    } else {
      const res = await updateAllOfficialPrices(farmerPrice, minP, maxP);
      return {
        status: 'success',
        message: `تم تحديث جدول الأسعار الرسمية فقط لجميع الـ 58 ولاية بنجاح.`,
        result: res,
      };
    }
  }

  // Mode 2: Multiple Selected Wilayas
  if (mode === 'multiple' || (wilayaCodes && ((Array.isArray(wilayaCodes) && wilayaCodes.length > 0) || String(wilayaCodes).trim()))) {
    const rawCodes = Array.isArray(wilayaCodes) ? wilayaCodes.join(',') : String(wilayaCodes || '');
    const codes = rawCodes
      .split(',')
      .map((c) => String(c).trim().padStart(2, '0'))
      .filter((c) => c && c !== '00');
    
    if (pumpOffers) {
      const res = await seedOffersForMultipleWilayas(codes, farmerPrice, minP, maxP);
      return {
        status: 'success',
        message: `تم ضخ العروض بالحسابات الوهمية لـ ${res.count} ولاية مختارة بنجاح.`,
        result: res,
      };
    } else {
      const res = await updateMultipleOfficialPrices(codes, farmerPrice, intermediaryPrice, slaughterPrice);
      return {
        status: 'success',
        message: `تم تحديث جدول الأسعار الرسمية لـ ${res.count} ولاية مختارة بنجاح.`,
        result: res,
      };
    }
  }

  // Mode 3: Single Wilaya
  if (wilayaCode) {
    const codePadded = String(wilayaCode).padStart(2, '0');
    if (pumpOffers) {
      const res = await seedOffersForWilaya({
        wilayaCode: codePadded,
        farmerPrice,
        minFarmerPrice: minP,
        maxFarmerPrice: maxP,
      });
      return {
        status: 'success',
        message: `تم ضخ 15 عرضاً بالحسابات الوهمية لـ ولاية ${res.wilayaName} (${res.wilayaCode}) بسعر ${res.farmerPrice} د.ج.`,
        result: res,
      };
    } else {
      const brokerP = intermediaryPrice ?? Math.max(0, farmerPrice - 7);
      const slaughterP = slaughterPrice ?? Math.max(0, farmerPrice - 15);
      const res = await updateOfficialPriceBoard(codePadded, farmerPrice, brokerP, slaughterP);
      return {
        status: 'success',
        message: `تم تحديث جدول أسعار ولاية ${res.wilayaName} (${res.wilayaCode}) بنجاح.`,
        result: res,
      };
    }
  }

  return {
    status: 'info',
    message: 'يرجى تحديد الولاية أو خيار الولايات المتعددة أو خيار الجميع لضخ العروض.',
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wilayaCode = searchParams.get('wilayaCode') || searchParams.get('code') || undefined;
  const codesStr = searchParams.get('wilayaCodes') || searchParams.get('codes');
  const wilayaCodes = codesStr ? codesStr.split(',') : undefined;
  const priceStr = searchParams.get('farmerPrice') || searchParams.get('price');
  const minPriceStr = searchParams.get('minFarmerPrice') || searchParams.get('minPrice');
  const maxPriceStr = searchParams.get('maxFarmerPrice') || searchParams.get('maxPrice');
  const action = searchParams.get('action') || undefined;
  const mode = searchParams.get('mode') || (action === 'all' ? 'all' : wilayaCodes ? 'multiple' : 'single');
  const pumpOffers = searchParams.get('pumpOffers') !== 'false';

  try {
    const farmerPrice = priceStr ? Number(priceStr) : 280;
    const minFarmerPrice = minPriceStr ? Number(minPriceStr) : farmerPrice;
    const maxFarmerPrice = maxPriceStr ? Number(maxPriceStr) : farmerPrice;

    const res = await handleBotTrigger({
      action,
      mode,
      wilayaCode,
      wilayaCodes,
      farmerPrice,
      minFarmerPrice,
      maxFarmerPrice,
      pumpOffers,
    });
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await handleBotTrigger(body);
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message || 'خطأ في تشغيل البوت' }, { status: 500 });
  }
}
