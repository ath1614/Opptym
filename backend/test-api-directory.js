#!/usr/bin/env node

/**
 * Test script to verify directory creation API endpoint
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('./models/userModel');

async function testDirectoryAPI() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clean up any existing test user first
    await User.deleteOne({ email: 'apitest@test.com' });
    
    // Create a test admin user
    const testUser = new User({
      username: 'apitest',
      email: 'apitest@test.com',
      password: 'testpassword123',
      firstName: 'API',
      lastName: 'Test',
      subscription: 'enterprise',
      role: 'admin'
    });
    
    await testUser.save();
    console.log('✅ Test admin user created');

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'opptym-development-jwt-secret-key-2024';
    const token = jwt.sign(
      { userId: testUser._id, email: testUser.email, role: testUser.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('✅ JWT token generated');

    // Test directory creation API
    const directoryData = {
      name: 'API Test Directory',
      domain: 'apitest.com',
      description: 'A test directory via API',
      category: 'business',
      country: 'Global',
      classification: 'Directory Submission',
      pageRank: 3,
      daScore: 30,
      spamScore: 2,
      isPremium: false,
      requiresApproval: true,
      submissionUrl: 'https://apitest.com/submit',
      contactEmail: 'admin@apitest.com',
      submissionGuidelines: 'Please follow our guidelines',
      priority: 10,
      freeUserLimit: 0,
      starterUserLimit: 5,
      proUserLimit: 20,
      businessUserLimit: 50,
      enterpriseUserLimit: -1
    };

    try {
      const response = await axios.post('http://localhost:3000/api/admin/directories', directoryData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Directory created via API:', {
        status: response.status,
        data: response.data
      });

    } catch (error) {
      console.error('❌ API call failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }

    // Clean up
    await User.deleteOne({ _id: testUser._id });
    console.log('✅ Test data cleaned up');

    await mongoose.connection.close();
    console.log('✅ API test completed');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDirectoryAPI();
