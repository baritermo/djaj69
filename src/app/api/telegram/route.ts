import { NextResponse } from 'next/server';
import {
  seedOffersForWilaya,
  seedOffersForMultipleWilayas,
  seedAllWilayas,
  updateOfficialPriceBoard,
  updateAllOfficialPrices,
  updateMultipleOfficialPrices,
  deleteOfficialPriceForWilaya,
  deleteAllOfficialPrices,
  deleteAllOffers,
  approveUserSubscription,
  rejectUserSubscription,
  getOfficialPriceForWilaya,
} from '@/lib/bot-seeder';
import { ALGERIA_WILAYAS, getWilayaByCode } from '@/lib/algeria-data';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID;
const ADMIN_CHANNEL_CHAT_ID = process.env.ADMIN_CHANNEL_CHAT_ID;

function isAdminChat(chatId: string): boolean {
  const allowed = [
    ...(ADMIN_CHAT_ID || '').split(','),
    ...(ADMIN_CHANNEL_CHAT_ID || '').split(','),
    '1636837664',
    '-1004308858796',
  ].map((s) => s.trim()).filter(Boolean);
  return allowed.includes(String(chatId));
}

// In-memory state maps for step-by-step wizards
const USER_WILAYA_STATE = new Map<string, string>(); // For single wilaya B2B offer seeder
const USER_BOARD_STATE = new Map<string, string>();  // For single wilaya official board update
const USER_ALL_BOARD_STATE = new Map<string, boolean>(); // For FULL 58 wilayas OFFICIAL BOARD update ONLY
const USER_MULTI_SELECT_STATE = new Map<string, Set<string>>(); // For multi-wilayas interactive selection wizard (Prices)
const USER_MULTI_WAITING_PRICE = new Map<string, Set<string>>(); // Waiting for price for multi-wilayas (Prices)

const USER_OFFER_MULTI_SELECT_STATE = new Map<string, Set<string>>(); // For multi-wilayas interactive selection wizard (Offers)
const USER_OFFER_MULTI_WAITING_PRICE = new Map<string, Set<string>>(); // Waiting for price for multi-wilayas (Offers)

// Helper: Parse single price or price range (e.g. "280 315", "280-315", "من 280 الى 315")
function parsePriceInput(text: string): { minPrice: number; maxPrice: number } | null {
  const numbers = text.match(/\d{2,4}/g);
  if (!numbers || numbers.length === 0) return null;

  if (numbers.length === 1) {
    const val = Number(numbers[0]);
    return { minPrice: val, maxPrice: val };
  }

  if (numbers.length >= 2) {
    const n1 = Number(numbers[0]);
    const n2 = Number(numbers[1]);
    return {
      minPrice: Math.min(n1, n2),
      maxPrice: Math.max(n1, n2),
    };
  }

  return null;
}

// Helper: Parse direct multi-wilaya price update string format (e.g. "16 10 19 09: 295" or "الجزائر البليدة سطيف: 295 285 270")
function parseMultiWilayaInput(text: string): {
  wilayaCodes: string[];
  farmerPrice: number;
  brokerPrice?: number;
  slaughterPrice?: number;
} | null {
  if (!text.includes(':') && !text.includes('=')) return null;

  const parts = text.split(/[:=]/);
  if (parts.length < 2) return null;

  const leftPart = parts[0];
  const rightPart = parts[1];

  const detectedWilayas = new Set<string>();

  const codeMatches = leftPart.match(/\b\d{1,2}\b/g);
  if (codeMatches) {
    for (const m of codeMatches) {
      const codePadded = String(m).padStart(2, '0');
      const w = getWilayaByCode(codePadded);
      if (w) detectedWilayas.add(w.code);
    }
  }

  for (const w of ALGERIA_WILAYAS) {
    if (leftPart.includes(w.nameAr)) {
      detectedWilayas.add(w.code);
    }
  }

  if (detectedWilayas.size === 0) return null;

  const priceMatches = rightPart.match(/\b\d{2,4}\b/g);
  if (!priceMatches || priceMatches.length === 0) return null;

  const farmerPrice = Number(priceMatches[0]);
  const brokerPrice = priceMatches.length >= 2 ? Number(priceMatches[1]) : undefined;
  const slaughterPrice = priceMatches.length >= 3 ? Number(priceMatches[2]) : undefined;

  return {
    wilayaCodes: Array.from(detectedWilayas),
    farmerPrice,
    brokerPrice,
    slaughterPrice,
  };
}

// Helper: Parse direct multi-wilaya offer seeder string format (e.g. "ضخ 16 10 19 09: 295" or "عروض الجزائر البليدة سطيف: 290 315")
function parseMultiWilayaOfferInput(text: string): {
  wilayaCodes: string[];
  minPrice: number;
  maxPrice: number;
} | null {
  const isOfferCmd = text.includes('ضخ') || text.includes('عروض') || text.includes('نشر عروض') || text.includes('عروض السوق');
  if (!isOfferCmd) return null;

  const parts = text.split(/[:=]/);
  if (parts.length < 2) return null;

  const leftPart = parts[0];
  const rightPart = parts[1];

  const detectedWilayas = new Set<string>();

  const codeMatches = leftPart.match(/\b\d{1,2}\b/g);
  if (codeMatches) {
    for (const m of codeMatches) {
      const codePadded = String(m).padStart(2, '0');
      const w = getWilayaByCode(codePadded);
      if (w) detectedWilayas.add(w.code);
    }
  }

  for (const w of ALGERIA_WILAYAS) {
    if (leftPart.includes(w.nameAr)) {
      detectedWilayas.add(w.code);
    }
  }

  if (detectedWilayas.size === 0) return null;

  const parsedPrices = parsePriceInput(rightPart);
  if (!parsedPrices) return null;

  return {
    wilayaCodes: Array.from(detectedWilayas),
    minPrice: parsedPrices.minPrice,
    maxPrice: parsedPrices.maxPrice,
  };
}

// Main Persistent Reply Keyboard
const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: '🎯 تحديث أسعار مجموعة ولايات محددة' }],
    [{ text: '📢 ضخ عروض في مجموعة ولايات محددة' }],
    [{ text: '📊 تحديث أسعار بورصة ولاية واحدة' }, { text: '🌐 تحديث كلي لـ 58 ولاية' }],
    [{ text: '📢 ضخ عروض في ولاية واحدة' }],
    [{ text: '📍 سطيف (19)' }, { text: '📍 الجزائر (16)' }, { text: '📍 البليدة (09)' }, { text: '📍 وهران (31)' }],
    [{ text: '🗑️ حذف كافة عروض السوق' }, { text: '🗑️ حذف كلي لأسعار البورصة' }],
    [{ text: '❓ مساعدة ودليل الأوامر' }],
  ],
  resize_keyboard: true,
};

// Helper 1: Build Paginated 58 Wilayas Keyboard for Offer Seeder (Single Wilaya)
function getWilayasKeyboard(page: number = 1) {
  const pageSize = 20;
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageWilayas = ALGERIA_WILAYAS.slice(startIdx, endIdx);

  const rows: any[][] = [];
  let currentRow: any[] = [];

  for (let i = 0; i < pageWilayas.length; i++) {
    const w = pageWilayas[i];
    currentRow.push({
      text: `${w.code} - ${w.nameAr}`,
      callback_data: `select_wilaya_${w.code}`,
    });

    if (currentRow.length === 2 || i === pageWilayas.length - 1) {
      rows.push(currentRow);
      currentRow = [];
    }
  }

  // Navigation row
  const navRow: any[] = [];
  if (page > 1) {
    navRow.push({ text: '◀️ السابقة', callback_data: `wilaya_page_${page - 1}` });
  }
  navRow.push({ text: `صفحة ${page} من 3`, callback_data: 'noop' });
  if (page < 3) {
    navRow.push({ text: 'التالية ▶️', callback_data: `wilaya_page_${page + 1}` });
  }
  rows.push(navRow);

  return { inline_keyboard: rows };
}

