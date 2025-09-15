const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PRODUCTION_API_URL = 'https://api.opptym.com/api';
const TEST_USER = {
  email: 'shrivitthalp@gmail.com',
  password: 'Baba@2281'
};

async function decodeJWTToken() {
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
    
    console.log('JWT Token:', token);
    
    // Decode JWT (without verification for testing)
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    
    console.log('Decoded JWT:', JSON.stringify(decoded, null, 2));
    console.log('User ID from JWT:', decoded.userId);
    
    // Test bookmarklet submission with the actual user ID from JWT
    const testToken = `opptym_${Date.now()}_${decoded.userId}_${Math.random().toString(36).substr(2, 9)}`;
    
    const submissionData = {
      token: testToken,
      url: 'https://test-directory.com',
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

    console.log('\nTesting bookmarklet submission with JWT user ID:', decoded.userId);

    const bookmarkletResponse = await fetch(`${PRODUCTION_API_URL}/submissions/bookmarklet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData)
    });

    console.log('Bookmarklet submission status:', bookmarkletResponse.status);
    const bookmarkletResult = await bookmarkletResponse.text();
    console.log('Bookmarklet submission result:', bookmarkletResult);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

decodeJWTToken();
