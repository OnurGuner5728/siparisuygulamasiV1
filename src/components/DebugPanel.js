'use client';
import { useState, useEffect } from 'react';
import useCacheManager from '@/hooks/useCacheManager';

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const { getCacheStats, clearAllCache } = useCacheManager();

  useEffect(() => {
    if (isOpen) {
      const sessionStats = getCacheStats('sessionStorage');
      const localStats = getCacheStats('localStorage');
      setStats({ session: sessionStats, local: localStats });
    }
  }, [isOpen, getCacheStats]);

  const handleClearCache = () => {
    clearAllCache('sessionStorage');
    clearAllCache('localStorage');
    alert('Tüm cache temizlendi!');
    setIsOpen(false);
  };

  // Sadece development modunda göster
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Debug butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600"
        style={{ fontSize: '12px' }}
      >
        🐛
      </button>

      {/* Debug paneli */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80">
          <h3 className="font-bold text-lg mb-2">Debug Panel</h3>
          
          {stats && (
            <div className="space-y-2 text-sm">
              <div>
                <strong>Session Storage:</strong>
                <div>Toplam: {stats.session?.totalItems || 0} öğe</div>
                <div>Geçerli: {stats.session?.validItems || 0}</div>
                <div>Süresi dolmuş: {stats.session?.expiredItems || 0}</div>
                <div>Boyut: {Math.round((stats.session?.totalSize || 0) / 1024)} KB</div>
              </div>
              
              <div>
                <strong>Local Storage:</strong>
                <div>Toplam: {stats.local?.totalItems || 0} öğe</div>
                <div>Geçerli: {stats.local?.validItems || 0}</div>
                <div>Süresi dolmuş: {stats.local?.expiredItems || 0}</div>
                <div>Boyut: {Math.round((stats.local?.totalSize || 0) / 1024)} KB</div>
              </div>
            </div>
          )}
          
          <div className="mt-4 space-y-2">
            <button
              onClick={handleClearCache}
              className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Tüm Cache'i Temizle
            </button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
} 