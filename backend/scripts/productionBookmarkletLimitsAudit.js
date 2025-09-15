const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Production API endpoints
const PRODUCTION_API_URL = 'https://api.opptym.com/api';

async function testBookmarkletLimits() {
  console.log('🔍 Testing Bookmarklet Usage Limits in Production...\n');

  try {
    // Test with multiple tokens to simulate different users
    const testTokens = [
      `opptym_${Date.now()}_free_user_${Math.random().toString(36).substr(2, 9)}`,
      `opptym_${Date.now()}_paid_user_${Math.random().toString(36).substr(2, 9)}`,
      `opptym_${Date.now()}_test_user_${Math.random().toString(36).substr(2, 9)}`
    ];

    for (let i = 0; i < testTokens.length; i++) {
      const token = testTokens[i];
      console.log(`\n📊 Testing token ${i + 1}: ${token.substring(0, 20)}...`);
      
      // Test multiple submissions with the same token
      for (let submission = 1; submission <= 7; submission++) { // Test up to 7 submissions
        console.log(`\n📤 Testing submission ${submission}/7...`);
        
        const submissionData = {
          token: token,
          url: `https://test-directory-${submission}.com`,
          fieldsFilled: 5,
          filledFields: [
            { field: 'name', value: 'Test Name' },
            { field: 'email', value: 'test@test.com' },
            { field: 'phone', value: '1234567890' },
            { field: 'url', value: 'https://test.com' },
            { field: 'description', value: 'Test description' }
          ],
          timestamp: Date.now()
        };

        try {
          const response = await fetch(`${PRODUCTION_API_URL}/submissions/bookmarklet`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData)
          });

          const result = await response.json();

          if (response.ok) {
            console.log(`✅ Submission ${submission} successful:`, result.message);
          } else {
            console.log(`❌ Submission ${submission} failed:`, result.error);
            
            if (result.error.includes('limit exceeded')) {
              console.log(`✅ Correctly blocked submission ${submission} (limit exceeded)`);
            } else if (result.error.includes('expired')) {
              console.log(`✅ Correctly blocked submission ${submission} (token expired)`);
            } else if (result.error.includes('Invalid token')) {
              console.log(`✅ Correctly blocked submission ${submission} (invalid token)`);
            } else {
              console.log(`❌ Unexpected error for submission ${submission}`);
            }
          }
        } catch (error) {
          console.error(`❌ Network error for submission ${submission}:`, error.message);
        }
      }
    }

  } catch (error) {
    console.error('❌ Bookmarklet limits test failed:', error);
  }
}

async function testTokenExpiration() {
  console.log('\n⏰ Testing Token Expiration in Production...');
  
  try {
    // Create expired token (25 hours old)
    const expiredTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
    const expiredToken = `opptym_${expiredTimestamp}_test_user_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`📝 Generated expired token: ${expiredToken.substring(0, 30)}...`);

    const submissionData = {
      token: expiredToken,
      url: 'https://test-expired.com',
      fieldsFilled: 3,
      filledFields: [
        { field: 'name', value: 'Test Name' },
        { field: 'email', value: 'test@test.com' },
        { field: 'url', value: 'https://test.com' }
      ],
      timestamp: Date.now()
    };

    const response = await fetch(`${PRODUCTION_API_URL}/submissions/bookmarklet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    });

    const result = await response.json();

    if (!response.ok && result.error.includes('expired')) {
      console.log('✅ Token expiration working correctly');
    } else {
      console.log('❌ Token expiration not working correctly');
    }

  } catch (error) {
    console.error('❌ Token expiration test failed:', error);
  }
}

async function testInvalidToken() {
  console.log('\n🔒 Testing Invalid Token in Production...');
  
  try {
    const submissionData = {
      token: 'invalid_token_format',
      url: 'https://test-invalid.com',
      fieldsFilled: 2,
      filledFields: [
        { field: 'name', value: 'Test Name' },
        { field: 'email', value: 'test@test.com' }
      ],
      timestamp: Date.now()
    };

    const response = await fetch(`${PRODUCTION_API_URL}/submissions/bookmarklet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    });

    const result = await response.json();

    if (!response.ok && result.error.includes('Invalid token format')) {
      console.log('✅ Invalid token rejection working correctly');
    } else {
      console.log('❌ Invalid token rejection not working correctly');
    }

  } catch (error) {
    console.error('❌ Invalid token test failed:', error);
  }
}

async function main() {
  console.log('🚀 Starting Production Bookmarklet Limits Audit...\n');
  
  // Test bookmarklet limits
  await testBookmarkletLimits();
  
  // Test token expiration
  await testTokenExpiration();
  
  // Test invalid token
  await testInvalidToken();

  console.log('\n✅ Production Bookmarklet Limits Audit Complete!');
}

main().catch(error => {
  console.error('❌ Audit failed:', error);
  process.exit(1);
});
