import { NextResponse } from 'next/server';
import { pool } from '@/db/index';

async function ensureSettingsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "platform_settings" (
        "key" text PRIMARY KEY NOT NULL,
        "value" text NOT NULL,
        "updated_at" timestamp DEFAULT now()
      );
    `);
  } catch (e) {
    console.error('ensureSettingsTable error:', e);
  }
}

export async function GET() {
  try {
    await ensureSettingsTable();
    const res = await pool.query(
      `SELECT "value" FROM "platform_settings" WHERE "key" = 'platform_access_mode' LIMIT 1`
    );

    let mode = 'free'; // default mode: free
    if (res.rows && res.rows.length > 0) {
      mode = res.rows[0].value;
    } else {
      // Insert default 'free'
      await pool.query(
        `INSERT INTO "platform_settings" ("key", "value") VALUES ('platform_access_mode', 'free') ON CONFLICT ("key") DO NOTHING`
      );
    }

    return NextResponse.json({ status: 'success', mode });
  } catch (error: any) {
    console.error('platform-mode GET error:', error);
    return NextResponse.json({ status: 'success', mode: 'free' });
  }
}

export async function POST(request: Request) {
  try {
    await ensureSettingsTable();
    const body = await request.json().catch(() => ({}));
    const { mode } = body;

    if (!mode || (mode !== 'free' && mode !== 'subscription')) {
      return NextResponse.json(
        { status: 'error', message: 'الوضع غير صحيح، يجب أن يكون free أو subscription' },
        { status: 400 }
      );
    }

    await pool.query(
      `INSERT INTO "platform_settings" ("key", "value", "updated_at")
       VALUES ('platform_access_mode', $1, NOW())
       ON CONFLICT ("key") DO UPDATE 
       SET "value" = EXCLUDED."value", "updated_at" = NOW()`,
      [mode]
    );

    return NextResponse.json({ status: 'success', mode });
  } catch (error: any) {
    console.error('platform-mode POST error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'فشل تحديث وضع المنصة' },
      { status: 500 }
    );
  }
}
