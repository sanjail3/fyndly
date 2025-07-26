import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { maleFirstNames, femaleFirstNames, lastNames, departments, interests, techSkills, creativeSkills, sportsSkills, leadershipSkills, otherSkills, aboutTemplates, achievementTemplates, socialLinks, availability, funTags } from './data-pools';
import { generateAndUploadAvatar } from '../lib/server/avatar-generation';
import { generateAndSaveEmbedding } from '../lib/server/embedding-generation';
// @ts-ignore: If you get a module not found error, run: npm install papaparse
import Papa from 'papaparse';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or Service Role Key is not defined in .env.local');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomItems = <T>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const TN_CITIES = [
  "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", 
  "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Dindigul"
];

interface College {
  college_name: string;
  state: string;
}

const loadTamilNaduColleges = (): string[] => {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'indian_college_data.csv');
    const csvText = fs.readFileSync(csvPath, 'utf-8');

    const lines = csvText.trim().split('\n');
    if (lines.length <= 1) {
      throw new Error('CSV file is empty or has only a header.');
    }

    const collegeData: College[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const matches = line.match(/(?:^|,)("(?:[^"]+)*"|[^,]*)/g);
      
      if (matches && matches.length >= 2) {
        const collegeName = matches[0].replace(/^,?"?|"?$/g, '').trim();
        const state = matches[1].replace(/^,?"?|"?$/g, '').trim();
        
        if (collegeName && state && collegeName !== 'College_Name') {
          collegeData.push({ college_name: collegeName, state: state });
        }
      }
    }

    const tamilNaduColleges = collegeData
      .filter(c => c.state.toLowerCase() === 'tamil nadu')
      .map(c => c.college_name);
    
    if (tamilNaduColleges.length > 0) {
      return tamilNaduColleges;
    }
  } catch (error) {
    console.error("Could not read or parse college CSV file:", error);
  }
  
  console.warn("Warning: Could not load colleges from CSV for Tamil Nadu. Using a default list.");
  return [
    "Indian Institute of Technology Madras (IITM)",
    "National Institute of Technology, Tiruchirappalli (NITT)",
    "Vellore Institute of Technology (VIT)",
    "Anna University, Chennai",
    "PSG College of Technology, Coimbatore",
    "Coimbatore Institute of Technology (CIT)",
    "Thiagarajar College of Engineering, Madurai",
    "SSN College of Engineering, Chennai",
    "Madras Institute of Technology, Chennai",
    "Government College of Technology, Coimbatore"
  ];
};

const generateRandomUser = async (index: number, collegeList: string[]) => {
  const gender = Math.random() > 0.5 ? 'male' : 'female';
  const firstName = gender === 'male' ? getRandomItem(maleFirstNames) : getRandomItem(femaleFirstNames);
  const lastName = getRandomItem(lastNames);
  const fullName = `${firstName} ${lastName}`;
  const email = `testuser${Date.now()}${index}@fyndly.com`;
  const password = "password123";

  console.log(`[${index}] Creating user: ${fullName} (${email})`);

  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (authError || !authData.user) {
    throw new Error(`[${index}] Failed to create auth user: ${authError?.message}`);
  }
  const userId = authData.user.id;
  console.log(`[${index}] Auth user created with ID: ${userId}`);

  // 2. Generate Avatar
  console.log(`[${index}] Generating avatar...`);
  const avatarUrl = await generateAndUploadAvatar(userId, fullName, gender);
  console.log(`[${index}] Avatar generated: ${avatarUrl}`);

  // 3. Assemble User Profile
  const passOutYear = (new Date().getFullYear() + Math.floor(Math.random() * 4) + 1).toString();

  const userProfile = {
    id: userId,
    email: email,
    full_name: fullName,
    college: getRandomItem(collegeList),
    department: getRandomItem(departments),
    academic_year: 4 - (parseInt(passOutYear) - new Date().getFullYear() -1),
    pass_out_year: parseInt(passOutYear),
    gender: gender,
    place: getRandomItem(TN_CITIES),
    state: "Tamil Nadu",
    avatar_url: avatarUrl,
    about: getRandomItem(aboutTemplates),
    interests: getRandomItems(interests, 5),
    tech_skills: getRandomItems(techSkills, 4),
    creative_skills: getRandomItems(creativeSkills, 3),
    sports_skills: getRandomItems(sportsSkills, 2),
    leadership_skills: getRandomItems(leadershipSkills, 2),
    other_skills: getRandomItems(otherSkills, 1),
    github: socialLinks.github,
    linkedin: socialLinks.linkedin,
    twitter: socialLinks.twitter,
    weekly_availability: getRandomItem(availability.weeklyHours),
    time_commitment: getRandomItem(availability.timeCommitment),
    looking_for: getRandomItems(availability.lookingFor, 2),
    meeting_preference: getRandomItem(availability.preferredMeeting),
    personality_tags: getRandomItems(funTags, 3),
  };

  // 4. Insert User Profile
  console.log(`[${index}] Inserting user profile into database...`);
  const { error: insertError } = await supabaseAdmin.from('users').insert(userProfile);
  if (insertError) {
    throw new Error(`[${index}] Failed to insert user profile: ${insertError.message}`);
  }
  
  // 5. Insert Achievements
  const achievement = { ...getRandomItem(achievementTemplates), user_id: userId };
  await supabaseAdmin.from('achievements').insert(achievement);
  console.log(`[${index}] User profile and achievement inserted.`);
  
  // 6. Generate and Save Embedding
  console.log(`[${index}] Generating embedding...`);
  await generateAndSaveEmbedding(userId, supabaseAdmin);

  console.log(`[${index}] ✅ Successfully created user: ${fullName}`);
};

const seed = async () => {
  const userCount = 30; // Or get from process.argv
  const collegeList = loadTamilNaduColleges();
  console.log(`--- Starting to seed ${userCount} users using ${collegeList.length} colleges... ---`);

  for (let i = 0; i < userCount; i++) {
    try {
      await generateRandomUser(i + 1, collegeList);
    } catch (error) {
      console.error(`--- ❌ Failed to create user ${i + 1} ---`);
      console.error(error);
    }
  }

  console.log(`--- ✅ Seeding complete! ---`);
};

const csvFile = path.join(__dirname, '../users_rows.csv');
const csvData = fs.readFileSync(csvFile, 'utf8');

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

      // Insert into Supabase
      const { error } = await supabaseAdmin
        .from('users')
        .insert([{ ...row, embedding }]);
      if (error) {
        console.error('Insert error:', error, row.email);
      }
    }
    console.log('Seeding complete!');
  }
});

seed().catch(console.error); 