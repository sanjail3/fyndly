import { NextResponse } from 'next/server';
import { findSimilarFriends } from '@/lib/simialrity-search';

export async function POST(request: Request) {
  try {
    const {
      functionCall = {},
    } = await request.json();

    // Destructure all possible filters from functionCall
    const {
      college,
      department,
      academic_year,
      interests,
      tech_skills,
      creative_skills,
      sports_skills,
      leadership_skills,
      other_skills,
      personality_tags,
      limit,
    } = functionCall;

    // Build a query string from the provided fields
    const queryParts = [
      college,
      department,
      academic_year ? `Year: ${academic_year}` : '',
      ...(interests || []),
      ...(tech_skills || []),
      ...(creative_skills || []),
      ...(sports_skills || []),
      ...(leadership_skills || []),
      ...(other_skills || []),
      ...(personality_tags || []),
    ];
    const queryString = queryParts.filter(Boolean).join(' ');

    // Validate: must have at least one field
    if (!queryString || queryString.trim().length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for similarity search.' }, { status: 400 });
    }

    // Call the friend similarity function with the query string
    const friends = await findSimilarFriends(
      queryString,
      limit || 5,
    );

    // Return the results
    return NextResponse.json(friends);
  } catch (error) {
    console.error('Error finding friends:', error);
    return NextResponse.json(
      { error: 'Failed to find friends' },
      { status: 500 }
    );
  }
} 