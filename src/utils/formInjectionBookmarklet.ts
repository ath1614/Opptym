export interface FormFieldData {
  index: number;
  type: string;
  name: string;
  id: string;
  placeholder: string;
  value: string;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  visible: boolean;
  selector: string;
}

export interface FormData {
  filledFields: any[];
  formState: {
    totalForms: number;
    totalFields: number;
    formHTML: string;
    inputData: FormFieldData[];
    injectionScript: string;
    pageTitle: string;
    pageUrl: string;
  };
  injectionScript: string;
}

export function createFormInjectionBookmarklet(formData: FormData): string {
  const script = `
    (function() {
      console.log('🚀 Starting form data injection...');
      
      const formData = ${JSON.stringify(formData.formState.inputData)};
      let filledCount = 0;
      
      formData.forEach(field => {
        try {
          // Try multiple selectors to find the field
          let element = null;
          
          // Try ID first
          if (field.id) {
            element = document.getElementById(field.id);
          }
          
          // Try name attribute
          if (!element && field.name) {
            element = document.querySelector(\`[name="\${field.name}"]\`);
          }
          
          // Try placeholder
          if (!element && field.placeholder) {
            element = document.querySelector(\`[placeholder="\${field.placeholder}"]\`);
          }
          
          // Try the original selector
          if (!element && field.selector) {
            element = document.querySelector(field.selector);
          }
          
          // Try type-based selectors
          if (!element) {
            const typeSelectors = [
              \`input[type="\${field.type}"]\`,
              \`textarea\`,
              \`select\`
            ];
            
            for (const selector of typeSelectors) {
              const elements = document.querySelectorAll(selector);
              for (const el of elements) {
                if (!el.value && !el.disabled && !el.readOnly) {
                  element = el;
                  break;
                }
              }
              if (element) break;
            }
          }
          
          // Fill the field if found and has a value
          if (element && field.value && !field.disabled && !field.readonly) {
            // Clear the field first
            element.value = '';
            
            // Fill the field
            element.value = field.value;
            
            // Trigger events
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.dispatchEvent(new Event('blur', { bubbles: true }));
            
            filledCount++;
            console.log('✅ Filled field:', field.name || field.id || field.placeholder, 'with:', field.value);
          }
        } catch (e) {
          console.log('⚠️ Could not fill field:', field.name || field.id, e);
        }
      });
      
      console.log(\`🎯 Form injection completed: \${filledCount} fields filled\`);
      
      // Show success message
      const message = document.createElement('div');
      message.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      \`;
      message.textContent = \`✅ \${filledCount} fields filled successfully!\`;
      document.body.appendChild(message);
      
      // Remove message after 3 seconds
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 3000);
      
    })();
  `;
  
  return `javascript:${encodeURIComponent(script)}`;
}

export function createManualFormFiller(projectData: any): string {
  const script = `
    (function() {
      console.log('🚀 Starting manual form filling...');
      
      const projectData = ${JSON.stringify(projectData)};
      
      // Function to map field to value
      function mapFieldToValue(input) {
        const fieldName = (input.name || input.id || input.placeholder || '').toLowerCase();
        const fieldType = input.type.toLowerCase();
        
        // Email fields
        if (fieldType === 'email' || fieldName.includes('email')) {
          return projectData.email;
        }
        
        // Phone fields
        if (fieldType === 'tel' || fieldName.includes('phone') || fieldName.includes('mobile')) {
          return projectData.phone;
        }
        
        // Name fields
        if (fieldName.includes('name') && !fieldName.includes('company')) {
          return projectData.name;
        }
        
        // Company fields
        if (fieldName.includes('company') || fieldName.includes('business')) {
          return projectData.companyName;
        }
        
        // Website fields
        if (fieldName.includes('website') || fieldName.includes('url')) {
          return projectData.url;
        }
        
        // Description fields
        if (fieldName.includes('description') || fieldName.includes('about')) {
          return projectData.description;
        }
        
        return null;
      }
      
      // Find and fill all input fields
      const inputs = document.querySelectorAll('input, textarea, select');
      let filledCount = 0;
      
      inputs.forEach(input => {
        if (!input.value && !input.disabled && !input.readOnly) {
          const value = mapFieldToValue(input);
          if (value) {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
            console.log('✅ Filled:', input.name || input.id, 'with:', value);
          }
        }
      });
      
      console.log(\`🎯 Manual filling completed: \${filledCount} fields filled\`);
      
      // Show success message
      const message = document.createElement('div');
      message.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      \`;
      message.textContent = \`✅ \${filledCount} fields filled with project data!\`;
      document.body.appendChild(message);
      
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 3000);
      
    })();
  `;
  
  return `javascript:${encodeURIComponent(script)}`;
}
