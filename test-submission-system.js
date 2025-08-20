// Test script for submission system
const axios = require('axios');

async function testSubmissionSystem() {
  console.log('🧪 Testing Submission System...\n');
  
  try {
    // Test 1: Check if backend is running
    console.log('1️⃣ Testing backend connectivity...');
    const healthCheck = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend is running\n');
    
    // Test 2: Test ultra-smart automation endpoint
    console.log('2️⃣ Testing ultra-smart automation endpoint...');
    const testData = {
      url: 'https://example.com',
      projectId: 'test-project-id'
    };
    
    try {
      const response = await axios.post('http://localhost:5000/api/ultra-smart/automate', testData);
      console.log('✅ Ultra-smart endpoint is accessible');
    } catch (error) {
      console.log('⚠️ Ultra-smart endpoint error (expected without auth):', error.response?.status);
    }
    
    console.log('\n✅ Submission system test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSubmissionSystem();
