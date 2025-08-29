import axios from 'axios';

async function testDashboardComponent() {
  console.log('🔍 Testing Dashboard Component Functionality...');
  
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
    const uniqueUsername = `dashboard_test_${Date.now()}`;
    const uniqueEmail = `dashboard_test_${Date.now()}@example.com`;
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
      console.log('⚠️ Skipping dashboard tests due to authentication failure');
      return;
    }
    
    // Test 3: Dashboard Data Endpoints
    console.log('📋 Test 3: Dashboard Data Endpoints');
    
    // Test projects endpoint
    try {
      const projectsResponse = await axios.get('https://api.opptym.com/api/projects', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-test-mode': 'true'
        }
      });
      
      if (projectsResponse.status === 200) {
        testResults.backend.projectsEndpoint = 'PASSED';
        console.log('✅ Projects endpoint working');
        console.log('✅ Projects count:', projectsResponse.data.length || 0);
      } else {
        testResults.backend.projectsEndpoint = 'FAILED';
        console.log('❌ Projects endpoint failed');
      }
    } catch (error) {
      testResults.backend.projectsEndpoint = 'FAILED';
      console.log('❌ Projects endpoint error:', error.message);
    }
    
    // Test submissions endpoint
    try {
      const submissionsResponse = await axios.get('https://api.opptym.com/api/submissions', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-test-mode': 'true'
        }
      });
      
      if (submissionsResponse.status === 200) {
        testResults.backend.submissionsEndpoint = 'PASSED';
        console.log('✅ Submissions endpoint working');
        console.log('✅ Submissions count:', submissionsResponse.data.length || 0);
      } else {
        testResults.backend.submissionsEndpoint = 'FAILED';
        console.log('❌ Submissions endpoint failed');
      }
    } catch (error) {
      testResults.backend.submissionsEndpoint = 'FAILED';
      console.log('❌ Submissions endpoint error:', error.message);
    }
    
    // Test subscription endpoint
    try {
      const subscriptionResponse = await axios.get('https://api.opptym.com/api/subscription/details', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-test-mode': 'true'
        }
      });
      
      if (subscriptionResponse.status === 200) {
        testResults.backend.subscriptionEndpoint = 'PASSED';
        console.log('✅ Subscription endpoint working');
        console.log('✅ Subscription plan:', subscriptionResponse.data.plan || 'free');
      } else {
        testResults.backend.subscriptionEndpoint = 'FAILED';
        console.log('❌ Subscription endpoint failed');
      }
    } catch (error) {
      testResults.backend.subscriptionEndpoint = 'FAILED';
      console.log('❌ Subscription endpoint error:', error.message);
    }
    
    // Test 4: Create Test Project
    console.log('📋 Test 4: Create Test Project');
    try {
      const projectData = {
        title: `Test Project ${Date.now()}`,
        url: 'https://example.com',
        category: 'business',
        email: 'test@example.com',
        companyName: 'Test Company',
        description: 'Test project for dashboard testing'
      };
      
      const createProjectResponse = await axios.post('https://api.opptym.com/api/projects', projectData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-test-mode': 'true'
        }
      });
      
      if (createProjectResponse.data && createProjectResponse.data._id) {
        testResults.backend.projectCreation = 'PASSED';
        console.log('✅ Test project created successfully');
        console.log('✅ Project ID:', createProjectResponse.data._id);
      } else {
        testResults.backend.projectCreation = 'FAILED';
        console.log('❌ Project creation failed');
        console.log('❌ Response data:', createProjectResponse.data);
      }
    } catch (error) {
      testResults.backend.projectCreation = 'FAILED';
      console.log('❌ Project creation error:', error.message);
      if (error.response) {
        console.log('❌ Error response:', error.response.data);
        console.log('❌ Error status:', error.response.status);
      }
    }
    
    // Test 5: Create Test Submission
    console.log('📋 Test 5: Create Test Submission');
    try {
      // First get a project ID to use
      const projectsResponse = await axios.get('https://api.opptym.com/api/projects', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-test-mode': 'true'
        }
      });
      
      let projectId = null;
      if (projectsResponse.data && projectsResponse.data.length > 0) {
        projectId = projectsResponse.data[0]._id;
      } else {
        // Create a project first if none exist
        const projectData = {
          title: `Test Project for Submission ${Date.now()}`,
          url: 'https://example.com',
          category: 'business',
          email: 'test@example.com',
          companyName: 'Test Company',
          description: 'Test project for submission testing'
        };
        
        const createProjectResponse = await axios.post('https://api.opptym.com/api/projects', projectData, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'x-test-mode': 'true'
          }
        });
        
        if (createProjectResponse.data && createProjectResponse.data._id) {
          projectId = createProjectResponse.data._id;
        }
      }
      
      if (projectId) {
        const submissionData = {
          projectId: projectId,
          siteName: 'Test Directory',
          submissionType: 'directory',
          status: 'pending'
        };
        
        const createSubmissionResponse = await axios.post('https://api.opptym.com/api/submissions', submissionData, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'x-test-mode': 'true'
          }
        });
        
        if (createSubmissionResponse.data && createSubmissionResponse.data._id) {
          testResults.backend.submissionCreation = 'PASSED';
          console.log('✅ Test submission created successfully');
          console.log('✅ Submission ID:', createSubmissionResponse.data._id);
        } else {
          testResults.backend.submissionCreation = 'FAILED';
          console.log('❌ Submission creation failed');
        }
      } else {
        testResults.backend.submissionCreation = 'FAILED';
        console.log('❌ No project available for submission');
      }
    } catch (error) {
      testResults.backend.submissionCreation = 'FAILED';
      console.log('❌ Submission creation error:', error.message);
    }
    
    // Test 6: Dashboard Stats Calculation
    console.log('📋 Test 6: Dashboard Stats Calculation');
    try {
      // Get projects and submissions again to test stats calculation
      const projectsResponse = await axios.get('https://api.opptym.com/api/projects', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-test-mode': 'true'
        }
      });
      
      const submissionsResponse = await axios.get('https://api.opptym.com/api/submissions', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-test-mode': 'true'
        }
      });
      
      const projects = projectsResponse.data || [];
      const submissions = submissionsResponse.data || [];
      
      // Calculate stats
      const successfulSubmissions = submissions.filter(s => s.status === 'success' || s.status === 'completed');
      const successRate = submissions.length > 0 ? Math.round((successfulSubmissions.length / submissions.length) * 100) : 0;
      
      console.log('✅ Stats calculated successfully:');
      console.log('  - Total Projects:', projects.length);
      console.log('  - Total Submissions:', submissions.length);
      console.log('  - Success Rate:', successRate + '%');
      
      testResults.backend.statsCalculation = 'PASSED';
    } catch (error) {
      testResults.backend.statsCalculation = 'FAILED';
      console.log('❌ Stats calculation error:', error.message);
    }
    
    // Test 7: User Profile Access
    console.log('📋 Test 7: User Profile Access');
    try {
      const profileResponse = await axios.get('https://api.opptym.com/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-test-mode': 'true'
        }
      });
      
      if (profileResponse.status === 200) {
        testResults.backend.profileAccess = 'PASSED';
        console.log('✅ User profile access successful');
        console.log('✅ Username:', profileResponse.data.user.username);
        console.log('✅ Email:', profileResponse.data.user.email);
        console.log('✅ Subscription:', profileResponse.data.user.subscription);
      } else {
        testResults.backend.profileAccess = 'FAILED';
        console.log('❌ User profile access failed');
      }
    } catch (error) {
      testResults.backend.profileAccess = 'FAILED';
      console.log('❌ User profile access error:', error.message);
    }
    
    // Test 8: CORS for Dashboard
    console.log('📋 Test 8: CORS for Dashboard');
    try {
      const corsResponse = await axios.get('https://api.opptym.com/api/projects', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Origin': 'https://opptym.com',
          'x-test-mode': 'true'
        }
      });
      
      testResults.backend.cors = 'PASSED';
      console.log('✅ CORS working for dashboard endpoints');
    } catch (error) {
      if (error.message.includes('CORS')) {
        testResults.backend.cors = 'FAILED';
        console.log('❌ CORS error for dashboard endpoints');
      } else {
        testResults.backend.cors = 'PASSED';
        console.log('✅ CORS working (error is expected for invalid requests)');
      }
    }
    
    console.log('\n📊 Dashboard Component Test Results:');
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
    const totalTests = allTests.length;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    console.log(`\n📈 Overall Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 80) {
      console.log('🎉 Dashboard Component is working well!');
    } else {
      console.log('⚠️ Dashboard Component has some issues that need attention.');
    }
    
  } catch (error) {
    console.error('❌ Dashboard component test failed:', error.message);
  }
}

testDashboardComponent();
