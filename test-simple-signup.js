import axios from 'axios';

async function testSimpleSignup() {
  console.log('🔍 Testing simple signup...');
  
  try {
    const uniqueId = Date.now();
    const userData = {
      username: `testuser_${uniqueId}`,
      email: `test${uniqueId}@example.com`,
      password: 'testpass123'
    };
    
    console.log('🔍 Attempting signup with:', userData);
    
    const response = await axios.post('https://api.opptym.com/api/auth/signup', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Signup successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Signup failed:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return false;
  }
}

testSimpleSignup();
