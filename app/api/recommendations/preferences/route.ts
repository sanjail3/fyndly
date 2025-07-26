import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        full_name: true,
        age_group: true,
        gender: true,
        book_interests: true,
        movie_interests: true,
        podcast_interests: true,
        tv_show_interests: true,
        brand_interests: true,
        favorite_books: true,
        favorite_movies: true,
        favorite_podcasts: true,
        favorite_tv_shows: true,
        favorite_brands: true,
        content_rating_preference: true,
        min_popularity_threshold: true,
        recommendation_preferences: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      preferences: {
        age_group: user.age_group,
        gender: user.gender,
        book_interests: user.book_interests,
        movie_interests: user.movie_interests,
        podcast_interests: user.podcast_interests,
        tv_show_interests: user.tv_show_interests,
        brand_interests: user.brand_interests,
        favorite_books: user.favorite_books,
        favorite_movies: user.favorite_movies,
        favorite_podcasts: user.favorite_podcasts,
        favorite_tv_shows: user.favorite_tv_shows,
        favorite_brands: user.favorite_brands,
        content_rating_preference: user.content_rating_preference,
        min_popularity_threshold: user.min_popularity_threshold,
        recommendation_preferences: user.recommendation_preferences
      }
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      age_group,
      gender,
      book_interests,
      movie_interests,
      podcast_interests,
      tv_show_interests,
      brand_interests,
      favorite_books,
      favorite_movies,
      favorite_podcasts,
      favorite_tv_shows,
      favorite_brands,
      content_rating_preference,
      min_popularity_threshold,
      recommendation_preferences
    } = body;

    // Update user preferences
    const updatedUser = await prisma.users.update({
      where: { id: session.user.id },
      data: {
        age_group,
        gender,
        book_interests: book_interests || [],
        movie_interests: movie_interests || [],
        podcast_interests: podcast_interests || [],
        tv_show_interests: tv_show_interests || [],
        brand_interests: brand_interests || [],
        favorite_books: favorite_books || [],
        favorite_movies: favorite_movies || [],
        favorite_podcasts: favorite_podcasts || [],
        favorite_tv_shows: favorite_tv_shows || [],
        favorite_brands: favorite_brands || [],
        content_rating_preference,
        min_popularity_threshold,
        recommendation_preferences
      },
      select: {
        id: true,
        full_name: true,
        age_group: true,
        gender: true,
        book_interests: true,
        movie_interests: true,
        podcast_interests: true,
        tv_show_interests: true,
        brand_interests: true,
        favorite_books: true,
        favorite_movies: true,
        favorite_podcasts: true,
        favorite_tv_shows: true,
        favorite_brands: true,
        content_rating_preference: true,
        min_popularity_threshold: true,
        recommendation_preferences: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: {
        age_group: updatedUser.age_group,
        gender: updatedUser.gender,
        book_interests: updatedUser.book_interests,
        movie_interests: updatedUser.movie_interests,
        podcast_interests: updatedUser.podcast_interests,
        tv_show_interests: updatedUser.tv_show_interests,
        brand_interests: updatedUser.brand_interests,
        favorite_books: updatedUser.favorite_books,
        favorite_movies: updatedUser.favorite_movies,
        favorite_podcasts: updatedUser.favorite_podcasts,
        favorite_tv_shows: updatedUser.favorite_tv_shows,
        favorite_brands: updatedUser.favorite_brands,
        content_rating_preference: updatedUser.content_rating_preference,
        min_popularity_threshold: updatedUser.min_popularity_threshold,
        recommendation_preferences: updatedUser.recommendation_preferences
      }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 