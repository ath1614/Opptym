import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import axios from 'axios';

// API Configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

const getAxiosBaseURL = () => {
  // Check if VITE_API_URL is set (this indicates deployed backend preference)
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (apiUrl) {
    // VITE_API_URL is set, use it (remove /api suffix if present)
    return apiUrl.endsWith('/api') ? apiUrl.replace('/api', '') : apiUrl;
  }
  
      // Fallback: use localhost in development, deployed URL in production
    if (isProduction) {
      return 'http://zc4ck4k48gwk0wko44gosgs4.77.37.44.119.sslip.io';
    }
  return 'http://localhost:5050';
};

const axiosBaseURL = getAxiosBaseURL();
axios.defaults.baseURL = axiosBaseURL;

// Debug logging
console.log('🚀 App Startup:', {
  isDevelopment,
  isProduction,
  axiosBaseURL,
  viteApiUrl: import.meta.env.VITE_API_URL,
  nodeEnv: import.meta.env.MODE,
  version: '1.0.1-cache-bust'
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);