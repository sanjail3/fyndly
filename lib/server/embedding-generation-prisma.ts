import { PrismaClient } from '../../lib/generated/prisma';
import { SupabaseClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

function generateEmbeddingText(user: any): string {
  const fields = [
    ...(user.interests ?? []),
    ...(user.tech_skills ?? []),
    ...(user.creative_skills ?? []),
    ...(user.sports_skills ?? []),
    ...(user.leadership_skills ?? []),
    ...(user.other_skills ?? []),
    user.about ?? "",
    ...(user.personality_tags ?? []),
    ...(user.looking_for ?? []),
    user.department ?? "",
    user.college ?? "",
    user.place ?? "",
    // Add cross-domain recommendation fields
    ...(user.book_interests ?? []),
    ...(user.movie_interests ?? []),
    ...(user.podcast_interests ?? []),
    ...(user.tv_show_interests ?? []),
    ...(user.brand_interests ?? []),
    ...(user.favorite_books ?? []),
    ...(user.favorite_movies ?? []),
    ...(user.favorite_podcasts ?? []),
    ...(user.favorite_tv_shows ?? []),
    ...(user.favorite_brands ?? [])
  ].filter(Boolean);

  return fields.join(" ");
}

async function getEmbeddingVector(text: string): Promise<number[]> {
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const azureApiKey = process.env.AZURE_OPENAI_API_KEY;

    if (!azureEndpoint || !azureApiKey) {
        throw new Error('Missing Azure OpenAI credentials for embeddings.');
    }

    const apiUrl = `${azureEndpoint}/openai/deployments/text-embedding-3-small/embeddings?api-version=2024-02-01`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': azureApiKey },
        body: JSON.stringify({ input: text, model: 'text-embedding-3-small' }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure OpenAI Embeddings API error: ${response.status} ${errorText}`);
    }

    const azureData = await response.json();
    if (!azureData.data || !azureData.data[0] || !azureData.data[0].embedding) {
        throw new Error('Invalid embedding data structure from Azure OpenAI.');
    }

    return azureData.data[0].embedding;
}

export async function generateAndSaveEmbeddingPrisma(userId: string, supabase: SupabaseClient): Promise<boolean> {
  try {
    // Fetch user data using Prisma
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        full_name: true,
        about: true,
        interests: true,
        tech_skills: true,
        creative_skills: true,
        sports_skills: true,
        leadership_skills: true,
        other_skills: true,
        personality_tags: true,
        looking_for: true,
        department: true,
        college: true,
        place: true,
        book_interests: true,
        movie_interests: true,
        podcast_interests: true,
        tv_show_interests: true,
        brand_interests: true,
        favorite_books: true,
        favorite_movies: true,
        favorite_podcasts: true,
        favorite_tv_shows: true,
        favorite_brands: true
      }
    });

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const embeddingText = generateEmbeddingText(user);
    if (embeddingText.trim() === '') {
        console.warn(`Skipping embedding for user ${userId} due to empty profile.`);
        return true;
    }

    const embeddingVector = await getEmbeddingVector(embeddingText);

    // Update embedding using Supabase (since Prisma doesn't handle Unsupported types well)
    const { error: updateError } = await supabase
      .from('users')
      .update({ embedding: embeddingVector })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to save embedding for user ${userId}: ${updateError.message}`);
    }
    
    console.log(`Successfully generated and saved embedding for user ${user.full_name} (${userId}).`);
    return true;

  } catch (error) {
    console.error(`Error in embedding generation for user ${userId}:`, error);
    return false;
  }
} 