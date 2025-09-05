import fs from 'fs';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the Directory model
const Directory = (await import('../models/directoryModel.js')).default;

// Classification mapping from JSON to database enum values
const classificationMapping = {
  'Directory Platforms': 'Business',
  'Article Platforms': 'Article Submission', 
  'Press Release': 'Press Release',
  'Australia': 'Local',
  'Classified Ads': 'Classified',
  'Q&A Platforms': 'Q&A',
  'Social Media': 'Social',
  'Local Business': 'Local'
};

// Category mapping (using valid enum values)
const categoryMapping = {
  'Directory Platforms': 'business',
  'Article Platforms': 'technology',
  'Press Release': 'business',
  'Australia': 'business',
  'Classified Ads': 'business',
  'Q&A Platforms': 'education',
  'Social Media': 'entertainment',
  'Local Business': 'business'
};

async function populateRealDirectories() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Read the JSON file
    const jsonPath = join(__dirname, '../../directory_submissions_real.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const directories = JSON.parse(jsonData);
    
    console.log(`📊 Loaded ${directories.length} directories from JSON`);

    // Get system user ID (create if doesn't exist)
    let systemUserId;
    try {
      const User = (await import('../models/userModel.js')).default;
      let systemUser = await User.findOne({ email: 'system@opptym.com' });
      
      if (!systemUser) {
        systemUser = new User({
          name: 'System User',
          email: 'system@opptym.com',
          password: 'system123',
          role: 'admin',
          isEmailVerified: true
        });
        await systemUser.save();
        console.log('✅ Created system user');
      }
      
      systemUserId = systemUser._id;
    } catch (error) {
      console.log('⚠️ Using fallback system user ID');
      systemUserId = new mongoose.Types.ObjectId();
    }

    // Clear existing directories
    await Directory.deleteMany({});
    console.log('🗑️ Cleared existing directories');

    // Process and insert directories
    console.log(`🔄 Processing ${directories.length} directories...`);
    const directoryDocs = directories.map((dir, index) => {
      const dbClassification = classificationMapping[dir.classification] || 'Business';
      const category = categoryMapping[dir.classification] || 'general';
      
      // Extract domain from URL
      let domain;
      try {
        const url = new URL(dir.url);
        domain = url.hostname;
      } catch (error) {
        domain = dir.url.replace(/^https?:\/\//, '').split('/')[0];
      }

      return {
        name: `${dir.name} ${dbClassification} ${index + 1}`,
        domain: domain,
        submissionUrl: dir.url,
        description: `Real directory from SEO Khazana list - ${dir.classification}`,
        classification: dbClassification,
        category: category,
        country: 'USA',
        pageRank: Math.floor(Math.random() * 5) + 1, // Random PR 1-5
        daScore: Math.floor(Math.random() * 50) + 10, // Random DA 10-60
        spamScore: Math.floor(Math.random() * 17), // Random spam score 0-17 (max allowed)
        isActive: true,
        createdBy: systemUserId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    console.log(`✅ Processed ${directoryDocs.length} directory documents`);
    console.log(`📊 Sample classifications: ${[...new Set(directoryDocs.map(d => d.classification))].join(', ')}`);

    // Insert in batches for better performance
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < directoryDocs.length; i += batchSize) {
      const batch = directoryDocs.slice(i, i + batchSize);
      try {
        await Directory.insertMany(batch);
        inserted += batch.length;
        console.log(`📝 Inserted ${inserted}/${directoryDocs.length} directories`);
      } catch (error) {
        console.error(`❌ Error inserting batch ${i}-${i + batchSize}:`, error.message);
        // Continue with next batch
      }
    }

    // Verify counts by classification
    console.log('\n📊 Directory counts by classification:');
    const counts = await Directory.aggregate([
      { $group: { _id: '$classification', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    counts.forEach(count => {
      console.log(`  ${count._id}: ${count.count} directories`);
    });

    console.log(`\n🎉 Successfully populated ${inserted} real directories!`);
    
  } catch (error) {
    console.error('❌ Error populating directories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

populateRealDirectories();
