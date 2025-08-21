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
        console.log('🚀 OPPTYM Universal Form Filler Starting...');
        
        const projectData = ${JSON.stringify(this.projectData)};
        let filledCount = 0;
        let errorCount = 0;
        
        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = \`
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
        loadingDiv.textContent = '🔄 Filling form fields...';
        document.body.appendChild(loadingDiv);
        
        // Enhanced field mapping function
        function mapFieldToValue(input) {
          const fieldName = (input.name || input.id || input.placeholder || '').toLowerCase();
          const fieldType = input.type.toLowerCase();
          
          // Email fields
          if (fieldType === 'email' || fieldName.includes('email') || fieldName.includes('e-mail')) {
            return projectData.email;
          }
          
          // Phone fields
          if (fieldType === 'tel' || fieldName.includes('phone') || fieldName.includes('mobile') || fieldName.includes('telephone') || fieldName.includes('contact')) {
            return projectData.phone;
          }
          
          // Name fields (personal name)
          if ((fieldName.includes('name') && !fieldName.includes('company') && !fieldName.includes('business') && !fieldName.includes('user')) || 
              fieldName.includes('first') || fieldName.includes('last') || fieldName.includes('full')) {
            return projectData.name;
          }
          
          // Company/Business fields
          if (fieldName.includes('company') || fieldName.includes('business') || fieldName.includes('organization') || fieldName.includes('firm') || fieldName.includes('enterprise')) {
            return projectData.companyName;
          }
          
          // Website/URL fields
          if (fieldName.includes('website') || fieldName.includes('url') || fieldName.includes('site') || fieldName.includes('web') || fieldName.includes('link')) {
            return projectData.url;
          }
          
          // Address fields
          if (fieldName.includes('address') || fieldName.includes('street') || fieldName.includes('location')) {
            return projectData.address || '';
          }
          
          // City fields
          if (fieldName.includes('city') || fieldName.includes('town')) {
            return projectData.city || '';
          }
          
          // State fields
          if (fieldName.includes('state') || fieldName.includes('province') || fieldName.includes('region')) {
            return projectData.state || '';
          }
          
          // Zip/Postal code fields
          if (fieldName.includes('zip') || fieldName.includes('postal') || fieldName.includes('pincode') || fieldName.includes('code')) {
            return projectData.pincode || '';
          }
          
          // Country fields
          if (fieldName.includes('country') || fieldName.includes('nation')) {
            return projectData.country || '';
          }
          
          // Description fields
          if (fieldName.includes('description') || fieldName.includes('about') || fieldName.includes('details') || fieldName.includes('info') || fieldName.includes('summary')) {
            return projectData.description;
          }
          
          // Category fields
          if (fieldName.includes('category') || fieldName.includes('type') || fieldName.includes('industry') || fieldName.includes('sector')) {
            return projectData.category || '';
          }
          
          // Title fields
          if (fieldName.includes('title') || fieldName.includes('job') || fieldName.includes('position')) {
            return projectData.title || '';
          }
          
          // Username fields
          if (fieldName.includes('username') || fieldName.includes('user') || fieldName.includes('login')) {
            return projectData.name || projectData.companyName;
          }
          
          // Comments/Message fields
          if (fieldName.includes('comment') || fieldName.includes('message') || fieldName.includes('note') || fieldName.includes('text')) {
            return projectData.description || \`Contact from \${projectData.companyName || projectData.name}\`;
          }
          
          return null;
        }
        
        // Enhanced field filling function
        function fillField(input, value) {
          try {
            // Skip if field is disabled, readonly, or already has a value
            if (input.disabled || input.readOnly || input.value) {
              return false;
            }
            
            // Clear the field first
            input.value = '';
            
            // Fill the field
            input.value = value;
            
            // Trigger events
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.dispatchEvent(new Event('blur', { bubbles: true }));
            
            return true;
          } catch (e) {
            console.log('⚠️ Error filling field:', e);
            return false;
          }
        }
        
        // Find and fill all input fields
        const inputs = document.querySelectorAll('input, textarea, select');
        console.log(\`Found \${inputs.length} input fields\`);
        
        inputs.forEach((input, index) => {
          try {
            const value = mapFieldToValue(input);
            if (value) {
              if (fillField(input, value)) {
                filledCount++;
                console.log(\`✅ Filled field \${index + 1}: \${input.name || input.id || input.placeholder} with: \${value}\`);
              }
            }
          } catch (e) {
            errorCount++;
            console.log(\`⚠️ Error processing field \${index + 1}:\`, e);
          }
        });
        
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
            const bookmarkletElement = document.querySelector('a[href*="OPPTYM Auto-Fill"]');
            if (bookmarkletElement) {
              bookmarkletElement.remove();
              console.log('🗑️ Bookmarklet auto-deleted after 30 minutes');
            }
          } catch (e) {
            console.log('⚠️ Could not auto-delete bookmarklet:', e);
          }
        }, 30 * 60 * 1000); // 30 minutes
        
      })();
    `;
    
    return \`javascript:\${encodeURIComponent(script)}\`;
  }

  // Smart bookmarklet installation with user-friendly workflow
  async installBookmarkletAutomatically(): Promise<BookmarkletResult> {
    const bookmarkletCode = this.createUniversalBookmarklet();
    
    try {
      // Method 1: Try browser extension API (if available and user has granted permissions)
      if (typeof chrome !== 'undefined' && chrome.bookmarks && chrome.permissions) {
        try {
          // Check if we have bookmark permissions
          const hasPermission = await chrome.permissions.contains({
            permissions: ['bookmarks']
          });
          
          if (hasPermission) {
            const bookmark = await chrome.bookmarks.create({
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
      if (typeof browser !== 'undefined' && browser.bookmarks) {
        try {
          const bookmark = await browser.bookmarks.create({
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
      
    } catch (error) {
      console.error('Error installing bookmarklet:', error);
      return {
        success: false,
        bookmarkletCode: bookmarkletCode,
        fallbackInstructions: '📋 Copy the bookmarklet code and create a bookmark manually.',
        error: error.message
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
        if (typeof chrome !== 'undefined' && chrome.bookmarks) {
          await chrome.bookmarks.remove(bookmarkletId);
          return true;
        } else if (typeof browser !== 'undefined' && browser.bookmarks) {
          await browser.bookmarks.remove(bookmarkletId);
          return true;
        }
      }
      
      // Try to find and remove by title
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        const bookmarks = await chrome.bookmarks.search({ title: 'OPPTYM Auto-Fill' });
        for (const bookmark of bookmarks) {
          await chrome.bookmarks.remove(bookmark.id);
        }
        return bookmarks.length > 0;
      } else if (typeof browser !== 'undefined' && browser.bookmarks) {
        const bookmarks = await browser.bookmarks.search({ title: 'OPPTYM Auto-Fill' });
        for (const bookmark of bookmarks) {
          await browser.bookmarks.remove(bookmark.id);
        }
        return bookmarks.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting bookmarklet:', error);
      return false;
    }
  }

  // Get project data for manual filling
  getProjectDataForManual(): string {
    return \`
Project Data for Manual Filling:

Name: \${this.projectData.name}
Email: \${this.projectData.email}
Phone: \${this.projectData.phone}
Company: \${this.projectData.companyName}
Website: \${this.projectData.url}
Description: \${this.projectData.description}
Address: \${this.projectData.address || ''}
City: \${this.projectData.city || ''}
State: \${this.projectData.state || ''}
Country: \${this.projectData.country || ''}
Pincode: \${this.projectData.pincode || ''}
    \`.trim();
  }
}
