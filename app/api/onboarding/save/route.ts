import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseService } from '@/integrations/supabase/service-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabaseService.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      basicInfo,
      interests,
      skills,
      about,
      achievements,
      socialLinks,
      availability,
      funTags,
      avatarUrl
    } = body;

    // Prepare user data for database
    const userData = {
      id: session.user.id,
      email: session.user.email || "",
      full_name: basicInfo.name || "",
      college: basicInfo.college || "",
      department: basicInfo.department || "",
      academic_year: parseInt(basicInfo.year?.replace(/[^\d]/g, '') || "1"),
      pass_out_year: basicInfo.year === 'Passout' 
        ? parseInt(basicInfo.passOutYear || '', 10) 
        : null,
      gender: basicInfo.gender || 'prefer_not_to_say',
      place: basicInfo.place || "",
      state: basicInfo.state || null,
      avatar_url: avatarUrl || "",
      about: about || "",
      
      // Interests and Skills
      interests: interests || [],
      tech_skills: skills?.tech || [],
      creative_skills: skills?.creative || [],
      sports_skills: skills?.sports || [],
      leadership_skills: skills?.leadership || [],
      other_skills: skills?.other || [],
      
      // Social Links
      github: socialLinks?.github || null,
      linkedin: socialLinks?.linkedin || null,
      twitter: socialLinks?.twitter || null,
      personal_website: socialLinks?.website || null,
      instagram: socialLinks?.instagram || null,
      behance: socialLinks?.behance || null,
      
      // Availability & Intent
      weekly_availability: availability?.weeklyHours || null,
      time_commitment: availability?.timeCommitment || null,
      looking_for: availability?.lookingFor || [],
      meeting_preference: availability?.preferredMeeting || null,
      
      // Fun Tags
      personality_tags: funTags || []
    };

    console.log('Saving user profile via API...');

    // Use Prisma to insert/update user data (bypasses RLS)
    const user = await prisma.users.upsert({
      where: { id: session.user.id },
      update: userData,
      create: userData,
    });

    // Insert achievements if any
    if (achievements && achievements.length > 0) {
      // First, delete existing achievements for this user
      await prisma.achievements.deleteMany({
        where: { user_id: session.user.id }
      });

      // Then insert new achievements
      const achievementsData = achievements.map((achievement: any) => ({
        user_id: session.user.id,
        title: achievement.title,
        description: achievement.description,
        link: achievement.link || null
      }));

      await prisma.achievements.createMany({
        data: achievementsData
      });
    }

    console.log('User profile saved successfully');

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save profile data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 