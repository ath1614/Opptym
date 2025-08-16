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

  // Open URL in new tab and start automation
  async startAutomation(url: string): Promise<void> {
    try {
      // Open the URL in a new tab
      const newWindow = window.open(url, '_blank', 'width=1200,height=800');
      
      if (!newWindow) {
        throw new Error('Popup blocked! Please allow popups for this site.');
      }

      // Wait for the page to load
      await this.waitForPageLoad(newWindow);

      // Start filling the form
      await this.fillFormFields(newWindow);

      // Show success message
      this.showSuccessMessage(newWindow);

    } catch (error) {
      console.error('Client automation error:', error);
      throw error;
    }
  }

  private async waitForPageLoad(window: Window): Promise<void> {
    return new Promise((resolve) => {
      const checkLoaded = () => {
        if (window.document.readyState === 'complete') {
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
    });
  }

  private async fillFormFields(window: Window): Promise<void> {
    const doc = window.document;
    
    // Wait a bit for any dynamic content to load
    await this.delay(2000);

    // Get all forms on the page
    const forms = doc.querySelectorAll('form');
    console.log(`Found ${forms.length} forms on the page`);

    let totalFieldsFilled = 0;

    for (let formIndex = 0; formIndex < forms.length; formIndex++) {
      const form = forms[formIndex];
      console.log(`Processing form ${formIndex + 1}/${forms.length}`);

      // Get all input fields in this form
      const inputs = form.querySelectorAll('input, textarea, select');
      console.log(`Form ${formIndex + 1} has ${inputs.length} fields`);

      for (let inputIndex = 0; inputIndex < inputs.length; inputIndex++) {
        const input = inputs[inputIndex] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        
        try {
          // Skip if field is disabled, readonly, or already has a value
          if (input.disabled || (input as HTMLInputElement).readOnly || input.value) {
            continue;
          }

          // Determine what to fill based on field properties
          const fieldValue = this.mapFieldToValue(input);
          
          if (fieldValue) {
            // Fill the field with animation
            await this.fillFieldWithAnimation(input, fieldValue);
            
            totalFieldsFilled++;
            console.log(`✅ Filled field: ${input.name || input.id || (input as HTMLInputElement).placeholder} with: ${fieldValue}`);
            
            // Small delay between fields for visual effect
            await this.delay(500);
          }
        } catch (fieldError) {
          console.log(`⚠️ Skipping field ${inputIndex + 1}: ${fieldError}`);
          continue;
        }
      }
    }

    console.log(`🎯 Total fields filled: ${totalFieldsFilled}`);
  }

  private mapFieldToValue(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string | null {
    const fieldName = (input.name || input.id || (input as HTMLInputElement).placeholder || '').toLowerCase();
    const fieldType = input.type.toLowerCase();
    
    // Email fields
    if (fieldName.includes('email') || fieldType === 'email') {
      return this.projectData.email;
    }
    
    // Name fields
    if (fieldName.includes('name') || fieldName.includes('fullname') || fieldName.includes('firstname')) {
      return this.projectData.name;
    }
    
    // Phone fields
    if (fieldName.includes('phone') || fieldName.includes('mobile') || fieldName.includes('contact')) {
      return this.projectData.phone;
    }
    
    // Company fields
    if (fieldName.includes('company') || fieldName.includes('business') || fieldName.includes('organization')) {
      return this.projectData.companyName;
    }
    
    // Website/URL fields
    if (fieldName.includes('website') || fieldName.includes('url') || fieldName.includes('site')) {
      return this.projectData.url;
    }
    
    // Address fields
    if (fieldName.includes('address') || fieldName.includes('street')) {
      return this.projectData.address || '';
    }
    
    // City fields
    if (fieldName.includes('city')) {
      return this.projectData.city || '';
    }
    
    // State fields
    if (fieldName.includes('state') || fieldName.includes('province')) {
      return this.projectData.state || '';
    }
    
    // Zip/Postal code fields
    if (fieldName.includes('zip') || fieldName.includes('postal') || fieldName.includes('pincode')) {
      return this.projectData.pincode || '';
    }
    
    // Country fields
    if (fieldName.includes('country')) {
      return this.projectData.country || '';
    }
    
    // Description fields
    if (fieldName.includes('description') || fieldName.includes('about') || fieldName.includes('details') || fieldName.includes('message')) {
      return this.projectData.description;
    }
    
    // Category fields
    if (fieldName.includes('category') || fieldName.includes('type') || fieldName.includes('industry')) {
      return this.projectData.companyName;
    }
    
    // Title fields
    if (fieldName.includes('title')) {
      return this.projectData.companyName;
    }
    
    return null;
  }

  private async fillFieldWithAnimation(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string): Promise<void> {
    // Add visual feedback
    input.style.border = '2px solid #10b981';
    input.style.backgroundColor = '#f0fdf4';
    
    // Fill the field character by character for visual effect
    input.focus();
    input.value = '';
    
    for (let i = 0; i < value.length; i++) {
      input.value += value[i];
      await this.delay(50); // 50ms delay between characters
    }
    
    // Trigger events
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Remove visual feedback after a delay
    setTimeout(() => {
      input.style.border = '';
      input.style.backgroundColor = '';
    }, 1000);
  }

  private showSuccessMessage(window: Window): void {
    // Create a success notification
    const notification = window.document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">✅</span>
        <span>Form filled successfully! You can now submit.</span>
      </div>
    `;
    
    window.document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
