const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/userModel');

async function makeUserAdmin(email) {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return;
    }
    
    user.role = 'admin';
    user.isAdmin = true;
    await user.save();
    
    console.log(`✅ User ${email} is now an admin`);
  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Make the admin user admin
makeUserAdmin('admin@example.com'); 