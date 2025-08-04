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
  if (isProduction) {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://opptym-backend.onrender.com';
    // For axios, we want the base URL without /api since endpoints will be added directly
    return apiUrl.endsWith('/api') ? apiUrl.replace('/api', '') : apiUrl;
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