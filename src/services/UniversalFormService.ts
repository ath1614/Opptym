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

      // Create the bookmarklet script with server-side validation
      const script = `
        (function() {
          // Server-generated bookmarklet token
          const BOOKMARKLET_TOKEN = '${bookmarkletToken}';
          const API_BASE_URL = 'https://api.opptym.com';
          
          // Check if user is authenticated and has valid subscription
          const validateToken = async () => {
            try {
              // Show loading indicator
              const loadingDiv = document.createElement('div');
              loadingDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #3b82f6; color: white; padding: 12px 20px; border-radius: 8px; font-family: Arial, sans-serif; font-size: 14px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
              loadingDiv.textContent = '🔐 Validating bookmarklet...';
              document.body.appendChild(loadingDiv);
              
              // Validate token with server
              const response = await fetch('\${API_BASE_URL}/api/bookmarklet/validate', {
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
              alert('❌ Network error. Please check your connection and try again.');
              return null;
            }
          };
          
          // Main form filling function
          const fillForms = async () => {
            // Validate token first
            const validationResult = await validateToken();
            if (!validationResult) return;
            
            const projectData = validationResult.projectData;
            const usageInfo = {
              current: validationResult.usageCount,
              max: validationResult.maxUsage,
              remaining: validationResult.remainingUses
            };
            
            // Show usage info
            const usageDiv = document.createElement('div');
            usageDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 12px 20px; border-radius: 8px; font-family: Arial, sans-serif; font-size: 14px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
            usageDiv.innerHTML = \`✅ Token validated! Uses: \${usageInfo.current}/\${usageInfo.max} (\${usageInfo.remaining} remaining)\`;
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
                  console.log(\`✅ Filled field \${index + 1}: \${input.name || input.id || input.placeholder} with: \${mapping.value}\`);
                }
              } catch (e) {
                errorCount++;
                console.log(\`⚠️ Error processing field \${index + 1}:\`, e);
              }
            });
          };
          
          // Execute form filling
          processInputFields();
          
          // Update loading message
          setTimeout(() => {
            loadingDiv.style.background = filledCount > 0 ? '#10b981' : '#f59e0b';
            loadingDiv.textContent = filledCount > 0 
              ? \`✅ \${filledCount} fields filled successfully!\`
              : \`⚠️ No fields could be filled automatically\`;
            
            // Remove message after 3 seconds
            setTimeout(() => {
              if (loadingDiv.parentNode) {
                loadingDiv.parentNode.removeChild(loadingDiv);
              }
            }, 3000);
          }, 500);
          
          console.log(\`🎯 Form filling completed: \${filledCount} fields filled, \${errorCount} errors\`);
          
          // Auto-delete this bookmarklet after 30 minutes
          setTimeout(() => {
            try {
              console.log('🕐 Auto-deletion timer triggered (30 minutes)');
              
              // Try to remove from Chrome bookmarks bar
              if (typeof window.chrome !== 'undefined' && window.chrome?.bookmarks) {
                window.chrome.bookmarks.search({ title: 'OPPTYM Auto-Fill' }).then(bookmarks => {
                  bookmarks.forEach(bookmark => {
                    window.chrome.bookmarks.remove(bookmark.id);
                    console.log('🗑️ Removed bookmark from Chrome:', bookmark.id);
                  });
                }).catch(e => console.log('Chrome bookmark removal failed:', e));
              }
              
              // Try to remove from Firefox bookmarks bar
              if (typeof window.browser !== 'undefined' && window.browser?.bookmarks) {
                window.browser.bookmarks.search({ title: 'OPPTYM Auto-Fill' }).then(bookmarks => {
                  bookmarks.forEach(bookmark => {
                    window.browser.bookmarks.remove(bookmark.id);
                    console.log('🗑️ Removed bookmark from Firefox:', bookmark.id);
                  });
                }).catch(e => console.log('Firefox bookmark removal failed:', e));
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
              console.log('❌ Auto-deletion failed:', e);
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

  // Smart bookmarklet installation with user-friendly workflow
  async installBookmarkletAutomatically(): Promise<BookmarkletResult> {
    const bookmarkletCode = await this.createUniversalBookmarklet();
    
    try {
      // Method 1: Try browser extension API (if available and user has granted permissions)
      if (typeof window.chrome !== 'undefined' && window.chrome?.bookmarks && window.chrome?.permissions) {
        try {
          // Check if we have bookmark permissions
          const hasPermission = await window.chrome!.permissions!.contains({
            permissions: ['bookmarks']
          });
          
          if (hasPermission) {
            const bookmark = await window.chrome!.bookmarks!.create({
              title: 'OPPTYM Auto-Fill',
              url: bookmarkletCode
            });
            
            return {
              success: true,
              bookmarkletId: bookmark.id,
              bookmarkletCode: bookmarkletCode,
              fallbackInstructions: '✅ Bookmarklet installed automatically in Chrome!'
            };
          }
        } catch (e) {
          console.log('Chrome bookmarks API failed, trying alternative method');
        }
      }
      
      // Method 2: Try Firefox bookmarks API (if available)
      if (typeof window.browser !== 'undefined' && window.browser?.bookmarks) {
        try {
          const bookmark = await window.browser!.bookmarks!.create({
            title: 'OPPTYM Auto-Fill',
            url: bookmarkletCode
          });
          
          return {
            success: true,
            bookmarkletId: bookmark.id,
            bookmarkletCode: bookmarkletCode,
            fallbackInstructions: '✅ Bookmarklet installed automatically in Firefox!'
          };
        } catch (e) {
          console.log('Firefox bookmarks API failed, trying alternative method');
        }
      }
      
      // Method 3: Try to create bookmark using keyboard shortcut simulation
      const keyboardSuccess = await this.createBookmarkWithKeyboard(bookmarkletCode);
      if (keyboardSuccess) {
        return {
          success: true,
          bookmarkletCode: bookmarkletCode,
          fallbackInstructions: '✅ Bookmarklet ready! Press Ctrl+D (or Cmd+D) to bookmark this page, then edit the bookmark URL with the provided code.'
        };
      }
      
      // Method 4: One-click bookmarklet creation (works on most browsers)
      const success = await this.createOneClickBookmarklet(bookmarkletCode);
      
      if (success) {
        return {
          success: true,
          bookmarkletCode: bookmarkletCode,
          fallbackInstructions: '✅ Bookmarklet created! Drag the green button to your bookmarks bar.'
        };
      }
      
      // Method 5: Fallback to manual instructions with copy-paste
      return {
        success: false,
        bookmarkletCode: bookmarkletCode,
        fallbackInstructions: '📋 Copy the bookmarklet code and create a bookmark manually.'
      };
      
    } catch (error: unknown) {
      console.error('Error installing bookmarklet:', error);
      return {
        success: false,
        bookmarkletCode: bookmarkletCode,
        fallbackInstructions: '📋 Copy the bookmarklet code and create a bookmark manually.',
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

  // Create one-click bookmarklet (draggable element)
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
