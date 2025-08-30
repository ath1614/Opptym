// Debug bookmarklet validation issue
const axios = require('axios');

async function debugBookmarkletValidation() {
  console.log('🔍 Debugging bookmarklet validation...');
  
  try {
    // Test 1: Check if the endpoint exists
    console.log('\n1️⃣ Testing endpoint existence...');
    const healthResponse = await axios.get('https://api.opptym.com/api/health');
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test 2: Test with proper CORS headers
    console.log('\n2️⃣ Testing with CORS headers...');
    try {
      const corsResponse = await axios.post('https://api.opptym.com/api/bookmarklet/validate', 
        { token: 'test_token' },
        {
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://caida.eu',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
          }
        }
      );
      console.log('✅ CORS test passed:', corsResponse.data);
    } catch (error) {
      console.log('❌ CORS test failed:', error.response?.status, error.response?.data);
    }
    
    // Test 3: Test without CORS headers
    console.log('\n3️⃣ Testing without CORS headers...');
    try {
      const noCorsResponse = await axios.post('https://api.opptym.com/api/bookmarklet/validate', 
        { token: 'test_token' },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ No-CORS test passed:', noCorsResponse.data);
    } catch (error) {
      console.log('❌ No-CORS test failed:', error.response?.status, error.response?.data);
    }
    
    // Test 4: Test with missing token
    console.log('\n4️⃣ Testing with missing token...');
    try {
      const missingTokenResponse = await axios.post('https://api.opptym.com/api/bookmarklet/validate', 
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('❌ Should have failed but got:', missingTokenResponse.data);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected missing token');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    }
  }
}

debugBookmarkletValidation();
