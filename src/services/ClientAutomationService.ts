import { showPopup } from '../utils/popup';

export interface ProjectData {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  url: string;
  description: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export class ClientAutomationService {
  private projectData: ProjectData;

  constructor(projectData: ProjectData) {
    this.projectData = projectData;
  }

  // Create a bookmarklet that can be used to fill forms
  createBookmarklet(): string {
         const script = `
       (function() {
         console.log('🚀 Starting form automation...');
         console.log('📋 Project data received:', ${JSON.stringify(this.projectData)});
         console.log('🌐 Current URL:', window.location.href);
         console.log('📄 Page title:', document.title);
         
         const projectData = ${JSON.stringify(this.projectData)};
        
                 // Function to map field to value
         function mapFieldToValue(input) {
           const fieldName = (input.name || input.id || input.placeholder || '').toLowerCase();
           const fieldType = input.type.toLowerCase();
           
           console.log('🔍 Mapping field:', {
             fieldName: fieldName,
             fieldType: fieldType,
             originalName: input.name,
             originalId: input.id,
             originalPlaceholder: input.placeholder
           });
          
                     // Email fields
           if (fieldName.includes('email') || fieldType === 'email') {
             console.log('📧 Matched email field, value:', projectData.email);
             return projectData.email;
           }
           
           // Name fields
           if (fieldName.includes('name') || fieldName.includes('fullname') || fieldName.includes('firstname')) {
             console.log('👤 Matched name field, value:', projectData.name);
             return projectData.name;
           }
           
           // Phone fields
           if (fieldName.includes('phone') || fieldName.includes('mobile') || fieldName.includes('contact')) {
             console.log('📞 Matched phone field, value:', projectData.phone);
             return projectData.phone;
           }
           
           // Company fields
           if (fieldName.includes('company') || fieldName.includes('business') || fieldName.includes('organization')) {
             console.log('🏢 Matched company field, value:', projectData.companyName);
             return projectData.companyName;
           }
           
           // Website/URL fields
           if (fieldName.includes('website') || fieldName.includes('url') || fieldName.includes('site')) {
             console.log('🌐 Matched website field, value:', projectData.url);
             return projectData.url;
           }
           
           // Address fields
           if (fieldName.includes('address') || fieldName.includes('street')) {
             console.log('📍 Matched address field, value:', projectData.address || '');
             return projectData.address || '';
           }
           
           // City fields
           if (fieldName.includes('city')) {
             console.log('🏙️ Matched city field, value:', projectData.city || '');
             return projectData.city || '';
           }
           
           // State fields
           if (fieldName.includes('state') || fieldName.includes('province')) {
             console.log('🏛️ Matched state field, value:', projectData.state || '');
             return projectData.state || '';
           }
           
           // Zip/Postal code fields
           if (fieldName.includes('zip') || fieldName.includes('postal') || fieldName.includes('pincode')) {
             console.log('📮 Matched zip field, value:', projectData.pincode || '');
             return projectData.pincode || '';
           }
           
           // Country fields
           if (fieldName.includes('country')) {
             console.log('🌍 Matched country field, value:', projectData.country || '');
             return projectData.country || '';
           }
           
           // Description fields
           if (fieldName.includes('description') || fieldName.includes('about') || fieldName.includes('details') || fieldName.includes('message')) {
             console.log('📝 Matched description field, value:', projectData.description);
             return projectData.description;
           }
           
           // Category fields
           if (fieldName.includes('category') || fieldName.includes('type') || fieldName.includes('industry')) {
             console.log('🏷️ Matched category field, value:', projectData.companyName);
             return projectData.companyName;
           }
           
           // Title fields
           if (fieldName.includes('title')) {
             console.log('📋 Matched title field, value:', projectData.companyName);
             return projectData.companyName;
           }
           
           console.log('❌ No match found for field:', fieldName);
           return null;
        }
        
        // Function to fill field with animation
        async function fillFieldWithAnimation(input, value) {
          return new Promise((resolve) => {
            // Add visual feedback
            input.style.border = '2px solid #10b981';
            input.style.backgroundColor = '#f0fdf4';
            
            // Fill the field character by character for visual effect
            input.focus();
            input.value = '';
            
            let i = 0;
            const typeInterval = setInterval(() => {
              if (i < value.length) {
                input.value += value[i];
                i++;
              } else {
                clearInterval(typeInterval);
                
                // Trigger events
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Remove visual feedback after a delay
                setTimeout(() => {
                  input.style.border = '';
                  input.style.backgroundColor = '';
                }, 1000);
                
                resolve();
              }
            }, 50); // 50ms delay between characters
          });
        }
        
                 // Main automation function
         async function automateForms() {
           try {
             console.log('🔄 Starting form automation process...');
             
             // Wait a bit for any dynamic content to load
             console.log('⏳ Waiting for page to fully load...');
             await new Promise(resolve => setTimeout(resolve, 2000));
             console.log('✅ Page load wait completed');
             
             // Get all forms on the page
             const forms = document.querySelectorAll('form');
             console.log('📝 Found ' + forms.length + ' forms on the page');
             
             if (forms.length === 0) {
               console.warn('⚠️ No forms found on this page');
               showPopup('No forms found on this page. Please make sure you are on a page with forms.', 'warning');
               return;
             }
            
            let totalFieldsFilled = 0;
            
                         for (let formIndex = 0; formIndex < forms.length; formIndex++) {
               const form = forms[formIndex];
               console.log('🔄 Processing form ' + (formIndex + 1) + '/' + forms.length);
               console.log('📋 Form details:', {
                 action: form.action,
                 method: form.method,
                 id: form.id,
                 className: form.className
               });
               
               // Get all input fields in this form
               const inputs = form.querySelectorAll('input, textarea, select');
               console.log('📝 Form ' + (formIndex + 1) + ' has ' + inputs.length + ' fields');
               
               if (inputs.length === 0) {
                 console.warn('⚠️ Form ' + (formIndex + 1) + ' has no input fields');
                 continue;
               }
              
                             for (let inputIndex = 0; inputIndex < inputs.length; inputIndex++) {
                 const input = inputs[inputIndex];
                 
                 console.log('🔍 Processing field ' + (inputIndex + 1) + '/' + inputs.length + ':', {
                   type: input.type,
                   name: input.name,
                   id: input.id,
                   placeholder: input.placeholder,
                   value: input.value,
                   disabled: input.disabled,
                   readOnly: input.readOnly
                 });
                 
                 try {
                   // Skip if field is disabled, readonly, or already has a value
                   if (input.disabled) {
                     console.log('⏭️ Skipping disabled field:', input.name || input.id);
                     continue;
                   }
                   
                   if (input.readOnly) {
                     console.log('⏭️ Skipping readonly field:', input.name || input.id);
                     continue;
                   }
                   
                   if (input.value) {
                     console.log('⏭️ Skipping field with existing value:', input.name || input.id, '=', input.value);
                     continue;
                   }
                   
                   // Determine what to fill based on field properties
                   console.log('🤔 Mapping field to value...');
                   const fieldValue = mapFieldToValue(input);
                   
                   if (fieldValue) {
                     console.log('✅ Found value for field:', input.name || input.id, '=', fieldValue);
                     
                     // Fill the field with animation
                     console.log('🎨 Starting field animation...');
                     await fillFieldWithAnimation(input, fieldValue);
                     
                     totalFieldsFilled++;
                     console.log('✅ Successfully filled field: ' + (input.name || input.id || input.placeholder) + ' with: ' + fieldValue);
                     
                     // Small delay between fields for visual effect
                     console.log('⏳ Waiting between fields...');
                     await new Promise(resolve => setTimeout(resolve, 500));
                   } else {
                     console.log('❌ No value mapped for field:', input.name || input.id);
                   }
                 } catch (fieldError) {
                   console.error('❌ Error processing field ' + (inputIndex + 1) + ':', fieldError);
                   console.error('❌ Field details:', {
                     type: input.type,
                     name: input.name,
                     id: input.id,
                     error: fieldError.message || fieldError
                   });
                   continue;
                 }
               }
            }
            
                         console.log('🎯 Total fields filled: ' + totalFieldsFilled);
             console.log('📊 Automation summary:', {
               totalForms: forms.length,
               totalFieldsFilled: totalFieldsFilled,
               success: true
             });
             
             // Show success notification with action buttons
             console.log('🎉 Creating success notification...');
             const notification = document.createElement('div');
             notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 20px; border-radius: 12px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); z-index: 10000; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; font-weight: 500; min-width: 300px;';
             
             notification.innerHTML = 
               '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">' +
                 '<span style="font-size: 18px;">✅</span>' +
                 '<span style="font-weight: 600;">Form filled successfully!</span>' +
               '</div>' +
               '<p style="margin: 0 0 12px 0; opacity: 0.9;">' + totalFieldsFilled + ' fields filled with your project data.</p>' +
               '<div style="display: flex; gap: 8px;">' +
                 '<button id="viewFilledForm" style="background: #ffffff; color: #10b981; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">🌐 View Form</button>' +
                 '<button id="closeNotification" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">Close</button>' +
               '</div>';
             
             document.body.appendChild(notification);
             console.log('✅ Success notification displayed');
             
             // Add event listeners for buttons
             const viewFormButton = document.getElementById('viewFilledForm');
             const closeButton = document.getElementById('closeNotification');
             
             if (viewFormButton) {
               viewFormButton.addEventListener('click', () => {
                 console.log('🌐 User clicked View Form button');
                 // The form is already filled on the current page, so just scroll to it
                 const forms = document.querySelectorAll('form');
                 if (forms.length > 0) {
                   forms[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                   // Highlight the form briefly
                   forms[0].style.border = '3px solid #10b981';
                   forms[0].style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.3)';
                   setTimeout(() => {
                     forms[0].style.border = '';
                     forms[0].style.boxShadow = '';
                   }, 3000);
                 }
               });
             }
             
             if (closeButton) {
               closeButton.addEventListener('click', () => {
                 if (notification.parentNode) {
                   notification.parentNode.removeChild(notification);
                   console.log('🗑️ Success notification closed by user');
                 }
               });
             }
             
             // Remove notification after 10 seconds (longer for better UX)
             setTimeout(() => {
               if (notification.parentNode) {
                 notification.parentNode.removeChild(notification);
                 console.log('🗑️ Success notification auto-removed');
               }
             }, 10000);
             
           } catch (error) {
             console.error('❌ Automation error:', error);
             console.error('❌ Error details:', {
               message: error.message || 'Unknown error',
               stack: error.stack || 'No stack trace',
               name: error.name || 'Unknown error type'
             });
             
             // Show error notification
             const errorNotification = document.createElement('div');
             errorNotification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); z-index: 10000; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; font-weight: 500;';
             errorNotification.innerHTML = '<div style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 18px;">❌</span><span>Automation failed: ' + (error.message || 'Unknown error') + '</span></div>';
             
             document.body.appendChild(errorNotification);
             
             setTimeout(() => {
               if (errorNotification.parentNode) {
                 errorNotification.parentNode.removeChild(errorNotification);
               }
             }, 5000);
             
             showPopup('❌ Automation failed: ' + (error.message || 'Unknown error'), 'error');
           }
        }
        
        // Start automation
        automateForms();
      })();
    `;
    
    return `javascript:${encodeURIComponent(script)}`;
  }

  // Start automation by opening URL and providing instructions
  async startAutomation(url: string): Promise<void> {
    try {
      console.log('🚀 Starting client automation for URL:', url);
      console.log('📋 Project data:', this.projectData);
      
      // Create the bookmarklet first
      console.log('🔧 Creating bookmarklet...');
      const bookmarklet = this.createBookmarklet();
      console.log('✅ Bookmarklet created successfully');
      console.log('🔗 Bookmarklet length:', bookmarklet.length, 'characters');
      
      // Show instructions in the current window (no cross-origin issues)
      console.log('📋 Showing instructions modal...');
      this.showFallbackInstructions(bookmarklet, url);
      
      // Open the URL in a new tab without trying to access it
      console.log('🌐 Opening target website in new tab...');
      const newWindow = window.open(url, '_blank', 'width=1200,height=800');
      if (newWindow) {
        console.log('✅ Target website opened successfully');
      } else {
        console.warn('⚠️ Popup blocked, but instructions are still available');
      }
      
      console.log('✅ Client automation setup completed successfully');

    } catch (error) {
      console.error('❌ Client automation error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown error type'
      });
      throw error;
    }
  }

