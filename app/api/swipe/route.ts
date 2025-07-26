import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const swipeSchema = z.object({
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
  direction: z.enum(['LEFT', 'RIGHT']),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceId, targetId, direction } = swipeSchema.parse(body);

    // 1. Record the swipe action
    await prisma.swipe.create({
      data: {
        sourceId,
        targetId,
        direction,
      },
    });

    // 2. Remove the target from the source's swipe queue
    await prisma.swipeQueue.deleteMany({
      where: {
        userId: sourceId,
        targetId,
      },
    });

    return NextResponse.json({ success: true, message: 'Swipe recorded.' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.issues }, { status: 400 });
    }
    console.error('Error recording swipe:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 