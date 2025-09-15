const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PRODUCTION_API_URL = 'https://api.opptym.com/api';
const TEST_USER = {
  email: 'shrivitthalp@gmail.com',
  password: 'Baba@2281'
};

async function testFixedBookmarklet() {
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
    
    console.log('📊 Testing Fixed Bookmarklet...');
    console.log(`📊 User: ${decoded.email}`);
    console.log(`📊 User ID: ${decoded.userId}`);
    
    // Test bookmarklet submission with fixed field mapping
    const testSubmission = {
      token: `opptym_${Date.now()}_${decoded.userId}_test`,
      url: 'https://test-directory.com/submit',
      fieldsFilled: 5,
      filledFields: [
        { selector: 'input[name="name"]', fieldType: 'Name', value: 'Test Name' },
        { selector: 'input[type="email"]', fieldType: 'Email', value: 'test@example.com' },
        { selector: 'input[type="tel"]', fieldType: 'Phone', value: '+1234567890' },
        { selector: 'input[type="url"]', fieldType: 'Website URL', value: 'https://test.com' },
        { selector: 'textarea[name*="description"]', fieldType: 'Description', value: 'Test description' }
      ],
      timestamp: new Date().toISOString(),
      source: 'bookmarklet-fixed'
    };
    
    console.log('\n📊 Testing Bookmarklet Submission...');
    const submissionResponse = await fetch(`${PRODUCTION_API_URL}/submissions/bookmarklet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testSubmission)
    });

    console.log('Bookmarklet submission status:', submissionResponse.status);
    
    if (submissionResponse.ok) {
      const result = await submissionResponse.json();
      console.log('✅ Bookmarklet submission successful:', result);
    } else {
      const error = await submissionResponse.text();
      console.log('❌ Bookmarklet submission failed:', error);
    }

    // Test subscription details after submission
    console.log('\n📊 Testing Subscription Details...');
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
    console.error('❌ Test failed:', error.message);
  }
}

testFixedBookmarklet();
