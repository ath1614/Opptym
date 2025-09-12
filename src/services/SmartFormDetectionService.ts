/**
 * Smart Form Detection Service
 * Automatically detects and fills multiple forms on directory submission pages
 */

export interface FormField {
  name: string;
  value: string;
  type: string;
  selector: string;
  required: boolean;
  filled: boolean;
  error?: string;
}

export interface DetectedForm {
  id: string;
  element: HTMLFormElement;
  fields: FormField[];
  isDirectoryForm: boolean;
  confidence: number;
  url: string;
  title: string;
}

export interface FormFillingResult {
  formId: string;
  success: boolean;
  fieldsFilled: number;
  totalFields: number;
  errors: string[];
  timeTaken: number;
}

export class SmartFormDetectionService {
  private projectData: any;
  private results: FormFillingResult[] = [];

  constructor(projectData: any) {
    this.projectData = projectData;
  }

  /**
   * Main method to detect and fill all forms on the page
   */
  async detectAndFillAllForms(): Promise<FormFillingResult[]> {
    console.log('🔍 Starting smart form detection...');
    
    // Detect all potential directory submission forms
    const detectedForms = this.detectDirectoryForms();
    console.log(`📋 Found ${detectedForms.length} potential directory forms`);

    // Fill each form
    for (const form of detectedForms) {
      const result = await this.fillForm(form);
      this.results.push(result);
    }

    // Show results summary
    this.showResultsSummary();
    
    return this.results;
  }

  /**
   * Detect directory submission forms on the page
   */
  private detectDirectoryForms(): DetectedForm[] {
    const forms = document.querySelectorAll('form');
    const detectedForms: DetectedForm[] = [];

    Array.from(forms).forEach((form, index) => {
      const confidence = this.calculateFormConfidence(form);
      
      if (confidence > 0.3) { // Only process forms with >30% confidence
        const formData = this.extractFormFields(form);
        
        detectedForms.push({
          id: `form_${index}`,
          element: form,
          fields: formData,
          isDirectoryForm: confidence > 0.6,
          confidence: confidence,
          url: window.location.href,
          title: this.getFormTitle(form)
        });
      }
    });

    // Sort by confidence (highest first)
    return detectedForms.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate confidence score for directory form detection
   */
  private calculateFormConfidence(form: HTMLFormElement): number {
    let confidence = 0;
    const formText = form.innerHTML.toLowerCase();
    const formAction = (form.action || '').toLowerCase();

    // Directory submission keywords
    const directoryKeywords = [
      'submit', 'directory', 'listing', 'business', 'website', 'url',
      'company', 'address', 'phone', 'email', 'description', 'category',
      'add listing', 'submit listing', 'business listing', 'directory submission'
    ];

    // Check for directory-related keywords
    directoryKeywords.forEach(keyword => {
      if (formText.includes(keyword)) {
        confidence += 0.1;
      }
    });

    // Check form action URL
    if (formAction.includes('submit') || formAction.includes('add') || formAction.includes('listing')) {
      confidence += 0.2;
    }

    // Check for common directory form fields
    const commonFields = ['website', 'url', 'business', 'company', 'description'];
    commonFields.forEach(field => {
      if (form.querySelector(`[name*="${field}"]`) || form.querySelector(`[id*="${field}"]`)) {
        confidence += 0.15;
      }
    });

    // Check for required fields (indicates important form)
    const requiredFields = form.querySelectorAll('[required]');
    if (requiredFields.length > 2) {
      confidence += 0.1;
    }

    // Check for multiple input types (indicates complex form)
    const inputTypes = new Set();
    form.querySelectorAll('input[type]').forEach(input => {
      inputTypes.add(input.type);
    });
    if (inputTypes.size > 3) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0); // Cap at 100%
  }

  /**
   * Extract form fields and map them to project data
   */
  private extractFormFields(form: HTMLFormElement): FormField[] {
    const fields: FormField[] = [];
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach((input: any) => {
      if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') {
        return; // Skip hidden and action inputs
      }

      const field: FormField = {
        name: input.name || input.id || '',
        value: this.mapFieldToValue(input),
        type: input.type || input.tagName.toLowerCase(),
        selector: this.generateSelector(input),
        required: input.required || false,
        filled: false,
        error: undefined
      };

      if (field.value) {
        fields.push(field);
      }
    });

