const mongoose = require('mongoose');
const Project = require('../models/projectModel');
const Submission = require('../models/submissionModel');
require('dotenv').config();

async function clearSampleData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym');
    console.log('Connected to MongoDB');

    // Clear all projects and submissions
    const projectsResult = await Project.deleteMany({});
    const submissionsResult = await Submission.deleteMany({});

    console.log('✅ Sample data cleared successfully!');
    console.log(`Projects deleted: ${projectsResult.deletedCount}`);
    console.log(`Submissions deleted: ${submissionsResult.deletedCount}`);
    console.log('Database is now clean and ready for real user data.');
  } catch (error) {
    console.error('❌ Error clearing sample data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

clearSampleData(); 