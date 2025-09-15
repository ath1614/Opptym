#!/usr/bin/env node

/**
 * Create Test Project and Test Bookmarklet
 * For shrivitthalp@gmail.com account
 */

const mongoose = require('mongoose');
const User = require('../models/userModel');
const Project = require('../models/projectModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/opptym', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createTestProjectAndTest() {
  console.log('🔧 CREATING TEST PROJECT AND TESTING BOOKMARKLET');
  console.log('================================================\n');

  try {
    // Find the test user
    const testUser = await User.findOne({ email: 'shrivitthalp@gmail.com' });
    
    if (!testUser) {
      console.log('❌ User shrivitthalp@gmail.com not found');
      return;
    }

    console.log('👤 Found user:', testUser.email);
    console.log('🔑 User ID:', testUser._id);

    // Create test projects
    const testProjects = [
      {
        userId: testUser._id,
        title: 'Test Restaurant Business',
        name: 'Test Restaurant Business',
        url: 'https://testrestaurant.com',
        email: 'contact@testrestaurant.com',
        companyName: 'Test Restaurant Inc',
        description: 'A delicious test restaurant serving amazing food',
        metaDescription: 'Best test restaurant in town with great food',
        category: 'Restaurant',
        keywords: ['restaurant', 'food', 'dining'],
        targetKeywords: ['best restaurant', 'good food'],
        businessPhone: '+1-555-0123',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        zip: '12345'
      },
      {
        userId: testUser._id,
        title: 'Test Tech Company',
        name: 'Test Tech Company',
        url: 'https://testtech.com',
        email: 'info@testtech.com',
        companyName: 'Test Tech Solutions',
        description: 'Leading technology solutions provider',
        metaDescription: 'Innovative tech solutions for modern businesses',
        category: 'Technology',
        keywords: ['technology', 'software', 'solutions'],
        targetKeywords: ['tech solutions', 'software development'],
        businessPhone: '+1-555-0456',
        address: '456 Tech Avenue',
        city: 'Tech City',
        state: 'Tech State',
        country: 'Tech Country',
        zip: '67890'
      }
    ];

    console.log('\n📁 Creating test projects...');
    
    for (let i = 0; i < testProjects.length; i++) {
      const projectData = testProjects[i];
      
      // Check if project already exists
      const existingProject = await Project.findOne({ 
        userId: testUser._id, 
        title: projectData.title 
      });
      
      if (existingProject) {
        console.log(`✅ Project ${i + 1} already exists: ${projectData.title}`);
        continue;
      }
      
      const project = new Project(projectData);
      await project.save();
      console.log(`✅ Created project ${i + 1}: ${projectData.title}`);
    }

    // Get all projects for testing
    const projects = await Project.find({ userId: testUser._id });
    console.log(`\n📁 Total projects for user: ${projects.length}`);

    // Test bookmarklet with each project
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      console.log(`\n🔍 TESTING BOOKMARKLET WITH PROJECT ${i + 1}: ${project.title}`);
      console.log('='.repeat(60));
      
      await testBookmarkletWithProject(project, i + 1);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

async function testBookmarkletWithProject(project, projectNum) {
  console.log(`\n🔧 Testing bookmarklet with project: ${project.title}`);
  
  try {
    // Create test directory
    const testDirectory = { 
      name: `Test Directory ${projectNum}`, 
      url: `https://test-directory-${projectNum}.com`,
      classification: 'Directory'
    };
    
    const bookmarkletToken = `test-token-${Date.now()}-${projectNum}`;
    
    console.log('📝 Project data:');
    console.log('- Title:', project.title);
    console.log('- Email:', project.email);
    console.log('- Company:', project.companyName);
    console.log('- URL:', project.url);
    console.log('- Description:', project.description);
    console.log('- Phone:', project.businessPhone);
    console.log('- Address:', project.address);
    
    // Generate bookmarklet code (exact same as DirectoryGrid.tsx)
    console.log('\n🔧 Generating bookmarklet code...');
    
    const bookmarkletCode = `javascript:(function(){console.log('Bookmarklet clicked!');var token='${bookmarkletToken}';var projectData=${JSON.stringify(project)};var directoryData=${JSON.stringify(testDirectory)};console.log('Token:',token,'Project:',projectData,'Directory:',directoryData);var script=document.createElement('script');script.src='https://opptym.com/bookmarklet.js?token='+token+'&project='+encodeURIComponent(JSON.stringify(projectData))+'&directory='+encodeURIComponent(JSON.stringify(directoryData));console.log('Loading script:',script.src);document.head.appendChild(script);})();`;
    
    console.log('✅ Bookmarklet code generated');
    console.log('Code length:', bookmarkletCode.length);
    
    // Test URL generation
    console.log('\n🌐 Testing URL generation...');
    
    const url = `https://opptym.com/bookmarklet.js?token=${bookmarkletToken}&project=${encodeURIComponent(JSON.stringify(project))}&directory=${encodeURIComponent(JSON.stringify(testDirectory))}`;
    
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
        console.log('- Project company:', parsedProject.companyName);
        console.log('- Project phone:', parsedProject.businessPhone);
        console.log('- Project address:', parsedProject.address);
        
        // Test form data preparation
        console.log('\n📋 Testing form data preparation...');
        const formData = {
          name: parsedProject.name || parsedProject.title || '',
          company: parsedProject.companyName || parsedProject.name || parsedProject.title || '',
          email: parsedProject.email || '',
          phone: parsedProject.businessPhone || parsedProject.phone || '',
          url: parsedProject.url || '',
          website: parsedProject.url || '',
          description: parsedProject.description || parsedProject.metaDescription || '',
          address: parsedProject.address || parsedProject.address1 || '',
          city: parsedProject.city || '',
          state: parsedProject.state || '',
          country: parsedProject.country || '',
          zip: parsedProject.zip || parsedProject.pincode || ''
        };
        
        console.log('✅ Form data prepared:');
        Object.entries(formData).forEach(([key, value]) => {
          if (value) {
            console.log(`  - ${key}: "${value}"`);
          }
        });
        
        const filledFields = Object.values(formData).filter(value => value && value.trim() !== '').length;
        console.log(`📊 Total fields with data: ${filledFields}/12`);
        
      } catch (parseError) {
        console.error('❌ Project data parsing failed:', parseError.message);
        console.error('Error details:', parseError);
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
    
    console.log(`\n🎯 Project ${projectNum} test completed successfully!`);
    
  } catch (error) {
    console.error(`❌ Bookmarklet test failed for project ${projectNum}:`, error.message);
    console.error('Error details:', error);
  }
}

// Run the test
createTestProjectAndTest();
