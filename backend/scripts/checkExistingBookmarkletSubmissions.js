const mongoose = require('mongoose');
require('dotenv').config();

// Import models
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

async function checkExistingBookmarkletSubmissions() {
  try {
    const bookmarkletSubmissions = await Submission.find({ 
      submissionType: 'bookmarklet' 
    }).limit(5);
    
    console.log('📊 Found bookmarklet submissions:');
    bookmarkletSubmissions.forEach((submission, index) => {
      console.log(`\n${index + 1}. Submission ID: ${submission._id}`);
      console.log(`   User ID: ${submission.userId}`);
      console.log(`   Site Name: ${submission.siteName}`);
      console.log(`   Status: ${submission.status}`);
      console.log(`   Token: ${submission.metadata?.token || 'No token'}`);
      console.log(`   Created: ${submission.createdAt}`);
    });
    
    if (bookmarkletSubmissions.length === 0) {
      console.log('⚠️ No bookmarklet submissions found');
    }
  } catch (error) {
    console.error('❌ Failed to check bookmarklet submissions:', error);
  }
}

async function main() {
  console.log('🚀 Checking Existing Bookmarklet Submissions...\n');
  
  await connectDB();
  await checkExistingBookmarkletSubmissions();
  
  console.log('\n✅ Check Complete!');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});
