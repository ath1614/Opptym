require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');

async function debugSeoToolLimits() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a business user
    const businessUser = await User.findOne({ subscription: 'business' });
    if (!businessUser) {
      console.log('❌ No business user found');
      return;
    }

    console.log('🔍 Business User Found:');
    console.log('Email:', businessUser.email);
    console.log('Subscription:', businessUser.subscription);
    console.log('Current Usage:', businessUser.usage);
    console.log('Plan Limits:', businessUser.planLimits);

    // Test getSubscriptionDetails
    const subscriptionDetails = businessUser.getSubscriptionDetails();
    console.log('\n📊 Subscription Details:');
    console.log('Subscription:', subscriptionDetails.subscription);
    console.log('Usage:', subscriptionDetails.currentUsage);
    console.log('Limits:', subscriptionDetails.limits);
    console.log('Is In Trial:', subscriptionDetails.isInTrial);
    console.log('Trial Expired:', subscriptionDetails.trialExpired);

    // Test checkUsageLimit for seoTools
    const canUseSeoTools = businessUser.checkUsageLimit('seoTools');
    console.log('\n🔒 Can Use SEO Tools:', canUseSeoTools);

    // Test hasPermission
    const hasPermission = businessUser.hasPermission('canUseSeoTools');
    console.log('Has Permission:', hasPermission);

    // Test feature access
    const hasFeatureAccess = businessUser.hasFeatureAccess('canUseSeoTools');
    console.log('Has Feature Access:', hasFeatureAccess);

    // Check if planLimits are properly set
    if (!businessUser.planLimits || businessUser.planLimits.tools === 5) {
      console.log('\n⚠️ Plan limits not properly set, updating...');
      businessUser.setPlanLimitsSync();
      await businessUser.save();
      console.log('✅ Plan limits updated:', businessUser.planLimits);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

debugSeoToolLimits();
