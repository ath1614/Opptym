// Test to check if new bookmarklet code is deployed
console.log('🔍 Testing Deployment Status...');

// Check if we can access the main site
fetch('https://opptym.com')
  .then(response => response.text())
  .then(html => {
    console.log('✅ Main site accessible');
    
    // Check for build timestamp or version
    const buildTimeMatch = html.match(/__BUILD_TIME__.*?(\d+)/);
    const buildVersionMatch = html.match(/__BUILD_VERSION__.*?([^"]+)/);
    
    if (buildTimeMatch) {
      const buildTime = new Date(parseInt(buildTimeMatch[1]));
      console.log('📅 Build time:', buildTime.toLocaleString());
      console.log('⏰ Build age:', Math.round((Date.now() - buildTime.getTime()) / 1000 / 60), 'minutes ago');
    }
    
    if (buildVersionMatch) {
      console.log('🏷️ Build version:', buildVersionMatch[1]);
    }
    
    // Check if the site is using the latest assets
    const assetMatches = html.match(/assets\/[^"]+\.js/g);
    if (assetMatches) {
      console.log('📦 Assets found:', assetMatches.length);
      assetMatches.forEach(asset => {
        console.log('  -', asset);
      });
    }
  })
  .catch(error => {
    console.log('❌ Error accessing main site:', error.message);
  });

// Test API endpoints
fetch('https://api.opptym.com/')
  .then(response => response.json())
  .then(data => {
    console.log('✅ API accessible');
    console.log('📊 API response:', data);
  })
  .catch(error => {
    console.log('❌ Error accessing API:', error.message);
  });

console.log('🔍 Deployment test completed. Check console for results.');
