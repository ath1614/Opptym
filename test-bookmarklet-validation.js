// Test bookmarklet validation endpoint
const axios = require('axios');

const BASE_URL = 'https://api.opptym.com';

async function testBookmarkletValidation() {
  console.log('🔍 Testing bookmarklet validation endpoint...');
  
  try {
    // Test 1: Check if endpoint exists
    console.log('\n1️⃣ Testing endpoint accessibility...');
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ API is accessible:', response.data);
    
    // Test 2: Test with invalid token
    console.log('\n2️⃣ Testing with invalid token...');
    try {
      const invalidResponse = await axios.post(`${BASE_URL}/api/bookmarklet/validate`, {
        token: 'invalid_token_123'
      });
      console.log('❌ Should have failed but got:', invalidResponse.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Correctly rejected invalid token');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    // Test 3: Test with missing token
    console.log('\n3️⃣ Testing with missing token...');
    try {
      const missingResponse = await axios.post(`${BASE_URL}/api/bookmarklet/validate`, {});
      console.log('❌ Should have failed but got:', missingResponse.data);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected missing token');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    console.log('\n✅ Bookmarklet validation endpoint tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testBookmarkletValidation();
