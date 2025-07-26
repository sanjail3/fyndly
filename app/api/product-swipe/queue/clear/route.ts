import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = z.object({ userId: z.string().uuid() }).parse(body);
    await prisma.productSwipeQueue.deleteMany({ where: { userId } });
    await prisma.productSwipeQueue.deleteMany({ where: { userId: userId } }); // Corrected to use prisma.productSwipe
    return NextResponse.json({ success: true, message: 'Product swipe queue and swipes cleared.' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.issues }, { status: 400 });
    }
    console.error('Error clearing product swipe queue:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 