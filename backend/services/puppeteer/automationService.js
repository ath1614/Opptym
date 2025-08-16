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
      
      // Wait for forms to be present
      await this.page.waitForSelector('form', { timeout: 10000 });
      
      // Get all forms on the page
      const forms = await this.page.$$('form');
      console.log(`📝 Found ${forms.length} forms on the page`);
      
      let totalFieldsFilled = 0;
      let filledFields = [];
      
      for (let formIndex = 0; formIndex < forms.length; formIndex++) {
        const form = forms[formIndex];
        console.log(`🔄 Processing form ${formIndex + 1}/${forms.length}`);
        
        // Get all input fields in this form
        const inputs = await form.$$('input, textarea, select');
        console.log(`📋 Form ${formIndex + 1} has ${inputs.length} fields`);
        
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
                readonly: el.readOnly || false
              };
            }, input);
            
            // Skip if field is disabled, readonly, or already has a value
            if (inputInfo.disabled || inputInfo.readonly || inputInfo.value) {
              continue;
            }
            
            // Determine what to fill based on field properties
            const fieldValue = this.mapFieldToValue(inputInfo, projectData);
            
            if (fieldValue) {
              // Fill the field
              await input.type(fieldValue);
              
              // Trigger input event
              await input.evaluate(el => {
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
              });
              
              totalFieldsFilled++;
              filledFields.push({
                field: `${inputInfo.name || inputInfo.id || inputInfo.placeholder || `Field ${inputIndex + 1}`}`,
                value: fieldValue,
                type: inputInfo.type
              });
              
              console.log(`✅ Filled field: ${inputInfo.name || inputInfo.id || inputInfo.placeholder} with: ${fieldValue}`);
              
              // Longer delay between fields so user can see the automation
              await this.delay(1000);
            }
          } catch (fieldError) {
            console.log(`⚠️ Skipping field ${inputIndex + 1}: ${fieldError.message}`);
            continue;
          }
        }
      }
      
      console.log(`🎯 Total fields filled: ${totalFieldsFilled}`);
      return { totalFieldsFilled, filledFields };
      
    } catch (error) {
      console.error('❌ Error filling form fields:', error);
      return { totalFieldsFilled: 0, filledFields: [], error: error.message };
    }
  }

  mapFieldToValue(inputInfo, projectData) {
    const fieldName = (inputInfo.name || inputInfo.id || inputInfo.placeholder || '').toLowerCase();
    const fieldType = inputInfo.type.toLowerCase();
    
    // Email fields
    if (fieldType === 'email' || fieldName.includes('email')) {
      return projectData.email || projectData.contactEmail;
    }
    
    // Phone fields
    if (fieldType === 'tel' || fieldName.includes('phone') || fieldName.includes('mobile') || fieldName.includes('telephone')) {
      return projectData.phone || projectData.businessPhone || projectData.contactPhone;
    }
    
    // Name fields
    if (fieldName.includes('name') && !fieldName.includes('company') && !fieldName.includes('business')) {
      return projectData.name || projectData.contactName || projectData.contactPerson;
    }
    
    // Company/Business fields
    if (fieldName.includes('company') || fieldName.includes('business') || fieldName.includes('organization')) {
      return projectData.companyName || projectData.businessName || projectData.company;
    }
    
    // Website/URL fields
    if (fieldName.includes('website') || fieldName.includes('url') || fieldName.includes('site')) {
      return projectData.url || projectData.website || projectData.siteUrl;
    }
    
    // Address fields
    if (fieldName.includes('address') || fieldName.includes('street')) {
      return projectData.address || projectData.streetAddress;
    }
    
    // City fields
    if (fieldName.includes('city')) {
      return projectData.city;
    }
    
    // State fields
    if (fieldName.includes('state') || fieldName.includes('province')) {
      return projectData.state;
    }
    
    // Zip/Postal code fields
    if (fieldName.includes('zip') || fieldName.includes('postal') || fieldName.includes('pincode')) {
      return projectData.pincode || projectData.zipCode || projectData.postalCode;
    }
    
    // Country fields
    if (fieldName.includes('country')) {
      return projectData.country;
    }
    
    // Description fields
    if (fieldName.includes('description') || fieldName.includes('about') || fieldName.includes('details')) {
      return projectData.description || projectData.businessDescription;
    }
    
    // Category fields
    if (fieldName.includes('category') || fieldName.includes('type') || fieldName.includes('industry')) {
      return projectData.category || projectData.businessType;
    }
    
    // Title fields
    if (fieldName.includes('title')) {
      return projectData.title || projectData.businessTitle;
    }
    
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
