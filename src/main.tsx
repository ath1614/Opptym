import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import axios from 'axios'

// Set base URL for axios
axios.defaults.baseURL = 'https://api.opptym.com';

// Force cache busting for development
if (import.meta.env.DEV) {
  console.log('🔄 Development mode - Cache busting enabled');
}

// Add request interceptor to include token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔍 401 Unauthorized - Clearing token and redirecting to login');
      
      // Clear invalid token and all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      // Force clear any cached data
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      // Show popup to user
      if (typeof window !== 'undefined') {
        // Create a simple popup to inform user
        const popup = document.createElement('div');
        popup.style.cssText = `
          position: fixed; top: 20px; right: 20px; z-index: 10000;
          background: #ef4444; color: white; padding: 16px; border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 300px;
        `;
        popup.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">⚠️</span>
            <div>
              <div style="font-weight: 600; margin-bottom: 4px;">Session Expired</div>
              <div style="font-size: 14px; opacity: 0.9;">Please login again to continue.</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="
              background: none; border: none; color: white; cursor: pointer; 
              font-size: 18px; margin-left: auto; padding: 0;
            ">×</button>
          </div>
        `;
        document.body.appendChild(popup);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
          if (popup.parentElement) {
            popup.remove();
          }
        }, 5000);
      }
      
      // Force reload page to clear all state
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
    return Promise.reject(error);
  }
);

// Check for invalid token on app startup
const checkAndClearInvalidToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      // Basic token validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('🔍 Invalid token format detected on startup - clearing');
        localStorage.removeItem('token');
        return;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.userId || !payload.email) {
        console.log('🔍 Invalid token payload detected on startup - clearing');
        localStorage.removeItem('token');
        return;
      }
      
      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.log('🔍 Expired token detected on startup - clearing');
        localStorage.removeItem('token');
        return;
      }
    } catch (error) {
      console.log('🔍 Error validating token on startup - clearing');
      localStorage.removeItem('token');
    }
  }
};

// Run token validation on startup
checkAndClearInvalidToken();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)