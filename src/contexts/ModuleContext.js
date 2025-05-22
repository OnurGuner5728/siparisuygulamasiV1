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
    const fetchModulePermissions = async () => {
      try {
        const permissions = await api.getModulePermissions();
        setModulePermissions(permissions);
      } catch (error) {
        console.error('Modül izinleri yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModulePermissions();
  }, []);

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