#!/usr/bin/env node

/**
 * Full Bookmarklet Audit
 * Test bookmarklet with shrivitthalp@gmail.com account
 */

const mongoose = require('mongoose');
const User = require('../models/userModel');
const Project = require('../models/projectModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/opptym', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fullBookmarkletAudit() {
  console.log('🔍 FULL BOOKMARKLET AUDIT');
  console.log('=========================\n');

  try {
    // Find the test user
    const testUser = await User.findOne({ email: 'shrivitthalp@gmail.com' });
    
    if (!testUser) {
      console.log('❌ User shrivitthalp@gmail.com not found');
      return;
    }

    console.log('👤 Found user:', testUser.email);
    console.log('📅 User created:', testUser.createdAt);
    console.log('🔑 User ID:', testUser._id);

    // Get all projects for this user
    const projects = await Project.find({ userId: testUser._id });
    console.log(`\n📁 Found ${projects.length} projects for this user`);

    if (projects.length === 0) {
      console.log('❌ No projects found for this user');
      return;
    }

    // Test each project
    for (let i = 0; i < Math.min(projects.length, 3); i++) {
      const project = projects[i];
      console.log(`\n🔍 TESTING PROJECT ${i + 1}: ${project.title}`);
      console.log('='.repeat(50));
      
      console.log('📋 Project details:');
      console.log('- ID:', project._id);
      console.log('- Title:', project.title);
      console.log('- Email:', project.email);
      console.log('- URL:', project.url);
      console.log('- Company:', project.companyName);
      console.log('- Description:', project.description);
      console.log('- Meta Description:', project.metaDescription);

      // Test bookmarklet generation
      await testBookmarkletGeneration(project, i + 1);
    }

    // Test the actual bookmarklet execution simulation
    console.log('\n🎯 SIMULATING BOOKMARKLET EXECUTION');
    console.log('====================================');
    
    const testProject = projects[0];
    const testDirectory = { 
      name: 'Test Directory', 
      url: 'https://test-directory.com',
      classification: 'Directory'
    };
    
    await simulateBookmarkletExecution(testProject, testDirectory);

  } catch (error) {
    console.error('❌ Audit failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

async function testBookmarkletGeneration(project, projectNum) {
  console.log(`\n🔧 Testing bookmarklet generation for project ${projectNum}...`);
  
  try {
    // Simulate the exact DirectoryGrid.tsx logic
    const selectedProject = project;
    const selectedDirectory = { 
      name: `Test Directory ${projectNum}`, 
      url: `https://test-directory-${projectNum}.com`,
      classification: 'Directory'
    };
    const bookmarkletToken = `test-token-${Date.now()}-${projectNum}`;
    
    console.log('📝 Generating bookmarklet code...');
    
    // This is the EXACT code from DirectoryGrid.tsx line 749
    const bookmarkletCode = `javascript:(function(){console.log('Bookmarklet clicked!');var token='${bookmarkletToken}';var projectData=${JSON.stringify(selectedProject)};var directoryData=${JSON.stringify(selectedDirectory)};console.log('Token:',token,'Project:',projectData,'Directory:',directoryData);var script=document.createElement('script');script.src='https://opptym.com/bookmarklet.js?token='+token+'&project='+encodeURIComponent(JSON.stringify(projectData))+'&directory='+encodeURIComponent(JSON.stringify(directoryData));console.log('Loading script:',script.src);document.head.appendChild(script);})();`;
    
    console.log('✅ Bookmarklet code generated');
    console.log('Code length:', bookmarkletCode.length);
    
    // Test URL generation
    console.log('🌐 Testing URL generation...');
    
    const projectData = selectedProject;
    const directoryData = selectedDirectory;
    
    const url = `https://opptym.com/bookmarklet.js?token=${bookmarkletToken}&project=${encodeURIComponent(JSON.stringify(projectData))}&directory=${encodeURIComponent(JSON.stringify(directoryData))}`;
    
    console.log('✅ URL generated successfully');
    console.log('URL length:', url.length);
    
    // Test URL parsing
    const urlObj = new URL(url);
    const token = urlObj.searchParams.get('token');
    const projectParam = urlObj.searchParams.get('project');
    const directoryParam = urlObj.searchParams.get('directory');
    
    console.log('📋 URL parameters:');
    console.log('- Token:', token);
    console.log('- Project param exists:', !!projectParam);
    console.log('- Directory param exists:', !!directoryParam);
    
    if (projectParam) {
      try {
        const decodedProject = decodeURIComponent(projectParam);
        const parsedProject = JSON.parse(decodedProject);
        console.log('✅ Project data parsed successfully');
        console.log('- Project name:', parsedProject.title || parsedProject.name);
        console.log('- Project email:', parsedProject.email);
        console.log('- Project URL:', parsedProject.url);
        console.log('- Project company:', parsedProject.companyName);
      } catch (parseError) {
        console.error('❌ Project data parsing failed:', parseError.message);
        console.error('First 200 chars of project param:', projectParam.substring(0, 200));
      }
    }
    
    if (directoryParam) {
      try {
        const decodedDirectory = decodeURIComponent(directoryParam);
        const parsedDirectory = JSON.parse(decodedDirectory);
        console.log('✅ Directory data parsed successfully');
        console.log('- Directory name:', parsedDirectory.name);
        console.log('- Directory URL:', parsedDirectory.url);
      } catch (parseError) {
        console.error('❌ Directory data parsing failed:', parseError.message);
      }
    }
    
  } catch (error) {
    console.error(`❌ Bookmarklet generation failed for project ${projectNum}:`, error.message);
  }
}

async function simulateBookmarkletExecution(project, directory) {
  console.log('\n🎭 Simulating bookmarklet execution...');
  
  try {
    // Simulate what happens when the bookmarklet runs
    const bookmarkletToken = `sim-token-${Date.now()}`;
    
    // Generate the URL that would be loaded
    const url = `https://opptym.com/bookmarklet.js?token=${bookmarkletToken}&project=${encodeURIComponent(JSON.stringify(project))}&directory=${encodeURIComponent(JSON.stringify(directory))}`;
    
    console.log('📡 Simulating script loading from:', url.substring(0, 100) + '...');
    
    // Simulate the bookmarklet.js logic
    console.log('🔍 Simulating bookmarklet.js execution...');
    
    // Extract URL parameters (simulating what bookmarklet.js does)
    const urlObj = new URL(url);
    const token = urlObj.searchParams.get('token');
    const projectDataParam = urlObj.searchParams.get('project');
    const directoryDataParam = urlObj.searchParams.get('directory');
    
    console.log('📋 Extracted parameters:');
    console.log('- Token:', token);
    console.log('- Project param exists:', !!projectDataParam);
    console.log('- Directory param exists:', !!directoryDataParam);
    
    let projectData = null;
    let directoryData = null;
    
    // Parse project data (simulating bookmarklet.js logic)
    if (projectDataParam) {
      console.log('📝 Parsing project data...');
      try {
        const decodedProject = decodeURIComponent(projectDataParam);
        console.log('Decoded project length:', decodedProject.length);
        
        projectData = JSON.parse(decodedProject);
        
        // Check for double encoding
        if (typeof projectData === 'string') {
          console.log('🔄 Detected double-encoded data, parsing again...');
          projectData = JSON.parse(projectData);
        }
        
        console.log('✅ Project data parsed successfully');
        console.log('Project type:', typeof projectData);
        console.log('Project keys:', Object.keys(projectData));
        console.log('Project name:', projectData.title || projectData.name);
        console.log('Project email:', projectData.email);
        
      } catch (parseError) {
        console.error('❌ Failed to parse project data:', parseError.message);
        projectData = null;
      }
    }
    
    // Parse directory data
    if (directoryDataParam) {
      console.log('📝 Parsing directory data...');
      try {
        const decodedDirectory = decodeURIComponent(directoryDataParam);
        directoryData = JSON.parse(decodedDirectory);
        
        if (typeof directoryData === 'string') {
          console.log('🔄 Detected double-encoded directory data, parsing again...');
          directoryData = JSON.parse(directoryData);
        }
        
        console.log('✅ Directory data parsed successfully');
        console.log('Directory name:', directoryData.name);
        
      } catch (parseError) {
        console.error('❌ Failed to parse directory data:', parseError.message);
        directoryData = null;
      }
    }
    
    // Simulate the final decision
    console.log('\n🎯 Final bookmarklet decision:');
    if (projectData) {
      console.log('✅ Project data available - would proceed with auto-fill');
      console.log('📋 Available fields for auto-fill:');
      console.log('- Name:', projectData.title || projectData.name || 'N/A');
      console.log('- Email:', projectData.email || 'N/A');
      console.log('- Company:', projectData.companyName || 'N/A');
      console.log('- URL:', projectData.url || 'N/A');
      console.log('- Description:', projectData.description || projectData.metaDescription || 'N/A');
    } else {
      console.log('❌ No project data - would show fallback message');
    }
    
  } catch (error) {
    console.error('❌ Bookmarklet execution simulation failed:', error.message);
  }
}

// Run the audit
fullBookmarkletAudit();
