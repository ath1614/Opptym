const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const Directory = require('../models/directoryModel');
const User = require('../models/userModel');

// Read the config file
const configPath = path.join(__dirname, '../../src/config/directoriesConfig.ts');
const configContent = fs.readFileSync(configPath, 'utf8');

// Extract the directoriesData object from the TypeScript file
const match = configContent.match(/export const directoriesData: DirectoriesData = \{([\s\S]*?)\};/);
if (!match) {
  console.error('❌ Could not find directoriesData in config file');
  process.exit(1);
}

// Parse the directories data (this is a simplified parser)
const dataStr = match[1];
const classifications = {};

// Parse each classification
const classificationMatches = dataStr.match(/"([^"]+)":\s*\[([\s\S]*?)\]/g);
if (!classificationMatches) {
  console.error('❌ Could not parse classifications from config file');
  process.exit(1);
}

classificationMatches.forEach(match => {
  const classificationMatch = match.match(/"([^"]+)":\s*\[/);
  if (!classificationMatch) return;
  
  const classification = classificationMatch[1];
  const directoriesStr = match.match(/\[([\s\S]*?)\]/)[1];
  
  // Parse individual directories (simplified - just count them)
  const directoryMatches = directoriesStr.match(/\{[^}]*"name":\s*"([^"]+)"[^}]*\}/g);
  if (directoryMatches) {
    classifications[classification] = directoryMatches.map(dirMatch => {
      const nameMatch = dirMatch.match(/"name":\s*"([^"]+)"/);
      const urlMatch = dirMatch.match(/"url":\s*"([^"]+)"/);
      const descMatch = dirMatch.match(/"description":\s*"([^"]+)"/);
      const categoryMatch = dirMatch.match(/"category":\s*"([^"]+)"/);
      const countryMatch = dirMatch.match(/"country":\s*"([^"]+)"/);
      const priorityMatch = dirMatch.match(/"priority":\s*(\d+)/);
      const daScoreMatch = dirMatch.match(/"daScore":\s*(\d+)/);
      const pageRankMatch = dirMatch.match(/"pageRank":\s*(\d+)/);
      const isPremiumMatch = dirMatch.match(/"isPremium":\s*(true|false)/);
      const statusMatch = dirMatch.match(/"status":\s*"([^"]+)"/);
      
      return {
        name: nameMatch ? nameMatch[1] : 'Unknown',
        url: urlMatch ? urlMatch[1] : '',
        description: descMatch ? descMatch[1] : '',
        category: categoryMatch ? categoryMatch[1] : 'business',
        country: countryMatch ? countryMatch[1] : 'Global',
        priority: priorityMatch ? parseInt(priorityMatch[1]) : 50,
        daScore: daScoreMatch ? parseInt(daScoreMatch[1]) : 30,
        pageRank: pageRankMatch ? parseInt(pageRankMatch[1]) : 1,
        isPremium: isPremiumMatch ? isPremiumMatch[1] === 'true' : false,
        status: statusMatch ? statusMatch[1] : 'active'
      };
    });
  }
});

async function populateFromConfig() {
  try {
    console.log('🚀 Starting directory population from config file...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Get or create system admin user
    let adminUser = await User.findOne({ email: 'system@opptym.com' });
    if (!adminUser) {
      adminUser = await User.findOne({ role: 'admin' });
    }
    
    if (!adminUser) {
      console.log('❌ No admin user found. Please create an admin user first.');
      return;
    }
    
    // Clear existing directories
    console.log('🧹 Clearing existing directories...');
    await Directory.deleteMany({});
    console.log('✅ Cleared existing directories\n');
    
    let totalInserted = 0;
    
    // Insert directories by classification
    for (const [classification, directories] of Object.entries(classifications)) {
      console.log(`📁 Processing ${directories.length} directories for classification: ${classification}`);
      
      const directoriesToInsert = directories.map(dir => {
        // Extract domain from URL
        let domain = 'unknown.com';
        try {
          if (dir.url) {
            const url = new URL(dir.url);
            domain = url.hostname;
          }
        } catch (e) {
          // If URL parsing fails, use the name as domain
          domain = dir.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
        }
        
        return {
          name: dir.name,
          domain: domain,
          description: dir.description,
          category: dir.category,
          country: dir.country,
          classification: classification,
          priority: dir.priority,
          daScore: dir.daScore,
          pageRank: dir.pageRank,
          spamScore: 2,
          isPremium: dir.isPremium,
          requiresApproval: true,
          submissionUrl: dir.url,
          contactEmail: `admin@${domain}`,
          submissionGuidelines: 'Please provide accurate information',
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
          status: dir.status,
          isCustom: false,
          createdBy: adminUser._id
        };
      });
      
      // Insert in batches to avoid memory issues
      const batchSize = 100;
      for (let i = 0; i < directoriesToInsert.length; i += batchSize) {
        const batch = directoriesToInsert.slice(i, i + batchSize);
        const inserted = await Directory.insertMany(batch);
        totalInserted += inserted.length;
        console.log(`   📝 Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(directoriesToInsert.length / batchSize)} (${inserted.length} directories)`);
      }
      
      console.log(`✅ Completed ${classification}: ${directories.length} directories\n`);
    }
    
    console.log(`🎉 Directory population completed successfully!`);
    console.log(`📊 Total directories inserted: ${totalInserted}`);
    
    // Show summary by classification
    console.log('\n📋 Summary by Classification:');
    console.log('============================');
    for (const [classification, directories] of Object.entries(classifications)) {
      console.log(`${classification}: ${directories.length} directories`);
    }
    
    // Verify database counts
    console.log('\n🔍 Database Verification:');
    console.log('=========================');
    for (const classification of Object.keys(classifications)) {
      const count = await Directory.countDocuments({ classification });
      console.log(`${classification}: ${count} directories in database`);
    }
    
  } catch (error) {
    console.error('❌ Error populating directories:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the population
populateFromConfig();
