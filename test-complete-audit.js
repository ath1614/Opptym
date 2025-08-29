const axios = require('axios');

// Test configuration
const BASE_URL = 'https://api.opptym.com';
const TEST_USER = {
  username: 'testuser_' + Date.now(),
  email: `test${Date.now()}@example.com`,
  password: 'testpassword123'
};

let authToken = '';
let testProjectId = '';

async function testUserCreation() {
  console.log('🔍 Testing user creation...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/signup`, TEST_USER);
    authToken = response.data.token;
    console.log('✅ User created successfully:', response.data.user.email);
    return true;
  } catch (error) {
    console.error('❌ User creation failed:', error.response?.data || error.message);
    return false;
  }
}

async function testUserLogin() {
  console.log('🔍 Testing user login...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    authToken = response.data.token;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testUserProfile() {
  console.log('🔍 Testing user profile...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ User profile fetched:', response.data.email);
    return true;
  } catch (error) {
    console.error('❌ Profile fetch failed:', error.response?.data || error.message);
    return false;
  }
}

async function testProjectCreation() {
  console.log('🔍 Testing project creation...');
  
  try {
    const projectData = {
      title: 'Test Project',
      url: 'https://example.com',
      category: 'test',
      email: 'test@example.com',
      name: 'Test User',
      companyName: 'Test Company',
      businessPhone: '+1234567890',
      description: 'Test project description'
    };
    
    const response = await axios.post(`${BASE_URL}/api/projects`, projectData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    testProjectId = response.data._id;
    console.log('✅ Project created successfully:', testProjectId);
    return true;
  } catch (error) {
    console.error('❌ Project creation failed:', error.response?.data || error.message);
    return false;
  }
}

async function testProjectFetching() {
  console.log('🔍 Testing project fetching...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/projects`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Projects fetched successfully:', response.data.length, 'projects');
    return response.data.length > 0;
  } catch (error) {
    console.error('❌ Project fetching failed:', error.response?.data || error.message);
    return false;
  }
}

async function testBookmarkletGeneration() {
  console.log('🔍 Testing bookmarklet generation...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/bookmarklet/generate`, {
      projectId: testProjectId
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Bookmarklet generated successfully');
    return true;
  } catch (error) {
    console.error('❌ Bookmarklet generation failed:', error.response?.data || error.message);
    return false;
  }
}

async function testDirectoryFetching() {
  console.log('🔍 Testing directory fetching...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/directories`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Directories fetched successfully:', response.data.length, 'directories');
    return true;
  } catch (error) {
    console.error('❌ Directory fetching failed:', error.response?.data || error.message);
    return false;
  }
}

async function testDirectoryFilters() {
  console.log('🔍 Testing directory filters...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/directories/filters`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Directory filters fetched successfully');
    return true;
  } catch (error) {
    console.error('❌ Directory filters failed:', error.response?.data || error.message);
    return false;
  }
}

async function runCompleteAudit() {
  console.log('🚀 Starting Complete System Audit...\n');
  
  const tests = [
    { name: 'User Creation', fn: testUserCreation },
    { name: 'User Login', fn: testUserLogin },
    { name: 'User Profile', fn: testUserProfile },
    { name: 'Project Creation', fn: testProjectCreation },
    { name: 'Project Fetching', fn: testProjectFetching },
    { name: 'Bookmarklet Generation', fn: testBookmarkletGeneration },
    { name: 'Directory Fetching', fn: testDirectoryFetching },
    { name: 'Directory Filters', fn: testDirectoryFilters }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n📋 Running ${test.name} test...`);
    const result = await test.fn();
    
    if (result) {
      passed++;
      console.log(`✅ ${test.name} test PASSED`);
    } else {
      failed++;
      console.log(`❌ ${test.name} test FAILED`);
    }
  }
  
  console.log('\n📊 Audit Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / tests.length) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The system is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
}

// Run the audit
runCompleteAudit().catch(console.error);
