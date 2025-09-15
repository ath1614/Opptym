#!/usr/bin/env node

/**
 * Audit Bookmarklet Encoding Issue
 * Investigate URI malformed error
 */

const mongoose = require('mongoose');
const User = require('../models/userModel');
const Project = require('../models/projectModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/opptym', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function auditBookmarkletEncoding() {
  console.log('🔍 AUDITING BOOKMARKLET ENCODING ISSUE');
  console.log('=====================================\n');

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

    // Test 1: Check for problematic characters in project data
    console.log('\n🔍 TEST 1: Checking for problematic characters...');
    
    const projectString = JSON.stringify(testProject);
    console.log('Project JSON length:', projectString.length);
    
    // Check for characters that might cause URI encoding issues
    const problematicChars = ['\n', '\r', '\t', '\u0000', '\u0001', '\u0002', '\u0003', '\u0004', '\u0005', '\u0006', '\u0007', '\u0008', '\u000B', '\u000C', '\u000E', '\u000F', '\u0010', '\u0011', '\u0012', '\u0013', '\u0014', '\u0015', '\u0016', '\u0017', '\u0018', '\u0019', '\u001A', '\u001B', '\u001C', '\u001D', '\u001E', '\u001F'];
    
    let foundProblematicChars = [];
    problematicChars.forEach(char => {
      if (projectString.includes(char)) {
        foundProblematicChars.push({
          char: char,
          code: char.charCodeAt(0),
          name: getCharName(char)
        });
      }
    });
    
    if (foundProblematicChars.length > 0) {
      console.log('❌ Found problematic characters:');
      foundProblematicChars.forEach(item => {
        console.log(`  - ${item.name} (code: ${item.code})`);
      });
    } else {
      console.log('✅ No problematic characters found');
    }

    // Test 2: Test encodeURIComponent
    console.log('\n🔍 TEST 2: Testing encodeURIComponent...');
    
    try {
      const encoded = encodeURIComponent(projectString);
      console.log('✅ encodeURIComponent successful');
      console.log('Original length:', projectString.length);
      console.log('Encoded length:', encoded.length);
      console.log('Encoding ratio:', (encoded.length / projectString.length).toFixed(2));
    } catch (encodeError) {
      console.error('❌ encodeURIComponent failed:', encodeError.message);
    }

    // Test 3: Test decodeURIComponent
    console.log('\n🔍 TEST 3: Testing decodeURIComponent...');
    
    try {
      const encoded = encodeURIComponent(projectString);
      const decoded = decodeURIComponent(encoded);
      console.log('✅ decodeURIComponent successful');
      console.log('Original matches decoded:', projectString === decoded);
    } catch (decodeError) {
      console.error('❌ decodeURIComponent failed:', decodeError.message);
    }

    // Test 4: Test URL construction
    console.log('\n🔍 TEST 4: Testing URL construction...');
    
    try {
      const token = 'test-token-123';
      const directoryData = { name: 'Test Directory', url: 'https://test.com' };
      const directoryJson = JSON.stringify(directoryData);
      
      const url = `https://opptym.com/bookmarklet-debug.js?token=${token}&project=${encodeURIComponent(projectString)}&directory=${encodeURIComponent(directoryJson)}`;
      
      console.log('✅ URL construction successful');
      console.log('URL length:', url.length);
      console.log('URL preview:', url.substring(0, 200) + '...');
      
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
        } catch (parseError) {
          console.error('❌ Project param parsing failed:', parseError.message);
        }
      }
      
    } catch (urlError) {
      console.error('❌ URL construction failed:', urlError.message);
    }

    // Test 5: Check specific project fields
    console.log('\n🔍 TEST 5: Checking specific project fields...');
    
    const fieldsToCheck = ['title', 'name', 'email', 'url', 'description', 'metaDescription', 'companyName'];
    fieldsToCheck.forEach(field => {
      const value = testProject[field];
      if (value) {
        console.log(`${field}: "${value}" (length: ${value.length})`);
        
        // Check for problematic characters in this field
        const hasProblematicChars = problematicChars.some(char => value.includes(char));
        if (hasProblematicChars) {
          console.log(`  ❌ ${field} contains problematic characters`);
        } else {
          console.log(`  ✅ ${field} is clean`);
        }
      } else {
        console.log(`${field}: null/undefined`);
      }
    });

  } catch (error) {
    console.error('❌ Audit failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

function getCharName(char) {
  const charCode = char.charCodeAt(0);
  const names = {
    0: 'NULL',
    1: 'START OF HEADING',
    2: 'START OF TEXT',
    3: 'END OF TEXT',
    4: 'END OF TRANSMISSION',
    5: 'ENQUIRY',
    6: 'ACKNOWLEDGE',
    7: 'BELL',
    8: 'BACKSPACE',
    9: 'TAB',
    10: 'LINE FEED',
    11: 'VERTICAL TAB',
    12: 'FORM FEED',
    13: 'CARRIAGE RETURN',
    14: 'SHIFT OUT',
    15: 'SHIFT IN',
    16: 'DATA LINK ESCAPE',
    17: 'DEVICE CONTROL 1',
    18: 'DEVICE CONTROL 2',
    19: 'DEVICE CONTROL 3',
    20: 'DEVICE CONTROL 4',
    21: 'NEGATIVE ACKNOWLEDGE',
    22: 'SYNCHRONOUS IDLE',
    23: 'END OF TRANSMISSION BLOCK',
    24: 'CANCEL',
    25: 'END OF MEDIUM',
    26: 'SUBSTITUTE',
    27: 'ESCAPE',
    28: 'FILE SEPARATOR',
    29: 'GROUP SEPARATOR',
    30: 'RECORD SEPARATOR',
    31: 'UNIT SEPARATOR'
  };
  return names[charCode] || `CHAR_${charCode}`;
}

// Run the audit
auditBookmarkletEncoding();
