'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '@/lib/api';
import supabase from '@/lib/supabase';

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

  // Modül izinlerini yükle
  const loadModulePermissions = async (forceRefresh = false) => {
    try {
      // Cache kontrolü - localStorage'dan yükle (sadece force refresh değilse)
      if (!forceRefresh) {
        const cachedPermissions = localStorage.getItem('module_permissions');
        const cachedTime = localStorage.getItem('module_permissions_time');
        
        // 5 dakika cache süresi
        const CACHE_DURATION = 5 * 60 * 1000;
        const now = Date.now();
        
        if (cachedPermissions && cachedTime && (now - parseInt(cachedTime)) < CACHE_DURATION) {
          setModulePermissions(JSON.parse(cachedPermissions));
          setIsLoading(false);
          return JSON.parse(cachedPermissions);
        }
      }
      
      // API'dan yükle
      console.log('🔄 ModuleContext - İzinler yükleniyor...' + (forceRefresh ? ' (Force refresh)' : ''));
      const permissions = await api.getModulePermissions();
      
      setModulePermissions(permissions);
      // Cache'e kaydet
      const now = Date.now();
      localStorage.setItem('module_permissions', JSON.stringify(permissions));
      localStorage.setItem('module_permissions_time', now.toString());
      
      console.log('✅ ModuleContext - İzinler güncellendi:', permissions);
      return permissions;
    } catch (error) {
      console.error('❌ ModuleContext - İzinler yüklenirken hata:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    let subscription = null;
    
    const initializeModuleContext = async () => {
      // İlk yükleme
      await loadModulePermissions();
      
      if (isCancelled) return;
      
      // Realtime subscription kurulumu
      console.log('🔗 ModuleContext - Realtime subscription başlatılıyor...');
      
      subscription = supabase
        .channel('module-permissions-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // INSERT, UPDATE, DELETE tüm değişiklikleri dinle
            schema: 'public',
            table: 'module_permissions'
          },
          async (payload) => {
            console.log('📡 ModuleContext - Realtime değişiklik algılandı:', payload);
            
            // Cache'i temizle ve yeni verileri yükle
            localStorage.removeItem('module_permissions');
            localStorage.removeItem('module_permissions_time');
            
            // 500ms delay ile güncellemeleri batch'le
            setTimeout(async () => {
              if (!isCancelled) {
                await loadModulePermissions(true);
              }
            }, 500);
          }
        )
        .subscribe((status) => {
          console.log('🔗 ModuleContext - Subscription durumu:', status);
        });
    };

    initializeModuleContext();
    
    return () => {
      isCancelled = true;
      if (subscription) {
        console.log('🔌 ModuleContext - Subscription kapatılıyor...');
        supabase.removeChannel(subscription);
      }
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

  // Manual refresh fonksiyonu - gerekirse dışarıdan çağrılabilir
  const refreshModulePermissions = async () => {
    console.log('🔄 ModuleContext - Manuel yenileme tetiklendi');
    localStorage.removeItem('module_permissions');
    localStorage.removeItem('module_permissions_time');
    await loadModulePermissions(true);
  };

  return (
    <ModuleContext.Provider value={{ 
      modulePermissions, 
      isLoading, 
      isModuleEnabled, 
      refreshModulePermissions 
    }}>
      {children}
    </ModuleContext.Provider>
  );
};

export const useModule = () => useContext(ModuleContext);

export default ModuleContext; 