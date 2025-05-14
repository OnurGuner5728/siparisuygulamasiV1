'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import StoreGuard from '@/components/StoreGuard';
import { storeOrdersData } from '@/app/data/mockdatas';

export default function StoreOrderDetail() {
  return (
    <StoreGuard>
      <StoreOrderDetailContent />
    </StoreGuard>
  );
}

function StoreOrderDetailContent() {
    const params = useParams();
    const router = useRouter();
    const orderId = params?.id ? parseInt(params.id) : null;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Mock veriyi ortak dosyadan kullanıyoruz
    const fetchOrderDetails = () => {
      setLoading(true);
      setTimeout(() => {
        // Sipariş ID'sine göre siparişi bul
        const orderData = storeOrdersData.find(o => o.id === orderId);
        
        if (orderData) {
          setOrder(orderData);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
        
        setLoading(false);
      }, 1000);
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Sipariş durumunu güncelleme
  const handleChangeStatus = (newStatus) => {
    if (!order) return;
    
    const statusMap = {
      'preparing': 'Hazırlanıyor',
      'onway': 'Yola Çıktı',
      'delivered': 'Teslim Edildi',
      'cancelled': 'İptal Edildi'
    };
    
    // Yeni durum geçmişi oluştur
    const newStatusHistory = [
      ...order.statusHistory,
      { 
        status: newStatus, 
        date: new Date().toISOString(), 
        note: `Durum "${statusMap[newStatus]}" olarak güncellendi` 
      }
    ];
    
    setOrder({
      ...order,
      status: newStatus,
      statusHistory: newStatusHistory
    });
  };

  // Sipariş durumunu formatla
  const formatStatus = (status) => {
    switch (status) {
      case 'preparing':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Hazırlanıyor</span>;
      case 'onway':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Yolda</span>;
      case 'delivered':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Teslim Edildi</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">İptal Edildi</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Bilinmiyor</span>;
    }
  };

  // Formatlanmış tarih
  const formatDate = (dateString) => {
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

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
          {error || 'Sipariş bilgileri yüklenirken bir hata oluştu.'}
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
          <p className="text-gray-600 mt-1">#{order.id}</p>
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
                <div className="text-xl font-semibold text-gray-800 mr-4">Sipariş #{order.id}</div>
                {formatStatus(order.status)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formatDate(order.date)}
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-2">
              {order.status === 'preparing' && (
                <button 
                  onClick={() => handleChangeStatus('onway')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
                >
                  Yola Çıktı İşaretle
                </button>
              )}
              {order.status === 'onway' && (
                <button 
                  onClick={() => handleChangeStatus('delivered')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Teslim Edildi İşaretle
                </button>
              )}
              {(order.status === 'preparing' || order.status === 'onway') && (
                <button 
                  onClick={() => handleChangeStatus('cancelled')}
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
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.price.toFixed(2)} TL</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">x{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.total.toFixed(2)} TL</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      Ara Toplam
                    </td>
                    <td className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      {order.subtotal.toFixed(2)} TL
                    </td>
                  </tr>
                  {order.discount > 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                        İndirim
                      </td>
                      <td className="px-6 py-3 text-left text-sm font-medium text-green-600">
                        -{order.discount.toFixed(2)} TL
                      </td>
                    </tr>
                  )}
                  {order.deliveryFee > 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                        Teslimat Ücreti
                      </td>
                      <td className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        {order.deliveryFee.toFixed(2)} TL
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan="3" className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Toplam
                    </td>
                    <td className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      {order.total.toFixed(2)} TL
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Sipariş Geçmişi */}
            <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-4">Sipariş Geçmişi</h2>
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-4">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="relative pl-10">
                    <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white">
                      <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between">
                        <div className="font-medium">{
                          history.status === 'preparing' ? 'Hazırlanıyor' :
                          history.status === 'onway' ? 'Yola Çıktı' :
                          history.status === 'delivered' ? 'Teslim Edildi' :
                          history.status === 'cancelled' ? 'İptal Edildi' : 'Bilinmiyor'
                        }</div>
                        <div className="text-sm text-gray-500">{formatDate(history.date)}</div>
                      </div>
                      {history.note && (
                        <div className="text-sm text-gray-600 mt-1">{history.note}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sağ Kısım - Müşteri Bilgileri */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Müşteri Bilgileri</h2>
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <div className="text-sm font-medium text-gray-900 mb-1">{order.customer.name}</div>
              <div className="text-sm text-gray-600 mb-1">{order.customer.phone}</div>
              <div className="text-sm text-gray-600">{order.customer.fullAddress}</div>
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mb-4">Sipariş Bilgileri</h2>
            <div className="bg-gray-50 p-4 rounded-md space-y-3">
              <div>
                <span className="text-sm text-gray-500">Sipariş Tarihi</span>
                <p className="text-sm font-medium">{formatDate(order.date)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Ödeme Yöntemi</span>
                <p className="text-sm font-medium">{order.paymentMethod === 'card' ? 'Kredi Kartı' : 'Nakit'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Tahmini Teslimat</span>
                <p className="text-sm font-medium">{order.deliveryTime}</p>
              </div>
              {order.notes && (
                <div>
                  <span className="text-sm text-gray-500">Sipariş Notu</span>
                  <p className="text-sm font-medium">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 