const mongoose = require('mongoose');
const { connectDB } = require('../utils/dbConnection');
const User = require('../models/userModel');

async function debugUserFeatures() {
  try {
    await connectDB();
    console.log('🔍 Debugging User Features...\n');
    
    // Find the test user
    const testUser = await User.findOne({ subscription: 'free' });
    if (!testUser) {
      console.log('❌ No free user found');
      return;
    }
    
    console.log('📋 User Details:');
    console.log(`   - ID: ${testUser._id}`);
    console.log(`   - Email: ${testUser.email}`);
    console.log(`   - Username: ${testUser.username}`);
    console.log(`   - Role: ${testUser.role}`);
    console.log(`   - Subscription: ${testUser.subscription}`);
    console.log(`   - Trial Start: ${testUser.trialStartDate}`);
    console.log(`   - Trial End: ${testUser.trialEndDate}`);
    console.log(`   - Is in trial: ${testUser.isInTrialPeriod()}`);
    console.log(`   - Trial days left: ${testUser.getTrialDaysLeft()}`);
    
    console.log('\n📋 Features Object:');
    console.log(`   - Features: ${JSON.stringify(testUser.features, null, 2)}`);
    
    console.log('\n📋 Plan Limits:');
    console.log(`   - Plan Limits: ${JSON.stringify(testUser.planLimits, null, 2)}`);
    
    console.log('\n🔍 Feature Access Tests:');
    const features = ['projects', 'submissions', 'seoTools', 'analytics', 'admin'];
    features.forEach(feature => {
      const hasAccess = testUser.hasFeatureAccess(feature);
      console.log(`   - ${feature}: ${hasAccess}`);
    });
    
    console.log('\n🔍 Permission Tests:');
    const permissions = ['canCreateProjects', 'canSubmitToDirectories', 'canUseSeoTools', 'canAccessAnalytics', 'canAccessAdmin'];
    permissions.forEach(permission => {
      const hasPermission = testUser.hasPermission(permission);
      console.log(`   - ${permission}: ${hasPermission}`);
    });
    
    console.log('\n🔍 Usage Limit Tests:');
    const usageTypes = ['projects', 'submissions', 'seoTools', 'apiCalls'];
    usageTypes.forEach(usageType => {
      const withinLimit = testUser.checkUsageLimit(usageType);
      console.log(`   - ${usageType}: ${withinLimit}`);
    });
    
    // Test setting plan limits manually
    console.log('\n🔧 Testing setPlanLimitsSync:');
    testUser.setPlanLimitsSync();
    console.log(`   - Updated Features: ${JSON.stringify(testUser.features, null, 2)}`);
    
    console.log('\n🔍 Feature Access Tests After setPlanLimitsSync:');
    features.forEach(feature => {
      const hasAccess = testUser.hasFeatureAccess(feature);
      console.log(`   - ${feature}: ${hasAccess}`);
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

debugUserFeatures();
