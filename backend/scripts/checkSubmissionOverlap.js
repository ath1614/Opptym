const mongoose = require('mongoose');
const Submission = require('../models/submissionModel');
const User = require('../models/userModel');

// Production MongoDB URI
const MONGODB_URI = 'mongodb+srv://lowlife9366:x6TX9HuAvESb3DJD@opptym.tkcz5nx.mongodb.net/?retryWrites=true&w=majority&appName=opptym';

async function checkSubmissionOverlap() {
  try {
    console.log('🔍 Checking Submission Overlap Issues...\n');
    
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
    
    // Test classification filtering
    console.log('\n🔍 Testing classification filtering...');
    
    const classificationMap = {
      'Article Submission': 'article',
      'Directory Submission': 'directory',
      'directory': 'directory',
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
      'More SEO': 'bookmarklet',
      'article': 'article',
      'local': 'local',
      'social': 'social',
      'classified': 'classified',
      'qa': 'qa',
      'australia': 'australia'
    };
    
    const classificationCounts = {};
    
    for (const [classification, type] of Object.entries(classificationMap)) {
      const filter = { userId: testUser._id };
      filter.submissionType = type;
      
      const count = await Submission.countDocuments(filter);
      classificationCounts[classification] = count;
      console.log(`   ${classification}: ${count} submissions (type: ${type})`);
    }
    
    // Calculate total if we sum all classifications
    const totalFromClassifications = Object.values(classificationCounts).reduce((sum, count) => sum + count, 0);
    console.log(`\n📊 Total from classification sum: ${totalFromClassifications}`);
    console.log(`📊 Actual total submissions: ${allSubmissions.length}`);
    console.log(`📊 Overlap (difference): ${totalFromClassifications - allSubmissions.length}`);
    
    // Show which submissions are being double-counted
    console.log('\n🔍 Analyzing overlap...');
    
    // Check bookmarklet submissions
    const bookmarkletSubmissions = allSubmissions.filter(s => s.submissionType === 'bookmarklet');
    console.log(`📊 Bookmarklet submissions: ${bookmarkletSubmissions.length}`);
    console.log('   These are counted in: Directory Submission, BookMarking, Business Listing, Classified, More SEO');
    
    // Check directory submissions
    const directorySubmissions = allSubmissions.filter(s => s.submissionType === 'directory');
    console.log(`📊 Directory submissions: ${directorySubmissions.length}`);
    console.log('   These are counted in: Directory Submission, Business Listing');
    
    console.log('\n💡 Solution: Each submission should only be counted in ONE classification');
    console.log('   - Remove bookmarklet from multiple classifications');
    console.log('   - Remove directory from Business Listing');
    console.log('   - Or create unique submission types for each classification');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

checkSubmissionOverlap();
