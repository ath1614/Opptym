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

async function testUserLookup() {
  try {
    const userId = '68b93b6ab8facf963ca3bda5';
    console.log('Testing user lookup with ID:', userId);
    
    // Test with string
    const userString = await User.findById(userId);
    console.log('User found with string:', userString ? userString.email : 'Not found');
    
    // Test with ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const userObject = await User.findById(userObjectId);
    console.log('User found with ObjectId:', userObject ? userObject.email : 'Not found');
    
    // Test with email
    const userEmail = await User.findOne({ email: 'shrivitthalp@gmail.com' });
    console.log('User found with email:', userEmail ? userEmail.email : 'Not found');
    console.log('User ID from email lookup:', userEmail ? userEmail._id : 'Not found');
    
  } catch (error) {
    console.error('❌ User lookup test failed:', error);
  }
}

async function main() {
  console.log('🚀 Testing User Lookup...\n');
  
  await connectDB();
  await testUserLookup();
  
  console.log('\n✅ User Lookup Test Complete!');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});
