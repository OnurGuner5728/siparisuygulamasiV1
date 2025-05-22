'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  testGetActiveCampaigns, 
  testGetUserOrderSummary,
  testGetStoreTopCustomers,
  testGetStoreTopProducts 
} from '@/lib/supabaseTestFunctions';

export default function TestFunctionsPage() {
  const { user, isAuthenticated } = useAuth();
  const [campaignResults, setCampaignResults] = useState(null);
  const [orderResults, setOrderResults] = useState(null);
  const [customerResults, setCustomerResults] = useState(null);
  const [productResults, setProductResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storeId, setStoreId] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  
  const runCampaignTest = async () => {
    setLoading(true);
    try {
      const results = await testGetActiveCampaigns(categoryId);
      setCampaignResults(results);
    } catch (error) {
      console.error('Test hatası:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const runOrderTest = async () => {
    if (!user?.id) {
      alert('Bu testi çalıştırmak için giriş yapmalısınız!');
      return;
    }
    
    setLoading(true);
    try {
      const results = await testGetUserOrderSummary(user.id);
      setOrderResults(results);
    } catch (error) {
      console.error('Test hatası:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const runCustomerTest = async () => {
    if (!storeId) {
      alert('Mağaza ID girmelisiniz!');
      return;
    }
    
    setLoading(true);
    try {
      const results = await testGetStoreTopCustomers(storeId);
      setCustomerResults(results);
    } catch (error) {
      console.error('Test hatası:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const runProductTest = async () => {
    if (!storeId) {
      alert('Mağaza ID girmelisiniz!');
      return;
    }
    
    setLoading(true);
    try {
      const results = await testGetStoreTopProducts(storeId);
      setProductResults(results);
    } catch (error) {
      console.error('Test hatası:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Supabase Fonksiyon Testleri</h1>
      
      <div className="grid gap-6">
        {/* Kampanya Testi */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Aktif Kampanyalar Testi</h2>
          <div className="mb-3">
            <label className="block text-sm mb-1">Kategori ID:</label>
            <input 
              type="number" 
              value={categoryId}
              onChange={(e) => setCategoryId(parseInt(e.target.value))}
              className="border rounded px-2 py-1 w-32"
            />
          </div>
          <button 
            onClick={runCampaignTest}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Testi Çalıştır
          </button>
          
          {campaignResults && (
            <div className="mt-4">
              {campaignResults.success ? (
                <div className="bg-green-100 p-3 rounded">
                  <p className="text-green-700 font-medium">Başarılı!</p>
                  <pre className="mt-2 text-sm bg-white p-2 rounded overflow-auto max-h-60">
                    {JSON.stringify(campaignResults.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="bg-red-100 p-3 rounded">
                  <p className="text-red-700 font-medium">Hata!</p>
                  <pre className="mt-2 text-sm bg-white p-2 rounded overflow-auto max-h-60">
                    {JSON.stringify(campaignResults.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Sipariş Özeti Testi */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Kullanıcı Sipariş Özeti Testi</h2>
          <p className="mb-3 text-sm">
            Bu test için giriş yapmış olmanız gerekiyor. 
            {!isAuthenticated && <span className="text-red-500 font-medium ml-1">Giriş yapmadınız!</span>}
            {isAuthenticated && <span className="text-green-500 font-medium ml-1">Giriş yaptınız (ID: {user?.id})</span>}
          </p>
          
          <button 
            onClick={runOrderTest}
            disabled={loading || !isAuthenticated}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Testi Çalıştır
          </button>
          
          {orderResults && (
            <div className="mt-4">
              {orderResults.success ? (
                <div className="bg-green-100 p-3 rounded">
                  <p className="text-green-700 font-medium">Başarılı!</p>
                  <pre className="mt-2 text-sm bg-white p-2 rounded overflow-auto max-h-60">
                    {JSON.stringify(orderResults.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="bg-red-100 p-3 rounded">
                  <p className="text-red-700 font-medium">Hata!</p>
                  <pre className="mt-2 text-sm bg-white p-2 rounded overflow-auto max-h-60">
                    {JSON.stringify(orderResults.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Mağaza Testleri */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Mağaza Testleri</h2>
          <div className="mb-3">
            <label className="block text-sm mb-1">Mağaza ID:</label>
            <input 
              type="text" 
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              placeholder="UUID formatında mağaza ID girin"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={runCustomerTest}
              disabled={loading || !storeId}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Müşteri Testi
            </button>
            
            <button 
              onClick={runProductTest}
              disabled={loading || !storeId}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Ürün Testi
            </button>
          </div>
          
          {customerResults && (
            <div className="mt-4">
              <h3 className="font-medium mb-1">Müşteri Testi Sonucu:</h3>
              {customerResults.success ? (
                <div className="bg-green-100 p-3 rounded">
                  <p className="text-green-700 font-medium">Başarılı!</p>
                  <pre className="mt-2 text-sm bg-white p-2 rounded overflow-auto max-h-60">
                    {JSON.stringify(customerResults.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="bg-red-100 p-3 rounded">
                  <p className="text-red-700 font-medium">Hata!</p>
                  <pre className="mt-2 text-sm bg-white p-2 rounded overflow-auto max-h-60">
                    {JSON.stringify(customerResults.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          {productResults && (
            <div className="mt-4">
              <h3 className="font-medium mb-1">Ürün Testi Sonucu:</h3>
              {productResults.success ? (
                <div className="bg-green-100 p-3 rounded">
                  <p className="text-green-700 font-medium">Başarılı!</p>
                  <pre className="mt-2 text-sm bg-white p-2 rounded overflow-auto max-h-60">
                    {JSON.stringify(productResults.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="bg-red-100 p-3 rounded">
                  <p className="text-red-700 font-medium">Hata!</p>
                  <pre className="mt-2 text-sm bg-white p-2 rounded overflow-auto max-h-60">
                    {JSON.stringify(productResults.error, null, 2)}
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