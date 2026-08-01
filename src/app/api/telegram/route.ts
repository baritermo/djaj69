import { NextResponse } from 'next/server';
import {
  seedOffersForWilaya,
  seedAllWilayas,
  updateOfficialPriceBoard,
  updateAllOfficialPrices,
  deleteOfficialPriceForWilaya,
  getOfficialPriceForWilaya,
} from '@/lib/bot-seeder';
import { ALGERIA_WILAYAS, getWilayaByCode } from '@/lib/algeria-data';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID;

// In-memory state maps for step-by-step wizards
const USER_WILAYA_STATE = new Map<string, string>(); // For single wilaya B2B offer seeder
const USER_BOARD_STATE = new Map<string, string>();  // For single wilaya official board update
const USER_ALL_BOARD_STATE = new Map<string, boolean>(); // For FULL 58 wilayas OFFICIAL BOARD update ONLY

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

// Main Persistent Reply Keyboard
const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: '🌐 تحديث كلي لبورصة الـ 58 ولاية' }],
    [{ text: '📊 تحديث أسعار بورصة ولاية' }],
    [{ text: '📢 ضخ عروض في السوق (ولايات)' }],
    [{ text: '📍 سطيف (19)' }, { text: '📍 الجزائر (16)' }, { text: '📍 البليدة (09)' }, { text: '📍 وهران (31)' }],
    [{ text: '❓ مساعدة ودليل الأوامر' }],
  ],
  resize_keyboard: true,
};

// Helper 1: Build Paginated 58 Wilayas Keyboard for Offer Seeder
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

// Helper 2: Build Paginated 58 Wilayas Keyboard for Official Board Update
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
      const chatId = String(cb.message.chat.id);
      const dataStr = cb.data;

      if (ADMIN_CHAT_ID && String(chatId) !== String(ADMIN_CHAT_ID)) {
        await answerCallbackQuery(cb.id, '⛔ غير مصرح بك.');
        return NextResponse.json({ status: 'unauthorized' });
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

      // Step 1 for Offer Seeder: User Selected a Wilaya
      if (dataStr.startsWith('select_wilaya_')) {
        const wilayaCode = dataStr.replace('select_wilaya_', '');
        USER_WILAYA_STATE.set(chatId, wilayaCode);
        USER_BOARD_STATE.delete(chatId);
        USER_ALL_BOARD_STATE.delete(chatId);
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

      // Action: User clicked Delete Ask
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

      // Action: User clicked Delete Confirm (✅ موافق على الحذف)
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

      // Action: User clicked Save Confirm (✅ موافق وتأكيد الحفظ)
      if (dataStr.startsWith('save_board_confirm_')) {
        const parts = dataStr.split('_'); // ["save", "board", "confirm", "19", "285", "278", "270"]
        const wilayaCode = parts[3];
        const farmerPrice = Number(parts[4]);
        const brokerPrice = Number(parts[5]);
        const slaughterPrice = Number(parts[6]);

        const res = await updateOfficialPriceBoard(wilayaCode, farmerPrice, brokerPrice, slaughterPrice);
        await answerCallbackQuery(cb.id, 'تم الاعتماد والتحديث');

        const successMsg = `
✅ <b>تم اعتماد وتحديث أسعار البورصة الرسمية لولاية ${res.wilayaName} (${res.wilayaCode}) بنجاح!</b>

📊 <b>الأسعار المعتمدة فوراً في الموقع:</b>
• 🌾 سعر الفلاح: <b>${res.farmerPrice} د.ج/كغ</b>
• 🤝 سعر الكورتي: <b>${res.brokerPrice} د.ج/كغ</b>
• 🔪 سعر المذبح: <b>${res.slaughterPrice} د.ج/كغ</b>
        `;
        await sendTelegramMessage(chatId, successMsg, MAIN_KEYBOARD);
        return NextResponse.json({ status: 'ok' });
      }

      // Action: Cancel
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
      if (ADMIN_CHAT_ID && String(chatId) !== String(ADMIN_CHAT_ID)) {
        await sendTelegramMessage(chatId, '⛔ <b>عذراً، هذا البوت مخصص لمشرف البورصة فقط.</b>');
        return NextResponse.json({ status: 'unauthorized' });
      }

      // Action 1: FULL 58 WILAYAS OFFICIAL PRICE BOARD UPDATE ONLY (🌐 تحديث كلي لبورصة الـ 58 ولاية)
      if (
        text.includes('تحديث كلي') ||
        text.includes('تحديث كلي لبورصة') ||
        text === '/update_board' ||
        text === '/all'
      ) {
        USER_WILAYA_STATE.delete(chatId);
        USER_BOARD_STATE.delete(chatId);
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

      // Action 2: Single Wilaya Official Price Board Update (📊 تحديث أسعار بورصة ولاية)
      if (
        text.includes('تحديث أسعار بورصة ولاية') ||
        text.includes('أسعار البورصة الرسمية') ||
        text === '/board' ||
        text === '/price'
      ) {
        USER_WILAYA_STATE.delete(chatId);
        USER_ALL_BOARD_STATE.delete(chatId);
        await sendTelegramMessage(
          chatId,
          '📊 <b>اختر الولاية المراد التحكم بأسعار بورصتها الرسمية (تعديل / حذف):</b>',
          getBoardWilayasKeyboard(1)
        );
        return NextResponse.json({ status: 'ok' });
      }

      // Action 3: B2B Market Offers Seeder (📢 ضخ عروض في السوق (ولايات))
      if (
        text.includes('ضخ عروض') ||
        text.includes('أمر نشر ولاية') ||
        text === '/seed_offers' ||
        text === '/publish'
      ) {
        USER_BOARD_STATE.delete(chatId);
        USER_ALL_BOARD_STATE.delete(chatId);
        await sendTelegramMessage(
          chatId,
          '📢 <b>اختر الولاية المراد ضخ عروض السوق فيها (كافة الـ 58 ولاية متاحة):</b>',
          getWilayasKeyboard(1)
        );
        return NextResponse.json({ status: 'ok' });
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

✨ ظهرت الأسعار الرسمية المحدثة مباشرة في جدول بورصة الموقع!
            `;
            await sendTelegramMessage(chatId, successMsg, MAIN_KEYBOARD);
            return NextResponse.json({ status: 'ok' });
          }
        }
      }

      // Wizard Handler 2: User is in Single Wilaya Official Price Board Update -> Ask Confirmation Before Save!
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

      // Check Help / Start Command
      if (text.startsWith('/start') || text.startsWith('/help') || text.includes('مساعدة')) {
        const helpText = `
🏛️ <b>مرحباً بك في بوت الإدارة لبورصة الدواجن (djaj69 Admin Bot)</b>

<b>الأوامر المنفصلة والمتاحة للمدير:</b>

1️⃣ <b>🌐 تحديث كلي لبورصة الـ 58 ولاية:</b>
يحدث جدول الأسعار الرسمية للـ 58 ولاية بالموقع مباشرة.

2️⃣ <b>📊 تحديث أسعار بورصة ولاية:</b>
لوحة تحكم كاملة للولايات (تعديل / حذف / تأكيد الحفظ بنقرة <b>موافق</b>).

3️⃣ <b>📢 ضخ عروض في السوق (ولايات):</b>
يضخ 15 عرضاً كودياً بسوق ولاية معينة عند الحاجة.
        `;
        await sendTelegramMessage(chatId, helpText, MAIN_KEYBOARD);
        return NextResponse.json({ status: 'ok' });
      }

      // Default prompt
      await sendTelegramMessage(
        chatId,
        '💡 <b>اختر من الأزرار المنظمة أدناه:</b>',
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
