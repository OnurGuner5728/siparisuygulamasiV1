'use client';
import { useCallback } from 'react';
import { useError } from '@/contexts/ErrorContext';

export function useErrorHandler() {
  const { logError, showError, showSuccess, showWarning, showInfo, handleNetworkError } = useError();

  // Async function wrapper with error handling
  const withErrorHandling = useCallback((asyncFn, options = {}) => {
    return async (...args) => {
      try {
        const result = await asyncFn(...args);
        
        // Success message if provided
        if (options.successMessage) {
          showSuccess(options.successMessage);
        }
        
        return result;
      } catch (error) {
        // Custom error message or default
        const errorMessage = options.errorMessage || 'İşlem gerçekleştirilemedi.';
        
        // Log error
        logError(error, { 
          function: asyncFn.name,
          args: options.logArgs ? args : undefined,
          ...options.context 
        });

        // Handle different error types
        if (error.response || error.request) {
          // Network error
          handleNetworkError(error, { 
            context: options.context,
            fallbackMessage: errorMessage 
          });
        } else {
          // Generic error
          showError(errorMessage);
        }

        // Re-throw if needed
        if (options.rethrow) {
          throw error;
        }

        return options.fallbackValue;
      }
    };
  }, [logError, showError, showSuccess, handleNetworkError]);

  // Promise wrapper with error handling
  const handlePromise = useCallback((promise, options = {}) => {
    return promise
      .then(result => {
        if (options.successMessage) {
          showSuccess(options.successMessage);
        }
        return result;
      })
      .catch(error => {
        const errorMessage = options.errorMessage || 'İşlem gerçekleştirilemedi.';
        
        logError(error, options.context);

        if (error.response || error.request) {
          handleNetworkError(error);
        } else {
          showError(errorMessage);
        }

        if (options.rethrow) {
          throw error;
        }

        return options.fallbackValue;
      });
  }, [logError, showError, showSuccess, handleNetworkError]);

  // Try-catch wrapper
  const tryCatch = useCallback((fn, options = {}) => {
    try {
      const result = fn();
      
      if (options.successMessage) {
        showSuccess(options.successMessage);
      }
      
      return result;
    } catch (error) {
      const errorMessage = options.errorMessage || 'İşlem gerçekleştirilemedi.';
      
      logError(error, options.context);
      showError(errorMessage);

      if (options.rethrow) {
        throw error;
      }

      return options.fallbackValue;
    }
  }, [logError, showError, showSuccess]);

  // Form validation error handler
  const handleValidationErrors = useCallback((errors) => {
    if (Array.isArray(errors)) {
      errors.forEach(error => showError(error));
    } else if (typeof errors === 'object') {
      Object.values(errors).forEach(error => {
        if (typeof error === 'string') {
          showError(error);
        } else if (Array.isArray(error)) {
          error.forEach(err => showError(err));
        }
      });
    } else if (typeof errors === 'string') {
      showError(errors);
    }
  }, [showError]);

  // API error helper
  const handleApiError = useCallback((error, customMessage) => {
    return handleNetworkError(error, { fallbackMessage: customMessage });
  }, [handleNetworkError]);

  // Network status checker
  const checkNetworkStatus = useCallback(() => {
    if (!navigator.onLine) {
      showWarning('İnternet bağlantınız yok. Lütfen bağlantınızı kontrol edin.');
      return false;
    }
    return true;
  }, [showWarning]);

  return {
    withErrorHandling,
    handlePromise,
    tryCatch,
    handleValidationErrors,
    handleApiError,
    checkNetworkStatus,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    logError
  };
}

export default useErrorHandler; 