const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PRODUCTION_API_URL = 'https://api.opptym.com/api';
const TEST_USER = {
  email: 'shrivitthalp@gmail.com',
  password: 'Baba@2281'
};

async function testProjectValidation() {
  try {
    // Authenticate
    const authResponse = await fetch(`${PRODUCTION_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });

    if (!authResponse.ok) {
      throw new Error('Authentication failed');
    }

    const authData = await authResponse.json();
    const token = authData.token;
    
    console.log('🔍 Testing Enhanced Project Validation...');
    
    // Test cases for validation
    const testCases = [
      {
        name: 'Empty required fields',
        data: {
          title: '',
          url: '',
          email: '',
          companyName: '',
          businessPhone: '',
          description: '',
          address1: '',
          city: '',
          state: '',
          country: '',
          pincode: ''
        },
        expectedErrors: ['title', 'url', 'email', 'companyName', 'businessPhone', 'description', 'address1', 'city', 'state', 'country', 'pincode']
      },
      {
        name: 'Invalid email format',
        data: {
          title: 'Test Project',
          url: 'https://example.com',
          email: 'invalid-email',
          companyName: 'Test Company',
          businessPhone: '+1234567890',
          description: 'This is a test description that is long enough to pass validation',
          address1: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          country: 'Test Country',
          pincode: '12345'
        },
        expectedErrors: ['email']
      },
      {
        name: 'Invalid URL format',
        data: {
          title: 'Test Project',
          url: 'not-a-valid-url',
          email: 'test@example.com',
          companyName: 'Test Company',
          businessPhone: '+1234567890',
          description: 'This is a test description that is long enough to pass validation',
          address1: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          country: 'Test Country',
          pincode: '12345'
        },
        expectedErrors: ['url']
      },
      {
        name: 'Invalid phone number',
        data: {
          title: 'Test Project',
          url: 'https://example.com',
          email: 'test@example.com',
          companyName: 'Test Company',
          businessPhone: 'invalid-phone',
          description: 'This is a test description that is long enough to pass validation',
          address1: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          country: 'Test Country',
          pincode: '12345'
        },
        expectedErrors: ['businessPhone']
      },
      {
        name: 'Title too short',
        data: {
          title: 'AB',
          url: 'https://example.com',
          email: 'test@example.com',
          companyName: 'Test Company',
          businessPhone: '+1234567890',
          description: 'This is a test description that is long enough to pass validation',
          address1: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          country: 'Test Country',
          pincode: '12345'
        },
        expectedErrors: ['title']
      },
      {
        name: 'Description too short',
        data: {
          title: 'Test Project',
          url: 'https://example.com',
          email: 'test@example.com',
          companyName: 'Test Company',
          businessPhone: '+1234567890',
          description: 'Too short',
          address1: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          country: 'Test Country',
          pincode: '12345'
        },
        expectedErrors: ['description']
      },
      {
        name: 'Valid project data',
        data: {
          title: 'Test Project',
          url: 'https://example.com',
          email: 'test@example.com',
          companyName: 'Test Company',
          businessPhone: '+1234567890',
          description: 'This is a test description that is long enough to pass validation',
          address1: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          country: 'Test Country',
          pincode: '12345'
        },
        expectedErrors: []
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📊 Testing: ${testCase.name}`);
      
      const response = await fetch(`${PRODUCTION_API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.data)
      });
      
      const responseData = await response.json();
      
      if (testCase.expectedErrors.length === 0) {
        // Should succeed
        if (response.ok) {
          console.log('✅ Test passed: Project created successfully');
        } else {
          console.log('❌ Test failed: Expected success but got error:', responseData);
        }
      } else {
        // Should fail with validation errors
        if (!response.ok && responseData.validationErrors) {
          const receivedFields = responseData.validationErrors.map((err: any) => err.field);
          const missingFields = testCase.expectedErrors.filter(field => !receivedFields.includes(field));
          const extraFields = receivedFields.filter((field: string) => !testCase.expectedErrors.includes(field));
          
          if (missingFields.length === 0 && extraFields.length === 0) {
            console.log('✅ Test passed: All expected validation errors received');
            console.log('   Validation errors:', responseData.validationErrors.map((err: any) => `${err.field}: ${err.message}`));
          } else {
            console.log('❌ Test failed: Validation error mismatch');
            console.log('   Expected fields:', testCase.expectedErrors);
            console.log('   Received fields:', receivedFields);
            console.log('   Missing fields:', missingFields);
            console.log('   Extra fields:', extraFields);
          }
        } else {
          console.log('❌ Test failed: Expected validation errors but got:', responseData);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProjectValidation();
