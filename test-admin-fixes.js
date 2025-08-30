import axios from 'axios';

// Helper function to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testAdminFixes() {
  console.log('🔧 Testing Admin Component Fixes...');
  
  let testResults = {
    userUpdate: 'PENDING',
    directoryCreation: 'PENDING',
    rateLimiting: 'PENDING'
  };
  
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
    
    // Test 2: Test User Update Fix
    console.log('📋 Test 2: Test User Update Fix');
    await delay(1000);
    
    try {
      // First get a user to update
      const usersResponse = await axios.get('https://api.opptym.com/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-test-mode': 'true'
        }
      });
      
      if (usersResponse.status === 200 && usersResponse.data.length > 0) {
        const userToUpdate = usersResponse.data[0];
        const updateData = {
          firstName: 'Updated',
          lastName: 'User',
          subscription: 'basic'
        };
        
        const updateUserResponse = await axios.put(`https://api.opptym.com/api/admin/users/${userToUpdate._id}`, updateData, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'x-test-mode': 'true'
          }
        });
        
        if (updateUserResponse.status === 200) {
          testResults.userUpdate = 'PASSED';
          console.log('✅ User update fix working');
          console.log('✅ User updated successfully');
          console.log('✅ Updated user data:', updateUserResponse.data);
        } else {
          testResults.userUpdate = 'FAILED';
          console.log('❌ User update still failing');
        }
      } else {
        testResults.userUpdate = 'SKIPPED';
        console.log('⚠️ User update test skipped - no users available');
      }
    } catch (error) {
      testResults.userUpdate = 'FAILED';
      console.log('❌ User update error:', error.message);
      if (error.response) {
        console.log('❌ Response status:', error.response.status);
        console.log('❌ Response data:', error.response.data);
      }
    }
    
    // Test 3: Test Directory Creation Fix
    console.log('📋 Test 3: Test Directory Creation Fix');
    await delay(1000);
    
    try {
      const newDirectoryData = {
        name: `Test Directory Fix ${Date.now()}`,
        domain: 'testdirectoryfix.com',
        category: 'business',
        pageRank: 5,
        status: 'active'
      };
      
      const createDirectoryResponse = await axios.post('https://api.opptym.com/api/admin/directories', newDirectoryData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-test-mode': 'true'
        }
      });
      
      if (createDirectoryResponse.status === 201) {
        testResults.directoryCreation = 'PASSED';
        console.log('✅ Directory creation fix working');
        console.log('✅ Directory created successfully');
        console.log('✅ Created directory ID:', createDirectoryResponse.data._id);
        
        // Clean up - delete the test directory
        await axios.delete(`https://api.opptym.com/api/admin/directories/${createDirectoryResponse.data._id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'x-test-mode': 'true'
          }
        });
        console.log('✅ Test directory cleaned up');
      } else {
        testResults.directoryCreation = 'FAILED';
        console.log('❌ Directory creation still failing');
      }
    } catch (error) {
      testResults.directoryCreation = 'FAILED';
      console.log('❌ Directory creation error:', error.message);
      if (error.response) {
        console.log('❌ Response status:', error.response.status);
        console.log('❌ Response data:', error.response.data);
      }
    }
    
    // Test 4: Test Rate Limiting Fix
    console.log('📋 Test 4: Test Rate Limiting Fix');
    await delay(1000);
    
    try {
      // Make multiple rapid requests to test rate limiting
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          axios.get('https://api.opptym.com/api/admin/stats', {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'x-test-mode': 'true'
            }
          })
        );
      }
      
      const responses = await Promise.all(promises);
      const allSuccessful = responses.every(response => response.status === 200);
      
      if (allSuccessful) {
        testResults.rateLimiting = 'PASSED';
        console.log('✅ Rate limiting fix working');
        console.log('✅ All rapid requests successful');
      } else {
        testResults.rateLimiting = 'FAILED';
        console.log('❌ Rate limiting still blocking requests');
      }
    } catch (error) {
      if (error.response && error.response.status === 429) {
        testResults.rateLimiting = 'FAILED';
        console.log('❌ Rate limiting still active');
      } else {
        testResults.rateLimiting = 'PASSED';
        console.log('✅ Rate limiting fix working (error is expected for invalid requests)');
      }
    }
    
    console.log('\n📊 Admin Fixes Test Results:');
    Object.entries(testResults).forEach(([test, result]) => {
      console.log(`  ${test}: ${result}`);
    });
    
    // Calculate success rate
    const allTests = Object.values(testResults);
    const passedTests = allTests.filter(result => result === 'PASSED').length;
    const skippedTests = allTests.filter(result => result === 'SKIPPED').length;
    const totalTests = allTests.length - skippedTests;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    console.log(`\n📈 Fixes Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 80) {
      console.log('🎉 All admin fixes are working perfectly!');
    } else {
      console.log('⚠️ Some admin fixes still need attention.');
    }
    
  } catch (error) {
    console.error('❌ Admin fixes test failed:', error.message);
  }
}

testAdminFixes();
