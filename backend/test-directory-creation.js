#!/usr/bin/env node

/**
 * Test script to verify directory creation functionality
 */

const mongoose = require('mongoose');
const Directory = require('./models/directoryModel');
const User = require('./models/userModel');

async function testDirectoryCreation() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clean up any existing test user first
    await User.deleteOne({ email: 'testadmin@test.com' });
    
    // Create a test user first
    const testUser = new User({
      username: 'testadmin123',
      email: 'testadmin@test.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'Admin',
      subscription: 'enterprise',
      role: 'admin'
    });
    
    await testUser.save();
    console.log('✅ Test admin user created');

    // Test directory creation
    const directoryData = {
      name: 'Test Directory Creation',
      domain: 'testdirectory.com',
      description: 'A test directory for creation testing',
      category: 'business',
      country: 'Global',
      classification: 'Directory Submission',
      pageRank: 3,
      daScore: 30,
      spamScore: 2,
      isPremium: false,
      requiresApproval: true,
      submissionUrl: 'https://testdirectory.com/submit',
      contactEmail: 'admin@testdirectory.com',
      submissionGuidelines: 'Please follow our guidelines',
      priority: 10,
      freeUserLimit: 0,
      starterUserLimit: 5,
      proUserLimit: 20,
      businessUserLimit: 50,
      enterpriseUserLimit: -1,
      isCustom: true,
      createdBy: testUser._id
    };

    const directory = new Directory(directoryData);
    await directory.save();
    
    console.log('✅ Directory created successfully:', {
      id: directory._id,
      name: directory.name,
      domain: directory.domain,
      classification: directory.classification
    });

    // Test duplicate prevention
    try {
      const duplicateDirectory = new Directory(directoryData);
      await duplicateDirectory.save();
      console.log('❌ Duplicate directory was created (should have failed)');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ Duplicate directory prevention working correctly');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Clean up
    await Directory.deleteOne({ _id: directory._id });
    await User.deleteOne({ _id: testUser._id });
    console.log('✅ Test data cleaned up');

    await mongoose.connection.close();
    console.log('✅ Test completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDirectoryCreation();
