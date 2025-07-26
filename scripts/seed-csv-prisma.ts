
import { PrismaClient } from '../lib/generated/prisma';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore: If you get a module not found error, run: npm install papaparse
import Papa from 'papaparse';

config({ path: '.env.local' });

const prisma = new PrismaClient();

// Helper to parse array fields from stringified JSON
function parseArrayField(val: string | undefined): string[] {
  if (!val || val === '[]') return [];
  try {
    // Handles both '["A","B"]' and '[]'
    return JSON.parse(val);
  } catch {
    return [];
  }
}

// Helper to parse integer fields
function parseIntField(val: string | undefined): number | null {
  if (!val || val.trim() === '') return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

// Helper to parse embedding
function parseEmbedding(val: string | undefined): any {
  if (!val || val === '[]') return null;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

// Helper to parse date fields
function parseDateField(val: string | undefined): Date | null {
  if (!val || val.trim() === '') return null;
  try {
    // Handle PostgreSQL timestamp format: "2025-06-21 14:23:01.248754+00"
    return new Date(val);
  } catch {
    return null;
  }
}

const seedCsv = async () => {
  try {
    const csvFile = path.join(process.cwd(), 'users_rows.csv');
    const csvData = fs.readFileSync(csvFile, 'utf8');

    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: Papa.ParseResult<any>) => {
        console.log(`Found ${results.data.length} rows to process`);
        
        for (let i = 0; i < results.data.length; i++) {
          const row = results.data[i];
          
          try {
            // Parse embedding
            const embedding = parseEmbedding(row.embedding);
            
            // Parse all array fields
            const arrayFields = [
              'interests',
              'tech_skills',
              'creative_skills',
              'sports_skills',
              'leadership_skills',
              'other_skills',
              'looking_for',
              'personality_tags',
              'book_interests',
              'movie_interests',
              'podcast_interests',
              'tv_show_interests',
              'brand_interests',
              'favorite_books',
              'favorite_movies',
              'favorite_podcasts',
              'favorite_tv_shows',
              'favorite_brands'
            ];
            
            for (const field of arrayFields) {
              row[field] = parseArrayField(row[field]);
            }
            
            // Parse integer fields
            const intFields = [
              'academic_year',
              'pass_out_year',
              'avatar_regeneration_count'
            ];
            
            for (const field of intFields) {
              row[field] = parseIntField(row[field]);
            }
            
            // Parse float fields
            if (row.min_popularity_threshold) {
              row.min_popularity_threshold = parseFloat(row.min_popularity_threshold);
            }
            
            // Parse JSON fields
            if (row.recommendation_preferences) {
              try {
                row.recommendation_preferences = JSON.parse(row.recommendation_preferences);
              } catch {
                row.recommendation_preferences = {};
              }
            }
            
            // Apply default values for cross-domain recommendation fields if they're missing or null
            const defaultValues = {
              book_interests: ["fiction", "non-fiction"],
              movie_interests: ["drama", "comedy"],
              podcast_interests: ["news", "technology"],
              tv_show_interests: ["drama", "comedy"],
              brand_interests: ["technology", "lifestyle"],
              favorite_books: ["The Alchemist", "1984", "To Kill a Mockingbird"],
              favorite_movies: ["The Shawshank Redemption", "The Godfather", "Pulp Fiction"],
              favorite_podcasts: ["This American Life", "Radiolab", "Serial"],
              favorite_tv_shows: ["Breaking Bad", "Friends", "The Office"],
              favorite_brands: ["Apple", "Nike", "Spotify"],
              content_rating_preference: "PG-13",
              min_popularity_threshold: 0.3,
              age_group: "25_to_29",
              recommendation_preferences: {
                prefer_recent_content: true,
                include_explicit_content: false,
                max_recommendations_per_domain: 10
              }
            };
            
            // Apply defaults for missing or empty fields
            for (const [field, defaultValue] of Object.entries(defaultValues)) {
              if (!row[field] || (Array.isArray(row[field]) && row[field].length === 0)) {
                row[field] = defaultValue;
              }
            }
            
            // Parse date fields
            const dateFields = ['created_at', 'updated_at'];
            for (const field of dateFields) {
              row[field] = parseDateField(row[field]);
            }
            
            // Remove embedding and date fields from row data since they're handled separately
            const { embedding: _, created_at: __, updated_at: ___, ...userData } = row;
            
            // Upsert user data
            const user = await prisma.users.upsert({
              where: { id: row.id },
              update: { ...userData },
              create: { ...userData }
            });
            
            console.log(`✅ Upserted: ${row.email} (${i + 1}/${results.data.length})`);
            
          } catch (error) {
            console.error(`❌ Error processing ${row.email}:`, error);
          }
        }
        
        console.log('🎉 Seeding complete!');
        await prisma.$disconnect();
      }
    });
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

seedCsv(); 