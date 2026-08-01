import { NextResponse } from 'next/server';
import { seedOffersForWilaya, seedAllWilayas, updateOfficialPriceBoard } from '@/lib/bot-seeder';
import { ALGERIA_WILAYAS, getWilayaByCode } from '@/lib/algeria-data';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID;

// In-memory state maps for step-by-step wizards
const USER_WILAYA_STATE = new Map<string, string>(); // For single wilaya offer seeder
const USER_BOARD_STATE = new Map<string, string>();  // For direct official board update
const USER_ALL_STATE = new Map<string, boolean>();   // For full 58 wilayas update

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
    [{ text: '📢 أمر نشر ولاية جديد' }, { text: '🌐 تحديث كلي' }],
    [{ text: '📊 تحديث أسعار البورصة الرسمية (فلاح - كورتي - مذبح)' }],
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
        USER_ALL_STATE.delete(chatId);
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

      // Step 1 for Official Board Update: User Selected a Board Wilaya
      if (dataStr.startsWith('select_board_wilaya_')) {
        const wilayaCode = dataStr.replace('select_board_wilaya_', '');
        USER_BOARD_STATE.set(chatId, wilayaCode);
        USER_WILAYA_STATE.delete(chatId);
        USER_ALL_STATE.delete(chatId);
        const wilaya = getWilayaByCode(wilayaCode);

        await answerCallbackQuery(cb.id, `تحديث البورصة لـ ${wilaya?.nameAr}`);

        const promptText = `
📊 <b>تحديث جدول البورصة الرسمية لولاية: ${wilaya?.nameAr} (${wilayaCode})</b>

✏️ <b>أرسل الأسعار الـ 3 كرسالة نصية واحدة بالترتيب (فلاح ثم كورتي ثم مذبح):</b>
مثال أرسل:
<code>285 278 270</code>

• سعر الفلاح (بيع): <b>285 د.ج</b>
• سعر الكورتي (شراء): <b>278 د.ج</b>
• سعر المذبح (شراء): <b>270 د.ج</b>
        `;
        await sendTelegramMessage(chatId, promptText);
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

      // Action 1: Start Single Wilaya Seeder Wizard (📢 أمر نشر ولاية جديد)
      if (text.includes('أمر نشر ولاية جديد') || text === '/publish' || text === 'نشر') {
        USER_BOARD_STATE.delete(chatId);
        USER_ALL_STATE.delete(chatId);
        await sendTelegramMessage(
          chatId,
          '🇩🇿 <b>اختر الولاية المراد التحديث والنشر فيها (كافة الـ 58 ولاية متاحة):</b>',
          getWilayasKeyboard(1)
        );
        return NextResponse.json({ status: 'ok' });
      }

      // Action 2: Start Full 58 Wilayas Update Wizard (🌐 تحديث كلي)
      if (text.includes('تحديث كلي') || text === '/post_all' || text === 'تحديث الكل') {
        USER_WILAYA_STATE.delete(chatId);
        USER_BOARD_STATE.delete(chatId);
        USER_ALL_STATE.set(chatId, true);

        const promptText = `
🌐 <b>التحديث الكلي لجميع الـ 58 ولاية</b>

✏️ <b>أدخل سعر الفلاح أو نطاق السعر المطلوب لكافة الولايات:</b>
• <b>نطاق سعر عشوائي:</b> أرسل النطاق كرسالة (مثال: <code>280 315</code> أو <code>من 280 إلى 315</code>)
• <b>سعر محدد متوسط:</b> أرسل الرقم فقط (مثال: <code>280</code>)
        `;
        await sendTelegramMessage(chatId, promptText);
        return NextResponse.json({ status: 'ok' });
      }

      // Action 3: Start Official Price Board Update Wizard (📊 تحديث أسعار البورصة الرسمية)
      if (text.includes('تحديث أسعار البورصة الرسمية') || text === '/board' || text === '/price') {
        USER_WILAYA_STATE.delete(chatId);
        USER_ALL_STATE.delete(chatId);
        await sendTelegramMessage(
          chatId,
          '📊 <b>اختر الولاية المراد تحديث أسعار بورصتها الرسمية (فلاح - كورتي - مذبح):</b>',
          getBoardWilayasKeyboard(1)
        );
        return NextResponse.json({ status: 'ok' });
      }

      // Check if user is in Full 58 Wilayas Update Wizard and typed a price or range!
      if (USER_ALL_STATE.has(chatId)) {
        const parsedPrice = parsePriceInput(text);
        if (parsedPrice) {
          const { minPrice, maxPrice } = parsedPrice;
          if (minPrice >= 50 && maxPrice <= 1000) {
            USER_ALL_STATE.delete(chatId); // Clear state

            const priceMsgText = minPrice === maxPrice
              ? `بسعر فلاح متوسط ${minPrice} د.ج`
              : `بنطاق سعر فلاح من ${minPrice} إلى ${maxPrice} د.ج`;

            await sendTelegramMessage(chatId, `⏳ جاري التحديث الكلي لجميع الـ 58 ولاية ${priceMsgText}...`);
            const res = await seedAllWilayas(minPrice, minPrice, maxPrice);

            const farmerPriceDisplay = minPrice === maxPrice
              ? `<b>${minPrice} د.ج/كغ</b>`
              : `<b>من ${minPrice} إلى ${maxPrice} د.ج/كغ</b>`;

            const successMsg = `
✅ <b>تم التحديث الكلي لجميع الـ 58 ولاية بنجاح!</b>

📊 <b>ملخص النشر الضخم:</b>
• 📦 إجمالي العروض المولدة: <b>${res.totalOffersGenerated} عرضاً</b> (15 عرضاً بكل ولاية)
• 🌾 نطاق سعر بيع الفلاحين: ${farmerPriceDisplay}
• 🔒 جميع العروض محمية وحسابات متغيرة بنظام الذاكرة وبأسماء غير مكررة.
            `;
            await sendTelegramMessage(chatId, successMsg, MAIN_KEYBOARD);
            return NextResponse.json({ status: 'ok' });
          }
        }
      }

      // Check if user is in Official Board Update Wizard and typed 3 prices! (e.g. "285 278 270")
      if (USER_BOARD_STATE.has(chatId)) {
        const numbers = text.match(/\d{2,4}/g);
        if (numbers && numbers.length >= 3) {
          const wilayaCode = USER_BOARD_STATE.get(chatId)!;
          const farmerPrice = Number(numbers[0]);
          const brokerPrice = Number(numbers[1]);
          const slaughterPrice = Number(numbers[2]);

          USER_BOARD_STATE.delete(chatId); // Clear state

          await sendTelegramMessage(chatId, `⏳ جاري تحديث جدول البورصة لولاية ${wilayaCode}...`);
          const res = await updateOfficialPriceBoard(wilayaCode, farmerPrice, brokerPrice, slaughterPrice);

          const successMsg = `
✅ <b>تم تحديث أسعار البورصة الرسمية لولاية ${res.wilayaName} (${res.wilayaCode}) بنجاح!</b>

📊 <b>الأسعار الرسمية المحدثة فوراً في الموقع:</b>
• 🌾 سعر الفلاح (بيع المزرعة): <b>${res.farmerPrice} د.ج/كغ</b>
• 🤝 سعر الكورتي (شراء وسيط): <b>${res.brokerPrice} د.ج/كغ</b>
• 🔪 سعر المذبح (شراء جملة): <b>${res.slaughterPrice} د.ج/كغ</b>

✨ التحديث ظهر مباشرة في لوحة أسعار الولايات المفتوحة في الموقع!
          `;
          await sendTelegramMessage(chatId, successMsg, MAIN_KEYBOARD);
          return NextResponse.json({ status: 'ok' });
        } else {
          await sendTelegramMessage(
            chatId,
            '⚠️ <b>يرجى إرسال الأسعار الـ 3 بالترتيب (فلاح كورتي مذبح)!</b>\nمثال أرسل: <code>285 278 270</code>'
          );
          return NextResponse.json({ status: 'ok' });
        }
      }

      // Check if user is in Single Wilaya Seeder Wizard and typed a price or price range!
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

            await sendTelegramMessage(chatId, `⏳ جاري النشر لولاية ${wilayaCode} ${priceMsgText}...`);
            const res = await seedOffersForWilaya({
              wilayaCode,
              minFarmerPrice: minPrice,
              maxFarmerPrice: maxPrice,
            });

            const farmerPriceDisplay = minPrice === maxPrice
              ? `<b>${res.farmerPrice} د.ج/كغ</b>`
              : `<b>من ${minPrice} إلى ${maxPrice} د.ج/كغ</b> (متوسط: ${res.farmerPrice} د.ج)`;

            const successMsg = `
✅ <b>تم النشر والتحديث بنجاح لولاية ${res.wilayaName} (${res.wilayaCode})!</b>

📊 <b>تفاصيل العروض الـ 15 المولدة:</b>
• 🌾 سعر الفلاح (بيع): ${farmerPriceDisplay} (3,000 - 15,000 كغ)
• 🤝 سعر الوسيط (شراء): <b>${res.farmerPrice - 7} د.ج/كغ</b> (1,000 - 1,300 كغ)
• 🔪 سعر المذبح (شراء): <b>${res.farmerPrice - 15} د.ج/كغ</b> (6,000 - 24,000 كغ)
• 🔒 جميع الأرقام مخفية بنظام الحماية والذاكرة.
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

<b>الأوامر والتحديثات المتاحة:</b>

1️⃣ <b>تحديث كلي (جميع الـ 58 ولاية):</b>
اضغط على <b>🌐 تحديث كلي</b> -> أدخل السعر أو نطاق السعر.

2️⃣ <b>نشر عروض لولاية محددة:</b>
اضغط على <b>📢 أمر نشر ولاية جديد</b> -> اختر الولاية -> أدخل السعر أو نطاق السعر.

3️⃣ <b>تحديث جدول البورصة الرسمية مباشرة:</b>
اضغط على <b>📊 تحديث أسعار البورصة الرسمية</b> -> اختر الولاية -> أرسل الأسعار الـ 3 (فلاح كورتي مذبح).
        `;
        await sendTelegramMessage(chatId, helpText, MAIN_KEYBOARD);
        return NextResponse.json({ status: 'ok' });
      }

      // Default prompt
      await sendTelegramMessage(
        chatId,
        '💡 <b>اختر من الأزرار التفاعلية أدناه:</b>',
        MAIN_KEYBOARD
      );
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

// Helper 2: Send Price Selection Prompt
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

✏️ <b>أدخل السعر المطلوب كرسالة نصية:</b>
• <b>سعر محدد:</b> أرسل الرقم فقط (مثال: <code>285</code>)
• <b>نطاق سعر عشوائي:</b> أرسل النطاق (مثال: <code>280 315</code> أو <code>من 280 إلى 315</code>)
• أو اختر من الأسعار السريعة أدناه:
  `;
  await sendTelegramMessage(chatId, text, inlinePrices);
  return NextResponse.json({ status: 'ok' });
}
