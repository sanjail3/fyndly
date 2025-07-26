import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

// Helper function to check if two users are matched
async function areUsersMatched(userId1: string, userId2: string) {
  if (!userId1 || !userId2) return false;
  const match = await prisma.matches.findFirst({
    where: {
      OR: [
        { user1_id: userId1, user2_id: userId2 },
        { user1_id: userId2, user2_id: userId1 },
      ],
    },
  });
  return !!match;
}

export async function GET(request: NextRequest, {params}: {params: Promise<{ userId: string }>}) {
  const {userId} = await params

  try {
    // 1. Authenticate the current user making the request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: Missing Authorization header' }, { status: 401 });
    }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    
    // Allow users to fetch their own profile
    const isFetchingSelf = currentUser.id === userId;

    // 2. Check for a match if the user is not fetching their own profile
    const areMatched = isFetchingSelf ? true : await areUsersMatched(currentUser.id, userId);

    // 3. Define what data to return based on authorization
    let userProfile;
    if (areMatched) {
      // Return full profile if matched or fetching self
      userProfile = await prisma.users.findUnique({
        where: { id: userId },
        // All fields are returned
      });
    } else {
      // Return only public profile if not matched
      userProfile = await prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          full_name: true,
          avatar_url: true,
          college: true,
          department: true,
          academic_year: true,
          about: true,
          interests: true,
          looking_for: true,
          // Explicitly exclude sensitive fields
        }
      });
    }

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user: ' + error.message },
      { status: 500 }
    );
  }
} 