const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import models
const User = require('../models/userModel');
const Submission = require('../models/submissionModel');
const Project = require('../models/projectModel');

// Test user credentials
const TEST_USER = {
  email: 'shrivitthalp@gmail.com',
  password: 'Baba@2281'
};

const API_BASE_URL = 'http://localhost:3000/api';

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function authenticateUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_USER)
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ User authenticated successfully');
    return data.token;
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    return null;
  }
}

async function testOverallStats(token) {
  console.log('\n📊 Testing Overall Statistics...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/submissions/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Stats request failed: ${response.status}`);
    }

    const stats = await response.json();
    console.log('✅ Overall Stats Response:');
    console.log(JSON.stringify(stats, null, 2));

    // Verify structure
    const requiredFields = ['overall', 'byClassification'];
    const overallRequired = ['total', 'recent', 'byStatus', 'successRate'];
    const statusRequired = ['pending', 'approved', 'rejected', 'completed'];

    // Check overall structure
    requiredFields.forEach(field => {
      if (!stats[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    });

    // Check overall stats structure
    overallRequired.forEach(field => {
      if (stats.overall[field] === undefined) {
        throw new Error(`Missing overall field: ${field}`);
      }
    });

    // Check status counts
    statusRequired.forEach(status => {
      if (stats.overall.byStatus[status] === undefined) {
        throw new Error(`Missing status: ${status}`);
      }
    });

    console.log('✅ Overall stats structure is correct');

    return stats;
  } catch (error) {
    console.error('❌ Overall stats test failed:', error);
    return null;
  }
}

async function testClassificationStats(token) {
  console.log('\n📊 Testing Classification-Specific Statistics...');
  
  const classifications = ['directory', 'article', 'bookmarklet', 'classified', 'forum', 'social'];
  
  for (const type of classifications) {
    try {
      console.log(`\n🔍 Testing ${type} stats...`);
      
      const response = await fetch(`${API_BASE_URL}/submissions/stats/${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log(`⚠️ ${type} stats not available (${response.status})`);
        continue;
      }

      const stats = await response.json();
      console.log(`✅ ${type} Stats:`, JSON.stringify(stats, null, 2));

      // Verify structure
      const requiredFields = ['type', 'total', 'recent', 'byStatus', 'successRate'];
      const statusRequired = ['pending', 'approved', 'rejected', 'completed'];

      requiredFields.forEach(field => {
        if (stats[field] === undefined) {
          throw new Error(`Missing field in ${type}: ${field}`);
        }
      });

      statusRequired.forEach(status => {
        if (stats.byStatus[status] === undefined) {
          throw new Error(`Missing status in ${type}: ${status}`);
        }
      });

      console.log(`✅ ${type} stats structure is correct`);

    } catch (error) {
      console.error(`❌ ${type} stats test failed:`, error);
    }
  }
}

async function createTestSubmissions(userId) {
  console.log('\n📝 Creating test submissions for stats verification...');
  
  try {
    // Get user's first project
    const project = await Project.findOne({ userId: userId });
    if (!project) {
      console.log('⚠️ No project found, creating one...');
      const newProject = await Project.create({
        userId: userId,
        title: 'Test Project for Stats',
        url: 'https://test.com',
        category: 'Test',
        email: 'test@test.com',
        name: 'Test User',
        companyName: 'Test Company',
        businessPhone: '1234567890',
        description: 'Test project for stats verification'
      });
      console.log('✅ Test project created:', newProject._id);
    }

    const projectId = project ? project._id : (await Project.findOne({ userId: userId }))._id;

    // Create test submissions with different statuses and types
    const testSubmissions = [
      {
        userId: userId,
        projectId: projectId,
        siteName: 'test-directory.com',
        submissionType: 'directory',
        status: 'pending'
      },
      {
        userId: userId,
        projectId: projectId,
        siteName: 'test-article.com',
        submissionType: 'article',
        status: 'approved'
      },
      {
        userId: userId,
        projectId: projectId,
        siteName: 'test-bookmarklet.com',
        submissionType: 'bookmarklet',
        status: 'completed',
        metadata: {
          url: 'https://test-bookmarklet.com',
          fieldsFilled: 5,
          source: 'bookmarklet',
          token: 'test_token_123'
        }
      },
      {
        userId: userId,
        projectId: projectId,
        siteName: 'test-classified.com',
        submissionType: 'classified',
        status: 'rejected'
      }
    ];

    // Clear existing test submissions
    await Submission.deleteMany({ 
      userId: userId, 
      siteName: { $regex: /^test-/ } 
    });

    // Create new test submissions
    const createdSubmissions = await Submission.insertMany(testSubmissions);
    console.log(`✅ Created ${createdSubmissions.length} test submissions`);

    return createdSubmissions;
  } catch (error) {
    console.error('❌ Failed to create test submissions:', error);
    return [];
  }
}

async function verifyStatsWithRealData(token, userId) {
  console.log('\n🔍 Verifying stats with real data...');
  
  try {
    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    console.log(`📊 User: ${user.email} (${user.subscription})`);

    // Get actual submission counts from database
    const dbStats = await Submission.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: {
            type: '$submissionType',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('📊 Database Stats:');
    dbStats.forEach(stat => {
      console.log(`  ${stat._id.type} - ${stat._id.status}: ${stat.count}`);
    });

    // Get API stats
    const response = await fetch(`${API_BASE_URL}/submissions/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const apiStats = await response.json();
    console.log('\n📊 API Stats:');
    console.log('Overall:', apiStats.overall);
    console.log('By Classification:', apiStats.byClassification);

    // Verify counts match
    let allMatch = true;
    dbStats.forEach(dbStat => {
      const type = dbStat._id.type;
      const status = dbStat._id.status;
      const dbCount = dbStat.count;
      
      if (apiStats.byClassification[type]) {
        const apiCount = apiStats.byClassification[type][status] || 0;
        if (dbCount !== apiCount) {
          console.log(`❌ Mismatch: ${type}-${status} - DB: ${dbCount}, API: ${apiCount}`);
          allMatch = false;
        } else {
          console.log(`✅ Match: ${type}-${status} - ${dbCount}`);
        }
      }
    });

    if (allMatch) {
      console.log('✅ All stats match between database and API');
    } else {
      console.log('❌ Some stats do not match');
    }

  } catch (error) {
    console.error('❌ Stats verification failed:', error);
  }
}

async function main() {
  console.log('🚀 Starting Stats System Audit...\n');
  
  await connectDB();
  
  const token = await authenticateUser();
  if (!token) {
    console.log('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  // Decode token to get user ID
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;

  // Create test submissions
  await createTestSubmissions(userId);

  // Test overall stats
  await testOverallStats(token);

  // Test classification-specific stats
  await testClassificationStats(token);

  // Verify stats with real data
  await verifyStatsWithRealData(token, userId);

  console.log('\n✅ Stats System Audit Complete!');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Audit failed:', error);
  process.exit(1);
});
