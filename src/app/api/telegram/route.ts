import { NextResponse } from 'next/server';
import { seedOffersForWilaya, seedAllWilayas } from '@/lib/bot-seeder';
import { ALGERIA_WILAYAS, getWilayaByCode } from '@/lib/algeria-data';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID;

// In-memory state for user step-by-step wizard (ChatId -> WilayaCode)
const USER_WILAYA_STATE = new Map<string, string>();

// Main Persistent Reply Keyboard
const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: '📢 أمر نشر ولاية جديد' }, { text: '🌐 تحديث 58 ولاية (280 د.ج)' }],
    [{ text: '📍 تحديث سطيف (19)' }, { text: '📍 تحديث الجزائر (16)' }, { text: '📍 تحديث البليدة (09)' }],
    [{ text: '📍 تحديث وهران (31)' }, { text: '📍 تحديث قسنطينة (25)' }, { text: '📍 تحديث باتنة (05)' }],
    [{ text: '❓ مساعدة ودليل الأوامر' }],
  ],
  resize_keyboard: true,
};

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
📍 <b>الخطوة 2: تم اختيار ولاية ${wilaya?.nameAr} (${wilayaCode})</b>

الآن اختر <b>سعر بيع الفلاح</b> من الأزرار أدناه 👇
أو اكتب السعر المطلوب مباشرة كرسالة (مثال: <code>288</code>):
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
✅ <b>تم النشر بنجاح لولاية ${res.wilayaName} (${res.wilayaCode})!</b>

