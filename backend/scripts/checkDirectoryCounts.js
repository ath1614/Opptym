const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Directory = require('../models/directoryModel');

async function checkDirectoryCounts() {
  try {
    console.log('📊 Checking directory counts by classification...\n');
    
    // Get all directories
    const allDirectories = await Directory.find({});
    console.log(`Total directories in database: ${allDirectories.length}\n`);
    
    // Get counts by classification
    const classificationCounts = await Directory.aggregate([
      {
        $group: {
          _id: '$classification',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    console.log('📁 Directories by Classification:');
    console.log('================================');
    
    classificationCounts.forEach(item => {
      console.log(`${item._id || 'No Classification'}: ${item.count} directories`);
    });
    
    console.log('\n📋 Sample directories for each classification:');
    console.log('=============================================');
    
    for (const item of classificationCounts) {
      const classification = item._id;
      const sampleDirectories = await Directory.find({ classification }).limit(3);
      
      console.log(`\n${classification || 'No Classification'} (${item.count} total):`);
      sampleDirectories.forEach(dir => {
        console.log(`  - ${dir.name} (${dir.domain})`);
      });
    }
    
  } catch (error) {
    console.error('Error checking directory counts:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Check directory counts
checkDirectoryCounts();
