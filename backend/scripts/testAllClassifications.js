const mongoose = require('mongoose');
const Submission = require('../models/submissionModel');
const User = require('../models/userModel');

// Production MongoDB URI
const MONGODB_URI = 'mongodb+srv://lowlife9366:x6TX9HuAvESb3DJD@opptym.tkcz5nx.mongodb.net/?retryWrites=true&w=majority&appName=opptym';

async function testAllClassifications() {
  try {
    console.log('🔍 Testing All Classifications After Fix...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to Production MongoDB Atlas');
    
    // Get a user with submissions
    const usersWithSubmissions = await User.aggregate([
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'userId',
          as: 'submissions'
        }
      },
      {
        $match: {
          'submissions.0': { $exists: true }
        }
      },
      {
        $limit: 1
      }
    ]);
    
    if (usersWithSubmissions.length === 0) {
      console.log('❌ No users with submissions found');
      return;
    }
    
    const testUser = usersWithSubmissions[0];
    console.log('👤 Using user with submissions:', testUser.email);
    
    // Get all submissions for this user
    const allSubmissions = await Submission.find({ userId: testUser._id });
    console.log(`📊 Total submissions for user: ${allSubmissions.length}`);
    
    // Group by submission type
    const byType = {};
    allSubmissions.forEach(sub => {
      if (!byType[sub.submissionType]) {
        byType[sub.submissionType] = [];
      }
      byType[sub.submissionType].push(sub);
    });
    
    console.log('\n📊 Submissions by type:');
    Object.keys(byType).forEach(type => {
      console.log(`   ${type}: ${byType[type].length} submissions`);
    });
    
    // Test ALL classifications
    console.log('\n🔍 Testing ALL classifications...');
    
    const allClassifications = [
      'Article Submission',
      'Directory Submission', 
      'Press Release',
      'BookMarking',
      'Business Listing',
      'Classified',
      'Forum',
      'Social Media',
      'Local Business',
      'Citation',
      'Web 2.0',
      'Q&A',
      'More SEO'
    ];
    
    const classificationMap = {
      'Article Submission': 'article',
      'Directory Submission': 'directory',
      'Press Release': 'article',
      'BookMarking': 'bookmark',
      'Business Listing': 'business',
      'Classified': 'classified',
      'Forum': 'forum',
      'Social Media': 'social',
      'Local Business': 'local',
      'Citation': 'citation',
      'Web 2.0': 'web2',
      'Q&A': 'qa',
      'More SEO': 'bookmarklet'
    };
    
    const classificationCounts = {};
    let totalFromClassifications = 0;
    
    for (const classification of allClassifications) {
      const type = classificationMap[classification];
      const filter = { userId: testUser._id, submissionType: type };
      
      const count = await Submission.countDocuments(filter);
      classificationCounts[classification] = count;
      totalFromClassifications += count;
      
      console.log(`   ${classification}: ${count} submissions (type: ${type})`);
    }
    
    console.log(`\n📊 Total from ALL classifications: ${totalFromClassifications}`);
    console.log(`📊 Actual total submissions: ${allSubmissions.length}`);
    console.log(`📊 Overlap (difference): ${totalFromClassifications - allSubmissions.length}`);
    
    // Check if fix is working
    if (totalFromClassifications === allSubmissions.length) {
      console.log('\n✅ PERFECT! No overlap - fix is working correctly!');
    } else if (totalFromClassifications < allSubmissions.length) {
      console.log('\n⚠️ Some submissions are not being counted in any classification');
    } else {
      console.log('\n❌ Still have overlap - fix needs more work');
    }
    
    // Show which classifications have submissions
    console.log('\n📊 Classifications with submissions:');
    Object.entries(classificationCounts).forEach(([classification, count]) => {
      if (count > 0) {
        console.log(`   ✅ ${classification}: ${count} submissions`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

testAllClassifications();
