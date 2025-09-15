const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PRODUCTION_API_URL = 'https://api.opptym.com/api';
const TEST_USER = {
  email: 'shrivitthalp@gmail.com',
  password: 'Baba@2281'
};

async function testBookmarkletLimitsWithRealUser() {
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
    
    console.log('Testing bookmarklet limits for user:', userId);
    console.log('User subscription:', decoded.subscription);
    
    // Generate a test token with real user ID
    const testToken = `opptym_${Date.now()}_${userId}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('\n🔍 Testing bookmarklet usage limits...');
    
    // Test multiple submissions with the same token
    for (let i = 1; i <= 7; i++) { // Test up to 7 submissions
      console.log(`\n📤 Testing submission ${i}/7...`);
      
      const submissionData = {
        token: testToken,
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
        const response = await fetch(`${PRODUCTION_API_URL}/submissions/bookmarklet`, {
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
          
          if (result.error.includes('limit exceeded')) {
            console.log(`✅ Correctly blocked submission ${i} (limit exceeded)`);
          } else if (result.error.includes('expired')) {
            console.log(`✅ Correctly blocked submission ${i} (token expired)`);
          } else if (result.error.includes('Invalid token')) {
            console.log(`✅ Correctly blocked submission ${i} (invalid token)`);
          } else {
            console.log(`❌ Unexpected error for submission ${i}`);
          }
        }
      } catch (error) {
        console.error(`❌ Network error for submission ${i}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBookmarkletLimitsWithRealUser();
