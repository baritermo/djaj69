import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID;

// Helper to send photo to Telegram channel/chat
async function sendTelegramPhoto(chatId: string, photoSource: string, caption: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '8529857614:AAFqiz0Y_y-11gZSjgGAfcCbV3j42er720c';
  if (!botToken || !chatId) return;

  try {
    if (photoSource.startsWith('data:image')) {
      const matches = photoSource.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = new Blob([buffer], { type: mimeType });

        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('caption', caption);
        formData.append('parse_mode', 'HTML');
        formData.append('photo', blob, 'document.jpg');

        await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          body: formData,
        });
        return;
      }
    }

    if (photoSource.startsWith('http://') || photoSource.startsWith('https://')) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: photoSource,
          caption,
          parse_mode: 'HTML',
        }),
      });
    }
  } catch (e) {
    console.error('Error sending photo to Telegram:', e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, receiptUrl, idCardUrl } = body;

    if (!phone) {
      return NextResponse.json(
        { status: 'error', message: 'يرجى إدخال رقم الهاتف المسجل' },
        { status: 400 }
      );
    }

    if (!receiptUrl || !idCardUrl) {
      return NextResponse.json(
        { status: 'error', message: 'يرجى إرفاق صورة وصل الدفع وصورة بطاقة الهوية / بطاقة الفلاح' },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).trim();

    const [user] = await db.select().from(users).where(eq(users.phone, cleanPhone));

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'الحساب غير موجود. يرجى إنشاء حساب جديد أولاً' },
        { status: 404 }
      );
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        subscriptionStatus: 'pending',
        receiptUrl: String(receiptUrl),
        idCardUrl: String(idCardUrl),
        rejectionReason: null,
      })
      .where(eq(users.phone, cleanPhone))
      .returning();

    // Instant Notification to Telegram Admin Channel ONLY
    const token = process.env.TELEGRAM_BOT_TOKEN || '8529857614:AAFqiz0Y_y-11gZSjgGAfcCbV3j42er720c';
    const channelId = process.env.ADMIN_CHANNEL_CHAT_ID || '-1004308858796';
    const targetChatIds = [channelId];

    for (const targetId of targetChatIds) {
      try {
        const textMsg = `
📋 <b>طلب اشتراك حساب جديد بحاجة لتفعيل!</b>

• 📝 الاسم واللقب: <b>${user.fullName}</b>
• 📱 رقم الهاتف: <code>${user.phone}</code>
• 🔑 كلمة السر: <code>${user.password}</code>
• 📍 الولاية: <b>${user.wilayaCode}</b>
• 💼 الصفة: <b>${user.role}</b>
• ⏳ الحالة: <b>قيد المراجعة (Pending)</b>
        `;

        const isChannel = String(targetId).startsWith('-');
        const inlineButtons = isChannel
          ? {
              inline_keyboard: [
                [
                  { text: '✅ تفعيل اشتراك الحساب', url: `https://t.me/djajco_bot?start=approve_${user.phone}` },
                  { text: '❌ رفض الطلب', url: `https://t.me/djajco_bot?start=reject_${user.phone}` },
                ],
              ],
            }
          : {
              inline_keyboard: [
                [
                  { text: '✅ تفعيل اشتراك الحساب', callback_data: `approve_sub_${user.phone}` },
                  { text: '❌ رفض الطلب', callback_data: `reject_sub_${user.phone}` },
                ],
              ],
            };

        // Send Text Notification with Action Buttons
        const sendRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetId,
            text: textMsg,
            parse_mode: 'HTML',
            reply_markup: inlineButtons,
          }),
        });

        const sendData = await sendRes.json();
        if (!sendData.ok) {
          console.warn(`Telegram sendMessage retry without buttons for target ${targetId}:`, sendData);
          // Retry without reply_markup if channel rejected buttons
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: targetId,
              text: textMsg,
              parse_mode: 'HTML',
            }),
          });
        }

        // Send Receipt Photo
        if (receiptUrl) {
          await sendTelegramPhoto(
            targetId,
            receiptUrl,
            `🧾 <b>وصل الدفع المرفق لطلب اشتراك الحساب:</b>\n👤 ${user.fullName} | 📱 <code>${user.phone}</code>`
          );
        }

        // Send ID Card Photo
        if (idCardUrl) {
          await sendTelegramPhoto(
            targetId,
            idCardUrl,
            `🆔 <b>وثيقة الهوية المرفقة لطلب اشتراك الحساب:</b>\n👤 ${user.fullName} | 📱 <code>${user.phone}</code>`
          );
        }
      } catch (e) {
        console.error(`Error pushing subscription request to Telegram target ${targetId}:`, e);
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'تم إرسال وصل الاشتراك ووثيقة الهوية بنجاح. طلبك قيد المراجعة من طرف إدارة البورصة',
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        role: updatedUser.role,
        wilayaCode: updatedUser.wilayaCode,
        subscriptionStatus: updatedUser.subscriptionStatus,
      },
    });
  } catch (error: any) {
    console.error('Subscription request error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'خطأ أثناء إرسال طلب الاشتراك' },
      { status: 500 }
    );
  }
}
