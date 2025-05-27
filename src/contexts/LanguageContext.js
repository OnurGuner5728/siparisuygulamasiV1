'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Dil çevirileri
const translations = {
  tr: {
    common: {
      loading: 'Yükleniyor...',
      save: 'Kaydet',
      cancel: 'İptal',
      delete: 'Sil',
      edit: 'Düzenle',
      view: 'Görüntüle',
      back: 'Geri',
      next: 'İleri',
      previous: 'Önceki',
      close: 'Kapat',
      yes: 'Evet',
      no: 'Hayır',
      search: 'Ara...',
      filter: 'Filtrele',
      sort: 'Sırala',
      clear: 'Temizle',
      apply: 'Uygula',
      reset: 'Sıfırla',
      submit: 'Gönder',
      confirm: 'Onayla',
      success: 'Başarılı',
      error: 'Hata',
      warning: 'Uyarı',
      info: 'Bilgi'
    },
    navigation: {
      home: 'Ana Sayfa',
      stores: 'Mağazalar',
      categories: 'Kategoriler',
      profile: 'Profil',
      cart: 'Sepet',
      orders: 'Siparişler',
      favorites: 'Favoriler',
      settings: 'Ayarlar',
      logout: 'Çıkış Yap',
      login: 'Giriş Yap',
      register: 'Kayıt Ol'
    },
    profile: {
      myProfile: 'Profilim',
      myOrders: 'Siparişlerim',
      myAddresses: 'Adreslerim',
      myFavorites: 'Favorilerim',
      paymentMethods: 'Ödeme Yöntemlerim',
      accountSettings: 'Hesap Ayarları'
    },
    orders: {
      orderStatus: {
        pending: 'Beklemede',
        processing: 'Hazırlanıyor',
        shipped: 'Yolda',
        delivered: 'Teslim Edildi',
        cancelled: 'İptal Edildi'
      },
      orderDetails: 'Sipariş Detayları',
      orderHistory: 'Sipariş Geçmişi',
      trackOrder: 'Siparişi Takip Et'
    },
    notifications: {
      newOrder: 'Yeni Sipariş',
      orderStatusChanged: 'Sipariş Durumu Değişti',
      orderDelivered: 'Siparişiniz Teslim Edildi',
      orderCancelled: 'Siparişiniz İptal Edildi'
    },
    settings: {
      general: 'Genel',
      notifications: 'Bildirimler',
      privacy: 'Gizlilik',
      security: 'Güvenlik',
      appearance: 'Görünüm',
      language: 'Dil & Bölge',
      theme: 'Tema',
      currency: 'Para Birimi',
      timezone: 'Saat Dilimi'
    }
  },
  en: {
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      yes: 'Yes',
      no: 'No',
      search: 'Search...',
      filter: 'Filter',
      sort: 'Sort',
      clear: 'Clear',
      apply: 'Apply',
      reset: 'Reset',
      submit: 'Submit',
      confirm: 'Confirm',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info'
    },
    navigation: {
      home: 'Home',
      stores: 'Stores',
      categories: 'Categories',
      profile: 'Profile',
      cart: 'Cart',
      orders: 'Orders',
      favorites: 'Favorites',
      settings: 'Settings',
      logout: 'Logout',
      login: 'Login',
      register: 'Register'
    },
    profile: {
      myProfile: 'My Profile',
      myOrders: 'My Orders',
      myAddresses: 'My Addresses',
      myFavorites: 'My Favorites',
      paymentMethods: 'Payment Methods',
      accountSettings: 'Account Settings'
    },
    orders: {
      orderStatus: {
        pending: 'Pending',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled'
      },
      orderDetails: 'Order Details',
      orderHistory: 'Order History',
      trackOrder: 'Track Order'
    },
    notifications: {
      newOrder: 'New Order',
      orderStatusChanged: 'Order Status Changed',
      orderDelivered: 'Your Order has been Delivered',
      orderCancelled: 'Your Order has been Cancelled'
    },
    settings: {
      general: 'General',
      notifications: 'Notifications',
      privacy: 'Privacy',
      security: 'Security',
      appearance: 'Appearance',
      language: 'Language & Region',
      theme: 'Theme',
      currency: 'Currency',
      timezone: 'Timezone'
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const { user } = useAuth();
  const { getSetting } = useSettings();
  const [currentLanguage, setCurrentLanguage] = useState('tr');
  const [loading, setLoading] = useState(true);

  // Kullanıcı ayarlarından dil yükle
  useEffect(() => {
    const loadLanguage = () => {
      if (user) {
        const userLanguage = getSetting('language', 'tr');
        setCurrentLanguage(userLanguage);
      } else {
        // Kullanıcı giriş yapmamışsa localStorage'dan yükle
        const savedLanguage = localStorage.getItem('language') || 'tr';
        setCurrentLanguage(savedLanguage);
      }
      setLoading(false);
    };

    loadLanguage();
  }, [user, getSetting]);

  // Çeviri fonksiyonu
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (!value) {
      console.warn(`Translation missing for key: ${key} in language: ${currentLanguage}`);
      return key;
    }
    
    // Parametreleri değiştir
    let result = value;
    Object.keys(params).forEach(param => {
      result = result.replace(`{${param}}`, params[param]);
    });
    
    return result;
  };

  // Dil değiştirme
  const changeLanguage = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    
    // Kullanıcı yoksa localStorage'a kaydet
    if (!user) {
      localStorage.setItem('language', newLanguage);
    }
    
    // HTML lang attribute'unu güncelle
    document.documentElement.lang = newLanguage;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    loading,
    availableLanguages: [
      { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 