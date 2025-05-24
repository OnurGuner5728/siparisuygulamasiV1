'use client';
import { useEffect, useState } from 'react';
import { useError } from '@/contexts/ErrorContext';


export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { showInfo, showSuccess, showError } = useError();
 
  useEffect(() => {
    // Check if service workers are supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      setRegistration(registration);
      setIsRegistered(true);

      console.log('Service Worker registered successfully:', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
              showInfo('Yeni bir güncelleme mevcut. Sayfayı yenileyin.', {
                duration: 10000
              });
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, payload } = event.data;
        
        switch (type) {
          case 'CACHE_UPDATED':
            showSuccess('Veriler güncellendi ve önbelleğe alındı.');
            break;
          case 'OFFLINE_READY':
            showInfo('Uygulama çevrimdışı kullanıma hazır.');
            break;
          default:
            break;
        }
      });

      // Check if there's a waiting service worker
      if (registration.waiting) {
        setUpdateAvailable(true);
      }

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      showError('Çevrimdışı özellikler etkinleştirilemedi.');
    }
  };

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const unregisterServiceWorker = async () => {
    if (registration) {
      try {
        await registration.unregister();
        setIsRegistered(false);
        setRegistration(null);
        showSuccess('Service Worker kaldırıldı.');
      } catch (error) {
        console.error('Service Worker unregistration failed:', error);
        showError('Service Worker kaldırılamadı.');
      }
    }
  };

  // Check if app is running in standalone mode (PWA)
  const isStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
  };

  // Request persistent storage
  const requestPersistentStorage = async () => {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const granted = await navigator.storage.persist();
        if (granted) {
          showSuccess('Kalıcı depolama izni verildi.');
        }
        return granted;
      } catch (error) {
        console.error('Persistent storage request failed:', error);
        return false;
      }
    }
    return false;
  };

  // Get storage usage
  const getStorageUsage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage,
          available: estimate.quota,
          percentage: Math.round((estimate.usage / estimate.quota) * 100)
        };
      } catch (error) {
        console.error('Storage estimate failed:', error);
        return null;
      }
    }
    return null;
  };

  return {
    isSupported,
    isRegistered,
    registration,
    updateAvailable,
    updateServiceWorker,
    unregisterServiceWorker,
    isStandalone: isStandalone(),
    requestPersistentStorage,
    getStorageUsage
  };
}

export default useServiceWorker; 