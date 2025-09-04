const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import the Directory model
const Directory = require('../models/directoryModel');
const User = require('../models/userModel');

// Classification mapping from JSON to database
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

// Country mapping
const countryMapping = {
  'Directory Platforms': 'Global',
  'Article Platforms': 'Global',
  'Press Release': 'Global', 
  'Australia': 'Australia',
  'Classified Ads': 'Global',
  'Q&A Platforms': 'Global',
  'Social Media': 'Global',
  'Local Business': 'Global'
};

// Category mapping (using valid enum values)
const categoryMapping = {
  'Directory Platforms': 'business',
  'Article Platforms': 'technology',
  'Press Release': 'business',
  'Australia': 'business',
  'Classified Ads': 'business',
  'Q&A Platforms': 'technology',
  'Social Media': 'technology',
  'Local Business': 'business'
};

async function populateDirectories() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Read the JSON file
    const jsonPath = path.join(__dirname, '../../directory_submissions_by_classification_500.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(jsonData);

    console.log('📁 Loaded JSON data with classifications:', Object.keys(data));

    // Get a valid user ID for createdBy field
    let systemUserId;
    try {
      const systemUser = await User.findOne({ email: 'shrivitthalp@gmail.com' });
      if (systemUser) {
        systemUserId = systemUser._id;
        console.log('👤 Using system user ID:', systemUserId);
      } else {
        // Create a system user if it doesn't exist
        const newUser = new User({
          username: 'system',
          email: 'system@opptym.com',
          password: 'system123',
          role: 'admin',
          isAdmin: true
        });
        await newUser.save();
        systemUserId = newUser._id;
        console.log('👤 Created system user with ID:', systemUserId);
      }
    } catch (error) {
      console.error('❌ Error getting system user:', error);
      return;
    }

    // Clear existing directories
    await Directory.deleteMany({});
    console.log('🗑️  Cleared existing directories');

    let totalInserted = 0;
    const bulkOps = [];

    // Process each classification
    for (const [jsonClassification, directories] of Object.entries(data)) {
      const dbClassification = classificationMapping[jsonClassification];
      const country = countryMapping[jsonClassification];
      const category = categoryMapping[jsonClassification];

      if (!dbClassification) {
        console.log(`⚠️  Skipping unknown classification: ${jsonClassification}`);
        continue;
      }

      console.log(`\n📂 Processing ${jsonClassification} (${directories.length} directories)`);
      console.log(`   → Database classification: ${dbClassification}`);
      console.log(`   → Country: ${country}`);
      console.log(`   → Category: ${category}`);

      // Process each directory in this classification
      for (let i = 0; i < directories.length; i++) {
        const dir = directories[i];
        
        // Extract domain from URL
        let domain = '';
        try {
          const url = new URL(dir.url);
          domain = url.origin;
        } catch (e) {
          domain = dir.url;
        }

        // Generate SEO metrics (random but realistic)
        const pageRank = Math.floor(Math.random() * 8) + 1; // 1-8
        const daScore = Math.floor(Math.random() * 50) + 20; // 20-70
        const spamScore = Math.floor(Math.random() * 5); // 0-4

        const directoryDoc = {
          name: dir.name,
          domain: domain,
          description: `Professional ${jsonClassification.toLowerCase()} platform for business submissions and listings`,
          category: category,
          country: country,
          classification: dbClassification,
          submissionUrl: dir.url,
          pageRank: pageRank,
          daScore: daScore,
          spamScore: spamScore,
          status: 'active',
          createdBy: systemUserId
        };

        bulkOps.push({
          insertOne: {
            document: directoryDoc
          }
        });

        // Process in batches of 100
        if (bulkOps.length >= 100) {
          await Directory.bulkWrite(bulkOps);
          totalInserted += bulkOps.length;
          console.log(`   ✅ Inserted ${bulkOps.length} directories (Total: ${totalInserted})`);
          bulkOps.length = 0;
        }
      }
    }

    // Insert remaining directories
    if (bulkOps.length > 0) {
      await Directory.bulkWrite(bulkOps);
      totalInserted += bulkOps.length;
      console.log(`   ✅ Inserted final ${bulkOps.length} directories (Total: ${totalInserted})`);
    }

    // Verify the data
    const counts = await Directory.aggregate([
      {
        $group: {
          _id: '$classification',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    console.log('\n📊 Final Directory Counts by Classification:');
    counts.forEach(item => {
      console.log(`   ${item._id}: ${item.count} directories`);
    });

    const totalCount = await Directory.countDocuments();
    console.log(`\n🎉 Successfully populated ${totalCount} directories!`);

  } catch (error) {
    console.error('❌ Error populating directories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
populateDirectories();
