const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PRODUCTION_API_URL = 'https://api.opptym.com/api';

async function testBookmarkletError() {
  try {
    // Generate a test token
    const testToken = `opptym_${Date.now()}_test_user_${Math.random().toString(36).substr(2, 9)}`;
    
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

    console.log('Testing bookmarklet submission with token:', testToken.substring(0, 30) + '...');

    const response = await fetch(`${PRODUCTION_API_URL}/submissions/bookmarklet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseData = await response.text();
    console.log('Response body:', responseData);

    if (!response.ok) {
      console.log('❌ Bookmarklet submission failed with status:', response.status);
    } else {
      console.log('✅ Bookmarklet submission successful');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBookmarkletError();
