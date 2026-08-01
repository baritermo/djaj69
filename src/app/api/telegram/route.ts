import { NextResponse } from 'next/server';
import { seedOffersForWilaya, seedAllWilayas } from '@/lib/bot-seeder';
import { ALGERIA_WILAYAS, getWilayaByCode } from '@/lib/algeria-data';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID;

// In-memory state for user step-by-step wizard (ChatId -> WilayaCode)
const USER_WILAYA_STATE = new Map<string, string>();

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
    [{ text: '📢 أمر نشر ولاية جديد (اختر من الـ 58 ولاية)' }],
    [{ text: '🌐 تحديث جميع الـ 58 ولاية (280 د.ج)' }, { text: '🌐 تحديث جميع الـ 58 ولاية (290 د.ج)' }],
    [{ text: '📍 سطيف (19)' }, { text: '📍 الجزائر (16)' }, { text: '📍 البليدة (09)' }, { text: '📍 وهران (31)' }],
    [{ text: '❓ مساعدة ودليل الأوامر' }],
  ],
  resize_keyboard: true,
};

// Helper: Build Paginated 58 Wilayas Keyboard
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

      // Step 1: User Selected a Wilaya
      if (dataStr.startsWith('select_wilaya_')) {
        const wilayaCode = dataStr.replace('select_wilaya_', '');
        USER_WILAYA_STATE.set(chatId, wilayaCode);
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

      // Step 2: User Selected a Price Button
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

      // Action: Start Publish Wizard (📢 أمر نشر ولاية جديد)
      if (text.includes('أمر نشر ولاية جديد') || text === '/publish' || text === 'نشر') {
        await sendTelegramMessage(
          chatId,
          '🇩🇿 <b>اختر الولاية المراد التحديث والنشر فيها (كافة الـ 58 ولاية متاحة):</b>',
          getWilayasKeyboard(1)
        );
        return NextResponse.json({ status: 'ok' });
      }

      // Check if user has a pending Wilaya selection and typed a price or price range!
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

      // Handle Presets for 58 Wilayas
      if (text.includes('تحديث جميع الـ 58 ولاية (280')) {
        await sendTelegramMessage(chatId, '⏳ جاري تحديث الـ 58 ولاية بسعر فلاح 280 د.ج...');
        const res = await seedAllWilayas(280);
        await sendTelegramMessage(
          chatId,
          `✅ <b>تم تحديث الـ 58 ولاية بنجاح!</b>\n📊 العروض المولدة: ${res.totalOffersGenerated}\n🌾 متوسط سعر الفلاح: 280 د.ج`,
          MAIN_KEYBOARD
        );
        return NextResponse.json({ status: 'ok' });
      }

      if (text.includes('تحديث جميع الـ 58 ولاية (290')) {
        await sendTelegramMessage(chatId, '⏳ جاري تحديث الـ 58 ولاية بسعر فلاح 290 د.ج...');
        const res = await seedAllWilayas(290);
        await sendTelegramMessage(
          chatId,
          `✅ <b>تم تحديث الـ 58 ولاية بنجاح!</b>\n📊 العروض المولدة: ${res.totalOffersGenerated}\n🌾 متوسط سعر الفلاح: 290 د.ج`,
          MAIN_KEYBOARD
        );
        return NextResponse.json({ status: 'ok' });
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

<b>طريقة الاستخدام السريعة:</b>
1️⃣ اضغط على <b>📢 أمر نشر ولاية جديد</b>
2️⃣ تصفح الـ <b>58 ولاية</b> واضغط على الولاية المطلوبة.
3️⃣ اكتب <b>السعر يدوياً</b> كرسالة نصية (مثال: اكتب <code>288</code>) أو اضغط زر السعر!
        `;
        await sendTelegramMessage(chatId, helpText, MAIN_KEYBOARD);
        return NextResponse.json({ status: 'ok' });
      }

      // Direct command /post 19 285
      if (text.startsWith('/post')) {
        const parts = text.split(/\s+/);
        if (parts.length >= 3) {
          const rawCode = parts[1].replace(/[^0-9]/g, '');
          const wilayaCode = rawCode.padStart(2, '0');
          const farmerPrice = Number(parts[2]);

          const res = await seedOffersForWilaya({ wilayaCode, farmerPrice });
          await sendTelegramMessage(
            chatId,
            `✅ <b>تم تحديث ولاية ${res.wilayaName} (${res.wilayaCode}) بنجاح!</b>\n🌾 سعر الفلاح: <b>${res.farmerPrice} د.ج</b>\n🤝 سعر الوسيط: <b>${res.farmerPrice - 7} د.ج</b>\n🔪 سعر المذبح: <b>${res.farmerPrice - 15} د.ج</b>`,
            MAIN_KEYBOARD
          );
          return NextResponse.json({ status: 'ok' });
        }
      }

      // Default prompt
      await sendTelegramMessage(
        chatId,
        '💡 <b>اضغط على "📢 أمر نشر ولاية جديد" لاختيار أي ولاية من الـ 58 ولاية وإدخال سعرها:</b>',
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

✏️ <b>الآن أدخل سعر بيع الفلاح لهذه الولاية:</b>
- أرسل السعر كرسالة نصية (مثال: اكتب <code>285</code> فقط).
- أو اضغط على أحد الأسعار المقترحة أدناه:
  `;
  await sendTelegramMessage(chatId, text, inlinePrices);
  return NextResponse.json({ status: 'ok' });
}
