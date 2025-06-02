'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

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

  // Dropdown açıldığında butonun pozisyonunu hesapla
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      
      setDropdownPosition({
        top: rect.bottom + scrollY + 8, // 8px gap
        right: window.innerWidth - rect.right
      });
    }
  }, [isOpen]);

  // Browser notification izni iste
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
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

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead(user.id);
      console.log('Tüm bildirimler okundu olarak işaretlendi');
    } catch (error) {
      console.error('Tüm bildirimleri okundu işaretlerken hata:', error);
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
      store_approved: '✅',
      store_approval_revoked: '❌',
      system: 'ℹ️'
    };
    return icons[type] || '📢';
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Bildirimi okundu olarak işaretle
      await api.markNotificationAsRead(notification.id);
      
      // Bildirim tipine göre yönlendirme
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
      
    } catch (error) {
      console.error('Bildirim işlenirken hata:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="relative">
        {/* Bildirim İkonu */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-2xl bg-orange-100 backdrop-blur-sm hover:bg-orange-200 text-orange-500 hover:scale-105 transition-all duration-200 border border-orange-200"
          aria-label="Bildirimler"
          ref={buttonRef}
        >
          <FiBell className="h-5 w-5" />
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
      </div>

      {/* Notification Dropdown Portal - Portal ile body'ye taşınıyor */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[10002]" 
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="absolute w-80 sm:w-80 md:right-4 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-hidden"
            style={{
              top: `${dropdownPosition.top}px`,
              right: window.innerWidth < 768 ? '50%' : `${dropdownPosition.right}px`,
              transform: window.innerWidth < 768 ? 'translateX(50%)' : 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-orange-50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Bildirimler
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      {unreadCount} yeni
                    </span>
                  )}
                </h3>
                <div className="flex items-center space-x-2">
                  {/* Tümünü Okundu İşaretle */}
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                      className="text-xs text-orange-600 hover:text-orange-700 active:text-orange-800 font-medium transition-colors touch-manipulation"
                      title="Tümünü Okundu İşaretle"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  )}
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
                      className={`p-4 hover:bg-orange-50 active:bg-orange-100 cursor-pointer transition-colors touch-manipulation select-none ${
                        !notification.is_read ? 'bg-orange-50/50' : ''
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNotificationClick(notification);
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNotificationClick(notification);
                      }}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
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
              <div className="px-4 py-3 border-t border-gray-200 bg-orange-50">
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
        </div>,
        document.body
      )}

      {/* Toast Notification - Portal ile body'ye taşınıyor */}
      {currentToast && typeof window !== 'undefined' && createPortal(
        <ToastNotification
          notification={currentToast}
          onClose={() => setCurrentToast(null)}
          duration={8000}
        />,
        document.body
      )}
    </>
  );
};

export default NotificationDropdown; 