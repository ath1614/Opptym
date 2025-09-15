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

async function getUserIds() {
  try {
    const users = await User.find({}, '_id email username subscription').limit(10);
    console.log('📊 Found users with IDs:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.username}) - ${user.subscription} - ID: ${user._id}`);
    });
    
    if (users.length === 0) {
      console.log('⚠️ No users found in database');
    }
  } catch (error) {
    console.error('❌ Failed to get user IDs:', error);
  }
}

async function main() {
  console.log('🚀 Getting User IDs...\n');
  
  await connectDB();
  await getUserIds();
  
  console.log('\n✅ User ID Check Complete!');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});
