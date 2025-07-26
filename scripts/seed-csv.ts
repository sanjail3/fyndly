// seed-csv.ts
// Usage: npx ts-node scripts/seed-csv.ts
// This script reads users_rows.csv and inserts each row into the Supabase 'users' table.

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore: If you get a module not found error, run: npm install papaparse
import Papa from 'papaparse';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or Service Role Key is not defined in .env.local');
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const csvFile = path.join(process.cwd(), 'users_rows.csv');
const csvData = fs.readFileSync(csvFile, 'utf8');

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

Papa.parse(csvData, {
  header: true,
  skipEmptyLines: true,
  complete: async (results: Papa.ParseResult<any>) => {
    for (const row of results.data) {
      // Parse embedding as array
      let embedding = null;
      try {
        embedding = row.embedding ? JSON.parse(row.embedding) : null;
      } catch (e) {
        embedding = null;
      }
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
      ];
      for (const field of arrayFields) {
        row[field] = parseArrayField(row[field]);
      }
      // Parse integer fields
      const intFields = [
        'academic_year',
        'pass_out_year',
        'avatar_regeneration_count',
      ];
      for (const field of intFields) {
        row[field] = parseIntField(row[field]);
      }
      // Upsert into Supabase (insert or update on conflict id)
      const { error, data } = await supabase
        .from('users')
        .upsert([{ ...row, embedding }], { onConflict: 'id' });
      if (error) {
        console.error('Upsert error:', error, row.email);
      } else {
        console.log(`Upserted: ${row.email}`);
      }
    }
    console.log('Seeding complete.');
  },
}); 