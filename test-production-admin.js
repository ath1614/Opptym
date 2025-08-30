import axios from 'axios';

async function testProductionAdmin() {
  console.log('🔍 Testing Production Admin Server...');
  
  try {
    // Test 1: Login with Admin Credentials
    console.log('📋 Test 1: Login with Admin Credentials');
    const adminEmail = 'shrivitthalp@gmail.com';
    const adminPassword = 'Baba@1234';
    
    let authToken = null;
    
    try {
      const loginResponse = await axios.post('https://api.opptym.com/api/auth/login', {
        email: adminEmail,
        password: adminPassword
      }, {
        headers: {
          'x-test-mode': 'true'
        }
      });
      
      if (loginResponse.data.success && loginResponse.data.token) {
        authToken = loginResponse.data.token;
        console.log('✅ Admin authentication successful');
      } else {
        console.log('❌ Admin authentication failed');
        return;
      }
    } catch (error) {
      console.log('❌ Admin authentication error:', error.message);
      return;
    }
    
    // Test 2: Check what admin routes exist
    console.log('📋 Test 2: Check Available Admin Routes');
    
    const routesToTest = [
      { path: '/api/admin/users', method: 'GET', name: 'Get Users' },
      { path: '/api/admin/users', method: 'POST', name: 'Create User' },
      { path: '/api/admin/users/123', method: 'PUT', name: 'Update User' },
      { path: '/api/admin/users/123', method: 'DELETE', name: 'Delete User' },
      { path: '/api/admin/directories', method: 'GET', name: 'Get Directories' },
      { path: '/api/admin/directories', method: 'POST', name: 'Create Directory' },
      { path: '/api/admin/directories/123', method: 'PUT', name: 'Update Directory' },
      { path: '/api/admin/directories/123', method: 'DELETE', name: 'Delete Directory' },
      { path: '/api/admin/stats', method: 'GET', name: 'Get Stats' },
      { path: '/api/admin/projects', method: 'GET', name: 'Get Projects' },
      { path: '/api/admin/submissions', method: 'GET', name: 'Get Submissions' }
    ];
    
    for (const route of routesToTest) {
      try {
        const response = await axios({
          method: route.method,
          url: `https://api.opptym.com${route.path}`,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'x-test-mode': 'true'
          },
          data: route.method === 'POST' || route.method === 'PUT' ? { test: 'data' } : undefined,
          validateStatus: () => true // Don't throw on any status
        });
        
        if (response.status === 404) {
          console.log(`❌ ${route.name}: Route not found (404)`);
        } else if (response.status === 405) {
          console.log(`❌ ${route.name}: Method not allowed (405)`);
        } else if (response.status >= 200 && response.status < 300) {
          console.log(`✅ ${route.name}: Working (${response.status})`);
        } else if (response.status >= 400 && response.status < 500) {
          console.log(`⚠️ ${route.name}: Client error (${response.status}) - ${response.data?.error || 'Unknown error'}`);
        } else {
          console.log(`❌ ${route.name}: Server error (${response.status})`);
        }
      } catch (error) {
        console.log(`❌ ${route.name}: Network error - ${error.message}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 Production Admin Server Analysis Complete');
    
  } catch (error) {
    console.error('❌ Production admin test failed:', error.message);
  }
}

testProductionAdmin();
