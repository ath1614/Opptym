const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PRODUCTION_API_URL = 'https://api.opptym.com/api';
const TEST_USER = {
  email: 'shrivitthalp@gmail.com',
  password: 'Baba@2281'
};

async function callFixUsageCounter() {
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
    
    // Decode JWT to get user info
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    
    console.log('📊 Calling fix usage counter endpoint...');
    console.log(`📊 User: ${decoded.email}`);
    console.log(`📊 Role: ${decoded.role}`);
    console.log(`📊 Subscription: ${decoded.subscription}`);
    
    // Call the fix usage counter endpoint
    const fixResponse = await fetch(`${PRODUCTION_API_URL}/submissions/fix-usage-counter`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Fix usage counter status:', fixResponse.status);
    
    const fixResult = await fixResponse.text();
    console.log('Fix usage counter result:', fixResult);

    if (fixResponse.ok) {
      console.log('✅ Usage counter fixed successfully!');
    } else {
      console.log('❌ Failed to fix usage counter');
    }

    // Test subscription details after fix
    console.log('\n📊 Testing Subscription Details After Fix...');
    const subscriptionResponse = await fetch(`${PRODUCTION_API_URL}/subscription/details`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (subscriptionResponse.ok) {
      const subscriptionData = await subscriptionResponse.json();
      console.log('✅ Updated subscription details:', JSON.stringify(subscriptionData.currentUsage, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

callFixUsageCounter();
