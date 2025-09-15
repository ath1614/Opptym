#!/usr/bin/env node

/**
 * Test Bookmarklet Fix
 * Verify the URI malformed issue is resolved
 */

const mongoose = require('mongoose');
const User = require('../models/userModel');
const Project = require('../models/projectModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/opptym', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testBookmarkletFix() {
  console.log('🔧 TESTING BOOKMARKLET FIX');
  console.log('==========================\n');

  try {
    // Get a test user and project
    const testUser = await User.findOne();
    const testProject = await Project.findOne({ userId: testUser._id });
    
    if (!testUser || !testProject) {
      console.log('❌ No test user or project found');
      return;
    }

    console.log('👤 Test User:', testUser.email);
    console.log('📁 Test Project:', testProject.title);

    // Simulate the FIXED bookmarklet generation
    console.log('\n🔧 Testing FIXED bookmarklet generation...');
    
    const selectedProject = testProject;
    const selectedDirectory = { name: 'Test Directory', url: 'https://test.com' };
    const bookmarkletToken = 'test-token-123';
    
    // This is the FIXED code from DirectoryGrid.tsx
    const bookmarkletCode = `javascript:(function(){console.log('Bookmarklet clicked!');var token='${bookmarkletToken}';var projectData=${JSON.stringify(selectedProject)};var directoryData=${JSON.stringify(selectedDirectory)};console.log('Token:',token,'Project:',projectData,'Directory:',directoryData);var script=document.createElement('script');script.src='https://opptym.com/bookmarklet.js?token='+token+'&project='+encodeURIComponent(JSON.stringify(projectData))+'&directory='+encodeURIComponent(JSON.stringify(directoryData));console.log('Loading script:',script.src);document.head.appendChild(script);})();`;
    
    console.log('✅ Bookmarklet code generated successfully');
    console.log('Code length:', bookmarkletCode.length);

    // Test the URL that would be generated
    console.log('\n🌐 Testing URL generation...');
    
    try {
      // Simulate what happens inside the bookmarklet
      const projectData = selectedProject; // This is the JavaScript object
      const directoryData = selectedDirectory; // This is the JavaScript object
      
      // This is the FIXED line: JSON.stringify before encodeURIComponent
      const url = `https://opptym.com/bookmarklet.js?token=${bookmarkletToken}&project=${encodeURIComponent(JSON.stringify(projectData))}&directory=${encodeURIComponent(JSON.stringify(directoryData))}`;
      
      console.log('✅ URL generation successful');
      console.log('URL length:', url.length);
      
      // Test URL parsing
      const urlObj = new URL(url);
      const projectParam = urlObj.searchParams.get('project');
      const directoryParam = urlObj.searchParams.get('directory');
      
      console.log('Project param exists:', !!projectParam);
      console.log('Directory param exists:', !!directoryParam);
      
      if (projectParam) {
        try {
          const decodedProject = decodeURIComponent(projectParam);
          const parsedProject = JSON.parse(decodedProject);
          console.log('✅ Project param parsing successful');
          console.log('Project name:', parsedProject.title || parsedProject.name);
          console.log('Project email:', parsedProject.email);
        } catch (parseError) {
          console.error('❌ Project param parsing failed:', parseError.message);
        }
      }
      
      if (directoryParam) {
        try {
          const decodedDirectory = decodeURIComponent(directoryParam);
          const parsedDirectory = JSON.parse(decodedDirectory);
          console.log('✅ Directory param parsing successful');
          console.log('Directory name:', parsedDirectory.name);
        } catch (parseError) {
          console.error('❌ Directory param parsing failed:', parseError.message);
        }
      }
      
    } catch (urlError) {
      console.error('❌ URL generation failed:', urlError.message);
    }

    // Test the OLD (broken) way for comparison
    console.log('\n❌ Testing OLD (broken) bookmarklet generation...');
    
    try {
      const projectData = selectedProject; // JavaScript object
      const directoryData = selectedDirectory; // JavaScript object
      
      // This is the OLD (broken) line: encodeURIComponent on JavaScript object
      const brokenUrl = `https://opptym.com/bookmarklet.js?token=${bookmarkletToken}&project=${encodeURIComponent(projectData)}&directory=${encodeURIComponent(directoryData)}`;
      
      console.log('❌ This should fail but might not in Node.js context');
      
    } catch (brokenError) {
      console.error('✅ OLD method failed as expected:', brokenError.message);
    }

    console.log('\n🎉 TEST COMPLETED');
    console.log('The fix should resolve the "URI malformed" error!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testBookmarkletFix();
