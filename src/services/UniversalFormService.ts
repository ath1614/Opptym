// Browser API declarations
declare global {
  interface Window {
    chrome?: {
      bookmarks?: {
        create: (bookmark: { title: string; url: string }) => Promise<{ id: string }>;
        remove: (id: string) => Promise<void>;
        search: (query: { title: string }) => Promise<{ id: string }[]>;
      };
      permissions?: {
        contains: (permissions: { permissions: string[] }) => Promise<boolean>;
      };
    };
    browser?: {
      bookmarks?: {
        create: (bookmark: { title: string; url: string }) => Promise<{ id: string }>;
        remove: (id: string) => Promise<void>;
        search: (query: { title: string }) => Promise<{ id: string }[]>;
      };
    };
  }
}

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

export interface BookmarkletResult {
  success: boolean;
  bookmarkletId?: string;
  bookmarkletCode: string;
  fallbackInstructions: string;
  error?: string;
}

import SmartFormDetectionService from './SmartFormDetectionService';

export class UniversalFormService {
  private projectData: ProjectData;
  private smartFormService: SmartFormDetectionService;

  constructor(projectData: ProjectData) {
    this.projectData = projectData;
    this.smartFormService = new SmartFormDetectionService(projectData);
  }

  // Create universal form filling bookmarklet with server-side token validation
  async createUniversalBookmarklet(): Promise<string> {
    try {
      // Get authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login to Opptym first.');
      }

      // Get current project ID from localStorage or context
      const projectId = localStorage.getItem('selectedProject');
      if (!projectId) {
        throw new Error('No project selected. Please select a project first.');
      }

      // Generate bookmarklet token from server
      const response = await fetch('https://api.opptym.com/api/bookmarklet/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId: projectId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to generate bookmarklet token');
      }

      const { token: bookmarkletToken, expiresAt, maxUsage, usageCount, rateLimitSeconds } = result.data;

