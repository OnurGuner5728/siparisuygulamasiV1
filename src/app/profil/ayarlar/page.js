'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useSettings } from '../../../contexts/SettingsContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import AuthGuard from '../../../components/AuthGuard';
import ProfileSidebar from '../../../components/ProfileSidebar';
import { 
  FiSettings, 
  FiBell, 
  FiShield, 
  FiGlobe, 
  FiMoon, 
  FiSun, 
  FiMonitor,
  FiMail,
  FiSmartphone,
  FiSave,
  FiRefreshCw
} from 'react-icons/fi';
import api from '@/lib/api';

export default function SettingsPage() {
  return (
    <AuthGuard requiredRole="any_auth">
      <SettingsContent />
    </AuthGuard>
  );
}

function SettingsContent() {
  const { user } = useAuth();
  const { settings, loading, updateSettings, updateSetting } = useSettings();
  const { theme, changeTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('notifications');

  // Ayar değişikliklerini işle
  const handleSettingChange = async (key, value) => {
    try {
      setSaving(true);
      console.log('💾 Ayar güncelleniyor:', key, value);
      
      // Özel işlemler
      if (key === 'theme') {
        await changeTheme(value);
      } else {
        await updateSetting(key, value);
      }
      
      console.log('✅ Ayar güncellendi:', key);
      
      // Toast benzeri bir bildirim göstermek için
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successDiv.textContent = 'Ayar kaydedildi!';
      document.body.appendChild(successDiv);
      setTimeout(() => {
        document.body.removeChild(successDiv);
      }, 3000);
      
    } catch (error) {
      console.error('❌ Ayar güncellenirken hata:', error);
      
      // Hata bildirimi
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorDiv.textContent = 'Ayar güncellenirken hata oluştu!';
      document.body.appendChild(errorDiv);
      setTimeout(() => {
        document.body.removeChild(errorDiv);
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row">
            <ProfileSidebar activeTab="settings" />
            
            <div className="md:flex-1 md:ml-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row">
            <ProfileSidebar activeTab="settings" />
            
            <div className="md:flex-1 md:ml-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">Ayarlar yüklenemedi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'notifications', name: 'Bildirimler', icon: FiBell },
    { id: 'security', name: 'Güvenlik', icon: FiShield },
    { id: 'appearance', name: 'Görünüm', icon: FiMonitor },
    { id: 'language', name: 'Dil & Bölge', icon: FiGlobe }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:gap-8">
          <ProfileSidebar activeTab="settings" />
          
          <div className="md:flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
                      <FiSettings className="mr-2 text-blue-500" />
                      Hesap Ayarları
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      Hesap tercihlerinizi ve güvenlik ayarlarınızı yönetin
                    </p>
                  </div>
                  {saving && (
                    <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                      <FiRefreshCw className="mr-2 animate-spin" size={16} />
                      Kaydediliyor...
                    </div>
                  )}
                </div>
              </div>

              <div className="flex">
                {/* Yan Menü */}
                <div className="w-64 border-r border-gray-200 dark:border-gray-700">
                  <nav className="p-4">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors mb-1 ${
                          activeSection === section.id
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <section.icon className="mr-3" size={18} />
                        {section.name}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* İçerik Alanı */}
                <div className="flex-1 p-6">
                  {activeSection === 'notifications' && (
                    <NotificationSettings 
                      settings={settings} 
                      onChange={handleSettingChange} 
                    />
                  )}
                  {activeSection === 'security' && (
                    <SecuritySettings 
                      settings={settings} 
                      onChange={handleSettingChange} 
                    />
                  )}
                  {activeSection === 'appearance' && (
                    <AppearanceSettings 
                      settings={settings} 
                      onChange={handleSettingChange} 
                    />
                  )}
                  {activeSection === 'language' && (
                    <LanguageSettings 
                      settings={settings} 
                      onChange={handleSettingChange} 
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings({ settings, onChange }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
        <FiBell className="mr-2 text-blue-500" />
        Bildirim Ayarları
      </h3>
      
      <div className="space-y-6">
        <SettingToggle
          label="Bildirimleri Etkinleştir"
          description="Tüm bildirimler için ana anahtar"
          checked={settings.notifications_enabled}
          onChange={(checked) => onChange('notifications_enabled', checked)}
          icon={<FiBell size={20} />}
        />
        
        <SettingToggle
          label="E-posta Bildirimleri"
          description="Önemli güncellemeler için e-posta alın"
          checked={settings.email_notifications}
          onChange={(checked) => onChange('email_notifications', checked)}
          icon={<FiMail size={20} />}
          disabled={!settings.notifications_enabled}
        />
        
        <SettingToggle
          label="SMS Bildirimleri"
          description="Sipariş güncellemeleri için SMS alın"
          checked={settings.sms_notifications}
          onChange={(checked) => onChange('sms_notifications', checked)}
          icon={<FiSmartphone size={20} />}
          disabled={!settings.notifications_enabled}
        />
        
        <SettingToggle
          label="Push Bildirimleri"
          description="Tarayıcı ve mobil push bildirimleri"
          checked={settings.push_notifications}
          onChange={(checked) => onChange('push_notifications', checked)}
          icon={<FiBell size={20} />}
          disabled={!settings.notifications_enabled}
        />
        
        <hr className="border-gray-200 dark:border-gray-700" />
        
        <SettingToggle
          label="Pazarlama E-postaları"
          description="Özel teklifler ve kampanyalar hakkında bilgi alın"
          checked={settings.marketing_emails}
          onChange={(checked) => onChange('marketing_emails', checked)}
        />
        
        <SettingToggle
          label="Sipariş Güncellemeleri"
          description="Sipariş durumu değişikliklerinde bildirim alın"
          checked={settings.order_updates}
          onChange={(checked) => onChange('order_updates', checked)}
        />
        
        <SettingToggle
          label="Promosyon Bildirimleri"
          description="İndirim ve fırsatlar hakkında bilgilendirilmek"
          checked={settings.promo_notifications}
          onChange={(checked) => onChange('promo_notifications', checked)}
        />
      </div>
    </div>
  );
}

function SecuritySettings({ settings, onChange }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
        <FiShield className="mr-2 text-blue-500" />
        Güvenlik Ayarları
      </h3>
      
      <div className="space-y-6">
        <SettingToggle
          label="İki Faktörlü Kimlik Doğrulama"
          description="Hesabınızın güvenliği için ek bir doğrulama katmanı ekleyin"
          checked={settings.two_factor_enabled}
          onChange={(checked) => onChange('two_factor_enabled', checked)}
          icon={<FiShield size={20} />}
        />
        
        <SettingToggle
          label="Giriş Bildirimleri"
          description="Hesabınıza yeni giriş yapıldığında bildirim alın"
          checked={settings.login_notifications}
          onChange={(checked) => onChange('login_notifications', checked)}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Oturum Zaman Aşımı (dakika)
          </label>
          <input
            type="number"
            min="5"
            max="480"
            value={settings.session_timeout}
            onChange={(e) => onChange('session_timeout', parseInt(e.target.value))}
            className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            İşlem yapmadığınızda oturumunuz kaç dakika sonra kapansın
          </p>
        </div>
      </div>
    </div>
  );
}

function AppearanceSettings({ settings, onChange }) {
  const { theme: currentTheme } = useTheme();
  
  const themes = [
    { 
      value: 'light', 
      label: 'Açık Tema', 
      icon: FiSun,
      description: 'Gündüz kullanımı için ideal olan açık renkli tema'
    },
    { 
      value: 'dark', 
      label: 'Koyu Tema', 
      icon: FiMoon,
      description: 'Gece kullanımı için göz dostu koyu renkli tema'
    },
    { 
      value: 'auto', 
      label: 'Sistem Ayarı', 
      icon: FiMonitor,
      description: 'Cihazınızın sistem ayarlarına göre otomatik değişir'
    }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
        <FiMonitor className="mr-2 text-blue-500" />
        Görünüm Ayarları
      </h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Tema Seçimi
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Uygulamanın genel görünümünü ve renklerini belirleyin
          </p>
          <div className="grid grid-cols-1 gap-4">
            {themes.map((theme) => (
              <button
                key={theme.value}
                onClick={() => onChange('theme', theme.value)}
                className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                  currentTheme === theme.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    currentTheme === theme.value 
                      ? 'bg-blue-100 dark:bg-blue-800' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <theme.icon size={20} className={
                      currentTheme === theme.value 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    } />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      currentTheme === theme.value 
                        ? 'text-blue-900 dark:text-blue-100' 
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {theme.label}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      currentTheme === theme.value 
                        ? 'text-blue-700 dark:text-blue-300' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {theme.description}
                    </p>
                  </div>
                  {currentTheme === theme.value && (
                    <div className="text-blue-500 dark:text-blue-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Tema Önizlemesi</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white border border-gray-200 rounded p-2 text-center text-xs">
              <div className="w-full h-4 bg-blue-500 rounded mb-1"></div>
              <div className="text-gray-600">Açık Tema</div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded p-2 text-center text-xs">
              <div className="w-full h-4 bg-blue-400 rounded mb-1"></div>
              <div className="text-gray-300">Koyu Tema</div>
            </div>
            <div className="bg-gradient-to-r from-white to-gray-900 border border-gray-400 rounded p-2 text-center text-xs">
              <div className="w-full h-4 bg-blue-500 rounded mb-1"></div>
              <div className="text-gray-600">Otomatik</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LanguageSettings({ settings, onChange }) {
  // Şimdilik sadece Türkçe seçenekleri
  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
  ];

  const currencies = [
    { code: 'TRY', name: 'Türk Lirası (₺)', symbol: '₺' }
  ];

  const timezones = [
    { value: 'Europe/Istanbul', name: 'İstanbul (UTC+3)', description: 'Türkiye saati' }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
        <FiGlobe className="mr-2 text-blue-500" />
        Dil & Bölge Ayarları
      </h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dil
          </label>
          <div className="relative">
            <div className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center">
              <span className="text-xl mr-3">🇹🇷</span>
              <span className="text-gray-900 dark:text-gray-100">Türkçe</span>
              <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">Varsayılan</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Uygulama dili şu anda sadece Türkçe olarak desteklenmektedir
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Para Birimi
          </label>
          <div className="relative">
            <div className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center">
              <span className="text-lg mr-3">₺</span>
              <span className="text-gray-900 dark:text-gray-100">Türk Lirası (TRY)</span>
              <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">Varsayılan</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tüm fiyatlar Türk Lirası cinsinden gösterilmektedir
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Saat Dilimi
          </label>
          <div className="relative">
            <div className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center">
              <span className="text-lg mr-3">🕐</span>
              <div className="flex-1">
                <span className="text-gray-900 dark:text-gray-100">İstanbul (UTC+3)</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Türkiye saati</p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Varsayılan</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tüm zamanlar Türkiye saati cinsinden gösterilmektedir
          </p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Bölgesel Ayarlar</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 dark:text-blue-300 font-medium">Tarih Formatı:</span>
              <p className="text-blue-600 dark:text-blue-400">DD.MM.YYYY</p>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300 font-medium">Saat Formatı:</span>
              <p className="text-blue-600 dark:text-blue-400">24 Saat</p>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300 font-medium">Sayı Formatı:</span>
              <p className="text-blue-600 dark:text-blue-400">1.234,56</p>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300 font-medium">Hafta Başlangıcı:</span>
              <p className="text-blue-600 dark:text-blue-400">Pazartesi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({ label, description, checked, onChange, icon, disabled = false }) {
  return (
    <div className={`flex items-start justify-between p-4 rounded-lg border transition-all duration-200 ${
      disabled 
        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' 
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    }`}>
      <div className="flex items-start">
        {icon && (
          <div className={`mr-3 mt-1 ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
            {icon}
          </div>
        )}
        <div>
          <h4 className={`font-medium ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
            {label}
          </h4>
          <p className={`text-sm mt-1 ${disabled ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
            {description}
          </p>
        </div>
      </div>
      
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
          disabled 
            ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed' 
            : checked 
              ? 'bg-blue-600 dark:bg-blue-500' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
} 
