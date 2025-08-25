const https = require('https');
const http = require('http');

// Test deployment URLs - replace with your actual Coolify URLs
const FRONTEND_URL = 'https://opptym.com'; // Replace with your actual URL
const BACKEND_URL = 'https://api.opptym.com'; // Replace with your actual URL

console.log('🧪 Testing OPPTYM Deployment...\n');

// Test frontend
console.log('📱 Testing Frontend...');
testURL(FRONTEND_URL, (status, data) => {
  console.log(`   Status: ${status}`);
  if (status === 200) {
    console.log('   ✅ Frontend is accessible');
    // Check if it's the new version by looking for specific content
    if (data.includes('OPPTYM') || data.includes('opptym')) {
      console.log('   ✅ Frontend content is loading');
    } else {
      console.log('   ⚠️  Frontend content may be cached');
    }
  } else {
    console.log('   ❌ Frontend is not accessible');
  }
});

// Test backend
console.log('\n🔧 Testing Backend...');
testURL(`${BACKEND_URL}/health`, (status, data) => {
  console.log(`   Status: ${status}`);
  if (status === 200) {
    console.log('   ✅ Backend is accessible');
  } else {
    console.log('   ❌ Backend is not accessible');
  }
});

function testURL(url, callback) {
  const protocol = url.startsWith('https') ? https : http;
  
  const req = protocol.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      callback(res.statusCode, data);
    });
  });
  
  req.on('error', (err) => {
    console.log(`   ❌ Error: ${err.message}`);
    callback(0, '');
  });
  
  req.setTimeout(10000, () => {
    console.log('   ⏰ Timeout');
    req.destroy();
    callback(0, '');
  });
}

console.log('\n📋 Deployment Checklist:');
console.log('1. ✅ Code changes committed and pushed');
console.log('2. ✅ Build process updated with cache busting');
console.log('3. ✅ Deployment script created');
console.log('4. 🔄 Waiting for Coolify to deploy...');
console.log('\n⏰ Expected deployment time: 5-15 minutes');
console.log('🌐 Check your Coolify dashboard for build status');
