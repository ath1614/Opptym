const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PRODUCTION_API_URL = 'https://api.opptym.com/api';
const TEST_USER = {
  email: 'shrivitthalp@gmail.com',
  password: 'Baba@2281'
};

async function testClassificationFiltering() {
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
    
    console.log('🔍 Testing Classification Filtering...');
    console.log(`📊 User: ${decoded.email}`);
    console.log(`📊 User ID: ${decoded.userId}`);
    
    // Test different classification filters
    const classifications = [
      'Article Submission',
      'Directory Submission', 
      'Press Release',
      'BookMarking',
      'Business Listing',
      'Classified',
      'Forum',
      'Social Media',
      'Local Business',
      'Citation',
      'Web 2.0',
      'Q&A'
    ];
    
    for (const classification of classifications) {
      console.log(`\n📊 Testing classification: ${classification}`);
      
      const response = await fetch(`${PRODUCTION_API_URL}/submissions?classification=${encodeURIComponent(classification)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const submissions = await response.json();
        console.log(`✅ ${classification}: ${submissions.length} submissions`);
        
        // Show submission types for verification
        const types = [...new Set(submissions.map(s => s.submissionType))];
        console.log(`   Submission types: ${types.join(', ')}`);
        
        // Show status breakdown
        const statusCounts = {};
        submissions.forEach(s => {
          statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
        });
        console.log(`   Status breakdown:`, statusCounts);
      } else {
        const error = await response.text();
        console.log(`❌ ${classification} failed:`, error);
      }
    }
    
    // Test direct submissionType filtering
    console.log('\n📊 Testing direct submissionType filtering...');
    const submissionTypes = ['article', 'directory', 'bookmarklet', 'classified', 'forum', 'social', 'local', 'citation', 'web2', 'qa'];
    
    for (const type of submissionTypes) {
      console.log(`\n📊 Testing submissionType: ${type}`);
      
      const response = await fetch(`${PRODUCTION_API_URL}/submissions?submissionType=${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const submissions = await response.json();
        console.log(`✅ ${type}: ${submissions.length} submissions`);
      } else {
        const error = await response.text();
        console.log(`❌ ${type} failed:`, error);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testClassificationFiltering();
