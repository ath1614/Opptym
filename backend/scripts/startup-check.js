#!/usr/bin/env node

/**
 * Startup Check Script for OPPTYM Backend
 * This script helps diagnose startup issues in production
 */

// Load environment variables first
require('dotenv').config();

const fs = require('fs');
const path = require('path');

console.log('🔍 OPPTYM Backend Startup Check');
console.log('================================');

// Check Node.js version
console.log('📋 Node.js Version:', process.version);
console.log('📋 Platform:', process.platform);
console.log('📋 Architecture:', process.arch);
console.log('📋 Process ID:', process.pid);

// Check environment variables
console.log('\n🔧 Environment Variables:');
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASSWORD'
];

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    if (envVar.includes('PASSWORD') || envVar.includes('SECRET') || envVar.includes('URI')) {
      console.log(`   ✅ ${envVar}: [HIDDEN]`);
    } else {
      console.log(`   ✅ ${envVar}: ${value}`);
    }
  } else {
    console.log(`   ❌ ${envVar}: NOT SET`);
  }
});

// Check file system
console.log('\n📁 File System Check:');
const requiredFiles = [
  'server.js',
  'package.json',
  'models/userModel.js',
  'routes/authRoutes.js',
  'controllers/authController.js'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}: EXISTS`);
  } else {
    console.log(`   ❌ ${file}: MISSING`);
  }
});

// Check package.json
console.log('\n📦 Package.json Check:');
try {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log(`   ✅ Name: ${packageJson.name}`);
  console.log(`   ✅ Version: ${packageJson.version}`);
  console.log(`   ✅ Main: ${packageJson.main}`);
  console.log(`   ✅ Start Script: ${packageJson.scripts.start}`);
} catch (error) {
  console.log(`   ❌ Error reading package.json: ${error.message}`);
}

// Check memory
console.log('\n💾 Memory Check:');
const memUsage = process.memoryUsage();
console.log(`   📊 Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
console.log(`   📊 Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`);
console.log(`   📊 External: ${Math.round(memUsage.external / 1024 / 1024)} MB`);
console.log(`   📊 RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB`);

// Check network
console.log('\n🌐 Network Check:');
console.log(`   📡 Hostname: ${require('os').hostname()}`);
console.log(`   📡 Port: ${process.env.PORT || 3000}`);

console.log('\n✅ Startup check completed!');
console.log('================================');
