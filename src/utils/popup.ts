export type PopupType = 'success' | 'error' | 'warning' | 'info';

export const showPopup = (message: string, type: PopupType = 'info', duration: number = 5000) => {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8);
    display: flex; align-items: center; justify-content: center; z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white; border-radius: 16px; padding: 30px; max-width: 400px; width: 90%;
    text-align: center; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  `;

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: '✅', color: '#10b981' };
      case 'error':
        return { icon: '❌', color: '#ef4444' };
      case 'warning':
        return { icon: '⚠️', color: '#f59e0b' };
      case 'info':
      default:
        return { icon: 'ℹ️', color: '#3b82f6' };
    }
  };

  const { icon, color } = getIconAndColor();

  content.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 20px;">${icon}</div>
    <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 600; color: #1f2937;">${type.charAt(0).toUpperCase() + type.slice(1)}</h2>
    <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.5;">${message}</p>
    <button id="closePopup" style="background: ${color}; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">OK</button>
  `;

  document.body.appendChild(modal);

  // Close button handler
  document.getElementById('closePopup')?.addEventListener('click', () => {
    if (modal.parentNode) {
      document.body.removeChild(modal);
    }
  });

  // Auto-close after duration
  setTimeout(() => {
    if (modal.parentNode) {
      document.body.removeChild(modal);
    }
  }, duration);

  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      if (modal.parentNode) {
        document.body.removeChild(modal);
      }
    }
  });
};

export const showConfirmPopup = (message: string, onConfirm: () => void, onCancel?: () => void): void => {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8);
    display: flex; align-items: center; justify-content: center; z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white; border-radius: 16px; padding: 30px; max-width: 400px; width: 90%;
    text-align: center; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  `;

  content.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
    <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 600; color: #1f2937;">Confirm Action</h2>
    <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.5;">${message}</p>
    <div style="display: flex; gap: 12px; justify-content: center;">
      <button id="confirmBtn" style="background: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">Confirm</button>
      <button id="cancelBtn" style="background: #6b7280; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">Cancel</button>
    </div>
  `;

  document.body.appendChild(modal);

  // Confirm button handler
  document.getElementById('confirmBtn')?.addEventListener('click', () => {
    if (modal.parentNode) {
      document.body.removeChild(modal);
    }
    onConfirm();
  });

  // Cancel button handler
  document.getElementById('cancelBtn')?.addEventListener('click', () => {
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


