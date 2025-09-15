const mongoose = require('mongoose');
require('dotenv').config();

// Import the submission model
const Submission = require('../models/submissionModel');

async function testBookmarkletSubmission() {
  try {
    console.log('🔍 Testing bookmarklet submission endpoint...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Test data
    const testData = {
      userId: '688f1268f4921cd9020bcc96', // Test user ID
      siteName: 'caida.eu',
      submissionType: 'bookmarklet',
      status: 'completed',
      submittedAt: new Date(),
      metadata: {
        url: 'https://caida.eu',
        fieldsFilled: 5,
        filledFields: [],
        timestamp: new Date().toISOString(),
        source: 'bookmarklet'
      }
    };
    
    console.log('📝 Test data:', testData);
    
    // Try to create submission
    const submission = await Submission.create(testData);
    console.log('✅ Submission created successfully:', submission);
    
    // Clean up
    await Submission.deleteOne({ _id: submission._id });
    console.log('🧹 Test submission cleaned up');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

testBookmarkletSubmission();
