import { NextResponse } from 'next/server';
import { createStreamingResponse } from '@/lib/openai';
import { findSimilarFriends } from '@/lib/simialrity-search';
import { prisma } from '@/lib/prisma';


export async function POST(request: Request) {
  try {
    const { messages, userId, functionCall } = await request.json();

    const lastMessage = messages[messages.length - 1];

    // Validate and format messages
    const validatedMessages = messages.map((msg: any) => {
      const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
      return {
        role: msg.role || (msg.type === 'user' ? 'user' : 'assistant'),
        content: content,
      };
    });

   
    const functions = [
      {
        name: 'findFriends',
        description: 'Find similar friends based on user profile and preferences',
        parameters: {
          type: 'object',
          properties: {
            college: { type: 'string', description: 'College of the user' },
            department: { type: 'string', description: 'Department of the user' },
            academic_year: { type: 'string', description: 'Academic year of the user' },
            interests: { type: 'array', items: { type: 'string' }, description: 'Interests of the user' },
            tech_skills: { type: 'array', items: { type: 'string' }, description: 'Technical skills' },
            creative_skills: { type: 'array', items: { type: 'string' }, description: 'Creative skills' },
            sports_skills: { type: 'array', items: { type: 'string' }, description: 'Sports skills' },
            leadership_skills: { type: 'array', items: { type: 'string' }, description: 'Leadership skills' },
            other_skills: { type: 'array', items: { type: 'string' }, description: 'Other skills' },
            personality_tags: { type: 'array', items: { type: 'string' }, description: 'Personality tags' },
            limit: { type: 'integer', description: 'Number of friends to return (default: 5, max: 20)' },
          },
          required: [],
        },
      },
      {
        name: 'recommendBooks',
        description: 'Get book recommendations based on user interests and demographics',
        parameters: {
          type: 'object',
          properties: {
            genres: { type: 'array', items: { type: 'string' }, description: 'Book genres of interest' },
            age_group: { type: 'string', description: 'User age group' },
            gender: { type: 'string', description: 'User gender' },
            limit: { type: 'integer', description: 'Number of recommendations to return (default: 5, max: 20)' },
          },
          required: [],
        },
      },
      {
        name: 'recommendMovies',
        description: 'Get movie recommendations based on user interests and demographics',
        parameters: {
          type: 'object',
          properties: {
            genres: { type: 'array', items: { type: 'string' }, description: 'Movie genres of interest' },
            age_group: { type: 'string', description: 'User age group' },
            gender: { type: 'string', description: 'User gender' },
            limit: { type: 'integer', description: 'Number of recommendations to return (default: 5, max: 20)' },
          },
          required: [],
        },
      },
      {
        name: 'recommendPodcasts',
        description: 'Get podcast recommendations based on user interests and demographics',
        parameters: {
          type: 'object',
          properties: {
            genres: { type: 'array', items: { type: 'string' }, description: 'Podcast genres of interest' },
            age_group: { type: 'string', description: 'User age group' },
            gender: { type: 'string', description: 'User gender' },
            limit: { type: 'integer', description: 'Number of recommendations to return (default: 5, max: 20)' },
          },
          required: [],
        },
      },
      {
        name: 'recommendTVShows',
        description: 'Get TV show recommendations based on user interests and demographics',
        parameters: {
          type: 'object',
          properties: {
            genres: { type: 'array', items: { type: 'string' }, description: 'TV show genres of interest' },
            age_group: { type: 'string', description: 'User age group' },
            gender: { type: 'string', description: 'User gender' },
            limit: { type: 'integer', description: 'Number of recommendations to return (default: 5, max: 20)' },
          },
          required: [],
        },
      },
    ];

   
    const systemMessage = {
      role: 'system',
      content: `You are Fyndly, an AI friend matchmaker helping students discover similar friends on campus. 
      Analyze the user's profile and preferences and use the findFriends function to recommend relevant friends.
      
      When using the findFriends function:
      1. Use the user's college, department, academic year, interests, and skills to find the best matches.
      2. Be precise with department and year matching if specified.
      3. If the user specifies how many friends they want, use that number as the limit.
      4. Always provide thoughtful analysis and personalized recommendations based on the user's unique profile.
      5. Briefly explain why each recommended friend might be a good match (e.g., shared interests, same department, etc).
      
      The function supports these parameters:
      - college: Optional. Use if the user specifies a college.
      - department: Optional. Use if the user specifies a department.
      - academic_year: Optional. Use if the user specifies a year.
      - interests, skills, personality_tags: Optional. Use if the user specifies these.
      - limit: Optional. Use if the user specifies how many friends they want.
      
      Always provide a friendly, encouraging response and highlight shared interests or backgrounds.`,
    };

    const finalMessages = [systemMessage, ...validatedMessages];

   
    const response = await createStreamingResponse(finalMessages, functions, 'auto');
    return response as unknown as Response;
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}