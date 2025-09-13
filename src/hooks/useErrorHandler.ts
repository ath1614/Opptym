import { useCallback } from 'react';
import { 
  handleError, 
  handleAuthError, 
  handleValidationError, 
  handleNetworkError, 
  handleApiError, 
  handleFormError, 
  handleFileError, 
  handlePermissionError 
} from '../utils/errorHandler';

export const useErrorHandler = () => {
  const handleErrorCallback = useCallback((error: any, context?: string) => {
    handleError(error, context);
  }, []);

  const handleAuthErrorCallback = useCallback((error: any) => {
    handleAuthError(error);
  }, []);

  const handleValidationErrorCallback = useCallback((error: any, context?: string) => {
    handleValidationError(error, context);
  }, []);

  const handleNetworkErrorCallback = useCallback((error: any, context?: string) => {
    handleNetworkError(error, context);
  }, []);

  const handleApiErrorCallback = useCallback((error: any, retryCallback?: () => void, context?: string) => {
    handleApiError(error, retryCallback, context);
  }, []);

  const handleFormErrorCallback = useCallback((error: any, formName?: string) => {
    handleFormError(error, formName);
  }, []);

  const handleFileErrorCallback = useCallback((error: any) => {
    handleFileError(error);
  }, []);

  const handlePermissionErrorCallback = useCallback((error: any, action?: string) => {
    handlePermissionError(error, action);
  }, []);

  return {
    handleError: handleErrorCallback,
    handleAuthError: handleAuthErrorCallback,
    handleValidationError: handleValidationErrorCallback,
    handleNetworkError: handleNetworkErrorCallback,
    handleApiError: handleApiErrorCallback,
    handleFormError: handleFormErrorCallback,
    handleFileError: handleFileErrorCallback,
    handlePermissionError: handlePermissionErrorCallback
  };
};

export default useErrorHandler;
