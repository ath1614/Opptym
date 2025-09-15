const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PRODUCTION_API_URL = 'https://api.opptym.com/api';
const TEST_USER = {
  email: 'shrivitthalp@gmail.com',
  password: 'Baba@2281'
};

async function testOverallStatsWithRealUser() {
  try {
    // Authenticate to get real user ID
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
    
    console.log('Testing overall stats for user:', userId);
    console.log('User subscription:', decoded.subscription);
    
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

    // Test classification stats
    console.log('\n📊 Testing Classification Stats...');
    const classificationStatsResponse = await fetch(`${PRODUCTION_API_URL}/submissions/stats/bookmarklet`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Classification stats status:', classificationStatsResponse.status);
    if (classificationStatsResponse.ok) {
      const classificationStats = await classificationStatsResponse.json();
      console.log('✅ Classification stats working:', JSON.stringify(classificationStats, null, 2));
    } else {
      const error = await classificationStatsResponse.text();
      console.log('❌ Classification stats failed:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOverallStatsWithRealUser();