  // Enhanced instructions with manual form filling guide
  private showFallbackInstructions(bookmarklet: string, url: string): void {
    console.log('📋 Showing enhanced instructions...');
    
    // Create a comprehensive modal in the current window
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 30px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
    content.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <div style="font-size: 32px;">🤖</div>
        <div>
          <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">Form Auto-Fill Setup</h2>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Choose your preferred method below</p>
        </div>
      </div>
      
      <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 18px;">🚀</span>
          <span style="font-weight: 600; color: #065f46;">Method 1: Automatic Form Filling (Recommended)</span>
        </div>
        <p style="color: #065f46; line-height: 1.6; font-size: 14px; margin: 0 0 12px 0;">
          Use the bookmarklet to automatically fill forms on the target website.
        </p>
      </div>
      
      <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 18px;">📋</span>
          <span style="font-weight: 600; color: #0c4a6e;">Automatic Steps:</span>
        </div>
        <ol style="margin: 0; padding-left: 20px; color: #0c4a6e; line-height: 1.6; font-size: 14px;">
          <li><strong>Copy the bookmarklet code</strong> using the "📋 Copy Bookmarklet" button below</li>
          <li><strong>Right-click your bookmarks bar</strong> → Select "Add page" or "Add bookmark"</li>
          <li><strong>Name it</strong> "Auto-Fill Forms" (or any name you like)</li>
          <li><strong>Paste the code</strong> into the URL/Address field</li>
          <li><strong>Save the bookmark</strong></li>
          <li><strong>Go to target website</strong> → Click "🌐 Open Website" below</li>
          <li><strong>Click your bookmark</strong> → Forms will fill automatically!</li>
          <li><strong>Submit the form</strong> → Click the submit button on the website</li>
        </ol>
      </div>
      
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 18px;">✏️</span>
          <span style="font-weight: 600; color: #92400e;">Method 2: Manual Form Filling</span>
        </div>
        <p style="color: #92400e; line-height: 1.6; font-size: 14px; margin: 0 0 12px 0;">
          If the bookmarklet doesn't work, you can manually fill the form using your project data below.
        </p>
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
            <div><strong>Name:</strong> ${this.projectData.name}</div>
            <div><strong>Email:</strong> ${this.projectData.email}</div>
            <div><strong>Phone:</strong> ${this.projectData.phone}</div>
            <div><strong>Company:</strong> ${this.projectData.companyName}</div>
            <div><strong>Website:</strong> ${this.projectData.url}</div>
            <div><strong>Description:</strong> ${this.projectData.description.substring(0, 50)}${this.projectData.description.length > 50 ? '...' : ''}</div>
          </div>
        </div>
        <p style="color: #92400e; line-height: 1.6; font-size: 12px; margin: 0;">
          Copy these values and paste them into the corresponding form fields on the target website.
        </p>
      </div>
      
      <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 18px;">🔗</span>
          <span style="font-weight: 600; color: #065f46;">Bookmarklet Code:</span>
        </div>
        <textarea 
          readonly 
          style="width: 100%; height: 80px; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; font-family: monospace; font-size: 12px; resize: vertical;"
          onclick="this.select();"
        >${bookmarklet}</textarea>
        <p style="margin: 8px 0 0 0; color: #065f46; font-size: 12px;">
          Click the textarea above to select all, then copy (Ctrl+C / Cmd+C)
        </p>
      </div>
      
      <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 18px;">💡</span>
          <span style="font-weight: 600; color: #0c4a6e;">How to Access & Submit Filled Form:</span>
        </div>
        <p style="color: #0c4a6e; line-height: 1.6; font-size: 14px; margin: 0;">
          After the form is filled (either automatically or manually), you can interact with it directly on the target website. 
          Review the filled fields, make any changes if needed, and click the submit button to complete your submission.
        </p>
      </div>
      
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <button id="copyBookmarklet" style="background: #10b981; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 500;">📋 Copy Bookmarklet</button>
        <button id="copyProjectData" style="background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 500;">📋 Copy Project Data</button>
        <button id="openTargetWebsite" style="background: #8b5cf6; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 500;">🌐 Open Website</button>
        <button id="closeFallback" style="background: #6b7280; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 500;">Close</button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Add event listeners
    const copyBookmarkletButton = document.getElementById('copyBookmarklet');
    const copyProjectDataButton = document.getElementById('copyProjectData');
    const openWebsiteButton = document.getElementById('openTargetWebsite');
    const closeButton = document.getElementById('closeFallback');
    
    if (copyBookmarkletButton) {
      copyBookmarkletButton.addEventListener('click', () => {
        navigator.clipboard.writeText(bookmarklet).then(() => {
          copyBookmarkletButton.textContent = '✅ Copied!';
          setTimeout(() => {
            copyBookmarkletButton.textContent = '📋 Copy Bookmarklet';
          }, 2000);
        }).catch(() => {
          showPopup('Please manually copy the bookmarklet code from the textarea above.', 'warning');
        });
      });
    }
    
    if (copyProjectDataButton) {
      copyProjectDataButton.addEventListener('click', () => {
        const projectDataText = `Name: ${this.projectData.name}
Email: ${this.projectData.email}
Phone: ${this.projectData.phone}
Company: ${this.projectData.companyName}
Website: ${this.projectData.url}
Description: ${this.projectData.description}`;
        
        navigator.clipboard.writeText(projectDataText).then(() => {
          copyProjectDataButton.textContent = '✅ Copied!';
          setTimeout(() => {
            copyProjectDataButton.textContent = '📋 Copy Project Data';
          }, 2000);
        }).catch(() => {
          showPopup('Please manually copy the project data from the modal above.', 'warning');
        });
      });
    }
    
    if (openWebsiteButton) {
      openWebsiteButton.addEventListener('click', () => {
        window.open(url, '_blank', 'width=1200,height=800');
      });
    }
    
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    }
    
    console.log('✅ Fallback instructions displayed');
  }

    // Removed showInstructions method to avoid cross-origin issues
}