      // Create the bookmarklet script with embedded project data
      const script = `
        (function() {
          // Embedded project data (no server validation needed)
          const PROJECT_DATA = ${JSON.stringify(this.projectData)};
          const BOOKMARKLET_TOKEN = '${bookmarkletToken}';
          const API_BASE_URL = 'https://api.opptym.com';
          
          // Try server validation, but fallback to embedded data
          const validateToken = async () => {
            try {
              // Show loading indicator
              const loadingDiv = document.createElement('div');
              loadingDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #3b82f6; color: white; padding: 12px 20px; border-radius: 8px; font-family: Arial, sans-serif; font-size: 14px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
              loadingDiv.textContent = '🔐 Validating bookmarklet...';
              document.body.appendChild(loadingDiv);
              
              // Validate token with server
              const response = await fetch(API_BASE_URL + '/api/bookmarklet/validate', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  token: BOOKMARKLET_TOKEN
                })
              });
              
              const result = await response.json();
              
              // Remove loading indicator
              if (loadingDiv.parentNode) {
                loadingDiv.parentNode.removeChild(loadingDiv);
              }
              
              if (!result.success) {
                // Note: showPopup is not available in this context, using console.error instead
                console.error('❌ Bookmarklet validation failed:', result.message || 'Unknown error');
                return null;
              }
              
              return result.data;
            } catch (error) {
              console.error('Token validation failed:', error);
              
              // If server validation fails, use embedded project data
              console.log('⚠️ Using embedded project data as fallback');
              return {
                projectData: PROJECT_DATA,
                usageCount: 0,
                maxUsage: 10,
                remainingUses: 10
              };
            }
          };
          
          // Main form filling function
          const fillForms = async () => {
            // Get project data (from server or embedded fallback)
            const validationResult = await validateToken();
            
            const projectData = validationResult.projectData;
            const usageInfo = {
              current: validationResult.usageCount,
              max: validationResult.maxUsage,
              remaining: validationResult.remainingUses
            };
            
            // Show usage info
            const usageDiv = document.createElement('div');
            usageDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 12px 20px; border-radius: 8px; font-family: Arial, sans-serif; font-size: 14px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
            usageDiv.innerHTML = '✅ Token validated! Uses: ' + usageInfo.current + '/' + usageInfo.max + ' (' + usageInfo.remaining + ' remaining)';
            document.body.appendChild(usageDiv);
            
            // Remove usage info after 3 seconds
            setTimeout(() => {
              if (usageDiv.parentNode) {
                usageDiv.parentNode.removeChild(usageDiv);
              }
            }, 3000);
            
            // Create enhanced progress popup
            const progressPopup = document.createElement('div');
            progressPopup.style.cssText = `
              position: fixed; 
              top: 50%; 
              left: 50%; 
              transform: translate(-50%, -50%); 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 30px; 
              border-radius: 16px; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              font-size: 16px; 
              z-index: 10000; 
              box-shadow: 0 20px 40px rgba(0,0,0,0.3); 
              min-width: 350px;
              text-align: center;
              backdrop-filter: blur(10px);
            `;
            
            // Create progress content
            const progressContent = document.createElement('div');
            progressContent.innerHTML = `
              <div style="margin-bottom: 20px;">
                <div style="font-size: 24px; margin-bottom: 10px;">🤖</div>
                <div style="font-weight: 600; margin-bottom: 5px;">OPPTYM Auto-Fill</div>
                <div style="font-size: 14px; opacity: 0.9;">Filling forms automatically...</div>
              </div>
              <div id="progress-stats" style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span>Fields Found:</span>
                  <span id="total-fields">0</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span>Fields Filled:</span>
                  <span id="filled-fields">0</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                  <span>Success Rate:</span>
                  <span id="success-rate">0%</span>
                </div>
                <div style="background: rgba(255,255,255,0.2); border-radius: 10px; height: 8px; overflow: hidden;">
                  <div id="progress-bar" style="background: #10b981; height: 100%; width: 0%; transition: width 0.3s ease;"></div>
                </div>
              </div>
              <div id="status-message" style="font-size: 14px; opacity: 0.9;">Scanning page for forms...</div>
            `;
            
            progressPopup.appendChild(progressContent);
            document.body.appendChild(progressPopup);
            
            // Add overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
              position: fixed; 
              top: 0; 
              left: 0; 
              width: 100%; 
              height: 100%; 
              background: rgba(0,0,0,0.5); 
              z-index: 9999;
            `;
            document.body.appendChild(overlay);
            
            let filledCount = 0;
            let errorCount = 0;
            let totalFields = 0;
            
            // Enhanced field mapping with better detection
            const fieldMappings = [
              { patterns: ['name', 'fullname', 'full_name', 'firstname', 'first_name'], value: projectData.name },
              { patterns: ['email', 'e-mail', 'mail'], value: projectData.email },
              { patterns: ['company', 'companyname', 'company_name', 'business', 'organization'], value: projectData.companyName },
              { patterns: ['phone', 'telephone', 'mobile', 'cell', 'contact'], value: projectData.phone },
              { patterns: ['website', 'url', 'site', 'web'], value: projectData.url },
              { patterns: ['description', 'message', 'comment', 'details', 'about'], value: projectData.description },
              { patterns: ['address', 'street', 'location'], value: projectData.address || '' },
              { patterns: ['city', 'town'], value: projectData.city || '' },
              { patterns: ['state', 'province', 'region'], value: projectData.state || '' },
              { patterns: ['country', 'nation'], value: projectData.country || '' },
              { patterns: ['zip', 'postal', 'pincode'], value: projectData.pincode || '' }
            ];
          
