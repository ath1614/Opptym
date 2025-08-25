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

  // Create universal form filling bookmarklet
  createUniversalBookmarklet(): string {
    const script = `
      (function() {
        // Check if user is authenticated and has valid subscription
        const checkAuth = async () => {
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              alert('❌ Please login to Opptym first to use this bookmarklet');
              return false;
            }
            
            // Verify token and check usage limits
                         const response = await fetch('https://api.opptym.com/api/subscription/verify-usage', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
              },
              body: JSON.stringify({
                action: 'bookmarklet_usage',
                timestamp: Date.now()
              })
            });
            
            const result = await response.json();
            
            if (!result.success) {
              alert('❌ ' + (result.message || 'Usage limit exceeded or subscription expired'));
              return false;
            }
            
            return true;
          } catch (error) {
            console.error('Auth check failed:', error);
            alert('❌ Authentication failed. Please refresh and try again.');
            return false;
          }
        };
        
        // Main form filling function
        const fillForms = async () => {
          // Check authentication first
          const isAuthenticated = await checkAuth();
          if (!isAuthenticated) return;
          
          // Show loading indicator
          const loadingDiv = document.createElement('div');
          loadingDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #3b82f6; color: white; padding: 12px 20px; border-radius: 8px; font-family: Arial, sans-serif; font-size: 14px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
          loadingDiv.textContent = '🤖 Filling forms...';
          document.body.appendChild(loadingDiv);
          
          // Project data (this will be replaced with server-fetched data)
          const projectData = {
            name: "${this.projectData.name}",
            email: "${this.projectData.email}",
            companyName: "${this.projectData.companyName}",
            phone: "${this.projectData.phone}",
            description: "${this.projectData.description}",
            url: "${this.projectData.url}"
          };
          
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
  }

  // Smart bookmarklet installation with user-friendly workflow
  async installBookmarkletAutomatically(): Promise<BookmarkletResult> {
    const bookmarkletCode = this.createUniversalBookmarklet();
    
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
              fallbackInstructions: '✅ Bookmarklet installed automatically!'
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
            fallbackInstructions: '✅ Bookmarklet installed automatically!'
          };
        } catch (e) {
          console.log('Firefox bookmarks API failed, trying alternative method');
        }
      }
      
      // Method 3: One-click bookmarklet creation (works on most browsers)
      const success = await this.createOneClickBookmarklet(bookmarkletCode);
      
      if (success) {
        return {
          success: true,
          bookmarkletCode: bookmarkletCode,
          fallbackInstructions: '✅ Bookmarklet created! Drag it to your bookmarks bar.'
        };
      }
      
      // Method 4: Fallback to manual instructions with copy-paste
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
        max-width: 300px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      instructions.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px; color: #0c4a6e;">📌 Quick Setup:</div>
        <div style="color: #0c4a6e; line-height: 1.4;">
          <div style="margin-bottom: 4px;">1. <strong>Drag</strong> the green button to your bookmarks bar</div>
          <div style="margin-bottom: 4px;">2. <strong>Or click</strong> it to use immediately</div>
          <div style="margin-bottom: 8px;">3. <strong>Visit</strong> any website with forms</div>
          <div>4. <strong>Click</strong> the bookmarklet to fill forms</div>
        </div>
        <button id="closeInstructions" style="
          background: #0ea5e9;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 12px;
          font-size: 12px;
        ">Got it!</button>
      `;
      
      document.body.appendChild(instructions);
      
      // Close instructions
      document.getElementById('closeInstructions')?.addEventListener('click', () => {
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

  // Delete bookmarklet automatically
  async deleteBookmarklet(bookmarkletId?: string): Promise<boolean> {
    try {
      if (bookmarkletId) {
        if (typeof window.chrome !== 'undefined' && window.chrome?.bookmarks) {
          await window.chrome.bookmarks.remove(bookmarkletId);
          return true;
        } else if (typeof window.browser !== 'undefined' && window.browser?.bookmarks) {
          await window.browser.bookmarks.remove(bookmarkletId);
          return true;
        }
      }
      
      // Try to find and remove by title
      if (typeof window.chrome !== 'undefined' && window.chrome?.bookmarks) {
        const bookmarks = await window.chrome.bookmarks.search({ title: 'OPPTYM Auto-Fill' });
        for (const bookmark of bookmarks) {
          await window.chrome.bookmarks.remove(bookmark.id);
        }
        return bookmarks.length > 0;
      } else if (typeof window.browser !== 'undefined' && window.browser?.bookmarks) {
        const bookmarks = await window.browser.bookmarks.search({ title: 'OPPTYM Auto-Fill' });
        for (const bookmark of bookmarks) {
          await window.browser.bookmarks.remove(bookmark.id);
        }
        return bookmarks.length > 0;
      }
      
      return false;
    } catch (error: unknown) {
      console.error('Error deleting bookmarklet:', error);
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
