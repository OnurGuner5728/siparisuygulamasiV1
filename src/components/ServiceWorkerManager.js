'use client';
import { useEffect } from 'react';

const ServiceWorkerManager = () => {
  useEffect(() => {
    // Service Worker'ı tamamen devre dışı bırak - navigation sorunlarını önlemek için
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister();
          console.log('Service Worker unregistered to fix navigation issues');
        }
      });
    }
  }, []);

  // Bu component sadece service worker'ı yönetir, UI render etmez
  return null;
};

export default ServiceWorkerManager; 