

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { generateAndSaveEmbedding } from '../lib/server/embedding-generation';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data: users, error } = await supabase
    .from('users')
    .select('id')
    .is('embedding', null);

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  if (!users || users.length === 0) {
    console.log('No users found with null embedding.');
    return;
  }

  console.log(`Generating embeddings for ${users.length} users...`);
  let successCount = 0;
  let failCount = 0;
  for (const user of users) {
    const ok = await generateAndSaveEmbedding(user.id, supabase);
    if (ok) successCount++;
    else failCount++;
  }
  console.log(`Done. Success: ${successCount}, Failed: ${failCount}`);
}

main(); 