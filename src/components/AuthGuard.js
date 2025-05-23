'use client';

import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children, requiredRole, permissionType = 'view' }) {
  const { isAuthenticated, hasPermission, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Auth yüklenene kadar bekle
    if (loading) return;

    // Eğer requiredRole "user" ise ve sayfa "/checkout" ise tüm kullanıcılara izin ver
    if (requiredRole === 'user' && pathname === '/checkout') {
      return; // Erişime izin ver, hiçbir şey yapma
    }

    // Eğer giriş yapılmadıysa ve korumalı sayfadaysa login'e yönlendir
    if (!isAuthenticated && requiredRole) {
      // Login yapılmadan önce gidilecek sayfayı localStorage'a kaydet
      localStorage.setItem('redirectAfterLogin', pathname);
      router.push('/login');
      return;
    }

    // any_auth durumu: sadece giriş yapmış olmayı kontrol et
    if (requiredRole === 'any_auth') {
      // İsAuthenticated kontrolü yukarıda yapıldı, burada başka bir şey yapmaya gerek yok
      return;
    }

    // Özel izin kontrolü: Eğer istenilen role sahip değilse ana sayfaya yönlendir
    // Bunu hasPermission fonksiyonu ile kontrol ediyoruz
    if (requiredRole && !hasPermission(requiredRole, permissionType)) {
      alert('Bu sayfaya erişim için gerekli yetkiye sahip değilsiniz.');
      router.push('/');
      return;
    }
  }, [loading, isAuthenticated, requiredRole, permissionType, router, pathname, hasPermission]);

  // Yükleme sırasında bir şey gösterme
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Checkout sayfası için özel durum
  if (requiredRole === 'user' && pathname === '/checkout') {
    return children; // Herkese erişim izni ver
  }

  // any_auth durumu: sadece giriş yapmış olmayı kontrol et
  if (requiredRole === 'any_auth') {
    return isAuthenticated ? children : null;
  }

  // Erişim izni yoksa veya yükleme sırasında null döndür
  if ((requiredRole && !isAuthenticated) || (requiredRole && !hasPermission(requiredRole, permissionType))) {
    return null;
  }

  // Erişim izni varsa, çocuk bileşenleri göster
  return children;
} 