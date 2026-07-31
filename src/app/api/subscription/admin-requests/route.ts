import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { users } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    
    // Filter users with subscription requests or pending status
    const requests = allUsers.filter(
      (u) => u.subscriptionStatus === 'pending' || u.subscriptionStatus === 'active' || u.subscriptionStatus === 'rejected'
    );

    return NextResponse.json({
      status: 'success',
      requests,
    });
  } catch (error: any) {
    console.error('Fetch admin subscription requests error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'خطأ أثناء جلب طلبات الاشتراك' },
      { status: 500 }
    );
  }
}
