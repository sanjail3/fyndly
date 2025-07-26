import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      entity_id,
      entity_type,
      entity_title,
      recommendation_type,
      relevance_score,
      explanation,
      user_action // "viewed", "liked", "disliked", "saved", "purchased"
    } = body;

    if (!entity_id || !entity_type || !entity_title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create or update recommendation history entry
    const interaction = await prisma.recommendationHistory.create({
      data: {
        userId: session.user.id,
        entity_id,
        entity_type,
        entity_title,
        recommendation_type: recommendation_type || 'user_based',
        relevance_score: relevance_score || 0.0,
        user_action,
        explanation: explanation || ''
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Interaction recorded successfully',
      interaction
    });

  } catch (error) {
    console.error('Record interaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entity_type = searchParams.get('entity_type');
    const recommendation_type = searchParams.get('recommendation_type');
    const user_action = searchParams.get('user_action');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = {
      userId: session.user.id
    };

    if (entity_type) where.entity_type = entity_type;
    if (recommendation_type) where.recommendation_type = recommendation_type;
    if (user_action) where.user_action = user_action;

    const interactions = await prisma.recommendationHistory.findMany({
      where,
      orderBy: {
        created_at: 'desc'
      },
      take: limit
    });

    return NextResponse.json({
      success: true,
      interactions,
      total: interactions.length
    });

  } catch (error) {
    console.error('Get interactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 