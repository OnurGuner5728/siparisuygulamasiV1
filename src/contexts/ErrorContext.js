'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const ErrorContext = createContext();

export function ErrorProvider({ children }) {
  const [errors, setErrors] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Error kaydetme
  const logError = useCallback((error, context = {}) => {
    const errorObj = {
      id: Date.now() + Math.random(),
      message: error.message || 'Bilinmeyen hata',
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      type: 'error'
    };

    setErrors(prev => [...prev.slice(-9), errorObj]); // Son 10 hatayı tut

    // Development'ta console'a log
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorObj);
    }

    // Future: Send to error tracking service
    // sendToErrorService(errorObj);

    return errorObj.id;
  }, []);

  // Kullanıcı dostu notification gösterme
  const showError = useCallback((message, options = {}) => {
    const notification = {
      id: Date.now() + Math.random(),
      message,
      type: 'error',
      timestamp: new Date().toISOString(),
      duration: options.duration || 5000,
      ...options
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove
    if (notification.duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }

    return notification.id;
  }, []);

  // Success notification
  const showSuccess = useCallback((message, options = {}) => {
    const notification = {
      id: Date.now() + Math.random(),
      message,
      type: 'success',
      timestamp: new Date().toISOString(),
      duration: options.duration || 3000,
      ...options
    };

    setNotifications(prev => [...prev, notification]);

    if (notification.duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }

    return notification.id;
  }, []);

  // Warning notification
  const showWarning = useCallback((message, options = {}) => {
    const notification = {
      id: Date.now() + Math.random(),
      message,
      type: 'warning',
      timestamp: new Date().toISOString(),
      duration: options.duration || 4000,
      ...options
    };

    setNotifications(prev => [...prev, notification]);

    if (notification.duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }

    return notification.id;
  }, []);

  // Info notification
  const showInfo = useCallback((message, options = {}) => {
    const notification = {
      id: Date.now() + Math.random(),
      message,
      type: 'info',
      timestamp: new Date().toISOString(),
      duration: options.duration || 3000,
      ...options
    };

    setNotifications(prev => [...prev, notification]);

    if (notification.duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }

    return notification.id;
  }, []);

  // Notification kaldırma
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Tüm notification'ları temizle
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Error'ları temizle
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Network error handler
  const handleNetworkError = useCallback((error, request = {}) => {
    const errorMessage = error.response?.data?.message || error.message;
    const statusCode = error.response?.status;

    // Specific error messages based on status
    let userMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';
    
    if (statusCode === 401) {
      userMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
    } else if (statusCode === 403) {
      userMessage = 'Bu işlem için yetkiniz bulunmuyor.';
    } else if (statusCode === 404) {
      userMessage = 'Aradığınız sayfa bulunamadı.';
    } else if (statusCode === 500) {
      userMessage = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
    } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
      userMessage = 'İnternet bağlantınızı kontrol edin.';
    }

    // Log error
    logError(error, { 
      type: 'network', 
      statusCode, 
      url: request.url,
      method: request.method 
    });

    // Show user notification
    showError(userMessage);

    return { userMessage, errorId: Date.now() };
  }, [logError, showError]);

  const value = {
    errors,
    notifications,
    logError,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    removeNotification,
    clearNotifications,
    clearErrors,
    handleNetworkError
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

export default ErrorContext; 