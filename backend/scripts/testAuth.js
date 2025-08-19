const axios = require('axios');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// Test configuration
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';
const TEST_USERNAME = 'testuser';

async function testAuthFlow() {
  console.log('🧪 Starting Authentication Flow Test...\n');

  try {
    // Step 1: Test signup OTP generation
    console.log('1️⃣ Testing signup OTP generation...');
    const signupOTPResponse = await axios.post('http://localhost:5050/api/otp/signup/generate', {
      email: TEST_EMAIL
    });
    console.log('✅ Signup OTP generated:', signupOTPResponse.data);

    // Step 2: Get the OTP from the user (in real scenario, this would be sent via email)
    // For testing, we'll get it from the database
    const user = await User.findOne({ email: TEST_EMAIL });
    const otp = user.signupOTP;
    console.log('📧 OTP from database:', otp);

    // Step 3: Test signup OTP verification
    console.log('\n2️⃣ Testing signup OTP verification...');
    const signupVerifyResponse = await axios.post('http://localhost:5050/api/otp/signup/verify', {
      email: TEST_EMAIL,
      otp: otp,
      username: TEST_USERNAME,
      password: TEST_PASSWORD
    });
    console.log('✅ Signup completed:', signupVerifyResponse.data);

    const token = signupVerifyResponse.data.token;
    console.log('🔑 Token received:', token.substring(0, 50) + '...');

    // Step 4: Test login OTP generation
    console.log('\n3️⃣ Testing login OTP generation...');
    const loginOTPResponse = await axios.post('http://localhost:5050/api/otp/login/generate', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    console.log('✅ Login OTP generated:', loginOTPResponse.data);

    // Step 5: Get the login OTP
    const updatedUser = await User.findOne({ email: TEST_EMAIL });
    const loginOtp = updatedUser.loginOTP;
    console.log('📧 Login OTP from database:', loginOtp);

    // Step 6: Test login OTP verification
    console.log('\n4️⃣ Testing login OTP verification...');
    const loginVerifyResponse = await axios.post('http://localhost:5050/api/otp/login/verify', {
      email: TEST_EMAIL,
      otp: loginOtp
    });
    console.log('✅ Login completed:', loginVerifyResponse.data);

    const loginToken = loginVerifyResponse.data.token;
    console.log('🔑 Login token received:', loginToken.substring(0, 50) + '...');

    // Step 7: Test protected route access
    console.log('\n5️⃣ Testing protected route access...');
    const profileResponse = await axios.get('http://localhost:5050/api/auth/profile', {
      headers: {
        Authorization: `Bearer ${loginToken}`
      }
    });
    console.log('✅ Profile access successful:', profileResponse.data);

    console.log('\n🎉 All authentication tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Clean up test data
async function cleanupTestData() {
  try {
    await User.deleteOne({ email: TEST_EMAIL });
    console.log('🧹 Test data cleaned up');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

// Run tests
if (require.main === module) {
  testAuthFlow()
    .then(() => cleanupTestData())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Test suite failed:', error);
      cleanupTestData().then(() => process.exit(1));
    });
}

module.exports = { testAuthFlow, cleanupTestData };
