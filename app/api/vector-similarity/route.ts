import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, limit = 10 } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find similar users using vector similarity
    const similarUsers = await prisma.$queryRaw`
      WITH user_embedding AS (
        SELECT embedding
        FROM users
        WHERE id = ${userId}::uuid
      )
      SELECT 
        u.id,
        u.full_name,
        u.avatar_url,
        u.college,
        u.department,
        u.academic_year,
        u.interests,
        u.tech_skills,
        u.creative_skills,
        u.sports_skills,
        u.leadership_skills,
        u.other_skills,
        u.looking_for,
        u.personality_tags,
        1 - (u.embedding <=> (SELECT embedding FROM user_embedding)) as similarity
      FROM users u
      WHERE u.id != ${userId}::uuid
      AND u.embedding IS NOT NULL
      ORDER BY similarity DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({ users: similarUsers });
  } catch (error: any) {
    console.error('Error in vector similarity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch similar users: ' + error.message },
      { status: 500 }
    );
  }
} 