📊 <b>التوزيع المعتمد:</b>
• 🌾 سعر الفلاح (بيع): <b>${res.farmerPrice} د.ج/كغ</b> (3,000 - 15,000 كغ)
• 🤝 سعر الوسيط (شراء): <b>${res.farmerPrice - 7} د.ج/كغ</b> (1,000 - 1,300 كغ)
• 🔪 سعر المذبح (شراء): <b>${res.farmerPrice - 15} د.ج/كغ</b> (6,000 - 24,000 كغ)
• 🔒 الأرقام مخفية تلقائياً وحسابات متغيرة بنظام الذاكرة.
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
      if (text === '📢 أمر نشر ولاية جديد' || text === '/publish' || text === 'نشر') {
        return sendWilayaSelectionList(chatId);
      }

      // Check if user has a pending Wilaya selection and typed a custom price number!
      if (USER_WILAYA_STATE.has(chatId) && /^\d{2,4}$/.test(text)) {
        const wilayaCode = USER_WILAYA_STATE.get(chatId)!;
        const farmerPrice = Number(text);

        if (farmerPrice < 50 || farmerPrice > 1000) {
          await sendTelegramMessage(chatId, '❌ <b>السعر غير منطقي! يرجى كتابة سعر بين 100 و 500 د.ج.</b>');
          return NextResponse.json({ status: 'ok' });
        }

        USER_WILAYA_STATE.delete(chatId); // Clear state
        await sendTelegramMessage(chatId, `⏳ جاري النشر لولاية ${wilayaCode} بسعر ${farmerPrice} د.ج...`);
        const res = await seedOffersForWilaya({ wilayaCode, farmerPrice });

        const successMsg = `
✅ <b>تم النشر بنجاح لولاية ${res.wilayaName} (${res.wilayaCode})!</b>

📊 <b>التوزيع المعتمد:</b>
• 🌾 سعر الفلاح (بيع): <b>${res.farmerPrice} د.ج/كغ</b> (3,000 - 15,000 كغ)
• 🤝 سعر الوسيط (شراء): <b>${res.farmerPrice - 7} د.ج/كغ</b> (1,000 - 1,300 كغ)
• 🔪 سعر المذبح (شراء): <b>${res.farmerPrice - 15} د.ج/كغ</b> (6,000 - 24,000 كغ)
• 🔒 جميع الأرقام مخفية بنظام الحماية والذاكرة.
        `;
        await sendTelegramMessage(chatId, successMsg, MAIN_KEYBOARD);
        return NextResponse.json({ status: 'ok' });
      }

      // Handle Presets for 58 Wilayas
      if (text === '🌐 تحديث 58 ولاية (280 د.ج)') {
        await sendTelegramMessage(chatId, '⏳ جاري تحديث الـ 58 ولاية بسعر فلاح 280 د.ج...');
        const res = await seedAllWilayas(280);
        await sendTelegramMessage(
          chatId,
          `✅ <b>تم تحديث الـ 58 ولاية بنجاح!</b>\n📊 العروض المولدة: ${res.totalOffersGenerated}\n🌾 متوسط سعر الفلاح: 280 د.ج`,
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
      if (text.includes('قسنطينة (25)')) {
        USER_WILAYA_STATE.set(chatId, '25');
        return sendPricePrompt(chatId, '25');
      }
      if (text.includes('باتنة (05)')) {
        USER_WILAYA_STATE.set(chatId, '05');
        return sendPricePrompt(chatId, '05');
      }

      // Check Help / Start Command
      if (text.startsWith('/start') || text.startsWith('/help') || text.includes('مساعدة')) {
        const helpText = `
🏛️ <b>مرحباً بك في بوت الإدارة لبورصة الدواجن (djaj69 Admin Bot)</b>

<b>خطوات النشر السريعة:</b>
1️⃣ اضغط على <b>📢 أمر نشر ولاية جديد</b>
2️⃣ اختر <b>الولاية</b> المطلوب النشر فيها
3️⃣ اختر <b>السعر</b> من الأزرار أو اكتبه مباشرة!
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
        '💡 <b>اضغط على "📢 أمر نشر ولاية جديد" لبدء اختيار الولاية والسعر:</b>',
        MAIN_KEYBOARD
      );
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

// Helper 1: Send Wilaya Selection List
async function sendWilayaSelectionList(chatId: string) {
  const inlineWilayas = {
    inline_keyboard: [
      [
        { text: '09 - البليدة', callback_data: 'select_wilaya_09' },
        { text: '16 - الجزائر', callback_data: 'select_wilaya_16' },
        { text: '19 - سطيف', callback_data: 'select_wilaya_19' },
      ],
      [
        { text: '31 - وهران', callback_data: 'select_wilaya_31' },
        { text: '25 - قسنطينة', callback_data: 'select_wilaya_25' },
        { text: '05 - باتنة', callback_data: 'select_wilaya_05' },
      ],
      [
        { text: '02 - شلف', callback_data: 'select_wilaya_02' },
        { text: '15 - تيزي وزو', callback_data: 'select_wilaya_15' },
        { text: '23 - عنابة', callback_data: 'select_wilaya_23' },
      ],
      [
        { text: '35 - بومرداس', callback_data: 'select_wilaya_35' },
        { text: '10 - البويرة', callback_data: 'select_wilaya_10' },
        { text: '26 - المدية', callback_data: 'select_wilaya_26' },
      ],
      [
        { text: '14 - تيارت', callback_data: 'select_wilaya_14' },
        { text: '17 - الجلفة', callback_data: 'select_wilaya_17' },
        { text: '28 - المسيلة', callback_data: 'select_wilaya_28' },
      ],
      [
        { text: '43 - ميلة', callback_data: 'select_wilaya_43' },
        { text: '44 - عين الدفلى', callback_data: 'select_wilaya_44' },
        { text: '48 - غليزان', callback_data: 'select_wilaya_48' },
      ],
    ],
  };

  const text = `
🇩🇿 <b>الخطوة 1: اختر الولاية المراد نشر العروض فيها:</b>
  `;
  await sendTelegramMessage(chatId, text, inlineWilayas);
  return NextResponse.json({ status: 'ok' });
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
📍 <b>الخطوة 2: تم اختيار ولاية ${wilaya?.nameAr} (${wilayaCode})</b>

اختر السعر المطلوب من الأزرار أو اكتب السعر الذي تريده كرسالة نصية (مثال: <code>285</code>):
  `;
  await sendTelegramMessage(chatId, text, inlinePrices);
  return NextResponse.json({ status: 'ok' });
}
