'use client';

import { useEffect, useRef, useState } from 'react';

export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true); // Server-side safe default
  const [tabId] = useState(() => Math.random().toString(36).substr(2, 9));
  const lastVisibleTimeRef = useRef(Date.now());
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    // Client-side'da document.hidden'ı kontrol et
    if (typeof document !== 'undefined') {
      setIsVisible(!document.hidden);
    }
    
    // İlk mount'ta hiçbir şey yapma
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    const handleVisibilityChange = () => {
      const now = Date.now();
      const wasHidden = document.hidden;
      
      setIsVisible(!wasHidden);
      
      if (!wasHidden) {
        // Sayfa görünür oldu
        const hiddenDuration = now - lastVisibleTimeRef.current;
        
        // Eğer 30 saniyeden fazla gizli kaldıysa, muhtemelen bilgisayar uyku moduna girmiştir
        if (hiddenDuration > 30000) {
          // LocalStorage'a bir flag koy
          localStorage.setItem('page_needs_refresh', 'true');
          localStorage.setItem('refresh_tab_id', tabId);
        }
      } else {
        // Sayfa gizlendi
        lastVisibleTimeRef.current = now;
      }
    };

    const handleFocus = () => {
      const needsRefresh = localStorage.getItem('page_needs_refresh');
      const refreshTabId = localStorage.getItem('refresh_tab_id');
      
      if (needsRefresh === 'true' && refreshTabId !== tabId) {
        // Başka bir sekme refresh isteği bırakmış
        localStorage.removeItem('page_needs_refresh');
        localStorage.removeItem('refresh_tab_id');
      }
    };

    const handlePageShow = (event) => {
      if (event.persisted) {
        // Sayfa cache'den geldi
        const now = Date.now();
        const hiddenDuration = now - lastVisibleTimeRef.current;
        
        if (hiddenDuration > 60000) { // 1 dakika
          localStorage.setItem('page_needs_refresh', 'true');
          localStorage.setItem('refresh_tab_id', tabId);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [tabId]);

  return { isVisible, tabId };
} 