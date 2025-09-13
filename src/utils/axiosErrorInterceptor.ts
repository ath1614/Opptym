import axios, { AxiosError, AxiosResponse } from 'axios';
import { ErrorHandler } from './errorHandler';

/**
 * Axios response interceptor for comprehensive error handling
 */
export const setupAxiosErrorInterceptor = () => {
  // Response interceptor for error handling
  axios.interceptors.response.use(
    (response: AxiosResponse) => {
      // Success response - just pass it through
      return response;
    },
    (error: AxiosError) => {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data as any;
        
        console.error('🚨 API Error:', {
          status,
          data,
          url: error.config?.url,
          method: error.config?.method
        });
        
        // Don't show popup for certain errors that are handled by components
        const handledByComponent = error.config?.headers?.['X-Handle-Error'] === 'component';
        
        if (!handledByComponent) {
          // Handle specific error types
          switch (status) {
            case 401:
              // Authentication error - handled by auth interceptor
              break;
            case 403:
              ErrorHandler.handlePermissionError(error);
              break;
            case 404:
              ErrorHandler.handleError(error, 'Resource Not Found');
              break;
            case 409:
              ErrorHandler.handleError(error, 'Conflict');
              break;
            case 422:
              ErrorHandler.handleValidationError(error);
              break;
            case 429:
              ErrorHandler.handleError(error, 'Rate Limit');
              break;
            case 500:
            case 502:
            case 503:
              ErrorHandler.handleApiError(error);
              break;
            default:
              ErrorHandler.handleError(error, 'API Request');
              break;
          }
        }
      } else if (error.request) {
        // Network error
        console.error('🚨 Network Error:', error.request);
        ErrorHandler.handleNetworkError(error);
      } else {
        // Other error
        console.error('🚨 Request Setup Error:', error.message);
        ErrorHandler.handleError(error, 'Request Setup');
      }
      
      return Promise.reject(error);
    }
  );
};

/**
 * Axios request interceptor for adding common headers
 */
export const setupAxiosRequestInterceptor = () => {
  axios.interceptors.request.use(
    (config) => {
      // Add timestamp to prevent caching
      config.params = {
        ...config.params,
        _t: Date.now()
      };
      
      // Add common headers
      config.headers = {
        ...config.headers,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      return config;
    },
    (error) => {
      console.error('🚨 Request Interceptor Error:', error);
      return Promise.reject(error);
    }
  );
};

/**
 * Setup all axios interceptors
 */
export const setupAxiosInterceptors = () => {
  setupAxiosRequestInterceptor();
  setupAxiosErrorInterceptor();
  
  console.log('✅ Axios interceptors setup complete');
};
