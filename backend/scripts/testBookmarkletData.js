#!/usr/bin/env node

/**
 * Test Bookmarklet Data Flow
 * Debug what's happening with project data
 */

const mongoose = require('mongoose');
const User = require('../models/userModel');
const Project = require('../models/projectModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/opptym', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testBookmarkletData() {
  console.log('🔍 TESTING BOOKMARKLET DATA FLOW');
  console.log('=================================\n');

  try {
    // Get a test user and project
    const testUser = await User.findOne();
    const testProject = await Project.findOne({ userId: testUser._id });
    
    if (!testUser || !testProject) {
      console.log('❌ No test user or project found');
      return;
    }

    console.log('👤 Test User:', testUser.email);
    console.log('📁 Test Project:', testProject);

    // Simulate the exact bookmarklet generation from DirectoryGrid.tsx
    console.log('\n🔧 Simulating DirectoryGrid bookmarklet generation...');
    
    const selectedProject = testProject;
    const selectedDirectory = { name: 'Test Directory', url: 'https://test.com' };
    const bookmarkletToken = 'test-token-123';
    
    // This is the exact code from DirectoryGrid.tsx line 749
    const bookmarkletCode = `javascript:(function(){console.log('Bookmarklet clicked!');var token='${bookmarkletToken}';var projectData=${JSON.stringify(selectedProject)};var directoryData=${JSON.stringify(selectedDirectory)};console.log('Token:',token,'Project:',projectData,'Directory:',directoryData);var script=document.createElement('script');script.src='https://opptym.com/bookmarklet.js?token='+token+'&project='+encodeURIComponent(projectData)+'&directory='+encodeURIComponent(directoryData);console.log('Loading script:',script.src);document.head.appendChild(script);})();`;
    
    console.log('\n📝 Generated bookmarklet code:');
    console.log(bookmarkletCode.substring(0, 500) + '...');

    // Extract the URL that would be generated
    const projectDataInBookmarklet = JSON.stringify(selectedProject);
    const directoryDataInBookmarklet = JSON.stringify(selectedDirectory);
    
    const url = `https://opptym.com/bookmarklet.js?token=${bookmarkletToken}&project=${encodeURIComponent(projectDataInBookmarklet)}&directory=${encodeURIComponent(directoryDataInBookmarklet)}`;
    
    console.log('\n🌐 Generated URL:');
    console.log('URL length:', url.length);
    console.log('URL preview:', url.substring(0, 200) + '...');
    
    // Parse the URL parameters
    const urlObj = new URL(url);
    const token = urlObj.searchParams.get('token');
    const projectParam = urlObj.searchParams.get('project');
    const directoryParam = urlObj.searchParams.get('directory');
    
    console.log('\n📋 URL Parameters:');
    console.log('Token:', token);
    console.log('Project param exists:', !!projectParam);
    console.log('Directory param exists:', !!directoryParam);
    
    if (projectParam) {
      try {
        const decodedProject = decodeURIComponent(projectParam);
        console.log('Decoded project length:', decodedProject.length);
        console.log('Decoded project preview:', decodedProject.substring(0, 200));
        
        const parsedProject = JSON.parse(decodedProject);
        console.log('✅ Project parsed successfully');
        console.log('Project type:', typeof parsedProject);
        console.log('Project keys:', Object.keys(parsedProject));
        console.log('Project name:', parsedProject.name || parsedProject.title);
        console.log('Project email:', parsedProject.email);
        
      } catch (parseError) {
        console.error('❌ Failed to parse project:', parseError.message);
        console.error('First 200 chars of project param:', projectParam.substring(0, 200));
      }
    }
    
    if (directoryParam) {
      try {
        const decodedDirectory = decodeURIComponent(directoryParam);
        const parsedDirectory = JSON.parse(decodedDirectory);
        console.log('✅ Directory parsed successfully');
        console.log('Directory name:', parsedDirectory.name);
        console.log('Directory URL:', parsedDirectory.url);
      } catch (parseError) {
        console.error('❌ Failed to parse directory:', parseError.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testBookmarkletData();
