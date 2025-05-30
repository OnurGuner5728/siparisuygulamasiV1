'use client';

import { useState } from 'react';
import { 
  migrateUsers, 
  migrateStores, 
  migrateProducts, 
  migrateOrders, 
  migrateCampaigns, 
  migrateAllData 
} from '@/lib/dataMigration';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DataMigrationPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMigration, setSelectedMigration] = useState('all');

  // Sayfa yüklendiğinde yönetici değilse yönlendir
  if (typeof window !== 'undefined' && !isAdmin) {
    router.push('/');
    return null;
  }

  // Konsol çıktılarını sayfada göster
  const setupConsoleCapture = () => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    console.log = function(...args) {
      setLogs(prev => [...prev, { type: 'log', message: args.join(' ') }]);
      originalConsoleLog.apply(console, args);
    };

    console.error = function(...args) {
      setLogs(prev => [...prev, { type: 'error', message: args.join(' ') }]);
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  };

  // Göç işlemini başlat
  const startMigration = async () => {
    setLogs([]);
    setIsLoading(true);

    const restoreConsole = setupConsoleCapture();
    
    try {
      let result;
      
      switch (selectedMigration) {
        case 'users':
          result = await migrateUsers();
          break;
        case 'stores':
          result = await migrateStores();
          break;
        case 'products':
          result = await migrateProducts();
          break;
        case 'orders':
          result = await migrateOrders();
          break;
        case 'campaigns':
          result = await migrateCampaigns();
          break;
        case 'all':
        default:
          result = await migrateAllData();
          break;
      }
      
      if (result && !result.success) {
        setLogs(prev => [...prev, { type: 'error', message: 'Göç işlemi sırasında bir hata oluştu' }]);
      } else {
        setLogs(prev => [...prev, { type: 'log', message: 'Göç işlemi başarıyla tamamlandı' }]);
      }
    } catch (error) {
      setLogs(prev => [...prev, { type: 'error', message: `Göç işlemi hatası: ${error.message}` }]);
    } finally {
      restoreConsole();
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Veri Göçü Yönetimi</h1>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Uyarı:</strong> Bu sayfa artık aktif olarak kullanılmamaktadır. Supabase entegrasyonu tamamlanmış ve mock veri dosyaları kaldırılmıştır. Bu sayfa sadece referans amaçlı tutulmaktadır.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Mock Verilerden Supabase'e Göç</h2>
        
        <div className="mb-4">
          <label htmlFor="migration-type" className="block mb-2 font-medium">Göç Tipi:</label>
          <select 
            id="migration-type"
            className="w-full p-2 border rounded"
            value={selectedMigration}
            onChange={(e) => setSelectedMigration(e.target.value)}
            disabled={isLoading}
          >
            <option value="all">Tüm Veriler</option>
            <option value="users">Sadece Kullanıcılar</option>
            <option value="stores">Sadece Mağazalar</option>
            <option value="products">Sadece Ürünler</option>
            <option value="orders">Sadece Siparişler</option>
            <option value="campaigns">Sadece Kampanyalar</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <button
            onClick={startMigration}
            disabled={isLoading}
            className={`px-4 py-2 rounded font-medium ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading ? 'Göç İşlemi Sürüyor...' : 'Göç İşlemini Başlat'}
          </button>
          
          {isLoading && (
            <div className="ml-3">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          <p>Not: Bu işlem artık tam olarak çalışmayacaktır çünkü mock veri dosyaları kaldırılmıştır. Bu sayfa sadece geliştirme referansı için tutulmaktadır.</p>
        </div>
      </div>
      
      {logs.length > 0 && (
        <div className="bg-black rounded-lg p-4 text-white font-mono text-sm">
          <h3 className="text-lg font-semibold mb-2">İşlem Kayıtları</h3>
          <div className="max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`mb-1 ${log.type === 'error' ? 'text-red-400' : 'text-green-300'}`}
              >
                {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
