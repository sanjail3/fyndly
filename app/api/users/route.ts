import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const excludeUserId = searchParams.get('excludeUserId');
  const college = searchParams.get('college');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    let whereClause: any = {};
    if (excludeUserId) {
      whereClause.id = { not: excludeUserId };
    }
    if (college) {
      whereClause.college = college;
    }

    const users = await prisma.users.findMany({
      where: whereClause,
      take: limit,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 