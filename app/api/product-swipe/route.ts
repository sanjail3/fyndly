import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const productSwipeSchema = z.object({
  userId: z.string().uuid(),
  productId: z.string(), // Product ID can be a string
  direction: z.enum(['LEFT', 'RIGHT']),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, productId, direction } = productSwipeSchema.parse(body);

    // 1. Record the product swipe action
    await prisma.productSwipe.create({
      data: {
        sourceId: userId,
        productId,
        direction,
      },
    });

    // 2. Remove the swiped product from the user's product swipe queue
    await prisma.productSwipeQueue.deleteMany({
      where: {
        userId: userId,
        productId,
      },
    });

    return NextResponse.json({ success: true, message: 'Product swipe recorded.' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.issues }, { status: 400 });
    }
    console.error('Error recording product swipe:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 