'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const StoreGuard = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Burada normalde bir API isteği ile kullanıcının 
    // mağaza sahibi olup olmadığını kontrol edeceğiz
    // Şimdilik sadece simüle edelim

    // Kullanıcı oturum bilgisini localStorage'dan alıyoruz
    const user = localStorage.getItem('user') 
      ? JSON.parse(localStorage.getItem('user')) 
      : null;

    if (!user || user.role !== 'store') {
      // Eğer kullanıcı yoksa veya mağaza sahibi değilse
      setAuthorized(false);
      router.push('/auth/login?returnUrl=' + encodeURIComponent(window.location.pathname));
    } else {
      // Kullanıcı mağaza sahibi
      setAuthorized(true);
    }

    setLoading(false);
  }, [router]);

  // İçeriği sadece yetkilendirilmiş kullanıcılar için göster
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return authorized ? children : null;
};

export default StoreGuard; 