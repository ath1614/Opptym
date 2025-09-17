const mongoose = require('mongoose');
const Submission = require('../models/submissionModel');
const User = require('../models/userModel');
const Project = require('../models/projectModel');

// Production MongoDB URI
const PRODUCTION_MONGODB_URI = 'mongodb+srv://lowlife9366:x6TX9HuAvESb3DJD@opptym.tkcz5nx.mongodb.net/?retryWrites=true&w=majority&appName=opptym';

async function testSubmissionsFetching() {
  try {
    console.log('🧪 Testing Submissions Fetching for Each Classification...\n');
    
    // Connect to Production MongoDB Atlas
    await mongoose.connect(PRODUCTION_MONGODB_URI);
    console.log('✅ Connected to Production MongoDB Atlas');
    
    // Get a test user with submissions
    const testUser = await User.findOne({ email: 'shrivitthalp@gmail.com' });
    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }
    
    console.log(`👤 Using test user: ${testUser.email}`);
    
    // Define the classification mapping (same as in submissionController.js)
    const classificationMap = {
      'Article Submission': 'article',
      'Directory Submission': ['directory', 'bookmarklet'],
      'directory': ['directory', 'bookmarklet'],
      'Press Release': 'article',
      'BookMarking': ['bookmark', 'bookmarklet'],
      'Business Listing': ['directory', 'bookmarklet'],
      'Classified': ['classified', 'bookmarklet'],
      'Forum': 'forum',
      'Social Media': ['social', 'bookmarklet'],
      'Local Business': ['local', 'bookmarklet'],
      'Citation': 'citation',
      'Web 2.0': 'web2',
      'Q&A': 'qa',
      'More SEO': 'bookmarklet',
      'article': 'article',
      'local': ['local', 'bookmarklet'],
      'social': ['social', 'bookmarklet'],
      'classified': ['classified', 'bookmarklet'],
      'qa': 'qa',
      'australia': 'australia'
    };
    
    // Test each classification
    const classifications = [
      'Directory Submission',
      'Article Submission', 
      'Press Release',
      'BookMarking',
      'Business Listing',
      'Classified',
      'More SEO'
    ];
    
    console.log('📊 Testing Submissions Fetching by Classification:');
    console.log('==================================================');
    
    for (const classification of classifications) {
      console.log(`\n🔍 Testing Classification: "${classification}"`);
      
      // Build filter (same logic as submissionController.js)
      const filter = { userId: testUser._id };
      const mappedType = classificationMap[classification];
      
      if (mappedType) {
        if (Array.isArray(mappedType)) {
          filter.submissionType = { $in: mappedType };
          console.log(`   📋 Mapped to submission types: [${mappedType.join(', ')}]`);
        } else {
          filter.submissionType = mappedType;
          console.log(`   📋 Mapped to submission type: ${mappedType}`);
        }
      } else {
        console.log(`   ⚠️ No mapping found for classification: ${classification}`);
        continue;
      }
      
      // Fetch submissions
      const submissions = await Submission.find(filter)
        .populate('projectId', 'title url')
        .sort({ createdAt: -1 });
      
      console.log(`   📈 Found ${submissions.length} submissions`);
      
      if (submissions.length > 0) {
        // Show breakdown by submission type
        const typeBreakdown = {};
        submissions.forEach(sub => {
          const type = sub.submissionType || 'unknown';
          typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;
        });
        
        console.log(`   📊 Breakdown by type:`, typeBreakdown);
        
        // Show status breakdown
        const statusBreakdown = {};
        submissions.forEach(sub => {
          const status = sub.status || 'unknown';
          statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
        });
        
        console.log(`   📊 Breakdown by status:`, statusBreakdown);
        
        // Show sample submission
        const sampleSubmission = submissions[0];
        console.log(`   📝 Sample submission:`, {
          id: sampleSubmission._id,
          type: sampleSubmission.submissionType,
          status: sampleSubmission.status,
          project: sampleSubmission.projectId?.title || 'No project',
          directory: sampleSubmission.directoryName || 'No directory',
          createdAt: sampleSubmission.createdAt
        });
      }
    }
    
    // Test overall submission counts
    console.log('\n📊 Overall Submission Statistics:');
    console.log('==================================');
    
    const totalSubmissions = await Submission.countDocuments({ userId: testUser._id });
    console.log(`📈 Total submissions for user: ${totalSubmissions}`);
    
    // Breakdown by submission type
    const typeStats = await Submission.aggregate([
      { $match: { userId: testUser._id } },
      { $group: { _id: '$submissionType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📊 Submissions by Type:');
    typeStats.forEach(stat => {
      console.log(`   ${stat._id || 'unknown'}: ${stat.count}`);
    });
    
    // Breakdown by status
    const statusStats = await Submission.aggregate([
      { $match: { userId: testUser._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📊 Submissions by Status:');
    statusStats.forEach(stat => {
      console.log(`   ${stat._id || 'unknown'}: ${stat.count}`);
    });
    
    console.log('\n🎉 Submissions fetching test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the test
testSubmissionsFetching();
