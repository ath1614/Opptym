export type PopupType = 'success' | 'error' | 'warning' | 'info';

export const showPopup = (message: string, type: PopupType = 'info', duration: number = 5000) => {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center; z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: fadeIn 0.3s ease-out;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
    backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px; padding: 40px; max-width: 450px; width: 90%;
    text-align: center; box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
    animation: slideInUp 0.4s ease-out;
  `;

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { 
          icon: '🎉', 
          color: '#10b981',
          gradient: 'linear-gradient(135deg, #10b981, #059669)',
          bgColor: 'rgba(16, 185, 129, 0.1)'
        };
      case 'error':
        return { 
          icon: '🚨', 
          color: '#ef4444',
          gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
          bgColor: 'rgba(239, 68, 68, 0.1)'
        };
      case 'warning':
        return { 
          icon: '⚠️', 
          color: '#f59e0b',
          gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
          bgColor: 'rgba(245, 158, 11, 0.1)'
        };
      case 'info':
      default:
        return { 
          icon: '💡', 
          color: '#3b82f6',
          gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          bgColor: 'rgba(59, 130, 246, 0.1)'
        };
    }
  };

  const { icon, color, gradient, bgColor } = getIconAndColor();

  // Create elements safely to prevent XSS
  const iconDiv = document.createElement('div');
  iconDiv.style.cssText = `
    font-size: 56px; margin-bottom: 24px; 
    background: ${bgColor}; 
    width: 80px; height: 80px; 
    border-radius: 50%; 
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 24px auto;
    animation: bounceIn 0.6s ease-out;
  `;
  iconDiv.textContent = icon;

  const title = document.createElement('h2');
  title.style.cssText = `
    margin: 0 0 16px 0; font-size: 24px; font-weight: 700; 
    background: ${gradient}; -webkit-background-clip: text; 
    -webkit-text-fill-color: transparent; background-clip: text;
    letter-spacing: -0.025em;
  `;
  title.textContent = type.charAt(0).toUpperCase() + type.slice(1);

  const messageP = document.createElement('p');
  messageP.style.cssText = `
    margin: 0 0 32px 0; color: #374151; font-size: 16px; 
    line-height: 1.6; font-weight: 500;
  `;
  messageP.textContent = message;

  const button = document.createElement('button');
  button.id = 'closePopup';
  button.style.cssText = `
    background: ${gradient}; color: white; border: none; 
    padding: 16px 32px; border-radius: 12px; cursor: pointer; 
    font-weight: 600; font-size: 16px; min-width: 120px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease; transform: translateY(0);
  `;
  button.textContent = 'Got it!';

  content.appendChild(iconDiv);
  content.appendChild(title);
  content.appendChild(messageP);
  content.appendChild(button);

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideInUp {
      from { 
        opacity: 0; 
        transform: translateY(30px) scale(0.95); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }
    @keyframes bounceIn {
      0% { 
        opacity: 0; 
        transform: scale(0.3); 
      }
      50% { 
        opacity: 1; 
        transform: scale(1.05); 
      }
      70% { 
        transform: scale(0.9); 
      }
      100% { 
        opacity: 1; 
        transform: scale(1); 
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(modal);

  // Add button hover effects
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.2)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
  });

  // Close button handler
  button.addEventListener('click', () => {
    if (modal.parentNode) {
      document.body.removeChild(modal);
      document.head.removeChild(style);
    }
  });

  // Auto-close after duration
  setTimeout(() => {
    if (modal.parentNode) {
      document.body.removeChild(modal);
      document.head.removeChild(style);
    }
  }, duration);

  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      if (modal.parentNode) {
        document.body.removeChild(modal);
        document.head.removeChild(style);
      }
    }
  });
};

export const showConfirmPopup = (message: string, onConfirm: () => void, onCancel?: () => void): void => {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center; z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: fadeIn 0.3s ease-out;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
    backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px; padding: 40px; max-width: 450px; width: 90%;
    text-align: center; box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
    animation: slideInUp 0.4s ease-out;
  `;

  // Create elements safely to prevent XSS
  const iconDiv = document.createElement('div');
  iconDiv.style.cssText = `
    font-size: 56px; margin-bottom: 24px; 
    background: rgba(245, 158, 11, 0.1); 
    width: 80px; height: 80px; 
    border-radius: 50%; 
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 24px auto;
    animation: bounceIn 0.6s ease-out;
  `;
  iconDiv.textContent = '⚠️';

  const title = document.createElement('h2');
  title.style.cssText = `
    margin: 0 0 16px 0; font-size: 24px; font-weight: 700; 
    background: linear-gradient(135deg, #f59e0b, #d97706); 
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; 
    background-clip: text; letter-spacing: -0.025em;
  `;
  title.textContent = 'Confirm Action';

  const messageP = document.createElement('p');
  messageP.style.cssText = `
    margin: 0 0 32px 0; color: #374151; font-size: 16px; 
    line-height: 1.6; font-weight: 500;
  `;
  messageP.textContent = message;

  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = 'display: flex; gap: 16px; justify-content: center;';

  const confirmBtn = document.createElement('button');
  confirmBtn.id = 'confirmBtn';
  confirmBtn.style.cssText = `
    background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; 
    padding: 16px 32px; border-radius: 12px; cursor: pointer; 
    font-weight: 600; font-size: 16px; min-width: 120px;
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
    transition: all 0.3s ease; transform: translateY(0);
  `;
  confirmBtn.textContent = 'Confirm';

  const cancelBtn = document.createElement('button');
  cancelBtn.id = 'cancelBtn';
  cancelBtn.style.cssText = `
    background: linear-gradient(135deg, #6b7280, #4b5563); color: white; border: none; 
    padding: 16px 32px; border-radius: 12px; cursor: pointer; 
    font-weight: 600; font-size: 16px; min-width: 120px;
    box-shadow: 0 8px 25px rgba(107, 114, 128, 0.3);
    transition: all 0.3s ease; transform: translateY(0);
  `;
  cancelBtn.textContent = 'Cancel';

  buttonContainer.appendChild(confirmBtn);
  buttonContainer.appendChild(cancelBtn);

  content.appendChild(iconDiv);
  content.appendChild(title);
  content.appendChild(messageP);
  content.appendChild(buttonContainer);

  document.body.appendChild(modal);

  // Add button hover effects
  confirmBtn.addEventListener('mouseenter', () => {
    confirmBtn.style.transform = 'translateY(-2px)';
    confirmBtn.style.boxShadow = '0 12px 35px rgba(239, 68, 68, 0.4)';
  });

  confirmBtn.addEventListener('mouseleave', () => {
    confirmBtn.style.transform = 'translateY(0)';
    confirmBtn.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.3)';
  });

  cancelBtn.addEventListener('mouseenter', () => {
    cancelBtn.style.transform = 'translateY(-2px)';
    cancelBtn.style.boxShadow = '0 12px 35px rgba(107, 114, 128, 0.4)';
  });

  cancelBtn.addEventListener('mouseleave', () => {
    cancelBtn.style.transform = 'translateY(0)';
    cancelBtn.style.boxShadow = '0 8px 25px rgba(107, 114, 128, 0.3)';
  });

  // Confirm button handler
  confirmBtn.addEventListener('click', () => {
    if (modal.parentNode) {
      document.body.removeChild(modal);
    }
    onConfirm();
  });

  // Cancel button handler
  cancelBtn.addEventListener('click', () => {
    if (modal.parentNode) {
      document.body.removeChild(modal);
    }
    if (onCancel) onCancel();
  });

  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      if (modal.parentNode) {
        document.body.removeChild(modal);
      }
      if (onCancel) onCancel();
    }
  });
};


