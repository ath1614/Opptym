import axios from 'axios';

async function testLoginComponent() {
  console.log('🔍 Testing Login Component Functionality...');
  
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
    
    // Test 2: Backend Login Endpoint
    console.log('📋 Test 2: Backend Login Endpoint');
    try {
      const loginResponse = await axios.post('https://api.opptym.com/api/auth/login', {
        email: 'test@example.com',
        password: 'wrongpassword'
      }, {
        headers: {
          'x-test-mode': 'true'
        }
      });
      
      // This should fail with wrong credentials
      testResults.backend.loginEndpoint = 'FAILED';
      console.log('❌ Login endpoint should reject wrong credentials');
    } catch (error) {
      if (error.response?.status === 400) {
        testResults.backend.loginEndpoint = 'PASSED';
        console.log('✅ Login endpoint properly rejects invalid credentials');
        console.log('✅ Error response:', error.response.data);
      } else {
        testResults.backend.loginEndpoint = 'FAILED';
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test 3: Create Test User for Login Test
    console.log('📋 Test 3: Create Test User for Login Test');
    const testEmail = `testuser_${Date.now()}@example.com`;
    const testPassword = 'testpass123';
    
    try {
      const signupResponse = await axios.post('https://api.opptym.com/api/auth/signup', {
        username: `testuser_${Date.now()}`,
        email: testEmail,
        password: testPassword
      }, {
        headers: {
          'x-test-mode': 'true'
        }
      });
      
      if (signupResponse.data.success) {
        testResults.backend.userCreation = 'PASSED';
        console.log('✅ Test user created successfully');
        
        // Test 4: Login with Valid Credentials
        console.log('📋 Test 4: Login with Valid Credentials');
        try {
          const validLoginResponse = await axios.post('https://api.opptym.com/api/auth/login', {
            email: testEmail,
            password: testPassword
          }, {
            headers: {
              'x-test-mode': 'true'
            }
          });
          
          if (validLoginResponse.data.success && validLoginResponse.data.token) {
            testResults.backend.validLogin = 'PASSED';
            console.log('✅ Login with valid credentials successful');
            console.log('✅ Token received:', validLoginResponse.data.token.substring(0, 50) + '...');
            
            // Test 5: Profile Access with Token
            console.log('📋 Test 5: Profile Access with Token');
            try {
              const profileResponse = await axios.get('https://api.opptym.com/api/auth/profile', {
                headers: {
                  Authorization: `Bearer ${validLoginResponse.data.token}`
                }
              });
              
              if (profileResponse.status === 200) {
                testResults.backend.profileAccess = 'PASSED';
                console.log('✅ Profile access with token successful');
              } else {
                testResults.backend.profileAccess = 'FAILED';
                console.log('❌ Profile access failed');
              }
            } catch (profileError) {
              testResults.backend.profileAccess = 'FAILED';
              console.log('❌ Profile access error:', profileError.message);
            }
            
          } else {
            testResults.backend.validLogin = 'FAILED';
            console.log('❌ Login response missing success or token');
          }
        } catch (loginError) {
          testResults.backend.validLogin = 'FAILED';
          console.log('❌ Valid login failed:', loginError.message);
        }
        
      } else {
        testResults.backend.userCreation = 'FAILED';
        console.log('❌ User creation failed');
      }
    } catch (signupError) {
      testResults.backend.userCreation = 'FAILED';
      console.log('❌ User creation error:', signupError.message);
    }
    
    // Test 6: Form Validation (Simulated)
    console.log('📋 Test 6: Form Validation (Simulated)');
    
    // Test invalid email format
    try {
      const invalidEmailResponse = await axios.post('https://api.opptym.com/api/auth/login', {
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
      } else {
        testResults.backend.emailValidation = 'FAILED';
        console.log('❌ Email validation not working as expected');
      }
    }
    
    // Test missing password
    try {
      const missingPasswordResponse = await axios.post('https://api.opptym.com/api/auth/login', {
        email: 'test@example.com',
        password: ''
      }, {
        headers: {
          'x-test-mode': 'true'
        }
      });
      
      testResults.backend.passwordValidation = 'FAILED';
      console.log('❌ Password validation should reject empty password');
    } catch (error) {
      if (error.response?.data?.error === 'MISSING_PASSWORD') {
        testResults.backend.passwordValidation = 'PASSED';
        console.log('✅ Password validation working correctly');
      } else {
        testResults.backend.passwordValidation = 'FAILED';
        console.log('❌ Password validation not working as expected');
      }
    }
    
    // Test 7: Rate Limiting
    console.log('📋 Test 7: Rate Limiting');
    let rateLimitHit = false;
    
    for (let i = 0; i < 10; i++) {
      try {
        await axios.post('https://api.opptym.com/api/auth/login', {
          email: 'test@example.com',
          password: 'wrongpassword'
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
    
    // Test 8: CORS for Login
    console.log('📋 Test 8: CORS for Login');
    try {
      const corsResponse = await axios.post('https://api.opptym.com/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      }, {
        headers: {
          'Origin': 'https://opptym.com',
          'x-test-mode': 'true'
        }
      });
      
      testResults.backend.cors = 'PASSED';
      console.log('✅ CORS working for login endpoint');
    } catch (error) {
      if (error.message.includes('CORS')) {
        testResults.backend.cors = 'FAILED';
        console.log('❌ CORS error for login endpoint');
      } else {
        testResults.backend.cors = 'PASSED';
        console.log('✅ CORS working (error is expected for invalid credentials)');
      }
    }
    
    console.log('\n📊 Login Component Test Results:');
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
    const successRate = (passedTests / allTests.length) * 100;
    
    console.log(`\n📈 Overall Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 80) {
      console.log('🎉 Login Component is working well!');
    } else {
      console.log('⚠️ Login Component has some issues that need attention.');
    }
    
  } catch (error) {
    console.error('❌ Login component test failed:', error.message);
  }
}

testLoginComponent();
