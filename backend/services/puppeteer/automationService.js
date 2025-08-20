const puppeteer = require('puppeteer');

class AutomationService {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Puppeteer browser...');
      
      const launchOptions = {
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-field-trial-config',
          '--disable-ipc-flooding-protection',
          '--window-size=1920,1080',
          '--single-process',
          '--disable-gpu-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-extensions',
          '--disable-plugins'
        ],
        defaultViewport: { width: 1920, height: 1080 },
        ignoreDefaultArgs: ['--enable-automation'],
        timeout: 30000
      };

      console.log('🔧 Launching browser with options:', launchOptions);
      this.browser = await puppeteer.launch(launchOptions);
      console.log('✅ Browser launched successfully');
      
      this.page = await this.browser.newPage();
      console.log('✅ New page created successfully');
      
      // Set viewport
      await this.page.setViewport({ width: 1920, height: 1080 });
      console.log('✅ Viewport set successfully');
      
      // Set user agent
      await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      console.log('✅ User agent set successfully');
      
      console.log('✅ Puppeteer browser initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Puppeteer:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return false;
    }
  }

  async navigateToUrl(url) {
    try {
      console.log(`🌐 Navigating to: ${url}`);
      await this.page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait for page to load and show user what's happening
      console.log('⏳ Waiting for page to fully load...');
      await this.delay(3000);
      console.log('✅ Page loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to navigate:', error);
      return false;
    }
  }

  async fillFormFields(projectData) {
    try {
      console.log('🤖 Starting form field detection and filling...');
      
      // Wait for page to load completely
      await this.delay(3000);
      
      // Try to find forms first, but don't fail if none found
      let forms = [];
      try {
        await this.page.waitForSelector('form', { timeout: 5000 });
        forms = await this.page.$$('form');
        console.log(`📝 Found ${forms.length} forms on the page`);
      } catch (formError) {
        console.log('⚠️ No forms found, will search for input fields directly');
      }
      
      let totalFieldsFilled = 0;
      let filledFields = [];
      
      // If forms found, process them
      if (forms.length > 0) {
        for (let formIndex = 0; formIndex < forms.length; formIndex++) {
          const form = forms[formIndex];
          console.log(`🔄 Processing form ${formIndex + 1}/${forms.length}`);
          
          const result = await this.processInputFields(form, projectData, `Form ${formIndex + 1}`);
          totalFieldsFilled += result.filled;
          filledFields.push(...result.fields);
        }
      } else {
        // If no forms, search for input fields on the entire page
        console.log('🔄 Searching for input fields on entire page...');
        const result = await this.processInputFields(this.page, projectData, 'Page');
        totalFieldsFilled += result.filled;
        filledFields.push(...result.fields);
      }
      
      console.log(`🎯 Total fields filled: ${totalFieldsFilled}`);
      return { totalFieldsFilled, filledFields };
      
    } catch (error) {
      console.error('❌ Error filling form fields:', error);
      return { totalFieldsFilled: 0, filledFields: [], error: error.message };
    }
  }

  async processInputFields(container, projectData, context) {
    let totalFieldsFilled = 0;
    let filledFields = [];
    
    try {
      // Get all input fields in the container
      const inputs = await container.$$('input, textarea, select');
      console.log(`📋 ${context} has ${inputs.length} input fields`);
      
      for (let inputIndex = 0; inputIndex < inputs.length; inputIndex++) {
        const input = inputs[inputIndex];
        
        try {
          // Get input properties
          const inputInfo = await this.page.evaluate(el => {
            return {
              type: el.type || el.tagName.toLowerCase(),
              name: el.name || '',
              id: el.id || '',
              placeholder: el.placeholder || '',
              value: el.value || '',
              required: el.required || false,
              disabled: el.disabled || false,
              readonly: el.readOnly || false,
              visible: el.offsetParent !== null // Check if element is visible
            };
          }, input);
          
          // Skip if field is disabled, readonly, already has a value, or not visible
          if (inputInfo.disabled || inputInfo.readonly || inputInfo.value || !inputInfo.visible) {
            console.log(`⏭️ Skipping field: ${inputInfo.name || inputInfo.id || inputInfo.placeholder} (disabled: ${inputInfo.disabled}, readonly: ${inputInfo.readonly}, hasValue: ${!!inputInfo.value}, visible: ${inputInfo.visible})`);
            continue;
          }
          
          // Determine what to fill based on field properties
          const fieldValue = this.mapFieldToValue(inputInfo, projectData);
          
          if (fieldValue) {
            // Scroll to the field to ensure it's visible
            await input.scrollIntoView();
            await this.delay(500);
            
            // Click on the field first to focus it
            await input.click();
            await this.delay(200);
            
            // Clear the field first
            await input.evaluate(el => el.value = '');
            
            // Fill the field
            await input.type(fieldValue, { delay: 100 });
            
            // Trigger input events
            await input.evaluate(el => {
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
              el.dispatchEvent(new Event('blur', { bubbles: true }));
            });
            
            totalFieldsFilled++;
            filledFields.push({
              field: `${inputInfo.name || inputInfo.id || inputInfo.placeholder || `Field ${inputIndex + 1}`}`,
              value: fieldValue,
              type: inputInfo.type
            });
            
            console.log(`✅ Filled field: ${inputInfo.name || inputInfo.id || inputInfo.placeholder} with: ${fieldValue}`);
            
            // Delay between fields so user can see the automation
            await this.delay(800);
          } else {
            console.log(`❓ No mapping found for field: ${inputInfo.name || inputInfo.id || inputInfo.placeholder} (type: ${inputInfo.type})`);
          }
        } catch (fieldError) {
          console.log(`⚠️ Error processing field ${inputIndex + 1}: ${fieldError.message}`);
          continue;
        }
      }
    } catch (error) {
      console.error(`❌ Error processing ${context} fields:`, error);
    }
    
    return { filled: totalFieldsFilled, fields: filledFields };
  }

  mapFieldToValue(inputInfo, projectData) {
    const fieldName = (inputInfo.name || inputInfo.id || inputInfo.placeholder || '').toLowerCase();
    const fieldType = inputInfo.type.toLowerCase();
    
    console.log(`🔍 Mapping field: ${fieldName} (type: ${fieldType})`);
    
    // Email fields
    if (fieldType === 'email' || fieldName.includes('email') || fieldName.includes('e-mail')) {
      const email = projectData.email || projectData.contactEmail;
      console.log(`📧 Email field detected, using: ${email}`);
      return email;
    }
    
    // Phone fields
    if (fieldType === 'tel' || fieldName.includes('phone') || fieldName.includes('mobile') || fieldName.includes('telephone') || fieldName.includes('contact')) {
      const phone = projectData.phone || projectData.businessPhone || projectData.contactPhone;
      console.log(`📞 Phone field detected, using: ${phone}`);
      return phone;
    }
    
    // Name fields (personal name)
    if ((fieldName.includes('name') && !fieldName.includes('company') && !fieldName.includes('business') && !fieldName.includes('user')) || 
        fieldName.includes('first') || fieldName.includes('last') || fieldName.includes('full')) {
      const name = projectData.name || projectData.contactName || projectData.contactPerson;
      console.log(`👤 Name field detected, using: ${name}`);
      return name;
    }
    
    // Company/Business fields
    if (fieldName.includes('company') || fieldName.includes('business') || fieldName.includes('organization') || fieldName.includes('firm') || fieldName.includes('enterprise')) {
      const company = projectData.companyName || projectData.businessName || projectData.company;
      console.log(`🏢 Company field detected, using: ${company}`);
      return company;
    }
    
    // Website/URL fields
    if (fieldName.includes('website') || fieldName.includes('url') || fieldName.includes('site') || fieldName.includes('web') || fieldName.includes('link')) {
      const url = projectData.url || projectData.website || projectData.siteUrl;
      console.log(`🌐 Website field detected, using: ${url}`);
      return url;
    }
    
    // Address fields
    if (fieldName.includes('address') || fieldName.includes('street') || fieldName.includes('location')) {
      const address = projectData.address || projectData.streetAddress;
      console.log(`📍 Address field detected, using: ${address}`);
      return address;
    }
    
    // City fields
    if (fieldName.includes('city') || fieldName.includes('town')) {
      const city = projectData.city;
      console.log(`🏙️ City field detected, using: ${city}`);
      return city;
    }
    
    // State fields
    if (fieldName.includes('state') || fieldName.includes('province') || fieldName.includes('region')) {
      const state = projectData.state;
      console.log(`🗺️ State field detected, using: ${state}`);
      return state;
    }
    
    // Zip/Postal code fields
    if (fieldName.includes('zip') || fieldName.includes('postal') || fieldName.includes('pincode') || fieldName.includes('code')) {
      const zip = projectData.pincode || projectData.zipCode || projectData.postalCode;
      console.log(`📮 Zip field detected, using: ${zip}`);
      return zip;
    }
    
    // Country fields
    if (fieldName.includes('country') || fieldName.includes('nation')) {
      const country = projectData.country;
      console.log(`🌍 Country field detected, using: ${country}`);
      return country;
    }
    
    // Description fields
    if (fieldName.includes('description') || fieldName.includes('about') || fieldName.includes('details') || fieldName.includes('info') || fieldName.includes('summary')) {
      const description = projectData.description || projectData.businessDescription;
      console.log(`📝 Description field detected, using: ${description}`);
      return description;
    }
    
    // Category fields
    if (fieldName.includes('category') || fieldName.includes('type') || fieldName.includes('industry') || fieldName.includes('sector')) {
      const category = projectData.category || projectData.businessType;
      console.log(`🏷️ Category field detected, using: ${category}`);
      return category;
    }
    
    // Title fields
    if (fieldName.includes('title') || fieldName.includes('job') || fieldName.includes('position')) {
      const title = projectData.title || projectData.businessTitle;
      console.log(`💼 Title field detected, using: ${title}`);
      return title;
    }
    
    // Username fields
    if (fieldName.includes('username') || fieldName.includes('user') || fieldName.includes('login')) {
      const username = projectData.name || projectData.companyName;
      console.log(`👤 Username field detected, using: ${username}`);
      return username;
    }
    
    // Comments/Message fields
    if (fieldName.includes('comment') || fieldName.includes('message') || fieldName.includes('note') || fieldName.includes('text')) {
      const message = projectData.description || `Contact from ${projectData.companyName || projectData.name}`;
      console.log(`💬 Message field detected, using: ${message}`);
      return message;
    }
    
    console.log(`❓ No mapping found for field: ${fieldName}`);
    return null;
  }

  async submitForm() {
    try {
      console.log('🚀 Attempting to submit form...');
      
      // Look for submit buttons
      const submitButtons = await this.page.$$('input[type="submit"], button[type="submit"]');
      
      if (submitButtons.length > 0) {
        console.log(`📤 Found ${submitButtons.length} submit button(s)`);
        
        // Click the first submit button
        await submitButtons[0].click();
        
        // Wait for submission to complete
        await this.delay(3000);
        
        console.log('✅ Form submitted successfully');
        return true;
      } else {
        console.log('⚠️ No submit button found, form may need manual submission');
        return false;
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      return false;
    }
  }

  async getCurrentUrl() {
    try {
      if (this.page) {
        const url = await this.page.url();
        console.log('📍 Current page URL:', url);
        return url;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting current URL:', error);
      return null;
    }
  }

  async captureCompleteFormState() {
    try {
      console.log('📸 Capturing complete form state...');
      
      if (!this.page) {
        throw new Error('No page available for form state capture');
      }

      // Wait for page to be fully loaded
      await this.delay(2000);

      // Capture all form data and HTML
      const formState = await this.page.evaluate(() => {
        const forms = document.querySelectorAll('form');
        const allInputs = document.querySelectorAll('input, textarea, select');
        
        console.log(`Found ${forms.length} forms and ${allInputs.length} input fields`);
        
        // Capture all form HTML
        const formHTML = Array.from(forms).map(form => form.outerHTML).join('\n');
        
        // Capture all input field data
        const inputData = Array.from(allInputs).map((input, index) => {
          return {
            index: index,
            type: input.type || input.tagName.toLowerCase(),
            name: input.name || '',
            id: input.id || '',
            placeholder: input.placeholder || '',
            value: input.value || '',
            required: input.required || false,
            disabled: input.disabled || false,
            readonly: input.readOnly || false,
            visible: input.offsetParent !== null,
            selector: this.generateSelector(input)
          };
        });

        // Generate injection script
        const injectionScript = `
          (function() {
            console.log('🚀 Injecting form data...');
            const formData = ${JSON.stringify(inputData)};
            
            formData.forEach(field => {
              try {
                const element = document.querySelector(field.selector);
                if (element && field.value && !field.disabled && !field.readonly) {
                  element.value = field.value;
                  element.dispatchEvent(new Event('input', { bubbles: true }));
                  element.dispatchEvent(new Event('change', { bubbles: true }));
                  console.log('✅ Filled field:', field.name || field.id, 'with:', field.value);
                }
              } catch (e) {
                console.log('⚠️ Could not fill field:', field.name || field.id, e);
              }
            });
            
            console.log('✅ Form injection completed');
          })();
        `;

        return {
          totalForms: forms.length,
          totalFields: allInputs.length,
          formHTML: formHTML,
          inputData: inputData,
          injectionScript: injectionScript,
          pageTitle: document.title,
          pageUrl: window.location.href
        };
      });

      console.log('✅ Form state captured successfully');
      return formState;
      
    } catch (error) {
      console.error('❌ Error capturing form state:', error);
      return {
        totalForms: 0,
        totalFields: 0,
        formHTML: '',
        inputData: [],
        injectionScript: null,
        pageTitle: '',
        pageUrl: ''
      };
    }
  }

  generateSelector(element) {
    // Generate a unique selector for the element
    if (element.id) {
      return `#${element.id}`;
    }
    if (element.name) {
      return `[name="${element.name}"]`;
    }
    if (element.className) {
      return `.${element.className.split(' ')[0]}`;
    }
    return `${element.tagName.toLowerCase()}:nth-child(${Array.from(element.parentNode?.children || []).indexOf(element) + 1})`;
  }

  async captureFilledForm() {
    try {
      console.log('📸 Capturing filled form...');
      
      // Wait a bit for any animations to complete
      await this.delay(2000);
      
      // Take a screenshot of the filled form
      const screenshot = await this.page.screenshot({ 
        fullPage: true,
        type: 'png'
      });
      
      // Convert to base64 for easy transmission
      const base64Screenshot = screenshot.toString('base64');
      
      // Get the current URL
      const currentUrl = this.page.url();
      
      // Get form data for reference
      const formData = await this.page.evaluate(() => {
        const forms = document.querySelectorAll('form');
        const formInfo = [];
        
        forms.forEach((form, index) => {
          const inputs = form.querySelectorAll('input, textarea, select');
          const filledFields = [];
          
          inputs.forEach(input => {
            if (input.value) {
              filledFields.push({
                name: input.name || input.id || input.placeholder || `Field ${index}`,
                value: input.value,
                type: input.type || input.tagName.toLowerCase()
              });
            }
          });
          
          formInfo.push({
            formIndex: index,
            filledFields: filledFields
          });
        });
        
        return formInfo;
      });
      
      console.log('✅ Form captured successfully');
      
      return {
        screenshot: base64Screenshot,
        url: currentUrl,
        formData: formData,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error capturing filled form:', error);
      return null;
    }
  }

  async close() {
    try {
      if (this.browser) {
        // Wait a bit before closing so user can see the final result
        console.log('⏳ Waiting 5 seconds before closing browser...');
        await this.delay(5000);
        
        await this.browser.close();
        console.log('🔒 Browser closed successfully');
      }
    } catch (error) {
      console.error('❌ Error closing browser:', error);
    }
  }

  async takeScreenshot(filename = 'automation-result.png') {
    try {
      await this.page.screenshot({ 
        path: filename, 
        fullPage: true 
      });
      console.log(`📸 Screenshot saved as: ${filename}`);
      return filename;
    } catch (error) {
      console.error('❌ Error taking screenshot:', error);
      return null;
    }
  }

  // Helper method for delays
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = AutomationService;
