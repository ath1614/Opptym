const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PRODUCTION_API_URL = 'https://api.opptym.com/api';
const TEST_USER = {
  email: 'shrivitthalp@gmail.com',
  password: 'Baba@2281'
};

async function comprehensiveTest() {
  console.log('🚀 Starting Comprehensive Production Test...\n');
  
  try {
    // 1. Test Authentication
    console.log('1️⃣ Testing Authentication...');
    const authResponse = await fetch(`${PRODUCTION_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });

    if (!authResponse.ok) {
      console.log('❌ Authentication failed');
      return;
    }

    const authData = await authResponse.json();
    const token = authData.token;
    console.log('✅ Authentication successful');

    // 2. Test Overall Stats
    console.log('\n2️⃣ Testing Overall Stats...');
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

    // 3. Test Classification Stats
    console.log('\n3️⃣ Testing Classification Stats...');
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

    // 4. Test Bookmarklet Submission
    console.log('\n4️⃣ Testing Bookmarklet Submission...');
    const testToken = `opptym_${Date.now()}_68b93b6ab8facf963ca3bda5_${Math.random().toString(36).substr(2, 9)}`;
    
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

    const bookmarkletResponse = await fetch(`${PRODUCTION_API_URL}/submissions/bookmarklet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData)
    });

    console.log('Bookmarklet submission status:', bookmarkletResponse.status);
    if (bookmarkletResponse.ok) {
      const bookmarkletResult = await bookmarkletResponse.json();
      console.log('✅ Bookmarklet submission working:', JSON.stringify(bookmarkletResult, null, 2));
    } else {
      const error = await bookmarkletResponse.text();
      console.log('❌ Bookmarklet submission failed:', error);
    }

    // 5. Test Regular Submissions
    console.log('\n5️⃣ Testing Regular Submissions...');
    const regularSubmissionsResponse = await fetch(`${PRODUCTION_API_URL}/submissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Regular submissions status:', regularSubmissionsResponse.status);
    if (regularSubmissionsResponse.ok) {
      const regularSubmissions = await regularSubmissionsResponse.json();
      console.log('✅ Regular submissions working, count:', regularSubmissions.length);
    } else {
      const error = await regularSubmissionsResponse.text();
      console.log('❌ Regular submissions failed:', error);
    }

  } catch (error) {
    console.error('❌ Comprehensive test failed:', error.message);
  }

  console.log('\n✅ Comprehensive Production Test Complete!');
}

comprehensiveTest();
