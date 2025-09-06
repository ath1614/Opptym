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
    enum: ['business', 'technology', 'health', 'education', 'finance', 'entertainment', 'sports', 'travel', 'food', 'lifestyle', 'other']
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

async function populateClassified() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Read the classified data
    const dataPath = path.join(__dirname, '../../classified_classification.json');
    const fileContent = fs.readFileSync(dataPath, 'utf8');
    const lines = fileContent.trim().split('\n');
    const classifiedData = lines.map(line => JSON.parse(line));

    console.log(`📊 Found ${classifiedData.length} Classified entries`);

    // Clear existing Classified entries
    await Directory.deleteMany({ classification: 'Classified' });
    console.log('🗑️ Cleared existing Classified entries');

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

    // Insert classified data in batches
    const batchSize = 50;
    const totalBatches = Math.ceil(classifiedData.length / batchSize);
    
    for (let i = 0; i < classifiedData.length; i += batchSize) {
      const batch = classifiedData.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      const directoriesToInsert = batch.map(item => ({
        ...item,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await Directory.insertMany(directoriesToInsert);
      console.log(`📝 Inserted batch ${batchNumber}/${totalBatches}`);
    }

    console.log(`✅ Successfully inserted ${classifiedData.length} Classified entries`);

    // Show sample entries
    const sampleEntries = await Directory.find({ classification: 'Classified' }).limit(5);
    console.log('\n📋 Sample Classified entries:');
    sampleEntries.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.name} - ${entry.country}`);
    });

    // Show statistics
    const highPriorityCount = await Directory.countDocuments({ 
      classification: 'Classified', 
      priority: { $gte: 75 } 
    });

    console.log(`\n⭐ High Priority platforms: ${highPriorityCount}`);

  } catch (error) {
    console.error('❌ Error populating Classified:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

populateClassified();
