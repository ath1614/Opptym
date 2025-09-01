#!/bin/bash

echo "🚀 Starting OPPTYM Deployment..."

# Clean everything
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf .vite/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Inject build info and build
echo "🔧 Injecting build information..."
node scripts/set-build-info.js

echo "🔨 Building application..."
npm run build

# Verify build
echo "✅ Verifying build..."
if [ -d "dist" ]; then
    echo "✅ Build successful! Files in dist/:"
    ls -la dist/
    
    # Show build info
    echo "📊 Build Information:"
    node -e "
    try {
      const fs = require('fs');
      const indexContent = fs.readFileSync('dist/index.html', 'utf8');
      const commitMatch = indexContent.match(/window\\.__COMMIT_SHA__ = '([^']+)'/);
      const versionMatch = indexContent.match(/window\\.__BUILD_VERSION__ = '([^']+)'/);
      const timeMatch = indexContent.match(/window\\.__BUILD_TIME__ = '([^']+)'/);
      
      console.log('   Commit:', commitMatch ? commitMatch[1].substring(0, 8) : 'unknown');
      console.log('   Version:', versionMatch ? versionMatch[1] : 'unknown');
      console.log('   Build Time:', timeMatch ? new Date(timeMatch[1]).toLocaleString() : 'unknown');
    } catch (e) {
      console.log('   Could not extract build info');
    }
    "
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Deployment ready! Push to trigger Coolify deployment."
