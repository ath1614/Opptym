const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PRODUCTION_API_URL = 'https://api.opptym.com/api';
const TEST_USER = {
  email: 'shrivitthalp@gmail.com',
  password: 'Baba@2281'
};

async function auditStatsCalculation() {
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
    
    console.log('📊 Auditing Stats Calculation System...');
    console.log(`📊 User: ${decoded.email}`);
    console.log(`📊 User ID: ${decoded.userId}`);
    console.log(`📊 Subscription: ${decoded.subscription}`);
    
    // Test 1: Overall Dashboard Stats
    console.log('\n📊 Test 1: Overall Dashboard Stats...');
    const overallStatsResponse = await fetch(`${PRODUCTION_API_URL}/submissions/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Overall stats status:', overallStatsResponse.status);
    if (overallStatsResponse.ok) {
      const overallStats = await overallStatsResponse.json();
      console.log('✅ Overall stats response:', JSON.stringify(overallStats, null, 2));
      
      // Validate overall stats structure
      const requiredFields = ['totalSubmissions', 'recentSubmissions', 'successRate', 'overallStats'];
      const missingFields = requiredFields.filter(field => !(field in overallStats));
      if (missingFields.length > 0) {
        console.log(`❌ Missing fields in overall stats: ${missingFields.join(', ')}`);
      } else {
        console.log('✅ Overall stats structure is correct');
      }
    } else {
      const error = await overallStatsResponse.text();
      console.log('❌ Overall stats failed:', error);
    }

    // Test 2: Classification-Specific Stats
    console.log('\n📊 Test 2: Classification-Specific Stats...');
    const submissionTypes = [
      'directory', 'article', 'bookmark', 'classified', 
      'forum', 'social', 'local', 'citation', 'web2', 'qa', 'bookmarklet'
    ];
    
    for (const type of submissionTypes) {
      console.log(`\n📊 Testing ${type} stats...`);
      
      const typeStatsResponse = await fetch(`${PRODUCTION_API_URL}/submissions/stats/${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`${type} stats status:`, typeStatsResponse.status);
      if (typeStatsResponse.ok) {
        const typeStats = await typeStatsResponse.json();
        console.log(`✅ ${type} stats:`, JSON.stringify(typeStats, null, 2));
        
        // Validate type stats structure
        const requiredFields = ['totalSubmissions', 'recentSubmissions', 'successRate', 'typeStats'];
        const missingFields = requiredFields.filter(field => !(field in typeStats));
        if (missingFields.length > 0) {
          console.log(`❌ Missing fields in ${type} stats: ${missingFields.join(', ')}`);
        } else {
          console.log(`✅ ${type} stats structure is correct`);
        }
      } else {
        const error = await typeStatsResponse.text();
        console.log(`❌ ${type} stats failed:`, error);
      }
    }

    // Test 3: Regular Submissions Endpoint (for comparison)
    console.log('\n📊 Test 3: Regular Submissions Endpoint...');
    const regularSubmissionsResponse = await fetch(`${PRODUCTION_API_URL}/submissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Regular submissions status:', regularSubmissionsResponse.status);
    if (regularSubmissionsResponse.ok) {
      const regularSubmissions = await regularSubmissionsResponse.json();
      console.log(`✅ Regular submissions count: ${regularSubmissions.length}`);
      
      // Analyze submission types
      const typeCounts = {};
      regularSubmissions.forEach(submission => {
        const type = submission.submissionType || 'unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      
      console.log('📊 Submission type breakdown:', typeCounts);
      
      // Analyze submission statuses
      const statusCounts = {};
      regularSubmissions.forEach(submission => {
        const status = submission.status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      console.log('📊 Submission status breakdown:', statusCounts);
    } else {
      const error = await regularSubmissionsResponse.text();
      console.log('❌ Regular submissions failed:', error);
    }

    // Test 4: Analytics Dashboard Endpoint
    console.log('\n📊 Test 4: Analytics Dashboard Endpoint...');
    const analyticsResponse = await fetch(`${PRODUCTION_API_URL}/analytics/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Analytics dashboard status:', analyticsResponse.status);
    if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json();
      console.log('✅ Analytics dashboard response:', JSON.stringify(analyticsData, null, 2));
      
      // Validate analytics structure
      const requiredFields = ['submissionStats', 'recentActivity', 'usageStats'];
      const missingFields = requiredFields.filter(field => !(field in analyticsData));
      if (missingFields.length > 0) {
        console.log(`❌ Missing fields in analytics: ${missingFields.join(', ')}`);
      } else {
        console.log('✅ Analytics structure is correct');
      }
    } else {
      const error = await analyticsResponse.text();
      console.log('❌ Analytics dashboard failed:', error);
    }

    // Test 5: Cross-Validation
    console.log('\n📊 Test 5: Cross-Validation of Stats...');
    
    // Get all submissions for manual calculation
    const allSubmissionsResponse = await fetch(`${PRODUCTION_API_URL}/submissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (allSubmissionsResponse.ok) {
      const allSubmissions = await allSubmissionsResponse.json();
      
      // Manual calculation
      const totalSubmissions = allSubmissions.length;
      const recentSubmissions = allSubmissions.filter(sub => {
        const subDate = new Date(sub.submittedAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return subDate >= weekAgo;
      }).length;
      
      const approvedSubmissions = allSubmissions.filter(sub => sub.status === 'approved').length;
      const successRate = totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions * 100).toFixed(2) : 0;
      
      console.log('📊 Manual calculation results:');
      console.log(`   Total submissions: ${totalSubmissions}`);
      console.log(`   Recent submissions (7 days): ${recentSubmissions}`);
      console.log(`   Approved submissions: ${approvedSubmissions}`);
      console.log(`   Success rate: ${successRate}%`);
      
      // Compare with API results
      if (overallStatsResponse.ok) {
        const overallStats = await overallStatsResponse.json();
        console.log('\n📊 API vs Manual comparison:');
        console.log(`   Total: API=${overallStats.totalSubmissions}, Manual=${totalSubmissions}, Match=${overallStats.totalSubmissions === totalSubmissions}`);
        console.log(`   Recent: API=${overallStats.recentSubmissions}, Manual=${recentSubmissions}, Match=${overallStats.recentSubmissions === recentSubmissions}`);
        console.log(`   Success Rate: API=${overallStats.successRate}%, Manual=${successRate}%, Match=${Math.abs(overallStats.successRate - parseFloat(successRate)) < 0.01}`);
      }
    }

  } catch (error) {
    console.error('❌ Stats audit failed:', error.message);
  }
}

auditStatsCalculation();
