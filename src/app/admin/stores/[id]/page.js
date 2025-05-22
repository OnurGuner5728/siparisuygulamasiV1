'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api'; // API servisini import et

export default function StoreDetail() {
  return (
    <AuthGuard requiredRole="admin">
      <StoreDetailContent />
    </AuthGuard>
  );
}

function StoreDetailContent() {
  const params = useParams();
  const storeId = params?.id;
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [storeStats, setStoreStats] = useState({ ordersCount: 0, totalRevenue: 0, averageOrderValue: 0 });
  const [mainCategory, setMainCategory] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!storeId) {
        setLoading(false);
        setNotFound(true);
        return;
      }
      setLoading(true);
      try {
        const storeData = await api.getStoreById(storeId);
        if (storeData) {
          setStore(storeData);
          
          // Mağaza ürünlerini getir
          const productsData = await api.getProductsByStoreId(storeId);
          setProducts(productsData);

          // Mağaza sahibini getir (storeData.owner_id varsa)
          if (storeData.owner_id) {
            const ownerData = await api.getUserById(storeData.owner_id);
            setOwner(ownerData);
          }

          // Ana kategoriyi getir (storeData.category_id varsa)
          if (storeData.category_id) {
            const categoryData = await api.getCategoryById(storeData.category_id);
            setMainCategory(categoryData);
          }

          // Mağaza istatistiklerini hesapla (siparişler üzerinden)
          const orders = await api.getAllOrders({ store_id: storeId });
          const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
          const ordersCount = orders.length;
          const averageOrderValue = ordersCount > 0 ? totalRevenue / ordersCount : 0;
          setStoreStats({ ordersCount, totalRevenue, averageOrderValue });

          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Mağaza detayları yüklenirken hata:", err);
        setError('Mağaza detayları yüklenirken bir sorun oluştu.');
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId]);

  // Durum rengini formatla
  const formatStatus = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Aktif</span>;
      case 'inactive':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Pasif</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Beklemede</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Bilinmiyor</span>;
    }
  };

  // Onay durumunu formatla
  const formatApproval = (approved) => {
    if (approved) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Onaylı</span>;
    } else {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Onay Bekliyor</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (notFound || error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error ? 'Hata' : 'Mağaza Bulunamadı'}
            </h1>
          <p className="text-gray-600 mb-6">
            {error || `İstediğiniz ID (${storeId}) ile eşleşen bir mağaza bulunamadı.`}
          </p>
          <Link 
            href="/admin/stores"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Mağazalar Listesine Dön
          </Link>
        </div>
      </div>
    );
  }

  const workingHours = store?.working_hours || {};
  const modulePermissions = store?.module_permissions || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{store.name}</h1>
          <p className="text-gray-600 mt-1">Mağaza ID: {store.id.substring(0,8)}...</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href={`/admin/stores/edit/${store.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Düzenle
          </Link>
          <Link 
            href="/admin/stores"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Mağazalar Listesine Dön
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ana Bilgiler */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Mağaza Bilgileri</h2>
              <div className="flex items-center space-x-2">
                {formatStatus(store.status)}
                {formatApproval(store.approved)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Mağaza Sahibi</p>
                  <p className="font-medium">{owner?.name || 'Belirtilmemiş'}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">E-posta</p>
                  <p className="font-medium">{store.email}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Telefon</p>
                  <p className="font-medium">{store.phone}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Kategori</p>
                  <p className="font-medium">{mainCategory?.name || 'Belirtilmemiş'}</p>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Adres</p>
                  <p className="font-medium">{store.address}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Kayıt Tarihi</p>
                  <p className="font-medium">{new Date(store.created_at).toLocaleDateString('tr-TR')}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Puan</p>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </span>
                    <span className="font-medium">{store.rating > 0 ? store.rating.toFixed(1) : 'Henüz puanlanmadı'}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Açıklama</p>
                  <p className="font-medium">{store.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ürünler / Menü */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {mainCategory?.name === 'Yemek' ? 'Menü' : 'Ürünler'} ({products.length})
            </h2>
            {products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ürün Adı
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori (Alt)
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fiyat
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.sub_category || '-'} { /* Alt kategori alanı varsa göster, yoksa tire */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.price.toFixed(2)} TL
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Bu mağazaya ait ürün bulunmamaktadır.</p>
            )}
          </div>
        </div>

        {/* Yan Bilgiler */}
        <div>
          {/* İstatistikler */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">İstatistikler</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">Toplam Sipariş</p>
                <p className="text-2xl font-bold text-blue-700">{storeStats.ordersCount}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold text-green-700">{storeStats.totalRevenue.toFixed(2)} TL</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">Ortalama Sipariş Tutarı</p>
                <p className="text-2xl font-bold text-purple-700">{storeStats.averageOrderValue?.toFixed(2) || '0.00'} TL</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">Komisyon Oranı</p>
                <p className="text-2xl font-bold text-yellow-700">%{store.commission_rate?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>

          {/* Ödeme Linki */}
          {store.payment_link && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Ödeme Bilgileri</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-md border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Komisyon Ödeme Linki</p>
                  <a 
                    href={store.payment_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 font-medium break-all"
                  >
                    {store.payment_link}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Çalışma Saatleri */}
          {Object.keys(workingHours).length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Çalışma Saatleri</h2>
              <div className="space-y-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <div key={day} className="flex justify-between">
                    <span className="font-medium capitalize">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                    <span>
                      {workingHours[day]?.is_open 
                        ? `${workingHours[day]?.open} - ${workingHours[day]?.close}` 
                        : 'Kapalı'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modül İzinleri */}
          {Object.keys(modulePermissions).length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Modül İzinleri</h2>
              <div className="space-y-2">
                {Object.entries(modulePermissions).map(([module, isAllowed]) => (
                  <div key={module} className="flex items-center">
                    <span className={`w-4 h-4 rounded-full mr-2 ${isAllowed ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className="capitalize">{module.replace('enable_', '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 