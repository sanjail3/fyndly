import { SupabaseClient } from '@supabase/supabase-js';

// This function assumes the Supabase client is already initialized
// with the necessary credentials (e.g., service_role key for admin tasks).

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
    // Add favorites data for better recommendations
    ...(user.favorite_books ?? []),
    ...(user.favorite_movies ?? []),
    ...(user.favorite_podcasts ?? []),
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

export async function generateAndSaveEmbedding(userId: string, supabase: SupabaseClient): Promise<boolean> {
  try {
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (userError) {
      throw new Error(`Could not fetch user profile for embedding: ${userError.message}`);
    }

    const embeddingText = generateEmbeddingText(user);
    if (embeddingText.trim() === '') {
        console.warn(`Skipping embedding for user ${userId} due to empty profile.`);
        return true;
    }

    const embeddingVector = await getEmbeddingVector(embeddingText);

    const { error: updateError } = await supabase
      .from('users')
      .update({ embedding: embeddingVector })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to save embedding for user ${userId}: ${updateError.message}`);
    }
    
    console.log(`Successfully generated and saved embedding for user ${userId}.`);
    return true;

  } catch (error) {
    console.error(`Error in embedding generation for user ${userId}:`, error);
    return false;
  }
} 