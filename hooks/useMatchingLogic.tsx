
interface MatchedUser {
  id: string;
  full_name: string;
  college: string;
  department: string;
  academic_year: number;
  avatar_url?: string;
  interests: string[];
  tech_skills: string[];
  creative_skills: string[];
  sports_skills: string[];
  leadership_skills: string[];
  other_skills: string[];
  looking_for: string[];
  weekly_availability?: string;
  time_commitment?: string;
  about?: string;
  place?: string;
  personality_tags?: string[];
  github?: string;
  linkedin?: string;
  twitter?: string;
  personal_website?: string;
  instagram?: string;
  behance?: string;
  matchScore: number;
  isNewUser: boolean;
  similarity?: number;
}

export const useMatchingLogic = () => {
  const calculateAdditionalScore = (currentUser: any, targetUser: MatchedUser): number => {
    let score = 0;

    // Looking for overlap (40% weight)
    const currentLookingFor = currentUser.looking_for || [];
    const targetLookingFor = targetUser.looking_for || [];
    const lookingForOverlap = currentLookingFor.filter((item: string) => 
      targetLookingFor.includes(item)
    ).length;
    const lookingForScore = lookingForOverlap / Math.max(currentLookingFor.length, targetLookingFor.length, 1);
    score += lookingForScore * 0.4;

    // Interest overlap (25% weight)
    const currentInterests = currentUser.interests || [];
    const targetInterests = targetUser.interests || [];
    const interestOverlap = currentInterests.filter((interest: string) => 
      targetInterests.includes(interest)
    ).length;
    const interestScore = interestOverlap / Math.max(currentInterests.length, targetInterests.length, 1);
    score += interestScore * 0.25;

    // Skills overlap (20% weight)
    const currentSkills = [
      ...(currentUser.tech_skills || []),
      ...(currentUser.creative_skills || []),
      ...(currentUser.sports_skills || []),
      ...(currentUser.leadership_skills || [])
    ];
    const targetSkills = [
      ...(targetUser.tech_skills || []),
      ...(targetUser.creative_skills || []),
      ...(targetUser.sports_skills || []),
      ...(targetUser.leadership_skills || [])
    ];
    const skillOverlap = currentSkills.filter(skill => targetSkills.includes(skill)).length;
    const skillScore = skillOverlap / Math.max(currentSkills.length, targetSkills.length, 1);
    score += skillScore * 0.2;

    // College affinity (10% weight)
    const collegeScore = currentUser.college === targetUser.college ? 1 : 
                        currentUser.place === targetUser.place ? 0.5 : 0;
    score += collegeScore * 0.1;

    // Academic year proximity (5% weight)
    const yearDiff = Math.abs(currentUser.academic_year - targetUser.academic_year);
    const yearScore = Math.max(0, 1 - (yearDiff * 0.2));
    score += yearScore * 0.05;

    return Math.round(score * 100);
  };

  const categorizeUsers = (users: MatchedUser[], currentUser: any) => {
    const fallbackRandom = (userList: MatchedUser[], n: number) =>
      userList.slice().sort(() => 0.5 - Math.random()).slice(0, n);

    // Calculate combined scores (using matchScore that includes similarity + additional factors)
    const scoredUsers = users.map(user => ({
      ...user,
      matchScore: Math.round(
        ((user.similarity || 0.5) * 60) + // 60% similarity score
        (calculateAdditionalScore(currentUser, user) * 0.4) // 40% additional factors
      ),
      isNewUser: user.isNewUser !== undefined ? user.isNewUser : false
    }));

    // Sort by combined score
    scoredUsers.sort((a, b) => b.matchScore - a.matchScore);

    let perfectMatches = scoredUsers.filter(u => u.matchScore >= 70).slice(0, 10);
    if (perfectMatches.length < 10) {
      const others = scoredUsers.filter(u => !perfectMatches.includes(u));
      perfectMatches = [...perfectMatches, ...fallbackRandom(others, 10 - perfectMatches.length)];
    }

    let hotMatches = scoredUsers.filter(user => user.isNewUser || user.matchScore > 60).slice(0, 8);
    if (hotMatches.length < 8) {
      const pool = scoredUsers.filter(u => !hotMatches.includes(u));
      hotMatches = [...hotMatches, ...fallbackRandom(pool, 8 - hotMatches.length)];
    }

    let collegeMatches = scoredUsers.filter(user => user.college === currentUser.college).slice(0, 8);
    if (collegeMatches.length < 8) {
      const others = scoredUsers.filter(u => !collegeMatches.includes(u));
      collegeMatches = [...collegeMatches, ...fallbackRandom(others, 8 - collegeMatches.length)];
    }

    let nearbyMatches = scoredUsers.filter(
      user => user.college !== currentUser.college && user.place === currentUser.place,
    ).slice(0, 8);
    if (nearbyMatches.length < 8) {
      const pool = scoredUsers.filter(u => !nearbyMatches.includes(u));
      nearbyMatches = [...nearbyMatches, ...fallbackRandom(pool, 8 - nearbyMatches.length)];
    }

    let recommendedMatches = scoredUsers.filter(user => user.matchScore > 40 && user.matchScore < 80).slice(0, 8);
    if (recommendedMatches.length < 8) {
      const others = scoredUsers.filter(u => !recommendedMatches.includes(u));
      recommendedMatches = [...recommendedMatches, ...fallbackRandom(others, 8 - recommendedMatches.length)];
    }

    // Intent-based matches
    const intentCategories = [
      'Hackathon Partner', 'Co-Founder', 'Startup Team', 'Study Buddy', 'Mentor/Mentee'
    ];
    const intentMatches: Record<string, MatchedUser[]> = {};
    intentCategories.forEach(intent => {
      let byIntent = scoredUsers
        .filter(user => user.looking_for && user.looking_for.includes && user.looking_for.includes(intent))
        .slice(0, 6);
      if (byIntent.length < 6) {
        const extra = scoredUsers.filter(u => !byIntent.includes(u));
        byIntent = [...byIntent, ...fallbackRandom(extra, 6 - byIntent.length)];
      }
      intentMatches[intent] = byIntent;
    });

    return {
      perfectMatches,
      hotMatches,
      collegeMatches,
      nearbyMatches,
      recommendedMatches,
      intentMatches
    };
  };

  return { categorizeUsers };
};
