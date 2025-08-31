const mongoose = require('mongoose');
const Directory = require('../models/directoryModel');
require('dotenv').config();

// Create a system user ID for migration
const SYSTEM_USER_ID = new mongoose.Types.ObjectId();

// Hardcoded directories from frontend
const hardcodedDirectories = [
  { name: 'Blahoo', url: 'https://www.blahoo.net/', description: 'Web directory', difficulty: 'easy' },
  { name: 'Caida', url: 'https://caida.eu/submit.php', description: 'European directory', difficulty: 'easy' },
  { name: 'Pink Linker', url: 'http://www.pinklinker.com/', description: 'Directory submission', difficulty: 'easy' },
  { name: 'Grey Linker', url: 'http://www.greylinker.com/', description: 'Directory listing', difficulty: 'easy' },
  { name: 'SEO Deep Links', url: 'https://www.seodeeplinks.net/', description: 'SEO directory', difficulty: 'medium' },
  { name: 'SEO Range', url: 'https://www.seorange.com/', description: 'SEO directory', difficulty: 'medium' },
  { name: 'Leading Link Directory', url: 'https://www.leadinglinkdirectory.com/', description: 'Link directory', difficulty: 'medium' },
  { name: 'Red Linker', url: 'http://www.redlinker.com/', description: 'Directory submission', difficulty: 'easy' },
  { name: 'Webo World', url: 'https://www.weboworld.com/', description: 'Web directory', difficulty: 'easy' },
  { name: 'Yellow Linker', url: 'http://www.yellowlinker.com/', description: 'Directory listing', difficulty: 'easy' },
  { name: 'Link Dir 4U', url: 'http://www.linkdir4u.com/', description: 'Link directory', difficulty: 'easy' },
  { name: 'World Web Directory', url: 'https://worldweb-directory.com/', description: 'Global web directory', difficulty: 'easy' },
  { name: 'WLD Directory', url: 'http://www.wlddirectory.com/', description: 'Web directory', difficulty: 'easy' },
  { name: 'Taurus Directory', url: 'http://www.taurusdirectory.com/', description: 'Directory submission', difficulty: 'easy' },
  { name: 'Canopus Directory', url: 'http://www.canopusdirectory.com/', description: 'Directory submission', difficulty: 'easy' },
  { name: 'Vie Search', url: 'https://viesearch.com/', description: 'Search directory', difficulty: 'easy' },
  { name: 'Pro Link Directory', url: 'https://www.prolinkdirectory.com/', description: 'Professional directory', difficulty: 'medium' },
  { name: '01 Web Directory', url: 'https://www.01webdirectory.com/', description: 'Web directory', difficulty: 'easy' },
  { name: 'Directory Free', url: 'https://www.directory-free.com/', description: 'Free directory', difficulty: 'easy' },
  { name: 'Targets Views', url: 'http://www.targetsviews.com/', description: 'Directory listing', difficulty: 'easy' },
  { name: 'More Funz', url: 'https://morefunz.com/', description: 'Fun directory', difficulty: 'easy' },
  { name: 'DR Test', url: 'http://www.drtest.net/', description: 'Directory submission', difficulty: 'easy' },
  { name: 'SEO Web Dir', url: 'https://www.seowebdir.net/', description: 'SEO directory', difficulty: 'medium' },
  { name: 'PR8 Directory', url: 'https://www.pr8directory.com/', description: 'High PR directory', difficulty: 'medium' },
  { name: 'Ellys Directory', url: 'https://ellysdirectory.com/', description: 'Directory listing', difficulty: 'easy' },
  { name: 'Five Stars Auto Pawn', url: 'http://www.fivestarsautopawn.com/', description: 'Local directory', difficulty: 'easy' },
  { name: 'Favicon Style', url: 'https://faviconstyle.com/', description: 'Web directory', difficulty: 'easy' },
  { name: 'Idaho Index', url: 'http://www.idahoindex.com/', description: 'Local directory', difficulty: 'easy' },
  { name: 'Call Your Country', url: 'https://www.callyourcountry.com/', description: 'Country directory', difficulty: 'easy' },
  { name: 'Zopso', url: 'https://www.zopso.com/', description: 'General Q&A platform', difficulty: 'easy' }
];

async function migrateDirectories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if directories already exist
    const existingCount = await Directory.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️ Found ${existingCount} existing directories. Skipping migration.`);
      return;
    }

    // Convert hardcoded directories to database format
    const directoriesToInsert = hardcodedDirectories.map(dir => {
      const domain = new URL(dir.url).hostname;
      const pageRank = dir.difficulty === 'hard' ? 7 : dir.difficulty === 'medium' ? 4 : 2;
      const daScore = dir.difficulty === 'hard' ? 70 : dir.difficulty === 'medium' ? 50 : 30;
      
      return {
        name: dir.name,
        domain: domain,
        description: dir.description,
        category: 'business',
        country: 'Global',
        classification: 'Business',
        pageRank: pageRank,
        daScore: daScore,
        spamScore: 2,
        isPremium: false,
        requiresApproval: true,
        submissionUrl: dir.url,
        contactEmail: `admin@${domain}`,
        submissionGuidelines: 'Please provide accurate business information',
        requiredFields: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'textarea', required: true },
          { name: 'url', type: 'url', required: true }
        ],
        freeUserLimit: 0,
        starterUserLimit: 5,
        proUserLimit: 20,
        businessUserLimit: 50,
        enterpriseUserLimit: -1,
        priority: 10,
        status: 'active',
        isCustom: false,
        createdBy: SYSTEM_USER_ID // System migration
      };
    });

    // Insert directories
    const result = await Directory.insertMany(directoriesToInsert);
    console.log(`✅ Successfully migrated ${result.length} directories to database`);

    // Log some examples
    console.log('📋 Sample migrated directories:');
    result.slice(0, 5).forEach(dir => {
      console.log(`  - ${dir.name} (${dir.domain})`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration
migrateDirectories();
