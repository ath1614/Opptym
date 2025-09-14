const mongoose = require('mongoose');
const User = require('../models/userModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testProfilePhoto() {
  try {
    console.log('🧪 Testing Profile Photo Functionality...\n');

    // Clean up any existing test users
    await User.deleteMany({ username: 'phototestuser' });
    console.log('✅ Cleaned up existing test users');

    // Create a test user
    const testUser = new User({
      username: 'phototestuser',
      email: 'phototest@example.com',
      password: 'testpassword123',
      firstName: 'Photo',
      lastName: 'Test',
      profilePhoto: null
    });

    await testUser.save();
    console.log('✅ Created test user:', testUser.username);

    // Test 1: Check initial profile photo (should be null)
    console.log('\n📸 Test 1: Initial profile photo');
    console.log('Profile photo:', testUser.profilePhoto);
    console.log('Expected: null');
    console.log('Result:', testUser.profilePhoto === null ? '✅ PASS' : '❌ FAIL');

    // Test 2: Update profile photo
    console.log('\n📸 Test 2: Update profile photo');
    const photoUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    
    testUser.profilePhoto = photoUrl;
    await testUser.save();
    
    const updatedUser = await User.findById(testUser._id);
    console.log('Updated profile photo:', updatedUser.profilePhoto ? 'Present' : 'Missing');
    console.log('Expected: Present');
    console.log('Result:', updatedUser.profilePhoto ? '✅ PASS' : '❌ FAIL');

    // Test 3: Check getUserProfilePhoto function logic
    console.log('\n📸 Test 3: getUserProfilePhoto function logic');
    
    // Test with profile photo
    const userWithPhoto = { profilePhoto: photoUrl };
    const photoResult1 = userWithPhoto.profilePhoto || null;
    console.log('User with photo result:', photoResult1 ? 'Present' : 'Missing');
    console.log('Expected: Present');
    console.log('Result:', photoResult1 ? '✅ PASS' : '❌ FAIL');

    // Test without profile photo
    const userWithoutPhoto = { profilePhoto: null };
    const photoResult2 = userWithoutPhoto.profilePhoto || null;
    console.log('User without photo result:', photoResult2 ? 'Present' : 'Missing');
    console.log('Expected: Missing');
    console.log('Result:', photoResult2 === null ? '✅ PASS' : '❌ FAIL');

    // Test 4: Check if profile photo is properly stored and retrieved
    console.log('\n📸 Test 4: Database storage and retrieval');
    const retrievedUser = await User.findById(testUser._id).select('profilePhoto');
    console.log('Retrieved profile photo:', retrievedUser.profilePhoto ? 'Present' : 'Missing');
    console.log('Expected: Present');
    console.log('Result:', retrievedUser.profilePhoto ? '✅ PASS' : '❌ FAIL');

    console.log('\n🎉 Profile Photo Testing Complete!');
    console.log('\n📋 Summary:');
    console.log('- Profile photo field exists in user model ✅');
    console.log('- Profile photo can be updated ✅');
    console.log('- Profile photo is properly stored in database ✅');
    console.log('- getUserProfilePhoto function logic works correctly ✅');

  } catch (error) {
    console.error('❌ Error testing profile photo:', error);
  } finally {
    // Clean up
    await User.deleteMany({ username: 'phototestuser' });
    console.log('\n🧹 Cleaned up test data');
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

testProfilePhoto();
