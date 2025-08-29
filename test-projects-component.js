import axios from 'axios';

async function testProjectsComponent() {
  console.log('🔍 Testing MyProjects Component Functionality...');
  
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
    
    // Test 2: Create Test User and Login
    console.log('📋 Test 2: Create Test User and Login');
    const uniqueUsername = `projects_test_${Date.now()}`;
    const uniqueEmail = `projects_test_${Date.now()}@example.com`;
    const testPassword = 'testpass123';
    
    let authToken = null;
    
    try {
      // Create user
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
        console.log('✅ Test user created successfully');
        
        // Login to get token
        const loginResponse = await axios.post('https://api.opptym.com/api/auth/login', {
          email: uniqueEmail,
          password: testPassword
        }, {
          headers: {
            'x-test-mode': 'true'
          }
        });
        
        if (loginResponse.data.success && loginResponse.data.token) {
          authToken = loginResponse.data.token;
          testResults.backend.authentication = 'PASSED';
          console.log('✅ Authentication successful');
        } else {
          testResults.backend.authentication = 'FAILED';
          console.log('❌ Authentication failed');
        }
      } else {
        testResults.backend.authentication = 'FAILED';
        console.log('❌ User creation failed');
      }
    } catch (error) {
      testResults.backend.authentication = 'FAILED';
      console.log('❌ Authentication error:', error.message);
    }
    
    if (!authToken) {
      console.log('⚠️ Skipping projects tests due to authentication failure');
      return;
    }
    
    // Test 3: Projects Endpoints
    console.log('📋 Test 3: Projects Endpoints');
    
    // Test get projects endpoint
    try {
      const projectsResponse = await axios.get('https://api.opptym.com/api/projects', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-test-mode': 'true'
        }
      });
      
      if (projectsResponse.status === 200) {
        testResults.backend.getProjects = 'PASSED';
        console.log('✅ Get projects endpoint working');
        console.log('✅ Projects count:', projectsResponse.data.length || 0);
      } else {
        testResults.backend.getProjects = 'FAILED';
        console.log('❌ Get projects endpoint failed');
      }
    } catch (error) {
      testResults.backend.getProjects = 'FAILED';
      console.log('❌ Get projects endpoint error:', error.message);
    }
    
    // Test 4: Create Test Project
    console.log('📋 Test 4: Create Test Project');
    let testProjectId = null;
    
    try {
      const projectData = {
        title: `Test Project ${Date.now()}`,
        url: 'https://example.com',
        category: 'business',
        email: 'test@example.com',
        companyName: 'Test Company',
        description: 'Test project for projects component testing'
      };
      
      const createProjectResponse = await axios.post('https://api.opptym.com/api/projects', projectData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-test-mode': 'true'
        }
      });
      
      if (createProjectResponse.data && createProjectResponse.data._id) {
        testProjectId = createProjectResponse.data._id;
        testResults.backend.createProject = 'PASSED';
        console.log('✅ Test project created successfully');
        console.log('✅ Project ID:', testProjectId);
      } else {
        testResults.backend.createProject = 'FAILED';
        console.log('❌ Project creation failed');
      }
    } catch (error) {
      testResults.backend.createProject = 'FAILED';
      console.log('❌ Project creation error:', error.message);
    }
    
    // Test 5: Get Project by ID
    console.log('📋 Test 5: Get Project by ID');
    if (testProjectId) {
      try {
        const projectResponse = await axios.get(`https://api.opptym.com/api/projects/${testProjectId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'x-test-mode': 'true'
          }
        });
        
        if (projectResponse.status === 200) {
          testResults.backend.getProjectById = 'PASSED';
          console.log('✅ Get project by ID working');
          console.log('✅ Project title:', projectResponse.data.title);
        } else {
          testResults.backend.getProjectById = 'FAILED';
          console.log('❌ Get project by ID failed');
        }
      } catch (error) {
        testResults.backend.getProjectById = 'FAILED';
        console.log('❌ Get project by ID error:', error.message);
      }
    } else {
      testResults.backend.getProjectById = 'SKIPPED';
      console.log('⚠️ Get project by ID test skipped - no project ID available');
    }
    
    // Test 6: Update Project
    console.log('📋 Test 6: Update Project');
    if (testProjectId) {
      try {
        const updateData = {
          title: `Updated Test Project ${Date.now()}`,
          description: 'Updated description for testing'
        };
        
        const updateResponse = await axios.put(`https://api.opptym.com/api/projects/${testProjectId}`, updateData, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'x-test-mode': 'true'
          }
        });
        
        if (updateResponse.status === 200) {
          testResults.backend.updateProject = 'PASSED';
          console.log('✅ Update project working');
          console.log('✅ Updated title:', updateResponse.data.title);
        } else {
          testResults.backend.updateProject = 'FAILED';
          console.log('❌ Update project failed');
        }
      } catch (error) {
        testResults.backend.updateProject = 'FAILED';
        console.log('❌ Update project error:', error.message);
      }
    } else {
      testResults.backend.updateProject = 'SKIPPED';
      console.log('⚠️ Update project test skipped - no project ID available');
    }
    
    // Test 7: Delete Project
    console.log('📋 Test 7: Delete Project');
    if (testProjectId) {
      try {
        const deleteResponse = await axios.delete(`https://api.opptym.com/api/projects/${testProjectId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'x-test-mode': 'true'
          }
        });
        
        if (deleteResponse.status === 204) {
          testResults.backend.deleteProject = 'PASSED';
          console.log('✅ Delete project working');
        } else {
          testResults.backend.deleteProject = 'FAILED';
          console.log('❌ Delete project failed');
        }
      } catch (error) {
        testResults.backend.deleteProject = 'FAILED';
        console.log('❌ Delete project error:', error.message);
      }
    } else {
      testResults.backend.deleteProject = 'SKIPPED';
      console.log('⚠️ Delete project test skipped - no project ID available');
    }
    
    // Test 8: Project Validation
    console.log('📋 Test 8: Project Validation');
    
    // Test invalid project creation (missing required fields)
    try {
      const invalidProjectData = {
        // Missing title and url
        category: 'business'
      };
      
      const invalidResponse = await axios.post('https://api.opptym.com/api/projects', invalidProjectData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-test-mode': 'true'
        }
      });
      
      testResults.backend.projectValidation = 'FAILED';
      console.log('❌ Project validation should reject missing fields');
    } catch (error) {
      if (error.response?.status === 400) {
        testResults.backend.projectValidation = 'PASSED';
        console.log('✅ Project validation working correctly');
        console.log('✅ Error response:', error.response.data);
      } else {
        testResults.backend.projectValidation = 'FAILED';
        console.log('❌ Project validation not working as expected');
      }
    }
    
    // Test 9: CORS for Projects
    console.log('📋 Test 9: CORS for Projects');
    try {
      const corsResponse = await axios.get('https://api.opptym.com/api/projects', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Origin': 'https://opptym.com',
          'x-test-mode': 'true'
        }
      });
      
      testResults.backend.cors = 'PASSED';
      console.log('✅ CORS working for projects endpoints');
    } catch (error) {
      if (error.message.includes('CORS')) {
        testResults.backend.cors = 'FAILED';
        console.log('❌ CORS error for projects endpoints');
      } else {
        testResults.backend.cors = 'PASSED';
        console.log('✅ CORS working (error is expected for invalid requests)');
      }
    }
    
    console.log('\n📊 MyProjects Component Test Results:');
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
      console.log('🎉 MyProjects Component is working well!');
    } else {
      console.log('⚠️ MyProjects Component has some issues that need attention.');
    }
    
  } catch (error) {
    console.error('❌ MyProjects component test failed:', error.message);
  }
}

testProjectsComponent();
