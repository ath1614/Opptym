import axios from 'axios';

async function debugProfileTest() {
  console.log('🔍 Debugging Profile Data...');
  
  try {
    // Create test user
    const uniqueUsername = `debug_test_${Date.now()}`;
    const uniqueEmail = `debug_test_${Date.now()}@example.com`;
    const testPassword = 'testpass123';
    
    console.log('📋 Creating test user...');
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
      console.log('✅ User created successfully');
      
      // Login
      console.log('📋 Logging in...');
      const loginResponse = await axios.post('https://api.opptym.com/api/auth/login', {
        email: uniqueEmail,
        password: testPassword
      }, {
        headers: {
          'x-test-mode': 'true'
        }
      });
      
      if (loginResponse.data.success && loginResponse.data.token) {
        const authToken = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Get profile
        console.log('📋 Getting profile...');
        const profileResponse = await axios.get('https://api.opptym.com/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'x-test-mode': 'true'
          }
        });
        
        console.log('📊 Profile Response Status:', profileResponse.status);
        console.log('📊 Profile Response Data:', JSON.stringify(profileResponse.data, null, 2));
        
        // Update profile
        console.log('📋 Updating profile...');
        const updateData = {
          username: `updated_${uniqueUsername}`,
          firstName: 'John',
          lastName: 'Doe',
          company: 'Test Company'
        };
        
        const updateResponse = await axios.put('https://api.opptym.com/api/auth/profile', updateData, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'x-test-mode': 'true'
          }
        });
        
        console.log('📊 Update Response Status:', updateResponse.status);
        console.log('📊 Update Response Data:', JSON.stringify(updateResponse.data, null, 2));
        
        // Get profile again
        console.log('📋 Getting updated profile...');
        const updatedProfileResponse = await axios.get('https://api.opptym.com/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'x-test-mode': 'true'
          }
        });
        
        console.log('📊 Updated Profile Response Status:', updatedProfileResponse.status);
        console.log('📊 Updated Profile Response Data:', JSON.stringify(updatedProfileResponse.data, null, 2));
        
      } else {
        console.log('❌ Login failed');
      }
    } else {
      console.log('❌ User creation failed');
    }
    
  } catch (error) {
    console.error('❌ Debug test error:', error.message);
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
    }
  }
}

debugProfileTest();
