#!/usr/bin/env node

/**
 * Test Analytics API Endpoint
 * Test the actual API endpoint to see what's causing the 500 error
 */

const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/opptym', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testAnalyticsAPI() {
  console.log('🔍 TESTING ANALYTICS API ENDPOINT');
  console.log('==================================\n');

  try {
    // Find a test user
    const testUser = await User.findOne();
    if (!testUser) {
      console.log('❌ No users found in database');
      return;
    }

    console.log('👤 Test User:', testUser.email);

    // Create a JWT token
    const jwtSecret = process.env.JWT_SECRET || 'opptym-development-jwt-secret-key-2024';
    const token = jwt.sign(
      { userId: testUser._id.toString() },
      jwtSecret,
      { expiresIn: '1h' }
    );

    console.log('🔑 Token created:', token.substring(0, 20) + '...');

    // Test the analytics endpoint
    console.log('\n🌐 Testing API endpoint...');
    
    try {
      const response = await axios.get('http://localhost:3000/api/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ API Response Status:', response.status);
      console.log('✅ API Response Data:', JSON.stringify(response.data, null, 2));

    } catch (apiError) {
      console.error('❌ API Error Status:', apiError.response?.status);
      console.error('❌ API Error Data:', apiError.response?.data);
      console.error('❌ API Error Message:', apiError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testAnalyticsAPI();
