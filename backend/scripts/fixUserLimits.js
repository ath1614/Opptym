const mongoose = require('mongoose');
const User = require('../models/userModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixUserLimits() {
  try {
    console.log('🔧 Fixing user limits and usage tracking...');
    
    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to process`);
    
    let fixedCount = 0;
    
    for (const user of users) {
      let needsUpdate = false;
      
      // Initialize usage object if missing
      if (!user.usage) {
        user.usage = {
          submissionsUsed: 0,
          projectsUsed: 0,
          seoToolsUsed: 0,
          apiCallsUsed: 0
        };
        needsUpdate = true;
        console.log(`🔧 Initialized usage for user: ${user.email}`);
      }
      
      // Initialize planLimits if missing
      if (!user.planLimits) {
        user.setPlanLimitsSync();
        needsUpdate = true;
        console.log(`🔧 Initialized planLimits for user: ${user.email}`);
      }
      
      // Fix invalid role
      if (user.role && !['user', 'admin'].includes(user.role)) {
        console.log(`🔧 Fixing invalid role '${user.role}' for user: ${user.email}`);
        user.role = 'admin'; // Convert invalid roles to admin
        needsUpdate = true;
      }
      
      // Initialize features if missing
      if (!user.features) {
        user.features = {
          canCreateProjects: user.subscription !== 'free' || user.isInTrialPeriod(),
          canSubmitDirectories: user.subscription !== 'free' || user.isInTrialPeriod(),
          canUseSeoTools: user.subscription !== 'free' || user.isInTrialPeriod(),
          canAccessAnalytics: ['test', 'pro', 'business', 'enterprise'].includes(user.subscription),
          canAccessAdmin: user.role === 'admin'
        };
        needsUpdate = true;
        console.log(`🔧 Initialized features for user: ${user.email}`);
      }
      
      // Count actual projects and submissions
      const Project = require('../models/projectModel');
      const Submission = require('../models/submissionModel');
      
      const actualProjects = await Project.countDocuments({ userId: user._id });
      const actualSubmissions = await Submission.countDocuments({ userId: user._id });
      
      // Update usage counts if they don't match reality
      if (user.usage.projectsUsed !== actualProjects) {
        user.usage.projectsUsed = actualProjects;
        needsUpdate = true;
        console.log(`🔧 Fixed project count for user ${user.email}: ${actualProjects}`);
      }
      
      if (user.usage.submissionsUsed !== actualSubmissions) {
        user.usage.submissionsUsed = actualSubmissions;
        needsUpdate = true;
        console.log(`🔧 Fixed submission count for user ${user.email}: ${actualSubmissions}`);
      }
      
      // Save if any updates were made
      if (needsUpdate) {
        await user.save();
        fixedCount++;
        console.log(`✅ Updated user: ${user.email}`);
      }
    }
    
    console.log(`\n🎉 Fix completed! Updated ${fixedCount} users out of ${users.length} total users.`);
    
    // Show summary
    console.log('\n📊 User Summary:');
    const freeUsers = await User.find({ subscription: 'free' });
    const paidUsers = await User.find({ subscription: { $ne: 'free' } });
    
    console.log(`Free users: ${freeUsers.length}`);
    console.log(`Paid users: ${paidUsers.length}`);
    
    // Show usage statistics
    const Project = require('../models/projectModel');
    const Submission = require('../models/submissionModel');
    const totalProjects = await Project.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    
    console.log(`Total projects: ${totalProjects}`);
    console.log(`Total submissions: ${totalSubmissions}`);
    
  } catch (error) {
    console.error('❌ Error fixing user limits:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the fix
if (require.main === module) {
  fixUserLimits();
}

module.exports = fixUserLimits;
