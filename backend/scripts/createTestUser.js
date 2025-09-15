const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/userModel');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function createTestUser() {
  try {
    // Check if test user already exists
    let testUser = await User.findOne({ email: 'test@opptym.com' });
    
    if (testUser) {
      console.log('✅ Test user already exists:', testUser.email);
      return testUser;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    testUser = await User.create({
      email: 'test@opptym.com',
      username: 'testuser',
      password: hashedPassword,
      subscription: 'free',
      features: {
        submissions: true,
        projects: 1,
        seoTools: false,
        apiAccess: false
      },
      usage: {
        submissionsUsed: 0,
        projectsUsed: 0,
        seoToolsUsed: 0,
        apiCallsUsed: 0
      }
    });

    console.log('✅ Test user created:', testUser.email);
    return testUser;
  } catch (error) {
    console.error('❌ Failed to create test user:', error);
    return null;
  }
}

async function main() {
  console.log('🚀 Creating Test User...\n');
  
  await connectDB();
  await createTestUser();
  
  console.log('\n✅ Test User Creation Complete!');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});
