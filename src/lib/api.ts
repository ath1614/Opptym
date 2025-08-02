// API Configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Base URL configuration
export const BASE_URL = isProduction 
  ? import.meta.env.VITE_API_URL || 'https://opptym-backend.onrender.com/api'
  : 'http://localhost:5050/api';

// API timeout
export const API_TIMEOUT = 30000; // 30 seconds

// API configuration
export const apiConfig = {
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to get auth headers
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API request wrapper
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const authHeaders = getAuthHeaders();
  const headers = {
    ...apiConfig.headers,
    ...authHeaders,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Environment info for debugging
console.log('🌍 Environment:', {
  isDevelopment,
  isProduction,
  baseURL: BASE_URL,
  apiUrl: import.meta.env.VITE_API_URL,
});

// 🔐 Auth
export const signup = (userData: { username: string; email: string; password: string }) =>
  apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify(userData) });

export const login = ({ email, password }: { email: string; password: string }) =>
  apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

// 📁 Projects
export const createProject = (data: Record<string, any>) =>
  apiRequest('/projects', { method: 'POST', body: JSON.stringify(data) });

export const getProjects = () =>
  apiRequest('/projects');

export const getProjectById = (id: string) =>
  apiRequest(`/projects/${id}`);

export const updateProject = (id: string, data: Record<string, any>) =>
  apiRequest(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteProject = (id: string) =>
  apiRequest(`/projects/${id}`, { method: 'DELETE' });

// 📤 Directory Submission
export const triggerSubmission = (projectId: string, siteName: string) =>
  apiRequest(`/automation/${projectId}/directory/${siteName}`, { method: 'POST' });

// 🛠️ Tool Runners
export const runMetaTagAnalyzer = (projectId: string) =>
  apiRequest(`/tools/${projectId}/run-meta`, { method: 'POST' });

export const runKeywordDensityAnalyzer = (projectId: string) =>
  apiRequest(`/tools/${projectId}/run-keyword-density`, { method: 'POST' });

export const runBrokenLinkChecker = (projectId: string) =>
  apiRequest(`/tools/${projectId}/run-broken-links`, { method: 'POST' });

export const runSitemapRobotsChecker = (projectId: string) =>
  apiRequest(`/tools/${projectId}/run-sitemap-robots`, { method: 'POST' });

export const runBacklinkScanner = (projectId: string) =>
  apiRequest(`/tools/${projectId}/run-backlinks`, { method: 'POST' });

export const runKeywordTracker = (projectId: string) =>
  apiRequest(`/tools/${projectId}/run-keyword-tracker`, { method: 'POST' });

export const runPageSpeedAnalyzer = (projectId: string) =>
  apiRequest(`/tools/${projectId}/run-speed`, { method: 'POST' });

export const runMobileAuditChecker = (projectId: string) =>
  apiRequest(`/tools/${projectId}/run-mobile-audit`, { method: 'POST' });

export const runCompetitorAnalyzer = (projectId: string) =>
  apiRequest(`/tools/${projectId}/run-competitors`, { method: 'POST' });

export const runTechnicalSeoAuditor = (projectId: string) =>
  apiRequest(`/tools/${projectId}/run-technical-audit`, { method: 'POST' });

export const runSchemaValidatorTool = (projectId: string) =>
  apiRequest(`/tools/${projectId}/run-schema`, { method: 'POST' });

export const runAltTextChecker = (projectId: string) =>
  apiRequest(`/tools/${projectId}/run-alt-text`, { method: 'POST' });

export const runCanonicalChecker = (projectId: string) =>
  apiRequest(`/tools/${projectId}/run-canonical`, { method: 'POST' });

export const runSeoScoreCalculator = (projectId: string) =>
  apiRequest(`/tools/${projectId}/run-seo-score`, { method: 'POST' });