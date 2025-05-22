'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';

export default function StoreOrderDetail() {
  return (
    <AuthGuard requiredRole="store" permissionType="view">
      <StoreOrderDetailContent />
    </AuthGuard>
  );
}

function StoreOrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [store, setStore] = useState(null);

  useEffect(() => {
    // Sipariş detaylarını API'den al
    const fetchOrderDetails = async () => {
      if (!user?.id || !orderId) return;
      
      try {
        setLoading(true);
        
        // Kullanıcının mağazasını bul
        const userStores = await api.getStores({ owner_id: user.id });
        
        if (!userStores || userStores.length === 0) {
          setError('Mağaza bilgisi bulunamadı.');
          setLoading(false);
          return;
        }
        
        const storeData = userStores[0]; // İlk mağazayı al
        setStore(storeData);
        
        // Sipariş detaylarını getir
        const orderData = await api.getOrderById(orderId);
        
        if (!orderData) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        // Siparişin mağazaya ait olup olmadığını kontrol et
        if (orderData.store_id !== storeData.id) {
          setError('Bu siparişi görüntüleme yetkiniz yok.');
          setLoading(false);
          return;
        }
        
        // Sipariş ürünlerini getir
        const orderItems = await api.getOrderItems(orderId);
        
        // Kullanıcı bilgilerini getir
        let customerInfo = { name: 'Bilinmeyen Kullanıcı' };
        if (orderData.user_id) {
          try {
            const userData = await api.getUserById(orderData.user_id);
            if (userData) {
              customerInfo = userData;
            }
          } catch (e) {
            console.error('Kullanıcı bilgileri alınamadı:', e);
          }
        }
        
        // Tam sipariş nesnesi oluştur
        const completeOrder = {
          ...orderData,
          items: orderItems || [],
          customer: customerInfo,
          statusHistory: orderData.status_history || []
        };
        
        setOrder(completeOrder);
        setNotFound(false);
      } catch (err) {
        console.error('Sipariş detayları yüklenirken hata:', err);
        setError('Sipariş detayları yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId && user?.id) {
      fetchOrderDetails();
    }
  }, [orderId, user]);

  // Sipariş durumunu güncelleme
  const handleChangeStatus = async (newStatus) => {
    if (!order || !orderId) return;
    
    try {
      // API üzerinden sipariş durumunu güncelle
      await api.updateOrder(orderId, { status: newStatus });
      
      // Yeni durum geçmişi oluştur
      const statusMap = {
        'pending': 'Onay Bekliyor',
        'preparing': 'Hazırlanıyor',
        'on_the_way': 'Yola Çıktı',
        'delivered': 'Teslim Edildi',
        'canceled': 'İptal Edildi'
      };
      
      const newStatusHistory = [
        ...(order.statusHistory || []),
        { 
          status: newStatus, 
          date: new Date().toISOString(), 
          note: `Durum "${statusMap[newStatus] || newStatus}" olarak güncellendi` 
        }
      ];
      
      // UI'ı güncelle
      setOrder({
        ...order,
        status: newStatus,
        statusHistory: newStatusHistory
      });
      
    } catch (error) {
      console.error('Sipariş durumu güncellenirken hata:', error);
      alert('Sipariş durumu güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  // Sipariş durumunu formatla
  const formatStatus = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Onay Bekliyor</span>;
      case 'preparing':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Hazırlanıyor</span>;
      case 'on_the_way':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Yolda</span>;
      case 'delivered':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Teslim Edildi</span>;
      case 'canceled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">İptal Edildi</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Bilinmiyor</span>;
    }
  };

  // Formatlanmış tarih
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Sipariş Bulunamadı</h1>
          <p className="text-gray-600 mb-6">İstediğiniz ID ({orderId}) ile eşleşen bir sipariş bulunamadı.</p>
          <Link 
            href="/store/orders"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Siparişlere Dön
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
          {error}
        </div>
        <Link 
          href="/store/orders"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Siparişlere Dön
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
          Sipariş bilgileri yüklenirken bir hata oluştu.
        </div>
        <Link 
          href="/store/orders"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Siparişlere Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sipariş Detayı</h1>
          <p className="text-gray-600 mt-1">#{order.id?.substring(0, 8)}</p>
        </div>
        <Link 
          href="/store/orders"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Siparişlere Dön
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        {/* Sipariş Özeti */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <div className="flex items-center">
                <div className="text-xl font-semibold text-gray-800 mr-4">Sipariş #{order.id?.substring(0, 8)}</div>
                {formatStatus(order.status)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formatDate(order.order_date || order.created_at)}
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-2">
              {order.status === 'pending' && (
                <button 
                  onClick={() => handleChangeStatus('preparing')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Kabul Et
                </button>
              )}
              {order.status === 'preparing' && (
                <button 
                  onClick={() => handleChangeStatus('on_the_way')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Yola Çıktı İşaretle
                </button>
              )}
              {order.status === 'on_the_way' && (
                <button 
                  onClick={() => handleChangeStatus('delivered')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Teslim Edildi İşaretle
                </button>
              )}
              {(order.status === 'pending' || order.status === 'preparing') && (
                <button 
                  onClick={() => {
                    if (window.confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
                      handleChangeStatus('canceled');
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  İptal Et
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sipariş İçeriği ve Bilgileri */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sol Kısım - Sipariş Ürünleri */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Sipariş İçeriği</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürün
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adet
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Toplam
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items && order.items.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.product_name || item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{(item.price || 0).toFixed(2)} TL</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">x{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {((item.price || 0) * (item.quantity || 1)).toFixed(2)} TL
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-right font-medium">
                      Ara Toplam:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {(order.subtotal || 0).toFixed(2)} TL
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-right font-medium">
                      Teslimat Ücreti:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {(order.delivery_fee || 0).toFixed(2)} TL
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-right font-medium">
                      Toplam:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">
                        {(order.total || 0).toFixed(2)} TL
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Sağ Kısım - Müşteri ve Teslimat Bilgileri */}
          <div className="md:col-span-1">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Müşteri Bilgileri</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm font-medium text-gray-800">{order.customer?.name || 'Bilinmeyen Kullanıcı'}</div>
                {order.customer?.phone && (
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Telefon: </span>{order.customer.phone}
                  </div>
                )}
                {order.customer?.email && (
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">E-posta: </span>{order.customer.email}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Teslimat Bilgileri</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Adres: </span>
                  {order.delivery_address || 'Adres bilgisi bulunamadı'}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Teslimat Notu: </span>
                  {order.delivery_note || 'Not belirtilmemiş'}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Sipariş Durumu Geçmişi</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <ul className="space-y-3">
                  {order.statusHistory && order.statusHistory.length > 0 ? 
                    order.statusHistory.map((history, index) => (
                      <li key={index} className="text-sm">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          <div className="font-medium">{formatStatus(history.status)}</div>
                        </div>
                        <div className="ml-5 mt-1 text-gray-600">
                          {formatDate(history.date)}
                        </div>
                        {history.note && (
                          <div className="ml-5 mt-1 text-gray-600">
                            {history.note}
                          </div>
                        )}
                      </li>
                    )) : 
                    <li className="text-sm text-gray-600">Durum geçmişi bulunamadı</li>
                  }
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 