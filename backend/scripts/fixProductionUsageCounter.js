const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/userModel');
const Submission = require('../models/submissionModel');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function fixProductionUsageCounter() {
  try {
    // Find the user (shrivitthalp@gmail.com)
    const user = await User.findOne({ email: 'shrivitthalp@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`📊 Found user: ${user.email}`);
    console.log(`📊 Current usage: ${JSON.stringify(user.usage)}`);
    console.log(`📊 Subscription: ${user.subscription}`);

    // Count actual submissions for this user
    const actualSubmissionCount = await Submission.countDocuments({ 
      userId: user._id 
    });

    console.log(`📊 Actual submissions in database: ${actualSubmissionCount}`);

    // Update the user's usage counter to match actual submissions
    if (!user.usage) {
      user.usage = {
        submissionsUsed: 0,
        projectsUsed: 0,
        seoToolsUsed: 0,
        apiCallsUsed: 0
      };
    }

    const oldUsage = user.usage.submissionsUsed;
    user.usage.submissionsUsed = actualSubmissionCount;

    await user.save();

    console.log(`✅ Updated user usage counter:`);
    console.log(`   Old: ${oldUsage} submissions used`);
    console.log(`   New: ${user.usage.submissionsUsed} submissions used`);
    console.log(`   Actual submissions: ${actualSubmissionCount}`);

    // Verify the fix
    const updatedUser = await User.findById(user._id);
    console.log(`✅ Verification - Current usage: ${JSON.stringify(updatedUser.usage)}`);

    // Test the fix by checking if it matches the expected count
    if (updatedUser.usage.submissionsUsed === actualSubmissionCount) {
      console.log(`✅ SUCCESS: Usage counter now matches actual submission count!`);
    } else {
      console.log(`❌ ERROR: Usage counter still doesn't match actual submission count`);
    }

  } catch (error) {
    console.error('❌ Failed to fix user usage counter:', error);
  }
}

async function main() {
  console.log('🚀 Fixing Production User Usage Counter...\n');
  
  await connectDB();
  await fixProductionUsageCounter();
  
  console.log('\n✅ Production User Usage Counter Fix Complete!');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});
