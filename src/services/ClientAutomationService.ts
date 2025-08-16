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
               alert('No forms found on this page. Please make sure you are on a page with forms.');
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
             
             // Show success notification
             console.log('🎉 Creating success notification...');
             const notification = document.createElement('div');
             notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); z-index: 10000; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; font-weight: 500;';
             notification.innerHTML = '<div style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 18px;">✅</span><span>Form filled successfully! You can now submit.</span></div>';
             
             document.body.appendChild(notification);
             console.log('✅ Success notification displayed');
             
             // Remove notification after 5 seconds
             setTimeout(() => {
               if (notification.parentNode) {
                 notification.parentNode.removeChild(notification);
                 console.log('🗑️ Success notification removed');
               }
             }, 5000);
             
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
             
             alert('❌ Automation failed: ' + (error.message || 'Unknown error'));
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
      
      // Open the URL in a new tab
      console.log('🌐 Opening new window...');
      const newWindow = window.open(url, '_blank', 'width=1200,height=800');
      
      if (!newWindow) {
        console.error('❌ Popup blocked! Please allow popups for this site.');
        throw new Error('Popup blocked! Please allow popups for this site.');
      }

      console.log('✅ New window opened successfully');
      console.log('🔧 Creating bookmarklet...');

      // Create the bookmarklet
      const bookmarklet = this.createBookmarklet();
      console.log('✅ Bookmarklet created successfully');
      console.log('🔗 Bookmarklet length:', bookmarklet.length, 'characters');
      
      // Show instructions to the user
      console.log('📋 Showing instructions overlay...');
      this.showInstructions(newWindow, bookmarklet);
      
      // Also show instructions in the current window as fallback
      this.showFallbackInstructions(bookmarklet, url);
      
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

  // Fallback instructions for cross-origin issues
  private showFallbackInstructions(bookmarklet: string, url: string): void {
    console.log('📋 Showing fallback instructions...');
    
    // Create a simple modal in the current window
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
          <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">Manual Auto-Fill Setup</h2>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Cross-origin restrictions detected</p>
        </div>
      </div>
      
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 18px;">⚠️</span>
          <span style="font-weight: 600; color: #92400e;">Cross-Origin Issue Detected</span>
        </div>
        <p style="color: #92400e; line-height: 1.6; font-size: 14px; margin: 0;">
          The target website has security restrictions that prevent automatic overlay creation. 
          Please follow the manual steps below.
        </p>
      </div>
      
      <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 18px;">📋</span>
          <span style="font-weight: 600; color: #0c4a6e;">Manual Steps:</span>
        </div>
        <ol style="margin: 0; padding-left: 20px; color: #0c4a6e; line-height: 1.6; font-size: 14px;">
          <li>Go to the target website: <a href="${url}" target="_blank" style="color: #0ea5e9;">${url}</a></li>
          <li>Copy the bookmarklet code below</li>
          <li>Create a new bookmark in your browser</li>
          <li>Paste the code as the bookmark URL</li>
          <li>Click the bookmark on the target website</li>
        </ol>
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
      
      <div style="display: flex; gap: 12px;">
        <button id="copyBookmarklet" style="background: #10b981; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 500;">📋 Copy to Clipboard</button>
        <button id="closeFallback" style="background: #6b7280; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 500;">Close</button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Add event listeners
    const copyButton = document.getElementById('copyBookmarklet');
    const closeButton = document.getElementById('closeFallback');
    
    if (copyButton) {
      copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(bookmarklet).then(() => {
          copyButton.textContent = '✅ Copied!';
          setTimeout(() => {
            copyButton.textContent = '📋 Copy to Clipboard';
          }, 2000);
        }).catch(() => {
          alert('Please manually copy the bookmarklet code from the textarea above.');
        });
      });
    }
    
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    }
    
    console.log('✅ Fallback instructions displayed');
  }

  private showInstructions(window: Window, bookmarklet: string): void {
    try {
      console.log('📋 Attempting to show instructions overlay...');
      
      // Create instructions overlay
      const overlay = window.document.createElement('div');
      overlay.style.cssText = `
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
    
    const content = window.document.createElement('div');
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
          <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">Form Auto-Fill Instructions</h2>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Follow these steps to auto-fill the form</p>
        </div>
      </div>
      
      <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 18px;">📋</span>
          <span style="font-weight: 600; color: #0c4a6e;">Step-by-Step Instructions:</span>
        </div>
        <ol style="margin: 0; padding-left: 20px; color: #0c4a6e; line-height: 1.6; font-size: 14px;">
          <li>Wait for this page to fully load</li>
          <li>Drag the button below to your bookmarks bar</li>
          <li>Click the bookmarklet to start auto-filling</li>
          <li>Watch as forms are filled automatically</li>
          <li>Submit the form when ready</li>
        </ol>
      </div>
      
      <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 18px;">🔗</span>
          <span style="font-weight: 600; color: #065f46;">Auto-Fill Bookmarklet:</span>
        </div>
        <div style="text-align: center;">
          <a href="${bookmarklet}" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin-bottom: 8px;"
             onclick="setTimeout(() => { this.parentElement.parentElement.parentElement.parentElement.parentElement.remove(); }, 1000);">
            🤖 Auto-Fill Forms
          </a>
          <p style="margin: 8px 0 0 0; color: #065f46; font-size: 12px;">
            Click this button to start auto-filling forms on this page
          </p>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <button id="closeInstructions" style="background: #6b7280; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 500;">Close Instructions</button>
      </div>
    `;
    
    overlay.appendChild(content);
    window.document.body.appendChild(overlay);
    
         // Add event listener to close button
     const closeButton = window.document.getElementById('closeInstructions');
     if (closeButton) {
       closeButton.addEventListener('click', () => {
         window.document.body.removeChild(overlay);
       });
     }
     
     console.log('✅ Instructions overlay created successfully');
     
   } catch (error) {
     console.error('❌ Error creating instructions overlay:', error);
     console.error('❌ This might be due to cross-origin restrictions');
     
     // Fallback: Show alert with bookmarklet
     try {
       window.alert('Cross-origin restrictions detected. Please manually copy and paste this bookmarklet into your browser:\n\n' + bookmarklet);
     } catch (alertError) {
       console.error('❌ Even alert failed:', alertError);
     }
   }
 }
}
