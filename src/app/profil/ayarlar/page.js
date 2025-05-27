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
  FiEye, 
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
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row">
            <ProfileSidebar activeTab="settings" />
            
            <div className="md:flex-1 md:ml-8">
              <div className="bg-white rounded-lg shadow-md p-6">
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
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row">
            <ProfileSidebar activeTab="settings" />
            
            <div className="md:flex-1 md:ml-8">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600">Ayarlar yüklenemedi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'notifications', name: 'Bildirimler', icon: FiBell },
    { id: 'privacy', name: 'Gizlilik', icon: FiEye },
    { id: 'security', name: 'Güvenlik', icon: FiShield },
    { id: 'appearance', name: 'Görünüm', icon: FiMonitor },
    { id: 'language', name: 'Dil & Bölge', icon: FiGlobe }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:gap-8">
          <ProfileSidebar activeTab="settings" />
          
          <div className="md:flex-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <FiSettings className="mr-2 text-blue-500" />
                      Hesap Ayarları
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Hesap tercihlerinizi ve güvenlik ayarlarınızı yönetin
                    </p>
                  </div>
                  {saving && (
                    <div className="flex items-center text-sm text-blue-600">
                      <FiRefreshCw className="mr-2 animate-spin" size={16} />
                      Kaydediliyor...
                    </div>
                  )}
                </div>
              </div>

              <div className="flex">
                {/* Yan Menü */}
                <div className="w-64 border-r border-gray-200">
                  <nav className="p-4">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors mb-1 ${
                          activeSection === section.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
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
                  {activeSection === 'privacy' && (
                    <PrivacySettings 
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
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
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
        
        <hr className="border-gray-200" />
        
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

function PrivacySettings({ settings, onChange }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <FiEye className="mr-2 text-blue-500" />
        Gizlilik Ayarları
      </h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profil Görünürlüğü
          </label>
          <select
            value={settings.profile_visibility}
            onChange={(e) => onChange('profile_visibility', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="public">Herkese Açık</option>
            <option value="private">Gizli</option>
            <option value="friends">Sadece Arkadaşlar</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Profilinizin kimler tarafından görüleceğini belirleyin
          </p>
        </div>
        
        <SettingToggle
          label="Çevrimiçi Durumu Göster"
          description="Diğer kullanıcılar aktif olduğunuzu görebilsin"
          checked={settings.show_online_status}
          onChange={(checked) => onChange('show_online_status', checked)}
        />
        
        <SettingToggle
          label="Arkadaşlık İsteklerine İzin Ver"
          description="Diğer kullanıcılar size arkadaşlık isteği gönderebilsin"
          checked={settings.allow_friend_requests}
          onChange={(checked) => onChange('allow_friend_requests', checked)}
        />
      </div>
    </div>
  );
}

function SecuritySettings({ settings, onChange }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Oturum Zaman Aşımı (dakika)
          </label>
          <input
            type="number"
            min="5"
            max="480"
            value={settings.session_timeout}
            onChange={(e) => onChange('session_timeout', parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
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
    { value: 'light', label: 'Açık Tema', icon: FiSun },
    { value: 'dark', label: 'Koyu Tema', icon: FiMoon },
    { value: 'auto', label: 'Sistem Ayarı', icon: FiMonitor }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <FiMonitor className="mr-2 text-blue-500" />
        Görünüm Ayarları
      </h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tema Seçimi
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.value}
                onClick={() => onChange('theme', theme.value)}
                className={`p-4 border-2 rounded-lg transition-colors flex flex-col items-center ${
                  currentTheme === theme.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <theme.icon size={24} className="mb-2" />
                <span className="text-sm font-medium">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LanguageSettings({ settings, onChange }) {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  
  const handleLanguageChange = async (newLanguage) => {
    await changeLanguage(newLanguage);
    await onChange('language', newLanguage);
  };

  const currencies = [
    { code: 'TRY', name: 'Türk Lirası (₺)' },
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' }
  ];

  const timezones = [
    { value: 'Europe/Istanbul', name: 'İstanbul (UTC+3)' },
    { value: 'Europe/London', name: 'London (UTC+0)' },
    { value: 'America/New_York', name: 'New York (UTC-5)' },
    { value: 'Asia/Tokyo', name: 'Tokyo (UTC+9)' }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <FiGlobe className="mr-2 text-blue-500" />
        Dil & Bölge Ayarları
      </h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dil
          </label>
          <select
            value={currentLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Para Birimi
          </label>
          <select
            value={settings.currency}
            onChange={(e) => onChange('currency', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Saat Dilimi
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => onChange('timezone', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({ label, description, checked, onChange, icon, disabled = false }) {
  return (
    <div className={`flex items-start justify-between p-4 rounded-lg border ${
      disabled ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start">
        {icon && (
          <div className={`mr-3 mt-1 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
            {icon}
          </div>
        )}
        <div>
          <h4 className={`font-medium ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
            {label}
          </h4>
          <p className={`text-sm mt-1 ${disabled ? 'text-gray-300' : 'text-gray-500'}`}>
            {description}
          </p>
        </div>
      </div>
      
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          disabled 
            ? 'bg-gray-200 cursor-not-allowed' 
            : checked 
              ? 'bg-blue-600' 
              : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
} 