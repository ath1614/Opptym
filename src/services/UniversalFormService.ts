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

export class UniversalFormService {
  private projectData: ProjectData;

  constructor(projectData: ProjectData) {
    this.projectData = projectData;
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
                alert('❌ ' + (result.message || 'Bookmarklet validation failed'));
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
            
            // Show loading indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.style.cssText = 'position: fixed; top: 60px; right: 20px; background: #3b82f6; color: white; padding: 12px 20px; border-radius: 8px; font-family: Arial, sans-serif; font-size: 14px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
            loadingDiv.textContent = '🤖 Filling forms...';
            document.body.appendChild(loadingDiv);
            
            let filledCount = 0;
            let errorCount = 0;
            
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
          
          // Process all form fields
          const processInputFields = () => {
            const inputs = document.querySelectorAll('input, textarea, select');
            
            inputs.forEach((input, index) => {
              try {
                if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') return;
                
                const fieldName = (input.name || input.id || input.placeholder || '').toLowerCase();
                const fieldValue = input.value || '';
                
                // Skip if field already has a value
                if (fieldValue.trim()) return;
                
                // Find matching field mapping
                const mapping = fieldMappings.find(m => 
                  m.patterns.some(pattern => fieldName.includes(pattern))
                );
                
                if (mapping && mapping.value) {
                  input.value = mapping.value;
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                  input.dispatchEvent(new Event('change', { bubbles: true }));
                  filledCount++;
                  console.log('✅ Filled field ' + (index + 1) + ': ' + (input.name || input.id || input.placeholder) + ' with: ' + mapping.value);
                }
              } catch (e) {
                errorCount++;
                console.log('⚠️ Error processing field ' + (index + 1) + ':', e);
              }
            });
          };
          
          // Execute form filling
          processInputFields();
          
          // Update loading message
          setTimeout(() => {
            loadingDiv.style.background = filledCount > 0 ? '#10b981' : '#f59e0b';
            loadingDiv.textContent = filledCount > 0 
              ? '✅ ' + filledCount + ' fields filled successfully!'
              : '⚠️ No fields could be filled automatically';
            
            // Remove message after 3 seconds
            setTimeout(() => {
              if (loadingDiv.parentNode) {
                loadingDiv.parentNode.removeChild(loadingDiv);
              }
            }, 3000);
          }, 500);
          
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
