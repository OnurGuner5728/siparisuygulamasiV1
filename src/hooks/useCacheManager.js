'use client';
import { useCallback, useEffect } from 'react';
import CacheManager from '@/lib/cacheManager';

export function useCacheManager() {
  // Sayfa yüklendiğinde eski cache'leri temizle
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const cleanedCount = CacheManager.cleanExpiredCache('sessionStorage');
      const cleanedLocalCount = CacheManager.cleanExpiredCache('localStorage');
      
      if (cleanedCount > 0 || cleanedLocalCount > 0) {
        console.log(`Cache temizlendi: ${cleanedCount} session, ${cleanedLocalCount} local`);
      }
    }, 10 * 60 * 1000); // 10 dakikada bir temizle

    // İlk temizlik
    CacheManager.cleanExpiredCache('sessionStorage');
    CacheManager.cleanExpiredCache('localStorage');

    return () => clearInterval(cleanupInterval);
  }, []);

  const clearCache = useCallback((key, storage = 'sessionStorage') => {
    return CacheManager.clearCache(key, storage);
  }, []);

  const clearCacheByPattern = useCallback((pattern, storage = 'sessionStorage') => {
    return CacheManager.clearCacheByPattern(pattern, storage);
  }, []);

  const clearAllCache = useCallback((storage = 'sessionStorage') => {
    return CacheManager.clearAllCache(storage);
  }, []);

  const getCacheStats = useCallback((storage = 'sessionStorage') => {
    return CacheManager.getCacheStats(storage);
  }, []);

  const setCache = useCallback((key, data, duration, storage = 'sessionStorage') => {
    return CacheManager.setCache(key, data, duration, storage);
  }, []);

  const getCache = useCallback((key, storage = 'sessionStorage') => {
    return CacheManager.getCache(key, storage);
  }, []);

  return {
    clearCache,
    clearCacheByPattern,
    clearAllCache,
    getCacheStats,
    setCache,
    getCache
  };
}

export default useCacheManager; 