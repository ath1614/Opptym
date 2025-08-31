import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import axios from 'axios'

// Set base URL for axios
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

if (isDevelopment) {
  axios.defaults.baseURL = 'http://localhost:3000';
} else {
  axios.defaults.baseURL = 'https://api.opptym.com';
}

// Force cache refresh
console.log('🔄 CACHE BUST INFO:', {
  buildVersion: (window as any).__BUILD_VERSION__,
  cacheBust: (window as any).__CACHE_BUST__,
  timestamp: (window as any).__TIMESTAMP__,
  commitSha: (window as any).__COMMIT_SHA__,
  buildTime: (window as any).__BUILD_TIME__
});

// Force reload if cache is stale
const lastBuildTime = localStorage.getItem('lastBuildTime');
const currentBuildTime = (window as any).__BUILD_TIME__;
if (lastBuildTime && lastBuildTime !== currentBuildTime) {
  console.log('🔄 Cache is stale, forcing reload...');
  localStorage.setItem('lastBuildTime', currentBuildTime);
  window.location.reload();
} else {
  localStorage.setItem('lastBuildTime', currentBuildTime);
}

// Register service worker and clear cache
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    console.log('🔄 Service Worker registered:', registration);
    
    // Clear cache on registration
    if (registration.active) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }
  }).catch((error) => {
    console.log('❌ Service Worker registration failed:', error);
  });
}

// Clear browser cache
if ('caches' in window) {
  caches.keys().then((cacheNames) => {
    return Promise.all(
      cacheNames.map((cacheName) => {
        console.log('🗑️ Deleting cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
  });
}



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