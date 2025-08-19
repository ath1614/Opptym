const axios = require('axios');

// Production URLs for Coolify deployment
const BACKEND_URL = 'https://api.opptym.com'; // Update with your actual backend URL
const FRONTEND_URL = 'https://opptym.com'; // Update with your actual frontend URL

class CoolifyProductionTester {
  constructor() {
    this.results = [];
    this.currentToken = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async testEndpoint(endpoint, method = 'GET', data = null, headers = {}) {
    try {
      const config = {
        method,
        url: `${BACKEND_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        timeout: 10000 // 10 second timeout
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      this.results.push({
        endpoint,
        method,
        status: response.status,
        success: true,
        data: response.data
      });
      
      this.log(`✅ ${method} ${endpoint} - ${response.status}`, 'success');
      return response;
    } catch (error) {
      this.results.push({
        endpoint,
        method,
        status: error.response?.status || 'NETWORK_ERROR',
        success: false,
        error: error.response?.data || error.message
      });
      
      this.log(`❌ ${method} ${endpoint} - ${error.response?.status || 'NETWORK_ERROR'}`, 'error');
      throw error;
    }
  }

  async testBackendConnectivity() {
    this.log('🔍 Testing backend connectivity...');
    await this.testEndpoint('/api/health');
  }

  async testCORSConfiguration() {
    this.log('🔍 Testing CORS configuration...');
    await this.testEndpoint('/api/test-cors');
  }

  async testJWTConfiguration() {
    this.log('🔍 Testing JWT configuration...');
    const response = await this.testEndpoint('/api/test-jwt');
    
    // Check JWT configuration
    if (response.data.jwtSecretExists) {
      this.log('✅ JWT secret is configured', 'success');
    } else {
      this.log('⚠️ JWT secret not found in environment variables', 'warning');
    }
  }

  async testEmailConfiguration() {
    this.log('🔍 Testing email configuration...');
    const response = await this.testEndpoint('/api/test-email-config');
    
    if (response.data.isConfigured) {
      this.log('✅ Email is configured', 'success');
    } else {
      this.log('⚠️ Email not configured - OTP will use mock emails', 'warning');
    }
  }

  async testSMTPConnection() {
    this.log('🔍 Testing SMTP connection...');
    try {
      await this.testEndpoint('/api/test-smtp');
    } catch (error) {
      this.log('⚠️ SMTP connection failed - emails will not be sent', 'warning');
    }
  }

  async testPackageInstallation() {
    this.log('🔍 Testing package installation...');
    await this.testEndpoint('/api/test-packages');
  }

  async testAuthenticationFlow() {
    this.log('🔍 Testing authentication flow...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    const testUsername = `testuser-${Date.now()}`;
    
    try {
      // Test signup OTP generation
      this.log('  📝 Testing signup OTP generation...');
      await this.testEndpoint('/api/otp/signup/generate', 'POST', {
        email: testEmail
      });
      
      // Test login OTP generation
      this.log('  🔐 Testing login OTP generation...');
      await this.testEndpoint('/api/otp/login/generate', 'POST', {
        email: testEmail,
        password: testPassword
      });
      
      this.log('✅ Authentication endpoints are working', 'success');
      
    } catch (error) {
      this.log('❌ Authentication flow test failed', 'error');
    }
  }

  async testProtectedRoutes() {
    this.log('🔍 Testing protected routes...');
    
    // Test without token (should fail)
    try {
      await this.testEndpoint('/api/auth/profile');
    } catch (error) {
      if (error.response?.status === 401) {
        this.log('✅ Protected route correctly rejected without token', 'success');
      }
    }

    // Test with invalid token (should fail)
    try {
      await this.testEndpoint('/api/auth/profile', 'GET', null, {
        Authorization: 'Bearer invalid-token'
      });
    } catch (error) {
      if (error.response?.status === 401) {
        this.log('✅ Protected route correctly rejected with invalid token', 'success');
      }
    }
  }

  async testRateLimiting() {
    this.log('🔍 Testing rate limiting...');
    
    // Make multiple requests to trigger rate limiting
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(this.testEndpoint('/api/health'));
    }
    
    try {
      await Promise.all(promises);
      this.log('✅ Rate limiting not triggered (within limits)', 'success');
    } catch (error) {
      if (error.response?.status === 429) {
        this.log('✅ Rate limiting working correctly', 'success');
      } else {
        this.log('⚠️ Rate limiting test inconclusive', 'warning');
      }
    }
  }

  async testFrontendConnectivity() {
    this.log('🔍 Testing frontend connectivity...');
    
    try {
      const response = await axios.get(FRONTEND_URL, { timeout: 10000 });
      if (response.status === 200) {
        this.log('✅ Frontend is accessible', 'success');
      } else {
        this.log(`⚠️ Frontend returned status ${response.status}`, 'warning');
      }
    } catch (error) {
      this.log(`❌ Frontend connectivity failed: ${error.message}`, 'error');
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Coolify Production Tests...\n');

    try {
      // Basic connectivity tests
      await this.testBackendConnectivity();
      await this.testFrontendConnectivity();
      await this.testCORSConfiguration();
      
      // Configuration tests
      await this.testJWTConfiguration();
      await this.testEmailConfiguration();
      await this.testSMTPConnection();
      await this.testPackageInstallation();
      
      // Authentication tests
      await this.testAuthenticationFlow();
      await this.testProtectedRoutes();
      
      // Security tests
      await this.testRateLimiting();
      
      this.log('\n🎉 All tests completed!');
      this.printSummary();
      
    } catch (error) {
      this.log(`❌ Test suite failed: ${error.message}`, 'error');
      this.printSummary();
    }
  }

  printSummary() {
    this.log('\n📊 Coolify Production Test Summary:');
    this.log('====================================');
    
    const total = this.results.length;
    const successful = this.results.filter(r => r.success).length;
    const failed = total - successful;
    
    this.log(`Total Tests: ${total}`);
    this.log(`Successful: ${successful}`, successful === total ? 'success' : 'info');
    this.log(`Failed: ${failed}`, failed === 0 ? 'success' : 'error');
    
    if (failed > 0) {
      this.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          this.log(`  - ${r.method} ${r.endpoint}: ${r.status}`, 'error');
        });
    }
    
    this.log('\n🔧 Coolify Deployment Recommendations:');
    if (failed === 0) {
      this.log('✅ All tests passed! Your Coolify deployment is working correctly.', 'success');
    } else {
      this.log('⚠️ Some tests failed. Please check your Coolify configuration.', 'warning');
      this.log('   - Verify environment variables in Coolify panel');
      this.log('   - Check service logs in Coolify dashboard');
      this.log('   - Ensure proper networking between frontend and backend');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new CoolifyProductionTester();
  tester.runAllTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = CoolifyProductionTester;
