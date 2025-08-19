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
      console.log('🔍 401 Unauthorized - AGGRESSIVE CLEANUP');
      
      // AGGRESSIVE CLEAR - Clear everything
      localStorage.clear();
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
      
      // IMMEDIATE REDIRECT
      window.location.href = '/';
      return Promise.reject(error);
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