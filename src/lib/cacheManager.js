// Cache yönetimi için utility fonksiyonları

class CacheManager {
  static CACHE_DURATIONS = {
    MODULE_PERMISSIONS: 5 * 60 * 1000, // 5 dakika
    CATEGORIES: 10 * 60 * 1000, // 10 dakika
    STORES: 3 * 60 * 1000, // 3 dakika
    PRODUCTS: 2 * 60 * 1000, // 2 dakika
    USER_PROFILE: 10 * 60 * 1000, // 10 dakika
    CAMPAIGNS: 5 * 60 * 1000, // 5 dakika
  };

  // Cache'e veri kaydet
  static setCache(key, data, duration = null, storage = 'sessionStorage') {
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
      const timestamp = Date.now();
      const cacheData = {
        data,
        timestamp,
        duration: duration || this.CACHE_DURATIONS.DEFAULT || 5 * 60 * 1000
      };
      
      storageObj.setItem(key, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.warn('Cache kaydetme hatası:', error);
      return false;
    }
  }

  // Cache'den veri oku
  static getCache(key, storage = 'sessionStorage') {
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
      const cached = storageObj.getItem(key);
      
      if (!cached) return null;
      
      const { data, timestamp, duration } = JSON.parse(cached);
      const now = Date.now();
      
      // Cache süresi dolmuş mu?
      if (now - timestamp > duration) {
        storageObj.removeItem(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn('Cache okuma hatası:', error);
      return null;
    }
  }

  // Belirli bir cache'i temizle
  static clearCache(key, storage = 'sessionStorage') {
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
      storageObj.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Cache temizleme hatası:', error);
      return false;
    }
  }

  // Pattern'e göre cache'leri temizle
  static clearCacheByPattern(pattern, storage = 'sessionStorage') {
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
      const keysToRemove = [];
      
      for (let i = 0; i < storageObj.length; i++) {
        const key = storageObj.key(i);
        if (key && key.includes(pattern)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => storageObj.removeItem(key));
      return keysToRemove.length;
    } catch (error) {
      console.warn('Pattern cache temizleme hatası:', error);
      return 0;
    }
  }

  // Tüm cache'i temizle
  static clearAllCache(storage = 'sessionStorage') {
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
      storageObj.clear();
      return true;
    } catch (error) {
      console.warn('Tüm cache temizleme hatası:', error);
      return false;
    }
  }

  // Cache boyutunu kontrol et
  static getCacheSize(storage = 'sessionStorage') {
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
      let totalSize = 0;
      
      for (let key in storageObj) {
        if (storageObj.hasOwnProperty(key)) {
          totalSize += storageObj[key].length + key.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.warn('Cache boyutu hesaplama hatası:', error);
      return 0;
    }
  }

  // Eski cache'leri temizle
  static cleanExpiredCache(storage = 'sessionStorage') {
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
      const keysToRemove = [];
      const now = Date.now();
      
      for (let i = 0; i < storageObj.length; i++) {
        const key = storageObj.key(i);
        if (!key) continue;
        
        try {
          const cached = JSON.parse(storageObj.getItem(key));
          if (cached.timestamp && cached.duration) {
            if (now - cached.timestamp > cached.duration) {
              keysToRemove.push(key);
            }
          }
        } catch (parseError) {
          // JSON parse edilemeyen öğeler - muhtemelen cache verisi değil
          continue;
        }
      }
      
      keysToRemove.forEach(key => storageObj.removeItem(key));
      return keysToRemove.length;
    } catch (error) {
      console.warn('Eski cache temizleme hatası:', error);
      return 0;
    }
  }

  // Cache istatistikleri
  static getCacheStats(storage = 'sessionStorage') {
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
      const stats = {
        totalItems: 0,
        totalSize: 0,
        expiredItems: 0,
        validItems: 0
      };
      
      const now = Date.now();
      
      for (let i = 0; i < storageObj.length; i++) {
        const key = storageObj.key(i);
        if (!key) continue;
        
        stats.totalItems++;
        stats.totalSize += storageObj.getItem(key).length + key.length;
        
        try {
          const cached = JSON.parse(storageObj.getItem(key));
          if (cached.timestamp && cached.duration) {
            if (now - cached.timestamp > cached.duration) {
              stats.expiredItems++;
            } else {
              stats.validItems++;
            }
          }
        } catch (parseError) {
          // JSON parse edilemeyen öğeler
          continue;
        }
      }
      
      return stats;
    } catch (error) {
      console.warn('Cache istatistikleri hesaplama hatası:', error);
      return null;
    }
  }
}

export default CacheManager; 