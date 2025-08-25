#!/bin/bash

echo "🚀 Starting OPPTYM Deployment..."

# Clean everything
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf .vite/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build with cache busting
echo "🔨 Building application..."
npm run build

# Verify build
echo "✅ Verifying build..."
if [ -d "dist" ]; then
    echo "✅ Build successful! Files in dist/:"
    ls -la dist/
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Deployment ready! Push to trigger Coolify deployment."
