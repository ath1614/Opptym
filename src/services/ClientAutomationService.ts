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
        
        const projectData = ${JSON.stringify(this.projectData)};
        
        // Function to map field to value
        function mapFieldToValue(input) {
          const fieldName = (input.name || input.id || input.placeholder || '').toLowerCase();
          const fieldType = input.type.toLowerCase();
          
          // Email fields
          if (fieldName.includes('email') || fieldType === 'email') {
            return projectData.email;
          }
          
          // Name fields
          if (fieldName.includes('name') || fieldName.includes('fullname') || fieldName.includes('firstname')) {
            return projectData.name;
          }
          
          // Phone fields
          if (fieldName.includes('phone') || fieldName.includes('mobile') || fieldName.includes('contact')) {
            return projectData.phone;
          }
          
          // Company fields
          if (fieldName.includes('company') || fieldName.includes('business') || fieldName.includes('organization')) {
            return projectData.companyName;
          }
          
          // Website/URL fields
          if (fieldName.includes('website') || fieldName.includes('url') || fieldName.includes('site')) {
            return projectData.url;
          }
          
          // Address fields
          if (fieldName.includes('address') || fieldName.includes('street')) {
            return projectData.address || '';
          }
          
          // City fields
          if (fieldName.includes('city')) {
            return projectData.city || '';
          }
          
          // State fields
          if (fieldName.includes('state') || fieldName.includes('province')) {
            return projectData.state || '';
          }
          
          // Zip/Postal code fields
          if (fieldName.includes('zip') || fieldName.includes('postal') || fieldName.includes('pincode')) {
            return projectData.pincode || '';
          }
          
          // Country fields
          if (fieldName.includes('country')) {
            return projectData.country || '';
          }
          
          // Description fields
          if (fieldName.includes('description') || fieldName.includes('about') || fieldName.includes('details') || fieldName.includes('message')) {
            return projectData.description;
          }
          
          // Category fields
          if (fieldName.includes('category') || fieldName.includes('type') || fieldName.includes('industry')) {
            return projectData.companyName;
          }
          
          // Title fields
          if (fieldName.includes('title')) {
            return projectData.companyName;
          }
          
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
            // Wait a bit for any dynamic content to load
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Get all forms on the page
            const forms = document.querySelectorAll('form');
            console.log('Found ' + forms.length + ' forms on the page');
            
            let totalFieldsFilled = 0;
            
            for (let formIndex = 0; formIndex < forms.length; formIndex++) {
              const form = forms[formIndex];
              console.log('Processing form ' + (formIndex + 1) + '/' + forms.length);
              
              // Get all input fields in this form
              const inputs = form.querySelectorAll('input, textarea, select');
              console.log('Form ' + (formIndex + 1) + ' has ' + inputs.length + ' fields');
              
              for (let inputIndex = 0; inputIndex < inputs.length; inputIndex++) {
                const input = inputs[inputIndex];
                
                try {
                  // Skip if field is disabled, readonly, or already has a value
                  if (input.disabled || input.readOnly || input.value) {
                    continue;
                  }
                  
                  // Determine what to fill based on field properties
                  const fieldValue = mapFieldToValue(input);
                  
                  if (fieldValue) {
                    // Fill the field with animation
                    await fillFieldWithAnimation(input, fieldValue);
                    
                    totalFieldsFilled++;
                    console.log('✅ Filled field: ' + (input.name || input.id || input.placeholder) + ' with: ' + fieldValue);
                    
                    // Small delay between fields for visual effect
                    await new Promise(resolve => setTimeout(resolve, 500));
                  }
                } catch (fieldError) {
                  console.log('⚠️ Skipping field ' + (inputIndex + 1) + ': ' + fieldError);
                  continue;
                }
              }
            }
            
            console.log('🎯 Total fields filled: ' + totalFieldsFilled);
            
            // Show success notification
            const notification = document.createElement('div');
            notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); z-index: 10000; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; font-weight: 500;';
            notification.innerHTML = '<div style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 18px;">✅</span><span>Form filled successfully! You can now submit.</span></div>';
            
            document.body.appendChild(notification);
            
            // Remove notification after 5 seconds
            setTimeout(() => {
              if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
              }
            }, 5000);
            
          } catch (error) {
            console.error('Automation error:', error);
            alert('❌ Automation failed: ' + error.message);
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
      // Open the URL in a new tab
      const newWindow = window.open(url, '_blank', 'width=1200,height=800');
      
      if (!newWindow) {
        throw new Error('Popup blocked! Please allow popups for this site.');
      }

      // Create the bookmarklet
      const bookmarklet = this.createBookmarklet();
      
      // Show instructions to the user
      this.showInstructions(newWindow, bookmarklet);

    } catch (error) {
      console.error('Client automation error:', error);
      throw error;
    }
  }

  private showInstructions(window: Window, bookmarklet: string): void {
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
  }
}
