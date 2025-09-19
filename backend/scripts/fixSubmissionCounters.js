const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/userModel');
const Submission = require('../models/submissionModel');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function fixSubmissionCounters() {
  try {
    console.log('🔍 Starting submission counter fix...');
    
    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to check`);
    
    let fixedCount = 0;
    
    for (const user of users) {
      console.log(`\n👤 Checking user: ${user.email}`);
      
      // Get all submissions for this user
      const submissions = await Submission.find({ userId: user._id });
      console.log(`📝 Found ${submissions.length} submissions`);
      
      // Count directory submissions (these should not count against general submission limit)
      const directorySubmissionTypes = ['directory', 'article', 'bookmark', 'business', 'classified', 'forum', 'social', 'local', 'citation', 'web2', 'qa', 'bookmarklet', 'australia'];
      const directorySubmissions = submissions.filter(sub => 
        directorySubmissionTypes.includes(sub.submissionType)
      );
      
      // Count SEO tool submissions (these should count against general submission limit)
      const seoToolSubmissions = submissions.filter(sub => 
        !directorySubmissionTypes.includes(sub.submissionType)
      );
      
      console.log(`📁 Directory submissions: ${directorySubmissions.length}`);
      console.log(`🔧 SEO tool submissions: ${seoToolSubmissions.length}`);
      console.log(`📊 Current submissionsUsed: ${user.usage?.submissionsUsed || 0}`);
      
      // Calculate correct submission count (only SEO tool submissions)
      const correctSubmissionCount = seoToolSubmissions.length;
      
      if (user.usage?.submissionsUsed !== correctSubmissionCount) {
        console.log(`🔧 Fixing submission counter: ${user.usage?.submissionsUsed || 0} → ${correctSubmissionCount}`);
        
        // Update the user's submission counter
        if (!user.usage) {
          user.usage = {
            submissionsUsed: 0,
            projectsUsed: 0,
            seoToolsUsed: 0,
            apiCallsUsed: 0
          };
        }
        
        user.usage.submissionsUsed = correctSubmissionCount;
        await user.save();
        
        fixedCount++;
        console.log(`✅ Fixed submission counter for ${user.email}`);
      } else {
        console.log(`✅ Submission counter already correct for ${user.email}`);
      }
    }
    
    console.log(`\n🎉 Fix completed! Fixed ${fixedCount} users`);
    
  } catch (error) {
    console.error('❌ Error fixing submission counters:', error);
  }
}

async function main() {
  await connectDB();
  await fixSubmissionCounters();
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
}

main().catch(console.error);
