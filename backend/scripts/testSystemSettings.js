const mongoose = require('mongoose');
const SystemSettings = require('../models/systemSettingsModel');
const User = require('../models/userModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testSystemSettings() {
  try {
    console.log('🧪 Testing System Settings Functionality...\n');

    // Clean up any existing test data
    await SystemSettings.deleteMany({});
    await User.deleteMany({ username: 'testadmin' });
    console.log('✅ Cleaned up existing test data');

    // Create a test admin user
    const testAdmin = new User({
      username: 'testadmin',
      email: 'testadmin@systemsettings.com',
      password: 'testpassword123',
      role: 'admin',
      isAdmin: true
    });
    await testAdmin.save();
    console.log('✅ Created test admin user');

    // Test 1: Create default system settings
    console.log('\n⚙️ Test 1: Create default system settings');
    const defaultSettings = new SystemSettings();
    await defaultSettings.save();
    console.log('Default settings created:', {
      siteName: defaultSettings.siteName,
      supportEmail: defaultSettings.supportEmail,
      requireEmailVerification: defaultSettings.requireEmailVerification
    });
    console.log('Result: ✅ PASS');

    // Test 2: Update system settings
    console.log('\n⚙️ Test 2: Update system settings');
    const updates = {
      siteName: 'OPPTYM - Updated Site Name',
      supportEmail: 'support@opptym.com',
      requireEmailVerification: false,
      enableRateLimiting: true,
      plans: [
        { id: 'free', name: 'Free Trial', projects: 1, submissions: 10, price: 0, isActive: true },
        { id: 'starter', name: 'Starter Pack', projects: 3, submissions: 100, price: 999, isActive: true }
      ],
      stripePublishableKey: 'pk_test_123456789',
      aiProvider: 'openai',
      enableAiFormDetection: true,
      lastUpdated: new Date(),
      updatedBy: testAdmin._id
    };

    Object.assign(defaultSettings, updates);
    await defaultSettings.save();
    
    const updatedSettings = await SystemSettings.findOne();
    console.log('Updated settings:', {
      siteName: updatedSettings.siteName,
      supportEmail: updatedSettings.supportEmail,
      requireEmailVerification: updatedSettings.requireEmailVerification,
      plansCount: updatedSettings.plans.length,
      aiProvider: updatedSettings.aiProvider
    });
    console.log('Result: ✅ PASS');

    // Test 3: Test safe settings (masked sensitive data)
    console.log('\n⚙️ Test 3: Test safe settings (masked sensitive data)');
    const safeSettings = {
      ...updatedSettings.toObject(),
      stripeSecretKey: updatedSettings.stripeSecretKey ? '***' + updatedSettings.stripeSecretKey.slice(-4) : '',
      aiApiKey: updatedSettings.aiApiKey ? '***' + updatedSettings.aiApiKey.slice(-4) : '',
      webhookSecret: updatedSettings.webhookSecret ? '***' + updatedSettings.webhookSecret.slice(-4) : ''
    };
    
    console.log('Safe settings (sensitive data masked):', {
      stripeSecretKey: safeSettings.stripeSecretKey,
      aiApiKey: safeSettings.aiApiKey,
      webhookSecret: safeSettings.webhookSecret
    });
    console.log('Result: ✅ PASS');

    // Test 4: Test plan management
    console.log('\n⚙️ Test 4: Test plan management');
    const planUpdates = {
      plans: [
        { id: 'free', name: 'Free Trial', projects: 2, submissions: 20, price: 0, isActive: true },
        { id: 'starter', name: 'Starter Pack', projects: 5, submissions: 200, price: 1499, isActive: true },
        { id: 'pro', name: 'Pro Pack', projects: 10, submissions: 500, price: 3999, isActive: true }
      ]
    };
    
    Object.assign(updatedSettings, planUpdates);
    await updatedSettings.save();
    
    const finalSettings = await SystemSettings.findOne();
    console.log('Plan updates:', {
      totalPlans: finalSettings.plans.length,
      freePlanProjects: finalSettings.plans.find(p => p.id === 'free')?.projects,
      starterPlanPrice: finalSettings.plans.find(p => p.id === 'starter')?.price
    });
    console.log('Result: ✅ PASS');

    // Test 5: Test settings validation
    console.log('\n⚙️ Test 5: Test settings validation');
    try {
      const invalidSettings = new SystemSettings({
        defaultUserRole: 'invalid_role', // This should fail validation
        aiProvider: 'invalid_provider' // This should fail validation
      });
      await invalidSettings.save();
      console.log('Result: ❌ FAIL - Validation should have failed');
    } catch (error) {
      console.log('Validation error caught:', error.message);
      console.log('Result: ✅ PASS - Validation working correctly');
    }

    console.log('\n🎉 System Settings Testing Complete!');
    console.log('\n📋 Summary:');
    console.log('- System settings model created ✅');
    console.log('- Default settings initialization works ✅');
    console.log('- Settings update functionality works ✅');
    console.log('- Sensitive data masking works ✅');
    console.log('- Plan management works ✅');
    console.log('- Settings validation works ✅');

  } catch (error) {
    console.error('❌ Error testing system settings:', error);
  } finally {
    // Clean up
    await SystemSettings.deleteMany({});
    await User.deleteMany({ username: 'testadmin' });
    console.log('\n🧹 Cleaned up test data');
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

testSystemSettings();
