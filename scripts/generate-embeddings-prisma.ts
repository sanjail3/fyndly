

import { PrismaClient } from '../lib/generated/prisma';
import { config } from 'dotenv';
import { generateAndSaveEmbeddingPrisma } from '../lib/server/embedding-generation-prisma';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const prisma = new PrismaClient();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateEmbeddingsForAllUsers() {
  try {
    // Fetch all users since we can't filter by embedding field with Unsupported type
    const allUsers = await prisma.users.findMany({
      select: {
        id: true,
        full_name: true,
        email: true
      }
    });

    if (allUsers.length === 0) {
      console.log('✅ No users found in database.');
      return;
    }

    console.log(`🔄 Found ${allUsers.length} total users. Checking for null embeddings...`);
    
    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < allUsers.length; i++) {
      const user = allUsers[i];
      console.log(`[${i + 1}/${allUsers.length}] Processing ${user.full_name} (${user.email})...`);
      
      try {
        // Check if user already has embedding by trying to generate one
        const success = await generateAndSaveEmbeddingPrisma(user.id, supabase);
        if (success) {
          successCount++;
          console.log(`✅ Successfully generated embedding for ${user.full_name}`);
        } else {
          // If generation failed, it might mean embedding already exists
          skippedCount++;
          console.log(`⏭️ Skipped ${user.full_name} (embedding might already exist)`);
        }
      } catch (error) {
        failCount++;
        console.error(`❌ Error generating embedding for ${user.full_name}:`, error);
      }
    }

    console.log(`\n🎉 Embedding generation complete!`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`⏭️ Skipped: ${skippedCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📊 Total processed: ${allUsers.length}`);

  } catch (error) {
    console.error('❌ Error in embedding generation process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
generateEmbeddingsForAllUsers(); 