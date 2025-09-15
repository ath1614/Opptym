(function() {
  'use strict';
  
  console.log('🔍 DEBUG BOOKMARKLET STARTED');
  
  // Get all scripts
  const scripts = document.getElementsByTagName('script');
  console.log('Total scripts found:', scripts.length);
  
  // Find the bookmarklet script
  let foundScript = null;
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    console.log('Checking script:', script.src);
    
    if (script.src && script.src.includes('bookmarklet.js')) {
      console.log('✅ Found bookmarklet script:', script.src);
      foundScript = script;
      break;
    }
  }
  
  if (!foundScript) {
    console.error('❌ No bookmarklet script found');
    alert('❌ No bookmarklet script found');
    return;
  }
  
  // Extract URL parameters
  const urlParams = new URLSearchParams(foundScript.src.split('?')[1] || '');
  const token = urlParams.get('token');
  const projectParam = urlParams.get('project');
  const directoryParam = urlParams.get('directory');
  
  console.log('📋 Extracted params:');
  console.log('- Token:', token);
  console.log('- Project param exists:', !!projectParam);
  console.log('- Directory param exists:', !!directoryParam);
  console.log('- Project param length:', projectParam ? projectParam.length : 0);
  console.log('- Directory param length:', directoryParam ? directoryParam.length : 0);
  
  if (!projectParam) {
    console.error('❌ No project parameter found');
    alert('❌ No project parameter found in URL');
    return;
  }
  
  // Try to parse project data
  try {
    const decodedProject = decodeURIComponent(projectParam);
    console.log('Decoded project length:', decodedProject.length);
    console.log('Decoded project preview:', decodedProject.substring(0, 200));
    
    const projectData = JSON.parse(decodedProject);
    console.log('✅ Project data parsed successfully');
    console.log('Project type:', typeof projectData);
    console.log('Project keys:', Object.keys(projectData));
    console.log('Project name:', projectData.name || projectData.title);
    console.log('Project email:', projectData.email);
    
    // Show success message
    alert(`✅ Project data found!\nName: ${projectData.name || projectData.title}\nEmail: ${projectData.email}`);
    
  } catch (parseError) {
    console.error('❌ Failed to parse project data:', parseError);
    alert('❌ Failed to parse project data: ' + parseError.message);
  }
  
  console.log('🔍 DEBUG BOOKMARKLET COMPLETED');
})();
