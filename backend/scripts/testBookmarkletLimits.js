const mongoose = require('mongoose');
const User = require('../models/userModel');
const Submission = require('../models/submissionModel');
require('dotenv').config();

async function testBookmarkletLimits() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym');
    console.log('✅ Connected to MongoDB');

    // Find a free user to test with
    const freeUser = await User.findOne({ subscription: 'free' });
    if (!freeUser) {
      console.log('❌ No free user found for testing');
      return;
    }

    console.log(`\n🔍 Testing with free user: ${freeUser.email}`);
    console.log(`📊 Current usage:`, freeUser.usage);
    console.log(`📅 Trial period:`, freeUser.isInTrialPeriod() ? 'Active' : 'Expired');
    console.log(`📅 Trial days left:`, freeUser.getTrialDaysLeft());

    // Test submission limits
    console.log(`\n📋 Submission limits check:`);
    console.log(`- Can make submissions: ${freeUser.canMakeSubmissions()}`);
    console.log(`- Check usage limit: ${freeUser.checkUsageLimit('submissions')}`);
    console.log(`- Plan limits:`, freeUser.planLimits);

    // Count existing bookmarklet submissions
    const bookmarkletSubmissions = await Submission.countDocuments({
      userId: freeUser._id,
      submissionType: 'bookmarklet'
    });

    console.log(`\n🔗 Bookmarklet submissions count: ${bookmarkletSubmissions}`);

    // Test bookmarklet limits (from submissionController.js)
    const userPlan = freeUser.subscription || 'free';
    const maxUsesPerBookmarklet = userPlan === 'free' ? 1 : 5;
    const maxBookmarkletsPerDay = userPlan === 'free' ? 3 : 20;

    console.log(`\n📊 Bookmarklet limits for ${userPlan} plan:`);
    console.log(`- Max uses per bookmarklet: ${maxUsesPerBookmarklet}`);
    console.log(`- Max bookmarklets per day: ${maxBookmarkletsPerDay}`);

    // Count today's bookmarklet submissions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookmarklets = await Submission.countDocuments({
      userId: freeUser._id,
      submissionType: 'bookmarklet',
      submittedAt: { $gte: today, $lt: tomorrow }
    });

    console.log(`- Today's bookmarklet submissions: ${todayBookmarklets}`);

    // Test if user can create more bookmarklets
    const canCreateMore = todayBookmarklets < maxBookmarkletsPerDay;
    console.log(`- Can create more bookmarklets today: ${canCreateMore}`);

    // Test form filling data structure
    console.log(`\n📝 Sample form data structure:`);
    const sampleProjectData = {
      name: 'Test User',
      businessName: 'Test Company',
      company: 'Test Company',
      email: 'test@example.com',
      phone: '+1234567890',
      url: 'https://example.com',
      description: 'Test description',
      address: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      zip: '12345'
    };
    console.log(JSON.stringify(sampleProjectData, null, 2));

    console.log(`\n✅ Bookmarklet limits test completed`);

  } catch (error) {
    console.error('❌ Error testing bookmarklet limits:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testBookmarkletLimits();
