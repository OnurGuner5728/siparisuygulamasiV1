'use client';

import SupabaseTest from '@/components/SupabaseTest';
import { useAuth } from '@/contexts/AuthContext';

export default function TestPage() {
  const { user, loading, isAuthenticated } = useAuth();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Bağlantı Test Sayfası</h1>
      
      <div className="grid gap-4">
        <SupabaseTest />
        
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Auth Durumu</h2>
          {loading ? (
            <p>Yükleniyor...</p>
          ) : (
            <div>
              <p>Giriş Yapılmış: {isAuthenticated ? 'Evet' : 'Hayır'}</p>
              {isAuthenticated && (
                <div className="mt-2">
                  <h3 className="font-medium">Kullanıcı Bilgileri:</h3>
                  <pre className="mt-1 text-sm bg-gray-50 p-2 rounded">
                    {JSON.stringify({
                      id: user?.id,
                      email: user?.email,
                      name: user?.name,
                      role: user?.role
                    }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 