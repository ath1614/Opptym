#!/usr/bin/env node

/**
 * Script to inject build information into the frontend
 * This runs during the build process to capture commit SHA and build time
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getBuildInfo() {
  let commit = 'development';
  let branch = 'main';
  
  try {
    // Try to get git commit SHA
    commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.log('⚠️ Could not get git commit SHA:', error.message);
  }
  
  try {
    // Try to get git branch
    branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.log('⚠️ Could not get git branch:', error.message);
  }

  const buildInfo = {
    commit: commit,
    commitShort: commit.substring(0, 7),
    buildTime: new Date().toISOString(),
    timestamp: Date.now(),
    version: '3.0.0',
    branch: branch,
    nodeVersion: process.version
  };

  return buildInfo;
}

function injectBuildInfo() {
  const buildInfo = getBuildInfo();
  
  console.log('🔧 Injecting build information:');
  console.log(`   Commit: ${buildInfo.commitShort} (${buildInfo.commit})`);
  console.log(`   Branch: ${buildInfo.branch}`);
  console.log(`   Build Time: ${buildInfo.buildTime}`);
  console.log(`   Version: ${buildInfo.version}`);

  // Create build info script to inject into HTML
  const buildScript = `
<script>
  window.__COMMIT_SHA__ = '${buildInfo.commit}';
  window.__COMMIT_SHORT__ = '${buildInfo.commitShort}';
  window.__BUILD_TIME__ = '${buildInfo.buildTime}';
  window.__BUILD_VERSION__ = '${buildInfo.version}';
  window.__BUILD_BRANCH__ = '${buildInfo.branch}';
  window.__TIMESTAMP__ = ${buildInfo.timestamp};
  console.log('🚀 Build Info:', {
    commit: '${buildInfo.commitShort}',
    version: '${buildInfo.version}',
    buildTime: '${buildInfo.buildTime}',
    branch: '${buildInfo.branch}'
  });
</script>`;

  // Read index.html template
  const indexPath = path.join(__dirname, '../index.html');
  let indexContent = '';
  
  try {
    indexContent = fs.readFileSync(indexPath, 'utf8');
  } catch (error) {
    console.error('❌ Could not read index.html:', error.message);
    return;
  }

  // Inject build script before closing head tag
  const updatedContent = indexContent.replace(
    '</head>',
    `  ${buildScript}\n  </head>`
  );

  // Write updated index.html
  try {
    fs.writeFileSync(indexPath, updatedContent);
    console.log('✅ Build info injected into index.html');
  } catch (error) {
    console.error('❌ Could not write index.html:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  injectBuildInfo();
}

module.exports = { getBuildInfo, injectBuildInfo };
