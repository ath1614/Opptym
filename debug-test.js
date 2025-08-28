const BASE_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:5173';

console.log('🔍 Debugging endpoint issues...');

// Test 1: Backend health
try {
  console.log('Testing backend health...');
  const response1 = await fetch(`${BASE_URL}/api/test-simple`);
  const data1 = await response1.json();
  console.log('✅ Backend health:', response1.status, data1.message);
} catch (error) {
  console.log('❌ Backend health failed:', error.message);
}

// Test 2: Frontend health
try {
  console.log('Testing frontend health...');
  const response2 = await fetch(FRONTEND_URL);
  const data2 = await response2.text();
  console.log('✅ Frontend health:', response2.status, data2.includes('opptym'));
} catch (error) {
  console.log('❌ Frontend health failed:', error.message);
}

// Test 3: Bookmarklet validation
try {
  console.log('Testing bookmarklet validation...');
  const response3 = await fetch(`${BASE_URL}/api/bookmarklet/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token: 'test' })
  });
  const data3 = await response3.json();
  console.log('✅ Bookmarklet validation:', response3.status, data3);
} catch (error) {
  console.log('❌ Bookmarklet validation failed:', error.message);
}

console.log('�� Debug complete');
