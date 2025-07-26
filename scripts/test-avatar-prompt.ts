// scripts/test-avatar-prompt.ts
import { generateDallePrompt } from '../lib/server/avatar-generation';

async function test() {
  const names = ['Sanjai', 'Priya', 'Amit'];
  const genders: ('boy' | 'girl')[] = ['boy', 'girl'];

  for (const name of names) {
    for (const gender of genders) {
      try {
        const prompt = await generateDallePrompt(name, gender);
        console.log(`Prompt for ${name} (${gender}):\n${prompt}\n`);
      } catch (err) {
        console.error(`Error for ${name} (${gender}):`, err);
      }
    }
  }
}

test();