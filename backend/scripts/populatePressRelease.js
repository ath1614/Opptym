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
    enum: ['Global', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'India', 'Japan', 'Brazil', 'Mexico', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Switzerland', 'Austria', 'Belgium', 'Ireland', 'New Zealand', 'Singapore', 'South Korea', 'China', 'Russia', 'South Africa', 'Nigeria', 'Egypt', 'Kenya', 'Ghana', 'Morocco', 'Tunisia', 'Algeria', 'Libya', 'Sudan', 'Ethiopia', 'Uganda', 'Tanzania', 'Zambia', 'Zimbabwe', 'Botswana', 'Namibia', 'Mozambique', 'Angola', 'Congo', 'Cameroon', 'Gabon', 'Chad', 'Niger', 'Mali', 'Burkina Faso', 'Senegal', 'Guinea', 'Sierra Leone', 'Liberia', 'Ivory Coast', 'Togo', 'Benin', 'Central African Republic', 'Equatorial Guinea', 'Sao Tome and Principe', 'Cape Verde', 'Mauritania', 'Gambia', 'Guinea-Bissau', 'Comoros', 'Seychelles', 'Mauritius', 'Madagascar', 'Malawi', 'Lesotho', 'Eswatini', 'Other']
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

async function populatePressRelease() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Read the JSON file
    const jsonPath = path.join(__dirname, '../../press_release_classification.json');
    const directoriesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`📊 Found ${directoriesData.length} Press Release entries`);

    // Get system user ID (create if doesn't exist)
    const User = mongoose.model('User', new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      username: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      role: { type: String, enum: ['user', 'admin'], default: 'user' }
    }));

    let systemUser = await User.findOne({ email: 'system@opptym.com' });
    if (!systemUser) {
      systemUser = new User({
        email: 'system@opptym.com',
        username: 'system',
        firstName: 'System',
        lastName: 'User',
        role: 'admin'
      });
      await systemUser.save();
      console.log('✅ Created system user');
    }

    // Clear existing Press Release entries
    await Directory.deleteMany({ classification: 'Press Release' });
    console.log('🗑️ Cleared existing Press Release entries');

    // Prepare directories for insertion
    const directoriesToInsert = directoriesData.map(dir => ({
      name: dir.name,
      domain: dir.domain,
      description: dir.description,
      category: dir.category,
      country: dir.country,
      classification: dir.classification,
      isCustom: dir.isCustom,
      priority: dir.priority,
      pageRank: dir.pageRank,
      daScore: dir.daScore,
      spamScore: dir.spamScore,
      submissionUrl: dir.url,
      createdBy: systemUser._id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Insert directories
    await Directory.insertMany(directoriesToInsert);
    console.log(`📝 Inserted ${directoriesToInsert.length} Press Release entries`);

    // Verify insertion
    const count = await Directory.countDocuments({ classification: 'Press Release' });
    console.log(`✅ Successfully inserted ${count} Press Release entries`);

    // Show sample entries
    const sampleEntries = await Directory.find({ classification: 'Press Release' }).limit(5);
    console.log('\n📋 Sample Press Release entries:');
    sampleEntries.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.name} - ${entry.domain}`);
    });

    // Show high priority count
    const highPriorityCount = await Directory.countDocuments({ 
      classification: 'Press Release',
      priority: { $gte: 80 }
    });
    console.log(`\n⭐ High Priority platforms: ${highPriorityCount}`);

  } catch (error) {
    console.error('❌ Error populating Press Release:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

populatePressRelease();
