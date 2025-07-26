import { AzureOpenAIEmbeddings } from "@langchain/azure-openai";
import { prisma } from './prisma';

const embeddings = new AzureOpenAIEmbeddings({
  azureOpenAIApiKey: process.env.OPENAI_AZURE_API_KEY,
  azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
  azureOpenAIApiDeploymentName: "text-embedding-3-small",
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const embedding: number[] = await embeddings.embedQuery(text);
    return embedding;
  } catch (error) {
    throw error;
  }
}

export async function findSimilarFriends(
  query: string,
  limit: number = 5
): Promise<any[]> {
  if (!query) {
    console.warn('findSimilarFriends called with missing query');
    return [];
  }
  try {
    // Generate embedding for the query
    const embedding = await generateEmbedding(query);
    if (!embedding) {
      console.warn('No embedding generated for query');
      return [];
    }

    // Run the vector similarity query, passing the embedding as a parameter
    const results = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.full_name,
        u.avatar_url,
        u.college,
        u.department,
        u.academic_year,
        u.interests,
        u.tech_skills,
        u.creative_skills,
        u.sports_skills,
        u.leadership_skills,
        u.other_skills,
        u.looking_for,
        u.personality_tags,
        u.about,
        u.place,
        u.github,
        u.linkedin,
        u.twitter,
        u.personal_website,
        u.instagram,
        u.behance,
        u.created_at,
        1 - (u.embedding <=> ${embedding}::vector) as similarity
      FROM users u
      WHERE u.embedding IS NOT NULL
      ORDER BY similarity DESC
      LIMIT ${limit}
    `;
    return results as any[];
  } catch (error) {
    console.error('Error in findSimilarFriends:', error);
    return [] as any[];
  }
} 