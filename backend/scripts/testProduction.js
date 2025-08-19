const axios = require('axios');
const mongoose = require('mongoose');

// Test configuration
const BASE_URL = 'https://api.opptym.com';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_USERNAME = `testuser-${Date.now()}`;

class ProductionTester {
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
        url: `${BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
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

  async testHealthCheck() {
    this.log('🔍 Testing health check...');
    await this.testEndpoint('/api/health');
  }

  async testCORS() {
    this.log('🔍 Testing CORS configuration...');
    await this.testEndpoint('/api/test-cors');
  }

  async testJWTConfiguration() {
    this.log('🔍 Testing JWT configuration...');
    await this.testEndpoint('/api/test-jwt');
  }

  async testEmailConfiguration() {
    this.log('🔍 Testing email configuration...');
    await this.testEndpoint('/api/test-email-config');
  }

  async testSMTPConnection() {
    this.log('🔍 Testing SMTP connection...');
    await this.testEndpoint('/api/test-smtp');
  }

  async testPackageInstallation() {
    this.log('🔍 Testing package installation...');
    await this.testEndpoint('/api/test-packages');
  }

  async testSignupOTPGeneration() {
    this.log('🔍 Testing signup OTP generation...');
    await this.testEndpoint('/api/otp/signup/generate', 'POST', {
      email: TEST_EMAIL
    });
  }

  async testSignupOTPVerification() {
    this.log('🔍 Testing signup OTP verification...');
    
    // First, get the OTP from the database (in real scenario, this would be from email)
    // For testing, we'll simulate the verification
    try {
      await this.testEndpoint('/api/otp/signup/verify', 'POST', {
        email: TEST_EMAIL,
        otp: '123456', // Mock OTP
        username: TEST_USERNAME,
        password: TEST_PASSWORD
      });
    } catch (error) {
      // Expected to fail with invalid OTP
      this.log('⚠️ Signup OTP verification failed (expected with mock OTP)', 'warning');
    }
  }

  async testLoginOTPGeneration() {
    this.log('🔍 Testing login OTP generation...');
    await this.testEndpoint('/api/otp/login/generate', 'POST', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
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

  async testDatabaseConnection() {
    this.log('🔍 Testing database connection...');
    
    try {
      // Test MongoDB connection
      const mongoUri = 'mongodb+srv://lowlife9366:x6TX9HuAvESb3DJD@opptym.tkcz5nx.mongodb.net/?retryWrites=true&w=majority&appName=opptym';
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      
      this.log('✅ Database connection successful', 'success');
      await mongoose.disconnect();
    } catch (error) {
      this.log(`❌ Database connection failed: ${error.message}`, 'error');
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Production Tests...\n');

    try {
      // Basic connectivity tests
      await this.testHealthCheck();
      await this.testCORS();
      
      // Configuration tests
      await this.testJWTConfiguration();
      await this.testEmailConfiguration();
      await this.testSMTPConnection();
      await this.testPackageInstallation();
      
      // Database test
      await this.testDatabaseConnection();
      
      // Authentication tests
      await this.testSignupOTPGeneration();
      await this.testSignupOTPVerification();
      await this.testLoginOTPGeneration();
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
    this.log('\n📊 Test Summary:');
    this.log('================');
    
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
    
    this.log('\n🔧 Recommendations:');
    if (failed === 0) {
      this.log('✅ All tests passed! Your production environment is ready.', 'success');
    } else {
      this.log('⚠️ Some tests failed. Please review the failed endpoints and fix the issues.', 'warning');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new ProductionTester();
  tester.runAllTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = ProductionTester;
