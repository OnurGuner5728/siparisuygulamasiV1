'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';

export default function StorePanel() {
  return (
    <AuthGuard requiredRole="store">
      <StorePanelContent />
    </AuthGuard>
  );
}

function StorePanelContent() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalRevenue: 0,
    todaysOrders: 0,
    todaysRevenue: 0,
    recentOrders: [],
    commissionAmount: 0,
    netRevenue: 0,
    todayCommission: 0,
    todayNetRevenue: 0
  });

  useEffect(() => {
    // Sayfa yüklenirken loading'i false yap ve gerçek istatistikleri al
    const loadStoreStats = async () => {
      try {
        if (user?.storeInfo?.id) {
          // Database'den komisyon özetini al
          let commissionSummary = null;
          try {
            commissionSummary = await api.getStoreCommissionSummary(user.storeInfo.id);
          } catch (error) {
            console.warn('Komisyon özeti alınamadı, fallback hesaplama kullanılacak:', error.message);
            commissionSummary = null;
          }
          
          if (commissionSummary) {
            // Database'den gelen veriler
            setStats({
              totalOrders: commissionSummary.total_orders,
              activeOrders: 0, // Bu alan için ayrı sorgu gerekebilir
              totalRevenue: parseFloat(commissionSummary.total_revenue),
              todaysOrders: commissionSummary.today_orders,
              todaysRevenue: parseFloat(commissionSummary.today_revenue),
              recentOrders: [], // Bu alan için ayrı sorgu
              commissionAmount: parseFloat(commissionSummary.total_commission),
              netRevenue: parseFloat(commissionSummary.net_revenue),
              todayCommission: parseFloat(commissionSummary.today_commission),
              todayNetRevenue: parseFloat(commissionSummary.today_net_revenue)
            });
            
            // Aktif siparişleri ayrı al
            const orders = await api.getAllOrders({ store_id: user.storeInfo.id });
            const activeOrders = orders.filter(order => 
              order.status === 'pending' || order.status === 'processing'
            ).length;
            
            // Son siparişleri al
            const recentOrders = orders.slice(0, 5);
            
            // Stats'i güncelle
            setStats(prevStats => ({
              ...prevStats,
              activeOrders,
              recentOrders
            }));
          } else {
            // Komisyon özeti bulunamazsa fallback hesaplama kullan
            const orders = await api.getAllOrders({ store_id: user.storeInfo.id });
            
            const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
            const activeOrders = orders.filter(order => 
              order.status === 'pending' || order.status === 'processing'
            ).length;
            
            // Bugünkü siparişler
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todaysOrders = orders.filter(order => {
              const orderDate = new Date(order.order_date);
              orderDate.setHours(0, 0, 0, 0);
              return orderDate.getTime() === today.getTime();
            });
            
            const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.total, 0);
            const commissionRate = user.storeInfo.commission_rate || 0;
            const commissionAmount = (totalRevenue * commissionRate) / 100;
            const todayCommission = (todaysRevenue * commissionRate) / 100;
            
            setStats({
              totalOrders: orders.length,
              activeOrders,
              totalRevenue,
              todaysOrders: todaysOrders.length,
              todaysRevenue,
              recentOrders: orders.slice(0, 5),
              commissionAmount,
              netRevenue: totalRevenue - commissionAmount,
              todayCommission,
              todayNetRevenue: todaysRevenue - todayCommission
            });
          }
        }
      } catch (error) {
        console.error('İstatistikler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadStoreStats();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user?.storeInfo?.id]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshUser();
    } catch (error) {
      console.error('Yenileme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Mağaza onaylanmamışsa özel ekran göster
  if (!user?.storeInfo?.is_approved) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Mağaza Onayı Bekleniyor</h1>
              <p className="text-gray-600 mb-6">
                Mağaza başvurunuz admin onayında. Onaylandıktan sonra mağaza panelinize erişebilirsiniz.
              </p>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">Başvuru Detayları</h3>
              <div className="text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">İşletme Adı:</span>
                  <span className="font-medium">{user.storeInfo?.name || 'Belirtilmemiş'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">E-posta:</span>
                  <span className="font-medium">{user.storeInfo?.email || 'Belirtilmemiş'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Durum:</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm font-medium">
                    Onay Bekleniyor
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50"
              >
                {loading ? 'Kontrol Ediliyor...' : 'Onay Durumunu Kontrol Et'}
              </button>
              
              <Link
                href="/profil"
                className="inline-block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg"
              >
                Profilime Dön
              </Link>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">📞 Destek Gerekli mi?</h4>
              <p className="text-sm text-blue-700">
                Onay süreci hakkında sorularınız için destek ekibimizle iletişime geçebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mağaza Paneli</h1>
        <p className="text-gray-600 mt-1">Hoş geldiniz, {user?.storeInfo?.name}</p>
      </div>

      {!user?.storeInfo?.is_approved && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Mağazanız şu anda onay bekliyor. Onaylandıktan sonra satışa başlayabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}

      {user?.storeInfo?.status === 'inactive' && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Mağazanız şu anda pasif durumda. Profilinizden aktif etmeniz gerekiyor.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Toplam Sipariş</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Aktif Sipariş</div>
          <div className="text-2xl font-bold text-blue-600">{stats.activeOrders}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Toplam Kazanç</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Bugünkü Sipariş</div>
          <div className="text-2xl font-bold text-gray-900">{stats.todaysOrders}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Bugünkü Kazanç</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.todaysRevenue)}</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Komisyon Oranı</div>
          <div className="text-2xl font-bold text-orange-600">%{user?.storeInfo?.commission_rate || '0.00'}</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Komisyon Tutarı</div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(stats.commissionAmount)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Net Gelir</div>
          <div className="text-2xl font-bold text-teal-600">
            {formatCurrency(stats.netRevenue)}
          </div>
        </div>
      </div>

      {/* Komisyon Özeti */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Komisyon Özeti</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Toplam Gelir</h3>
            <p className="text-xl font-bold text-green-700">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-sm text-gray-500 mt-1">Tüm siparişlerden</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Platform Komisyonu</h3>
            <p className="text-xl font-bold text-red-700">
              {formatCurrency(stats.commissionAmount)}
            </p>
            <p className="text-sm text-gray-500 mt-1">%{user?.storeInfo?.commission_rate || '0.00'} komisyon</p>
          </div>
          <div className="bg-teal-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Sizin Alacağınız</h3>
            <p className="text-xl font-bold text-teal-700">
              {formatCurrency(stats.netRevenue)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Net gelir</p>
          </div>
        </div>
        
        {/* Günlük Komisyon */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-md font-semibold text-gray-700 mb-3">Bugünkü Durum</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Bugünkü Gelir</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(stats.todaysRevenue)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Bugünkü Komisyon</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(stats.todayCommission)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Bugünkü Net Kazanç</p>
              <p className="text-lg font-bold text-teal-600">
                {formatCurrency(stats.todayNetRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ödeme Linki */}
      {user?.storeInfo?.payment_link && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ödeme Linki</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-1">Mağaza Ödeme Linkiniz:</p>
                <p className="text-blue-600 font-medium truncate">{user.storeInfo.payment_link}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(user.storeInfo.payment_link);
                  alert('Ödeme linki panoya kopyalandı!');
                }}
                className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Kopyala
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hızlı Erişim Menüsü */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/store/orders" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Siparişler</h3>
              <p className="text-gray-600">Siparişleri görüntüle ve yönet</p>
            </div>
          </div>
        </Link>
        
        <Link href="/store/products" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Ürünler</h3>
              <p className="text-gray-600">Ürünlerinizi yönetin</p>
            </div>
          </div>
        </Link>
        
        <Link href="/store/profile" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Mağaza Profili</h3>
              <p className="text-gray-600">Profilinizi düzenleyin</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Son Siparişler */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Son Siparişler</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sipariş No
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      #{order.order_number || order.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user_name || 'Müşteri'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.order_date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'pending' ? 'Beklemede' :
                         order.status === 'processing' ? 'Hazırlanıyor' :
                         order.status === 'completed' ? 'Tamamlandı' :
                         order.status === 'cancelled' ? 'İptal Edildi' :
                         order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/store/orders/${order.id}`} className="text-blue-600 hover:text-blue-900">
                        Detay
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    Henüz sipariş bulunmuyor
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 
