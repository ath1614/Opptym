// API Configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Base URL configuration - ensure /api prefix is always included
const getBaseURL = () => {
  // Use runtime detection like main.tsx - AGGRESSIVE CHECK
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
  
  // Force production API for opptym.com domain - AGGRESSIVE CHECK
  if (hostname === 'opptym.com' || hostname === 'www.opptym.com' || hostname.includes('opptym.com')) {
    console.log('🚨 API LIB: FORCING PRODUCTION API for domain:', hostname);
    return 'https://api.opptym.com/api';
  }
  
  // Check if we're in production environment
  if (window.location.protocol === 'https:' && !isLocalhost) {
    console.log('🚨 API LIB: FORCING PRODUCTION API for HTTPS production environment');
    return 'https://api.opptym.com/api';
  }
  
  if (isLocalhost) {
    console.log('🔧 API LIB: Using localhost API for development');
    return 'http://localhost:3000/api';
  } else {
    console.log('🚨 API LIB: FORCING PRODUCTION API as fallback');
    return 'https://api.opptym.com/api';
  }
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
export const apiRequest = async (endpoint: string, options: any = {}) => {
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
    
    // Handle rate limiting specifically
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
      
      console.log(`⏰ Rate limited. Waiting ${waitTime}ms before retry...`);
      
      // Wait and retry once
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Retry the request
      const retryResponse = await fetch(url, {
        ...options,
        headers,
      });
      
      if (retryResponse.ok) {
        return retryResponse.json();
      }
    }
    
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  return response.json();
};



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