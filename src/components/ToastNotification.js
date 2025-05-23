'use client';

import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiBell, FiAlertCircle } from 'react-icons/fi';

const ToastNotification = ({ notification, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      
      // Auto close after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose && onClose();
        }, 300); // Animation duration
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [notification, duration, onClose]);

  const getToastStyle = (type) => {
    const styles = {
      order_confirmed: 'bg-green-500 border-green-600',
      order_preparing: 'bg-yellow-500 border-yellow-600',
      order_shipped: 'bg-blue-500 border-blue-600',
      order_delivered: 'bg-green-500 border-green-600',
      order_cancelled: 'bg-red-500 border-red-600',
      new_order: 'bg-orange-500 border-orange-600',
      store_registered: 'bg-purple-500 border-purple-600',
      system: 'bg-gray-500 border-gray-600'
    };
    return styles[type] || 'bg-blue-500 border-blue-600';
  };

  const getIcon = (type) => {
    const icons = {
      order_confirmed: <FiCheck className="w-5 h-5" />,
      order_preparing: <FiBell className="w-5 h-5" />,
      order_shipped: <FiBell className="w-5 h-5" />,
      order_delivered: <FiCheck className="w-5 h-5" />,
      order_cancelled: <FiX className="w-5 h-5" />,
      new_order: <FiBell className="w-5 h-5" />,
      store_registered: <FiBell className="w-5 h-5" />,
      system: <FiAlertCircle className="w-5 h-5" />
    };
    return icons[type] || <FiBell className="w-5 h-5" />;
  };

  if (!notification) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 ${getToastStyle(notification.type)} overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className={`flex-shrink-0 text-white`}>
              {getIcon(notification.type)}
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {notification.message}
              </p>
              {notification.data?.order_id && (
                <p className="mt-1 text-xs text-gray-400">
                  Sipariş No: {notification.data.order_id}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => {
                    onClose && onClose();
                  }, 300);
                }}
              >
                <span className="sr-only">Kapat</span>
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className={`h-full ${getToastStyle(notification.type)} transition-all ease-linear`}
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

// Toast Container - Multiple toasts'ları yönetmek için
export const ToastContainer = ({ toasts, onRemoveToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          style={{ 
            transform: `translateY(${index * 10}px)`,
            zIndex: 50 - index 
          }}
        >
          <ToastNotification
            notification={toast}
            onClose={() => onRemoveToast(toast.id)}
            duration={5000}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastNotification; 