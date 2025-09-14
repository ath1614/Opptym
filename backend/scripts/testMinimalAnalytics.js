#!/usr/bin/env node

/**
 * Minimal Analytics Test
 * Test the analytics controller step by step
 */

const mongoose = require('mongoose');
const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Submission = require('../models/submissionModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/opptym', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testMinimalAnalytics() {
  console.log('🔍 MINIMAL ANALYTICS TEST');
  console.log('=========================\n');

  try {
    // Find a test user
    const testUser = await User.findOne();
    if (!testUser) {
      console.log('❌ No users found in database');
      return;
    }

    console.log('👤 Test User:', testUser.email);
    const userId = testUser._id;

    // Test each step of the analytics controller
    console.log('\n📊 Step 1: Get user...');
    const user = await User.findById(userId);
    console.log('✅ User found:', user.email);

    console.log('\n📊 Step 2: Get projects...');
    const totalProjects = await Project.countDocuments({ userId });
    console.log('✅ Total projects:', totalProjects);

    console.log('\n📊 Step 3: Get submissions...');
    const submissions = await Submission.find({ userId });
    console.log('✅ Total submissions:', submissions.length);

    console.log('\n📊 Step 4: Calculate success rate...');
    const successfulSubmissions = submissions.filter(s => 
      s.status === 'success' || s.status === 'completed' || s.status === 'approved' || s.status === 'published'
    ).length;
    const successRate = submissions.length > 0 ? Math.round((successfulSubmissions / submissions.length) * 100) : 0;
    console.log('✅ Success rate:', successRate + '%');

    console.log('\n📊 Step 5: Get directories...');
    const directoriesSubmitted = await Submission.distinct('directoryId', { userId });
    console.log('✅ Directories submitted:', directoriesSubmitted.length);

    console.log('\n📊 Step 6: Test subscription details...');
    try {
      const subscriptionDetails = user.getSubscriptionDetails();
      console.log('✅ Subscription details:', subscriptionDetails.subscription);
    } catch (subError) {
      console.error('❌ Subscription details error:', subError.message);
      console.error('❌ Stack:', subError.stack);
    }

    console.log('\n📊 Step 7: Test usage stats...');
    const usageStats = {
      submissionsUsed: user.usage?.submissionsUsed || 0,
      projectsUsed: user.usage?.projectsUsed || 0,
      seoToolsUsed: user.usage?.seoToolsUsed || 0,
      apiCallsUsed: user.usage?.apiCallsUsed || 0,
      trialUsage: user.trialUsage
    };
    console.log('✅ Usage stats:', usageStats);

    console.log('\n✅ All steps completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testMinimalAnalytics();
