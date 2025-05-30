'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '@/lib/api';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  // Kullanıcı ayarlarını yükle
  useEffect(() => {
    const loadUserTheme = async () => {
      if (user) {
        try {
          const userSettings = await api.getUserSettings(user.id);
          if (userSettings?.theme) {
            applyTheme(userSettings.theme);
          }
        } catch (error) {
          console.error('❌ Tema ayarları yüklenirken hata:', error);
          // Hata durumunda localStorage'dan yükle
          const savedTheme = localStorage.getItem('theme') || 'light';
          applyTheme(savedTheme);
        }
      } else {
        // Kullanıcı giriş yapmamışsa localStorage'dan tema yükle
        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
      }
      setLoading(false);
    };

    loadUserTheme();
  }, [user]);

  // Sistem teması değişikliklerini dinle
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applySystemTheme();
      };

      mediaQuery.addEventListener('change', handleChange);
      applySystemTheme();

      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const applySystemTheme = () => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Tailwind class-based dark mode kullanıyoruz
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Meta theme-color tag'ini güncelle
    updateMetaThemeColor(isDark ? 'dark' : 'light');
    
    console.log('🌓 Sistem teması uygulandı:', isDark ? 'dark' : 'light');
  };

  const updateMetaThemeColor = (actualTheme) => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', actualTheme === 'dark' ? '#0a0a0a' : '#ffffff');
    }
  };

  const applyTheme = (newTheme) => {
    setTheme(newTheme);
    
    if (newTheme === 'auto') {
      applySystemTheme();
    } else if (newTheme === 'dark') {
      // Dark tema - Tailwind'in dark class'ını ekle
      document.documentElement.classList.add('dark');
      updateMetaThemeColor('dark');
    } else {
      // Light tema (varsayılan) - dark class'ını kaldır
      document.documentElement.classList.remove('dark');
      updateMetaThemeColor('light');
    }

    // Kullanıcı yoksa localStorage'a kaydet
    if (!user) {
      localStorage.setItem('theme', newTheme);
    }
    
    console.log('✅ Tema uygulandı:', newTheme);
  };

  const changeTheme = async (newTheme) => {
    try {
      if (user) {
        // Kullanıcı giriş yapmışsa database'e kaydet
        await api.updateUserSettings(user.id, { theme: newTheme });
        console.log('✅ Tema ayarı database\'e kaydedildi:', newTheme);
      } else {
        // Kullanıcı giriş yapmamışsa localStorage'a kaydet
        localStorage.setItem('theme', newTheme);
        console.log('✅ Tema ayarı localStorage\'a kaydedildi:', newTheme);
      }
      
      applyTheme(newTheme);
    } catch (error) {
      console.error('❌ Tema değiştirilirken hata:', error);
      // Hata olsa da local olarak değiştir
      applyTheme(newTheme);
    }
  };

  const getActualTheme = () => {
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  };

  const isDarkMode = () => {
    return getActualTheme() === 'dark';
  };

  const isLightMode = () => {
    return getActualTheme() === 'light';
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'auto':
        return '🌓';
      default:
        return '☀️';
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Açık Tema';
      case 'dark':
        return 'Koyu Tema';
      case 'auto':
        return 'Sistem Ayarı';
      default:
        return 'Açık Tema';
    }
  };

  const value = {
    theme,
    actualTheme: getActualTheme(),
    changeTheme,
    loading,
    isDarkMode,
    isLightMode,
    getThemeIcon,
    getThemeLabel,
    // Tema durumu kontrolleri
    isAuto: theme === 'auto',
    isLight: theme === 'light',
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 