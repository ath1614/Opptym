import { showPopup, showConfirmPopup } from './popup';

export interface ErrorDetails {
  message: string;
  status?: number;
  code?: string;
  details?: any;
  fieldErrors?: any;
  timestamp?: string;
}

export class ErrorHandler {
  /**
   * Handle all types of errors with comprehensive error messages
   */
  static handleError(error: any, context?: string): void {
    console.error(`🚨 Error in ${context || 'Unknown context'}:`, error);

    const errorDetails = this.parseError(error);
    const userMessage = this.generateUserMessage(errorDetails, context);
    
    // Show error popup with detailed information
    showPopup(userMessage, 'error', 8000);
  }

  /**
   * Parse different types of errors into a standardized format
   */
  private static parseError(error: any): ErrorDetails {
    const timestamp = new Date().toLocaleString();
    
    // Axios error
    if (error.response) {
      return {
        message: error.response.data?.error || error.response.data?.message || 'Request failed',
        status: error.response.status,
        code: error.response.data?.code || error.code,
        details: error.response.data?.details,
        fieldErrors: error.response.data?.fieldErrors,
        timestamp
      };
    }
    
    // Network error
    if (error.request) {
      return {
        message: 'Network error - unable to connect to server',
        code: 'NETWORK_ERROR',
        details: 'Please check your internet connection and try again',
        timestamp
      };
    }
    
    // JavaScript error
    if (error.message) {
      return {
        message: error.message,
        code: error.name || 'JAVASCRIPT_ERROR',
        details: error.stack,
        timestamp
      };
    }
    
    // Unknown error
    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: error,
      timestamp
    };
  }

  /**
   * Generate user-friendly error messages based on error type
   */
  private static generateUserMessage(errorDetails: ErrorDetails, context?: string): string {
    const { message, status, code, details, fieldErrors } = errorDetails;
    
    let userMessage = '';
    
    // HTTP Status Code based messages
    switch (status) {
      case 400:
        if (fieldErrors) {
          userMessage = `Validation Error:\n${this.formatFieldErrors(fieldErrors)}`;
        } else if (message.includes('already exists')) {
          userMessage = message;
        } else {
          userMessage = `Invalid Request: ${message}`;
        }
        break;
        
      case 401:
        userMessage = `Authentication Error: Your session has expired. Please log in again.`;
        break;
        
      case 403:
        userMessage = `Access Denied: You don't have permission to perform this action.`;
        break;
        
      case 404:
        userMessage = `Not Found: The requested resource could not be found.`;
        break;
        
      case 409:
        userMessage = `Conflict: ${message}`;
        break;
        
      case 422:
        userMessage = `Validation Error: ${message}`;
        if (fieldErrors) {
          userMessage += `\n\nDetails:\n${this.formatFieldErrors(fieldErrors)}`;
        }
        break;
        
      case 429:
        userMessage = `Rate Limit Exceeded: Too many requests. Please wait a moment and try again.`;
        break;
        
      case 500:
        userMessage = `Server Error: Something went wrong on our end. Please try again later.`;
        break;
        
      case 502:
        userMessage = `Bad Gateway: The server is temporarily unavailable. Please try again later.`;
        break;
        
      case 503:
        userMessage = `Service Unavailable: The server is temporarily down for maintenance.`;
        break;
        
      default:
        // Network and other errors
        if (code === 'NETWORK_ERROR') {
          userMessage = `Network Error: Unable to connect to the server. Please check your internet connection.`;
        } else if (code === 'TIMEOUT') {
          userMessage = `Request Timeout: The server is taking too long to respond. Please try again.`;
        } else if (code === 'CANCELED') {
          userMessage = `Request Canceled: The operation was canceled.`;
        } else {
          userMessage = message || 'An unexpected error occurred. Please try again.';
        }
        break;
    }
    
    // Add context if provided
    if (context) {
      userMessage = `${context}: ${userMessage}`;
    }
    
    // Add helpful suggestions based on error type
    userMessage += this.getHelpfulSuggestions(status, code);
    
    return userMessage;
  }

  /**
   * Format field validation errors for display
   */
  private static formatFieldErrors(fieldErrors: any): string {
    if (typeof fieldErrors === 'object') {
      return Object.entries(fieldErrors)
        .map(([field, error]: [string, any]) => `• ${field}: ${error.message || error}`)
        .join('\n');
    }
    return fieldErrors.toString();
  }

  /**
   * Get helpful suggestions based on error type
   */
  private static getHelpfulSuggestions(status?: number, code?: string): string {
    switch (status) {
      case 400:
        return '\n\n💡 Tip: Please check all required fields and try again.';
      case 401:
        return '\n\n💡 Tip: Try logging out and logging back in.';
      case 403:
        return '\n\n💡 Tip: Contact support if you believe this is an error.';
      case 404:
        return '\n\n💡 Tip: The resource may have been moved or deleted.';
      case 429:
        return '\n\n💡 Tip: Wait a few minutes before trying again.';
      case 500:
        return '\n\n💡 Tip: If the problem persists, contact support.';
      default:
        if (code === 'NETWORK_ERROR') {
          return '\n\n💡 Tip: Check your internet connection and try again.';
        }
        return '\n\n💡 Tip: If the problem persists, contact support.';
    }
  }

  /**
   * Handle authentication errors specifically
   */
  static handleAuthError(error: any): void {
    const errorDetails = this.parseError(error);
    
    if (errorDetails.status === 401) {
      showConfirmPopup(
        'Your session has expired. Would you like to log in again?',
        () => {
          // Clear local storage and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.hash = '#login';
        },
        () => {
          // User chose not to log in
          showPopup('You will need to log in to continue using the application.', 'warning');
        }
      );
    } else {
      this.handleError(error, 'Authentication');
    }
  }

  /**
   * Handle validation errors specifically
   */
  static handleValidationError(error: any, context?: string): void {
    const errorDetails = this.parseError(error);
    
    if (errorDetails.fieldErrors) {
      const fieldErrors = this.formatFieldErrors(errorDetails.fieldErrors);
      showPopup(
        `Validation Error${context ? ` in ${context}` : ''}:\n\n${fieldErrors}`,
        'error',
        10000
      );
    } else {
      this.handleError(error, context || 'Validation');
    }
  }

  /**
   * Handle network errors specifically
   */
  static handleNetworkError(error: any, context?: string): void {
    const errorDetails = this.parseError(error);
    
    if (errorDetails.code === 'NETWORK_ERROR') {
      showConfirmPopup(
        'Unable to connect to the server. Would you like to retry?',
        () => {
          // Retry the operation (this would need to be passed as a callback)
          showPopup('Retrying...', 'info', 2000);
        },
        () => {
          showPopup('Operation canceled. Please check your connection and try again later.', 'warning');
        }
      );
    } else {
      this.handleError(error, context || 'Network');
    }
  }

  /**
   * Handle API errors with retry option
   */
  static handleApiError(error: any, retryCallback?: () => void, context?: string): void {
    const errorDetails = this.parseError(error);
    
    if (errorDetails.status && errorDetails.status >= 500) {
      // Server errors - offer retry
      showConfirmPopup(
        `Server Error${context ? ` in ${context}` : ''}. Would you like to retry?`,
        () => {
          if (retryCallback) {
            retryCallback();
          } else {
            showPopup('Please refresh the page and try again.', 'info');
          }
        },
        () => {
          showPopup('Operation canceled. Please try again later.', 'warning');
        }
      );
    } else {
      this.handleError(error, context);
    }
  }

  /**
   * Handle form submission errors
   */
  static handleFormError(error: any, formName?: string): void {
    const errorDetails = this.parseError(error);
    
    if (errorDetails.status === 400 && errorDetails.fieldErrors) {
      this.handleValidationError(error, formName || 'Form');
    } else if (errorDetails.status === 409) {
      showPopup(
        `Conflict: ${errorDetails.message}\n\nThis usually means the data already exists.`,
        'warning',
        8000
      );
    } else {
      this.handleError(error, formName || 'Form Submission');
    }
  }

  /**
   * Handle file upload errors
   */
  static handleFileError(error: any): void {
    const errorDetails = this.parseError(error);
    
    if (errorDetails.message.includes('size')) {
      showPopup(
        'File too large. Please choose a smaller file.',
        'error'
      );
    } else if (errorDetails.message.includes('type')) {
      showPopup(
        'Invalid file type. Please choose a supported file format.',
        'error'
      );
    } else {
      this.handleError(error, 'File Upload');
    }
  }

  /**
   * Handle permission errors
   */
  static handlePermissionError(error: any, action?: string): void {
    const errorDetails = this.parseError(error);
    
    if (errorDetails.status === 403) {
      showPopup(
        `Access Denied: You don't have permission to ${action || 'perform this action'}.\n\nPlease contact your administrator if you believe this is an error.`,
        'error',
        10000
      );
    } else {
      this.handleError(error, 'Permission');
    }
  }
}

// Export convenience functions
export const handleError = ErrorHandler.handleError.bind(ErrorHandler);
export const handleAuthError = ErrorHandler.handleAuthError.bind(ErrorHandler);
export const handleValidationError = ErrorHandler.handleValidationError.bind(ErrorHandler);
export const handleNetworkError = ErrorHandler.handleNetworkError.bind(ErrorHandler);
export const handleApiError = ErrorHandler.handleApiError.bind(ErrorHandler);
export const handleFormError = ErrorHandler.handleFormError.bind(ErrorHandler);
export const handleFileError = ErrorHandler.handleFileError.bind(ErrorHandler);
export const handlePermissionError = ErrorHandler.handlePermissionError.bind(ErrorHandler);
