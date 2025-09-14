#!/usr/bin/env node

/**
 * Test Analytics Endpoint
 * Debug the 500 error on /api/analytics/dashboard
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

async function testAnalyticsEndpoint() {
  console.log('🔍 TESTING ANALYTICS ENDPOINT');
  console.log('=============================\n');

  try {
    // Find a test user
    const testUser = await User.findOne();
    if (!testUser) {
      console.log('❌ No users found in database');
      return;
    }

    console.log('👤 Test User:', testUser.email);
    console.log('🆔 User ID:', testUser._id);

    // Simulate the analytics controller logic
    const userId = testUser._id;
    const period = '30d';

    console.log('\n📊 Testing Analytics Logic...');

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    console.log('📅 Date Range:', { startDate, now });

    // Get projects count
    console.log('📁 Getting projects...');
    const totalProjects = await Project.countDocuments({ userId });
    const recentProjects = await Project.countDocuments({ 
      userId, 
      createdAt: { $gte: startDate } 
    });
    console.log('   - Total Projects:', totalProjects);
    console.log('   - Recent Projects:', recentProjects);

    // Get submissions analytics
    console.log('📝 Getting submissions...');
    const submissions = await Submission.find({ userId });
    const totalSubmissions = submissions.length;
    const recentSubmissions = await Submission.countDocuments({ 
      userId, 
      createdAt: { $gte: startDate } 
    });
    console.log('   - Total Submissions:', totalSubmissions);
    console.log('   - Recent Submissions:', recentSubmissions);

    // Calculate submission success rate
    console.log('📈 Calculating success rate...');
    const successfulSubmissions = submissions.filter(s => 
      s.status === 'success' || s.status === 'completed' || s.status === 'approved' || s.status === 'published'
    ).length;
    const successRate = totalSubmissions > 0 ? Math.round((successfulSubmissions / totalSubmissions) * 100) : 0;
    console.log('   - Successful Submissions:', successfulSubmissions);
    console.log('   - Success Rate:', successRate + '%');

    // Calculate average ranking
    console.log('🏆 Calculating average ranking...');
    const submissionsWithRanking = submissions.filter(s => s.ranking && s.ranking > 0);
    const averageRanking = submissionsWithRanking.length > 0 
      ? Math.round(submissionsWithRanking.reduce((acc, s) => acc + s.ranking, 0) / submissionsWithRanking.length)
      : 0;
    console.log('   - Submissions with Ranking:', submissionsWithRanking.length);
    console.log('   - Average Ranking:', averageRanking);

    // Calculate backlinks gained
    const backlinksGained = successfulSubmissions;
    console.log('🔗 Backlinks Gained:', backlinksGained);

    // Get directories submitted to
    console.log('📂 Getting directories...');
    const directoriesSubmitted = await Submission.distinct('directoryId', { userId });
    console.log('   - Directories Submitted:', directoriesSubmitted.length);

    // Test user usage stats
    console.log('👤 Testing user usage stats...');
    console.log('   - User Usage Object:', testUser.usage);
    console.log('   - Submissions Used:', testUser.usage?.submissionsUsed || 0);
    console.log('   - Projects Used:', testUser.usage?.projectsUsed || 0);

    // Test subscription details
    console.log('💳 Testing subscription details...');
    try {
      const subscriptionDetails = testUser.getSubscriptionDetails();
      console.log('   - Subscription Details:', subscriptionDetails);
    } catch (subError) {
      console.error('   - Subscription Details Error:', subError.message);
    }

    console.log('\n✅ Analytics logic completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error stack:', error.stack);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testAnalyticsEndpoint();
