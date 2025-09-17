(function() {
  'use strict';
  
  // Prevent multiple executions
  if (window.OPPTYM_BOOKMARKLET_EXECUTED) {
    console.log('⚠️ OPPTYM Bookmarklet already executed on this page');
    return;
  }
  window.OPPTYM_BOOKMARKLET_EXECUTED = true;

  // OPPTYM Auto-Fill Bookmarklet - Enhanced Field Mapping
  // Version: 3.1.0 - Fixed Duplicate Declaration & Improved Accuracy

  const BOOKMARKLET_VERSION = '3.1.0';
  const API_BASE_URL = 'https://api.opptym.com/api';

  // Allow multiple executions but prevent rapid-fire clicks
  const now = Date.now();
  if (window.OPPTYM_LAST_EXECUTION && (now - window.OPPTYM_LAST_EXECUTION) < 2000) {
    console.log('⚠️ OPPTYM Bookmarklet clicked too quickly, please wait...');
    showPopup('⚠️ Please wait a moment before clicking the bookmarklet again.', 'info');
    return;
  }
  window.OPPTYM_LAST_EXECUTION = now;

  console.log(`🚀 OPPTYM Auto-Fill Bookmarklet v${BOOKMARKLET_VERSION} starting...`);

  // Enhanced popup function to replace alerts
  function showPopup(message, type = 'info') {
    // Remove any existing popup
    const existingPopup = document.getElementById('opptym-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    // Create popup element
    const popup = document.createElement('div');
    popup.id = 'opptym-popup';
    popup.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 400px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      border: 2px solid ${type === 'error' ? '#cc0000' : type === 'success' ? '#00cc00' : '#0000cc'};
    `;

    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      float: right;
      margin-left: 10px;
      cursor: pointer;
      font-size: 18px;
      font-weight: bold;
    `;
    closeBtn.onclick = () => popup.remove();

    popup.innerHTML = message;
    popup.appendChild(closeBtn);

    // Add to page
    document.body.appendChild(popup);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (popup.parentNode) {
        popup.remove();
      }
    }, 5000);
  }

  // Extract URL parameters from the script's own URL
  function getUrlParameter(name) {
    // Get the current script's URL
    const scripts = document.getElementsByTagName('script');
    let scriptUrl = '';
    
    // Find the bookmarklet script
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.includes('bookmarklet.js')) {
        scriptUrl = scripts[i].src;
        break;
      }
    }
    
    if (!scriptUrl) {
      console.log('❌ Could not find bookmarklet script URL');
      return null;
    }
    
    console.log('🔍 Found script URL:', scriptUrl);
    
    try {
      const url = new URL(scriptUrl);
      const paramValue = url.searchParams.get(name);
      console.log(`🔍 Parameter '${name}':`, paramValue ? 'Found' : 'Not found');
      return paramValue;
    } catch (error) {
      console.error('❌ Error parsing script URL:', error);
      return null;
    }
  }

  // Enhanced JSON parsing with multiple fallback methods
  function parseJsonSafely(jsonString) {
    if (!jsonString) return null;
    
    console.log('🔍 Parsing JSON string:', jsonString.substring(0, 100) + '...');
    
    try {
      // Method 1: Direct parse
      const result = JSON.parse(jsonString);
      console.log('✅ Method 1 (Direct parse) succeeded');
      return result;
    } catch (e1) {
      console.log('❌ Method 1 failed:', e1.message);
      try {
        // Method 2: Decode URI component first
        const decoded = decodeURIComponent(jsonString);
        const result = JSON.parse(decoded);
        console.log('✅ Method 2 (decodeURIComponent) succeeded');
        return result;
      } catch (e2) {
        console.log('❌ Method 2 failed:', e2.message);
        try {
          // Method 3: Unescape then decode
          const unescaped = unescape(jsonString);
          const decoded = decodeURIComponent(unescaped);
          const result = JSON.parse(decoded);
          console.log('✅ Method 3 (unescape + decodeURIComponent) succeeded');
          return result;
        } catch (e3) {
          console.log('❌ Method 3 failed:', e3.message);
          try {
            // Method 4: Manual character replacement
            let fixed = jsonString
              .replace(/%22/g, '"')
              .replace(/%7B/g, '{')
              .replace(/%7D/g, '}')
              .replace(/%5B/g, '[')
              .replace(/%5D/g, ']')
              .replace(/%2C/g, ',')
              .replace(/%3A/g, ':')
              .replace(/%20/g, ' ')
              .replace(/%5Cn/g, '\n')
              .replace(/%5C/g, '\\')
              .replace(/%2F/g, '/');
            const result = JSON.parse(fixed);
            console.log('✅ Method 4 (Manual replacement) succeeded');
            return result;
          } catch (e4) {
            console.log('❌ Method 4 failed:', e4.message);
            try {
              // Method 5: Try double decoding
              const doubleDecoded = decodeURIComponent(decodeURIComponent(jsonString));
              const result = JSON.parse(doubleDecoded);
              console.log('✅ Method 5 (Double decode) succeeded');
              return result;
            } catch (e5) {
              console.error('❌ All JSON parsing methods failed. Last error:', e5);
              console.error('❌ Original string:', jsonString.substring(0, 200));
              return null;
            }
          }
        }
      }
    }
  }

  // Extract data from URL parameters
  const token = getUrlParameter('token');
  const projectDataParam = getUrlParameter('project');
  const directoryDataParam = getUrlParameter('directory');

  console.log('📊 Extracted parameters:', {
    token: token ? 'Present' : 'Missing',
    project: projectDataParam ? 'Present' : 'Missing',
    directory: directoryDataParam ? 'Present' : 'Missing'
  });

  // Parse project and directory data
  let projectData = null;
  let directoryData = null;

  if (projectDataParam) {
    projectData = parseJsonSafely(projectDataParam);
    console.log('📊 Project data parsed:', projectData ? 'Success' : 'Failed');
  }

  if (directoryDataParam) {
    directoryData = parseJsonSafely(directoryDataParam);
    console.log('📊 Directory data parsed:', directoryData ? 'Success' : 'Failed');
  }

  // Check if we have project data
  if (!projectData) {
    console.log('⚠️ No project data available, showing fallback message');
    console.log('🔍 Debug - projectDataParam:', projectDataParam);
    console.log('🔍 Debug - parseJsonSafely result:', parseJsonSafely(projectDataParam));
    showPopup('⚠️ No project data available. Please generate a bookmarklet with project data from Opptym.', 'error');
  } else {

  // Create form data object with enhanced mapping
  const formData = {
    name: projectData.name || '',
    title: projectData.title || projectData.companyName || projectData.businessName || '',
    businessName: projectData.businessName || projectData.companyName || projectData.title || '',
    company: projectData.companyName || projectData.businessName || projectData.title || '',
    email: projectData.email || '',
    phone: projectData.businessPhone || projectData.phone || projectData.whatsapp || '',
    url: projectData.url || '',
    description: projectData.description || projectData.metaDescription || '',
    address: projectData.address1 || projectData.address || '',
    city: projectData.city || '',
    state: projectData.state || '',
    country: projectData.country || '',
    zip: projectData.pincode || projectData.zip || ''
  };

  console.log('📊 Form data prepared:', formData);

  // Enhanced field mapping with 100% accuracy
  function fillFormFields() {
    console.log('🔍 Starting form field detection...');
    
    // Debug: Log all available form fields on the page
    const allInputs = document.querySelectorAll('input, textarea, select');
    console.log(`🔍 Found ${allInputs.length} total form elements on the page:`);
    allInputs.forEach((input, index) => {
      console.log(`  ${index + 1}. ${input.tagName} - name: "${input.name || 'none'}", id: "${input.id || 'none'}", type: "${input.type || 'none'}", placeholder: "${input.placeholder || 'none'}"`);
    });
    
    const filledFields = [];
    const filledElements = new Set();
    
    // Ultra-precise field mappings with comprehensive selectors
    const fieldMappings = [
      {
        name: 'Name',
        selectors: [
          'input[name="name"]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[id="name"]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[name*="fullname"]:not([type="email"]):not([type="tel"])',
          'input[id*="fullname"]:not([type="email"]):not([type="tel"])',
          'input[name*="contact_name"]:not([type="email"]):not([type="tel"])',
          'input[id*="contact_name"]:not([type="email"]):not([type="tel"])',
          'input[name*="firstname"]:not([type="email"]):not([type="tel"])',
          'input[id*="firstname"]:not([type="email"]):not([type="tel"])',
          'input[name*="lastname"]:not([type="email"]):not([type="tel"])',
          'input[id*="lastname"]:not([type="email"]):not([type="tel"])',
          'input[placeholder*="name" i]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[placeholder*="full name" i]:not([type="email"]):not([type="tel"])',
          'input[placeholder*="your name" i]:not([type="email"]):not([type="tel"])'
        ],
        value: formData.name,
        validation: (element) => {
          const type = element.type || 'text';
          const name = element.name || '';
          const id = element.id || '';
          const placeholder = element.placeholder || '';
          return type !== 'email' && type !== 'tel' && type !== 'url' && 
                 !name.includes('email') && !name.includes('phone') && !name.includes('tel') &&
                 !id.includes('email') && !id.includes('phone') && !id.includes('tel') &&
                 !placeholder.toLowerCase().includes('email') && !placeholder.toLowerCase().includes('phone');
        }
      },
      {
        name: 'Title',
        selectors: [
          'input[name="title"]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[id="title"]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[name*="title"]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[id*="title"]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[placeholder*="title" i]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[placeholder*="website title" i]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[placeholder*="site title" i]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[placeholder*="max 80 chars" i]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[placeholder*="no keyword stuffing" i]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[placeholder*="business name" i]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[placeholder*="company name" i]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[placeholder*="listing title" i]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[placeholder*="entry title" i]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[name*="business_name"]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[name*="company_name"]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[name*="listing_title"]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[id*="business_name"]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[id*="company_name"]:not([type="email"]):not([type="tel"]):not([type="url"])',
          'input[id*="listing_title"]:not([type="email"]):not([type="tel"]):not([type="url"])'
        ],
        value: formData.title,
        validation: (element) => {
          const type = element.type || 'text';
          const name = element.name || '';
          const id = element.id || '';
          const placeholder = element.placeholder || '';
          return type !== 'email' && type !== 'tel' && type !== 'url' && 
                 (name.includes('title') || id.includes('title') || 
                  name.includes('business_name') || id.includes('business_name') ||
                  name.includes('company_name') || id.includes('company_name') ||
                  name.includes('listing_title') || id.includes('listing_title') ||
                  placeholder.toLowerCase().includes('title') ||
                  placeholder.toLowerCase().includes('max 80 chars') ||
                  placeholder.toLowerCase().includes('business name') ||
                  placeholder.toLowerCase().includes('company name'));
        }
      },
      {
        name: 'Business Name',
        selectors: [
          'input[name*="business"]:not([type="email"]):not([type="tel"])',
          'input[id*="business"]:not([type="email"]):not([type="tel"])',
          'input[name*="organization"]:not([type="email"]):not([type="tel"])',
          'input[id*="organization"]:not([type="email"]):not([type="tel"])',
          'input[name*="company_name"]:not([type="email"]):not([type="tel"])',
          'input[id*="company_name"]:not([type="email"]):not([type="tel"])',
          'input[placeholder*="business" i]:not([type="email"]):not([type="tel"])',
          'input[placeholder*="organization" i]:not([type="email"]):not([type="tel"])'
        ],
        value: formData.businessName,
        validation: (element) => {
          const type = element.type || 'text';
          const name = element.name || '';
          const id = element.id || '';
          return type !== 'email' && type !== 'tel' && type !== 'url' &&
                 (name.includes('business') || name.includes('organization') || name.includes('company_name') ||
                  id.includes('business') || id.includes('organization') || id.includes('company_name'));
        }
      },
      {
        name: 'Company',
        selectors: [
          'input[name*="company"]:not([type="email"]):not([type="tel"])',
          'input[id*="company"]:not([type="email"]):not([type="tel"])',
          'input[name*="firm"]:not([type="email"]):not([type="tel"])',
          'input[id*="firm"]:not([type="email"]):not([type="tel"])',
          'input[name*="corporation"]:not([type="email"]):not([type="tel"])',
          'input[id*="corporation"]:not([type="email"]):not([type="tel"])',
          'input[placeholder*="company" i]:not([type="email"]):not([type="tel"])',
          'input[placeholder*="firm" i]:not([type="email"]):not([type="tel"])'
        ],
        value: formData.company,
        validation: (element) => {
          const type = element.type || 'text';
          const name = element.name || '';
          const id = element.id || '';
          return type !== 'email' && type !== 'tel' && type !== 'url' &&
                 (name.includes('company') || name.includes('firm') || name.includes('corporation') ||
                  id.includes('company') || id.includes('firm') || id.includes('corporation'));
        }
      },
      {
        name: 'Email',
        selectors: [
          'input[type="email"]',
          'input[name*="email"]:not([name*="phone"]):not([name*="tel"])',
          'input[id*="email"]:not([id*="phone"]):not([id*="tel"])',
          'input[name*="mail"]:not([name*="phone"]):not([name*="tel"])',
          'input[id*="mail"]:not([id*="phone"]):not([id*="tel"])',
          'input[name*="e-mail"]:not([name*="phone"]):not([name*="tel"])',
          'input[id*="e-mail"]:not([id*="phone"]):not([id*="tel"])',
          'input[placeholder*="email" i]',
          'input[placeholder*="e-mail" i]'
        ],
        value: formData.email,
        validation: (element) => {
          const type = element.type || 'text';
          const name = element.name || '';
          const id = element.id || '';
          return type === 'email' || name.includes('email') || name.includes('mail') || name.includes('e-mail') ||
                 id.includes('email') || id.includes('mail') || id.includes('e-mail');
        }
      },
      {
        name: 'Phone',
        selectors: [
          'input[type="tel"]',
          'input[name*="phone"]:not([name*="email"])',
          'input[id*="phone"]:not([id*="email"])',
          'input[name*="tel"]:not([name*="email"])',
          'input[id*="tel"]:not([id*="email"])',
          'input[name*="mobile"]:not([name*="email"])',
          'input[id*="mobile"]:not([id*="email"])',
          'input[name*="cell"]:not([name*="email"])',
          'input[id*="cell"]:not([id*="email"])',
          'input[name*="contact"]:not([name*="email"])',
          'input[id*="contact"]:not([id*="email"])',
          'input[placeholder*="phone" i]',
          'input[placeholder*="tel" i]',
          'input[placeholder*="mobile" i]',
          'input[placeholder*="cell" i]'
        ],
        value: formData.phone,
        validation: (element) => {
          const type = element.type || 'text';
          const name = element.name || '';
          const id = element.id || '';
          return type === 'tel' || name.includes('phone') || name.includes('tel') || name.includes('mobile') || name.includes('cell') || name.includes('contact') ||
                 id.includes('phone') || id.includes('tel') || id.includes('mobile') || id.includes('cell') || id.includes('contact');
        }
      },
      {
        name: 'Website URL',
        selectors: [
          'input[type="url"]',
          'input[name*="website"]:not([name*="email"]):not([name*="phone"])',
          'input[id*="website"]:not([id*="email"]):not([id*="phone"])',
          'input[name*="url"]:not([name*="email"]):not([name*="phone"])',
          'input[id*="url"]:not([id*="email"]):not([id*="phone"])',
          'input[name*="link"]:not([name*="email"]):not([name*="phone"])',
          'input[id*="link"]:not([id*="email"]):not([id*="phone"])',
          'input[name*="web"]:not([name*="email"]):not([name*="phone"])',
          'input[id*="web"]:not([id*="email"]):not([id*="phone"])',
          'input[placeholder*="website" i]',
          'input[placeholder*="url" i]',
          'input[placeholder*="web" i]'
        ],
        value: formData.url,
        validation: (element) => {
          const type = element.type || 'text';
          const name = element.name || '';
          const id = element.id || '';
          return type === 'url' || name.includes('website') || name.includes('url') || name.includes('link') || name.includes('web') ||
                 id.includes('website') || id.includes('url') || id.includes('link') || id.includes('web');
        }
      },
      {
        name: 'Description',
        selectors: [
          'textarea[name*="description"]',
          'textarea[id*="description"]',
          'textarea[name*="about"]',
          'textarea[id*="about"]',
          'textarea[name*="summary"]',
          'textarea[id*="summary"]',
          'textarea[name*="details"]',
          'textarea[id*="details"]',
          'textarea[name*="message"]',
          'textarea[id*="message"]',
          'textarea[name*="comment"]',
          'textarea[id*="comment"]',
          'textarea[placeholder*="description" i]',
          'textarea[placeholder*="about" i]',
          'textarea[placeholder*="summary" i]',
          'textarea[placeholder*="details" i]'
        ],
        value: formData.description,
        validation: (element) => {
          const name = element.name || '';
          const id = element.id || '';
          return name.includes('description') || name.includes('about') || name.includes('summary') || name.includes('details') || name.includes('message') || name.includes('comment') ||
                 id.includes('description') || id.includes('about') || id.includes('summary') || id.includes('details') || id.includes('message') || id.includes('comment');
        }
      },
      {
        name: 'Address',
        selectors: [
          'input[name*="address"]:not([type="email"]):not([type="tel"])',
          'input[id*="address"]:not([type="email"]):not([type="tel"])',
          'input[name*="street"]:not([type="email"]):not([type="tel"])',
          'input[id*="street"]:not([type="email"]):not([type="tel"])',
          'input[name*="location"]:not([type="email"]):not([type="tel"])',
          'input[id*="location"]:not([type="email"]):not([type="tel"])',
          'input[placeholder*="address" i]:not([type="email"]):not([type="tel"])',
          'input[placeholder*="street" i]:not([type="email"]):not([type="tel"])'
        ],
        value: formData.address,
        validation: (element) => {
          const type = element.type || 'text';
          const name = element.name || '';
          const id = element.id || '';
          return type !== 'email' && type !== 'tel' && type !== 'url' &&
                 (name.includes('address') || name.includes('street') || name.includes('location') ||
                  id.includes('address') || id.includes('street') || id.includes('location'));
        }
      },
      {
        name: 'City',
        selectors: [
          'input[name*="city"]:not([type="email"]):not([type="tel"])',
          'input[id*="city"]:not([type="email"]):not([type="tel"])',
          'input[name*="town"]:not([type="email"]):not([type="tel"])',
          'input[id*="town"]:not([type="email"]):not([type="tel"])',
          'input[placeholder*="city" i]:not([type="email"]):not([type="tel"])',
          'input[placeholder*="town" i]:not([type="email"]):not([type="tel"])'
        ],
        value: formData.city,
        validation: (element) => {
          const type = element.type || 'text';
          const name = element.name || '';
          const id = element.id || '';
          return type !== 'email' && type !== 'tel' && type !== 'url' &&
                 (name.includes('city') || name.includes('town') ||
                  id.includes('city') || id.includes('town'));
        }
      },
      {
        name: 'State',
        selectors: [
          'input[name*="state"]:not([type="email"]):not([type="tel"])',
          'input[id*="state"]:not([type="email"]):not([type="tel"])',
          'input[name*="province"]:not([type="email"]):not([type="tel"])',
          'input[id*="province"]:not([type="email"]):not([type="tel"])',
          'input[name*="region"]:not([type="email"]):not([type="tel"])',
          'input[id*="region"]:not([type="email"]):not([type="tel"])',
          'input[placeholder*="state" i]:not([type="email"]):not([type="tel"])',
          'input[placeholder*="province" i]:not([type="email"]):not([type="tel"])'
        ],
        value: formData.state,
        validation: (element) => {
          const type = element.type || 'text';
          const name = element.name || '';
          const id = element.id || '';
          return type !== 'email' && type !== 'tel' && type !== 'url' &&
                 (name.includes('state') || name.includes('province') || name.includes('region') ||
                  id.includes('state') || id.includes('province') || id.includes('region'));
        }
      },
      {
        name: 'Country',
        selectors: [
          'input[name*="country"]:not([type="email"]):not([type="tel"])',
          'input[id*="country"]:not([type="email"]):not([type="tel"])',
          'input[name*="nation"]:not([type="email"]):not([type="tel"])',
          'input[id*="nation"]:not([type="email"]):not([type="tel"])',
          'input[placeholder*="country" i]:not([type="email"]):not([type="tel"])',
          'input[placeholder*="nation" i]:not([type="email"]):not([type="tel"])'
        ],
        value: formData.country,
        validation: (element) => {
          const type = element.type || 'text';
          const name = element.name || '';
          const id = element.id || '';
          return type !== 'email' && type !== 'tel' && type !== 'url' &&
                 (name.includes('country') || name.includes('nation') ||
                  id.includes('country') || id.includes('nation'));
        }
      },
      {
        name: 'ZIP Code',
        selectors: [
          'input[name*="zip"]:not([type="email"]):not([type="tel"])',
          'input[id*="zip"]:not([type="email"]):not([type="tel"])',
          'input[name*="postal"]:not([type="email"]):not([type="tel"])',
          'input[id*="postal"]:not([type="email"]):not([type="tel"])',
          'input[name*="postcode"]:not([type="email"]):not([type="tel"])',
          'input[id*="postcode"]:not([type="email"]):not([type="tel"])',
          'input[name*="pincode"]:not([type="email"]):not([type="tel"])',
          'input[id*="pincode"]:not([type="email"]):not([type="tel"])',
          'input[placeholder*="zip" i]:not([type="email"]):not([type="tel"])',
          'input[placeholder*="postal" i]:not([type="email"]):not([type="tel"])',
          'input[placeholder*="postcode" i]:not([type="email"]):not([type="tel"])'
        ],
        value: formData.zip,
        validation: (element) => {
          const type = element.type || 'text';
          const name = element.name || '';
          const id = element.id || '';
          return type !== 'email' && type !== 'tel' && type !== 'url' &&
                 (name.includes('zip') || name.includes('postal') || name.includes('postcode') || name.includes('pincode') ||
                  id.includes('zip') || id.includes('postal') || id.includes('postcode') || id.includes('pincode'));
        }
      }
    ];
    
    // Fill each field type with enhanced validation
    fieldMappings.forEach(mapping => {
      if (!mapping.value || mapping.value.trim() === '') {
        console.log(`⏭️ Skipping ${mapping.name} - no value available`);
        return;
      }
      
      console.log(`🎯 Looking for ${mapping.name} fields with value: "${mapping.value}"`);
      
      let fieldFilled = false;
      
      mapping.selectors.forEach(selector => {
        if (fieldFilled) return; // Skip if we already filled this field type
        
        try {
          const elements = document.querySelectorAll(selector);
          console.log(`🔍 Selector "${selector}" found ${elements.length} elements`);
          
          elements.forEach((element, index) => {
            // Skip if element is already filled or not suitable
            if (element && !element.disabled && !element.readOnly && !filledElements.has(element)) {
              // Apply enhanced validation
              if (mapping.validation && !mapping.validation(element)) {
                console.log(`⚠️ Skipping ${mapping.name} field - validation failed: ${element.name || element.id}`);
                return;
              }
              
              const hadValue = element.value && element.value.trim() !== '';
              
              element.value = mapping.value;
              element.dispatchEvent(new Event('input', { bubbles: true }));
              element.dispatchEvent(new Event('change', { bubbles: true }));
              element.dispatchEvent(new Event('blur', { bubbles: true }));
              
              // Mark element as filled to prevent conflicts
              filledElements.add(element);
              
              filledFields.push({
                selector: selector,
                value: mapping.value,
                element: element,
                hadExistingValue: hadValue,
                fieldType: mapping.name
              });
              
              fieldFilled = true; // Mark this field type as filled
              
              if (hadValue) {
                console.log(`🔄 Overwrote existing value in ${mapping.name} field: ${selector} = "${mapping.value}"`);
              } else {
                console.log(`✅ Filled empty ${mapping.name} field: ${selector} = "${mapping.value}"`);
              }
            }
          });
        } catch (error) {
          console.error(`❌ Error with selector "${selector}":`, error);
        }
      });
    });
    
    console.log(`🔍 Form field detection completed. Found ${filledFields.length} fields to fill.`);
    console.log('📊 Filled fields:', filledFields);
    
    // Enhanced fallback: Try to intelligently match fields based on context
    if (filledFields.length === 0 || filledFields.length < 3) {
      console.log('🔄 No specific fields found, trying enhanced fallback approach...');
      const fallbackInputs = document.querySelectorAll('input[type="text"]:not([name*="email"]):not([name*="phone"]):not([name*="tel"]):not([name*="url"]):not([name*="password"]):not([name*="hidden"]):not([name*="submit"]):not([name*="button"]), textarea:not([name*="email"]):not([name*="phone"]):not([name*="tel"])');
      
      console.log(`🔄 Found ${fallbackInputs.length} fallback text inputs`);
      
      // Enhanced field matching based on position and context
      fallbackInputs.forEach((input, index) => {
        if (!input.disabled && !input.readOnly && !filledElements.has(input)) {
          let value = '';
          let fieldType = '';
          
          // Smart field detection based on position, placeholder, and context
          const placeholder = (input.placeholder || '').toLowerCase();
          const name = (input.name || '').toLowerCase();
          const id = (input.id || '').toLowerCase();
          const isTextarea = input.tagName === 'TEXTAREA';
          
          // Title field detection (usually first field, short placeholder, or contains "title")
          if (index === 0 && !isTextarea && (placeholder.includes('title') || placeholder.includes('name') || placeholder.includes('max 80') || name.includes('title') || id.includes('title'))) {
            value = formData.title;
            fieldType = 'Title (Smart Match)';
          }
          // URL field detection (contains "url", "website", "link", or is second field)
          else if ((placeholder.includes('url') || placeholder.includes('website') || placeholder.includes('link') || name.includes('url') || name.includes('website') || id.includes('url') || id.includes('website')) && formData.url) {
            value = formData.url;
            fieldType = 'Website URL (Smart Match)';
          }
          // Description field detection (textarea, long placeholder, or contains "description")
          else if (isTextarea || placeholder.includes('description') || placeholder.includes('about') || placeholder.includes('summary') || name.includes('description') || id.includes('description')) {
            value = formData.description;
            fieldType = 'Description (Smart Match)';
          }
          // Name field detection (contains "name", "contact", or is early position)
          else if ((placeholder.includes('name') || placeholder.includes('contact') || name.includes('name') || id.includes('name')) && formData.name) {
            value = formData.name;
            fieldType = 'Name (Smart Match)';
          }
          // Company/Business field detection
          else if ((placeholder.includes('company') || placeholder.includes('business') || placeholder.includes('organization') || name.includes('company') || name.includes('business') || id.includes('company') || id.includes('business')) && formData.company) {
            value = formData.company;
            fieldType = 'Company (Smart Match)';
          }
          // Fallback to sequential order if no smart match
          else {
            if (index === 0 && formData.title) {
              value = formData.title;
              fieldType = 'Title (Position 1)';
            } else if (index === 1 && formData.url) {
              value = formData.url;
              fieldType = 'URL (Position 2)';
            } else if (index === 2 && formData.description) {
              value = formData.description;
              fieldType = 'Description (Position 3)';
            } else if (index === 3 && formData.name) {
              value = formData.name;
              fieldType = 'Name (Position 4)';
            } else if (index === 4 && formData.email) {
              value = formData.email;
              fieldType = 'Email (Position 5)';
            }
          }
          
          if (value) {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.dispatchEvent(new Event('blur', { bubbles: true }));
            filledElements.add(input);
            filledFields.push({
              selector: 'enhanced-fallback',
              value: value,
              element: input,
              hadExistingValue: input.value && input.value.trim() !== '',
              fieldType: fieldType
            });
            console.log(`✅ ${fieldType}: "${value}"`);
          }
        }
      });
    }
    
    // Secondary pass: Try to fill remaining important fields if we haven't filled enough
    if (filledFields.length < 5) {
      console.log('🔄 Secondary pass: Trying to fill remaining important fields...');
      const remainingInputs = document.querySelectorAll('input[type="text"]:not([name*="email"]):not([name*="phone"]):not([name*="tel"]):not([name*="url"]):not([name*="password"]):not([name*="hidden"]):not([name*="submit"]):not([name*="button"]), textarea:not([name*="email"]):not([name*="phone"]):not([name*="tel"])');
      
      const unfilledInputs = Array.from(remainingInputs).filter(input => !filledElements.has(input) && !input.disabled && !input.readOnly);
      
      console.log(`🔄 Found ${unfilledInputs.length} remaining unfilled inputs`);
      
      // Try to fill remaining fields with available data
      const availableData = [
        { value: formData.phone, type: 'Phone' },
        { value: formData.address, type: 'Address' },
        { value: formData.city, type: 'City' },
        { value: formData.state, type: 'State' },
        { value: formData.country, type: 'Country' },
        { value: formData.zip, type: 'ZIP Code' }
      ].filter(item => item.value && item.value.trim() !== '');
      
      unfilledInputs.forEach((input, index) => {
        if (index < availableData.length) {
          const data = availableData[index];
          input.value = data.value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new Event('blur', { bubbles: true }));
          filledElements.add(input);
          filledFields.push({
            selector: 'secondary-pass',
            value: data.value,
            element: input,
            hadExistingValue: input.value && input.value.trim() !== '',
            fieldType: `${data.type} (Secondary Pass)`
          });
          console.log(`✅ ${data.type} (Secondary Pass): "${data.value}"`);
        }
      });
    }
    
    return filledFields;
  }

  // Check usage limit before filling forms
  async function checkUsageLimit() {
    if (!token) {
      console.log('⚠️ No token available for usage check');
      return { allowed: true };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/bookmarklet/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Usage check successful');
        return { allowed: true, usage: result.usage };
      } else {
        const errorData = await response.json();
        console.error('❌ Usage check failed:', response.status, errorData);
        
        // Show user-friendly error messages
        if (response.status === 403) {
          if (errorData.trialExpired) {
            showPopup('❌ Your free trial has expired. Please upgrade to continue using bookmarklets.', 'error');
          } else if (errorData.usage?.type === 'per_bookmarklet') {
            showPopup(`❌ This bookmarklet has already been used ${errorData.usage.used} times. Maximum ${errorData.usage.limit} uses per bookmarklet for ${errorData.usage.plan} plan.`, 'error');
          } else if (errorData.usage?.type === 'daily_limit') {
            showPopup(`❌ Daily bookmarklet limit exceeded. Maximum ${errorData.usage.limit} bookmarklet submissions per day for ${errorData.usage.plan} plan.`, 'error');
          } else {
            showPopup(`❌ Bookmarklet usage limit exceeded: ${errorData.error}`, 'error');
          }
        } else {
          showPopup(`❌ Failed to check usage limit: ${errorData.error || 'Unknown error'}`, 'error');
        }
        return { allowed: false, error: errorData };
      }
    } catch (error) {
      console.error('❌ Error checking usage limit:', error);
      showPopup('❌ Network error while checking usage limit. Please check your connection.', 'error');
      return { allowed: false, error: error };
    }
  }

  // Track submission with enhanced error handling
  async function trackSubmission(filledFields) {
    if (!token) {
      console.log('⚠️ No token available for tracking');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/bookmarklet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          url: window.location.href,
          fieldsFilled: filledFields.length,
          filledFields: filledFields.map(field => ({
            selector: field.selector,
            fieldType: field.fieldType,
            value: field.value.substring(0, 100) // Truncate for privacy
          })),
          timestamp: new Date().toISOString(),
          source: 'bookmarklet',
          userAgent: navigator.userAgent,
          referrer: document.referrer
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Submission tracked successfully');
        
        // Show usage information to user
        if (result.usage) {
          const remaining = result.usage.limit - result.usage.used;
          if (remaining <= 1) {
            console.log(`⚠️ Warning: Only ${remaining} use(s) remaining for this bookmarklet`);
          }
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to track submission:', response.status, errorData);
        showPopup(`❌ Failed to track submission: ${errorData.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('❌ Error tracking submission:', error);
      showPopup('❌ Network error while tracking submission. Please check your connection.', 'error');
    }
  }

  // Main execution
  async function main() {
    console.log('🚀 Starting OPPTYM Auto-Fill...');
    console.log('📊 Form data available:', formData);
    console.log('📊 Project data available:', projectData);

    // Check usage limit before filling forms
    const usageCheck = await checkUsageLimit();
    
    if (!usageCheck.allowed) {
      console.log('❌ Usage limit exceeded, stopping execution');
      return;
    }

    const filledFields = fillFormFields();

    if (filledFields.length === 0) {
      console.log('⚠️ No form fields found to fill');
      showPopup('⚠️ No form fields found to fill on this page.', 'error');
    } else {
      console.log(`🎉 Successfully filled ${filledFields.length} form fields!`);
      showPopup(`🎉 Successfully filled ${filledFields.length} form fields!`, 'success');
      
      // Track the submission
      trackSubmission(filledFields);
    }

    console.log(`🎉 OPPTYM Auto-Fill Bookmarklet v${BOOKMARKLET_VERSION} completed!`);
  }

  // Execute main function
  main().catch(error => {
    console.error('❌ Bookmarklet execution error:', error);
    showPopup('❌ An error occurred while running the bookmarklet.', 'error');
  });

  } // End of else block for projectData check
})();