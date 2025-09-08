const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

const updateAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lowlife9366:x6TX9HuAvESb3DJD@opptym.tkcz5nx.mongodb.net/?retryWrites=true&w=majority&appName=opptym');
    console.log('✅ Connected to MongoDB');

    // Update admin user to be email verified
    const result = await User.updateOne(
      { email: 'shrivitthalp@gmail.com' },
      { 
        $set: { 
          isEmailVerified: true,
          role: 'admin'
        } 
      }
    );

    if (result.matchedCount > 0) {
      console.log('✅ Admin user updated successfully');
      console.log('📧 Email verification status: true');
      console.log('👑 Role: admin');
    } else {
      console.log('❌ Admin user not found');
    }

    // Verify the update
    const adminUser = await User.findOne({ email: 'shrivitthalp@gmail.com' });
    if (adminUser) {
      console.log('🔍 Admin user details:');
      console.log('   Email:', adminUser.email);
      console.log('   Username:', adminUser.username);
      console.log('   Role:', adminUser.role);
      console.log('   Email Verified:', adminUser.isEmailVerified);
      console.log('   Created At:', adminUser.createdAt);
    }

  } catch (error) {
    console.error('❌ Error updating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
updateAdminUser();
