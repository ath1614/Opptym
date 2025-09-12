const mongoose = require('mongoose');
const { connectDB } = require('../utils/dbConnection');
const User = require('../models/userModel');

async function testFeatureAccess() {
  try {
    await connectDB();
    console.log('🔍 Testing Feature Access Logic...\n');
    
    // Create a test user with role 'user' (not admin)
    const testUser = await User.create({
      username: `testuser_${Date.now()}`,
      email: `testuser_${Date.now()}@opptym.com`,
      password: 'testpassword123',
      subscription: 'free',
      role: 'user' // Explicitly set as non-admin
    });
    
    console.log('📋 Test User Details:');
    console.log(`   - ID: ${testUser._id}`);
    console.log(`   - Email: ${testUser.email}`);
    console.log(`   - Role: ${testUser.role}`);
    console.log(`   - Subscription: ${testUser.subscription}`);
    console.log(`   - Is in trial: ${testUser.isInTrialPeriod()}`);
    
    console.log('\n📋 Features Object:');
    console.log(`   - Features: ${JSON.stringify(testUser.features, null, 2)}`);
    
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
    
    // Test with different subscription types
    console.log('\n\n🔍 Testing Different Subscription Types:');
    const subscriptionTypes = ['free', 'starter', 'pro', 'business', 'enterprise'];
    
    for (const subType of subscriptionTypes) {
      const tempUser = new User({
        username: `temp_${subType}`,
        email: `temp_${subType}@opptym.com`,
        password: 'temppassword123',
        subscription: subType,
        role: 'user' // Non-admin
      });
      
      tempUser.setPlanLimitsSync();
      
      console.log(`\n📋 ${subType.toUpperCase()} subscription (non-admin):`);
      console.log(`   - Features: ${JSON.stringify(tempUser.features, null, 2)}`);
      console.log(`   - Analytics access: ${tempUser.hasFeatureAccess('analytics')}`);
      console.log(`   - Admin access: ${tempUser.hasFeatureAccess('admin')}`);
    }
    
    // Clean up test user
    await User.findByIdAndDelete(testUser._id);
    console.log('\n✅ Test user cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

testFeatureAccess();
