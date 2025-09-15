(function() {
  'use strict';
  
  // Configuration
  const API_BASE_URL = 'https://api.opptym.com/api';
  const BOOKMARKLET_VERSION = '2.7.0';
  
  console.log('🚀 Simple Bookmarklet v' + BOOKMARKLET_VERSION + ' started');
  
  // Get token and project data from script URL parameters
  let token = null;
  let projectDataParam = null;
  let directoryDataParam = null;
  
  console.log('🔍 Searching for bookmarklet script...');
  
  // Find the bookmarklet script and extract parameters
  const scripts = document.getElementsByTagName('script');
  console.log('📜 Total scripts found:', scripts.length);
  
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    if (script.src && script.src.includes('bookmarklet.js')) {
      console.log('✅ Found bookmarklet script:', script.src);
      
      // Extract URL parameters
      const urlParts = script.src.split('?');
      if (urlParts.length > 1) {
        const params = new URLSearchParams(urlParts[1]);
        token = params.get('token');
        projectDataParam = params.get('project');
        directoryDataParam = params.get('directory');
        
        console.log('📋 Extracted params:', { 
          token: !!token, 
          projectDataParam: !!projectDataParam, 
          directoryDataParam: !!directoryDataParam,
          projectLength: projectDataParam ? projectDataParam.length : 0,
          directoryLength: directoryDataParam ? directoryDataParam.length : 0
        });
      }
      break;
    }
  }
  
  // Parse project and directory data
  let projectData = null;
  let directoryData = null;
  
  console.log('🔧 Parsing data...');
  
  if (projectDataParam) {
    try {
      console.log('📝 Decoding project data...');
      let decodedProject;
      
      // Try multiple decoding methods to handle URI malformed errors
      try {
        decodedProject = decodeURIComponent(projectDataParam);
      } catch (decodeError) {
        console.warn('⚠️ Standard decodeURIComponent failed, trying alternative methods...');
        
        // Try with unescape as fallback
        try {
          decodedProject = unescape(projectDataParam);
        } catch (unescapeError) {
          console.warn('⚠️ unescape method failed, trying manual replacement...');
          
          // Manual replacement of common URI encoding issues
          decodedProject = projectDataParam
            .replace(/%22/g, '"')
            .replace(/%7B/g, '{')
            .replace(/%7D/g, '}')
            .replace(/%5B/g, '[')
            .replace(/%5D/g, ']')
            .replace(/%2C/g, ',')
            .replace(/%3A/g, ':')
            .replace(/%20/g, ' ')
            .replace(/%2F/g, '/')
            .replace(/%2B/g, '+')
            .replace(/%3F/g, '?')
            .replace(/%3D/g, '=')
            .replace(/%26/g, '&')
            .replace(/%23/g, '#')
            .replace(/%25/g, '%');
        }
      }
      
      projectData = JSON.parse(decodedProject);
      console.log('✅ Project data parsed successfully:', projectData);
    } catch (error) {
      console.error('❌ Failed to parse project data:', error);
      projectData = null;
    }
  }
  
  if (directoryDataParam) {
    try {
      console.log('📝 Decoding directory data...');
      let decodedDirectory;
      
      // Try multiple decoding methods to handle URI malformed errors
      try {
        decodedDirectory = decodeURIComponent(directoryDataParam);
      } catch (decodeError) {
        console.warn('⚠️ Standard decodeURIComponent failed for directory, trying alternative methods...');
        
        // Try with unescape as fallback
        try {
          decodedDirectory = unescape(directoryDataParam);
        } catch (unescapeError) {
          console.warn('⚠️ unescape method failed for directory, trying manual replacement...');
          
          // Manual replacement of common URI encoding issues
          decodedDirectory = directoryDataParam
            .replace(/%22/g, '"')
            .replace(/%7B/g, '{')
            .replace(/%7D/g, '}')
            .replace(/%5B/g, '[')
            .replace(/%5D/g, ']')
            .replace(/%2C/g, ',')
            .replace(/%3A/g, ':')
            .replace(/%20/g, ' ')
            .replace(/%2F/g, '/')
            .replace(/%2B/g, '+')
            .replace(/%3F/g, '?')
            .replace(/%3D/g, '=')
            .replace(/%26/g, '&')
            .replace(/%23/g, '#')
            .replace(/%25/g, '%');
        }
      }
      
      directoryData = JSON.parse(decodedDirectory);
      console.log('✅ Directory data parsed successfully:', directoryData);
    } catch (error) {
      console.error('❌ Failed to parse directory data:', error);
      directoryData = null;
    }
  }
  
  // Check for fallback mode
  const isFallback = !projectData;
  
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
    
    console.log('🔍 Starting form field detection and filling...');
    console.log('📋 Available form data:', formData);
    
    // First, let's scan all form elements on the page
    const allInputs = document.querySelectorAll('input, textarea, select');
    console.log(`🔍 Found ${allInputs.length} total form elements on the page`);
    
    // Debug: Log details about each form element found
    if (allInputs.length > 0) {
      console.log('📋 Form elements found:');
      allInputs.forEach((element, index) => {
        console.log(`  ${index + 1}. ${element.tagName} - name: "${element.name || 'none'}", id: "${element.id || 'none'}", type: "${element.type || 'none'}", placeholder: "${element.placeholder || 'none'}"`);
      });
    } else {
      console.log('⚠️ No form elements found on this page');
      console.log('🔍 Page URL:', window.location.href);
      console.log('🔍 Page title:', document.title);
    }
    
    // Define field mappings with prioritized and specific selectors
    const fieldMappings = [
      {
        name: 'Name',
        selectors: [
          // Most specific first
          'input[name*="fullname"]',
          'input[id*="fullname"]',
          'input[name*="full_name"]',
          'input[id*="full_name"]',
          'input[name*="contact_name"]',
          'input[id*="contact_name"]',
          'input[name*="contactname"]',
          'input[id*="contactname"]',
          'input[name*="firstname"]',
          'input[id*="firstname"]',
          'input[name*="lastname"]',
          'input[id*="lastname"]',
          'input[name*="owner"]',
          'input[id*="owner"]',
          'input[name*="manager"]',
          'input[id*="manager"]',
          // More general but avoid email/phone conflicts
          'input[name="name"]',
          'input[id="name"]',
          'input[placeholder*="name" i]:not([type="email"]):not([type="tel"])',
          'input[name*="name"]:not([name*="email"]):not([name*="phone"]):not([name*="tel"])'
        ],
        value: formData.name
      },
      {
        name: 'Business Name',
        selectors: [
          'input[name*="business"]',
          'input[id*="business"]',
          'input[placeholder*="business" i]',
          'input[name*="business_name"]',
          'input[id*="business_name"]',
          'input[name*="organization"]',
          'input[id*="organization"]',
          'input[name*="org"]',
          'input[id*="org"]'
        ],
        value: formData.businessName
      },
      {
        name: 'Company',
        selectors: [
          'input[name*="company"]',
          'input[id*="company"]',
          'input[placeholder*="company" i]',
          'input[name*="company_name"]',
          'input[id*="company_name"]',
          'input[name*="firm"]',
          'input[id*="firm"]'
        ],
        value: formData.company
      },
      {
        name: 'Email',
        selectors: [
          // Most specific first - email type inputs
          'input[type="email"]',
          'input[name*="contact_email"]',
          'input[id*="contact_email"]',
          'input[name*="business_email"]',
          'input[id*="business_email"]',
          'input[name*="company_email"]',
          'input[id*="company_email"]',
          // General email fields
          'input[name="email"]',
          'input[id="email"]',
          'input[name*="email"]:not([name*="phone"]):not([name*="name"])',
          'input[id*="email"]:not([id*="phone"]):not([id*="name"])',
          'input[placeholder*="email" i]',
          'input[name*="e-mail"]',
          'input[id*="e-mail"]',
          'input[name*="mail"]:not([name*="phone"]):not([name*="name"])',
          'input[id*="mail"]:not([id*="phone"]):not([id*="name"])'
        ],
        value: formData.email
      },
      {
        name: 'Phone',
        selectors: [
          // Most specific first - tel type inputs
          'input[type="tel"]',
          'input[name*="contact_phone"]',
          'input[id*="contact_phone"]',
          'input[name*="business_phone"]',
          'input[id*="business_phone"]',
          'input[name*="company_phone"]',
          'input[id*="company_phone"]',
          // General phone fields
          'input[name="phone"]',
          'input[id="phone"]',
          'input[name*="phone"]:not([name*="email"]):not([name*="name"])',
          'input[id*="phone"]:not([id*="email"]):not([id*="name"])',
          'input[placeholder*="phone" i]',
          'input[name*="telephone"]',
          'input[id*="telephone"]',
          'input[name*="mobile"]',
          'input[id*="mobile"]',
          'input[name*="tel"]:not([name*="email"]):not([name*="name"])',
          'input[id*="tel"]:not([id*="email"]):not([id*="name"])'
        ],
        value: formData.phone
      },
      {
        name: 'Website URL',
        selectors: [
          // Most specific first - url type inputs
          'input[type="url"]',
          'input[name*="website"]',
          'input[id*="website"]',
          'input[name*="homepage"]',
          'input[id*="homepage"]',
          'input[name*="web_site"]',
          'input[id*="web_site"]',
          // Link and anchor fields (common in directories)
          'input[name*="link"]',
          'input[id*="link"]',
          'input[name*="anchor"]',
          'input[id*="anchor"]',
          'input[name*="link_anchor"]',
          'input[id*="link_anchor"]',
          'input[placeholder*="link" i]',
          'input[placeholder*="anchor" i]',
          // General URL fields
          'input[name="url"]',
          'input[id="url"]',
          'input[name*="url"]:not([name*="email"]):not([name*="phone"])',
          'input[id*="url"]:not([id*="email"]):not([id*="phone"])',
          'input[placeholder*="website" i]',
          'input[placeholder*="url" i]',
          'input[name*="web"]:not([name*="email"]):not([name*="phone"])',
          'input[id*="web"]:not([id*="email"]):not([id*="phone"])',
          'input[name*="site"]:not([name*="email"]):not([name*="phone"])',
          'input[id*="site"]:not([id*="email"]):not([id*="phone"])'
        ],
        value: formData.url
      },
      {
        name: 'Description',
        selectors: [
          // Most specific first - description fields
          'textarea[name*="description"]',
          'textarea[id*="description"]',
          'textarea[name*="business_description"]',
          'textarea[id*="business_description"]',
          'textarea[name*="company_description"]',
          'textarea[id*="company_description"]',
          'textarea[placeholder*="description" i]',
          // General text areas for business info
          'textarea[name*="about"]',
          'textarea[id*="about"]',
          'textarea[name*="details"]',
          'textarea[id*="details"]',
          'textarea[name*="info"]',
          'textarea[id*="info"]',
          'textarea[name*="message"]',
          'textarea[id*="message"]',
          'textarea[name*="comments"]',
          'textarea[id*="comments"]'
        ],
        value: formData.description
      },
      {
        name: 'Address',
        selectors: [
          'input[name*="address"]',
          'input[id*="address"]',
          'textarea[name*="address"]',
          'input[placeholder*="address" i]',
          'input[name*="street"]',
          'input[id*="street"]',
          'input[name*="location"]',
          'input[id*="location"]'
        ],
        value: formData.address
      },
      {
        name: 'City',
        selectors: [
          'input[name*="city"]',
          'input[id*="city"]',
          'input[placeholder*="city" i]',
          'input[name*="town"]',
          'input[id*="town"]'
        ],
        value: formData.city
      },
      {
        name: 'State',
        selectors: [
          'input[name*="state"]',
          'input[id*="state"]',
          'input[placeholder*="state" i]',
          'select[name*="state"]',
          'select[id*="state"]',
          'input[name*="province"]',
          'input[id*="province"]',
          'select[name*="province"]',
          'select[id*="province"]'
        ],
        value: formData.state
      },
      {
        name: 'Country',
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
        name: 'ZIP/Postal Code',
        selectors: [
          'input[name*="zip"]',
          'input[id*="zip"]',
          'input[name*="postal"]',
          'input[id*="postal"]',
          'input[placeholder*="zip" i]',
          'input[placeholder*="postal" i]',
          'input[name*="postcode"]',
          'input[id*="postcode"]',
          'input[name*="pincode"]',
          'input[id*="pincode"]'
        ],
        value: formData.zip
      }
    ];
    
    // Track filled elements to prevent conflicts
    const filledElements = new Set();
    
    // Fill each field type with conflict prevention
    fieldMappings.forEach(mapping => {
      if (!mapping.value || mapping.value.trim() === '') {
        console.log(`⏭️ Skipping ${mapping.name} - no value available`);
        return;
      }
      
      console.log(`🎯 Looking for ${mapping.name} fields with value: "${mapping.value}"`);
      
      mapping.selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          console.log(`🔍 Selector "${selector}" found ${elements.length} elements`);
          
          elements.forEach((element, index) => {
            // Skip if element is already filled or not suitable
            if (element && !element.disabled && !element.readOnly && !filledElements.has(element)) {
              // Additional validation for field type conflicts
              const elementType = element.type || 'text';
              const elementName = element.name || '';
              const elementId = element.id || '';
              
              // Validate field type matches expected data type
              let isValidField = true;
              
              if (mapping.name === 'Email' && elementType !== 'email' && !elementName.includes('email') && !elementId.includes('email')) {
                isValidField = false;
              } else if (mapping.name === 'Phone' && elementType !== 'tel' && !elementName.includes('phone') && !elementName.includes('tel') && !elementId.includes('phone') && !elementId.includes('tel')) {
                isValidField = false;
              } else if (mapping.name === 'Website URL' && elementType !== 'url' && !elementName.includes('url') && !elementName.includes('website') && !elementId.includes('url') && !elementId.includes('website')) {
                isValidField = false;
              }
              
              if (!isValidField) {
                console.log(`⚠️ Skipping ${mapping.name} field - type mismatch: ${elementType} (${elementName || elementId})`);
                return;
              }
              
              const hadValue = element.value && element.value.trim() !== '';
              
              element.value = mapping.value;
              element.dispatchEvent(new Event('input', { bubbles: true }));
              element.dispatchEvent(new Event('change', { bubbles: true }));
              
              // Mark element as filled to prevent conflicts
              filledElements.add(element);
              
              filledFields.push({
                selector: selector,
                value: mapping.value,
                element: element,
                hadExistingValue: hadValue,
                fieldType: mapping.name
              });
              
              if (hadValue) {
                console.log(`🔄 Overwrote existing value in ${mapping.name} field: ${selector} = "${mapping.value}"`);
              } else {
                console.log(`✅ Filled empty ${mapping.name} field: ${selector} = "${mapping.value}"`);
              }
            }
          });
        } catch (error) {
          console.warn(`⚠️ Error with selector ${selector}:`, error);
        }
      });
    });
    
    // If no fields were filled with specific selectors, try a fallback approach
    if (filledFields.length === 0 && allInputs.length > 0) {
      console.log('🔄 No fields filled with specific selectors, trying fallback approach...');
      
      // Try to fill any empty text inputs with available data
      const textInputs = document.querySelectorAll('input[type="text"], input:not([type]), textarea');
      const availableData = [
        { value: formData.name, label: 'Name' },
        { value: formData.company, label: 'Company' },
        { value: formData.email, label: 'Email' },
        { value: formData.phone, label: 'Phone' },
        { value: formData.url, label: 'Website' },
        { value: formData.description, label: 'Description' }
      ].filter(item => item.value && item.value.trim() !== '');
      
      console.log(`🔄 Found ${textInputs.length} text inputs and ${availableData.length} available data items`);
      
      let dataIndex = 0;
      textInputs.forEach((input, index) => {
        if (!input.disabled && !input.readOnly && (!input.value || input.value.trim() === '') && !filledElements.has(input) && dataIndex < availableData.length) {
          const data = availableData[dataIndex];
          input.value = data.value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          
          // Mark element as filled to prevent conflicts
          filledElements.add(input);
          
          filledFields.push({
            selector: `fallback-${index}`,
            value: data.value,
            element: input,
            hadExistingValue: false,
            fieldType: data.label
          });
          
          console.log(`✅ Fallback filled ${data.label}: "${data.value}"`);
          dataIndex++;
        }
      });
    }
    
    console.log(`📊 Form filling summary:`);
    console.log(`   - Total form elements found: ${allInputs.length}`);
    console.log(`   - Fields filled: ${filledFields.length}`);
    console.log(`   - Filled fields details:`, filledFields);
    
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
      max-width: 400px;
    `;
    
    let message = '';
    if (filledFields.length === 0) {
      message = '⚠️ No form fields found to fill';
      successDiv.style.background = '#F59E0B';
    } else {
      message = `✅ Auto-filled ${filledFields.length} fields!`;
    }
    
    successDiv.innerHTML = `
      <div style="width: 16px; height: 16px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: ${filledFields.length === 0 ? '#F59E0B' : '#10B981'};">${filledFields.length === 0 ? '⚠' : '✓'}</div>
      <span>${message}</span>
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
      <span>⚠️ No Project Data - Please generate a bookmarklet with project data from Opptym</span>
    `;
    document.body.appendChild(fallbackDiv);
    
    // Remove fallback message after 5 seconds
    setTimeout(() => {
      const fallback = document.getElementById('opptym-fallback');
      if (fallback) {
        fallback.remove();
      }
    }, 5000);
  }
  
  // Track submission
  function trackSubmission(filledFields) {
    if (!token) {
      console.log('⚠️ No token available for tracking');
      return;
    }
    
    const submissionData = {
      token: token,
      url: window.location.href,
      fieldsFilled: filledFields.length,
      filledFields: filledFields.map(field => ({
        selector: field.selector,
        value: field.value,
        hadExistingValue: field.hadExistingValue
      })),
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Tracking submission:', submissionData);
    
    // Send tracking data to API with improved error handling
    fetch(`${API_BASE_URL}/submissions/bookmarklet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify(submissionData),
      mode: 'cors',
      credentials: 'omit'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('✅ Submission tracked successfully:', data);
    })
    .catch(error => {
      console.warn('⚠️ Error tracking submission (non-critical):', error.message);
      // Don't show error to user as this is non-critical functionality
    });
  }
  
  console.log('🎉 Simple Bookmarklet v' + BOOKMARKLET_VERSION + ' loaded successfully!');
})();
