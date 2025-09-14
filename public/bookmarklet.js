(function() {
  'use strict';
  
  // Configuration
  const API_BASE_URL = 'https://api.opptym.com/api';
  const BOOKMARKLET_VERSION = '2.0.0';
  
  // Get token and project data from script URL parameters
  let token = null;
  let projectDataParam = null;
  let directoryDataParam = null;
  
  // Find the script element that loaded this bookmarklet
  const scripts = document.getElementsByTagName('script');
  console.log('🔍 Total scripts found:', scripts.length);
  
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    console.log('Checking script:', script.src);
    
    if (script.src && script.src.includes('bookmarklet.js')) {
      console.log('✅ Found bookmarklet script:', script.src);
      const urlParams = new URLSearchParams(script.src.split('?')[1] || '');
      token = urlParams.get('token');
      projectDataParam = urlParams.get('project');
      directoryDataParam = urlParams.get('directory');
      console.log('📋 Extracted params:', { token: !!token, projectDataParam: !!projectDataParam, directoryDataParam: !!directoryDataParam });
      break;
    }
  }
  
  // Parse project and directory data with enhanced error handling
  let projectData = null;
  let directoryData = null;
  
  console.log('🔧 Parsing data...');
  console.log('Project param length:', projectDataParam ? projectDataParam.length : 0);
  console.log('Directory param length:', directoryDataParam ? directoryDataParam.length : 0);
  
  try {
    if (projectDataParam) {
      console.log('📝 Decoding project data...');
      const decodedProject = decodeURIComponent(projectDataParam);
      console.log('Decoded project length:', decodedProject.length);
      
      // Try parsing once
      try {
        projectData = JSON.parse(decodedProject);
        
        // If the result is a string, it means we have double-encoded data
        if (typeof projectData === 'string') {
          console.log('🔄 Detected double-encoded data, parsing again...');
          projectData = JSON.parse(projectData);
        }
        
        console.log('✅ Project data parsed successfully:', !!projectData);
        console.log('📊 Project data type:', typeof projectData);
        console.log('🔑 Project data keys:', projectData ? Object.keys(projectData) : 'null');
      } catch (parseError) {
        console.error('❌ Failed to parse project data:', parseError);
        projectData = null;
      }
    }
    if (directoryDataParam) {
      console.log('📝 Decoding directory data...');
      const decodedDirectory = decodeURIComponent(directoryDataParam);
      console.log('Decoded directory length:', decodedDirectory.length);
      
      // Try parsing once
      try {
        directoryData = JSON.parse(decodedDirectory);
        
        // If the result is a string, it means we have double-encoded data
        if (typeof directoryData === 'string') {
          console.log('🔄 Detected double-encoded directory data, parsing again...');
          directoryData = JSON.parse(directoryData);
        }
        
        console.log('✅ Directory data parsed successfully:', !!directoryData);
        console.log('📊 Directory data type:', typeof directoryData);
        console.log('🔑 Directory data keys:', directoryData ? Object.keys(directoryData) : 'null');
      } catch (parseError) {
        console.error('❌ Failed to parse directory data:', parseError);
        directoryData = null;
      }
    }
  } catch (e) {
    console.error('❌ Error parsing project/directory data:', e);
    console.error('Project param (first 200 chars):', projectDataParam ? projectDataParam.substring(0, 200) : 'null');
    console.error('Directory param (first 200 chars):', directoryDataParam ? directoryDataParam.substring(0, 200) : 'null');
  }
  
  // Check if this is a fallback bookmarklet (no project data)
  const urlParams = new URLSearchParams(window.location.search);
  const isFallback = urlParams.get('fallback') === 'true' || !projectData;
  
  if (isFallback) {
    console.log('📝 Fallback bookmarklet detected - no project data required');
    // Continue with fallback mode
  } else {
    // Validate project data with detailed logging
    console.log('🔍 Validating project data:', !!projectData);
    if (!projectData) {
      console.error('❌ Project data validation failed: No project data found');
      console.error('Project param exists:', !!projectDataParam);
      console.error('Project param length:', projectDataParam ? projectDataParam.length : 0);
      alert('❌ No project data found. Please generate a new bookmarklet from Opptym.\n\nDebug info: Project data could not be parsed from script parameters.');
      return;
    }
  }
  
  // Start automatic form filling immediately
  console.log('🚀 Starting OPPTYM Auto-Fill...');
  
  // Show loading indicator
  showLoadingIndicator();
  
  // Start form filling after a brief delay
  setTimeout(() => {
    if (projectData) {
      autoFillAllForms(projectData);
    } else {
      showFallbackMessage();
    }
  }, 1000);
  
  // Show loading indicator
  function showLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'opptym-loading';
    loadingDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 12px;
    `;
    
    loadingDiv.innerHTML = `
      <div style="
        width: 20px;
        height: 20px;
        border: 2px solid #ffffff;
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
      <span>🔍 Scanning forms...</span>
    `;
    
    document.body.appendChild(loadingDiv);
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Automatic form filling function
  function autoFillAllForms(projectData) {
    console.log('🚀 Starting automatic form filling with project data:', projectData);
    
    // Prepare data for form filling
    const formData = {
      name: projectData.name || projectData.title || '',
      company: projectData.companyName || projectData.name || projectData.title || '',
      email: projectData.email || '',
      phone: projectData.businessPhone || projectData.phone || '',
      url: projectData.url || '',
      website: projectData.url || '',
      description: projectData.description || projectData.metaDescription || '',
      address: projectData.address || projectData.address1 || '',
      city: projectData.city || '',
      state: projectData.state || '',
      country: projectData.country || '',
      zip: projectData.zip || projectData.pincode || '',
      businessName: projectData.companyName || projectData.name || projectData.title || '',
      businessUrl: projectData.url || '',
      businessEmail: projectData.email || '',
      businessPhone: projectData.businessPhone || projectData.phone || '',
      businessDescription: projectData.description || projectData.metaDescription || ''
    };
    
    console.log('📋 Form data prepared:', formData);
    
    // Find and fill all form fields
    const fieldsFilled = fillFormFields(formData);
    
    // Show success message
    showSuccessMessage(fieldsFilled);
    
    // Track the submission
    trackSubmission(fieldsFilled);
  }
  
  // Smart form field filling
  function fillFormFields(formData) {
    const filledFields = [];
    const fieldMappings = [
      // Name fields
      { selectors: ['input[name*="name"]', 'input[id*="name"]', 'input[placeholder*="name" i]'], value: formData.name },
      { selectors: ['input[name*="business"]', 'input[id*="business"]', 'input[placeholder*="business" i]'], value: formData.businessName },
      { selectors: ['input[name*="company"]', 'input[id*="company"]', 'input[placeholder*="company" i]'], value: formData.company },
      
      // Email fields
      { selectors: ['input[type="email"]', 'input[name*="email"]', 'input[id*="email"]', 'input[placeholder*="email" i]'], value: formData.email },
      
      // Phone fields
      { selectors: ['input[type="tel"]', 'input[name*="phone"]', 'input[id*="phone"]', 'input[placeholder*="phone" i]'], value: formData.phone },
      
      // URL/Website fields
      { selectors: ['input[type="url"]', 'input[name*="url"]', 'input[id*="url"]', 'input[name*="website"]', 'input[id*="website"]', 'input[placeholder*="website" i]'], value: formData.url },
      
      // Description fields
      { selectors: ['textarea[name*="description"]', 'textarea[id*="description"]', 'textarea[placeholder*="description" i]'], value: formData.description },
      
      // Address fields
      { selectors: ['input[name*="address"]', 'input[id*="address"]', 'textarea[name*="address"]', 'input[placeholder*="address" i]'], value: formData.address },
      { selectors: ['input[name*="city"]', 'input[id*="city"]', 'input[placeholder*="city" i]'], value: formData.city },
      { selectors: ['input[name*="state"]', 'input[id*="state"]', 'input[placeholder*="state" i]'], value: formData.state },
      { selectors: ['input[name*="country"]', 'input[id*="country"]', 'input[placeholder*="country" i]'], value: formData.country },
      { selectors: ['input[name*="zip"]', 'input[id*="zip"]', 'input[name*="postal"]', 'input[placeholder*="zip" i]'], value: formData.zip }
    ];
    
    fieldMappings.forEach(mapping => {
      if (!mapping.value) return;
      
      mapping.selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            if (element && !element.value && !element.disabled && !element.readOnly) {
              element.value = mapping.value;
              element.dispatchEvent(new Event('input', { bubbles: true }));
              element.dispatchEvent(new Event('change', { bubbles: true }));
              filledFields.push({
                selector: selector,
                value: mapping.value,
                element: element
              });
              console.log(`✅ Filled field: ${selector} = ${mapping.value}`);
            }
          });
        } catch (error) {
          console.warn(`⚠️ Error filling field ${selector}:`, error);
        }
      });
    });
    
    return filledFields;
  }
  
  // Show success message
  function showSuccessMessage(filledFields) {
    // Remove loading indicator
    const loadingDiv = document.getElementById('opptym-loading');
    if (loadingDiv) {
      loadingDiv.remove();
    }
    
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 300px;
    `;
    
    successDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 20px;">✅</span>
        <strong>Forms Auto-Filled!</strong>
      </div>
      <div style="font-size: 12px; opacity: 0.9;">
        Filled ${filledFields.length} fields automatically
      </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 5000);
  }
  
  // Show fallback message
  function showFallbackMessage() {
    // Remove loading indicator
    const loadingDiv = document.getElementById('opptym-loading');
    if (loadingDiv) {
      loadingDiv.remove();
    }
    
    const fallbackDiv = document.createElement('div');
    fallbackDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f59e0b;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 300px;
    `;
    
    fallbackDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 20px;">⚠️</span>
        <strong>No Project Data</strong>
      </div>
      <div style="font-size: 12px; opacity: 0.9;">
        Please generate a bookmarklet with project data from Opptym
      </div>
    `;
    
    document.body.appendChild(fallbackDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (fallbackDiv.parentNode) {
        fallbackDiv.parentNode.removeChild(fallbackDiv);
      }
    }, 5000);
  }
  
  // Track submission in database
  function trackSubmission(filledFields) {
    try {
      // Get token from localStorage or sessionStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('opptym_bookmarklet_token');
      
      if (!token) {
        console.log('No token available for submission tracking');
        return;
      }

      // Prepare submission data
      const submissionData = {
        directoryName: directoryData?.name || 'Unknown Directory',
        directoryUrl: directoryData?.url || window.location.href,
        classification: directoryData?.classification || 'Directory Submission',
        fieldsFilled: filledFields.length,
        filledFields: filledFields.map(field => ({
          selector: field.selector,
          value: field.value
        })),
        timestamp: new Date().toISOString()
      };

      // Send to backend
      fetch(`${API_BASE_URL}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      }).then(response => {
        if (response.ok) {
          console.log('✅ Submission tracked successfully');
        } else {
          console.warn('⚠️ Failed to track submission:', response.status);
        }
      }).catch(error => {
        console.error('❌ Error tracking submission:', error);
      });

    } catch (error) {
      console.error('❌ Error in trackSubmission:', error);
    }
  }
  
  console.log('🎉 OPPTYM Auto-Fill Bookmarklet v' + BOOKMARKLET_VERSION + ' loaded successfully!');
  
})();
