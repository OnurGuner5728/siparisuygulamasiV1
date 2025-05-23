'use client';

import { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiX, FiClock, FiShoppingBag, FiUsers, FiTruck, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useSupabaseRealtime';
import * as api from '@/lib/api';

const NotificationSystem = ({ userRole = 'user', storeId = null, showAll = false }) => {
  const { user, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState('all');
  
  // Real-time notifications hook
  const {
    data: notifications,
    loading,
    error: hookError,
    update: updateNotification,
    remove: removeNotification
  } = useNotifications(user?.id, {
    enabled: isAuthenticated && !!user?.id,
    onInsert: (newNotification) => {
      console.log('Yeni bildirim geldi:', newNotification);
      // Yeni bildirim geldiğinde ses çıkarabilir veya toast gösterebiliriz
    },
    onUpdate: (updatedNotification) => {
      console.log('Bildirim güncellendi:', updatedNotification);
    },
    onDelete: (deletedNotification) => {
      console.log('Bildirim silindi:', deletedNotification);
    }
  });

  // Bildirim türleri
  const notificationTypes = {
    order_confirmed: { icon: FiCheck, color: 'green', label: 'Sipariş Onaylandı' },
    order_preparing: { icon: FiClock, color: 'yellow', label: 'Hazırlanıyor' },
    order_shipped: { icon: FiTruck, color: 'blue', label: 'Kurye Yola Çıktı' },
    order_delivered: { icon: FiShoppingBag, color: 'green', label: 'Teslim Edildi' },
    order_cancelled: { icon: FiX, color: 'red', label: 'İptal Edildi' },
    new_order: { icon: FiBell, color: 'orange', label: 'Yeni Sipariş' },
    store_registered: { icon: FiUsers, color: 'blue', label: 'Yeni Mağaza Kaydı' },
    system: { icon: FiAlertCircle, color: 'gray', label: 'Sistem Bildirimi' }
  };

  // Filtrelenmiş bildirimleri hesapla
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true; // 'all'
  });

  // Okunmamış bildirim sayısı
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (notificationId) => {
    try {
      await api.markNotificationAsRead(notificationId);
      // Real-time hook otomatik güncelleme yapacak
    } catch (error) {
      console.error('Error marking notification as read:', error);
      alert('Bildirim okundu işaretlenirken hata oluştu.');
    }
  };

  const markAsUnread = async (notificationId) => {
    try {
      await api.markNotificationAsUnread(notificationId);
      // Real-time hook otomatik güncelleme yapacak
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      alert('Bildirim okunmadı işaretlenirken hata oluştu.');
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) return;
    
    try {
      await api.deleteNotification(notificationId);
      // Real-time hook otomatik güncelleme yapacak
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Bildirim silinirken hata oluştu.');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead(user.id);
      // Sayfayı yenile veya real-time güncellemesini bekle
      window.location.reload();
    } catch (error) {
      console.error('Error marking all as read:', error);
      alert('Bildirimler okundu işaretlenirken hata oluştu.');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR');
  };

  const NotificationCard = ({ notification }) => {
    const typeConfig = notificationTypes[notification.type] || notificationTypes.system;
    const IconComponent = typeConfig.icon;

    return (
      <div className={`border-l-4 ${notification.is_read ? 'bg-gray-50 border-gray-300' : 'bg-white border-' + typeConfig.color + '-500'} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200`}>
        <div className="flex items-start">
          <div className={`w-10 h-10 bg-${typeConfig.color}-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0`}>
            <IconComponent className={`text-${typeConfig.color}-600`} size={20} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className={`text-sm font-semibold ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                {notification.title}
              </h4>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {formatTime(notification.created_at)}
                </span>
                <button
                  onClick={() => notification.is_read ? markAsUnread(notification.id) : markAsRead(notification.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title={notification.is_read ? 'Okunmadı işaretle' : 'Okundu işaretle'}
                >
                  {notification.is_read ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Bildirimi sil"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>
            
            <p className={`text-sm ${notification.is_read ? 'text-gray-600' : 'text-gray-800'} mb-2`}>
              {notification.message}
            </p>
            
            {notification.data && Object.keys(notification.data).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {notification.data.order_id && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Sipariş: {notification.data.order_id}
                  </span>
                )}
                {notification.data.store_name && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    {notification.data.store_name}
                  </span>
                )}
                {notification.data.discount_code && (
                  <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                    Kod: {notification.data.discount_code}
                  </span>
                )}
                {notification.data.customer_name && (
                  <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    Müşteri: {notification.data.customer_name}
                  </span>
                )}
                {notification.data.amount && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    {notification.data.amount.toFixed(2)} TL
                  </span>
                )}
              </div>
            )}
          </div>
          
          {!notification.is_read && (
            <div className="w-2 h-2 bg-orange-500 rounded-full ml-2 flex-shrink-0"></div>
          )}
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <FiBell className="mx-auto text-gray-300 text-4xl mb-4" />
        <p className="text-gray-500">Bildirimleri görmek için giriş yapın</p>
      </div>
    );
  }

  if (hookError) {
    return (
      <div className="text-center py-8">
        <FiAlertCircle className="mx-auto text-red-300 text-4xl mb-4" />
        <h3 className="text-xl font-semibold text-red-600 mb-2">Bildirimler Yüklenemedi</h3>
        <p className="text-red-500 mb-4">{hookError.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FiBell className="text-2xl text-gray-700 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">
            Bildirimler
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </h2>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200"
          >
            Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {/* Real-time connection status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          Canlı güncelleme aktif
        </div>
        
        <div className="text-sm text-gray-500">
          Toplam {notifications.length} bildirim
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6">
        {[
          { key: 'all', label: 'Tümü' },
          { key: 'unread', label: 'Okunmamış' },
          { key: 'read', label: 'Okunmuş' }
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              filter === filterOption.key
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterOption.label}
            {filterOption.key === 'unread' && unreadCount > 0 && (
              <span className="ml-1 bg-white bg-opacity-30 text-orange-200 px-1 py-0.5 rounded-full text-xs">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-20"></div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <FiBell className="mx-auto text-gray-300 text-4xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {filter === 'unread' ? 'Okunmamış bildirim yok' : 
             filter === 'read' ? 'Okunmuş bildirim yok' : 'Henüz bildirim yok'}
          </h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Yeni bildirimler burada görünecek' 
              : 'Bu kategoride bildirim bulunmuyor'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationCard 
              key={notification.id} 
              notification={notification}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationSystem; 