// Helper 2: Build Paginated 58 Wilayas Keyboard for Single Wilaya Official Board Update
function getBoardWilayasKeyboard(page: number = 1) {
  const pageSize = 20;
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageWilayas = ALGERIA_WILAYAS.slice(startIdx, endIdx);

  const rows: any[][] = [];
  let currentRow: any[] = [];

  for (let i = 0; i < pageWilayas.length; i++) {
    const w = pageWilayas[i];
    currentRow.push({
      text: `${w.code} - ${w.nameAr}`,
      callback_data: `select_board_wilaya_${w.code}`,
    });

    if (currentRow.length === 2 || i === pageWilayas.length - 1) {
      rows.push(currentRow);
      currentRow = [];
    }
  }

  // Navigation row
  const navRow: any[] = [];
  if (page > 1) {
    navRow.push({ text: '◀️ السابقة', callback_data: `board_page_${page - 1}` });
  }
  navRow.push({ text: `صفحة ${page} من 3`, callback_data: 'noop' });
  if (page < 3) {
    navRow.push({ text: 'التالية ▶️', callback_data: `board_page_${page + 1}` });
  }
  rows.push(navRow);

  return { inline_keyboard: rows };
}

// Helper 3: Build Multi-Select Wilayas Keyboard for Price Updates
function getMultiSelectWilayasKeyboard(selectedCodes: Set<string>, page: number = 1) {
  const pageSize = 18;
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageWilayas = ALGERIA_WILAYAS.slice(startIdx, endIdx);

  const rows: any[][] = [];
  let currentRow: any[] = [];

  for (let i = 0; i < pageWilayas.length; i++) {
    const w = pageWilayas[i];
    const isSelected = selectedCodes.has(w.code);
    const icon = isSelected ? '✅' : '⬜';
    currentRow.push({
      text: `${icon} ${w.code}-${w.nameAr}`,
      callback_data: `toggle_multi_${w.code}_${page}`,
    });

    if (currentRow.length === 2 || i === pageWilayas.length - 1) {
      rows.push(currentRow);
      currentRow = [];
    }
  }

  // Navigation row
  const navRow: any[] = [];
  if (page > 1) {
    navRow.push({ text: '◀️ السابقة', callback_data: `multi_page_${page - 1}` });
  }
  navRow.push({ text: `صفحة ${page} من 4`, callback_data: 'noop' });
  if (page < 4) {
    navRow.push({ text: 'التالية ▶️', callback_data: `multi_page_${page + 1}` });
  }
  rows.push(navRow);

  // Action / Confirm row
  if (selectedCodes.size > 0) {
    rows.push([
      {
        text: `⚡ تأكيد تحديث أسعار (${selectedCodes.size}) ولايات وإدخال السعر ➡️`,
        callback_data: 'confirm_multi_select',
      },
    ]);
  }

  return { inline_keyboard: rows };
}

// Helper 4: Build Multi-Select Wilayas Keyboard for Offer Seeder
function getMultiSelectOfferWilayasKeyboard(selectedCodes: Set<string>, page: number = 1) {
  const pageSize = 18;
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageWilayas = ALGERIA_WILAYAS.slice(startIdx, endIdx);

  const rows: any[][] = [];
  let currentRow: any[] = [];

  for (let i = 0; i < pageWilayas.length; i++) {
    const w = pageWilayas[i];
    const isSelected = selectedCodes.has(w.code);
    const icon = isSelected ? '✅' : '⬜';
    currentRow.push({
      text: `${icon} ${w.code}-${w.nameAr}`,
      callback_data: `toggle_offer_multi_${w.code}_${page}`,
    });

    if (currentRow.length === 2 || i === pageWilayas.length - 1) {
      rows.push(currentRow);
      currentRow = [];
    }
  }

  // Navigation row
  const navRow: any[] = [];
  if (page > 1) {
    navRow.push({ text: '◀️ السابقة', callback_data: `offer_multi_page_${page - 1}` });
  }
  navRow.push({ text: `صفحة ${page} من 4`, callback_data: 'noop' });
  if (page < 4) {
    navRow.push({ text: 'التالية ▶️', callback_data: `offer_multi_page_${page + 1}` });
  }
  rows.push(navRow);

  // Action / Confirm row
  if (selectedCodes.size > 0) {
    rows.push([
      {
        text: `⚡ تأكيد ضخ عروض في (${selectedCodes.size}) ولايات وإرسال السعر ➡️`,
        callback_data: 'confirm_offer_multi_select',
      },
    ]);
  }

  return { inline_keyboard: rows };
}

async function sendTelegramMessage(chatId: number | string, text: string, replyMarkup?: any) {
  if (!TELEGRAM_BOT_TOKEN) return;
  try {
    const payload: Record<string, any> = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('Telegram send message error:', e);
  }
}

async function editTelegramMessageText(chatId: number | string, messageId: number, text: string, replyMarkup?: any) {
  if (!TELEGRAM_BOT_TOKEN) return;
  try {
    const payload: Record<string, any> = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('Telegram edit message text error:', e);
  }
}

