const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym', {
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
    user.subscription = 'enterprise';
    user.subscriptionStatus = 'active';
    await user.save();
    
    console.log(`✅ User ${email} is now an admin`);
    console.log(`✅ User role: ${user.role}`);
    console.log(`✅ User isAdmin: ${user.isAdmin}`);
    console.log(`✅ User subscription: ${user.subscription}`);
  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Make shrivitthalp@gmail.com admin
makeUserAdmin('shrivitthalp@gmail.com');
