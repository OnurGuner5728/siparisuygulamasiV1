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
          setSettings(userSettings);
          console.log('✅ Kullanıcı ayarları yüklendi:', userSettings);
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

  const value = {
    settings,
    loading,
    updateSettings,
    updateSetting,
    getSetting,
    canReceiveNotification,
    // Kısayol fonksiyonlar
    isNotificationsEnabled: getSetting('notifications_enabled', true),
    theme: getSetting('theme', 'light'),
    language: getSetting('language', 'tr'),
    currency: getSetting('currency', 'TRY'),
    timezone: getSetting('timezone', 'Europe/Istanbul')
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}; 