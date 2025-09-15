const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Production API endpoints
const PRODUCTION_API_URL = 'https://api.opptym.com/api';

// Test user credentials (using the account you provided)
const TEST_USER = {
  email: 'shrivitthalp@gmail.com',
  password: 'Baba@2281'
};

async function authenticateUser() {
  try {
    console.log('🔐 Authenticating with production API...');
    
    const response = await fetch(`${PRODUCTION_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_USER)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Login failed: ${response.status} - ${errorData.message}`);
    }

    const data = await response.json();
    console.log('✅ Authentication successful');
    return data.token;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    return null;
  }
}

async function testOverallStats(token) {
  console.log('\n📊 Testing Overall Statistics...');
  
  try {
    const response = await fetch(`${PRODUCTION_API_URL}/submissions/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Stats request failed: ${response.status}`);
    }

    const stats = await response.json();
    console.log('✅ Overall Stats Response:');
    console.log(JSON.stringify(stats, null, 2));

    // Verify structure
    const requiredFields = ['overall', 'byClassification'];
    const overallRequired = ['total', 'recent', 'byStatus', 'successRate'];
    const statusRequired = ['pending', 'approved', 'rejected', 'completed'];

    // Check overall structure
    requiredFields.forEach(field => {
      if (!stats[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    });

    // Check overall stats structure
    overallRequired.forEach(field => {
      if (stats.overall[field] === undefined) {
        throw new Error(`Missing overall field: ${field}`);
      }
    });

    // Check status counts
    statusRequired.forEach(status => {
      if (stats.overall.byStatus[status] === undefined) {
        throw new Error(`Missing status: ${status}`);
      }
    });

    console.log('✅ Overall stats structure is correct');
    console.log(`📊 Total submissions: ${stats.overall.total}`);
    console.log(`📊 Recent submissions: ${stats.overall.recent}`);
    console.log(`📊 Success rate: ${stats.overall.successRate}%`);
    console.log(`📊 Status breakdown:`, stats.overall.byStatus);

    return stats;
  } catch (error) {
    console.error('❌ Overall stats test failed:', error.message);
    return null;
  }
}

async function testClassificationStats(token) {
  console.log('\n📊 Testing Classification-Specific Statistics...');
  
  const classifications = ['directory', 'article', 'bookmarklet', 'classified', 'forum', 'social', 'local', 'citation', 'web2', 'qa'];
  
  for (const type of classifications) {
    try {
      console.log(`\n🔍 Testing ${type} stats...`);
      
      const response = await fetch(`${PRODUCTION_API_URL}/submissions/stats/${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log(`⚠️ ${type} stats not available (${response.status})`);
        continue;
      }

      const stats = await response.json();
      console.log(`✅ ${type} Stats:`, JSON.stringify(stats, null, 2));

      // Verify structure
      const requiredFields = ['type', 'total', 'recent', 'byStatus', 'successRate'];
      const statusRequired = ['pending', 'approved', 'rejected', 'completed'];

      requiredFields.forEach(field => {
        if (stats[field] === undefined) {
          throw new Error(`Missing field in ${type}: ${field}`);
        }
      });

      statusRequired.forEach(status => {
        if (stats.byStatus[status] === undefined) {
          throw new Error(`Missing status in ${type}: ${status}`);
        }
      });

      console.log(`✅ ${type} stats structure is correct`);
      console.log(`📊 ${type} total: ${stats.total}, success rate: ${stats.successRate}%`);

    } catch (error) {
      console.error(`❌ ${type} stats test failed:`, error.message);
    }
  }
}

async function testBookmarkletSubmission(token) {
  console.log('\n🔗 Testing Bookmarklet Submission...');
  
  try {
    // Generate a test token (this would normally come from the frontend)
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

    const response = await fetch(`${PRODUCTION_API_URL}/submissions/bookmarklet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Bookmarklet submission successful:', result.message);
    } else {
      console.log('❌ Bookmarklet submission failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Bookmarklet submission test failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Production Stats System Audit...\n');
  
  const token = await authenticateUser();
  if (!token) {
    console.log('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  // Test overall stats
  await testOverallStats(token);

  // Test classification-specific stats
  await testClassificationStats(token);

  // Test bookmarklet submission
  await testBookmarkletSubmission(token);

  console.log('\n✅ Production Stats System Audit Complete!');
}

main().catch(error => {
  console.error('❌ Audit failed:', error);
  process.exit(1);
});
