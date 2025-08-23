import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import axios from 'axios'

// Set base URL for axios
axios.defaults.baseURL = 'https://api.opptym.com';



// Add request interceptor to include token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token format before sending
      if (token.includes('.') && token.split('.').length === 3) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        localStorage.removeItem('token');
      }
    }
    return config;
  },
  (error) => {
    console.error('🔍 Request interceptor error:', error);
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
      
      // Clear authentication data
      localStorage.removeItem('token');
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Force clear any cached data
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/';
      }
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
      if (!token.includes('.') || token.split('.').length !== 3) {
        localStorage.removeItem('token');
        return;
      }
      
      const parts = token.split('.');
      if (!parts[0] || !parts[1] || !parts[2]) {
        localStorage.removeItem('token');
        return;
      }
      
      // Try to decode payload
      let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      
      // Add padding if needed
      while (base64.length % 4) {
        base64 += '=';
      }
      
      const jsonPayload = atob(base64);
      const payload = JSON.parse(jsonPayload);
      
      if (!payload.userId || !payload.email) {
        localStorage.removeItem('token');
        return;
      }
      
      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        return;
      }
    } catch (error) {
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