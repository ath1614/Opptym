const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PRODUCTION_API_URL = 'https://api.opptym.com/api';
const TEST_USER = {
  email: 'shrivitthalp@gmail.com',
  password: 'Baba@2281'
};

async function testRealtimeDeltas() {
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
    
    console.log('🔍 Testing Real-time Delta Calculations...');
    console.log(`📊 User: ${decoded.email}`);
    console.log(`📊 User ID: ${decoded.userId}`);
    
    // Test different time periods
    const periods = ['7d', '30d', '90d'];
    
    for (const period of periods) {
      console.log(`\n📊 Testing ${period} period deltas...`);
      
      const response = await fetch(`${PRODUCTION_API_URL}/analytics/deltas?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${period} deltas:`, JSON.stringify(data, null, 2));
        
        // Show delta summary
        console.log(`\n📈 ${period} Delta Summary:`);
        Object.entries(data.deltas).forEach(([key, delta]) => {
          const direction = delta.direction === 'increase' ? '📈' : delta.direction === 'decrease' ? '📉' : '➡️';
          console.log(`   ${key}: ${direction} ${delta.delta.toFixed(1)}% (${delta.value} current)`);
        });
        
        // Show comparison
        console.log(`\n📊 ${period} Comparison:`);
        console.log(`   Current: ${data.comparison.current.submissions} submissions, ${data.comparison.current.successful} successful`);
        console.log(`   Previous: ${data.comparison.previous.submissions} submissions, ${data.comparison.previous.successful} successful`);
        
      } else {
        const error = await response.text();
        console.log(`❌ ${period} deltas failed:`, error);
      }
    }
    
    // Test dashboard analytics with enhanced deltas
    console.log('\n📊 Testing Enhanced Dashboard Analytics...');
    const dashboardResponse = await fetch(`${PRODUCTION_API_URL}/analytics/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('✅ Enhanced dashboard analytics:', JSON.stringify(dashboardData.analytics.deltas, null, 2));
      
      // Show enhanced delta summary
      console.log('\n📈 Enhanced Dashboard Delta Summary:');
      Object.entries(dashboardData.analytics.deltas).forEach(([key, delta]) => {
        const direction = delta.direction === 'increase' ? '📈' : delta.direction === 'decrease' ? '📉' : '➡️';
        console.log(`   ${key}: ${direction} ${delta.delta.toFixed(1)}% (${delta.value} current)`);
      });
      
    } else {
      const error = await dashboardResponse.text();
      console.log('❌ Enhanced dashboard analytics failed:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRealtimeDeltas();
