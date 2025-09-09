#!/usr/bin/env node

/**
 * Comprehensive Test Script for OPPTYM
 * Tests all critical functionality including:
 * - Directory creation
 * - Submission counter
 * - Subscription limits
 * - Custom packages
 * - Profile photo upload
 */

const mongoose = require('mongoose');
const axios = require('axios');

// Import models
const User = require('../models/userModel');
const Directory = require('../models/directoryModel');
const Project = require('../models/projectModel');
const Submission = require('../models/submissionModel');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@opptym.com';
const TEST_PASSWORD = 'testpassword123';

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}`);
  if (details) {
    console.log(`   ${details}`);
  }
  
  testResults.tests.push({ name: testName, passed, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.log('❌ Failed to connect to MongoDB:', error.message);
    return false;
  }
}

async function createTestUser() {
  try {
    // Clean up existing test user
    await User.deleteOne({ email: TEST_EMAIL });
    
    const user = new User({
      username: 'testuser',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      firstName: 'Test',
      lastName: 'User',
      subscription: 'free',
      role: 'user'
    });
    
    await user.save();
    console.log('✅ Test user created');
    return user;
  } catch (error) {
    console.log('❌ Failed to create test user:', error.message);
    return null;
  }
}

async function testDirectoryCreation() {
  console.log('\n🔍 Testing Directory Creation...');
  
  try {
    // Test 1: Create directory with valid data
    const directoryData = {
      name: 'Test Directory',
      domain: 'testdirectory.com',
      description: 'A test directory',
      category: 'business',
      country: 'Global',
      classification: 'Directory Submission',
      pageRank: 3,
      daScore: 30,
      spamScore: 2,
      isPremium: false,
      requiresApproval: true,
      submissionUrl: 'https://testdirectory.com/submit',
      contactEmail: 'admin@testdirectory.com',
      submissionGuidelines: 'Please follow our guidelines',
      priority: 10,
      freeUserLimit: 0,
      starterUserLimit: 5,
      proUserLimit: 20,
      businessUserLimit: 50,
      enterpriseUserLimit: -1
    };
    
    const directory = new Directory({
      ...directoryData,
      isCustom: true,
      createdBy: new mongoose.Types.ObjectId()
    });
    
    await directory.save();
    logTest('Directory Creation - Valid Data', true, `Created directory: ${directory.name}`);
    
    // Test 2: Try to create duplicate directory
    try {
      const duplicateDirectory = new Directory({
        ...directoryData,
        isCustom: true,
        createdBy: new mongoose.Types.ObjectId()
      });
      await duplicateDirectory.save();
      logTest('Directory Creation - Duplicate Prevention', false, 'Should have failed for duplicate name');
    } catch (error) {
      if (error.code === 11000) {
        logTest('Directory Creation - Duplicate Prevention', true, 'Correctly prevented duplicate');
      } else {
        logTest('Directory Creation - Duplicate Prevention', false, `Unexpected error: ${error.message}`);
      }
    }
    
    // Clean up
    await Directory.deleteOne({ _id: directory._id });
    
  } catch (error) {
    logTest('Directory Creation - Valid Data', false, error.message);
  }
}

async function testSubmissionCounter() {
  console.log('\n🔍 Testing Submission Counter...');
  
  try {
    const user = await User.findOne({ email: TEST_EMAIL });
    if (!user) {
      logTest('Submission Counter - User Found', false, 'Test user not found');
      return;
    }
    
    // Reset usage
    user.usage = {
      submissionsUsed: 0,
      projectsUsed: 0,
      seoToolsUsed: 0,
      apiCallsUsed: 0
    };
    await user.save();
    
    // Test 1: Check initial usage
    const initialUsage = user.usage.submissionsUsed;
    logTest('Submission Counter - Initial Usage', initialUsage === 0, `Initial usage: ${initialUsage}`);
    
    // Test 2: Increment usage
    await user.incrementUsage('submissions');
    const updatedUser = await User.findById(user._id);
    const newUsage = updatedUser.usage.submissionsUsed;
    logTest('Submission Counter - Increment Usage', newUsage === 1, `New usage: ${newUsage}`);
    
    // Test 3: Check usage limit
    const withinLimit = updatedUser.checkUsageLimit('submissions');
    logTest('Submission Counter - Usage Limit Check', withinLimit, `Within limit: ${withinLimit}`);
    
    // Test 4: Create submission record
    const submission = new Submission({
      userId: user._id,
      projectId: new mongoose.Types.ObjectId(),
      siteName: 'Test Site',
      submissionType: 'manual',
      status: 'completed',
      submittedAt: new Date()
    });
    await submission.save();
    logTest('Submission Counter - Submission Record', true, `Created submission record`);
    
    // Clean up
    await Submission.deleteOne({ _id: submission._id });
    
  } catch (error) {
    logTest('Submission Counter - General', false, error.message);
  }
}

async function testSubscriptionLimits() {
  console.log('\n🔍 Testing Subscription Limits...');
  
  try {
    const user = await User.findOne({ email: TEST_EMAIL });
    if (!user) {
      logTest('Subscription Limits - User Found', false, 'Test user not found');
      return;
    }
    
    // Test 1: Free user limits
    user.subscription = 'free';
    await user.setPlanLimits();
    const freeLimits = user.planLimits;
    logTest('Subscription Limits - Free Plan', 
      freeLimits.submissions === 5 && freeLimits.projects === 1, 
      `Free limits: ${JSON.stringify(freeLimits)}`);
    
    // Test 2: Pro user limits
    user.subscription = 'pro';
    await user.setPlanLimits();
    const proLimits = user.planLimits;
    logTest('Subscription Limits - Pro Plan', 
      proLimits.submissions === 750 && proLimits.projects === 15, 
      `Pro limits: ${JSON.stringify(proLimits)}`);
    
    // Test 3: Enterprise user limits
    user.subscription = 'enterprise';
    await user.setPlanLimits();
    const enterpriseLimits = user.planLimits;
    logTest('Subscription Limits - Enterprise Plan', 
      enterpriseLimits.submissions === -1 && enterpriseLimits.projects === -1, 
      `Enterprise limits: ${JSON.stringify(enterpriseLimits)}`);
    
    // Reset to free
    user.subscription = 'free';
    await user.setPlanLimits();
    
  } catch (error) {
    logTest('Subscription Limits - General', false, error.message);
  }
}

async function testCustomPackage() {
  console.log('\n🔍 Testing Custom Package...');
  
  try {
    const user = await User.findOne({ email: TEST_EMAIL });
    if (!user) {
      logTest('Custom Package - User Found', false, 'Test user not found');
      return;
    }
    
    // Test 1: Create custom package
    user.subscription = 'custom';
    user.customPlan = {
      name: 'Custom Test Plan',
      description: 'A custom test plan',
      price: 99.99,
      billingCycle: 'monthly',
      limits: {
        submissions: 100,
        projects: 10,
        tools: 50,
        apiCalls: 200
      },
      features: {
        canCreateProjects: true,
        canSubmitDirectories: true,
        canUseSeoTools: true,
        canAccessAnalytics: true,
        canAccessAdmin: false
      }
    };
    
    await user.setPlanLimits();
    
    // Test 2: Check custom limits
    const customLimits = user.planLimits;
    logTest('Custom Package - Limits Applied', 
      customLimits.submissions === 100 && customLimits.projects === 10, 
      `Custom limits: ${JSON.stringify(customLimits)}`);
    
    // Test 3: Check custom features
    const customFeatures = user.features;
    logTest('Custom Package - Features Applied', 
      customFeatures.canAccessAnalytics === true && customFeatures.canAccessAdmin === false, 
      `Custom features: ${JSON.stringify(customFeatures)}`);
    
    // Reset to free
    user.subscription = 'free';
    user.customPlan = undefined;
    await user.setPlanLimits();
    
  } catch (error) {
    logTest('Custom Package - General', false, error.message);
  }
}

async function testProfilePhoto() {
  console.log('\n🔍 Testing Profile Photo...');
  
  try {
    const user = await User.findOne({ email: TEST_EMAIL });
    if (!user) {
      logTest('Profile Photo - User Found', false, 'Test user not found');
      return;
    }
    
    // Test 1: Set profile photo
    const photoUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
    user.profilePhoto = photoUrl;
    await user.save();
    
    // Test 2: Verify profile photo is saved
    const updatedUser = await User.findById(user._id);
    logTest('Profile Photo - Save Photo', 
      updatedUser.profilePhoto === photoUrl, 
      'Profile photo saved successfully');
    
    // Test 3: Clear profile photo
    updatedUser.profilePhoto = '';
    await updatedUser.save();
    
    const clearedUser = await User.findById(user._id);
    logTest('Profile Photo - Clear Photo', 
      !clearedUser.profilePhoto || clearedUser.profilePhoto === '', 
      'Profile photo cleared successfully');
    
  } catch (error) {
    logTest('Profile Photo - General', false, error.message);
  }
}

async function testUsageLimitEnforcement() {
  console.log('\n🔍 Testing Usage Limit Enforcement...');
  
  try {
    const user = await User.findOne({ email: TEST_EMAIL });
    if (!user) {
      logTest('Usage Limit Enforcement - User Found', false, 'Test user not found');
      return;
    }
    
    // Set user to free plan with low limits
    user.subscription = 'free';
    user.usage = {
      submissionsUsed: 4, // Close to limit of 5
      projectsUsed: 0,
      seoToolsUsed: 0,
      apiCallsUsed: 0
    };
    await user.setPlanLimits();
    await user.save();
    
    // Test 1: Check if user can still submit (should be true)
    const canSubmit = user.checkUsageLimit('submissions');
    logTest('Usage Limit Enforcement - Within Limit', canSubmit, `Can submit: ${canSubmit}`);
    
    // Test 2: Exceed limit
    user.usage.submissionsUsed = 5; // At limit
    await user.save();
    
    const cannotSubmit = !user.checkUsageLimit('submissions');
    logTest('Usage Limit Enforcement - At Limit', cannotSubmit, `Cannot submit: ${cannotSubmit}`);
    
    // Test 3: Exceed limit
    user.usage.submissionsUsed = 6; // Over limit
    await user.save();
    
    const definitelyCannotSubmit = !user.checkUsageLimit('submissions');
    logTest('Usage Limit Enforcement - Over Limit', definitelyCannotSubmit, `Definitely cannot submit: ${definitelyCannotSubmit}`);
    
    // Reset usage
    user.usage.submissionsUsed = 0;
    await user.save();
    
  } catch (error) {
    logTest('Usage Limit Enforcement - General', false, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting OPPTYM Comprehensive Tests');
  console.log('=====================================');
  
  // Connect to database
  const connected = await connectToDatabase();
  if (!connected) {
    console.log('❌ Cannot run tests without database connection');
    return;
  }
  
  // Create test user
  const user = await createTestUser();
  if (!user) {
    console.log('❌ Cannot run tests without test user');
    return;
  }
  
  // Run all tests
  await testDirectoryCreation();
  await testSubmissionCounter();
  await testSubscriptionLimits();
  await testCustomPackage();
  await testProfilePhoto();
  await testUsageLimitEnforcement();
  
  // Clean up
  await User.deleteOne({ email: TEST_EMAIL });
  await mongoose.connection.close();
  
  // Print results
  console.log('\n📊 Test Results Summary');
  console.log('======================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`   - ${test.name}: ${test.details}`);
      });
  }
  
  console.log('\n🎉 All tests completed!');
}

// Run tests
runAllTests().catch(console.error);
