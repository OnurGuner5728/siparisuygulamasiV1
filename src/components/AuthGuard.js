'use client';

import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children, requiredRole }) {
  const { isAuthenticated, hasPermission, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Auth yüklenene kadar bekle
    if (loading) return;

    // Eğer giriş yapılmadıysa ve korumalı sayfadaysa login'e yönlendir
    if (!isAuthenticated && requiredRole) {
      // Login yapılmadan önce gidilecek sayfayı localStorage'a kaydet
      localStorage.setItem('redirectAfterLogin', pathname);
      router.push('/login');
      return;
    }

    // Eğer giriş yapılmış fakat yetkisi yoksa ana sayfaya yönlendir
    if (isAuthenticated && requiredRole && !hasPermission(requiredRole)) {
      alert(`Bu sayfaya erişim için gerekli yetkiye sahip değilsiniz.`);
      router.push('/');
      return;
    }
  }, [isAuthenticated, hasPermission, loading, router, pathname, requiredRole, user]);

  // Eğer yükleniyor durumdaysa
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Korumalı sayfaysa ve giriş yapılmadıysa veya yetkisi yoksa null döndür
  if (requiredRole) {
    if (!isAuthenticated) {
      return null; // useEffect ile yönlendirme yapılacak
    }

    if (!hasPermission(requiredRole)) {
      return null; // useEffect ile yönlendirme yapılacak
    }
  }

  // Tüm kontroller tamam, children'ı render et
  return children;
} 