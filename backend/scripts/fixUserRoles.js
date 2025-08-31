const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model
const User = require('../models/userModel');

async function fixUserRoles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym');
    console.log('✅ Connected to MongoDB');

    // Find all users with role 'employee' and update them to 'user'
    const result = await User.updateMany(
      { role: 'employee' },
      { $set: { role: 'user' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users from 'employee' to 'user' role`);

    // Also ensure all users have firstName and lastName
    const usersWithoutNames = await User.find({
      $or: [
        { firstName: { $exists: false } },
        { firstName: null },
        { firstName: '' },
        { lastName: { $exists: false } },
        { lastName: null },
        { lastName: '' }
      ]
    });

    console.log(`📝 Found ${usersWithoutNames.length} users without firstName/lastName`);

    for (const user of usersWithoutNames) {
      if (!user.firstName || user.firstName.trim() === '') {
        user.firstName = user.username || 'User';
      }
      if (!user.lastName || user.lastName.trim() === '') {
        user.lastName = user.username || 'User';
      }
      await user.save();
      console.log(`✅ Fixed user ${user.username} (${user.email})`);
    }

    console.log('✅ User role and name fixes completed successfully');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
    process.exit(1);
  }
}

// Run the script
fixUserRoles();
