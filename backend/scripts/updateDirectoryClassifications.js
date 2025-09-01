const mongoose = require('mongoose');
const Directory = require('../models/directoryModel');
require('dotenv').config();

// Directory classification mapping
const directoryClassifications = {
  // Article Submission directories
  'Blahoo': 'Article Submission',
  'Caida': 'Article Submission',
  'Pink Linker': 'Article Submission',
  'Grey Linker': 'Article Submission',
  'Red Linker': 'Article Submission',
  'Yellow Linker': 'Article Submission',
  'Link Dir 4U': 'Article Submission',
  'World Web Directory': 'Article Submission',
  'WLD Directory': 'Article Submission',
  'Taurus Directory': 'Article Submission',
  'Canopus Directory': 'Article Submission',
  'Vie Search': 'Article Submission',
  '01 Web Directory': 'Article Submission',
  'Directory Free': 'Article Submission',
  'Targets Views': 'Article Submission',
  'More Funz': 'Article Submission',
  'DR Test': 'Article Submission',
  'Ellys Directory': 'Article Submission',
  'Favicon Style': 'Article Submission',
  'Idaho Index': 'Article Submission',
  'Call Your Country': 'Article Submission',
  
  // Web2.0 directories
  'SEO Deep Links': 'Web2.0',
  'SEO Range': 'Web2.0',
  'Leading Link Directory': 'Web2.0',
  'Webo World': 'Web2.0',
  'Pro Link Directory': 'Web2.0',
  'SEO Web Dir': 'Web2.0',
  'PR8 Directory': 'Web2.0',
  'Five Stars Auto Pawn': 'Web2.0',
  'Zopso': 'Web2.0'
};

async function updateDirectoryClassifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    let updatedCount = 0;
    
    // Update each directory with proper classification
    for (const [directoryName, classification] of Object.entries(directoryClassifications)) {
      const result = await Directory.updateOne(
        { name: directoryName },
        { 
          classification: classification,
          updatedAt: new Date()
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${directoryName} to ${classification}`);
        updatedCount++;
      } else {
        console.log(`⚠️ Directory ${directoryName} not found or already updated`);
      }
    }

    // Get updated statistics
    const classifications = await Directory.distinct('classification');
    console.log('\n📊 Updated classifications:', classifications);
    
    const countByClassification = await Directory.aggregate([
      { $group: { _id: '$classification', count: { $sum: 1 } } }
    ]);
    console.log('📊 Count by classification:', countByClassification);

    console.log(`\n✅ Successfully updated ${updatedCount} directories`);

  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the update
updateDirectoryClassifications();