async function answerCallbackQuery(callbackQueryId: string, text: string) {
  if (!TELEGRAM_BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: false,
      }),
    });
  } catch (e) {
    console.error('Answer callback query error:', e);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wilayaCode = searchParams.get('wilayaCode') || searchParams.get('code');
  const priceStr = searchParams.get('farmerPrice') || searchParams.get('price');
  const action = searchParams.get('action');

  if (action === 'all' || searchParams.get('all') === 'true') {
    const basePrice = priceStr ? Number(priceStr) : 280;
    const res = await updateAllOfficialPrices(basePrice);
    return NextResponse.json({
      status: 'success',
      message: `تم تحديث جدول أسعار البورصة الرسمية للـ 58 ولاية بنجاح بنسبة متوسطة ${basePrice} د.ج للفلاح.`,
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
    instructions: 'استخدم الأزرار التفاعلية في البوت.',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Handle Inline Keyboard Button Clicks (Callback Queries)
    if (body.callback_query) {
      const cb = body.callback_query;
      const chatId = String(cb.message?.chat?.id || '');
      const fromId = String(cb.from?.id || '');
      const dataStr = cb.data;

      if (!isAdminChat(chatId) && !isAdminChat(fromId)) {
        await answerCallbackQuery(cb.id, '⛔ غير مصرح بك.');
        return NextResponse.json({ status: 'unauthorized' });
      }

      // Action: Admin clicked APPROVE USER SUBSCRIPTION from Telegram
      if (dataStr.startsWith('approve_sub_')) {
        const targetPhone = dataStr.replace('approve_sub_', '');
        await answerCallbackQuery(cb.id, `⏳ جاري تفعيل اشتراك ${targetPhone}...`);

        const res = await approveUserSubscription(targetPhone);
        const userName = res?.fullName || targetPhone;

        const updatedKeyboard = {
          inline_keyboard: [
            [{ text: `✅ تم تفعيل اشتراك (${userName}) بنجاح`, callback_data: 'noop' }],
          ],
        };

        const alertText = `
✅ <b>تم تفعيل اشتراك الحساب بنجاح من تليجرام!</b>

• 📝 الاسم واللقب: <b>${userName}</b>
• 📱 رقم الهاتف: <code>${targetPhone}</code>
• 🟢 الحالة الحالية: <b>مفعل (Active)</b>

✨ يستطيع المستخدم الآن الدخول وتصفح جميع أقسام البورصة.
        `;

        if (cb.message?.message_id) {
          await editTelegramMessageText(chatId, cb.message.message_id, alertText, updatedKeyboard);
        } else {
          await sendTelegramMessage(chatId, alertText, MAIN_KEYBOARD);
        }
        return NextResponse.json({ status: 'ok' });
      }

      // Action: Admin clicked REJECT USER SUBSCRIPTION from Telegram
      if (dataStr.startsWith('reject_sub_')) {
        const targetPhone = dataStr.replace('reject_sub_', '');
        await answerCallbackQuery(cb.id, `⏳ جاري رفض طلب ${targetPhone}...`);

        const res = await rejectUserSubscription(targetPhone);
        const userName = res?.fullName || targetPhone;

        const updatedKeyboard = {
          inline_keyboard: [
            [{ text: `❌ تم رفض طلب (${userName})`, callback_data: 'noop' }],
          ],
        };

        const alertText = `
❌ <b>تم رفض طلب اشتراك الحساب من تليجرام.</b>

• 📝 الاسم واللقب: <b>${userName}</b>
• 📱 رقم الهاتف: <code>${targetPhone}</code>
• 🔴 الحالة الحالية: <b>مرفوض (Rejected)</b>
        `;

        if (cb.message?.message_id) {
          await editTelegramMessageText(chatId, cb.message.message_id, alertText, updatedKeyboard);
        } else {
          await sendTelegramMessage(chatId, alertText, MAIN_KEYBOARD);
        }
        return NextResponse.json({ status: 'ok' });
      }

      // Multi-Select Wilayas Pagination (Prices)
      if (dataStr.startsWith('multi_page_')) {
        const pageNum = Number(dataStr.replace('multi_page_', ''));
        const currentSet = USER_MULTI_SELECT_STATE.get(chatId) || new Set<string>();
        await answerCallbackQuery(cb.id, `الصفحة ${pageNum}`);
        await sendTelegramMessage(
          chatId,
          `🎯 <b>اختر الولايات المراد تحديث أسعارها معاً (محدد: ${currentSet.size} ولاية):</b>`,
          getMultiSelectWilayasKeyboard(currentSet, pageNum)
        );
        return NextResponse.json({ status: 'ok' });
      }

      // Multi-Select Wilaya Toggle (Prices)
      if (dataStr.startsWith('toggle_multi_')) {
        const parts = dataStr.replace('toggle_multi_', '').split('_');
        const wilayaCode = parts[0];
        const pageNum = Number(parts[1] || 1);

        let currentSet = USER_MULTI_SELECT_STATE.get(chatId);
        if (!currentSet) {
          currentSet = new Set<string>();
          USER_MULTI_SELECT_STATE.set(chatId, currentSet);
        }

        if (currentSet.has(wilayaCode)) {
          currentSet.delete(wilayaCode);
          await answerCallbackQuery(cb.id, `تم إلغاء ولاية ${wilayaCode}`);
        } else {
          currentSet.add(wilayaCode);
          await answerCallbackQuery(cb.id, `تم تحديد ولاية ${wilayaCode}`);
        }

        await sendTelegramMessage(
          chatId,
          `🎯 <b>اختر الولايات المراد تحديث أسعارها معاً (محدد: ${currentSet.size} ولاية):</b>`,
          getMultiSelectWilayasKeyboard(currentSet, pageNum)
        );
        return NextResponse.json({ status: 'ok' });
      }

      // Multi-Select Confirm Selection & Prompt for Price (Prices)
      if (dataStr === 'confirm_multi_select') {
        const currentSet = USER_MULTI_SELECT_STATE.get(chatId);
        if (!currentSet || currentSet.size === 0) {
          await answerCallbackQuery(cb.id, '⚠️ لم تقم بتحديد أي ولاية.');
          return NextResponse.json({ status: 'ok' });
        }

        USER_MULTI_WAITING_PRICE.set(chatId, new Set(currentSet));
        USER_MULTI_SELECT_STATE.delete(chatId);

        await answerCallbackQuery(cb.id, 'تأكيد الولايات');

        const selectedNames = Array.from(currentSet)
          .map((c) => {
            const w = getWilayaByCode(c);
            return `${c}-${w?.nameAr}`;
          })
          .join(', ');

        const promptText = `
🎯 <b>تم تحديد (${currentSet.size}) ولاية بنجاح:</b>
<code>${selectedNames}</code>

✏️ <b>أرسل السعر المطلوب كرسالة نصية لجميع الولايات المحددة:</b>
• <b>سعر فلاح واحد:</b> أرسل الرقم فقط (مثال: <code>295</code>)
• <b>أسعار الفلاح والكورتي والمذبح:</b> أرسل الـ 3 أرقام (مثال: <code>295 285 275</code>)
        `;
        await sendTelegramMessage(chatId, promptText);
        return NextResponse.json({ status: 'ok' });
      }

      // Multi-Select Wilayas Pagination (Offers)
      if (dataStr.startsWith('offer_multi_page_')) {
        const pageNum = Number(dataStr.replace('offer_multi_page_', ''));
        const currentSet = USER_OFFER_MULTI_SELECT_STATE.get(chatId) || new Set<string>();
        await answerCallbackQuery(cb.id, `الصفحة ${pageNum}`);
        await sendTelegramMessage(
          chatId,
          `📢 <b>اختر الولايات المراد ضخ العروض فيها معاً (محدد: ${currentSet.size} ولاية):</b>`,
          getMultiSelectOfferWilayasKeyboard(currentSet, pageNum)
        );
        return NextResponse.json({ status: 'ok' });
      }

      // Multi-Select Wilaya Toggle (Offers)
      if (dataStr.startsWith('toggle_offer_multi_')) {
        const parts = dataStr.replace('toggle_offer_multi_', '').split('_');
        const wilayaCode = parts[0];
        const pageNum = Number(parts[1] || 1);

        let currentSet = USER_OFFER_MULTI_SELECT_STATE.get(chatId);
        if (!currentSet) {
          currentSet = new Set<string>();
          USER_OFFER_MULTI_SELECT_STATE.set(chatId, currentSet);
        }

        if (currentSet.has(wilayaCode)) {
          currentSet.delete(wilayaCode);
          await answerCallbackQuery(cb.id, `تم إلغاء ولاية ${wilayaCode}`);
        } else {
          currentSet.add(wilayaCode);
          await answerCallbackQuery(cb.id, `تم تحديد ولاية ${wilayaCode}`);
        }

        await sendTelegramMessage(
          chatId,
          `📢 <b>اختر الولايات المراد ضخ العروض فيها معاً (محدد: ${currentSet.size} ولاية):</b>`,
          getMultiSelectOfferWilayasKeyboard(currentSet, pageNum)
        );
        return NextResponse.json({ status: 'ok' });
      }

      // Multi-Select Confirm Selection & Prompt for Price (Offers)
      if (dataStr === 'confirm_offer_multi_select') {
        const currentSet = USER_OFFER_MULTI_SELECT_STATE.get(chatId);
        if (!currentSet || currentSet.size === 0) {
          await answerCallbackQuery(cb.id, '⚠️ لم تقم بتحديد أي ولاية.');
          return NextResponse.json({ status: 'ok' });
        }

        USER_OFFER_MULTI_WAITING_PRICE.set(chatId, new Set(currentSet));
        USER_OFFER_MULTI_SELECT_STATE.delete(chatId);

        await answerCallbackQuery(cb.id, 'تأكيد الولايات');

        const selectedNames = Array.from(currentSet)
          .map((c) => {
            const w = getWilayaByCode(c);
            return `${c}-${w?.nameAr}`;
          })
          .join(', ');

        const promptText = `
📢 <b>تم تحديد (${currentSet.size}) ولاية لضخ العروض بنجاح:</b>
<code>${selectedNames}</code>

✏️ <b>أدخل السعر المطلوب لضخ العروض كرسالة نصية:</b>
• <b>سعر محدد:</b> أرسل الرقم فقط (مثال: <code>285</code>)
• <b>نطاق سعر عشوائي:</b> أرسل النطاق (مثال: <code>280 315</code> أو <code>من 280 إلى 315</code>)
        `;
        await sendTelegramMessage(chatId, promptText);
        return NextResponse.json({ status: 'ok' });
      }

      // Offer Seeder Pagination
      if (dataStr.startsWith('wilaya_page_')) {
        const pageNum = Number(dataStr.replace('wilaya_page_', ''));
        await answerCallbackQuery(cb.id, `الصفحة ${pageNum}`);
        await sendTelegramMessage(
          chatId,
          `🇩🇿 <b>قائمة الولايات (صفحة ${pageNum} من 3): اختر الولاية المراد نشر العروض فيها:</b>`,
          getWilayasKeyboard(pageNum)
        );
        return NextResponse.json({ status: 'ok' });
      }

      // Official Board Update Pagination
      if (dataStr.startsWith('board_page_')) {
        const pageNum = Number(dataStr.replace('board_page_', ''));
        await answerCallbackQuery(cb.id, `الصفحة ${pageNum}`);
        await sendTelegramMessage(
          chatId,
          `📊 <b>تحديث أسعار البورصة الرسمية (صفحة ${pageNum} من 3): اختر الولاية:</b>`,
          getBoardWilayasKeyboard(pageNum)
        );
        return NextResponse.json({ status: 'ok' });
      }

      // Step 1 for Offer Seeder: User Selected a Single Wilaya
      if (dataStr.startsWith('select_wilaya_')) {
        const wilayaCode = dataStr.replace('select_wilaya_', '');
        USER_WILAYA_STATE.set(chatId, wilayaCode);
        USER_BOARD_STATE.delete(chatId);
        USER_ALL_BOARD_STATE.delete(chatId);
        USER_MULTI_WAITING_PRICE.delete(chatId);
        USER_OFFER_MULTI_WAITING_PRICE.delete(chatId);
        const wilaya = getWilayaByCode(wilayaCode);

        await answerCallbackQuery(cb.id, `تم اختيار ${wilaya?.nameAr}`);

        const inlinePrices = {
          inline_keyboard: [
            [
              { text: '💰 275 د.ج', callback_data: `post_${wilayaCode}_275` },
              { text: '💰 280 د.ج', callback_data: `post_${wilayaCode}_280` },
              { text: '💰 285 د.ج', callback_data: `post_${wilayaCode}_285` },
            ],
            [
              { text: '💰 290 د.ج', callback_data: `post_${wilayaCode}_290` },
              { text: '💰 295 د.ج', callback_data: `post_${wilayaCode}_295` },
              { text: '💰 300 د.ج', callback_data: `post_${wilayaCode}_300` },
            ],
          ],
        };

        const promptText = `
📍 <b>تم اختيار ولاية: ${wilaya?.nameAr} (${wilayaCode})</b>

✏️ <b>أدخل السعر المطلوب كرسالة نصية:</b>
• <b>سعر محدد:</b> أرسل الرقم فقط (مثال: <code>285</code>)
• <b>نطاق سعر عشوائي:</b> أرسل النطاق (مثال: <code>280 315</code> أو <code>من 280 إلى 315</code>)
• أو اختر من الأسعار السريعة أدناه:
        `;
        await sendTelegramMessage(chatId, promptText, inlinePrices);
        return NextResponse.json({ status: 'ok' });
      }

      // Step 1 for Official Board Control Panel: User Selected a Board Wilaya
      if (dataStr.startsWith('select_board_wilaya_')) {
        const wilayaCode = dataStr.replace('select_board_wilaya_', '');
        const wilaya = getWilayaByCode(wilayaCode);

        await answerCallbackQuery(cb.id, `ولاية ${wilaya?.nameAr}`);

        const existingRecord = await getOfficialPriceForWilaya(wilayaCode);

        let currentPriceText = '⚠️ <i>لا توجد أسعار رسمية مسجلة حالياً لهذه الولاية.</i>';
        if (existingRecord) {
          currentPriceText = `
📌 <b>الأسعار الرسمية المسجلة حالياً:</b>
• 🌾 سعر الفلاح: <b>${existingRecord.farmer_price ?? '—'} د.ج/كغ</b>
• 🤝 سعر الكورتي: <b>${existingRecord.intermediary_price ?? '—'} د.ج/كغ</b>
• 🔪 سعر المذبح: <b>${existingRecord.slaughter_price ?? '—'} د.ج/كغ</b>
          `;
        }

        const controlPanel = {
          inline_keyboard: [
            [{ text: '✏️ إدخال / تعديل الأسعار الـ 3', callback_data: `edit_board_${wilayaCode}` }],
            [{ text: '🗑️ حذف أسعار هذه الولاية', callback_data: `delete_board_ask_${wilayaCode}` }],
          ],
        };

        const promptText = `
📊 <b>لوحة التحكم بأسعار بورصة ولاية: ${wilaya?.nameAr} (${wilayaCode})</b>

${currentPriceText}

👇 <b>اختر الإجراء المطلوب أدناه:</b>
        `;
        await sendTelegramMessage(chatId, promptText, controlPanel);
        return NextResponse.json({ status: 'ok' });
      }

      // Action: User clicked Edit/Input Prices
      if (dataStr.startsWith('edit_board_')) {
        const wilayaCode = dataStr.replace('edit_board_', '');
        USER_BOARD_STATE.set(chatId, wilayaCode);
        USER_WILAYA_STATE.delete(chatId);
        USER_ALL_BOARD_STATE.delete(chatId);
        USER_MULTI_WAITING_PRICE.delete(chatId);
        USER_OFFER_MULTI_WAITING_PRICE.delete(chatId);

        const wilaya = getWilayaByCode(wilayaCode);
        await answerCallbackQuery(cb.id, 'تعديل الأسعار');

        const promptText = `
✏️ <b>إدخال أسعار البورصة لولاية ${wilaya?.nameAr} (${wilayaCode}):</b>

أرسل الأسعار الـ 3 كرسالة نصية واحدة بالترتيب (فلاح ثم كورتي ثم مذبح):
مثال أرسل:
<code>285 278 270</code>

• سعر الفلاح (بيع): <b>285 د.ج</b>
• سعر الكورتي (شراء): <b>278 د.ج</b>
• سعر المذبح (شراء): <b>270 د.ج</b>
        `;
        await sendTelegramMessage(chatId, promptText);
        return NextResponse.json({ status: 'ok' });
      }

      // Action: User clicked Delete Ask for Single Wilaya
      if (dataStr.startsWith('delete_board_ask_')) {
        const wilayaCode = dataStr.replace('delete_board_ask_', '');
        const wilaya = getWilayaByCode(wilayaCode);

        await answerCallbackQuery(cb.id, 'حذف الأسعار');

        const confirmKeyboard = {
          inline_keyboard: [
            [{ text: '✅ موافق على الحذف', callback_data: `delete_board_confirm_${wilayaCode}` }],
            [{ text: '❌ إلغاء', callback_data: 'cancel_board' }],
          ],
        };

        const promptText = `
⚠️ <b>تأكيد الحذف:</b>
هل أنت تأكد من حذف أسعار بورصة ولاية <b>${wilaya?.nameAr} (${wilayaCode})</b> وإزالتها تماماً من الجدول الرسمي بالموقع؟
        `;
        await sendTelegramMessage(chatId, promptText, confirmKeyboard);
        return NextResponse.json({ status: 'ok' });
      }

      // Action: User clicked Delete Confirm for Single Wilaya (✅ موافق على الحذف)
      if (dataStr.startsWith('delete_board_confirm_')) {
        const wilayaCode = dataStr.replace('delete_board_confirm_', '');
        const res = await deleteOfficialPriceForWilaya(wilayaCode);

        await answerCallbackQuery(cb.id, 'تم الحذف بنجاح');

        const successMsg = `
🗑️ <b>تم حذف أسعار بورصة ولاية ${res.wilayaName} (${res.wilayaCode}) بنجاح!</b>
تمت إزالة بيانات الأسعار الرسمية للولاية من الجدول في الموقع.
        `;
        await sendTelegramMessage(chatId, successMsg, MAIN_KEYBOARD);
        return NextResponse.json({ status: 'ok' });
      }

      // Action: User clicked BULK Delete Confirm (✅ موافق وتأكيد الحذف الكلي)
      if (dataStr === 'delete_all_board_confirm') {
        await deleteAllOfficialPrices();
        await answerCallbackQuery(cb.id, 'تم الحذف الكلي بنجاح');

        const successMsg = `
🗑️ <b>تم تفريغ وحذف جميع أسعار بورصة الـ 58 ولاية بنجاح!</b>
أصبح جدول أسعار البورصة في الموقع فارغاً وتظهر الولايات ببيانات غير محدودة لحين تحديثها من جديد.
        `;
        await sendTelegramMessage(chatId, successMsg, MAIN_KEYBOARD);
        return NextResponse.json({ status: 'ok' });
      }

      // Action: User clicked BULK Delete OFFERS Confirm (✅ موافق وتأكيد حذف كافة عروض السوق)
      if (dataStr === 'delete_all_offers_confirm') {
        await deleteAllOffers();
        await answerCallbackQuery(cb.id, 'تم حذف جميع العروض بنجاح');

        const successMsg = `
🗑️ <b>تم حذف وتفريغ جميع عروض سوق البورصة بنجاح!</b>
أصبح سوق العروض والطلبات المباشرة فارغاً تماماً في الموقع لجميع الفئات والولايات.
        `;
        await sendTelegramMessage(chatId, successMsg, MAIN_KEYBOARD);
        return NextResponse.json({ status: 'ok' });
      }

      // Action: Save single board wilaya price confirmation
      if (dataStr.startsWith('save_board_confirm_')) {
        const parts = dataStr.replace('save_board_confirm_', '').split('_');
        const wilayaCode = parts[0];
        const farmerPrice = Number(parts[1]);
        const brokerPrice = Number(parts[2]);
        const slaughterPrice = Number(parts[3]);

        await answerCallbackQuery(cb.id, `جاري الحفظ لـ ${wilayaCode}...`);
        const res = await updateOfficialPriceBoard(wilayaCode, farmerPrice, brokerPrice, slaughterPrice);

        const successMsg = `
✅ <b>تم تحديث أسعار البورصة بنجاح لولاية ${res.wilayaName} (${res.wilayaCode})!</b>

📊 <b>الأسعار الرسمية المسجلة حالياً:</b>
• 🌾 سعر الفلاح (بيع): <b>${res.farmerPrice} د.ج/كغ</b>
• 🤝 سعر الكورتي (شراء): <b>${res.brokerPrice} د.ج/كغ</b>
• 🔪 سعر المذبح (شراء): <b>${res.slaughterPrice} د.ج/كغ</b>

✨ ظهرت هذه الأسعار مباشرة في الجدول الرسمي بالموقع!
        `;
        await sendTelegramMessage(chatId, successMsg, MAIN_KEYBOARD);
        return NextResponse.json({ status: 'ok' });
      }

      if (dataStr === 'cancel_board') {
        await answerCallbackQuery(cb.id, 'تم الإلغاء');
        await sendTelegramMessage(chatId, '❌ <b>تم إلغاء العملية.</b>', MAIN_KEYBOARD);
        return NextResponse.json({ status: 'ok' });
      }

      // Step 2 for Offer Seeder: User Selected a Price Button
      if (dataStr.startsWith('post_')) {
        const parts = dataStr.split('_'); // ["post", "19", "285"]
        const wilayaCode = parts[1];
        const farmerPrice = Number(parts[2]);

        USER_WILAYA_STATE.delete(chatId); // Clear state
        await answerCallbackQuery(cb.id, `⏳ جاري النشر لولاية ${wilayaCode}...`);
        const res = await seedOffersForWilaya({ wilayaCode, farmerPrice });

        const successMsg = `
✅ <b>تم النشر والتحديث بنجاح لولاية ${res.wilayaName} (${res.wilayaCode})!</b>

📊 <b>تفاصيل العروض الـ 15 المولدة:</b>
• 🌾 سعر الفلاح (بيع): <b>${res.farmerPrice} د.ج/كغ</b> (3,000 - 15,000 كغ)
• 🤝 سعر الوسيط (شراء): <b>${res.farmerPrice - 7} د.ج/كغ</b> (1,000 - 1,300 كغ)
• 🔪 سعر المذبح (شراء): <b>${res.farmerPrice - 15} د.ج/كغ</b> (6,000 - 24,000 كغ)
• 🔒 الأرقام مخفية وحسابات متغيرة بنظام الذاكرة.
        `;
        await sendTelegramMessage(chatId, successMsg, MAIN_KEYBOARD);
        return NextResponse.json({ status: 'ok' });
      }
    }

    // 2. Handle Text Messages
    if (body.message && body.message.text) {
      const chatId = String(body.message.chat.id);
      const text = body.message.text.trim();

      // Security check: Only allow admin chat ID
      if (!isAdminChat(chatId)) {
        await sendTelegramMessage(chatId, '⛔ <b>عذراً، هذا البوت مخصص لمشرف البورصة فقط.</b>');
        return NextResponse.json({ status: 'unauthorized' });
      }

      // DIRECT SHORTCUT 1: Direct Multi-Wilaya Offer Seeder Parse (e.g. "ضخ 16 10 19 09: 295" or "عروض الجزائر البليدة سطيف: 290 315")
      const directMultiOffer = parseMultiWilayaOfferInput(text);
      if (directMultiOffer && directMultiOffer.wilayaCodes.length > 0) {
        USER_WILAYA_STATE.delete(chatId);
        USER_BOARD_STATE.delete(chatId);
        USER_ALL_BOARD_STATE.delete(chatId);
        USER_MULTI_WAITING_PRICE.delete(chatId);
        USER_OFFER_MULTI_WAITING_PRICE.delete(chatId);

        const priceText = directMultiOffer.minPrice === directMultiOffer.maxPrice
          ? `بسعر ${directMultiOffer.minPrice} د.ج`
          : `بنطاق سعر من ${directMultiOffer.minPrice} إلى ${directMultiOffer.maxPrice} د.ج`;

        await sendTelegramMessage(
          chatId,
          `⏳ <b>جاري الضخ الدفعي للعروض لـ (${directMultiOffer.wilayaCodes.length}) ولاية ${priceText}...</b>`
        );

        const res = await seedOffersForMultipleWilayas(
          directMultiOffer.wilayaCodes,
          directMultiOffer.minPrice,
          directMultiOffer.maxPrice
        );

        const totalOffersCount = res.count * 15;
        const updatedNamesList = res.seededWilayas
          .map((w: any) => `• ${w.wilayaCode} - ${w.wilayaName} (${w.farmerPrice} د.ج)`)
          .join('\n');

        const successMsg = `
📢 <b>تم ضخ (${totalOffersCount}) عرضاً بنجاح عبر (${res.count}) ولاية محددة!</b>

📍 <b>قائمة الولايات التي تم ضخ 15 عرضاً بكل منها:</b>
${updatedNamesList}

🔒 جميع الأرقام محجوبة ومخفية برغبة الناشر بنظام الذاكرة.
✨ ظهرت العروض فوراً بسوق البورصة في الموقع!
        `;
        await sendTelegramMessage(chatId, successMsg, MAIN_KEYBOARD);
        return NextResponse.json({ status: 'ok' });
      }

      // DIRECT SHORTCUT 2: Direct Multi-Wilaya Price Update Parse (e.g. "16 10 19 09: 295" or "الجزائر البليدة سطيف: 295")
      const directMulti = parseMultiWilayaInput(text);
      if (directMulti && directMulti.wilayaCodes.length > 0) {
        USER_WILAYA_STATE.delete(chatId);
        USER_BOARD_STATE.delete(chatId);
        USER_ALL_BOARD_STATE.delete(chatId);
        USER_MULTI_WAITING_PRICE.delete(chatId);
        USER_OFFER_MULTI_WAITING_PRICE.delete(chatId);

        await sendTelegramMessage(
          chatId,
          `⏳ <b>جاري التحديث الدفعي لـ (${directMulti.wilayaCodes.length}) ولاية بسعر فلاح ${directMulti.farmerPrice} د.ج...</b>`
        );

        const res = await updateMultipleOfficialPrices(
          directMulti.wilayaCodes,
          directMulti.farmerPrice,
          directMulti.brokerPrice,
          directMulti.slaughterPrice
        );

        const updatedNamesList = res.updatedWilayas
          .map((w: any) => `• ${w.code} - ${w.nameAr}`)
          .join('\n');

        const successMsg = `
🎯 <b>تم تحديث أسعار (${res.count}) ولاية محددة بنجاح!</b>

📊 <b>الأسعار التي تم تطبيقها:</b>
• 🌾 سعر الفلاح (بيع): <b>${res.farmerPrice} د.ج/كغ</b>
• 🤝 سعر الكورتي (شراء): <b>${res.brokerPrice} د.ج/كغ</b>
• 🔪 سعر المذبح (شراء): <b>${res.slaughterPrice} د.ج/كغ</b>

📍 <b>قائمة الولايات المحدثة:</b>
${updatedNamesList}

✨ ظهرت التحديثات فوراً بجدول البورصة في الموقع!
        `;
        await sendTelegramMessage(chatId, successMsg, MAIN_KEYBOARD);
        return NextResponse.json({ status: 'ok' });
      }

      // Action 1: BULK DELETE ALL OFFICIAL PRICES FOR ALL 58 WILAYAS
      if (
        text.includes('حذف كلي لأسعار') ||
        text.includes('حذف كلي لجميع أسعار') ||
        text === '/delete_all'
      ) {
        USER_WILAYA_STATE.delete(chatId);
        USER_BOARD_STATE.delete(chatId);
        USER_ALL_BOARD_STATE.delete(chatId);
        USER_MULTI_WAITING_PRICE.delete(chatId);
        USER_OFFER_MULTI_WAITING_PRICE.delete(chatId);

        const confirmKeyboard = {
          inline_keyboard: [
            [{ text: '✅ موافق وتأكيد الحذف الكلي', callback_data: 'delete_all_board_confirm' }],
            [{ text: '❌ إلغاء', callback_data: 'cancel_board' }],
          ],
        };

        const promptText = `
⚠️ <b>تأكيد الحذف الجماعي الكلي:</b>

هل أنت تأكد من تفريغ وحذف جميع أسعار بورصة الـ 58 ولاية وإزالتها تماماً من الجدول الرسمي بالموقع؟
        `;
        await sendTelegramMessage(chatId, promptText, confirmKeyboard);
        return NextResponse.json({ status: 'ok' });
      }

      // Action 1B: BULK DELETE ALL MARKET OFFERS FOR ALL WILAYAS (🗑️ حذف كافة عروض السوق)
      if (
        text.includes('حذف كافة عروض') ||
        text.includes('حذف جميع عروض') ||
        text.includes('تفريغ عروض') ||
        text.includes('حذف كل العروض') ||
        text === '/delete_all_offers'
      ) {
        USER_WILAYA_STATE.delete(chatId);
        USER_BOARD_STATE.delete(chatId);
        USER_ALL_BOARD_STATE.delete(chatId);
        USER_MULTI_WAITING_PRICE.delete(chatId);
        USER_OFFER_MULTI_WAITING_PRICE.delete(chatId);

        const confirmKeyboard = {
          inline_keyboard: [
            [{ text: '✅ موافق وتأكيد حذف كافة عروض السوق', callback_data: 'delete_all_offers_confirm' }],
            [{ text: '❌ إلغاء', callback_data: 'cancel_board' }],
          ],
        };

        const promptText = `
⚠️ <b>تأكيد تفريغ وحذف جميع عروض السوق:</b>

هل أنت تأكد من حذف وتفريغ كافة عروض وطلبات الشراء والبيع المسجلة في البورصة لجميع الولايات؟
        `;
        await sendTelegramMessage(chatId, promptText, confirmKeyboard);
        return NextResponse.json({ status: 'ok' });
      }

      // Action 2: Interactive Multi-Wilaya Price Selection Wizard (🎯 تحديث أسعار مجموعة ولايات محددة)
      if (
        text.includes('تحديث أسعار مجموعة ولايات') ||
        text.includes('تحديد مجموعة ولايات') ||
        text === '/multi'
      ) {
        USER_WILAYA_STATE.delete(chatId);
        USER_BOARD_STATE.delete(chatId);
        USER_ALL_BOARD_STATE.delete(chatId);
        USER_MULTI_WAITING_PRICE.delete(chatId);
        USER_OFFER_MULTI_WAITING_PRICE.delete(chatId);

        const currentSet = USER_MULTI_SELECT_STATE.get(chatId) || new Set<string>();
        USER_MULTI_SELECT_STATE.set(chatId, currentSet);

        const promptText = `
🎯 <b>تحديث أسعار مجموعة ولايات محددة (اختيار كاستوم)</b>

• اضغط على أزرار الولايات أدناه للتعليم عليها بـ ✅.
• أو أرسل رسالة مباشرة بالصيغة السريعة:
<code>16 10 19 09 31: 295</code>
أو <code>الجزائر البليدة سطيف وهران: 295</code>
        `;
        await sendTelegramMessage(
          chatId,
          promptText,
          getMultiSelectWilayasKeyboard(currentSet, 1)
        );
        return NextResponse.json({ status: 'ok' });
      }

      // Action 3: Interactive Multi-Wilaya Offer Seeder Selection Wizard (📢 ضخ عروض في مجموعة ولايات محددة)
      if (
        text.includes('ضخ عروض في مجموعة ولايات') ||
        text.includes('عروض مجموعة ولايات') ||
        text === '/multi_offers'
      ) {
        USER_WILAYA_STATE.delete(chatId);
        USER_BOARD_STATE.delete(chatId);
        USER_ALL_BOARD_STATE.delete(chatId);
        USER_MULTI_WAITING_PRICE.delete(chatId);
        USER_OFFER_MULTI_WAITING_PRICE.delete(chatId);

        const currentSet = USER_OFFER_MULTI_SELECT_STATE.get(chatId) || new Set<string>();
        USER_OFFER_MULTI_SELECT_STATE.set(chatId, currentSet);

        const promptText = `
📢 <b>ضخ عروض في مجموعة ولايات محددة (اختيار كاستوم)</b>

• اضغط على أزرار الولايات أدناه للتعليم عليها بـ ✅.
• أو أرسل رسالة مباشرة بالصيغة السريعة:
<code>ضخ 16 10 19 09 31: 295</code>
أو <code>عروض الجزائر البليدة سطيف وهران: 290 315</code>
        `;
        await sendTelegramMessage(
          chatId,
          promptText,
          getMultiSelectOfferWilayasKeyboard(currentSet, 1)
        );
        return NextResponse.json({ status: 'ok' });
      }

      // Action 4: FULL 58 WILAYAS OFFICIAL PRICE BOARD UPDATE ONLY (🌐 تحديث كلي لـ 58 ولاية)
      if (
        text.includes('تحديث كلي لـ 58 ولاية') ||
        text.includes('تحديث كلي لبورصة') ||
        text === '/update_board' ||
        text === '/all'
      ) {
        USER_WILAYA_STATE.delete(chatId);
        USER_BOARD_STATE.delete(chatId);
        USER_MULTI_WAITING_PRICE.delete(chatId);
        USER_OFFER_MULTI_WAITING_PRICE.delete(chatId);
        USER_ALL_BOARD_STATE.set(chatId, true);

        const promptText = `
🌐 <b>التحديث الكلي لجدول أسعار البورصة الرسمية لكافة الـ 58 ولاية (بدون عروض)</b>

✏️ <b>أدخل السعر الأساسي أو نطاق السعر المطلوب لجدول البورصة:</b>
• <b>نطاق سعر:</b> أرسل النطاق كرسالة (مثال: <code>280 315</code> أو <code>من 280 إلى 315</code>)
• <b>سعر محدد:</b> أرسل الرقم فقط (مثال: <code>280</code>)
        `;
        await sendTelegramMessage(chatId, promptText);
        return NextResponse.json({ status: 'ok' });
      }

      // Action 5: Single Wilaya Official Price Board Control Panel (📊 تحديث أسعار بورصة ولاية واحدة)
      if (
        text.includes('تحديث أسعار بورصة ولاية واحدة') ||
        text.includes('تحديث أسعار بورصة ولاية') ||
        text === '/board' ||
        text === '/price'
      ) {
        USER_WILAYA_STATE.delete(chatId);
        USER_ALL_BOARD_STATE.delete(chatId);
        USER_MULTI_WAITING_PRICE.delete(chatId);
        USER_OFFER_MULTI_WAITING_PRICE.delete(chatId);
        await sendTelegramMessage(
          chatId,
          '📊 <b>اختر الولاية المراد التحكم بأسعار بورصتها الرسمية (تعديل / حذف):</b>',
          getBoardWilayasKeyboard(1)
        );
        return NextResponse.json({ status: 'ok' });
      }

      // Action 6: Single Wilaya B2B Market Offers Seeder (📢 ضخ عروض في ولاية واحدة)
      if (
        text.includes('ضخ عروض في ولاية واحدة') ||
        text.includes('ضخ عروض') ||
        text.includes('أمر نشر ولاية') ||
        text === '/seed_offers' ||
        text === '/publish'
      ) {
        USER_BOARD_STATE.delete(chatId);
        USER_ALL_BOARD_STATE.delete(chatId);
        USER_MULTI_WAITING_PRICE.delete(chatId);
        USER_OFFER_MULTI_WAITING_PRICE.delete(chatId);
        await sendTelegramMessage(
          chatId,
          '📢 <b>اختر الولاية المراد ضخ عروض السوق فيها (كافة الـ 58 ولاية متاحة):</b>',
          getWilayasKeyboard(1)
        );
        return NextResponse.json({ status: 'ok' });
      }

      // Wizard Handler 0A: User selected multiple wilayas via buttons for OFFER SEEDER and is now sending price!
      if (USER_OFFER_MULTI_WAITING_PRICE.has(chatId)) {
        const parsedPrices = parsePriceInput(text);
        if (parsedPrices) {
          const { minPrice, maxPrice } = parsedPrices;
          const selectedCodesSet = USER_OFFER_MULTI_WAITING_PRICE.get(chatId)!;
          const wilayaCodes = Array.from(selectedCodesSet);

          USER_OFFER_MULTI_WAITING_PRICE.delete(chatId); // Clear state

          const priceText = minPrice === maxPrice
            ? `بسعر ${minPrice} د.ج`
            : `بنطاق سعر من ${minPrice} إلى ${maxPrice} د.ج`;

          await sendTelegramMessage(
            chatId,
            `⏳ <b>جاري الضخ الدفعي للعروض لـ (${wilayaCodes.length}) ولاية ${priceText}...</b>`
          );

          const res = await seedOffersForMultipleWilayas(wilayaCodes, minPrice, maxPrice);

          const totalOffersCount = res.count * 15;
          const updatedNamesList = res.seededWilayas
            .map((w: any) => `• ${w.wilayaCode} - ${w.wilayaName} (${w.farmerPrice} د.ج)`)
            .join('\n');

          const successMsg = `
📢 <b>تم ضخ (${totalOffersCount}) عرضاً بنجاح عبر (${res.count}) ولاية محددة!</b>

📍 <b>قائمة الولايات التي تم ضخ 15 عرضاً بكل منها:</b>
${updatedNamesList}

🔒 جميع الأرقام محجوبة ومخفية برغبة الناشر بنظام الذاكرة.
✨ ظهرت العروض فوراً بسوق البورصة في الموقع!
          `;
          await sendTelegramMessage(chatId, successMsg, MAIN_KEYBOARD);
          return NextResponse.json({ status: 'ok' });
        } else {
          await sendTelegramMessage(
            chatId,
            '⚠️ <b>يرجى إرسال السعر كأرقام كرسالة نصية!</b>\nمثال: <code>285</code> أو <code>280 315</code>'
          );
          return NextResponse.json({ status: 'ok' });
        }
      }

      // Wizard Handler 0B: User selected multiple wilayas via buttons for PRICE UPDATES and is now sending price!
      if (USER_MULTI_WAITING_PRICE.has(chatId)) {
        const numbers = text.match(/\d{2,4}/g);
        if (numbers && numbers.length >= 1) {
          const selectedCodesSet = USER_MULTI_WAITING_PRICE.get(chatId)!;
          const wilayaCodes = Array.from(selectedCodesSet);
          const farmerPrice = Number(numbers[0]);
          const brokerPrice = numbers.length >= 2 ? Number(numbers[1]) : undefined;
          const slaughterPrice = numbers.length >= 3 ? Number(numbers[2]) : undefined;

          USER_MULTI_WAITING_PRICE.delete(chatId); // Clear state

          await sendTelegramMessage(
            chatId,
            `⏳ <b>جاري التحديث الدفعي لـ (${wilayaCodes.length}) ولاية بسعر فلاح ${farmerPrice} د.ج...</b>`
          );

          const res = await updateMultipleOfficialPrices(wilayaCodes, farmerPrice, brokerPrice, slaughterPrice);

          const updatedNamesList = res.updatedWilayas
            .map((w: any) => `• ${w.code} - ${w.nameAr}`)
            .join('\n');

          const successMsg = `
🎯 <b>تم تحديث أسعار (${res.count}) ولاية محددة بنجاح!</b>

📊 <b>الأسعار التي تم تطبيقها:</b>
• 🌾 سعر الفلاح (بيع): <b>${res.farmerPrice} د.ج/كغ</b>
• 🤝 سعر الكورتي (شراء): <b>${res.brokerPrice} د.ج/كغ</b>
• 🔪 سعر المذبح (شراء): <b>${res.slaughterPrice} د.ج/كغ</b>

📍 <b>قائمة الولايات المحدثة:</b>
${updatedNamesList}

✨ ظهرت التحديثات فوراً بجدول البورصة في الموقع!
          `;
          await sendTelegramMessage(chatId, successMsg, MAIN_KEYBOARD);
          return NextResponse.json({ status: 'ok' });
        } else {
          await sendTelegramMessage(
            chatId,
            '⚠️ <b>يرجى إرسال السعر كأرقام كرسالة نصية!</b>\nمثال: <code>290</code> أو <code>290 280 270</code>'
          );
          return NextResponse.json({ status: 'ok' });
        }
      }

      // Wizard Handler 1: User is in FULL 58 WILAYAS OFFICIAL PRICE BOARD Update!
      if (USER_ALL_BOARD_STATE.has(chatId)) {
        const parsedPrice = parsePriceInput(text);
        if (parsedPrice) {
          const { minPrice, maxPrice } = parsedPrice;
          if (minPrice >= 50 && maxPrice <= 1000) {
            USER_ALL_BOARD_STATE.delete(chatId); // Clear state

            const priceMsgText = minPrice === maxPrice
              ? `بسعر فلاح متوسط ${minPrice} د.ج`
              : `بنطاق سعر فلاح من ${minPrice} إلى ${maxPrice} د.ج`;

            await sendTelegramMessage(chatId, `⏳ جاري التحديث الكلي لجدول البورصة الرسمية للـ 58 ولاية ${priceMsgText}...`);
            const res = await updateAllOfficialPrices(minPrice, minPrice, maxPrice);

            const farmerPriceDisplay = minPrice === maxPrice
              ? `<b>${minPrice} د.ج/كغ</b>`
              : `<b>من ${minPrice} إلى ${maxPrice} د.ج/كغ</b>`;

            const successMsg = `
✅ <b>تم التحديث الكلي لجدول أسعار البورصة الرسمية للـ 58 ولاية بنجاح!</b>

📊 <b>النتائج في لوحة الأسعار الرسمية بالموقع:</b>
• 🏛️ إجمالي الولايات المحدثة: <b>58 ولاية</b>
• 🌾 نطاق سعر الفلاحين: ${farmerPriceDisplay}
• 🤝 نطاق سعر الوسطاء: <b>أقل بـ 7 د.ج/كغ</b>
• 🔪 نطاق سعر المذابح: <b>أقل بـ 15 د.ج/كغ</b>

✨ ظهرت الأسعار الرسمية المحدثة مباشرة في جدول بورصة الموقع (دون نشر أي عروض بالسوق)!
            `;
            await sendTelegramMessage(chatId, successMsg, MAIN_KEYBOARD);
            return NextResponse.json({ status: 'ok' });
          }
        }
      }

      // Wizard Handler 2: User is in Single Wilaya Official Price Board Update!
      if (USER_BOARD_STATE.has(chatId)) {
        const numbers = text.match(/\d{2,4}/g);
        if (numbers && numbers.length >= 3) {
          const wilayaCode = USER_BOARD_STATE.get(chatId)!;
          const farmerPrice = Number(numbers[0]);
          const brokerPrice = Number(numbers[1]);
          const slaughterPrice = Number(numbers[2]);

          USER_BOARD_STATE.delete(chatId); // Clear state
          const wilaya = getWilayaByCode(wilayaCode);

          const confirmKeyboard = {
            inline_keyboard: [
              [{ text: '✅ موافق وتأكيد الحفظ', callback_data: `save_board_confirm_${wilayaCode}_${farmerPrice}_${brokerPrice}_${slaughterPrice}` }],
              [{ text: '❌ إلغاء', callback_data: 'cancel_board' }],
            ],
          };

          const promptText = `
⚠️ <b>تأكيد الاعتماد والتحديث:</b>
هل تريد اعتماد وتحديث أسعار بورصة ولاية <b>${wilaya?.nameAr} (${wilayaCode})</b> كالتالي؟

• 🌾 سعر الفلاح (بيع): <b>${farmerPrice} د.ج/كغ</b>
• 🤝 سعر الكورتي (شراء): <b>${brokerPrice} د.ج/كغ</b>
• 🔪 سعر المذبح (شراء): <b>${slaughterPrice} د.ج/كغ</b>
          `;
          await sendTelegramMessage(chatId, promptText, confirmKeyboard);
          return NextResponse.json({ status: 'ok' });
        } else {
          await sendTelegramMessage(
            chatId,
            '⚠️ <b>يرجى إرسال الأسعار الـ 3 بالترتيب (فلاح كورتي مذبح)!</b>\nمثال أرسل: <code>285 278 270</code>'
          );
          return NextResponse.json({ status: 'ok' });
        }
      }

      // Wizard Handler 3: User is in Single Wilaya B2B Offer Seeder!
      if (USER_WILAYA_STATE.has(chatId)) {
        const parsedPrice = parsePriceInput(text);
        if (parsedPrice) {
          const { minPrice, maxPrice } = parsedPrice;
          if (minPrice >= 50 && maxPrice <= 1000) {
            const wilayaCode = USER_WILAYA_STATE.get(chatId)!;
            USER_WILAYA_STATE.delete(chatId); // Clear state

            const priceMsgText = minPrice === maxPrice
              ? `بسعر ${minPrice} د.ج`
              : `بنطاق سعر من ${minPrice} إلى ${maxPrice} د.ج`;

            await sendTelegramMessage(chatId, `⏳ جاري ضخ العروض لولاية ${wilayaCode} ${priceMsgText}...`);
            const res = await seedOffersForWilaya({
              wilayaCode,
              minFarmerPrice: minPrice,
              maxFarmerPrice: maxPrice,
            });

            const farmerPriceDisplay = minPrice === maxPrice
              ? `<b>${res.farmerPrice} د.ج/كغ</b>`
              : `<b>من ${minPrice} إلى ${maxPrice} د.ج/كغ</b> (متوسط: ${res.farmerPrice} د.ج)`;

            const successMsg = `
✅ <b>تم ضخ 15 عرضاً بنجاح في السوق لولاية ${res.wilayaName} (${res.wilayaCode})!</b>

📊 <b>تفاصيل العروض الـ 15 المولدة:</b>
• 🌾 سعر الفلاح (بيع): ${farmerPriceDisplay} (3,000 - 15,000 كغ)
• 🤝 سعر الوسيط (شراء): <b>${res.farmerPrice - 7} د.ج/كغ</b> (1,000 - 1,300 كغ)
• 🔪 سعر المذبح (شراء): <b>${res.farmerPrice - 15} د.ج/كغ</b> (6,000 - 24,000 كغ)
• 🔒 الأرقام مخفية بنظام الحماية والذاكرة.
            `;
            await sendTelegramMessage(chatId, successMsg, MAIN_KEYBOARD);
            return NextResponse.json({ status: 'ok' });
          }
        }
      }

      // Quick Shortcut Wilayas
      if (text.includes('سطيف (19)')) {
        USER_WILAYA_STATE.set(chatId, '19');
        return sendPricePrompt(chatId, '19');
      }
      if (text.includes('الجزائر (16)')) {
        USER_WILAYA_STATE.set(chatId, '16');
        return sendPricePrompt(chatId, '16');
      }
      if (text.includes('البليدة (09)')) {
        USER_WILAYA_STATE.set(chatId, '09');
        return sendPricePrompt(chatId, '09');
      }
      if (text.includes('وهران (31)')) {
        USER_WILAYA_STATE.set(chatId, '31');
        return sendPricePrompt(chatId, '31');
      }

      // Check Deep-link Commands (/start approve_PHONE or /start reject_PHONE)
      if (text.startsWith('/start approve_')) {
        const phone = text.replace('/start approve_', '').trim();
        const res = await approveUserSubscription(phone);
        const userName = res?.fullName || phone;
        await sendTelegramMessage(
          chatId,
          `✅ <b>تم تفعيل اشتراك المستخدم (${userName}) - ${phone} بنجاح!</b>\n\nيستطيع المستخدم الآن تصفح جميع خدمات البورصة.`,
          MAIN_KEYBOARD
        );
        return NextResponse.json({ status: 'ok' });
      }

      if (text.startsWith('/start reject_')) {
        const phone = text.replace('/start reject_', '').trim();
        const res = await rejectUserSubscription(phone);
        const userName = res?.fullName || phone;
        await sendTelegramMessage(
          chatId,
          `❌ <b>تم رفض طلب اشتراك المستخدم (${userName}) - ${phone}.</b>`,
          MAIN_KEYBOARD
        );
        return NextResponse.json({ status: 'ok' });
      }

      // Check Help / Start Command
      if (text.startsWith('/start') || text.startsWith('/help') || text.includes('مساعدة')) {
        const helpText = `
🏛️ <b>مرحباً بك في بوت الإدارة لبورصة الدواجن (djaj69 Admin Bot)</b>

<b>الأوامر المتاحة لمشرف البورصة:</b>

🎯 <b>1. تحديث أسعار مجموعة ولايات (كاستوم):</b>
• <b>رسالة مباشرة:</b> <code>16 10 19 09 31: 295</code>
• <b>أو بأزرار تفاعلية:</b> اضغط زر <b>"🎯 تحديث أسعار مجموعة ولايات محددة"</b>.

📢 <b>2. ضخ عروض في مجموعة ولايات (كاستوم):</b>
• <b>رسالة مباشرة:</b> <code>ضخ 16 10 19 09: 290 315</code>
• <b>أو بأزرار تفاعلية:</b> اضغط زر <b>"📢 ضخ عروض في مجموعة ولايات محددة"</b>.

🌐 <b>3. تحديث كلي لـ 58 ولاية:</b>
يحدث جدول الأسعار الرسمية للـ 58 ولاية دفعة واحدة.

📊 <b>4. تحديث أسعار بورصة ولاية واحدة:</b>
لوحة تحكم لولاية معينة (تعديل / حذف فردي).

🗑️ <b>5. حذف كلي لجميع أسعار البورصة:</b>
يمحو ويفرغ جميع أسعار البورصة للـ 58 ولاية بنقرة واحدة (مع تأكيد الحذف).
        `;
        await sendTelegramMessage(chatId, helpText, MAIN_KEYBOARD);
        return NextResponse.json({ status: 'ok' });
      }

      // Default prompt
      await sendTelegramMessage(
        chatId,
        '💡 <b>اختر من الأزرار المنظمة أدناه، أو أرسل تحديثاً مباشراً كـ <code>16 10 19: 295</code> أو <code>ضخ 16 10 19: 295</code>:</b>',
        MAIN_KEYBOARD
      );
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

// Helper 2: Send Price Selection Prompt for Single Wilaya Offers Seeder
async function sendPricePrompt(chatId: string, wilayaCode: string) {
  const wilaya = getWilayaByCode(wilayaCode);
  const inlinePrices = {
    inline_keyboard: [
      [
        { text: '💰 275 د.ج', callback_data: `post_${wilayaCode}_275` },
        { text: '💰 280 د.ج', callback_data: `post_${wilayaCode}_280` },
        { text: '💰 285 د.ج', callback_data: `post_${wilayaCode}_285` },
      ],
      [
        { text: '💰 290 د.ج', callback_data: `post_${wilayaCode}_290` },
        { text: '💰 295 د.ج', callback_data: `post_${wilayaCode}_295` },
        { text: '💰 300 د.ج', callback_data: `post_${wilayaCode}_300` },
      ],
    ],
  };

  const text = `
📍 <b>تم اختيار ولاية: ${wilaya?.nameAr} (${wilayaCode})</b>

✏️ <b>أدخل السعر المطلوب كرسالة نصية لضخ العروض:</b>
• <b>سعر محدد:</b> أرسل الرقم فقط (مثال: <code>285</code>)
• <b>نطاق سعر عشوائي:</b> أرسل النطاق (مثال: <code>280 315</code> أو <code>من 280 إلى 315</code>)
• أو اختر من الأسعار السريعة أدناه:
  `;
  await sendTelegramMessage(chatId, text, inlinePrices);
  return NextResponse.json({ status: 'ok' });
}
