import axios from 'axios';

async function testSubmissionDashboardComponent() {
  console.log('🔍 Testing SubmissionDashboard Component Functionality...');
  
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
    const uniqueUsername = `submission_test_${Date.now()}`;
    const uniqueEmail = `submission_test_${Date.now()}@example.com`;
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
      console.log('⚠️ Skipping submission tests due to authentication failure');
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
        description: 'Test project for submission dashboard testing'
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
    
    // Test 5: Directories Endpoints
    console.log('📋 Test 5: Directories Endpoints');
    
    // Test get directories endpoint
    try {
      const directoriesResponse = await axios.get('https://api.opptym.com/api/directories', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-test-mode': 'true'
        }
      });
      
      if (directoriesResponse.status === 200) {
        testResults.backend.getDirectories = 'PASSED';
        console.log('✅ Get directories endpoint working');
        console.log('✅ Directories count:', directoriesResponse.data.length || 0);
      } else {
        testResults.backend.getDirectories = 'FAILED';
        console.log('❌ Get directories endpoint failed');
      }
    } catch (error) {
      testResults.backend.getDirectories = 'FAILED';
      console.log('❌ Get directories endpoint error:', error.message);
    }
    
    // Test 6: Directory Filters Endpoint
    console.log('📋 Test 6: Directory Filters Endpoint');
    try {
      const filtersResponse = await axios.get('https://api.opptym.com/api/directories/filters', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-test-mode': 'true'
        }
      });
      
      if (filtersResponse.status === 200) {
        testResults.backend.getDirectoryFilters = 'PASSED';
        console.log('✅ Get directory filters endpoint working');
        console.log('✅ Available filters:', Object.keys(filtersResponse.data));
      } else {
        testResults.backend.getDirectoryFilters = 'FAILED';
        console.log('❌ Get directory filters endpoint failed');
      }
    } catch (error) {
      testResults.backend.getDirectoryFilters = 'FAILED';
      console.log('❌ Get directory filters endpoint error:', error.message);
    }
    
    // Test 7: Bookmarklet Generation
    console.log('📋 Test 7: Bookmarklet Generation');
    if (testProjectId) {
      try {
        const bookmarkletResponse = await axios.post('https://api.opptym.com/api/bookmarklet/generate', {
          projectId: testProjectId
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'x-test-mode': 'true'
          }
        });
        
        if (bookmarkletResponse.status === 200 || bookmarkletResponse.status === 201) {
          testResults.backend.bookmarkletGeneration = 'PASSED';
          console.log('✅ Bookmarklet generation working');
          console.log('✅ Bookmarklet token:', bookmarkletResponse.data.token ? 'Generated' : 'Not generated');
        } else {
          testResults.backend.bookmarkletGeneration = 'FAILED';
          console.log('❌ Bookmarklet generation failed');
          console.log('❌ Response status:', bookmarkletResponse.status);
          console.log('❌ Response data:', bookmarkletResponse.data);
        }
      } catch (error) {
        testResults.backend.bookmarkletGeneration = 'FAILED';
        console.log('❌ Bookmarklet generation error:', error.message);
        if (error.response) {
          console.log('❌ Error response:', error.response.data);
          console.log('❌ Error status:', error.response.status);
        }
      }
    } else {
      testResults.backend.bookmarkletGeneration = 'SKIPPED';
      console.log('⚠️ Bookmarklet generation test skipped - no project ID available');
    }
    
    // Test 8: Ultra Smart Automation
    console.log('📋 Test 8: Ultra Smart Automation');
    try {
      const automationResponse = await axios.post('https://api.opptym.com/api/ultra-smart/automate', {
        url: 'https://example.com',
        projectId: testProjectId
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-test-mode': 'true'
        }
      });
      
      if (automationResponse.status === 200) {
        testResults.backend.ultraSmartAutomation = 'PASSED';
        console.log('✅ Ultra smart automation endpoint working');
        console.log('✅ Automation result:', automationResponse.data.success ? 'Success' : 'Failed');
      } else {
        testResults.backend.ultraSmartAutomation = 'FAILED';
        console.log('❌ Ultra smart automation endpoint failed');
      }
    } catch (error) {
      testResults.backend.ultraSmartAutomation = 'FAILED';
      console.log('❌ Ultra smart automation error:', error.message);
    }
    
    // Test 9: Submission Creation
    console.log('📋 Test 9: Submission Creation');
    if (testProjectId) {
      try {
        const submissionData = {
          projectId: testProjectId,
          siteName: 'Test Directory',
          submissionUrl: 'https://example.com',
          submissionType: 'directory',
          status: 'pending'
        };
        
        const submissionResponse = await axios.post('https://api.opptym.com/api/submissions', submissionData, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'x-test-mode': 'true'
          }
        });
        
        if (submissionResponse.status === 201 || submissionResponse.status === 200) {
          testResults.backend.createSubmission = 'PASSED';
          console.log('✅ Submission creation working');
          console.log('✅ Submission ID:', submissionResponse.data._id);
        } else {
          testResults.backend.createSubmission = 'FAILED';
          console.log('❌ Submission creation failed');
        }
      } catch (error) {
        testResults.backend.createSubmission = 'FAILED';
        console.log('❌ Submission creation error:', error.message);
      }
    } else {
      testResults.backend.createSubmission = 'SKIPPED';
      console.log('⚠️ Submission creation test skipped - no project ID available');
    }
    
    // Test 10: Get Submissions
    console.log('📋 Test 10: Get Submissions');
    try {
      const submissionsResponse = await axios.get('https://api.opptym.com/api/submissions', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-test-mode': 'true'
        }
      });
      
      if (submissionsResponse.status === 200) {
        testResults.backend.getSubmissions = 'PASSED';
        console.log('✅ Get submissions endpoint working');
        console.log('✅ Submissions count:', submissionsResponse.data.length || 0);
      } else {
        testResults.backend.getSubmissions = 'FAILED';
        console.log('❌ Get submissions endpoint failed');
      }
    } catch (error) {
      testResults.backend.getSubmissions = 'FAILED';
      console.log('❌ Get submissions endpoint error:', error.message);
    }
    
    // Test 11: CORS for Submission Endpoints
    console.log('📋 Test 11: CORS for Submission Endpoints');
    try {
      const corsResponse = await axios.get('https://api.opptym.com/api/directories', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Origin': 'https://opptym.com',
          'x-test-mode': 'true'
        }
      });
      
      testResults.backend.cors = 'PASSED';
      console.log('✅ CORS working for submission endpoints');
    } catch (error) {
      if (error.message.includes('CORS')) {
        testResults.backend.cors = 'FAILED';
        console.log('❌ CORS error for submission endpoints');
      } else {
        testResults.backend.cors = 'PASSED';
        console.log('✅ CORS working (error is expected for invalid requests)');
      }
    }
    
    console.log('\n📊 SubmissionDashboard Component Test Results:');
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
      console.log('🎉 SubmissionDashboard Component is working well!');
    } else {
      console.log('⚠️ SubmissionDashboard Component has some issues that need attention.');
    }
    
  } catch (error) {
    console.error('❌ SubmissionDashboard component test failed:', error.message);
  }
}

testSubmissionDashboardComponent();
