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

  // Real-time notifications hook
  const {
    data: notifications,
    loading,
    error: hookError
  } = useNotifications(user?.id, {
    enabled: isAuthenticated && !!user?.id,
    limit: 10, // Daha fazla bildirim gösterelim
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
      }
    }
  });

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
      new_review: '⭐',
      review_response: '💬',
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
      
      // Popup'ı kapat
      setIsOpen(false);
      
      // Bildirim tipine göre yönlendirme
      if (notification.type === 'new_review') {
        // Yeni değerlendirme bildirimi - mağaza yorumlar sayfasına yönlendir
        if (user?.role === 'store') {
          window.location.href = '/store/yorumlar';
        } else {
          // Müşteri için uygun sayfa yok, ana sayfaya yönlendir
          window.location.href = '/';
        }
      } else if (notification.type === 'review_response') {
        // Yorum yanıt bildirimi
        if (notification.data?.review_id && notification.data?.store_id) {
          const reviewId = notification.data.review_id;
          const storeId = notification.data.store_id;
          
          // Kullanıcı rolüne göre yönlendirme
          if (user?.role === 'store') {
            // Mağaza sahibi - kendi yorumlar sayfasına git
            window.location.href = '/store/yorumlar';
          } else {
            // Müşteri - restoran sayfasındaki yorumlara git (kendi yorumunu ve cevabını görmek için)
            window.location.href = `/yemek/store/${storeId}#review-${reviewId}`;
          }
        } else {
          // Fallback - genel yorumlar sayfası
          if (user?.role === 'store') {
            window.location.href = '/store/yorumlar';
          } else {
            // Ana sayfaya yönlendir - genel değerlendirme sayfası yok
            window.location.href = '/';
          }
        }
      } else if (notification.type === 'new_review') {
        // Yeni yorum bildirimi - sadece mağaza sahipleri için
        if (user?.role === 'store' && notification.data?.review_id) {
          window.location.href = '/store/yorumlar';
        }
      } else if (notification.type === 'store_registered') {
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
        if (user?.role === 'store' && notification.type === 'new_order') {
          window.location.href = `/store/orders/${orderId}`;
        } else if (user?.role === 'store') {
          window.location.href = `/store/orders/${orderId}`;
        } else {
          window.location.href = `/profil/siparisler/${orderId}`;
        }
      }
      
    } catch (error) {
      console.error('Bildirim işlenirken hata:', error);
    }
  };

  // Popup dışına tıklandığında kapat
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const notificationModal = isOpen && (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[999999]"
      onClick={handleBackdropClick}
        >
          <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden mx-auto my-auto"
          >
            {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bildirimler</h2>
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} yeni bildirim` : 'Tüm bildirimler okundu'}
            </p>
          </div>
                <div className="flex items-center space-x-2">
                  {/* Tümünü Okundu İşaretle */}
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full transition-colors"
                      title="Tümünü Okundu İşaretle"
                    >
                <FiCheck className="w-4 h-4" />
                    </button>
                  )}
            {/* Kapat */}
            <button
                    onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
              </div>
            </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
              {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBell className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Henüz bildiriminiz yok</h3>
              <p className="text-gray-500">Siparişleriniz ve diğer güncellemeler burada görünecek</p>
                </div>
              ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                    <div
                      key={notification.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    !notification.is_read 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start">
                    <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                      <span className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                    </div>
                    
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                              {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatTime(notification.created_at)}
                            </span>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mt-2 leading-relaxed line-clamp-3">
                        {notification.message}
                      </p>
                      
                      {notification.type && (
                        <p className="text-gray-500 text-xs mt-2">
                          {notification.type === 'new_order' && 'Yeni Sipariş'}
                          {notification.type === 'order_confirmed' && 'Sipariş Onaylandı'}
                          {notification.type === 'order_preparing' && 'Sipariş Hazırlanıyor'}
                          {notification.type === 'order_shipped' && 'Sipariş Yola Çıktı'}
                          {notification.type === 'order_delivered' && 'Sipariş Teslim Edildi'}
                          {notification.type === 'order_cancelled' && 'Sipariş İptal Edildi'}
                          {notification.type === 'new_review' && 'Yeni Değerlendirme'}
                          {notification.type === 'review_response' && 'Yoruma Yanıt'}
                          {notification.type === 'store_registered' && 'Mağaza Kaydı'}
                          {notification.type === 'store_approved' && 'Mağaza Onaylandı'}
                          {notification.type === 'store_approval_revoked' && 'Mağaza Onayı İptal'}
                          {notification.type === 'system' && 'Sistem Bildirimi'}
                        </p>
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
          <div className="px-6 py-4 border-t border-gray-200 bg-orange-50">
                <Link
                  href="/profil/bildirimler"
              className="block text-center text-orange-600 hover:text-orange-700 text-sm font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Tüm Bildirimleri Gör ({notifications.length})
                </Link>
              </div>
            )}
          </div>
    </div>
  );

  return (
    <>
      {/* Bildirim İkonu */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-2xl bg-orange-100 backdrop-blur-sm hover:bg-orange-200 text-orange-500 hover:scale-105 transition-all duration-200 border border-orange-200"
        aria-label="Bildirimler"
      >
        <FiBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {/* Pulse animasyonu okunmamış bildirim varsa */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-5 w-5 animate-ping opacity-75"></span>
        )}
      </button>

      {/* Notification Modal - Portal ile body'ye taşınıyor */}
      {typeof window !== 'undefined' && createPortal(notificationModal, document.body)}

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