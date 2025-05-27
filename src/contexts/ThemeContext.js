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
    const actualTheme = isDark ? 'dark' : 'light';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(actualTheme);
  };

  const applyTheme = (newTheme) => {
    setTheme(newTheme);
    
    if (newTheme === 'auto') {
      applySystemTheme();
    } else {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
    }

    // Kullanıcı yoksa localStorage'a kaydet
    if (!user) {
      localStorage.setItem('theme', newTheme);
    }
  };

  const changeTheme = async (newTheme) => {
    try {
      if (user) {
        // Kullanıcı giriş yapmışsa database'e kaydet
        await api.updateUserSettings(user.id, { theme: newTheme });
        console.log('✅ Tema ayarı kaydedildi:', newTheme);
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

  const value = {
    theme,
    actualTheme: getActualTheme(),
    changeTheme,
    loading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 