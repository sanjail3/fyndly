import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseService } from '@/integrations/supabase/service-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  // Get the current user session using service role client to bypass RLS
  const { data: { session } } = await supabaseService.auth.getSession();

  if (!session) {
    return NextResponse.json({ user: null });
  }

  // Fetch the user's full profile from the database
  const user = await prisma.users.findUnique({
    where: { id: session.user.id },
    // Select all public profile fields
    select: {
      id: true,
      email: true,
      full_name: true,
      college: true,
      department: true,
      academic_year: true,
      about: true,
      interests: true,
      tech_skills: true,
      creative_skills: true,
      sports_skills: true,
      leadership_skills: true,
      other_skills: true,
      github: true,
      linkedin: true,
      twitter: true,
      personal_website: true,
      instagram: true,
      behance: true,
      weekly_availability: true,
      time_commitment: true,
      looking_for: true,
      meeting_preference: true,
      personality_tags: true,
      created_at: true,
      updated_at: true,
      gender: true,
      avatar_url: true,
      place: true,
      state: true,
      pass_out_year: true,
      avatar_regeneration_count: true,
    },
  });

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json(user);
} 