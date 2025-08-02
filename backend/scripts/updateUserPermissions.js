const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

async function updateUserPermissions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym');
    console.log('Connected to MongoDB');

    // Update test user with proper permissions
    const updatedUser = await User.findOneAndUpdate(
      { email: 'test@example.com' },
      {
        isAdmin: false,
        isOwner: true,
        isEmployee: false,
        role: 'owner',
        subscription: 'pro',
        subscriptionStatus: 'active',
        'customPermissions.canCreateProjects': true,
        'customPermissions.canEditProjects': true,
        'customPermissions.canDeleteProjects': true,
        'customPermissions.canViewAllProjects': true,
        'customPermissions.canSubmitToDirectories': true,
        'customPermissions.canViewSubmissionReports': true,
        'customPermissions.canManageSubmissions': true,
        'customPermissions.canUseSeoTools': true,
        'customPermissions.canUseAdvancedTools': true,
        'customPermissions.canExportReports': true,
        'customPermissions.canViewAnalytics': true,
        'customPermissions.maxProjects': 100,
        'customPermissions.maxSubmissionsPerMonth': 1000,
        'customPermissions.apiCallLimit': 10000
      },
      { new: true }
    );

    if (updatedUser) {
      console.log('✅ User permissions updated successfully!');
      console.log('Email: test@example.com');
      console.log('Role: owner');
      console.log('Subscription: pro');
      console.log('Can create projects: true');
      console.log('Can submit to directories: true');
      console.log('Can use SEO tools: true');
    } else {
      console.log('❌ User not found');
    }
  } catch (error) {
    console.error('❌ Error updating user permissions:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateUserPermissions(); 