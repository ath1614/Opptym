const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PRODUCTION_API_URL = 'https://api.opptym.com/api';
const TEST_USER = {
  email: 'shrivitthalp@gmail.com',
  password: 'Baba@2281'
};

async function testBookmarkletSecurity() {
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
    
    console.log('🔒 Testing Bookmarklet Security Measures...');
    console.log(`📊 User: ${decoded.email}`);
    console.log(`📊 User ID: ${decoded.userId}`);
    console.log(`📊 Subscription: ${decoded.subscription}`);
    
    // Test 1: First bookmarklet submission (should work)
    console.log('\n🔒 Test 1: First bookmarklet submission...');
    const testToken1 = `opptym_${Date.now()}_${decoded.userId}_test1`;
    
    const submission1 = {
      token: testToken1,
      url: 'https://test-directory1.com/submit',
      fieldsFilled: 3,
      filledFields: [
        { selector: 'input[name="name"]', fieldType: 'Name', value: 'Test Name' },
        { selector: 'input[type="email"]', fieldType: 'Email', value: 'test@example.com' },
        { selector: 'input[type="tel"]', fieldType: 'Phone', value: '+1234567890' }
      ],
      timestamp: new Date().toISOString(),
      source: 'bookmarklet-security-test'
    };
    
    const response1 = await fetch(`${PRODUCTION_API_URL}/submissions/bookmarklet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission1)
    });
    
    console.log('First submission status:', response1.status);
    if (response1.ok) {
      console.log('✅ First submission successful');
    } else {
      const error1 = await response1.text();
      console.log('❌ First submission failed:', error1);
    }
    
    // Test 2: Reuse same token (should fail for free users, work for paid users)
    console.log('\n🔒 Test 2: Reusing same token...');
    const submission2 = {
      token: testToken1, // Same token
      url: 'https://test-directory2.com/submit',
      fieldsFilled: 2,
      filledFields: [
        { selector: 'input[name="name"]', fieldType: 'Name', value: 'Test Name 2' },
        { selector: 'input[type="email"]', fieldType: 'Email', value: 'test2@example.com' }
      ],
      timestamp: new Date().toISOString(),
      source: 'bookmarklet-security-test'
    };
    
    const response2 = await fetch(`${PRODUCTION_API_URL}/submissions/bookmarklet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission2)
    });
    
    console.log('Token reuse status:', response2.status);
    if (response2.ok) {
      console.log('✅ Token reuse allowed (paid user)');
    } else {
      const error2 = await response2.text();
      console.log('❌ Token reuse blocked:', error2);
    }
    
    // Test 3: Create multiple different tokens (test daily limit)
    console.log('\n🔒 Test 3: Testing daily limit with multiple tokens...');
    const maxTests = decoded.subscription === 'free' ? 5 : 25; // Test beyond limits
    
    for (let i = 3; i <= maxTests; i++) {
      const testToken = `opptym_${Date.now()}_${decoded.userId}_test${i}`;
      
      const submission = {
        token: testToken,
        url: `https://test-directory${i}.com/submit`,
        fieldsFilled: 1,
        filledFields: [
          { selector: 'input[name="name"]', fieldType: 'Name', value: `Test Name ${i}` }
        ],
        timestamp: new Date().toISOString(),
        source: 'bookmarklet-security-test'
      };
      
      const response = await fetch(`${PRODUCTION_API_URL}/submissions/bookmarklet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      });
      
      console.log(`Submission ${i} status:`, response.status);
      
      if (!response.ok) {
        const error = await response.text();
        console.log(`❌ Submission ${i} blocked:`, error);
        break; // Stop testing once we hit a limit
      } else {
        console.log(`✅ Submission ${i} successful`);
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Test 4: Check subscription details
    console.log('\n🔒 Test 4: Checking subscription details...');
    const subscriptionResponse = await fetch(`${PRODUCTION_API_URL}/subscription/details`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (subscriptionResponse.ok) {
      const subscriptionData = await subscriptionResponse.json();
      console.log('✅ Subscription details:', JSON.stringify(subscriptionData.currentUsage, null, 2));
    }

  } catch (error) {
    console.error('❌ Security test failed:', error.message);
  }
}

testBookmarkletSecurity();
