const mongoose = require('mongoose');
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

async function checkUsers() {
  try {
    const users = await User.find({}, 'email username subscription').limit(10);
    console.log('📊 Found users:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.username}) - ${user.subscription}`);
    });
    
    if (users.length === 0) {
      console.log('⚠️ No users found in database');
    }
  } catch (error) {
    console.error('❌ Failed to check users:', error);
  }
}

async function main() {
  console.log('🚀 Checking Users...\n');
  
  await connectDB();
  await checkUsers();
  
  console.log('\n✅ User Check Complete!');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});
