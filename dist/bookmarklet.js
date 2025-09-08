(function() {
  'use strict';
  
  // Configuration
  const API_BASE_URL = window.location.origin + '/api';
  const BOOKMARKLET_VERSION = '1.0.0';
  
  // Get token and project data from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const projectDataParam = urlParams.get('project');
  const directoryDataParam = urlParams.get('directory');
  
  // Parse project and directory data
  let projectData = null;
  let directoryData = null;
  
  try {
    if (projectDataParam) {
      projectData = JSON.parse(decodeURIComponent(projectDataParam));
    }
    if (directoryDataParam) {
      directoryData = JSON.parse(decodeURIComponent(directoryDataParam));
    }
  } catch (e) {
    console.error('Error parsing project/directory data:', e);
  }
  
  // Validate token
  if (!token) {
    alert('❌ Invalid bookmarklet token. Please generate a new bookmarklet from Opptym.');
    return;
  }
  
  // Validate project data
  if (!projectData) {
    alert('❌ No project data found. Please generate a new bookmarklet from Opptym.');
    return;
  }
  
  // Check if this token has already been used
  const usedTokens = JSON.parse(localStorage.getItem('opptym_used_tokens') || '[]');
  if (usedTokens.includes(token)) {
    alert('❌ This bookmarklet has already been used. Please generate a new one from Opptym.');
    return;
  }
  
  // Mark token as used immediately
  usedTokens.push(token);
  localStorage.setItem('opptym_used_tokens', JSON.stringify(usedTokens));
  
  // Create the main bookmarklet interface
  function createBookmarkletInterface() {
    // Remove existing interface if it exists
    const existingInterface = document.getElementById('opptym-bookmarklet-interface');
    if (existingInterface) {
      existingInterface.remove();
    }
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'opptym-bookmarklet-interface';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    `;
    
    modal.innerHTML = `
      <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2 style="margin: 0; color: #1f2937; font-size: 24px; font-weight: 600;">
            🚀 Opptym Bookmarklet
          </h2>
          ${projectData ? `
            <div style="margin-top: 4px; font-size: 14px; color: #3b82f6;">
              📋 Project: <strong>${projectData.title || 'Unknown'}</strong>
            </div>
          ` : ''}
          ${directoryData ? `
            <div style="font-size: 12px; color: #6b7280;">
              🎯 Directory: ${directoryData.name || 'Unknown'}
            </div>
          ` : ''}
        </div>
        <button id="opptym-close" style="
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          margin-left: auto;
        ">×</button>
      </div>
      
      <div id="opptym-content">
        <div id="opptym-loading" style="text-align: center; padding: 20px;">
          <div style="
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          "></div>
          <p style="color: #6b7280; margin: 0;">Loading Opptym Bookmarklet...</p>
        </div>
        
        <div id="opptym-form" style="display: none;">
          <p style="color: #6b7280; margin-bottom: 20px;">
            ${projectData ? 
              'Your project data is ready! Click "Auto-Fill Form" to fill the directory submission form with your project information.' :
              'Fill out the form below and we\'ll auto-fill the directory submission form on this page.'
            }
          </p>
          
          ${projectData ? `
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <h4 style="margin: 0 0 8px; color: #0c4a6e; font-size: 14px; font-weight: 600;">📋 Project Information</h4>
              <div style="font-size: 13px; color: #0c4a6e; line-height: 1.4;">
                <div><strong>Name:</strong> ${projectData.name || 'Not set'}</div>
                <div><strong>Company:</strong> ${projectData.companyName || 'Not set'}</div>
                <div><strong>Email:</strong> ${projectData.email || 'Not set'}</div>
                <div><strong>Website:</strong> ${projectData.url || 'Not set'}</div>
                ${projectData.businessPhone ? `<div><strong>Phone:</strong> ${projectData.businessPhone}</div>` : ''}
              </div>
            </div>
          ` : ''}
          
          <form id="opptym-business-form">
            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">
                Business Name *
              </label>
              <input type="text" id="business-name" required value="${projectData?.companyName || ''}" style="
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                box-sizing: border-box;
              ">
            </div>
            
            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">
                Website URL
              </label>
              <input type="url" id="business-url" value="${projectData?.url || ''}" style="
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                box-sizing: border-box;
              ">
            </div>
            
            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">
                Email *
              </label>
              <input type="email" id="business-email" required value="${projectData?.email || ''}" style="
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                box-sizing: border-box;
              ">
            </div>
            
            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">
                Phone
              </label>
              <input type="tel" id="business-phone" value="${projectData?.businessPhone || ''}" style="
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                box-sizing: border-box;
              ">
            </div>
            
            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">
                Description
              </label>
              <textarea id="business-description" rows="3" style="
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                box-sizing: border-box;
                resize: vertical;
              ">${projectData?.description || ''}</textarea>
            </div>
            
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">
                Address
              </label>
              <input type="text" id="business-address" value="${projectData?.address1 || ''}" style="
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                box-sizing: border-box;
              ">
            </div>
            
            <div style="display: flex; gap: 12px;">
              ${projectData ? `
                <button type="button" id="opptym-quick-fill" style="
                  background: #10b981;
                  color: white;
                  border: none;
                  padding: 12px 24px;
                  border-radius: 6px;
                  font-size: 14px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: background-color 0.2s;
                " onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
                  ⚡ Quick Fill
                </button>
              ` : ''}
              <button type="submit" style="
                flex: 1;
                background: #3b82f6;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s;
              " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                🚀 Auto-Fill Form
              </button>
              <button type="button" id="opptym-cancel" style="
                background: #6b7280;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s;
              " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#6b7280'">
                Cancel
              </button>
            </div>
          </form>
        </div>
        
        <div id="opptym-success" style="display: none; text-align: center; padding: 20px;">
          <div style="
            width: 60px;
            height: 60px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            font-size: 24px;
          ">✅</div>
          <h3 style="color: #1f2937; margin: 0 0 8px;">Form Filled Successfully!</h3>
          <p style="color: #6b7280; margin: 0;">The directory submission form has been auto-filled with your business information.</p>
        </div>
        
        <div id="opptym-error" style="display: none; text-align: center; padding: 20px;">
          <div style="
            width: 60px;
            height: 60px;
            background: #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            font-size: 24px;
          ">❌</div>
          <h3 style="color: #1f2937; margin: 0 0 8px;">Error</h3>
          <p id="opptym-error-message" style="color: #6b7280; margin: 0;"></p>
        </div>
      </div>
      
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add event listeners
    document.getElementById('opptym-close').addEventListener('click', closeInterface);
    document.getElementById('opptym-cancel').addEventListener('click', closeInterface);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeInterface();
    });
    
    document.getElementById('opptym-business-form').addEventListener('submit', handleFormSubmit);
    
    // Add quick fill button listener if it exists
    const quickFillBtn = document.getElementById('opptym-quick-fill');
    if (quickFillBtn) {
      quickFillBtn.addEventListener('click', function() {
        if (projectData) {
          const formData = {
            businessName: projectData.companyName || '',
            businessUrl: projectData.url || '',
            businessEmail: projectData.email || '',
            businessPhone: projectData.businessPhone || '',
            businessDescription: projectData.description || '',
            businessAddress: projectData.address1 || ''
          };
          autoFillForm(formData);
        }
      });
    }
    
    // Show the form after a brief loading
    setTimeout(() => {
      document.getElementById('opptym-loading').style.display = 'none';
      document.getElementById('opptym-form').style.display = 'block';
    }, 1000);
  }
  
  // Close the interface
  function closeInterface() {
    const bookmarkletInterface = document.getElementById('opptym-bookmarklet-interface');
    if (bookmarkletInterface) {
      bookmarkletInterface.remove();
    }
  }
  
  // Handle form submission
  function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
      businessName: document.getElementById('business-name').value,
      businessUrl: document.getElementById('business-url').value,
      businessEmail: document.getElementById('business-email').value,
      businessPhone: document.getElementById('business-phone').value,
      businessDescription: document.getElementById('business-description').value,
      businessAddress: document.getElementById('business-address').value
    };
    
    // Auto-fill the form
    autoFillForm(formData);
  }
  
  // Auto-fill form fields on the page
  function autoFillForm(data) {
    try {
      let filledFields = 0;
      
      // Enhanced field mappings with more comprehensive selectors
      const fieldMappings = [
        // Business name fields
        { 
          selectors: [
            'input[name*="name"]', 'input[name*="business"]', 'input[name*="company"]', 'input[name*="title"]',
            'input[id*="name"]', 'input[id*="business"]', 'input[id*="company"]', 'input[id*="title"]',
            'input[placeholder*="name"]', 'input[placeholder*="business"]', 'input[placeholder*="company"]',
            'input[class*="name"]', 'input[class*="business"]', 'input[class*="company"]'
          ], 
          value: data.businessName 
        },
        // Email fields
        { 
          selectors: [
            'input[type="email"]', 'input[name*="email"]', 'input[id*="email"]', 
            'input[placeholder*="email"]', 'input[class*="email"]'
          ], 
          value: data.businessEmail 
        },
        // Phone fields
        { 
          selectors: [
            'input[type="tel"]', 'input[name*="phone"]', 'input[name*="tel"]', 'input[name*="mobile"]',
            'input[id*="phone"]', 'input[id*="tel"]', 'input[id*="mobile"]',
            'input[placeholder*="phone"]', 'input[placeholder*="tel"]', 'input[placeholder*="mobile"]',
            'input[class*="phone"]', 'input[class*="tel"]', 'input[class*="mobile"]'
          ], 
          value: data.businessPhone 
        },
        // URL fields
        { 
          selectors: [
            'input[type="url"]', 'input[name*="url"]', 'input[name*="website"]', 'input[name*="web"]',
            'input[id*="url"]', 'input[id*="website"]', 'input[id*="web"]',
            'input[placeholder*="url"]', 'input[placeholder*="website"]', 'input[placeholder*="web"]',
            'input[class*="url"]', 'input[class*="website"]', 'input[class*="web"]'
          ], 
          value: data.businessUrl 
        },
        // Description fields
        { 
          selectors: [
            'textarea[name*="description"]', 'textarea[name*="about"]', 'textarea[name*="bio"]',
            'textarea[id*="description"]', 'textarea[id*="about"]', 'textarea[id*="bio"]',
            'textarea[placeholder*="description"]', 'textarea[placeholder*="about"]',
            'textarea[class*="description"]', 'textarea[class*="about"]'
          ], 
          value: data.businessDescription 
        },
        // Address fields
        { 
          selectors: [
            'input[name*="address"]', 'input[name*="street"]', 'input[name*="location"]',
            'input[id*="address"]', 'input[id*="street"]', 'input[id*="location"]',
            'input[placeholder*="address"]', 'input[placeholder*="street"]',
            'input[class*="address"]', 'input[class*="street"]'
          ], 
          value: data.businessAddress 
        }
      ];
      
      // Try to fill fields
      fieldMappings.forEach(mapping => {
        if (!mapping.value) return;
        
        mapping.selectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
              if (element && !element.disabled && !element.readOnly && !element.value) {
                element.value = mapping.value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                element.dispatchEvent(new Event('blur', { bubbles: true }));
                filledFields++;
              }
            });
          } catch (selectorError) {
            console.warn('Selector error:', selector, selectorError);
          }
        });
      });
      
      // Also try to fill common form patterns
      const commonPatterns = [
        { pattern: /business|company|organization/i, value: data.businessName },
        { pattern: /email|e-mail/i, value: data.businessEmail },
        { pattern: /phone|telephone|mobile/i, value: data.businessPhone },
        { pattern: /website|url|web/i, value: data.businessUrl },
        { pattern: /description|about|bio/i, value: data.businessDescription },
        { pattern: /address|street|location/i, value: data.businessAddress }
      ];
      
      // Find all input and textarea elements
      const allFormElements = document.querySelectorAll('input, textarea, select');
      allFormElements.forEach(element => {
        if (element.disabled || element.readOnly || element.value) return;
        
        const elementText = (element.name || element.id || element.placeholder || element.className || '').toLowerCase();
        
        commonPatterns.forEach(pattern => {
          if (pattern.pattern.test(elementText) && pattern.value) {
            element.value = pattern.value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            filledFields++;
          }
        });
      });
      
      // Show success message with count
      document.getElementById('opptym-form').style.display = 'none';
      document.getElementById('opptym-success').style.display = 'block';
      
      // Update success message with filled fields count
      const successMessage = document.querySelector('#opptym-success p');
      if (successMessage) {
        successMessage.textContent = `Successfully filled ${filledFields} form fields with your business information.`;
      }
      
      // Auto-close after 3 seconds
      setTimeout(closeInterface, 3000);
      
    } catch (error) {
      console.error('Opptym Bookmarklet Error:', error);
      showError('Failed to auto-fill form: ' + error.message);
    }
  }
  
  // Show error message
  function showError(message) {
    document.getElementById('opptym-form').style.display = 'none';
    document.getElementById('opptym-error').style.display = 'block';
    document.getElementById('opptym-error-message').textContent = message;
  }
  
  // Initialize the bookmarklet
  createBookmarkletInterface();
  
})();
