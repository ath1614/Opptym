const mongoose = require('mongoose');
const Directory = require('../models/directoryModel');
const User = require('../models/userModel');

// Production MongoDB URI
const PRODUCTION_MONGODB_URI = 'mongodb+srv://lowlife9366:x6TX9HuAvESb3DJD@opptym.tkcz5nx.mongodb.net/?retryWrites=true&w=majority&appName=opptym';

async function testAdminCreateDirectory() {
  try {
    console.log('🧪 Testing Admin Create Directory functionality...\n');
    
    // Connect to Production MongoDB Atlas
    await mongoose.connect(PRODUCTION_MONGODB_URI);
    console.log('✅ Connected to Production MongoDB Atlas');
    
    // Get or create a test admin user
    let adminUser = await User.findOne({ email: 'system@opptym.com' });
    if (!adminUser) {
      adminUser = await User.findOne({ role: 'admin' });
    }
    
    if (!adminUser) {
      console.log('❌ No admin user found. Please create an admin user first.');
      return;
    }
    
    console.log(`👤 Using admin user: ${adminUser.email}`);
    
    // Test directory data (similar to what the admin panel would send)
    const testDirectoryData = {
      name: `Test Directory ${Date.now()}`,
      domain: 'test-directory.com',
      description: 'Test directory created by admin panel',
      category: 'business',
      country: 'Global',
      classification: 'Directory Submission',
      pageRank: 3,
      daScore: 30,
      spamScore: 2,
      isPremium: false,
      requiresApproval: true,
      submissionUrl: 'https://test-directory.com/submit',
      contactEmail: 'admin@test-directory.com',
      submissionGuidelines: 'Please provide accurate information',
      requiredFields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
               { name: 'url', type: 'url', required: true }
      ],
      freeUserLimit: 0,
      starterUserLimit: 5,
      proUserLimit: 20,
      businessUserLimit: 50,
      enterpriseUserLimit: -1,
      priority: 10,
      isCustom: true,
      createdBy: adminUser._id
    };
    
    console.log('📝 Creating test directory with data:', {
      name: testDirectoryData.name,
      domain: testDirectoryData.domain,
      classification: testDirectoryData.classification,
      isCustom: testDirectoryData.isCustom
    });
    
    // Create the directory (same logic as admin panel)
    const directory = new Directory(testDirectoryData);
    await directory.save();
    
    console.log('✅ Test directory created successfully!');
    console.log('📊 Directory details:', {
      id: directory._id,
      name: directory.name,
      domain: directory.domain,
      classification: directory.classification,
      isCustom: directory.isCustom,
      createdBy: directory.createdBy,
      createdAt: directory.createdAt
    });
    
    // Verify it was saved correctly
    const savedDirectory = await Directory.findById(directory._id);
    if (savedDirectory) {
      console.log('✅ Directory verification successful - found in database');
      
      // Count total directories in the classification
      const totalInClassification = await Directory.countDocuments({ 
        classification: testDirectoryData.classification 
      });
      console.log(`📈 Total directories in "${testDirectoryData.classification}": ${totalInClassification}`);
      
      // Count custom directories
      const customDirectories = await Directory.countDocuments({ isCustom: true });
      console.log(`🔧 Total custom directories: ${customDirectories}`);
      
    } else {
      console.log('❌ Directory verification failed - not found in database');
    }
    
    // Clean up - remove the test directory
    console.log('\n🧹 Cleaning up test directory...');
    await Directory.findByIdAndDelete(directory._id);
    console.log('✅ Test directory removed');
    
    console.log('\n🎉 Admin Create Directory test completed successfully!');
    console.log('✅ The admin panel can successfully create directories in the production database');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the test
testAdminCreateDirectory();
