'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '@/lib/api';

const ModuleContext = createContext();

export const ModuleProvider = ({ children }) => {
  const { user } = useAuth();
  const [modulePermissions, setModulePermissions] = useState({
    enable_yemek: true,
    enable_market: true,
    enable_su: true,
    enable_aktuel: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    
    const fetchModulePermissions = async () => {
      try {
        // Cache kontrolü - localStorage'dan yükle
        const cachedPermissions = localStorage.getItem('module_permissions');
        const cachedTime = localStorage.getItem('module_permissions_time');
        
        // 5 dakika cache süresi
        const CACHE_DURATION = 5 * 60 * 1000;
        const now = Date.now();
        
        if (cachedPermissions && cachedTime && (now - parseInt(cachedTime)) < CACHE_DURATION) {
          if (!isCancelled) {
            setModulePermissions(JSON.parse(cachedPermissions));
            setIsLoading(false);
          }
          return;
        }
        
        // API'dan yükle
        const permissions = await api.getModulePermissions();
        
        if (!isCancelled) {
        setModulePermissions(permissions);
          // Cache'e kaydet
          localStorage.setItem('module_permissions', JSON.stringify(permissions));
          localStorage.setItem('module_permissions_time', now.toString());
        }
      } catch (error) {
        if (!isCancelled) {
        console.error('Modül izinleri yüklenirken hata:', error);
        }
      } finally {
        if (!isCancelled) {
        setIsLoading(false);
        }
      }
    };

    fetchModulePermissions();
    
    return () => {
      isCancelled = true;
    };
  }, []); // user dependency kaldırıldı

  // Modülün aktif olup olmadığını kontrol et
  const isModuleEnabled = (moduleName) => {
    // Admin her zaman tüm modüllere erişebilir
    if (user && user.role === 'admin') return true;
    
    // Modül adını doğrula
    const validModules = ['yemek', 'market', 'su', 'aktuel'];
    if (!validModules.includes(moduleName)) {
      console.error(`Geçersiz modül adı: ${moduleName}`);
      return false;
    }
    
    return modulePermissions[`enable_${moduleName}`] === true;
  };

  return (
    <ModuleContext.Provider value={{ modulePermissions, isLoading, isModuleEnabled }}>
      {children}
    </ModuleContext.Provider>
  );
};

export const useModule = () => useContext(ModuleContext);

export default ModuleContext; 