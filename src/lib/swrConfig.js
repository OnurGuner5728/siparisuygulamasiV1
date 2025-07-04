import { useError } from '@/contexts/ErrorContext';

// Default SWR configuration - Optimized for reduced fetch requests
export const swrConfig = {
  // Revalidation settings - Daha az agresif revalidation
  revalidateOnFocus: false, // Focus'ta yeniden yüklemeyi kapat
  revalidateOnReconnect: true,
  revalidateIfStale: false, // Stale veri üzerinde yeniden yüklemeyi kapat
  
  // Cache settings - Daha uzun cache süreleri
  dedupingInterval: 10000, // 10 saniye (arttırıldı)
  focusThrottleInterval: 30000, // 30 saniye (arttırıldı)
  
  // Error retry settings
  errorRetryCount: 2, // Azaltıldı
  errorRetryInterval: 8000, // Arttırıldı
  
  // Loading settings
  loadingTimeout: 5000, // Arttırıldı
  
  // Fallback data
  fallbackData: null,
  
  // Keep previous data while loading new data
  keepPreviousData: true,
  
  // Cache refresh interval - Sadece kritik verileri belirli aralıklarla yenile
  refreshInterval: 0, // Otomatik yenilemeyi kapat
  
  // Custom fetcher function
  fetcher: async (url, options = {}) => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = new Error('API request failed');
      error.status = response.status;
      error.response = response;
      throw error;
    }

    return response.json();
  },
  
  // Error handler
  onError: (error, key) => {
    console.error('SWR Error:', error, 'Key:', key);
    
    // You can integrate with error context here
    // const { handleNetworkError } = useError();
    // handleNetworkError(error);
  },
  
  // Success handler
  onSuccess: (data, key, config) => {
    // Optional: Log successful requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log('SWR Success:', key, data);
    }
  },
  
  // Loading state handler
  onLoadingSlow: (key, config) => {
    console.warn('SWR Loading slow:', key);
  },
};

// Custom hook for SWR with error handling
export function useSwrWithErrorHandling() {
  const { handleNetworkError, showError } = useError();
  
  return {
    ...swrConfig,
    onError: (error, key) => {
      console.error('SWR Error:', error, 'Key:', key);
      
      // Handle different error types
      if (error.status === 401) {
        showError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      } else if (error.status === 403) {
        showError('Bu işlem için yetkiniz bulunmuyor.');
      } else if (error.status === 404) {
        showError('Aradığınız veri bulunamadı.');
      } else if (error.status >= 500) {
        showError('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.');
      } else if (!navigator.onLine) {
        showError('İnternet bağlantınızı kontrol edin.');
      } else {
        handleNetworkError(error, { url: key });
      }
    },
  };
}

export default swrConfig; 