          // Helper function to update progress
          const updateProgress = () => {
            const totalFieldsEl = document.getElementById('total-fields');
            const filledFieldsEl = document.getElementById('filled-fields');
            const successRateEl = document.getElementById('success-rate');
            const progressBarEl = document.getElementById('progress-bar');
            const statusMessageEl = document.getElementById('status-message');
            
            if (totalFieldsEl) totalFieldsEl.textContent = totalFields.toString();
            if (filledFieldsEl) filledFieldsEl.textContent = filledCount.toString();
            
            const successRate = totalFields > 0 ? Math.round((filledCount / totalFields) * 100) : 0;
            if (successRateEl) successRateEl.textContent = successRate + '%';
            if (progressBarEl) progressBarEl.style.width = successRate + '%';
            
            // Update status message
            if (statusMessageEl) {
              if (filledCount === 0 && totalFields > 0) {
                statusMessageEl.textContent = 'No matching fields found...';
              } else if (filledCount > 0) {
                statusMessageEl.textContent = `Successfully filled ${filledCount} out of ${totalFields} fields!`;
              } else {
                statusMessageEl.textContent = 'Scanning page for forms...';
              }
            }
          };
          
          // Smart form detection and filling
          const smartFormDetection = async () => {
            try {
              // Import and use SmartFormDetectionService
              const SmartFormDetectionService = (() => {
                // Inline SmartFormDetectionService for bookmarklet
                class SmartFormDetectionService {
                  constructor(projectData) {
                    this.projectData = projectData;
                  }

                  async detectAndFillAllForms() {
                    const detectedForms = this.detectDirectoryForms();
                    const results = [];

                    for (const form of detectedForms) {
                      const result = await this.fillForm(form);
                      results.push(result);
                    }

                    return results;
                  }

                  detectDirectoryForms() {
                    const forms = document.querySelectorAll('form');
                    const detectedForms = [];

                    Array.from(forms).forEach((form, index) => {
                      const confidence = this.calculateFormConfidence(form);
                      
                      if (confidence > 0.3) {
                        const formData = this.extractFormFields(form);
                        
                        detectedForms.push({
                          id: \`form_\${index}\`,
                          element: form,
                          fields: formData,
                          isDirectoryForm: confidence > 0.6,
                          confidence: confidence,
                          url: window.location.href,
                          title: this.getFormTitle(form)
                        });
                      }
                    });

                    return detectedForms.sort((a, b) => b.confidence - a.confidence);
                  }

                  calculateFormConfidence(form) {
                    let confidence = 0;
                    const formText = form.innerHTML.toLowerCase();

                    const directoryKeywords = [
                      'submit', 'directory', 'listing', 'business', 'website', 'url',
                      'company', 'address', 'phone', 'email', 'description', 'category'
                    ];

                    directoryKeywords.forEach(keyword => {
                      if (formText.includes(keyword)) confidence += 0.1;
                    });

                    const commonFields = ['website', 'url', 'business', 'company', 'description'];
                    commonFields.forEach(field => {
                      if (form.querySelector(\`[name*="\${field}"]\`) || form.querySelector(\`[id*="\${field}"]\`)) {
                        confidence += 0.15;
                      }
                    });

                    return Math.min(confidence, 1.0);
                  }

                  extractFormFields(form) {
                    const fields = [];
                    const inputs = form.querySelectorAll('input, textarea, select');

                    inputs.forEach((input) => {
                      if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') return;

                      const field = {
                        name: input.name || input.id || '',
                        value: this.mapFieldToValue(input),
                        type: input.type || input.tagName.toLowerCase(),
                        selector: this.generateSelector(input),
                        required: input.required || false,
                        filled: false
                      };

                      if (field.value) {
                        fields.push(field);
                      }
                    });

                    return fields;
                  }

                  mapFieldToValue(input) {
                    const name = (input.name || input.id || '').toLowerCase();
                    const placeholder = (input.placeholder || '').toLowerCase();

                    if (name.includes('website') || name.includes('url') || placeholder.includes('website')) {
                      return this.projectData.url || '';
                    }
                    if (name.includes('business') || name.includes('company') || name.includes('name')) {
                      return this.projectData.companyName || this.projectData.name || '';
                    }
                    if (name.includes('email') || input.type === 'email') {
                      return this.projectData.email || '';
                    }
                    if (name.includes('phone') || input.type === 'tel') {
                      return this.projectData.phone || '';
                    }
                    if (name.includes('description') || name.includes('about')) {
                      return this.projectData.description || '';
                    }
                    if (name.includes('address')) {
                      return this.projectData.address || '';
                    }
                    if (name.includes('city')) {
                      return this.projectData.city || '';
                    }
                    if (name.includes('state')) {
                      return this.projectData.state || '';
                    }
                    if (name.includes('country')) {
                      return this.projectData.country || '';
                    }
                    if (name.includes('zip') || name.includes('postal')) {
                      return this.projectData.pincode || '';
                    }

                    return '';
                  }

                  generateSelector(input) {
                    if (input.id) return \`#\${input.id}\`;
                    if (input.name) return \`[name="\${input.name}"]\`;
                    return input.tagName.toLowerCase();
                  }

                  getFormTitle(form) {
                    const title = form.querySelector('h1, h2, h3, .title, .form-title');
                    if (title) return title.textContent || '';
                    return 'Untitled Form';
                  }

                  async fillForm(detectedForm) {
                    const result = {
                      formId: detectedForm.id,
                      success: false,
                      fieldsFilled: 0,
                      totalFields: detectedForm.fields.length,
                      errors: [],
                      timeTaken: 0
                    };

                    const startTime = Date.now();

                    for (const field of detectedForm.fields) {
                      try {
                        const element = detectedForm.element.querySelector(field.selector);
                        if (element && field.value) {
                          element.value = field.value;
                          element.dispatchEvent(new Event('input', { bubbles: true }));
                          element.dispatchEvent(new Event('change', { bubbles: true }));
                          
                          // Visual feedback
                          element.style.transition = 'all 0.3s ease';
                          element.style.backgroundColor = '#d1fae5';
                          element.style.borderColor = '#10b981';
                          
                          setTimeout(() => {
                            element.style.backgroundColor = '';
                            element.style.borderColor = '';
                          }, 1000);
                          
                          field.filled = true;
                          result.fieldsFilled++;
                        }
                      } catch (error) {
                        result.errors.push(\`Failed to fill \${field.name}: \${error}\`);
                      }
                    }

                    result.success = result.fieldsFilled > 0;
                    result.timeTaken = Date.now() - startTime;

                    return result;
                  }
                }

                return SmartFormDetectionService;
              })();

              // Use smart form detection
              const smartService = new SmartFormDetectionService(projectData);
              const results = await smartService.detectAndFillAllForms();

              // Update counters
              totalFields = results.reduce((sum, r) => sum + r.totalFields, 0);
              filledCount = results.reduce((sum, r) => sum + r.fieldsFilled, 0);
              errorCount = results.reduce((sum, r) => sum + r.errors.length, 0);

              updateProgress();

              console.log('🎯 Smart form detection completed:', results);

            } catch (error) {
              console.error('❌ Smart form detection failed:', error);
              // Fallback to basic form filling
              const processInputFields = () => {
                const inputs = document.querySelectorAll('input, textarea, select');
                totalFields = 0;
                
                inputs.forEach((input) => {
                  if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') return;
                  const fieldValue = input.value || '';
                  if (!fieldValue.trim()) {
                    totalFields++;
                  }
                });
                
                updateProgress();
                
                inputs.forEach((input, index) => {
                  try {
                    if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') return;
                    
                    const fieldName = (input.name || input.id || input.placeholder || '').toLowerCase();
                    const fieldValue = input.value || '';
                    
                    if (fieldValue.trim()) return;
                    
                    const mapping = fieldMappings.find(m => 
                      m.patterns.some(pattern => fieldName.includes(pattern))
                    );
                    
                    if (mapping && mapping.value) {
                      setTimeout(() => {
                        input.value = mapping.value;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                        
                        input.style.transition = 'all 0.3s ease';
                        input.style.backgroundColor = '#d1fae5';
                        input.style.borderColor = '#10b981';
                        
                        setTimeout(() => {
                          input.style.backgroundColor = '';
                          input.style.borderColor = '';
                        }, 1000);
                        
                        filledCount++;
                        updateProgress();
                      }, index * 100);
                    }
                  } catch (e) {
                    errorCount++;
                  }
                });
              };
              
              processInputFields();
            }
          };

          // Execute smart form detection
          smartFormDetection();
          
          // Show completion message and cleanup
          setTimeout(() => {
            const statusMessageEl = document.getElementById('status-message');
            if (statusMessageEl) {
              if (filledCount > 0) {
                statusMessageEl.innerHTML = `
                  <div style="color: #10b981; font-weight: 600; margin-bottom: 10px;">
                    ✅ Success! ${filledCount} fields filled
                  </div>
                  <div style="font-size: 12px; opacity: 0.8;">
                    You can now submit the form manually
                  </div>
                `;
              } else {
                statusMessageEl.innerHTML = `
                  <div style="color: #f59e0b; font-weight: 600; margin-bottom: 10px;">
                    ⚠️ No fields could be filled
                  </div>
                  <div style="font-size: 12px; opacity: 0.8;">
                    Try filling the form manually
                  </div>
                `;
              }
            }
            
            // Add close button
            const closeButton = document.createElement('button');
            closeButton.innerHTML = '✕ Close';
            closeButton.style.cssText = `
              background: rgba(255,255,255,0.2); 
              border: none; 
              color: white; 
              padding: 8px 16px; 
              border-radius: 8px; 
              cursor: pointer; 
              font-size: 14px; 
              margin-top: 15px;
              transition: background 0.3s ease;
            `;
            closeButton.onmouseover = () => closeButton.style.background = 'rgba(255,255,255,0.3)';
            closeButton.onmouseout = () => closeButton.style.background = 'rgba(255,255,255,0.2)';
            closeButton.onclick = () => {
              if (progressPopup.parentNode) progressPopup.parentNode.removeChild(progressPopup);
              if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            };
            
            progressPopup.appendChild(closeButton);
            
            // Auto-close after 5 seconds
            setTimeout(() => {
              if (progressPopup.parentNode) progressPopup.parentNode.removeChild(progressPopup);
              if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, 5000);
          }, 2000);
          
          console.log('🎯 Form filling completed: ' + filledCount + ' fields filled, ' + errorCount + ' errors');
          
          // Auto-delete this bookmarklet after 30 minutes
          setTimeout(() => {
            try {
              console.log('🕐 Auto-deletion timer triggered (30 minutes)');
              
              // Try to remove from Chrome bookmarks bar
              if (typeof window.chrome !== 'undefined' && window.chrome?.bookmarks) {
                window.chrome.bookmarks.search({ title: 'OPPTYM Auto-Fill' }).then(bookmarks => {
                  bookmarks.forEach(bookmark => {
                    window.chrome.bookmarks.remove(bookmark.id);
                    console.log('🗑️ Removed bookmark from Chrome: ' + bookmark.id);
                  });
                }).catch(e => console.log('Chrome bookmark removal failed: ' + e));
              }
              
              // Try to remove from Firefox bookmarks bar
              if (typeof window.browser !== 'undefined' && window.browser?.bookmarks) {
                window.browser.bookmarks.search({ title: 'OPPTYM Auto-Fill' }).then(bookmarks => {
                  bookmarks.forEach(bookmark => {
                    window.browser.bookmarks.remove(bookmark.id);
                    console.log('🗑️ Removed bookmark from Firefox: ' + bookmark.id);
                  });
                }).catch(e => console.log('Firefox bookmark removal failed: ' + e));
              }
              
              // Also try to remove from DOM if present
              const bookmarkletElements = document.querySelectorAll('a[href*="OPPTYM Auto-Fill"]');
              bookmarkletElements.forEach(element => {
                element.remove();
                console.log('🗑️ Removed bookmarklet from DOM');
              });
              
              // Show notification that bookmarklet was auto-deleted
              const notification = document.createElement('div');
              notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #f59e0b; color: white; padding: 12px 20px; border-radius: 8px; font-family: Arial, sans-serif; font-size: 14px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
              notification.textContent = '🗑️ OPPTYM bookmarklet auto-deleted (30min cleanup)';
              document.body.appendChild(notification);
              
              setTimeout(() => {
                if (notification.parentNode) {
                  notification.parentNode.removeChild(notification);
                }
              }, 5000);
              
                        console.log('✅ Auto-deletion completed successfully');
          
            } catch (e) {
              console.log('❌ Auto-deletion failed: ' + e);
            }
          }, 30 * 60 * 1000); // 30 minutes
          
        };
        
        // Execute the form filling
        fillForms();
        
      })();
    `;
    
    return `javascript:${encodeURIComponent(script)}`;
    
    } catch (error) {
      console.error('❌ Error creating bookmarklet:', error);
      throw error;
    }
  }

  // Generate unique token for bookmarklet
  private generateUniqueToken(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const userId = localStorage.getItem('userId') || 'anonymous';
    return `${userId}_${timestamp}_${random}`;
  }

  // Simple, automatic bookmarklet installation
  async installBookmarkletAutomatically(): Promise<BookmarkletResult> {
    const bookmarkletCode = await this.createUniversalBookmarklet();
    
    try {
      // Create a simple, automatic one-click bookmarklet
      const success = await this.createSimpleOneClickBookmarklet(bookmarkletCode);
      
      if (success) {
        return {
          success: true,
          bookmarkletCode: bookmarkletCode,
          fallbackInstructions: '✅ Bookmarklet ready! Click the green button to use immediately, or drag it to your bookmarks bar.'
        };
      }
      
      // Fallback: Simple manual instructions
      return {
        success: false,
        bookmarkletCode: bookmarkletCode,
        fallbackInstructions: '📋 Quick Setup:\n1. Right-click the green button\n2. Select "Add to bookmarks"\n3. Done! Use it on any directory site.'
      };
      
    } catch (error: unknown) {
      console.error('Error installing bookmarklet:', error);
      return {
        success: false,
        bookmarkletCode: bookmarkletCode,
        fallbackInstructions: '❌ Installation failed. Please try manual installation.',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Try to create bookmark using keyboard shortcut simulation
  private async createBookmarkWithKeyboard(bookmarkletCode: string): Promise<boolean> {
    try {
      // Create a temporary page with the bookmarklet code
      const tempPage = document.createElement('div');
      tempPage.style.cssText = `
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
        font-family: Arial, sans-serif;
      `;
      
      const content = document.createElement('div');
      content.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 30px;
        text-align: center;
        max-width: 500px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      `;
      
      content.innerHTML = `
        <h2 style="margin: 0 0 20px 0; color: #1f2937;">🔗 Quick Bookmark Setup</h2>
        <p style="margin: 0 0 20px 0; color: #6b7280; line-height: 1.6;">
          To install the bookmarklet automatically:
        </p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left;">
          <div style="margin-bottom: 10px;"><strong>Step 1:</strong> Press <kbd style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Ctrl+D</kbd> (or <kbd style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Cmd+D</kbd> on Mac)</div>
          <div style="margin-bottom: 10px;"><strong>Step 2:</strong> In the bookmark dialog, replace the URL with:</div>
          <textarea readonly style="width: 100%; height: 60px; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; font-family: monospace; font-size: 11px; resize: none;">${bookmarkletCode}</textarea>
          <div style="margin-top: 10px;"><strong>Step 3:</strong> Click "Save" or "Add"</div>
        </div>
        <button id="closeBookmarkSetup" style="
          background: #10b981;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        ">Got it!</button>
      `;
      
      tempPage.appendChild(content);
      document.body.appendChild(tempPage);
      
      // Close button functionality
      const closeBtn = document.getElementById('closeBookmarkSetup');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          document.body.removeChild(tempPage);
        });
      }
      
      // Auto-close after 30 seconds
      setTimeout(() => {
        if (tempPage.parentNode) {
          document.body.removeChild(tempPage);
        }
      }, 30000);
      
      return true;
    } catch (error) {
      console.error('Error creating keyboard bookmark setup:', error);
      return false;
    }
  }

  // Create simple, automatic one-click bookmarklet
  private async createSimpleOneClickBookmarklet(bookmarkletCode: string): Promise<boolean> {
    try {
      // Create a simple, user-friendly bookmarklet element
      const bookmarkletElement = document.createElement('a');
      bookmarkletElement.href = bookmarkletCode;
      bookmarkletElement.textContent = '🚀 OPPTYM Auto-Fill';
      bookmarkletElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        text-decoration: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 16px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        cursor: pointer;
        user-select: none;
        border: none;
        transition: all 0.3s ease;
        animation: pulse 2s infinite;
      `;
      
      // Add hover effects
      bookmarkletElement.addEventListener('mouseenter', () => {
        bookmarkletElement.style.transform = 'scale(1.05)';
        bookmarkletElement.style.boxShadow = '0 12px 35px rgba(16, 185, 129, 0.4)';
      });
      
      bookmarkletElement.addEventListener('mouseleave', () => {
        bookmarkletElement.style.transform = 'scale(1)';
        bookmarkletElement.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
      });
      
      // Add click functionality (for immediate use)
      bookmarkletElement.addEventListener('click', (e) => {
        e.preventDefault();
        // Execute the bookmarklet immediately
        eval(bookmarkletCode.replace('javascript:', ''));
      });
      
      // Add drag functionality for bookmark bar
      bookmarkletElement.draggable = true;
      bookmarkletElement.addEventListener('dragstart', (e) => {
        e.dataTransfer?.setData('text/plain', bookmarkletCode);
        e.dataTransfer?.setData('text/html', bookmarkletElement.outerHTML);
      });
      
      // Add to page
      document.body.appendChild(bookmarkletElement);
      
      // Show simple instructions
      const instructions = document.createElement('div');
      instructions.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: white;
        border: 2px solid #10b981;
        border-radius: 12px;
        padding: 20px;
        max-width: 320px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        animation: slideIn 0.5s ease;
      `;
      instructions.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 12px; color: #1f2937; font-size: 16px;">🎯 Ready to Auto-Fill!</div>
        <div style="color: #6b7280; line-height: 1.5; margin-bottom: 16px;">
          <div style="margin-bottom: 8px;">✅ <strong>Click</strong> the green button to use immediately</div>
          <div style="margin-bottom: 8px;">✅ <strong>Drag</strong> to your bookmarks bar for later use</div>
          <div style="margin-bottom: 8px;">✅ <strong>Right-click</strong> → "Add to bookmarks"</div>
        </div>
        <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #10b981;">
          <div style="font-weight: 600; color: #166534; margin-bottom: 4px;">💡 Pro Tip:</div>
          <div style="color: #166534; font-size: 13px;">Once installed, visit any directory website and click the bookmarklet to auto-fill forms instantly!</div>
        </div>
        <div style="display: flex; gap: 10px;">
          <button id="closeInstructions" style="
            background: #6b7280;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            flex: 1;
            transition: background 0.3s ease;
          ">Close</button>
          <button id="testBookmarklet" style="
            background: #10b981;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            flex: 1;
            transition: background 0.3s ease;
          ">Test Now</button>
        </div>
      `;
      
      // Add CSS animations
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        #closeInstructions:hover { background: #4b5563 !important; }
        #testBookmarklet:hover { background: #059669 !important; }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(instructions);
      
      // Close instructions
      document.getElementById('closeInstructions')?.addEventListener('click', () => {
        document.body.removeChild(instructions);
        document.body.removeChild(bookmarkletElement);
        document.head.removeChild(style);
      });
      
      // Test bookmarklet
      document.getElementById('testBookmarklet')?.addEventListener('click', () => {
        // Execute the bookmarklet immediately
        eval(bookmarkletCode.replace('javascript:', ''));
        document.body.removeChild(instructions);
        document.body.removeChild(bookmarkletElement);
        document.head.removeChild(style);
      });
      
      // Auto-remove after 60 seconds
      setTimeout(() => {
        if (instructions.parentNode) {
          document.body.removeChild(instructions);
        }
        if (bookmarkletElement.parentNode) {
          document.body.removeChild(bookmarkletElement);
        }
        if (style.parentNode) {
          document.head.removeChild(style);
        }
      }, 60000);
      
      return true;
    } catch (error) {
      console.error('Simple one-click bookmarklet creation failed:', error);
      return false;
    }
  }

  // Create one-click bookmarklet (draggable element) - OLD VERSION
  private async createOneClickBookmarklet(bookmarkletCode: string): Promise<boolean> {
    try {
      // Create a draggable bookmarklet element
      const bookmarkletElement = document.createElement('a');
      bookmarkletElement.href = bookmarkletCode;
      bookmarkletElement.textContent = 'OPPTYM Auto-Fill';
      bookmarkletElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        text-decoration: none;
        font-family: Arial, sans-serif;
        font-size: 14px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        cursor: grab;
        user-select: none;
        border: 2px solid #059669;
      `;
      
      // Add drag functionality
      bookmarkletElement.draggable = true;
      bookmarkletElement.addEventListener('dragstart', (e) => {
        e.dataTransfer?.setData('text/plain', bookmarkletCode);
        e.dataTransfer?.setData('text/html', bookmarkletElement.outerHTML);
      });
      
      // Add click functionality (for immediate use)
      bookmarkletElement.addEventListener('click', (e) => {
        e.preventDefault();
        // Execute the bookmarklet immediately
        eval(bookmarkletCode.replace('javascript:', ''));
      });
      
      // Add to page
      document.body.appendChild(bookmarkletElement);
      
      // Show instructions
      const instructions = document.createElement('div');
      instructions.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #f0f9ff;
        border: 1px solid #0ea5e9;
        border-radius: 8px;
        padding: 16px;
        max-width: 350px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      instructions.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px; color: #0c4a6e;">🚀 OPPTYM Auto-Fill Ready!</div>
        <div style="color: #0c4a6e; line-height: 1.4;">
          <div style="margin-bottom: 6px;">✅ <strong>Option 1:</strong> Drag the green button to your bookmarks bar</div>
          <div style="margin-bottom: 6px;">✅ <strong>Option 2:</strong> Click the green button to use immediately</div>
          <div style="margin-bottom: 8px;">✅ <strong>Option 3:</strong> Right-click → "Add to bookmarks"</div>
          <div style="background: #e0f2fe; padding: 8px; border-radius: 4px; margin-top: 8px; font-size: 12px;">
            💡 <strong>Pro tip:</strong> Once installed, visit any directory website and click the bookmarklet to auto-fill forms!
          </div>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <button id="closeInstructions" style="
            background: #0ea5e9;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            flex: 1;
          ">Got it!</button>
          <button id="testBookmarklet" style="
            background: #10b981;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            flex: 1;
          ">Test Now</button>
        </div>
      `;
      
      document.body.appendChild(instructions);
      
      // Close instructions
      document.getElementById('closeInstructions')?.addEventListener('click', () => {
        document.body.removeChild(instructions);
        document.body.removeChild(bookmarkletElement);
      });
      
      // Test bookmarklet
      document.getElementById('testBookmarklet')?.addEventListener('click', () => {
        // Execute the bookmarklet immediately
        eval(bookmarkletCode.replace('javascript:', ''));
        document.body.removeChild(instructions);
        document.body.removeChild(bookmarkletElement);
      });
      
      // Auto-remove after 30 seconds
      setTimeout(() => {
        if (instructions.parentNode) {
          document.body.removeChild(instructions);
        }
        if (bookmarkletElement.parentNode) {
          document.body.removeChild(bookmarkletElement);
        }
      }, 30000);
      
      return true;
    } catch (error) {
      console.error('One-click bookmarklet creation failed:', error);
      return false;
    }
  }



  // Get project data for manual filling
  getProjectDataForManual(): string {
    return `
Project Data for Manual Filling:

Name: ${this.projectData.name}
Email: ${this.projectData.email}
Phone: ${this.projectData.phone}
Company: ${this.projectData.companyName}
Website: ${this.projectData.url}
Description: ${this.projectData.description}
Address: ${this.projectData.address || ''}
City: ${this.projectData.city || ''}
State: ${this.projectData.state || ''}
Country: ${this.projectData.country || ''}
Pincode: ${this.projectData.pincode || ''}
    `.trim();
  }
}
