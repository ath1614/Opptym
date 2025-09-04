const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/userModel');

async function createAdminUser() {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: 'shrivitthalp@gmail.com' });
    
    if (user) {
      console.log('User already exists, updating to admin...');
      user.role = 'admin';
      user.isAdmin = true;
      user.subscription = 'enterprise';
      user.subscriptionStatus = 'active';
      await user.save();
      console.log(`✅ User shrivitthalp@gmail.com is now an admin`);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('Baba@1234', 12);
      
      user = new User({
        username: 'shrivitthalp',
        email: 'shrivitthalp@gmail.com',
        password: hashedPassword,
        firstName: 'Shrivitthal',
        lastName: 'P',
        role: 'admin',
        isAdmin: true,
        subscription: 'enterprise',
        subscriptionStatus: 'active',
        features: {
          canCreateProjects: true,
          canEditProjects: true,
          canDeleteProjects: true,
          canViewAllProjects: true,
          canSubmitDirectories: true,
          canViewSubmissionReports: true,
          canManageSubmissions: true,
          canUseSeoTools: true,
          canUseAdvancedTools: true,
          canExportReports: true,
          canAccessAnalytics: true,
          canAccessAdmin: true
        },
        planLimits: {
          submissions: -1, // unlimited
          projects: -1, // unlimited
          tools: -1, // unlimited
          apiCalls: -1 // unlimited
        }
      });
      
      await user.save();
      console.log(`✅ Created admin user shrivitthalp@gmail.com`);
    }
    
    console.log(`✅ User role: ${user.role}`);
    console.log(`✅ User isAdmin: ${user.isAdmin}`);
    console.log(`✅ User subscription: ${user.subscription}`);
    console.log(`✅ User email: ${user.email}`);
    console.log(`✅ User password: Baba@1234`);
    
  } catch (error) {
    console.error('Error creating/updating user:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Create the admin user
createAdminUser();
