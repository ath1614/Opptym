// OPPTYM Auto-Fill Bookmarklet - Enhanced Field Mapping
// Version: 3.0.0 - Fixed Field Mapping Issues

const BOOKMARKLET_VERSION = '3.0.0';
const API_BASE_URL = 'https://api.opptym.com/api';

console.log(`🚀 OPPTYM Auto-Fill Bookmarklet v${BOOKMARKLET_VERSION} starting...`);

// Extract URL parameters
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Robust JSON parsing with multiple fallback methods
function parseJsonSafely(jsonString) {
  if (!jsonString) return null;
  
  try {
    // Method 1: Direct parse
    return JSON.parse(jsonString);
  } catch (e1) {
    try {
      // Method 2: Decode URI component first
      const decoded = decodeURIComponent(jsonString);
      return JSON.parse(decoded);
    } catch (e2) {
      try {
        // Method 3: Unescape then decode
        const unescaped = unescape(jsonString);
        const decoded = decodeURIComponent(unescaped);
        return JSON.parse(decoded);
      } catch (e3) {
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
            .replace(/%5Cn/g, '\n');
          return JSON.parse(fixed);
        } catch (e4) {
          console.error('❌ All JSON parsing methods failed:', e4);
          return null;
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
  alert('⚠️ No project data available. Please generate a bookmarklet with project data from Opptym.');
  return;
}

// Create form data object
const formData = {
  name: projectData.name || '',
  businessName: projectData.businessName || projectData.companyName || '',
  company: projectData.companyName || projectData.businessName || '',
  email: projectData.email || '',
  phone: projectData.businessPhone || projectData.phone || '',
  url: projectData.url || '',
  description: projectData.description || '',
  address: projectData.address1 || projectData.address || '',
  city: projectData.city || '',
  state: projectData.state || '',
  country: projectData.country || '',
  zip: projectData.pincode || projectData.zip || ''
};

console.log('📊 Form data prepared:', formData);

// Enhanced field mapping with strict validation
function fillFormFields() {
  const filledFields = [];
  const filledElements = new Set();
  
  // Strict field mappings with precise selectors
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
        'input[placeholder*="name" i]:not([type="email"]):not([type="tel"]):not([type="url"])'
      ],
      value: formData.name,
      validation: (element) => {
        const type = element.type || 'text';
        const name = element.name || '';
        const id = element.id || '';
        return type !== 'email' && type !== 'tel' && type !== 'url' && 
               !name.includes('email') && !name.includes('phone') && !name.includes('tel') &&
               !id.includes('email') && !id.includes('phone') && !id.includes('tel');
      }
    },
    {
      name: 'Business Name',
      selectors: [
        'input[name*="business"]:not([type="email"]):not([type="tel"])',
        'input[id*="business"]:not([type="email"]):not([type="tel"])',
        'input[name*="organization"]:not([type="email"]):not([type="tel"])',
        'input[id*="organization"]:not([type="email"]):not([type="tel"])',
        'input[placeholder*="business" i]:not([type="email"]):not([type="tel"])'
      ],
      value: formData.businessName,
      validation: (element) => {
        const type = element.type || 'text';
        const name = element.name || '';
        const id = element.id || '';
        return type !== 'email' && type !== 'tel' && type !== 'url' &&
               (name.includes('business') || name.includes('organization') || 
                id.includes('business') || id.includes('organization'));
      }
    },
    {
      name: 'Company',
      selectors: [
        'input[name*="company"]:not([type="email"]):not([type="tel"])',
        'input[id*="company"]:not([type="email"]):not([type="tel"])',
        'input[name*="firm"]:not([type="email"]):not([type="tel"])',
        'input[id*="firm"]:not([type="email"]):not([type="tel"])',
        'input[placeholder*="company" i]:not([type="email"]):not([type="tel"])'
      ],
      value: formData.company,
      validation: (element) => {
        const type = element.type || 'text';
        const name = element.name || '';
        const id = element.id || '';
        return type !== 'email' && type !== 'tel' && type !== 'url' &&
               (name.includes('company') || name.includes('firm') ||
                id.includes('company') || id.includes('firm'));
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
        'input[placeholder*="email" i]'
      ],
      value: formData.email,
      validation: (element) => {
        const type = element.type || 'text';
        const name = element.name || '';
        const id = element.id || '';
        return type === 'email' || name.includes('email') || name.includes('mail') ||
               id.includes('email') || id.includes('mail');
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
        'input[placeholder*="phone" i]',
        'input[placeholder*="tel" i]'
      ],
      value: formData.phone,
      validation: (element) => {
        const type = element.type || 'text';
        const name = element.name || '';
        const id = element.id || '';
        return type === 'tel' || name.includes('phone') || name.includes('tel') || name.includes('mobile') ||
               id.includes('phone') || id.includes('tel') || id.includes('mobile');
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
        'input[name*="anchor"]:not([name*="email"]):not([name*="phone"])',
        'input[id*="anchor"]:not([id*="email"]):not([id*="phone"])',
        'input[placeholder*="website" i]',
        'input[placeholder*="url" i]'
      ],
      value: formData.url,
      validation: (element) => {
        const type = element.type || 'text';
        const name = element.name || '';
        const id = element.id || '';
        return type === 'url' || name.includes('website') || name.includes('url') || name.includes('link') || name.includes('anchor') ||
               id.includes('website') || id.includes('url') || id.includes('link') || id.includes('anchor');
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
        'textarea[placeholder*="description" i]',
        'textarea[placeholder*="about" i]'
      ],
      value: formData.description,
      validation: (element) => {
        const name = element.name || '';
        const id = element.id || '';
        return name.includes('description') || name.includes('about') || name.includes('summary') ||
               id.includes('description') || id.includes('about') || id.includes('summary');
      }
    },
    {
      name: 'Address',
      selectors: [
        'input[name*="address"]:not([type="email"]):not([type="tel"])',
        'input[id*="address"]:not([type="email"]):not([type="tel"])',
        'input[name*="street"]:not([type="email"]):not([type="tel"])',
        'input[id*="street"]:not([type="email"]):not([type="tel"])',
        'input[placeholder*="address" i]:not([type="email"]):not([type="tel"])'
      ],
      value: formData.address,
      validation: (element) => {
        const type = element.type || 'text';
        const name = element.name || '';
        const id = element.id || '';
        return type !== 'email' && type !== 'tel' && type !== 'url' &&
               (name.includes('address') || name.includes('street') ||
                id.includes('address') || id.includes('street'));
      }
    },
    {
      name: 'City',
      selectors: [
        'input[name*="city"]:not([type="email"]):not([type="tel"])',
        'input[id*="city"]:not([type="email"]):not([type="tel"])',
        'input[placeholder*="city" i]:not([type="email"]):not([type="tel"])'
      ],
      value: formData.city,
      validation: (element) => {
        const type = element.type || 'text';
        const name = element.name || '';
        const id = element.id || '';
        return type !== 'email' && type !== 'tel' && type !== 'url' &&
               (name.includes('city') || id.includes('city'));
      }
    },
    {
      name: 'State',
      selectors: [
        'input[name*="state"]:not([type="email"]):not([type="tel"])',
        'input[id*="state"]:not([type="email"]):not([type="tel"])',
        'input[placeholder*="state" i]:not([type="email"]):not([type="tel"])'
      ],
      value: formData.state,
      validation: (element) => {
        const type = element.type || 'text';
        const name = element.name || '';
        const id = element.id || '';
        return type !== 'email' && type !== 'tel' && type !== 'url' &&
               (name.includes('state') || id.includes('state'));
      }
    },
    {
      name: 'Country',
      selectors: [
        'input[name*="country"]:not([type="email"]):not([type="tel"])',
        'input[id*="country"]:not([type="email"]):not([type="tel"])',
        'input[placeholder*="country" i]:not([type="email"]):not([type="tel"])'
      ],
      value: formData.country,
      validation: (element) => {
        const type = element.type || 'text';
        const name = element.name || '';
        const id = element.id || '';
        return type !== 'email' && type !== 'tel' && type !== 'url' &&
               (name.includes('country') || id.includes('country'));
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
        'input[placeholder*="zip" i]:not([type="email"]):not([type="tel"])'
      ],
      value: formData.zip,
      validation: (element) => {
        const type = element.type || 'text';
        const name = element.name || '';
        const id = element.id || '';
        return type !== 'email' && type !== 'tel' && type !== 'url' &&
               (name.includes('zip') || name.includes('postal') || name.includes('postcode') ||
                id.includes('zip') || id.includes('postal') || id.includes('postcode'));
      }
    }
  ];
  
  // Fill each field type with strict validation
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
            // Apply strict validation
            if (mapping.validation && !mapping.validation(element)) {
              console.log(`⚠️ Skipping ${mapping.name} field - validation failed: ${element.name || element.id}`);
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
        console.error(`❌ Error with selector "${selector}":`, error);
      }
    });
  });
  
  return filledFields;
}

// Track submission
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
        source: 'bookmarklet'
      })
    });
    
    if (response.ok) {
      console.log('✅ Submission tracked successfully');
    } else {
      console.error('❌ Failed to track submission:', response.status);
    }
  } catch (error) {
    console.error('❌ Error tracking submission:', error);
  }
}

// Main execution
console.log('🚀 Starting OPPTYM Auto-Fill...');

const filledFields = fillFormFields();

if (filledFields.length === 0) {
  console.log('⚠️ No form fields found to fill');
  alert('⚠️ No form fields found to fill on this page.');
} else {
  console.log(`🎉 Successfully filled ${filledFields.length} form fields!`);
  alert(`🎉 Successfully filled ${filledFields.length} form fields!`);
  
  // Track the submission
  trackSubmission(filledFields);
}

console.log(`🎉 OPPTYM Auto-Fill Bookmarklet v${BOOKMARKLET_VERSION} completed!`);
