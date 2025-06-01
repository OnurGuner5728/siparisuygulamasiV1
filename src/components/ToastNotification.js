'use client';

import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiBell, FiAlertCircle, FiTruck, FiShoppingBag, FiUsers, FiClock } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

const ToastNotification = ({ notification, onClose, duration = 6000 }) => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (notification) {
      // Smooth entrance animation
      setTimeout(() => setIsVisible(true), 100);
      
      // Auto close after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [notification, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose && onClose();
      }, 300);
    }, 150);
  };

  const handleToastClick = () => {
    try {
      // Bildirim tipine göre yönlendirme (NotificationDropdown'daki aynı mantık)
      if (notification.type === 'store_registered') {
        // Mağaza kayıt bildirimi - admin/stores sayfasına yönlendir
        window.location.href = '/admin/stores';
      } else if (notification.type === 'store_approved' || notification.type === 'store_approval_revoked') {
        // Mağaza onay bildirimi - mağaza paneline yönlendir (eğer store kullanıcısıysa)
        if (user?.role === 'store') {
          window.location.href = '/store';
        }
      } else if (notification.data?.order_id) {
        // Sipariş bildirimi - sipariş detayına yönlendir
        const orderId = notification.data.order_id;
        if (user?.role === 'store') {
          window.location.href = `/store/orders/${orderId}`;
        } else {
          window.location.href = `/profil/siparisler/${orderId}`;
        }
      }
      
      // Toast'ı kapat
      handleClose();
      
    } catch (error) {
      console.error('Toast bildirim işlenirken hata:', error);
    }
  };

  const getToastConfig = (type) => {
    const configs = {
      order_confirmed: {
        bg: 'bg-green-500',
        icon: FiCheck,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        emoji: '✅'
      },
      order_preparing: {
        bg: 'bg-yellow-500',
        icon: FiClock,
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        emoji: '👨‍🍳'
      },
      order_shipped: {
        bg: 'bg-blue-500',
        icon: FiTruck,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        emoji: '🚚'
      },
      order_delivered: {
        bg: 'bg-green-500',
        icon: FiShoppingBag,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        emoji: '📦'
      },
      order_cancelled: {
        bg: 'bg-red-500',
        icon: FiX,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        emoji: '❌'
      },
      new_order: {
        bg: 'bg-orange-500',
        icon: FiBell,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        emoji: '🔔'
      },
      store_registered: {
        bg: 'bg-purple-500',
        icon: FiUsers,
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        emoji: '🏪'
      },
      store_approved: {
        bg: 'bg-green-500',
        icon: FiCheck,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        emoji: '✅'
      },
      store_approval_revoked: {
        bg: 'bg-red-500',
        icon: FiX,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        emoji: '❌'
      },
      system: {
        bg: 'bg-gray-500',
        icon: FiAlertCircle,
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
        emoji: 'ℹ️'
      }
    };
    return configs[type] || configs.system;
  };

  if (!notification) return null;

  const config = getToastConfig(notification.type);
  const IconComponent = config.icon;

  return (
    <div className={`fixed top-4 right-4 left-4 sm:top-6 sm:right-6 sm:left-auto z-[9999] max-w-sm w-full sm:w-auto mx-auto sm:mx-0 transition-all duration-500 ease-out transform ${
      isVisible && !isExiting 
        ? 'translate-x-0 translate-y-0 opacity-100 scale-100' 
        : 'translate-x-full translate-y-4 opacity-0 scale-95'
    }`}>
      <div 
        className="relative bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm cursor-pointer hover:shadow-3xl transition-shadow duration-200"
        onClick={handleToastClick}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleToastClick();
        }}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {/* Colored top border */}
        <div className={`h-1 ${config.bg}`}></div>
        
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className={`flex-shrink-0 w-10 h-10 ${config.iconBg} rounded-full flex items-center justify-center`}>
              <span className="text-lg">{config.emoji}</span>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                    {notification.title}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {notification.message}
                  </p>
                  
                  {/* Additional info */}
                  {notification.data && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {notification.data.order_id && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                          #{notification.data.order_id.substring(0, 8)}
                        </span>
                      )}
                      {notification.data.store_name && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-md">
                          {notification.data.store_name}
                        </span>
                      )}
                      {notification.data.customer_name && (
                        <span className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-md">
                          {notification.data.customer_name}
                        </span>
                      )}
                      {notification.data.total_amount && (
                        <span className="inline-flex items-center px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-md">
                          {Number(notification.data.total_amount).toFixed(2)} TL
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tıklama ipucu */}
                  <div className="mt-2 text-xs text-gray-400 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    Detayları görmek için tıklayın
                  </div>
                </div>
                
                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Toast click'ini engelle
                    handleClose();
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Toast click'ini engelle
                    handleClose();
                  }}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors duration-200 rounded-full p-1 hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
                  aria-label="Bildirimi kapat"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div 
            className={`h-full ${config.bg} transition-all ease-linear progress-bar`}
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
        
        .line-clamp-3 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }
      `}</style>
    </div>
  );
};

// Toast Container - Multiple toasts'ları yönetmek için
export const ToastContainer = ({ toasts, onRemoveToast }) => {
  return (
    <div className="fixed top-6 right-6 z-[9999] space-y-3 pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            className="transition-all duration-300 ease-out"
            style={{ 
              transform: `translateY(${index * 8}px)`,
              zIndex: 9999 - index,
              marginBottom: index < toasts.length - 1 ? '12px' : '0'
            }}
          >
            <ToastNotification
              notification={toast}
              onClose={() => onRemoveToast(toast.id)}
              duration={6000}
            />
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @media (max-width: 640px) {
          .fixed {
            top: 1rem;
            right: 1rem;
            left: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ToastNotification; 