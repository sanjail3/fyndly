import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// --- Copy from matching API for privacy ---
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
  updated_at: true,
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

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    // 1. Find all users already in today's ExploreQueue for this user
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // --- Clear today's queue for this user before generating new ---
    await prisma.exploreQueue.deleteMany({
      where: {
        userId,
        createdAt: { gte: today },
      },
    });

    const alreadyShownIds = await prisma.exploreQueue.findMany({
      where: {
        userId,
        createdAt: { gte: today },
      },
      select: { recommendedUserId: true },
    }).then(rows => rows.map(r => r.recommendedUserId));

    // 2. Get current user profile
    const currentUser = await prisma.users.findUnique({ where: { id: userId } });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 3. Build global exclusion set (matched, requested, rejected, self, already shown)
    const exclusionSet = await getGlobalExclusionIds(userId);
    alreadyShownIds.forEach(id => exclusionSet.add(id));
    const dedupSet = new Set<string>(exclusionSet);

    // 4. Fetch all candidates (except excluded)
    let allCandidates: any[] = await prisma.users.findMany({
      where: { id: { notIn: Array.from(exclusionSet) } },
      select: userPublicProfileSelect,
    });

    // If no candidates left, reset exclusion set (except permanent exclusions) and try again
    if (allCandidates.length === 0) {
      // Only exclude self, matched, rejected (not already shown)
      const permanentExclusions = await getGlobalExclusionIds(userId);
      allCandidates = await prisma.users.findMany({
        where: { id: { notIn: Array.from(permanentExclusions) } },
        select: userPublicProfileSelect,
      });
      // Optionally, clear today's exploreQueue for this user again
      await prisma.exploreQueue.deleteMany({
        where: {
          userId,
          createdAt: { gte: today },
        },
      });
    }

    // Debug logging
    console.log('allCandidates:', allCandidates.length);

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

    // --- Section logic (copy from matching API, but always exclude dedupSet) ---
    // 1. Perfect Matches (vector similarity + intent overlap)
    let perfectMatches: any[] = [];
    {
      const res = await fetch(`${req.nextUrl.origin}/api/vector-similarity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, limit: 30 }),
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

    // Debug logging
    console.log('perfectMatches:', perfectMatches.length);

    // 2. Hot Matches (recently active, high profile score)
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

    // Debug logging
    console.log('hotMatches:', hotMatches.length);

    // 3. Recommended For You (matchScore + serendipity)
    let recommendedMatches: any[] = [];
    {
      const res = await fetch(`${req.nextUrl.origin}/api/vector-similarity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, limit: 200 }),
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

    // Debug logging
    console.log('recommendedMatches:', recommendedMatches.length);

    // 4. Top From Your College (match matching API logic, do NOT dedup against dedupSet)
    let collegeMatches: any[] = [];
    {
      collegeMatches = allCandidates
        .filter(u => u.college === currentUser.college)
        .sort((a, b) => profileScore(b) - profileScore(a) || ((b.updated_at?.getTime?.() ?? 0) - (a.updated_at?.getTime?.() ?? 0)))
        .slice(0, 10);
    }

    // Debug logging
    console.log('collegeMatches:', collegeMatches.length);

    // 5. Intent Highlights (group by intent tags, top 3 per tag, dedup within tag)
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

    // Debug logging
    console.log('intentHighlights:', Object.values(intentHighlights).reduce((acc, arr) => acc + arr.length, 0));

    // 6. Smart Filter (for now, just random from remaining)
    let smartFilter: any[] = [];
    {
      smartFilter = allCandidates.filter(u => !dedupSet.has(u.id)).sort(() => Math.random() - 0.5).slice(0, 10);
      smartFilter.forEach(u => dedupSet.add(u.id));
    }

    // Debug logging
    console.log('smartFilter:', smartFilter.length);

    // --- Store in ExploreQueue ---
    let rank = 0;
    // Deduplicate non-college sections globally
    const nonCollegeQueueData = [
      ...perfectMatches.map(u => ({
        id: (globalThis.crypto ?? crypto).randomUUID(),
        userId,
        recommendedUserId: u.id,
        recommendationType: 'PERFECT_MATCH' as any,
        score: Math.round(((u.similarity ?? 1) * 100)),
        rank: rank++,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      ...hotMatches.map(u => ({
        id: (globalThis.crypto ?? crypto).randomUUID(),
        userId,
        recommendedUserId: u.id,
        recommendationType: 'HOT_MATCH' as any,
        score: Math.round(((u.profileScore ?? 1) * 20)),
        rank: rank++,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      ...recommendedMatches.map(u => ({
        id: (globalThis.crypto ?? crypto).randomUUID(),
        userId,
        recommendedUserId: u.id,
        recommendationType: 'RECOMMENDED' as any,
        score: Math.round(((u.matchScore ?? 1) * 100)),
        rank: rank++,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      // Intent highlights: flatten by tag
      ...Object.entries(intentHighlights).flatMap(([tag, users]) => users.map(u => ({
        id: (globalThis.crypto ?? crypto).randomUUID(),
        userId,
        recommendedUserId: u.id,
        recommendationType: 'INTENT_HIGHLIGHT' as any,
        score: 100, // or some intent-based score
        rank: rank++,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))),
      ...smartFilter.map(u => ({
        id: (globalThis.crypto ?? crypto).randomUUID(),
        userId,
        recommendedUserId: u.id,
        recommendationType: 'SMART_FILTER' as any,
        score: 100,
        rank: rank++,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    ];
    // Deduplicate non-college sections globally
    const seen = new Set();
    const dedupedNonCollegeQueueData = nonCollegeQueueData.filter(item => {
      const key = item.recommendedUserId;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    // College matches: deduplicate only within themselves
    const seenCollege = new Set();
    const dedupedCollegeQueueData = collegeMatches.map(u => ({
      id: (globalThis.crypto ?? crypto).randomUUID(),
      userId,
      recommendedUserId: u.id,
      recommendationType: 'COLLEGE_TOP' as any,
      score: Math.round(((profileScore(u) ?? 1) * 20)),
      rank: rank++,
      createdAt: new Date(),
      updatedAt: new Date(),
    })).filter(item => {
      if (seenCollege.has(item.recommendedUserId)) return false;
      seenCollege.add(item.recommendedUserId);
      return true;
    });
    // Combine all
    const queueData = [
      ...dedupedNonCollegeQueueData,
      ...dedupedCollegeQueueData,
    ];

    // Debug logging
    console.log('dedupSet size:', dedupSet.size);
    console.log('queueData:', queueData.length);

    if (queueData.length > 0) {
      await prisma.exploreQueue.createMany({ data: queueData, skipDuplicates: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in Explore queue generate:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 