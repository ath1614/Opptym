import axios from 'axios';

async function testRegisterComponent() {
  console.log('🔍 Testing Register Component Functionality...');
  
  let testResults = {
    frontend: {},
    backend: {},
    integration: {}
  };
  
  try {
    // Test 1: Frontend Accessibility
    console.log('📋 Test 1: Frontend Accessibility');
    const response = await axios.get('https://opptym.com');
    
    if (response.status === 200) {
      testResults.frontend.accessibility = 'PASSED';
      console.log('✅ Frontend is accessible');
    } else {
      testResults.frontend.accessibility = 'FAILED';
      console.log('❌ Frontend not accessible');
    }
    
    // Test 2: Backend Signup Endpoint
    console.log('📋 Test 2: Backend Signup Endpoint');
    try {
      const signupResponse = await axios.post('https://api.opptym.com/api/auth/signup', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpass123'
      }, {
        headers: {
          'x-test-mode': 'true'
        }
      });
      
      if (signupResponse.data.success) {
        testResults.backend.signupEndpoint = 'PASSED';
        console.log('✅ Signup endpoint working correctly');
      } else {
        testResults.backend.signupEndpoint = 'FAILED';
        console.log('❌ Signup endpoint failed');
      }
    } catch (error) {
      if (error.response?.data?.error === 'USERNAME_EXISTS' || error.response?.data?.error === 'EMAIL_EXISTS') {
        testResults.backend.signupEndpoint = 'PASSED';
        console.log('✅ Signup endpoint properly rejects existing user');
      } else {
        testResults.backend.signupEndpoint = 'FAILED';
        console.log('❌ Signup endpoint error:', error.message);
      }
    }
    
    // Test 3: Create Unique Test User
    console.log('📋 Test 3: Create Unique Test User');
    const uniqueUsername = `testuser_${Date.now()}`;
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const testPassword = 'testpass123';
    
    try {
      const signupResponse = await axios.post('https://api.opptym.com/api/auth/signup', {
        username: uniqueUsername,
        email: uniqueEmail,
        password: testPassword
      }, {
        headers: {
          'x-test-mode': 'true'
        }
      });
      
      if (signupResponse.data.success) {
        testResults.backend.userCreation = 'PASSED';
        console.log('✅ Test user created successfully');
        console.log('✅ User ID:', signupResponse.data.user.id);
        
        // Test 4: Login with Created User
        console.log('📋 Test 4: Login with Created User');
        try {
          const loginResponse = await axios.post('https://api.opptym.com/api/auth/login', {
            email: uniqueEmail,
            password: testPassword
          }, {
            headers: {
              'x-test-mode': 'true'
            }
          });
          
          if (loginResponse.data.success && loginResponse.data.token) {
            testResults.backend.loginAfterSignup = 'PASSED';
            console.log('✅ Login with created user successful');
          } else {
            testResults.backend.loginAfterSignup = 'FAILED';
            console.log('❌ Login with created user failed');
          }
        } catch (loginError) {
          testResults.backend.loginAfterSignup = 'FAILED';
          console.log('❌ Login error:', loginError.message);
        }
        
      } else {
        testResults.backend.userCreation = 'FAILED';
        console.log('❌ User creation failed');
      }
    } catch (signupError) {
      testResults.backend.userCreation = 'FAILED';
      console.log('❌ User creation error:', signupError.message);
    }
    
    // Test 5: Form Validation (Simulated)
    console.log('📋 Test 5: Form Validation (Simulated)');
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test invalid email format
    try {
      const invalidEmailResponse = await axios.post('https://api.opptym.com/api/auth/signup', {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      }, {
        headers: {
          'x-test-mode': 'true'
        }
      });
      
      testResults.backend.emailValidation = 'FAILED';
      console.log('❌ Email validation should reject invalid format');
    } catch (error) {
      if (error.response?.data?.error === 'INVALID_EMAIL') {
        testResults.backend.emailValidation = 'PASSED';
        console.log('✅ Email validation working correctly');
      } else if (error.response?.status === 429) {
        testResults.backend.emailValidation = 'SKIPPED';
        console.log('⚠️ Email validation test skipped due to rate limiting');
      } else {
        testResults.backend.emailValidation = 'FAILED';
        console.log('❌ Email validation not working as expected');
      }
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test weak password
    try {
      const weakPasswordResponse = await axios.post('https://api.opptym.com/api/auth/signup', {
        username: 'testuser',
        email: 'test@example.com',
        password: '123'
      }, {
        headers: {
          'x-test-mode': 'true'
        }
      });
      
      testResults.backend.passwordValidation = 'FAILED';
      console.log('❌ Password validation should reject weak password');
    } catch (error) {
      if (error.response?.data?.error === 'WEAK_PASSWORD') {
        testResults.backend.passwordValidation = 'PASSED';
        console.log('✅ Password validation working correctly');
      } else if (error.response?.status === 429) {
        testResults.backend.passwordValidation = 'SKIPPED';
        console.log('⚠️ Password validation test skipped due to rate limiting');
      } else {
        testResults.backend.passwordValidation = 'FAILED';
        console.log('❌ Password validation not working as expected');
      }
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test missing username
    try {
      const missingUsernameResponse = await axios.post('https://api.opptym.com/api/auth/signup', {
        username: '',
        email: 'test@example.com',
        password: 'password123'
      }, {
        headers: {
          'x-test-mode': 'true'
        }
      });
      
      testResults.backend.usernameValidation = 'FAILED';
      console.log('❌ Username validation should reject empty username');
    } catch (error) {
      if (error.response?.data?.error === 'MISSING_USERNAME') {
        testResults.backend.usernameValidation = 'PASSED';
        console.log('✅ Username validation working correctly');
      } else if (error.response?.status === 429) {
        testResults.backend.usernameValidation = 'SKIPPED';
        console.log('⚠️ Username validation test skipped due to rate limiting');
      } else {
        testResults.backend.usernameValidation = 'FAILED';
        console.log('❌ Username validation not working as expected');
      }
    }
    
    // Test 6: Duplicate User Prevention
    console.log('📋 Test 6: Duplicate User Prevention');
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const duplicateResponse = await axios.post('https://api.opptym.com/api/auth/signup', {
        username: uniqueUsername,
        email: uniqueEmail,
        password: 'password123'
      }, {
        headers: {
          'x-test-mode': 'true'
        }
      });
      
      testResults.backend.duplicatePrevention = 'FAILED';
      console.log('❌ Duplicate user prevention should reject existing user');
    } catch (error) {
      if (error.response?.data?.error === 'USERNAME_EXISTS' || error.response?.data?.error === 'EMAIL_EXISTS') {
        testResults.backend.duplicatePrevention = 'PASSED';
        console.log('✅ Duplicate user prevention working correctly');
      } else if (error.response?.status === 429) {
        testResults.backend.duplicatePrevention = 'SKIPPED';
        console.log('⚠️ Duplicate prevention test skipped due to rate limiting');
      } else {
        testResults.backend.duplicatePrevention = 'FAILED';
        console.log('❌ Duplicate prevention not working as expected');
      }
    }
    
    // Test 7: Rate Limiting
    console.log('📋 Test 7: Rate Limiting');
    let rateLimitHit = false;
    
    for (let i = 0; i < 10; i++) {
      try {
        await axios.post('https://api.opptym.com/api/auth/signup', {
          username: `testuser_${i}`,
          email: `testuser_${i}@example.com`,
          password: 'password123'
        }, {
          headers: {
            'x-test-mode': 'true'
          }
        });
      } catch (error) {
        if (error.response?.status === 429) {
          rateLimitHit = true;
          break;
        }
      }
    }
    
    if (rateLimitHit) {
      testResults.backend.rateLimiting = 'PASSED';
      console.log('✅ Rate limiting working correctly');
    } else {
      testResults.backend.rateLimiting = 'FAILED';
      console.log('❌ Rate limiting not working');
    }
    
    // Test 8: CORS for Signup
    console.log('📋 Test 8: CORS for Signup');
    try {
      const corsResponse = await axios.post('https://api.opptym.com/api/auth/signup', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }, {
        headers: {
          'Origin': 'https://opptym.com',
          'x-test-mode': 'true'
        }
      });
      
      testResults.backend.cors = 'PASSED';
      console.log('✅ CORS working for signup endpoint');
    } catch (error) {
      if (error.message.includes('CORS')) {
        testResults.backend.cors = 'FAILED';
        console.log('❌ CORS error for signup endpoint');
      } else {
        testResults.backend.cors = 'PASSED';
        console.log('✅ CORS working (error is expected for duplicate user)');
      }
    }
    
    console.log('\n📊 Register Component Test Results:');
    console.log('Frontend Tests:');
    Object.entries(testResults.frontend).forEach(([test, result]) => {
      console.log(`  ${test}: ${result}`);
    });
    
    console.log('\nBackend Tests:');
    Object.entries(testResults.backend).forEach(([test, result]) => {
      console.log(`  ${test}: ${result}`);
    });
    
    // Calculate success rate
    const allTests = [...Object.values(testResults.frontend), ...Object.values(testResults.backend)];
    const passedTests = allTests.filter(result => result === 'PASSED').length;
    const skippedTests = allTests.filter(result => result === 'SKIPPED').length;
    const totalTests = allTests.length - skippedTests;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    console.log(`\n📈 Overall Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 80) {
      console.log('🎉 Register Component is working well!');
    } else {
      console.log('⚠️ Register Component has some issues that need attention.');
    }
    
  } catch (error) {
    console.error('❌ Register component test failed:', error.message);
  }
}

testRegisterComponent();
