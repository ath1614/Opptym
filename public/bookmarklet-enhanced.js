(function() {
  'use strict';
  
  // Configuration
  const API_BASE_URL = 'https://api.opptym.com/api';
  const BOOKMARKLET_VERSION = '2.1.0';
  
  console.log('🚀 Enhanced Bookmarklet v' + BOOKMARKLET_VERSION + ' started');
  
  // Get token and project data from script URL parameters
  let token = null;
  let projectDataParam = null;
  let directoryDataParam = null;
  
  // Enhanced script detection - try multiple methods
  console.log('🔍 Searching for bookmarklet script...');
  
  // Method 1: Check all scripts
  const scripts = document.getElementsByTagName('script');
  console.log('📜 Total scripts found:', scripts.length);
  
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    if (script.src && script.src.includes('bookmarklet.js')) {
      console.log('✅ Found bookmarklet script (Method 1):', script.src);
      const urlParams = new URLSearchParams(script.src.split('?')[1] || '');
      token = urlParams.get('token');
      projectDataParam = urlParams.get('project');
      directoryDataParam = urlParams.get('directory');
      console.log('📋 Extracted params:', { token: !!token, projectDataParam: !!projectDataParam, directoryDataParam: !!directoryDataParam });
      break;
    }
  }
  
  // Method 2: If not found, try to get from current script execution context
  if (!token && !projectDataParam) {
    console.log('🔍 Trying Method 2: Current script context...');
    try {
      // Try to get the current script from the call stack
      const currentScript = document.currentScript;
      if (currentScript && currentScript.src && currentScript.src.includes('bookmarklet.js')) {
        console.log('✅ Found bookmarklet script (Method 2):', currentScript.src);
        const urlParams = new URLSearchParams(currentScript.src.split('?')[1] || '');
        token = urlParams.get('token');
        projectDataParam = urlParams.get('project');
        directoryDataParam = urlParams.get('directory');
        console.log('📋 Extracted params:', { token: !!token, projectDataParam: !!projectDataParam, directoryDataParam: !!directoryDataParam });
      }
    } catch (e) {
      console.log('⚠️ Method 2 failed:', e.message);
    }
  }
  
  // Method 3: Try to extract from window.location if this is a direct script load
  if (!token && !projectDataParam) {
    console.log('🔍 Trying Method 3: Window location...');
    try {
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get('token');
      projectDataParam = urlParams.get('project');
      directoryDataParam = urlParams.get('directory');
      if (token || projectDataParam) {
        console.log('✅ Found params in window location');
        console.log('📋 Extracted params:', { token: !!token, projectDataParam: !!projectDataParam, directoryDataParam: !!directoryDataParam });
      }
    } catch (e) {
      console.log('⚠️ Method 3 failed:', e.message);
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
      console.log('Decoded project preview:', decodedProject.substring(0, 200));
      
      // Try parsing once
      try {
        projectData = JSON.parse(decodedProject);
        
        // If the result is a string, it means we have double-encoded data
        if (typeof projectData === 'string') {
          console.log('🔄 Detected double-encoded data, parsing again...');
          projectData = JSON.parse(projectData);
        }
        
        console.log('✅ Project data parsed successfully');
        console.log('📊 Project data type:', typeof projectData);
        console.log('🔑 Project data keys:', projectData ? Object.keys(projectData) : 'null');
        console.log('📝 Project name:', projectData ? (projectData.name || projectData.title) : 'null');
        console.log('📧 Project email:', projectData ? projectData.email : 'null');
        
      } catch (parseError) {
        console.error('❌ Failed to parse project data:', parseError);
        console.error('Parse error details:', parseError.message);
        console.error('Problematic data:', decodedProject.substring(0, 500));
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
        
        console.log('✅ Directory data parsed successfully');
        console.log('📊 Directory data type:', typeof directoryData);
        console.log('🔑 Directory data keys:', directoryData ? Object.keys(directoryData) : 'null');
        console.log('📝 Directory name:', directoryData ? directoryData.name : 'null');
        
      } catch (parseError) {
        console.error('❌ Failed to parse directory data:', parseError);
        console.error('Parse error details:', parseError.message);
        directoryData = null;
      }
    }
  } catch (e) {
    console.error('❌ Error parsing project/directory data:', e);
  }
  
  // Check for fallback mode
  const urlParams = new URLSearchParams(window.location.search);
  const isFallback = urlParams.get('fallback') === 'true' || !projectData;
  
  console.log('🎯 Bookmarklet mode:', isFallback ? 'FALLBACK' : 'AUTO-FILL');
  console.log('📊 Data status:', {
    hasToken: !!token,
    hasProjectData: !!projectData,
    hasDirectoryData: !!directoryData,
    isFallback: isFallback
  });
  
  // Show loading indicator
  showLoadingIndicator();
  
  // Start form filling after a brief delay
  setTimeout(() => {
    if (projectData && !isFallback) {
      console.log('🚀 Starting auto-fill with project data');
      autoFillAllForms(projectData);
    } else {
      console.log('⚠️ No project data available, showing fallback message');
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
      background: #4F46E5;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    loadingDiv.innerHTML = `
      <div style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <span>Opptym Auto-Fill Loading...</span>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(loadingDiv);
    
    // Remove loading indicator after 3 seconds
    setTimeout(() => {
      const loading = document.getElementById('opptym-loading');
      if (loading) {
        loading.remove();
      }
    }, 3000);
  }
  
  // Auto-fill all forms with project data
  function autoFillAllForms(projectData) {
    console.log('🚀 Starting automatic form filling with project data:', projectData);
    
    // Prepare form data with fallbacks
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
    
    // Fill form fields
    const fieldsFilled = fillFormFields(formData);
    
    // Show success message
    showSuccessMessage(fieldsFilled);
    
    // Track submission
    trackSubmission(fieldsFilled);
  }
  
  // Fill form fields with comprehensive selectors
  function fillFormFields(formData) {
    const filledFields = [];
    
    // Define field mappings with comprehensive selectors
    const fieldMappings = [
      {
        selectors: [
          'input[name*="name"]',
          'input[id*="name"]',
          'input[placeholder*="name" i]',
          'input[name*="fullname"]',
          'input[id*="fullname"]',
          'input[name*="full_name"]',
          'input[id*="full_name"]'
        ],
        value: formData.name
      },
      {
        selectors: [
          'input[name*="business"]',
          'input[id*="business"]',
          'input[placeholder*="business" i]',
          'input[name*="business_name"]',
          'input[id*="business_name"]'
        ],
        value: formData.businessName
      },
      {
        selectors: [
          'input[name*="company"]',
          'input[id*="company"]',
          'input[placeholder*="company" i]',
          'input[name*="company_name"]',
          'input[id*="company_name"]'
        ],
        value: formData.company
      },
      {
        selectors: [
          'input[type="email"]',
          'input[name*="email"]',
          'input[id*="email"]',
          'input[placeholder*="email" i]',
          'input[name*="e-mail"]',
          'input[id*="e-mail"]'
        ],
        value: formData.email
      },
      {
        selectors: [
          'input[type="tel"]',
          'input[name*="phone"]',
          'input[id*="phone"]',
          'input[placeholder*="phone" i]',
          'input[name*="telephone"]',
          'input[id*="telephone"]',
          'input[name*="mobile"]',
          'input[id*="mobile"]'
        ],
        value: formData.phone
      },
      {
        selectors: [
          'input[type="url"]',
          'input[name*="url"]',
          'input[id*="url"]',
          'input[name*="website"]',
          'input[id*="website"]',
          'input[placeholder*="website" i]',
          'input[name*="web"]',
          'input[id*="web"]'
        ],
        value: formData.url
      },
      {
        selectors: [
          'textarea[name*="description"]',
          'textarea[id*="description"]',
          'textarea[placeholder*="description" i]',
          'textarea[name*="message"]',
          'textarea[id*="message"]',
          'textarea[name*="comments"]',
          'textarea[id*="comments"]'
        ],
        value: formData.description
      },
      {
        selectors: [
          'input[name*="address"]',
          'input[id*="address"]',
          'textarea[name*="address"]',
          'input[placeholder*="address" i]',
          'input[name*="street"]',
          'input[id*="street"]'
        ],
        value: formData.address
      },
      {
        selectors: [
          'input[name*="city"]',
          'input[id*="city"]',
          'input[placeholder*="city" i]'
        ],
        value: formData.city
      },
      {
        selectors: [
          'input[name*="state"]',
          'input[id*="state"]',
          'input[placeholder*="state" i]',
          'select[name*="state"]',
          'select[id*="state"]'
        ],
        value: formData.state
      },
      {
        selectors: [
          'input[name*="country"]',
          'input[id*="country"]',
          'input[placeholder*="country" i]',
          'select[name*="country"]',
          'select[id*="country"]'
        ],
        value: formData.country
      },
      {
        selectors: [
          'input[name*="zip"]',
          'input[id*="zip"]',
          'input[name*="postal"]',
          'input[id*="postal"]',
          'input[placeholder*="zip" i]',
          'input[placeholder*="postal" i]'
        ],
        value: formData.zip
      }
    ];
    
    // Fill each field type
    fieldMappings.forEach(mapping => {
      if (!mapping.value || mapping.value.trim() === '') return;
      
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
    const successDiv = document.createElement('div');
    successDiv.id = 'opptym-success';
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10B981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    successDiv.innerHTML = `
      <div style="width: 16px; height: 16px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #10B981;">✓</div>
      <span>✅ Auto-filled ${filledFields.length} fields!</span>
    `;
    document.body.appendChild(successDiv);
    
    // Remove success message after 4 seconds
    setTimeout(() => {
      const success = document.getElementById('opptym-success');
      if (success) {
        success.remove();
      }
    }, 4000);
  }
  
  // Show fallback message
  function showFallbackMessage() {
    const fallbackDiv = document.createElement('div');
    fallbackDiv.id = 'opptym-fallback';
    fallbackDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #F59E0B;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    fallbackDiv.innerHTML = `
      <div style="width: 16px; height: 16px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #F59E0B;">⚠</div>
      <span>⚠️ No Project Data - Please generate bookmarklet with project data from Opptym</span>
    `;
    document.body.appendChild(fallbackDiv);
    
    // Remove fallback message after 6 seconds
    setTimeout(() => {
      const fallback = document.getElementById('opptym-fallback');
      if (fallback) {
        fallback.remove();
      }
    }, 6000);
  }
  
  // Track submission
  function trackSubmission(filledFields) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('opptym_bookmarklet_token');
      if (!token) {
        console.log('No token available for submission tracking');
        return;
      }
      
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
  
  console.log('🎉 Enhanced Bookmarklet execution completed');
})();
