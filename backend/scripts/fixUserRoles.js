const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model
const User = require('../models/userModel');

async function fixUserRoles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym');
    console.log('✅ Connected to MongoDB');

    // Find all users with invalid roles and update them to 'user'
    const result = await User.updateMany(
      { role: { $nin: ['user', 'admin'] } },
      { $set: { role: 'user' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users with invalid roles to 'user' role`);

    // Fix users with long usernames
    const usersWithLongUsernames = await User.find({
      username: { $exists: true, $regex: /.{31,}/ }
    });

    console.log(`📝 Found ${usersWithLongUsernames.length} users with long usernames`);

    for (const user of usersWithLongUsernames) {
      const oldUsername = user.username;
      let newUsername = user.username.substring(0, 30);
      
      // Check if username already exists and make it unique
      let counter = 1;
      while (await User.findOne({ username: newUsername, _id: { $ne: user._id } })) {
        newUsername = user.username.substring(0, 25) + counter.toString().padStart(2, '0');
        counter++;
        if (counter > 99) break; // Prevent infinite loop
      }
      
      user.username = newUsername;
      await user.save();
      console.log(`✅ Truncated username for ${user.email}: "${oldUsername}" → "${user.username}"`);
    }

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
      // Fix firstName and lastName
      if (!user.firstName || user.firstName.trim() === '') {
        user.firstName = (user.username || 'User').substring(0, 50);
      }
      if (!user.lastName || user.lastName.trim() === '') {
        user.lastName = (user.username || 'User').substring(0, 50);
      }
      
      // Fix username if too long
      if (user.username && user.username.length > 30) {
        user.username = user.username.substring(0, 30);
        console.log(`⚠️ Truncated username for ${user.email} to: ${user.username}`);
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
