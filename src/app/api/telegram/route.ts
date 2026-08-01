import { NextResponse } from 'next/server';
import { seedOffersForWilaya, seedAllWilayas } from '@/lib/bot-seeder';
import { ALGERIA_WILAYAS, getWilayaByCode } from '@/lib/algeria-data';

// Optional: You can set TELEGRAM_BOT_TOKEN in .env.local to send replies back via Telegram API
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(chatId: number | string, text: string) {
  if (!TELEGRAM_BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (e) {
    console.error('Telegram send message error:', e);
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
    instructions: 'استخدم البوت عبر تليجرام أو الأوامر: /post [الولاية] [سعر الفلاح] أو /post_all [سعر الفلاح]',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Handle Telegram Webhook update
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id;
      const messageText = body.message.text.trim();

      // Check Help / Start Command
      if (messageText.startsWith('/start') || messageText.startsWith('/help')) {
        const helpText = `
🏛️ <b>بوت بورصة الدواجن الجزائرية (djaj69 Admin Bot)</b>

مرحباً بك في بوت الإدارة التلقائية لبورصة الدواجن 🇩🇿

<b>الأوامر المتاحة:</b>

1️⃣ <b>تحديث ولاية واحدة (15 عرضاً بأسعار وكميات متناسبة):</b>
<code>/post [رمز الولاية] [سعر الفلاح]</code>
مثال لولاية سطيف (19) بسعر 285 د.ج:
<code>/post 19 285</code>

2️⃣ <b>تحديث كافة الـ 58 ولاية دفعة واحدة:</b>
<code>/post_all [سعر الفلاح المتوسط]</code>
مثال: <code>/post_all 280</code>

<b>الضوابط المطبقة آلياً:</b>
• 🌾 5 فلاحين (الكمية: 3,000 - 15,000 كغ)
• 🤝 5 كورتية (الكمية: 1,000 - 1,300 كغ | السعر أقل من الفلاح)
• 🔪 5 مذابح (الكمية: 6,000 - 24,000 كغ | السعر أقل من الفلاح والوسيط)
• 🔒 حماية الأرقام وتدوير الأسماء تلقائياً بدون تكرار!
        `;
        await sendTelegramMessage(chatId, helpText);
        return NextResponse.json({ status: 'ok' });
      }

      // Check Command /post [code] [price]
      if (messageText.startsWith('/post_all')) {
        const parts = messageText.split(/\s+/);
        const price = parts[1] ? Number(parts[1]) : 280;

        await sendTelegramMessage(chatId, `⏳ جاري تحديث الـ 58 ولاية بسعر فلاح متوسط ${price} د.ج...`);
        const res = await seedAllWilayas(price);

        const replyMsg = `
✅ <b>تم تحديث الـ 58 ولاية جزائرية بنجاح!</b>
📊 إجمالي العروض المولدة: ${res.totalOffersGenerated} عرضاً.
🌾 متوسط سعر البيع للفلاح: ${price} د.ج/كغ.
🔒 جميع العروض محمية وموزعة بأسماء وحسابات غير مكررة.
        `;
        await sendTelegramMessage(chatId, replyMsg);
        return NextResponse.json({ status: 'ok' });
      }

      if (messageText.startsWith('/post')) {
        const parts = messageText.split(/\s+/);
        if (parts.length < 3) {
          await sendTelegramMessage(
            chatId,
            '⚠️ <b>صيغة الأمر غير صحيحة!</b>\nالاستخدام: <code>/post [رمز الولاية] [سعر الفلاح]</code>\nمثال: <code>/post 19 285</code>'
          );
          return NextResponse.json({ status: 'ok' });
        }

        const rawCode = parts[1].replace(/[^0-9]/g, '');
        const wilayaCode = rawCode.padStart(2, '0');
        const farmerPrice = Number(parts[2]);

        const wilaya = getWilayaByCode(wilayaCode);
        if (!wilaya) {
          await sendTelegramMessage(
            chatId,
            `❌ <b>رمز الولاية (${parts[1]}) غير موجود!</b>\nيرجى استخدام رقم ولاية بين 01 و 58.`
          );
          return NextResponse.json({ status: 'ok' });
        }

        if (isNaN(farmerPrice) || farmerPrice < 50 || farmerPrice > 1000) {
          await sendTelegramMessage(
            chatId,
            `❌ <b>السعر المدخل (${parts[2]}) غير منطقي!</b>`
          );
          return NextResponse.json({ status: 'ok' });
        }

        const res = await seedOffersForWilaya({ wilayaCode, farmerPrice });

        const replyMsg = `
✅ <b>تم تحديث ولاية ${res.wilayaName} (${res.wilayaCode}) بنجاح!</b>

📊 <b>تفاصيل التحديث:</b>
• 🌾 سعر الفلاح (بيع): <b>${res.farmerPrice} د.ج/كغ</b>
• 🤝 سعر الوسيط (شراء): <b>${res.farmerPrice - 7} د.ج/كغ</b> (كميات: 1,000 - 1,300 كغ)
• 🔪 سعر المذبح (شراء): <b>${res.farmerPrice - 15} د.ج/كغ</b> (كميات: 6,000 - 24,000 كغ)
• 📦 إجمالي العروض المحينة: <b>15 عرضاً</b> (5 فلاحين، 5 كورتية، 5 مذابح).
• 🔒 الأرقام مخفية بطلب الناشرين وحسابات متغيرة بنظام الذاكرة.
        `;
        await sendTelegramMessage(chatId, replyMsg);
        return NextResponse.json({ status: 'ok' });
      }
    }

    // Direct JSON API payload
    const { wilayaCode, farmerPrice, action } = body;
    if (action === 'all') {
      const res = await seedAllWilayas(farmerPrice || 280);
      return NextResponse.json({ status: 'success', result: res });
    }

    if (wilayaCode && farmerPrice) {
      const res = await seedOffersForWilaya({
        wilayaCode: String(wilayaCode).padStart(2, '0'),
        farmerPrice: Number(farmerPrice),
      });
      return NextResponse.json({ status: 'success', result: res });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
