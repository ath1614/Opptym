const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const makeTestUserAdmin = async () => {
  try {
    // Find the test user
    const testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      console.log('❌ Test user not found. Please create the test user first.');
      return;
    }

    // Update to admin
    testUser.isAdmin = true;
    testUser.role = 'admin';
    testUser.subscription = 'enterprise';
    
    // Give all permissions
    testUser.customPermissions = {
      canUseSeoTools: true,
      canUseAdvancedTools: true,
      canExportReports: true,
      canCreateProjects: true,
      canEditProjects: true,
      canDeleteProjects: true,
      canViewAllProjects: true,
      canSubmitToDirectories: true,
      canViewSubmissionReports: true,
      canManageSubmissions: true,
      canManageTeamMembers: true,
      canViewTeamReports: true,
      canAssignTasks: true,
      canAccessAdminPanel: true,
      canManageUsers: true,
      canViewAnalytics: true,
      canManageBilling: true,
      canUseAPI: true,
      apiCallLimit: -1,
      maxProjects: -1,
      maxSubmissionsPerMonth: -1,
      maxTeamMembers: -1
    };

    await testUser.save();

    console.log('✅ Test user updated to admin successfully!');
    console.log('Email:', testUser.email);
    console.log('Password: password123');
    console.log('Username:', testUser.username);
    console.log('Admin:', testUser.isAdmin);
    console.log('Role:', testUser.role);
    console.log('Subscription:', testUser.subscription);
    console.log('\n🎉 You can now access the admin panel!');

  } catch (error) {
    console.error('❌ Error updating test user:', error.message);
  }
};

// Run the script
connectDB().then(makeTestUserAdmin).then(() => {
  mongoose.connection.close();
  console.log('Database connection closed');
}); 