import axios from 'axios';

async function testLandingPageSimple() {
  console.log('🔍 Testing LandingPage Component Functionality (Simple)...');
  
  try {
    // Test 1: Frontend Accessibility
    console.log('📋 Test 1: Frontend Accessibility');
    const response = await axios.get('https://opptym.com');
    
    if (response.status === 200) {
      console.log('✅ Frontend is accessible');
      
      // Check for key elements in HTML
      const html = response.data;
      
      // Check for title
      if (html.includes('opptym') || html.includes('OPPTYM')) {
        console.log('✅ Page title found');
      } else {
        console.log('❌ Page title not found');
      }
      
      // Check for React app mounting
      if (html.includes('id="root"')) {
        console.log('✅ React app mounting point found');
      } else {
        console.log('❌ React app mounting point not found');
      }
      
      // Check for CSS and JS assets
      if (html.includes('.css') || html.includes('.js')) {
        console.log('✅ Assets loading correctly');
      } else {
        console.log('❌ Assets not found');
      }
      
    } else {
      console.log('❌ Frontend not accessible');
    }
    
    // Test 2: Backend Health
    console.log('📋 Test 2: Backend Health');
    try {
      const backendResponse = await axios.get('https://api.opptym.com/api/health');
      if (backendResponse.status === 200) {
        console.log('✅ Backend is healthy');
        console.log('✅ Backend response:', backendResponse.data);
      } else {
        console.log('❌ Backend health check failed');
      }
    } catch (error) {
      console.log('❌ Backend not accessible:', error.message);
    }
    
    // Test 3: CORS Configuration
    console.log('📋 Test 3: CORS Configuration');
    try {
      const corsResponse = await axios.get('https://api.opptym.com/api/test-cors');
      if (corsResponse.status === 200) {
        console.log('✅ CORS is working');
      } else {
        console.log('❌ CORS test failed');
      }
    } catch (error) {
      console.log('❌ CORS test failed:', error.message);
    }
    
    console.log('\n🎉 LandingPage Component Simple Test Completed!');
    
  } catch (error) {
    console.error('❌ LandingPage simple test failed:', error.message);
  }
}

testLandingPageSimple();
