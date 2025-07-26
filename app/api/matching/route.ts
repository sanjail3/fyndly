import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define the public-facing user fields to be selected
const userPublicProfileSelect = {
  id: true,
  full_name: true,
  avatar_url: true,
  college: true,
  department: true,
  academic_year: true,
  interests: true,
  tech_skills: true,
  creative_skills: true,
  sports_skills: true,
  leadership_skills: true,
  other_skills: true,
  looking_for: true,
  personality_tags: true,
};

// Helper: Get exclusion set (matched, requested, rejected, self)
async function getGlobalExclusionIds(userId: string) {
  // Matched users
  const matches = await prisma.matches.findMany({
    where: {
      OR: [
        { user1_id: userId },
        { user2_id: userId },
      ],
    },
  });
  const matchedIds = matches.flatMap(m => [m.user1_id, m.user2_id].filter(id => id && id !== userId));

  // Connection requests (pending, accepted, rejected)
  const requests = await prisma.connection_requests.findMany({
    where: {
      OR: [
        { sender_id: userId },
        { receiver_id: userId },
      ],
    },
  });
  const requestedIds = requests.flatMap(r => [r.sender_id, r.receiver_id].filter(id => id && id !== userId));

  // Rejected users (status === 'REJECTED')
  const rejectedIds = requests.filter(r => r.status === 'REJECTED').flatMap(r => [r.sender_id, r.receiver_id].filter(id => id && id !== userId));

  // Self
  return new Set([userId, ...matchedIds, ...requestedIds, ...rejectedIds]);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const filtersParam = searchParams.get('filters');
  const filters = filtersParam ? JSON.parse(filtersParam) : {};

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    // 1. Get current user profile
    const currentUser = await prisma.users.findUnique({ 
      where: { id: userId },
      // No need to restrict fields for the current user
    });
    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    // 2. Build global exclusion set
    const exclusionSet = await getGlobalExclusionIds(userId);
    const dedupSet = new Set<string>(exclusionSet);

    // Fetch all candidates once (except excluded)
    const allCandidates: any[] = await prisma.users.findMany({
      where: { id: { notIn: Array.from(exclusionSet) } },
      select: userPublicProfileSelect, // Apply public profile selection
    });

    // Matched Users (for UI section) - Only users with a true match in the matches table
    const matches = await prisma.matches.findMany({
      where: {
        OR: [
          { user1_id: userId },
          { user2_id: userId },
        ],
      },
    });
    const matchedUserIds = matches.map((m: any) => m.user1_id === userId ? m.user2_id : m.user1_id);
    const matchedUsers = await prisma.users.findMany({
      where: { id: { in: matchedUserIds } },
      select: userPublicProfileSelect, // Apply public profile selection
    });

    // Helper: Profile completeness score
    function profileScore(u: any) {
      let score = 0;
      if (u.bio) score += 1;
      if (u.looking_for && u.looking_for.length > 0) score += 1;
      if (u.tech_skills && u.tech_skills.length > 0) score += 1;
      if (u.college) score += 1;
      if (u.avatar_url) score += 1;
      return score;
    }

    // 3. Perfect Matches (vector similarity + intent overlap)
    let perfectMatches: any[] = [];
    {
      const res = await fetch(`${req.nextUrl.origin}/api/vector-similarity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, limit: 30, select: userPublicProfileSelect }), // Pass select object to vector search
      });
      const { users: similarUsers } = await res.json();
      perfectMatches = similarUsers
        .filter((u: any) => !dedupSet.has(u.id))
        .map((u: any) => ({
          ...u,
          intentOverlap: u.looking_for?.filter((i: string) => currentUser.looking_for?.includes(i)).length || 0,
        }))
        .sort((a: any, b: any) => (b.similarity * 0.7 + b.intentOverlap * 0.3) - (a.similarity * 0.7 + a.intentOverlap * 0.3))
        .slice(0, 5);
      perfectMatches.forEach(u => dedupSet.add(u.id));
    }

    // 4. Hot Matches (recently active, high profile score)
    let hotMatches: any[] = [];
    {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days
      hotMatches = allCandidates
        .filter(u => !dedupSet.has(u.id) && u.updated_at && u.updated_at >= since)
        .map(u => ({ ...u, profileScore: profileScore(u) }))
        .sort((a, b) => b.profileScore - a.profileScore || ((b.updated_at?.getTime?.() ?? 0) - (a.updated_at?.getTime?.() ?? 0)))
        .slice(0, 10);
      hotMatches.forEach(u => dedupSet.add(u.id));
    }

    // 5. Recommended For You (matchScore + serendipity)
    let recommendedMatches: any[] = [];
    {
      const res = await fetch(`${req.nextUrl.origin}/api/vector-similarity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, limit: 200, select: userPublicProfileSelect }), // Pass select object to vector search
      });
      const { users: similarUsers } = await res.json();
      // Calculate matchScore (vector + shared traits)
      const scored = similarUsers
        .filter((u: any) => !dedupSet.has(u.id))
        .map((u: any) => {
          const sharedSkills = [
            ...(u.tech_skills || []),
            ...(u.creative_skills || []),
            ...(u.sports_skills || []),
            ...(u.leadership_skills || []),
            ...(u.other_skills || []),
          ].filter((skill: string) => [
            ...(currentUser.tech_skills || []),
            ...(currentUser.creative_skills || []),
            ...(currentUser.sports_skills || []),
            ...(currentUser.leadership_skills || []),
            ...(currentUser.other_skills || []),
          ].includes(skill)).length;
          return {
            ...u,
            matchScore: u.similarity * 0.7 + sharedSkills * 0.3,
          };
        })
        .sort((a: any, b: any) => b.matchScore - a.matchScore);
      // Take top 80
      const top80 = scored.slice(0, 80);
      // Inject 20% serendipity (random from rest)
      const rest = scored.slice(80).filter((u: { id: string; }) => !dedupSet.has(u.id));
      const serendipityCount = 20;
      const serendipity = rest.sort(() => Math.random() - 0.5).slice(0, serendipityCount);
      recommendedMatches = [...top80, ...serendipity].sort(() => Math.random() - 0.5).slice(0, 100);
      recommendedMatches.forEach(u => dedupSet.add(u.id));
    }

    // 6. Top From Your College (can repeat)
    let collegeMatches: any[] = [];
    {
      collegeMatches = allCandidates
        .filter(u => u.college === currentUser.college)
        .sort((a, b) => profileScore(b) - profileScore(a) || ((b.updated_at?.getTime?.() ?? 0) - (a.updated_at?.getTime?.() ?? 0)))
        .slice(0, 10);
    }

    // 7. Intent Highlights (group by intent tags, top 3 per tag, dedup within tag)
    let intentHighlights: Record<string, any[]> = {};
    {
      const tagMap: Record<string, any[]> = {};
      (allCandidates as Array<any>).forEach((u: any) => {
        (u.looking_for || []).forEach((tag: string) => {
          if (!tagMap[tag]) tagMap[tag] = [];
          tagMap[tag].push(u);
        });
      });
      Object.entries(tagMap).forEach(([tag, users]) => {
        // Deduplicate within tag
        const seen = new Set<string>();
        intentHighlights[tag] = users.filter((u: any) => {
          if (seen.has(u.id)) return false;
          seen.add(u.id);
          return true;
        }).sort((a: any, b: any) => profileScore(b) - profileScore(a) || ((b.updated_at?.getTime?.() ?? 0) - (a.updated_at?.getTime?.() ?? 0))).slice(0, 3);
      });
    }

    // --- FILTERED RESULTS LOGIC ---
    let filteredResults: any[] = [];
    const hasFilters = filters && Object.keys(filters).length > 0;
    if (hasFilters) {
      // Fetch all users except self for filtering
      const allUsers: any[] = await prisma.users.findMany({
        where: { id: { not: userId } },
        select: userPublicProfileSelect, // Apply public profile selection
      });
      filteredResults = allUsers.filter((candidate: any) => {
        let passes = true;
        if (filters.search && filters.search.trim()) {
          const searchTerm = filters.search.toLowerCase().trim();
          const searchableFields = [
            candidate.full_name || '',
            candidate.college || '',
            ...(candidate.tech_skills || []),
            ...(candidate.creative_skills || []),
            ...(candidate.sports_skills || []),
            ...(candidate.leadership_skills || []),
            ...(candidate.other_skills || []),
          ];
          const hasMatch = searchableFields.some(field => 
            field.toLowerCase().includes(searchTerm)
          );
          if (!hasMatch) passes = false;
        }
        if (filters.intent && filters.intent.length > 0) {
          const hasIntent = candidate.looking_for?.some((intent: string) => filters.intent.includes(intent));
          if (!hasIntent) passes = false;
        }
        if (filters.skills && filters.skills.length > 0) {
          const allSkills = [
            ...(candidate.tech_skills || []),
            ...(candidate.creative_skills || []),
            ...(candidate.sports_skills || []),
            ...(candidate.leadership_skills || []),
            ...(candidate.other_skills || []),
          ];
          const hasSkill = allSkills.some((skill: string) => filters.skills.includes(skill));
          if (!hasSkill) passes = false;
        }
        if (filters.college && filters.college.length > 0) {
          if (!filters.college.includes(candidate.college)) passes = false;
        }
        if (filters.department && filters.department.length > 0) {
          if (!filters.department.includes(candidate.department)) passes = false;
        }
        if (filters.gender && filters.gender.length > 0) {
          if (!filters.gender.includes(candidate.gender)) passes = false;
        }
        if (filters.academic_year) {
          if (filters.academic_year === 'Passout') {
            if (!candidate.pass_out_year) passes = false;
          } else {
            const yearNumber = parseInt(filters.academic_year.replace(/[^\d]/g, ''), 10);
            if (candidate.academic_year !== yearNumber) passes = false;
          }
        }
        return passes;
      });
      return NextResponse.json({ filteredResults });
    }

    // If no filters, only return matchedUsers for Explore page
    return NextResponse.json({ matchedUsers });
  } catch (error) {
    console.error('Error in matching API:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 