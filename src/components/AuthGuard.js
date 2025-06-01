'use client';

import { useAuth } from '../contexts/AuthContext';

export default function AuthGuard({ children, requiredRole, permissionType = 'view' }) {
  const { isAuthenticated, hasPermission, loading, user } = useAuth();

  // Loading durumunda spinner göster
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Checkout sayfası için özel durum - herkese erişim
  if (requiredRole === 'user') {
    return children;
  }

  // any_auth durumu: sadece giriş yapmış olmayı kontrol et
  if (requiredRole === 'any_auth') {
    if (!isAuthenticated) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Giriş Gerekli</h2>
            <p className="text-gray-600">Bu sayfayı görüntülemek için giriş yapmanız gerekiyor.</p>
          </div>
        </div>
      );
    }
    return children;
  }

  // Role tabanlı erişim kontrolü
  if (requiredRole && !hasPermission(requiredRole, permissionType)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-600">Bu sayfaya erişim için gerekli yetkiye sahip değilsiniz.</p>
        </div>
      </div>
    );
  }

  // Erişim izni varsa, çocuk bileşenleri göster
  return children;
} 