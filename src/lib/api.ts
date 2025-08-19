// API Configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Base URL configuration - ensure /api prefix is always included
const getBaseURL = () => {
  if (isProduction) {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://api.opptym.com';
    // Ensure the URL ends with /api and doesn't have double slashes
    const cleanApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    return cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`;
  }
  return 'http://localhost:3000/api';
};

export const BASE_URL = getBaseURL();

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
  // Ensure endpoint starts with / and base URL doesn't end with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const cleanBaseURL = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const url = `${cleanBaseURL}${cleanEndpoint}`;
  
  const authHeaders = getAuthHeaders();
  const headers = {
    ...apiConfig.headers,
    ...authHeaders,
    ...options.headers,
  };

  console.log('🌐 API Request:', {
    url,
    method: options.method || 'GET',
    endpoint: cleanEndpoint,
    baseURL: cleanBaseURL,
    isProduction,
    viteApiUrl: import.meta.env.VITE_API_URL,
    body: options.body
  });

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Try to get the error response body
    let errorBody = '';
    try {
      errorBody = await response.text();
    } catch (e) {
      errorBody = 'Could not read error response';
    }
    
    console.error('❌ API Error:', {
      status: response.status,
      statusText: response.statusText,
      url,
      method: options.method || 'GET',
      errorBody,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
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

// 🔐 Auth - OTP-based authentication is handled in useAuth.ts
// Legacy auth functions removed - use OTP endpoints instead

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

export const runKeywordResearcher = (projectId: string, seedKeyword?: string) =>
  apiRequest(`/tools/${projectId}/run-keyword-research`, { 
    method: 'POST', 
    body: JSON.stringify({ seedKeyword }) 
  });