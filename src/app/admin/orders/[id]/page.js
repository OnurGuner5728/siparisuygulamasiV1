'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api'; // API servisini import et

export default function OrderDetails() {
  return (
    <AuthGuard requiredRole="admin">
      <OrderDetailsContent />
    </AuthGuard>
  );
}

function OrderDetailsContent() {
  const params = useParams();
  const orderId = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        setNotFound(true); // ID yoksa bulunamadı olarak işaretle
        return;
      }
      setLoading(true);
      try {
        const orderData = await api.getOrderById(orderId);
        if (orderData) {
          setOrder(orderData);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Sipariş detayı yüklenirken hata:", err);
        setError('Sipariş detayı yüklenirken bir sorun oluştu.');
        setNotFound(true); // Hata durumunda da bulunamadı olarak işaretle
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Dropdown dışına tıklandığında kapatma
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStatusDropdown && !event.target.closest('.status-dropdown')) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown]);

  // Sipariş durumunu değiştirme
  const handleChangeStatus = async (newStatus) => {
    if (!order) return;
    const now = new Date().toISOString();
    
    try {
      // Önceki statusHistory'yi al, eğer yoksa boş bir dizi kullan
      const prevStatusHistory = order.status_history || [];
      
      const statusNote = {
        pending: 'Sipariş beklemede',
        processing: 'Sipariş hazırlanıyor',
        shipped: 'Sipariş yolda',
        delivered: 'Sipariş teslim edildi',
        cancelled: 'Sipariş iptal edildi'
      };

      const updatedStatusHistory = [
        ...prevStatusHistory,
        {
          status: newStatus,
          timestamp: now,
          note: statusNote[newStatus] || 'Durum güncellendi'
        }
      ];

      const updates = {
        status: newStatus,
        status_history: updatedStatusHistory,
      };

      if (newStatus === 'delivered') {
        updates.delivery_date = now;
      }

      const updatedOrder = await api.updateOrder(order.id, updates);
      setOrder(updatedOrder);

    } catch (err) {
      console.error("Sipariş durumu güncellenirken hata:", err);
      alert('Sipariş durumu güncellenemedi: ' + (err.message || 'Bilinmeyen hata'));
    }
  };

  // Sipariş durumunu formatla
  const formatStatus = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Beklemede</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Hazırlanıyor</span>;
      case 'shipped':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Yolda</span>;
      case 'delivered':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Teslim Edildi</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">İptal Edildi</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Bilinmiyor</span>;
    }
  };

  // Ödeme yöntemini formatla
  const formatPaymentMethod = (method) => {
    switch (method) {
      case 'online':
        return 'Online Ödeme';
      case 'cash':
        return 'Nakit Ödeme';
      default:
        return 'Bilinmiyor';
    }
  };

  // Ödeme durumunu formatla
  const formatPaymentStatus = (status) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Ödendi</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Beklemede</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Başarısız</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Bilinmiyor</span>;
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
            {error ? 'Hata' : 'Sipariş Bulunamadı'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || `İstediğiniz ID (${orderId}) ile eşleşen bir sipariş bulunamadı.`}
          </p>
          <Link 
            href="/admin/orders"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Sipariş Listesine Dön
          </Link>
        </div>
      </div>
    );
  }
  
  // order.customer, order.store, order.delivery_address, order.order_items verilerinin varlığını kontrol et
  const customer = order.customer || {};
  const store = order.store || {};
  const deliveryAddress = order.delivery_address || {};
  const orderItems = order.order_items || [];
  const statusHistory = order.status_history || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sipariş Detayı</h1>
          <p className="text-gray-600 mt-1">Sipariş No: {order.id.substring(0,8)}...</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative status-dropdown">
            <button 
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Durumu Güncelle
              <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showStatusDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-20 border border-gray-100">
                <div className="py-2" role="menu" aria-orientation="vertical">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Sipariş Durumu Seçin
                  </div>
                  
                  <button
                    onClick={() => {
                      handleChangeStatus('pending');
                      setShowStatusDropdown(false);
                    }}
                    className="group flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-800 transition-all duration-150"
                  >
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3 group-hover:scale-110 transition-transform"></div>
                    <div>
                      <div className="font-medium">Beklemede</div>
                      <div className="text-xs text-gray-500">Sipariş onay bekliyor</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleChangeStatus('processing');
                      setShowStatusDropdown(false);
                    }}
                    className="group flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-all duration-150"
                  >
                    <div className="w-3 h-3 bg-blue-400 rounded-full mr-3 group-hover:scale-110 transition-transform"></div>
                    <div>
                      <div className="font-medium">Hazırlanıyor</div>
                      <div className="text-xs text-gray-500">Sipariş hazırlanmaya başlandı</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleChangeStatus('shipped');
                      setShowStatusDropdown(false);
                    }}
                    className="group flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-800 transition-all duration-150"
                  >
                    <div className="w-3 h-3 bg-orange-400 rounded-full mr-3 group-hover:scale-110 transition-transform"></div>
                    <div>
                      <div className="font-medium">Yolda</div>
                      <div className="text-xs text-gray-500">Sipariş müşteriye gönderildi</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleChangeStatus('delivered');
                      setShowStatusDropdown(false);
                    }}
                    className="group flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800 transition-all duration-150"
                  >
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-3 group-hover:scale-110 transition-transform"></div>
                    <div>
                      <div className="font-medium">Teslim Edildi</div>
                      <div className="text-xs text-gray-500">Sipariş başarıyla teslim edildi</div>
                    </div>
                  </button>
                  
                  <div className="border-t border-gray-100 mt-1">
                    <button
                      onClick={() => {
                        handleChangeStatus('cancelled');
                        setShowStatusDropdown(false);
                      }}
                      className="group flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-800 transition-all duration-150"
                    >
                      <div className="w-3 h-3 bg-red-400 rounded-full mr-3 group-hover:scale-110 transition-transform"></div>
                      <div>
                        <div className="font-medium">İptal Edildi</div>
                        <div className="text-xs text-gray-500">Sipariş iptal edildi</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Link 
            href="/admin/orders"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Sipariş Listesine Dön
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sipariş Özeti */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Sipariş Özeti</h2>
              <div className="flex items-center">
                {formatStatus(order.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Sipariş Tarihi</p>
                <p className="font-medium">{new Date(order.order_date).toLocaleString('tr-TR')}</p>
              </div>
              {order.delivery_date && (
                <div>
                  <p className="text-sm text-gray-600">Teslim Tarihi</p>
                  <p className="font-medium">{new Date(order.delivery_date).toLocaleString('tr-TR')}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Ödeme Yöntemi</p>
                <p className="font-medium">{formatPaymentMethod(order.payment_method)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ödeme Durumu</p>
                <div>{formatPaymentStatus(order.payment_status)}</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Sipariş Ürünleri</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ürün
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Miktar
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Birim Fiyat
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Toplam
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.product?.name || item.name}</div>
                          {item.notes && <div className="text-xs text-gray-500">Not: {item.notes}</div>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.quantity}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.price.toFixed(2)} TL</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{(item.price * item.quantity).toFixed(2)} TL</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ara Toplam:</span>
                  <span>{order.subtotal.toFixed(2)} TL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teslimat Ücreti:</span>
                  <span>{order.delivery_fee.toFixed(2)} TL</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>İndirim:</span>
                    <span>-{order.discount.toFixed(2)} TL</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Toplam:</span>
                  <span>{order.total.toFixed(2)} TL</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Müşteri, Mağaza ve Adres Bilgileri */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Müşteri Bilgileri</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Ad Soyad</p>
                <p className="font-medium">{customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefon</p>
                <p className="font-medium">{customer.phone || 'Belirtilmemiş'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">E-posta</p>
                <p className="font-medium">{customer.email}</p>
              </div>
              {order.customer_id && (
                <div className="pt-2">
                  <Link 
                    href={`/admin/users/${order.customer_id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Müşteri Profili →
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Mağaza Bilgileri</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">İsim</p>
                <p className="font-medium">{store.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefon</p>
                <p className="font-medium">{store.phone || 'Belirtilmemiş'}</p>
              </div>
              {/* Kategori bilgisi store objesinden alınabilir, gerekirse api.js'de stores sorgusuna eklenebilir */}
              {/* <div>
                <p className="text-sm text-gray-600">Kategori</p>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  {order.category} 
                </span>
              </div> */}
              {order.store_id && (
                <div className="pt-2">
                  <Link 
                    href={`/admin/stores/${order.store_id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Mağaza Profili →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {deliveryAddress && Object.keys(deliveryAddress).length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Teslimat Adresi</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Ad Soyad</p>
                  <p className="font-medium">{deliveryAddress.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telefon</p>
                  <p className="font-medium">{deliveryAddress.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Adres</p>
                  <p className="font-medium">
                    {deliveryAddress.neighborhood}, {deliveryAddress.full_address}, {deliveryAddress.district}/{deliveryAddress.city}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sipariş Durumu Geçmişi */}
      {statusHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Sipariş Geçmişi</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <ul className="space-y-4">
              {statusHistory.map((history, index) => (
                <li key={index} className="relative pl-10">
                  <div className="absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-gray-200 bg-white z-10">
                    {history.status === 'pending' && (
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    )}
                    {history.status === 'processing' && (
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                    )}
                    {history.status === 'shipped' && (
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h1a1 1 0 010 2H4.414l1.707 1.707a1 1 0 01-.707.707L4 6.586V9a1 1 0 11-2 0V4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {history.status === 'delivered' && (
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {history.status === 'cancelled' && (
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{history.note}</p>
                    <p className="text-sm text-gray-500">{new Date(history.timestamp).toLocaleString('tr-TR')}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 