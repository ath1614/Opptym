const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import models
const User = require('../models/userModel');
const Submission = require('../models/submissionModel');

const API_BASE_URL = 'http://localhost:3000/api';

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function testBookmarkletLimits() {
  console.log('🔍 Testing Bookmarklet Usage Limits...\n');

  try {
    // Test with free user
    console.log('📊 Testing FREE USER limits...');
    const freeUser = await User.findOne({ subscription: 'free' });
    if (!freeUser) {
      console.log('⚠️ No free user found, creating one...');
      const newFreeUser = await User.create({
        email: 'test-free@test.com',
        password: 'test123',
        subscription: 'free',
        features: {
          submissions: true,
          projects: 1,
          seoTools: false,
          apiAccess: false
        },
        usage: {
          submissionsUsed: 0,
          projectsUsed: 0,
          seoToolsUsed: 0,
          apiCallsUsed: 0
        }
      });
      console.log('✅ Free user created:', newFreeUser.email);
    }

    const freeUserToTest = freeUser || await User.findOne({ subscription: 'free' });
    console.log(`📊 Testing with free user: ${freeUserToTest.email}`);

    // Test free user limit (should be 1)
    await testUserBookmarkletLimit(freeUserToTest, 1, 'free');

    // Test with paid user
    console.log('\n📊 Testing PAID USER limits...');
    const paidUser = await User.findOne({ subscription: 'paid' });
    if (!paidUser) {
      console.log('⚠️ No paid user found, creating one...');
      const newPaidUser = await User.create({
        email: 'test-paid@test.com',
        password: 'test123',
        subscription: 'paid',
        features: {
          submissions: true,
          projects: 10,
          seoTools: true,
          apiAccess: true
        },
        usage: {
          submissionsUsed: 0,
          projectsUsed: 0,
          seoToolsUsed: 0,
          apiCallsUsed: 0
        }
      });
      console.log('✅ Paid user created:', newPaidUser.email);
    }

    const paidUserToTest = paidUser || await User.findOne({ subscription: 'paid' });
    console.log(`📊 Testing with paid user: ${paidUserToTest.email}`);

    // Test paid user limit (should be 5)
    await testUserBookmarkletLimit(paidUserToTest, 5, 'paid');

  } catch (error) {
    console.error('❌ Bookmarklet limits test failed:', error);
  }
}

async function testUserBookmarkletLimit(user, expectedLimit, userType) {
  console.log(`\n🔍 Testing ${userType} user (${user.email}) - Expected limit: ${expectedLimit}`);
  
  try {
    // Clear existing bookmarklet submissions for this user
    await Submission.deleteMany({ 
      userId: user._id, 
      submissionType: 'bookmarklet' 
    });
    console.log(`✅ Cleared existing bookmarklet submissions for ${user.email}`);

    // Generate test token
    const token = `opptym_${Date.now()}_${user._id}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`📝 Generated test token: ${token}`);

    // Test submissions up to the limit
    for (let i = 1; i <= expectedLimit + 2; i++) { // Test 2 beyond limit
      console.log(`\n📤 Testing submission ${i}/${expectedLimit + 2}...`);
      
      const submissionData = {
        token: token,
        url: `https://test-directory-${i}.com`,
        fieldsFilled: 5,
        filledFields: [
          { field: 'name', value: 'Test Name' },
          { field: 'email', value: 'test@test.com' },
          { field: 'phone', value: '1234567890' },
          { field: 'url', value: 'https://test.com' },
          { field: 'description', value: 'Test description' }
        ],
        timestamp: Date.now()
      };

      try {
        const response = await fetch(`${API_BASE_URL}/submissions/bookmarklet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData)
        });

        const result = await response.json();

        if (response.ok) {
          console.log(`✅ Submission ${i} successful:`, result.message);
        } else {
          console.log(`❌ Submission ${i} failed:`, result.error);
          
          if (i > expectedLimit) {
            console.log(`✅ Correctly blocked submission ${i} (exceeds limit of ${expectedLimit})`);
          } else {
            console.log(`❌ Unexpected failure for submission ${i} (should be allowed)`);
          }
        }
      } catch (error) {
        console.error(`❌ Network error for submission ${i}:`, error.message);
      }
    }

    // Verify final count
    const finalCount = await Submission.countDocuments({
      userId: user._id,
      submissionType: 'bookmarklet',
      'metadata.token': token
    });

    console.log(`\n📊 Final bookmarklet submission count for ${user.email}: ${finalCount}`);
    
    if (finalCount === expectedLimit) {
      console.log(`✅ ${userType} user limit working correctly (${finalCount}/${expectedLimit})`);
    } else {
      console.log(`❌ ${userType} user limit not working correctly (${finalCount}/${expectedLimit})`);
    }

  } catch (error) {
    console.error(`❌ Test failed for ${userType} user:`, error);
  }
}

async function testTokenExpiration() {
  console.log('\n⏰ Testing Token Expiration...');
  
  try {
    const user = await User.findOne({ subscription: 'free' });
    if (!user) {
      console.log('⚠️ No user found for token expiration test');
      return;
    }

    // Create expired token (25 hours old)
    const expiredTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
    const expiredToken = `opptym_${expiredTimestamp}_${user._id}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`📝 Generated expired token: ${expiredToken}`);

    const submissionData = {
      token: expiredToken,
      url: 'https://test-expired.com',
      fieldsFilled: 3,
      filledFields: [
        { field: 'name', value: 'Test Name' },
        { field: 'email', value: 'test@test.com' },
        { field: 'url', value: 'https://test.com' }
      ],
      timestamp: Date.now()
    };

    const response = await fetch(`${API_BASE_URL}/submissions/bookmarklet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    });

    const result = await response.json();

    if (!response.ok && result.error.includes('expired')) {
      console.log('✅ Token expiration working correctly');
    } else {
      console.log('❌ Token expiration not working correctly');
    }

  } catch (error) {
    console.error('❌ Token expiration test failed:', error);
  }
}

async function testInvalidToken() {
  console.log('\n🔒 Testing Invalid Token...');
  
  try {
    const submissionData = {
      token: 'invalid_token_format',
      url: 'https://test-invalid.com',
      fieldsFilled: 2,
      filledFields: [
        { field: 'name', value: 'Test Name' },
        { field: 'email', value: 'test@test.com' }
      ],
      timestamp: Date.now()
    };

    const response = await fetch(`${API_BASE_URL}/submissions/bookmarklet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    });

    const result = await response.json();

    if (!response.ok && result.error.includes('Invalid token format')) {
      console.log('✅ Invalid token rejection working correctly');
    } else {
      console.log('❌ Invalid token rejection not working correctly');
    }

  } catch (error) {
    console.error('❌ Invalid token test failed:', error);
  }
}

async function main() {
  console.log('🚀 Starting Bookmarklet Limits Audit...\n');
  
  await connectDB();
  
  // Test bookmarklet limits
  await testBookmarkletLimits();
  
  // Test token expiration
  await testTokenExpiration();
  
  // Test invalid token
  await testInvalidToken();

  console.log('\n✅ Bookmarklet Limits Audit Complete!');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Audit failed:', error);
  process.exit(1);
});
