'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '@/lib/api';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kullanıcı ayarlarını yükle
  useEffect(() => {
    const loadUserSettings = async () => {
      if (user) {
        try {
          setLoading(true);
          const userSettings = await api.getUserSettings(user.id);
          console.log('✅ Kullanıcı ayarları yüklendi:', userSettings);
          setSettings(userSettings);
        } catch (error) {
          console.error('❌ Kullanıcı ayarları yüklenirken hata:', error);
          setSettings(null);
        }
      } else {
        setSettings(null);
      }
      setLoading(false);
    };

    loadUserSettings();
  }, [user]);

  // Ayarları güncelle
  const updateSettings = async (newSettings) => {
    if (!user) {
      console.warn('⚠️ Kullanıcı giriş yapmamış, ayarlar güncellenemiyor');
      return;
    }

    try {
      const updatedSettings = await api.updateUserSettings(user.id, newSettings);
      setSettings(updatedSettings);
      console.log('✅ Ayarlar güncellendi:', newSettings);
      return updatedSettings;
    } catch (error) {
      console.error('❌ Ayarlar güncellenirken hata:', error);
      throw error;
    }
  };

  // Belirli bir ayarı güncelle
  const updateSetting = async (key, value) => {
    return updateSettings({ [key]: value });
  };

  // Ayar değerini al
  const getSetting = (key, defaultValue = null) => {
    return settings?.[key] ?? defaultValue;
  };

  // Bildirim ayarlarını kontrol et
  const canReceiveNotification = (notificationType) => {
    if (!settings?.notifications_enabled) return false;
    
    switch (notificationType) {
      case 'email':
        return settings.email_notifications;
      case 'sms':
        return settings.sms_notifications;
      case 'push':
        return settings.push_notifications;
      case 'marketing':
        return settings.marketing_emails;
      case 'order':
        return settings.order_updates;
      case 'promo':
        return settings.promo_notifications;
      default:
        return true;
    }
  };

  // Güvenlik ayarlarını kontrol et
  const getSecurityLevel = () => {
    if (!settings) return 'low';
    
    let score = 0;
    if (settings.two_factor_enabled) score += 3;
    if (settings.login_notifications) score += 1;
    if (settings.session_timeout < 60) score += 1;
    
    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  };

  const value = {
    settings,
    loading,
    updateSettings,
    updateSetting,
    getSetting,
    canReceiveNotification,
    getSecurityLevel,
    // Kısayol fonksiyonlar ve varsayılan değerler
    isNotificationsEnabled: getSetting('notifications_enabled', true),
    theme: getSetting('theme', 'light'),
    language: getSetting('language', 'tr'),
    currency: getSetting('currency', 'TRY'),
    timezone: getSetting('timezone', 'Europe/Istanbul'),
    emailNotifications: getSetting('email_notifications', true),
    smsNotifications: getSetting('sms_notifications', false),
    pushNotifications: getSetting('push_notifications', true),
    marketingEmails: getSetting('marketing_emails', false),
    orderUpdates: getSetting('order_updates', true),
    promoNotifications: getSetting('promo_notifications', true),
    twoFactorEnabled: getSetting('two_factor_enabled', false),
    loginNotifications: getSetting('login_notifications', true),
    sessionTimeout: getSetting('session_timeout', 30)
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}; 