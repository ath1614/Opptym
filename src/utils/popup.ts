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

// Enhanced popup for OTP verification
export const showOTPPopup = (email: string, onVerify: (otp: string) => void, onResend: () => void, onCancel: () => void): void => {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8);
    display: flex; align-items: center; justify-content: center; z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white; border-radius: 16px; padding: 30px; max-width: 450px; width: 90%;
    text-align: center; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  `;

  content.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 20px;">🔐</div>
    <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 600; color: #1f2937;">Enter OTP</h2>
    <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
      We've sent a 6-digit code to <strong>${email}</strong>
    </p>
    
    <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 30px;">
      <input type="text" maxlength="1" style="width: 50px; height: 50px; text-align: center; font-size: 24px; font-weight: bold; border: 2px solid #d1d5db; border-radius: 8px; outline: none;" data-index="0">
      <input type="text" maxlength="1" style="width: 50px; height: 50px; text-align: center; font-size: 24px; font-weight: bold; border: 2px solid #d1d5db; border-radius: 8px; outline: none;" data-index="1">
      <input type="text" maxlength="1" style="width: 50px; height: 50px; text-align: center; font-size: 24px; font-weight: bold; border: 2px solid #d1d5db; border-radius: 8px; outline: none;" data-index="2">
      <input type="text" maxlength="1" style="width: 50px; height: 50px; text-align: center; font-size: 24px; font-weight: bold; border: 2px solid #d1d5db; border-radius: 8px; outline: none;" data-index="3">
      <input type="text" maxlength="1" style="width: 50px; height: 50px; text-align: center; font-size: 24px; font-weight: bold; border: 2px solid #d1d5db; border-radius: 8px; outline: none;" data-index="4">
      <input type="text" maxlength="1" style="width: 50px; height: 50px; text-align: center; font-size: 24px; font-weight: bold; border: 2px solid #d1d5db; border-radius: 8px; outline: none;" data-index="5">
    </div>
    
    <div style="display: flex; gap: 12px; justify-content: center;">
      <button id="verifyBtn" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500; opacity: 0.5;" disabled>Verify</button>
      <button id="resendBtn" style="background: #6b7280; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">Resend</button>
      <button id="cancelBtn" style="background: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">Cancel</button>
    </div>
  `;

  document.body.appendChild(modal);

  // OTP input handling
  const inputs = modal.querySelectorAll('input[data-index]') as NodeListOf<HTMLInputElement>;
  const verifyBtn = modal.querySelector('#verifyBtn') as HTMLButtonElement;
  const resendBtn = modal.querySelector('#resendBtn') as HTMLButtonElement;
  const cancelBtn = modal.querySelector('#cancelBtn') as HTMLButtonElement;
  
  let otp = ['', '', '', '', '', ''];
  
  const updateOTP = () => {
    const otpString = otp.join('');
    verifyBtn.disabled = otpString.length !== 6;
    verifyBtn.style.opacity = otpString.length === 6 ? '1' : '0.5';
  };
  
  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const value = target.value.slice(-1);
      
      if (/^\d$/.test(value)) {
        otp[index] = value;
        target.value = value;
        target.style.borderColor = '#3b82f6';
        
        // Move to next input
        if (index < 5 && value) {
          inputs[index + 1].focus();
        }
      } else {
        target.value = '';
        otp[index] = '';
        target.style.borderColor = '#d1d5db';
      }
      
      updateOTP();
    });
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });
  
  const cleanup = () => {
    if (modal.parentNode) {
      document.body.removeChild(modal);
    }
  };
  
  verifyBtn.addEventListener('click', () => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      cleanup();
      onVerify(otpString);
    }
  });
  
  resendBtn.addEventListener('click', () => {
    cleanup();
    onResend();
  });
  
  cancelBtn.addEventListener('click', () => {
    cleanup();
    onCancel();
  });
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      cleanup();
      onCancel();
    }
  });
  
  // Focus first input
  inputs[0].focus();
};
