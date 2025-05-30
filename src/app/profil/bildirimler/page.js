'use client';

import { useAuth } from '@/contexts/AuthContext';
import NotificationSystem from '@/components/NotificationSystem';

export default function NotificationsPage() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-6 max-w-sm mx-auto">
          <div className="text-orange-500 text-5xl mb-4">🔔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Giriş Gerekli</h2>
          <p className="text-gray-600 mb-6">Bildirimlerinizi görmek için giriş yapmanız gerekiyor.</p>
          <a
            href="/login"
            className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-700"
          >
            Giriş Yap
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <NotificationSystem 
          userRole={user?.role || 'user'} 
          storeId={user?.store_id}
        />
      </div>
    </div>
  );
} 
