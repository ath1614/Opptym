const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PRODUCTION_API_URL = 'https://api.opptym.com/api';
const TEST_USER = {
  email: 'shrivitthalp@gmail.com',
  password: 'Baba@2281'
};

async function testOverallStatsError() {
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

    // Test overall stats endpoint
    const statsResponse = await fetch(`${PRODUCTION_API_URL}/submissions/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', statsResponse.status);
    console.log('Response headers:', Object.fromEntries(statsResponse.headers.entries()));

    const statsData = await statsResponse.text();
    console.log('Response body:', statsData);

    if (!statsResponse.ok) {
      console.log('❌ Overall stats endpoint failed with status:', statsResponse.status);
    } else {
      console.log('✅ Overall stats endpoint working');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOverallStatsError();
