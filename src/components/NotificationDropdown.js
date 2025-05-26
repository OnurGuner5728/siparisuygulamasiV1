'use client';

import { useState, useEffect, useRef } from 'react';
import { FiBell, FiCheck, FiX, FiEye, FiSettings } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useSupabaseRealtime';
import ToastNotification from './ToastNotification';
import * as api from '@/lib/api';

const NotificationDropdown = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentToast, setCurrentToast] = useState(null);
  const dropdownRef = useRef(null);

  // Real-time notifications hook
  const {
    data: notifications,
    loading,
    error: hookError
  } = useNotifications(user?.id, {
    enabled: isAuthenticated && !!user?.id,
    limit: 5, // Sadece son 5 bildirimi göster
    onInsert: (newNotification) => {
      console.log('Yeni bildirim geldi:', newNotification);
      
      // Toast bildirimi göster (sadece kendi kullanıcımızın bildirimi ise)
      if (newNotification.user_id === user?.id) {
        setCurrentToast(newNotification);
        
        // Browser notification API (eğer izin varsa)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png'
          });
        }
        
        // İsteğe bağlı: Ses çalma
        // const audio = new Audio('/notification-sound.mp3');
        // audio.play().catch(console.error);
      }
    }
  });

  // Browser notification izni iste
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Okunmamış bildirim sayısı
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (notificationId) => {
    try {
      await api.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes}dk`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}sa`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}g`;
  };

  const getNotificationIcon = (type) => {
    const icons = {
      order_confirmed: '✅',
      order_preparing: '👨‍🍳',
      order_shipped: '🚚',
      order_delivered: '📦',
      order_cancelled: '❌',
      new_order: '🔔',
      store_registered: '🏪',
      system: 'ℹ️'
    };
    return icons[type] || '📢';
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Bildirim İkonu */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-600 hover:text-orange-500 focus:outline-none focus:text-orange-500 transition-colors"
          aria-label="Bildirimler"
        >
          <FiBell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          {/* Pulse animasyonu okunmamış bildirim varsa */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-5 w-5 animate-ping"></span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-80 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Bildirimler
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      {unreadCount} yeni
                    </span>
                  )}
                </h3>
                <div className="flex items-center space-x-2">
                  {/* Tümünü Gör */}
                  <Link
                    href="/profil/bildirimler"
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Tümünü Gör
                  </Link>
                </div>
              </div>
            </div>

            {/* Bildirim Listesi */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Bildirimler yükleniyor...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <FiBell className="mx-auto text-gray-300 text-3xl mb-2" />
                  <p className="text-sm text-gray-500">Henüz bildiriminiz yok</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-lg flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium truncate ${
                              !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {formatTime(notification.created_at)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <Link
                  href="/profil/bildirimler"
                  className="block text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Tüm Bildirimleri Gör ({notifications.length})
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {currentToast && (
        <ToastNotification
          notification={currentToast}
          onClose={() => setCurrentToast(null)}
          duration={6000}
        />
      )}
    </>
  );
};

export default NotificationDropdown; 