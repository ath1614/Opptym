const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

async function makeUserAdmin(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return;
    }

    user.isAdmin = true;
    await user.save();
    
    console.log(`User ${email} is now an admin!`);
    console.log('User details:', {
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Usage: node makeAdmin.js user@example.com
const email = process.argv[2];
if (!email) {
  console.log('Please provide an email address');
  console.log('Usage: node makeAdmin.js user@example.com');
  process.exit(1);
}

makeUserAdmin(email); 