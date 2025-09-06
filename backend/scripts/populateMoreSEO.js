import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the Directory model
const Directory = mongoose.model('Directory', new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  domain: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    required: true,
    enum: ['business', 'technology', 'health', 'education', 'finance', 'entertainment', 'sports', 'travel', 'food', 'lifestyle', 'other', 'Web 2.0 Submission', 'Q & A Websites', 'PDF Submission', 'PPT Submission', 'Video Submission', 'Event Submission', 'Podcast Submission', 'Photo Sharing', 'Search Engine Submission', 'Infographics Submission', 'RSS Submission', 'Ping Websites', 'Blog Commenting']
  },
  country: { 
    type: String, 
    default: 'Global',
    enum: ['Global', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'India', 'Japan', 'Brazil', 'Mexico', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Switzerland', 'Austria', 'Belgium', 'Ireland', 'New Zealand', 'Singapore', 'South Korea', 'China', 'Russia', 'South Africa', 'Nigeria', 'Egypt', 'Kenya', 'Ghana', 'Morocco', 'Tunisia', 'Algeria', 'Libya', 'Sudan', 'Ethiopia', 'Uganda', 'Tanzania', 'Zambia', 'Zimbabwe', 'Botswana', 'Namibia', 'Mozambique', 'Angola', 'Congo', 'Cameroon', 'Gabon', 'Chad', 'Niger', 'Mali', 'Burkina Faso', 'Senegal', 'Guinea', 'Sierra Leone', 'Liberia', 'Ivory Coast', 'Togo', 'Benin', 'Central African Republic', 'Equatorial Guinea', 'Sao Tome and Principe', 'Cape Verde', 'Mauritania', 'Gambia', 'Guinea-Bissau', 'Comoros', 'Seychelles', 'Mauritius', 'Madagascar', 'Malawi', 'Lesotho', 'Eswatini', 'Bangladesh', 'Dubai', 'Philippines', 'Malaysia', 'Other']
  },
  classification: { 
    type: String, 
    default: 'Directory Submission',
    enum: ['Directory Submission', 'Article Submission', 'Press Release', 'BookMarking', 'Business Listing', 'Classified', 'More SEO']
  },
  isCustom: { type: Boolean, default: false },
  priority: { type: Number, default: 0, min: 0, max: 100 },
  pageRank: { type: Number, default: 0, min: 0, max: 10 },
  daScore: { type: Number, default: 0, min: 0, max: 100 },
  spamScore: { type: Number, default: 0, min: 0, max: 17 },
  submissionUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

async function populateMoreSEO() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://lowlife9366:x6TX9HuAvESb3DJD@opptym.tkcz5nx.mongodb.net/opptym?retryWrites=true&w=majority&appName=opptym';
    console.log('🔍 Connecting to MongoDB URI:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    console.log('🔍 Database name:', mongoose.connection.db.databaseName);

    // Read the More SEO data
    const dataPath = path.join(__dirname, '../../more_seo_classification.json');
    const fileContent = fs.readFileSync(dataPath, 'utf8');
    const lines = fileContent.trim().split('\n');
    const moreSeoData = lines.map(line => JSON.parse(line));

    console.log(`📊 Found ${moreSeoData.length} More SEO entries`);

    // Clear existing More SEO entries
    await Directory.deleteMany({ classification: 'More SEO' });
    console.log('🗑️ Cleared existing More SEO entries');

    // Get a user ID for createdBy field (use the first user or create a default one)
    let userId;
    try {
      const User = mongoose.model('User');
      const user = await User.findOne();
      if (user) {
        userId = user._id;
      } else {
        // Create a default user if none exists
        const defaultUser = new User({
          name: 'System Admin',
          email: 'admin@opptym.com',
          password: 'hashedpassword',
          role: 'admin'
        });
        await defaultUser.save();
        userId = defaultUser._id;
      }
    } catch (error) {
      console.log('⚠️ Could not get user ID, using null');
      userId = null;
    }

    // Insert More SEO data in batches
    const batchSize = 50;
    const totalBatches = Math.ceil(moreSeoData.length / batchSize);
    
    for (let i = 0; i < moreSeoData.length; i += batchSize) {
      const batch = moreSeoData.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      const directoriesToInsert = batch.map(item => ({
        ...item,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      try {
        await Directory.insertMany(directoriesToInsert);
        console.log(`📝 Inserted batch ${batchNumber}/${totalBatches}`);
      } catch (error) {
        console.error(`❌ Error inserting batch ${batchNumber}:`, error.message);
        console.error(`❌ Sample data:`, directoriesToInsert[0]);
      }
    }

    console.log(`✅ Successfully inserted ${moreSeoData.length} More SEO entries`);

    // Show sample entries
    const sampleEntries = await Directory.find({ classification: 'More SEO' }).limit(5);
    console.log('\n📋 Sample More SEO entries:');
    sampleEntries.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.name} - ${entry.category}`);
    });

    // Show statistics by category
    const categories = await Directory.aggregate([
      { $match: { classification: 'More SEO' } },
      { $group: { _id: '$category', count: { $sum: 1 }, highPriority: { $sum: { $cond: [{ $gte: ['$priority', 80] }, 1, 0] } } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📂 Category Breakdown:');
    categories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} platforms (${cat.highPriority} high priority)`);
    });

    const highPriorityCount = await Directory.countDocuments({ 
      classification: 'More SEO', 
      priority: { $gte: 80 } 
    });

    console.log(`\n⭐ Total High Priority platforms: ${highPriorityCount}`);

  } catch (error) {
    console.error('❌ Error populating More SEO:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

populateMoreSEO();
