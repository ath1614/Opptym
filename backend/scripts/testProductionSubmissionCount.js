const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PRODUCTION_API_URL = 'https://api.opptym.com/api';
const TEST_USER = {
  email: 'shrivitthalp@gmail.com',
  password: 'Baba@2281'
};

async function testProductionSubmissionCount() {
  try {
    // Authenticate
    const authResponse = await fetch(`${PRODUCTION_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });

    if (!authResponse.ok) {
      throw new Error('Authentication failed');
    }

    const authData = await authResponse.json();
    const token = authData.token;
    
    // Decode JWT to get user ID
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    const userId = decoded.userId;
    
    console.log('📊 Testing Production Submission Count...');
    console.log(`📊 User ID: ${userId}`);
    console.log(`📊 User subscription: ${decoded.subscription}`);
    
    // Test overall stats
    console.log('\n📊 Testing Overall Statistics...');
    const overallStatsResponse = await fetch(`${PRODUCTION_API_URL}/submissions/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Overall stats status:', overallStatsResponse.status);
    if (overallStatsResponse.ok) {
      const overallStats = await overallStatsResponse.json();
      console.log('✅ Overall stats working:', JSON.stringify(overallStats, null, 2));
    } else {
      const error = await overallStatsResponse.text();
      console.log('❌ Overall stats failed:', error);
    }

    // Test regular submissions endpoint
    console.log('\n📊 Testing Regular Submissions...');
    const regularSubmissionsResponse = await fetch(`${PRODUCTION_API_URL}/submissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Regular submissions status:', regularSubmissionsResponse.status);
    if (regularSubmissionsResponse.ok) {
      const regularSubmissions = await regularSubmissionsResponse.json();
      console.log(`✅ Regular submissions working, count: ${regularSubmissions.length}`);
    } else {
      const error = await regularSubmissionsResponse.text();
      console.log('❌ Regular submissions failed:', error);
    }

    // Test subscription details
    console.log('\n📊 Testing Subscription Details...');
    const subscriptionResponse = await fetch(`${PRODUCTION_API_URL}/subscription/details`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Subscription details status:', subscriptionResponse.status);
    if (subscriptionResponse.ok) {
      const subscriptionData = await subscriptionResponse.json();
      console.log('✅ Subscription details:', JSON.stringify(subscriptionData, null, 2));
    } else {
      const error = await subscriptionResponse.text();
      console.log('❌ Subscription details failed:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProductionSubmissionCount();
