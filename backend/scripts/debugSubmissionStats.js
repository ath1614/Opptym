const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PRODUCTION_API_URL = 'https://api.opptym.com/api';
const TEST_USER = {
  email: 'shrivitthalp@gmail.com',
  password: 'Baba@2281'
};

async function debugSubmissionStats() {
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
    
    console.log('🔍 Debugging Submission Stats...');
    console.log(`📊 User: ${decoded.email}`);
    console.log(`📊 User ID: ${decoded.userId}`);
    
    // Get all submissions to analyze
    console.log('\n🔍 Getting all submissions...');
    const allSubmissionsResponse = await fetch(`${PRODUCTION_API_URL}/submissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (allSubmissionsResponse.ok) {
      const allSubmissions = await allSubmissionsResponse.json();
      console.log(`✅ Total submissions retrieved: ${allSubmissions.length}`);
      
      // Analyze each submission in detail
      console.log('\n🔍 Detailed submission analysis:');
      allSubmissions.forEach((submission, index) => {
        console.log(`\n📊 Submission ${index + 1}:`);
        console.log(`   ID: ${submission._id}`);
        console.log(`   Type: ${submission.submissionType}`);
        console.log(`   Status: ${submission.status}`);
        console.log(`   Site: ${submission.siteName}`);
        console.log(`   Created: ${submission.createdAt || submission.submittedAt}`);
        console.log(`   User ID: ${submission.userId}`);
      });
      
      // Group by submission type
      const typeGroups = {};
      allSubmissions.forEach(submission => {
        const type = submission.submissionType || 'unknown';
        if (!typeGroups[type]) {
          typeGroups[type] = [];
        }
        typeGroups[type].push(submission);
      });
      
      console.log('\n📊 Submissions grouped by type:');
      Object.keys(typeGroups).forEach(type => {
        console.log(`   ${type}: ${typeGroups[type].length} submissions`);
        typeGroups[type].forEach(sub => {
          console.log(`     - ${sub.siteName} (${sub.status}) - ${sub.createdAt || sub.submittedAt}`);
        });
      });
      
      // Check for any submissions that might be incorrectly categorized
      console.log('\n🔍 Checking for potential categorization issues...');
      const suspiciousSubmissions = allSubmissions.filter(sub => {
        // Check if bookmarklet submissions are being counted as other types
        return sub.submissionType === 'bookmarklet' && 
               (sub.siteName.includes('article') || 
                sub.siteName.includes('directory') ||
                sub.metadata?.source === 'article' ||
                sub.metadata?.source === 'directory');
      });
      
      if (suspiciousSubmissions.length > 0) {
        console.log(`⚠️ Found ${suspiciousSubmissions.length} potentially misclassified submissions:`);
        suspiciousSubmissions.forEach(sub => {
          console.log(`   - ${sub._id}: ${sub.submissionType} -> ${sub.siteName}`);
          console.log(`     Metadata: ${JSON.stringify(sub.metadata)}`);
        });
      } else {
        console.log('✅ No obviously misclassified submissions found');
      }
    } else {
      const error = await allSubmissionsResponse.text();
      console.log('❌ Failed to get submissions:', error);
    }

    // Test specific classification stats
    console.log('\n🔍 Testing specific classification stats...');
    const classifications = ['article', 'directory', 'bookmarklet'];
    
    for (const classification of classifications) {
      console.log(`\n📊 Testing ${classification} stats...`);
      const statsResponse = await fetch(`${PRODUCTION_API_URL}/submissions/stats/${classification}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        console.log(`✅ ${classification} stats:`, JSON.stringify(stats, null, 2));
      } else {
        const error = await statsResponse.text();
        console.log(`❌ ${classification} stats failed:`, error);
      }
    }

    // Test overall stats
    console.log('\n🔍 Testing overall stats...');
    const overallStatsResponse = await fetch(`${PRODUCTION_API_URL}/submissions/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (overallStatsResponse.ok) {
      const overallStats = await overallStatsResponse.json();
      console.log('✅ Overall stats:', JSON.stringify(overallStats, null, 2));
    } else {
      const error = await overallStatsResponse.text();
      console.log('❌ Overall stats failed:', error);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugSubmissionStats();
