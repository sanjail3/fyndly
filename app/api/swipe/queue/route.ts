import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const queueQuerySchema = z.object({
  userId: z.string().uuid(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { userId, limit } = queueQuerySchema.parse({
      userId: searchParams.get('userId'),
      limit: searchParams.get('limit'),
    });

    const queueItems = await prisma.swipeQueue.findMany({
      where: { userId },
      orderBy: { position: 'asc' },
      take: limit,
      include: {
        target: true, // Include the full user profile of the target
      },
    });

    // Attach matchScore to each target user, but only return allowed fields
    const result = queueItems.map(item => {
      const t = item.target;
      return {
        ...item,
        target: {
          id: t.id,
          full_name: t.full_name,
          college: t.college,
          department: t.department,
          academic_year: t.academic_year,
          avatar_url: t.avatar_url,
          interests: t.interests,
          tech_skills: t.tech_skills,
          creative_skills: t.creative_skills,
          sports_skills: t.sports_skills,
          leadership_skills: t.leadership_skills,
          other_skills: t.other_skills,
          looking_for: t.looking_for,
          weekly_availability: t.weekly_availability,
          time_commitment: t.time_commitment,
          about: t.about,
          place: t.place,
          personality_tags: t.personality_tags,
          matchScore: item.score,
        },
      };
    });

    // TODO: Implement fallback logic if queue is empty or below threshold

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
    }
    console.error('Error fetching swipe queue:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // ... existing code ...
} 