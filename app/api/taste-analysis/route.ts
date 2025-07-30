import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createStreamingResponse } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch comprehensive user data
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      include: {
        recommendation_history: {
          take: 50,
          orderBy: { created_at: 'desc' }
        },
        matches_matches_user1_idTousers: {
          take: 10,
          orderBy: { matched_at: 'desc' }
        },
        matches_matches_user2_idTousers: {
          take: 10,
          orderBy: { matched_at: 'desc' }
        },
        messages_sent: {
          take: 100,
          orderBy: { created_at: 'desc' }
        },
        product_swipes_by: {
          take: 50,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate analytics data
    const analytics = {
      social: {
        total_matches: user.matches_matches_user1_idTousers.length + user.matches_matches_user2_idTousers.length,
        messages_sent: user.messages_sent.length,
        avg_message_length: user.messages_sent.length > 0 
          ? Math.round(user.messages_sent.reduce((sum, msg) => sum + msg.content.length, 0) / user.messages_sent.length)
          : 0
      },
      content: {
        total_recommendations: user.recommendation_history.length,
        books_engaged: user.recommendation_history.filter(r => r.entity_type === 'books').length,
        movies_engaged: user.recommendation_history.filter(r => r.entity_type === 'movies').length,
        podcasts_engaged: user.recommendation_history.filter(r => r.entity_type === 'podcasts').length
      },
      products: {
        total_swipes: user.product_swipes_by.length,
        right_swipes: user.product_swipes_by.filter(s => s.direction === 'RIGHT').length,
        left_swipes: user.product_swipes_by.filter(s => s.direction === 'LEFT').length,
        success_rate: user.product_swipes_by.length > 0 
          ? Math.round((user.product_swipes_by.filter(s => s.direction === 'RIGHT').length / user.product_swipes_by.length) * 100)
          : 0
      },
      timeline: {
        account_age_days: Math.floor((Date.now() - new Date(user.created_at!).getTime()) / (1000 * 60 * 60 * 24)),
        recent_activity: user.messages_sent.filter(m => 
          new Date(m.created_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
        ).length
      }
    };

    // Create AI analysis prompt
    const prompt = `Analyze the following user's taste profile and provide comprehensive insights:

USER PROFILE:
- Name: ${user.full_name}
- Academic: ${user.college}, ${user.department}, Year ${user.academic_year}
- Interests: ${user.interests.join(', ')}
- Tech Skills: ${user.tech_skills.join(', ')}
- Creative Skills: ${user.creative_skills.join(', ')}
- Personality Tags: ${user.personality_tags.join(', ')}

CONTENT PREFERENCES:
- Book Interests: ${user.book_interests.join(', ')}
- Favorite Books: ${user.favorite_books.join(', ')}
- Movie Interests: ${user.movie_interests.join(', ')}
- Favorite Movies: ${user.favorite_movies.join(', ')}
- Podcast Interests: ${user.podcast_interests.join(', ')}
- Favorite Podcasts: ${user.favorite_podcasts.join(', ')}
- Favorite Brands: ${user.favorite_brands.join(', ')}

BEHAVIORAL ANALYTICS:
- Social: ${analytics.social.total_matches} matches, ${analytics.social.messages_sent} messages (avg ${analytics.social.avg_message_length} chars)
- Content: Engaged with ${analytics.content.total_recommendations} recommendations (${analytics.content.books_engaged} books, ${analytics.content.movies_engaged} movies, ${analytics.content.podcasts_engaged} podcasts)
- Products: ${analytics.products.total_swipes} swipes, ${analytics.products.success_rate}% success rate
- Timeline: ${analytics.timeline.account_age_days} days active, ${analytics.timeline.recent_activity} recent activities

ANALYSIS REQUIREMENTS:
1. Personality Assessment: Analyze key traits based on content preferences and behavior
2. Taste Patterns: Identify dominant themes and preferences across different domains
3. Social Compatibility: Assess social engagement style and compatibility indicators
4. Growth Trajectory: Identify trends and evolution in interests
5. Recommendations: Suggest areas for exploration and development

Provide a comprehensive, insightful analysis in 3-4 well-structured paragraphs that reveals meaningful patterns and actionable insights. Focus on:
- Psychological profile based on content choices
- Cross-domain preference patterns
- Social and professional implications
- Future growth opportunities`;

    const messages = [
      {
        role: 'system',
        content: 'You are an expert behavioral analyst and data scientist specializing in taste profiling and personality insights. Provide thoughtful, nuanced analysis that connects content preferences to personality traits and behavioral patterns.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    // Generate AI analysis
    const analysisResponse = await createStreamingResponse(messages);
    
    if (!analysisResponse) {
      throw new Error('Failed to generate AI analysis');
    }

    // Return both analytics data and AI insights
    return NextResponse.json({
      success: true,
      analytics: analytics,
      user_summary: {
        name: user.full_name,
        academic_info: `${user.college} - ${user.department}`,
        key_interests: user.interests.slice(0, 5),
        personality_traits: user.personality_tags,
        favorite_content: {
          books: user.favorite_books.slice(0, 3),
          movies: user.favorite_movies.slice(0, 3),
          podcasts: user.favorite_podcasts.slice(0, 3),
          brands: user.favorite_brands.slice(0, 3)
        }
      },
      ai_analysis_prompt: prompt // For debugging - remove in production
    });

  } catch (error: any) {
    console.error('Taste analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate taste analysis', details: error.message },
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

    // Get user's aggregated data for quick dashboard view
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        full_name: true,
        college: true,
        department: true,
        academic_year: true,
        interests: true,
        personality_tags: true,
        book_interests: true,
        movie_interests: true,
        podcast_interests: true,
        favorite_books: true,
        favorite_movies: true,
        favorite_podcasts: true,
        favorite_brands: true,
        created_at: true,
        _count: {
          select: {
            matches_matches_user1_idTousers: true,
            matches_matches_user2_idTousers: true,
            messages_sent: true,
            recommendation_history: true,
            product_swipes_by: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate personality scores based on interests and behavior
    const personalityScores = {
      creativity: Math.min(95, 40 + (user.interests.filter(i => 
        ['photography', 'music', 'art', 'design', 'writing'].some(creative => 
          i.toLowerCase().includes(creative)
        )).length * 15) + (user.personality_tags.includes('Creative') ? 20 : 0)),
      
      analytical: Math.min(95, 50 + (user.interests.filter(i => 
        ['programming', 'data', 'math', 'science', 'research'].some(analytical => 
          i.toLowerCase().includes(analytical)
        )).length * 12) + (user.personality_tags.includes('Analytical') ? 15 : 0)),
      
      social: Math.min(95, 30 + (user._count.matches_matches_user1_idTousers + user._count.matches_matches_user2_idTousers) * 3 + 
        Math.min(25, user._count.messages_sent * 0.1)),
      
      adventurous: Math.min(95, 35 + (user.interests.filter(i => 
        ['travel', 'adventure', 'sports', 'explore'].some(adventurous => 
          i.toLowerCase().includes(adventurous)
        )).length * 15) + (user.personality_tags.includes('Adventurous') ? 20 : 0)),
      
      technical: Math.min(95, 45 + (user.interests.filter(i => 
        ['tech', 'coding', 'programming', 'software', 'ai', 'ml'].some(tech => 
          i.toLowerCase().includes(tech)
        )).length * 12) + (user.personality_tags.includes('Tech Enthusiast') ? 15 : 0))
    };

    return NextResponse.json({
      success: true,
      user_data: user,
      personality_scores: personalityScores,
      quick_stats: {
        total_matches: user._count.matches_matches_user1_idTousers + user._count.matches_matches_user2_idTousers,
        messages_sent: user._count.messages_sent,
        content_interactions: user._count.recommendation_history,
        product_interactions: user._count.product_swipes_by,
        account_age_days: Math.floor((Date.now() - new Date(user.created_at!).getTime()) / (1000 * 60 * 60 * 24))
      }
    });

  } catch (error: any) {
    console.error('Taste analysis GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
} 