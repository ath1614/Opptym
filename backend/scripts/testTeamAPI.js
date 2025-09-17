const axios = require('axios');

async function testTeamAPI() {
  try {
    console.log('🧪 Testing Team Invitation API...\n');
    
    // Test the API endpoint
    const response = await axios.post('http://localhost:5000/api/team/invite', {
      email: 'test-api@example.com',
      role: 'employee'
    }, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

testTeamAPI();
