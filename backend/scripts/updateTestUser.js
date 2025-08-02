const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

async function updateTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym');
    console.log('Connected to MongoDB');

    // Update existing test user to be regular user
    const updatedUser = await User.findOneAndUpdate(
      { email: 'test@example.com' },
      { isAdmin: false },
      { new: true }
    );

    if (updatedUser) {
      console.log('✅ Test user updated successfully!');
      console.log('Email: test@example.com');
      console.log('Password: password123');
      console.log('Username:', updatedUser.username);
      console.log('Admin:', updatedUser.isAdmin);
      console.log('Subscription:', updatedUser.subscription);
    } else {
      console.log('❌ Test user not found');
    }
  } catch (error) {
    console.error('❌ Error updating test user:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateTestUser(); 