    return fields;
  }

  /**
   * Map form field to project data value
   */
  private mapFieldToValue(input: any): string {
    const name = (input.name || input.id || '').toLowerCase();
    const placeholder = (input.placeholder || '').toLowerCase();
    const label = this.getFieldLabel(input).toLowerCase();

    // Website/URL fields
    if (name.includes('website') || name.includes('url') || name.includes('site') || 
        placeholder.includes('website') || placeholder.includes('url') ||
        label.includes('website') || label.includes('url')) {
      return this.projectData.url || '';
    }

    // Business/Company name fields
    if (name.includes('business') || name.includes('company') || name.includes('name') ||
        placeholder.includes('business') || placeholder.includes('company') ||
        label.includes('business') || label.includes('company')) {
      return this.projectData.companyName || this.projectData.name || '';
    }

    // Email fields
    if (name.includes('email') || input.type === 'email' ||
        placeholder.includes('email') || label.includes('email')) {
      return this.projectData.email || '';
    }

    // Phone fields
    if (name.includes('phone') || name.includes('tel') || input.type === 'tel' ||
        placeholder.includes('phone') || label.includes('phone')) {
      return this.projectData.phone || '';
    }

    // Description fields
    if (name.includes('description') || name.includes('desc') || name.includes('about') ||
        placeholder.includes('description') || label.includes('description')) {
      return this.projectData.description || '';
    }

    // Address fields
    if (name.includes('address') || name.includes('street') ||
        placeholder.includes('address') || label.includes('address')) {
      return this.projectData.address || '';
    }

    // City fields
    if (name.includes('city') || placeholder.includes('city') || label.includes('city')) {
      return this.projectData.city || '';
    }

    // State fields
    if (name.includes('state') || placeholder.includes('state') || label.includes('state')) {
      return this.projectData.state || '';
    }

    // Country fields
    if (name.includes('country') || placeholder.includes('country') || label.includes('country')) {
      return this.projectData.country || '';
    }

    // ZIP/Postal code fields
    if (name.includes('zip') || name.includes('postal') || name.includes('pincode') ||
        placeholder.includes('zip') || label.includes('zip')) {
      return this.projectData.pincode || this.projectData.zip || '';
    }

    return '';
  }

  /**
   * Get field label text
   */
  private getFieldLabel(input: any): string {
    // Try to find associated label
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return label.textContent || '';
    }

    // Try to find parent label
    const parentLabel = input.closest('label');
    if (parentLabel) return parentLabel.textContent || '';

    // Try to find nearby text
    const parent = input.parentElement;
    if (parent) {
      const textNodes = Array.from(parent.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
      if (textNodes.length > 0) {
        return textNodes[0].textContent || '';
      }
    }

    return '';
  }

  /**
   * Generate CSS selector for field
   */
  private generateSelector(input: any): string {
    if (input.id) return `#${input.id}`;
    if (input.name) return `[name="${input.name}"]`;
    if (input.className) return `.${input.className.split(' ')[0]}`;
    return input.tagName.toLowerCase();
  }

  /**
   * Get form title/description
   */
  private getFormTitle(form: HTMLFormElement): string {
    // Try to find form title
    const title = form.querySelector('h1, h2, h3, .title, .form-title');
    if (title) return title.textContent || '';

    // Try to find legend
    const legend = form.querySelector('legend');
    if (legend) return legend.textContent || '';

    // Try to find nearby heading
    const heading = form.previousElementSibling;
    if (heading && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(heading.tagName)) {
      return heading.textContent || '';
    }

    return 'Untitled Form';
  }

  /**
   * Fill a single form
   */
  private async fillForm(detectedForm: DetectedForm): Promise<FormFillingResult> {
    const startTime = Date.now();
    const result: FormFillingResult = {
      formId: detectedForm.id,
      success: false,
      fieldsFilled: 0,
      totalFields: detectedForm.fields.length,
      errors: [],
      timeTaken: 0
    };

    try {
      console.log(`📝 Filling form: ${detectedForm.title} (${detectedForm.confidence.toFixed(2)} confidence)`);

      for (const field of detectedForm.fields) {
        try {
          const element = detectedForm.element.querySelector(field.selector) as any;
          if (element && field.value) {
            // Clear existing value
            element.value = '';
            
            // Set new value
            element.value = field.value;
            
            // Trigger events
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.dispatchEvent(new Event('blur', { bubbles: true }));
            
            field.filled = true;
            result.fieldsFilled++;
            
            console.log(`✅ Filled ${field.name}: ${field.value}`);
          }
        } catch (error) {
          const errorMsg = `Failed to fill ${field.name}: ${error}`;
          result.errors.push(errorMsg);
          console.warn(`⚠️ ${errorMsg}`);
        }
      }

      result.success = result.fieldsFilled > 0;
      result.timeTaken = Date.now() - startTime;

      console.log(`✅ Form filled: ${result.fieldsFilled}/${result.totalFields} fields (${result.timeTaken}ms)`);

    } catch (error) {
      result.errors.push(`Form filling failed: ${error}`);
      result.timeTaken = Date.now() - startTime;
      console.error(`❌ Form filling failed: ${error}`);
    }

    return result;
  }

  /**
   * Show results summary to user
   */
  private showResultsSummary(): void {
    const totalForms = this.results.length;
    const successfulForms = this.results.filter(r => r.success).length;
    const totalFieldsFilled = this.results.reduce((sum, r) => sum + r.fieldsFilled, 0);
    const totalFields = this.results.reduce((sum, r) => sum + r.totalFields, 0);

    // Create results popup
    const popup = document.createElement('div');
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 500px;
      text-align: center;
    `;

    popup.innerHTML = `
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">
        🎯 Smart Form Detection Complete!
      </div>
      <div style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        <div>📋 Forms Detected: <strong>${totalForms}</strong></div>
        <div>✅ Forms Filled: <strong>${successfulForms}</strong></div>
        <div>📝 Fields Filled: <strong>${totalFieldsFilled}/${totalFields}</strong></div>
        <div>⏱️ Total Time: <strong>${this.results.reduce((sum, r) => sum + r.timeTaken, 0)}ms</strong></div>
      </div>
      <div style="font-size: 14px; opacity: 0.9;">
        ${successfulForms === totalForms ? '🎉 All forms filled successfully!' : '⚠️ Some forms had issues - check console for details'}
      </div>
      <button onclick="this.parentElement.remove()" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 10px 20px;
        border-radius: 10px;
        margin-top: 20px;
        cursor: pointer;
        font-size: 14px;
      ">Close</button>
    `;

    document.body.appendChild(popup);

    // Auto-close after 8 seconds
    setTimeout(() => {
      if (popup.parentElement) {
        popup.parentElement.removeChild(popup);
      }
    }, 8000);
  }
}

export default SmartFormDetectionService;
