'use client';

import { useState, useEffect } from 'react';
import testSupabaseConnection from '@/lib/supabaseTestConnection';

export default function SupabaseTest() {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const runTest = async () => {
      try {
        setLoading(true);
        const result = await testSupabaseConnection();
        setTestResult(result);
      } catch (err) {
        console.error('Test çalıştırma hatası:', err);
        setError(err.message || 'Bilinmeyen hata');
      } finally {
        setLoading(false);
      }
    };
    
    runTest();
  }, []);
  
  if (loading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Supabase Bağlantı Testi</h2>
        <p>Test çalıştırılıyor...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Supabase Bağlantı Hatası</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Supabase Bağlantı Testi</h2>
      {testResult?.success ? (
        <div className="bg-green-100 p-3 rounded">
          <p className="text-green-700">Bağlantı başarılı!</p>
          <pre className="mt-2 text-sm bg-gray-50 p-2 rounded">
            {JSON.stringify(testResult.data, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="bg-red-100 p-3 rounded">
          <p className="text-red-700">Bağlantı başarısız!</p>
          <pre className="mt-2 text-sm bg-gray-50 p-2 rounded">
            {JSON.stringify(testResult?.error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 