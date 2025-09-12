const { connectDB } = require('../utils/dbConnection');
const User = require('../models/userModel');
require('dotenv').config();

// Method 1: Make user admin by email
async function makeUserAdminByEmail(email) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found with that email address');
      return false;
    }
    
    console.log('👤 Found user:', {
      id: user._id,
      username: user.username,
      email: user.email,
      currentRole: user.role,
      subscription: user.subscription
    });
    
    if (user.role === 'admin') {
      console.log('ℹ️ User is already an admin');
      return true;
    }
    
    // Update user role to admin
    user.role = 'admin';
    user.features.canAccessAdmin = true;
    await user.save();
    
    console.log('✅ Successfully made user admin!');
    console.log('📊 Updated user details:', {
      id: user._id,
      username: user.username,
      email: user.email,
      newRole: user.role,
      canAccessAdmin: user.features.canAccessAdmin
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error making user admin:', error);
    return false;
  }
}

// Method 2: Make user admin by username
async function makeUserAdminByUsername(username) {
  try {
    console.log(`🔍 Looking for user with username: ${username}`);
    
    const user = await User.findOne({ username: username });
    
    if (!user) {
      console.log('❌ User not found with that username');
      return false;
    }
    
    console.log('👤 Found user:', {
      id: user._id,
      username: user.username,
      email: user.email,
      currentRole: user.role,
      subscription: user.subscription
    });
    
    if (user.role === 'admin') {
      console.log('ℹ️ User is already an admin');
      return true;
    }
    
    // Update user role to admin
    user.role = 'admin';
    user.features.canAccessAdmin = true;
    await user.save();
    
    console.log('✅ Successfully made user admin!');
    console.log('📊 Updated user details:', {
      id: user._id,
      username: user.username,
      email: user.email,
      newRole: user.role,
      canAccessAdmin: user.features.canAccessAdmin
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error making user admin:', error);
    return false;
  }
}

// Method 3: Make user admin by user ID
async function makeUserAdminById(userId) {
  try {
    console.log(`🔍 Looking for user with ID: ${userId}`);
    
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('❌ User not found with that ID');
      return false;
    }
    
    console.log('👤 Found user:', {
      id: user._id,
      username: user.username,
      email: user.email,
      currentRole: user.role,
      subscription: user.subscription
    });
    
    if (user.role === 'admin') {
      console.log('ℹ️ User is already an admin');
      return true;
    }
    
    // Update user role to admin
    user.role = 'admin';
    user.features.canAccessAdmin = true;
    await user.save();
    
    console.log('✅ Successfully made user admin!');
    console.log('📊 Updated user details:', {
      id: user._id,
      username: user.username,
      email: user.email,
      newRole: user.role,
      canAccessAdmin: user.features.canAccessAdmin
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error making user admin:', error);
    return false;
  }
}

// Method 4: List all users (helper function)
async function listAllUsers() {
  try {
    console.log('📋 Listing all users:');
    console.log('=' .repeat(80));
    
    const users = await User.find({}, 'username email role subscription createdAt').sort({ createdAt: -1 });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email})`);
      console.log(`   Role: ${user.role} | Subscription: ${user.subscription} | Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });
    
    console.log(`📊 Total users: ${users.length}`);
  } catch (error) {
    console.error('❌ Error listing users:', error);
  }
}

// Method 5: Remove admin role (make user regular user)
async function removeAdminRole(email) {
  try {
    console.log(`🔍 Looking for admin user with email: ${email}`);
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found with that email address');
      return false;
    }
    
    if (user.role !== 'admin') {
      console.log('ℹ️ User is not an admin');
      return true;
    }
    
    // Update user role to regular user
    user.role = 'user';
    user.features.canAccessAdmin = false;
    await user.save();
    
    console.log('✅ Successfully removed admin role!');
    console.log('📊 Updated user details:', {
      id: user._id,
      username: user.username,
      email: user.email,
      newRole: user.role,
      canAccessAdmin: user.features.canAccessAdmin
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error removing admin role:', error);
    return false;
  }
}

// Main function
async function main() {
  await connectDB();
  
  // Get command line arguments
  const args = process.argv.slice(2);
  const command = args[0];
  const identifier = args[1];
  
  console.log('🔧 OPPTYM User Admin Management Tool');
  console.log('=' .repeat(50));
  
  if (!command) {
    console.log('📖 Usage:');
    console.log('  node makeUserAdmin.js list                           - List all users');
    console.log('  node makeUserAdmin.js admin-email <email>            - Make user admin by email');
    console.log('  node makeUserAdmin.js admin-username <username>      - Make user admin by username');
    console.log('  node makeUserAdmin.js admin-id <user_id>             - Make user admin by ID');
    console.log('  node makeUserAdmin.js remove-admin <email>           - Remove admin role');
    console.log('');
    console.log('📝 Examples:');
    console.log('  node makeUserAdmin.js list');
    console.log('  node makeUserAdmin.js admin-email john@example.com');
    console.log('  node makeUserAdmin.js admin-username john_doe');
    console.log('  node makeUserAdmin.js admin-id 507f1f77bcf86cd799439011');
    console.log('  node makeUserAdmin.js remove-admin john@example.com');
    return;
  }
  
  switch (command) {
    case 'list':
      await listAllUsers();
      break;
      
    case 'admin-email':
      if (!identifier) {
        console.log('❌ Please provide an email address');
        console.log('Usage: node makeUserAdmin.js admin-email <email>');
        return;
      }
      await makeUserAdminByEmail(identifier);
      break;
      
    case 'admin-username':
      if (!identifier) {
        console.log('❌ Please provide a username');
        console.log('Usage: node makeUserAdmin.js admin-username <username>');
        return;
      }
      await makeUserAdminByUsername(identifier);
      break;
      
    case 'admin-id':
      if (!identifier) {
        console.log('❌ Please provide a user ID');
        console.log('Usage: node makeUserAdmin.js admin-id <user_id>');
        return;
      }
      await makeUserAdminById(identifier);
      break;
      
    case 'remove-admin':
      if (!identifier) {
        console.log('❌ Please provide an email address');
        console.log('Usage: node makeUserAdmin.js remove-admin <email>');
        return;
      }
      await removeAdminRole(identifier);
      break;
      
    default:
      console.log('❌ Unknown command:', command);
      console.log('Run without arguments to see usage instructions');
  }
  
  // Close database connection
  await mongoose.connection.close();
  console.log('🔌 Database connection closed');
}

// Run the script
main().catch(console.error);
