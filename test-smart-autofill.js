const axios = require('axios');

// Test Smart Auto-Fill functionality
async function testSmartAutoFill() {
  const baseURL = 'https://api.opptym.com';
  
  try {
    console.log('🧪 Testing Smart Auto-Fill functionality...\n');
    
    // Step 1: Test authentication
    console.log('1️⃣ Testing authentication...');
    const authResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'testpass123'
    });
    
    const token = authResponse.data.token;
    console.log('✅ Authentication successful\n');
    
    // Step 2: Get user's projects
    console.log('2️⃣ Getting user projects...');
    const projectsResponse = await axios.get(`${baseURL}/api/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const projects = projectsResponse.data;
    console.log(`✅ Found ${projects.length} projects`);
    
    if (projects.length === 0) {
      console.log('❌ No projects found. Please create a project first.');
      return;
    }
    
    const project = projects[0];
    console.log(`📋 Using project: ${project.title || project.name}\n`);
    
    // Step 3: Test Smart Auto-Fill on a simple form
    console.log('3️⃣ Testing Smart Auto-Fill on Caida directory...');
    const automationResponse = await axios.post(`${baseURL}/api/ultra-smart/automate`, {
      url: 'https://caida.eu/submit.php',
      projectId: project._id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const result = automationResponse.data;
    console.log('✅ Smart Auto-Fill completed!');
    console.log('📊 Results:');
    console.log(`   - Fields Found: ${result.data.totalFields}`);
    console.log(`   - Fields Filled: ${result.data.fieldsFilled}`);
    console.log(`   - Form Submitted: ${result.data.formSubmitted}`);
    console.log(`   - URL: ${result.data.url}`);
    
    if (result.data.filledFields && result.data.filledFields.length > 0) {
      console.log('\n📝 Filled Fields:');
      result.data.filledFields.forEach(field => {
        console.log(`   - ${field.field}: ${field.value}`);
      });
    }
    
    if (result.data.debug) {
      console.log('\n🔍 Debug Information:');
      console.log('   Project Data:', result.data.debug.projectData);
      console.log('   Fill Result:', result.data.debug.fillResult);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data?.debug) {
      console.log('\n🔍 Debug Information:');
      console.log(error.response.data.debug);
    }
  }
}

// Test different websites
async function testMultipleSites() {
  const testSites = [
    'https://caida.eu/submit.php',
    'https://www.blahoo.net/',
    'https://www.seodeeplinks.net/'
  ];
  
  console.log('🧪 Testing multiple directory sites...\n');
  
  for (const site of testSites) {
    console.log(`🌐 Testing: ${site}`);
    try {
      // This would require authentication and project data
      console.log('   ⏭️ Skipping (requires full setup)');
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
    console.log('');
  }
}

// Run tests
if (require.main === module) {
  testSmartAutoFill();
  // testMultipleSites();
}

module.exports = { testSmartAutoFill, testMultipleSites };
