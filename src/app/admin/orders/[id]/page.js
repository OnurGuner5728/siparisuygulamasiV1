'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';

export default function AdminOrderDetail() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminOrderDetailContent />
    </AuthGuard>
  );
}

function AdminOrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        
        // Sipariş detaylarını getir
        const orderData = await api.getOrderById(orderId);
        
        if (!orderData) {
          setError('Sipariş bulunamadı.');
          return;
        }
        
        // Sipariş ürünlerini getir
        const orderItems = await api.getOrderItems(orderId);
        
        // Tam sipariş nesnesi oluştur
        const completeOrder = {
          ...orderData,
          items: orderItems || [],
          statusHistory: orderData.status_history ? 
            (Array.isArray(orderData.status_history) ? 
              orderData.status_history : 
              JSON.parse(orderData.status_history)
            ) : []
        };
        
        setOrder(completeOrder);
      } catch (err) {
        console.error('Sipariş detayları yüklenirken hata:', err);
        setError('Sipariş detayları yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Sipariş durumunu güncelleme
  const handleChangeStatus = async (newStatus) => {
    if (!order || !orderId || updating) return;
    
    try {
      setUpdating(true);
      const now = new Date().toISOString();
      
      const statusNote = {
        pending: 'Sipariş beklemede',
        confirmed: 'Sipariş onaylandı',
        preparing: 'Sipariş hazırlanıyor',
        ready: 'Sipariş hazır',
        delivering: 'Sipariş yolda',
        delivered: 'Sipariş teslim edildi',
        cancelled: 'Sipariş iptal edildi'
      };

      const updates = {
        status: newStatus,
        status_history: {
          status: newStatus,
          timestamp: now,
          note: statusNote[newStatus] || 'Durum güncellendi'
        }
      };

      if (newStatus === 'delivered') {
        updates.actual_delivery_time = now;
        // Kapıda ödeme ise teslim edildiğinde ödeme durumunu güncelle
        if (order.payment_method === 'cash') {
          updates.payment_status = 'paid';
        }
      }

      // API üzerinden sipariş durumunu güncelle
      await api.updateOrder(orderId, updates);
      
      // Müşteriye bildirim gönder
      try {
        await api.createOrderStatusNotification(orderId, newStatus, order.user_id);
        console.log('Müşteriye bildirim gönderildi:', newStatus);
      } catch (notificationError) {
        console.error('Bildirim gönderilirken hata:', notificationError);
      }
      
      // Yeni durum geçmişi oluştur
      const newStatusHistory = [
        ...(order.statusHistory || []),
        { 
          status: newStatus, 
          timestamp: now, 
          note: statusNote[newStatus] || 'Durum güncellendi'
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
      alert('Sipariş durumu güncellenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setUpdating(false);
    }
  };

  // Ödeme durumunu güncelleme
  const handleChangePaymentStatus = async (newPaymentStatus) => {
    if (!order || !orderId || updating) return;
    
    try {
      setUpdating(true);
      
      await api.updateOrder(orderId, { payment_status: newPaymentStatus });
      
      setOrder({
        ...order,
        payment_status: newPaymentStatus
      });
      
    } catch (error) {
      console.error('Ödeme durumu güncellenirken hata:', error);
      alert('Ödeme durumu güncellenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setUpdating(false);
    }
  };

  // Sipariş durumunu formatla
  const formatStatus = (status) => {
    const statusConfig = {
      pending: { text: 'Beklemede', bg: 'bg-yellow-100', color: 'text-yellow-800' },
      confirmed: { text: 'Onaylandı', bg: 'bg-blue-100', color: 'text-blue-800' },
      preparing: { text: 'Hazırlanıyor', bg: 'bg-blue-100', color: 'text-blue-800' },
      ready: { text: 'Hazır', bg: 'bg-purple-100', color: 'text-purple-800' },
      delivering: { text: 'Yolda', bg: 'bg-orange-100', color: 'text-orange-800' },
      delivered: { text: 'Teslim Edildi', bg: 'bg-green-100', color: 'text-green-800' },
      cancelled: { text: 'İptal Edildi', bg: 'bg-red-100', color: 'text-red-800' }
    };

    const config = statusConfig[status] || { text: 'Bilinmiyor', bg: 'bg-gray-100', color: 'text-gray-800' };
    
    return (
      <span className={`px-3 py-1 ${config.bg} ${config.color} rounded-full text-sm font-medium`}>
        {config.text}
      </span>
    );
  };

  // Ödeme durumunu formatla
  const formatPaymentStatus = (status) => {
    const statusConfig = {
      paid: { text: 'Ödendi', bg: 'bg-green-100', color: 'text-green-800' },
      pending: { text: 'Beklemede', bg: 'bg-yellow-100', color: 'text-yellow-800' },
      refunded: { text: 'İade Edildi', bg: 'bg-gray-100', color: 'text-gray-800' }
    };

    const config = statusConfig[status] || { text: 'Bilinmiyor', bg: 'bg-gray-100', color: 'text-gray-800' };
    
    return (
      <span className={`px-2 py-1 ${config.bg} ${config.color} rounded-full text-xs font-medium`}>
        {config.text}
      </span>
    );
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

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
          {error || 'Sipariş bilgileri yüklenirken bir hata oluştu.'}
        </div>
        <Link 
          href="/admin/orders"
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
          <h1 className="text-3xl font-bold text-gray-800">Admin - Sipariş Detayı</h1>
          <p className="text-gray-600 mt-1">#{order.order_number || order.id?.substring(0, 8)}</p>
        </div>
        <Link 
          href="/admin/orders"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Siparişlere Dön
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ana İçerik */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sipariş Bilgileri */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Sipariş Bilgileri</h2>
              <div className="flex items-center space-x-2">
                {formatStatus(order.status)}
                {formatPaymentStatus(order.payment_status)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Sipariş ID</p>
                <p className="font-medium">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sipariş Numarası</p>
                <p className="font-medium">{order.order_number || 'Belirtilmemiş'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sipariş Tarihi</p>
                <p className="font-medium">{formatDate(order.order_date || order.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Son Güncelleme</p>
                <p className="font-medium">{formatDate(order.updated_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mağaza</p>
                <p className="font-medium">{order.store?.name || 'Bilinmiyor'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Müşteri</p>
                <p className="font-medium">{order.user?.name || order.user?.email || 'Bilinmiyor'}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Ödeme Yöntemi</p>
                <p className="font-medium">
                  {order.payment_method === 'cash' ? 'Kapıda Nakit Ödeme' :
                   order.payment_method === 'card_on_delivery' ? 'Kapıda Kart ile Ödeme' :
                   order.payment_method === 'card' ? 'Kapıda Kart ile Ödeme' :
                   order.payment_method || 'Belirtilmemiş'}
                </p>
              </div>
              {order.delivery_date && (
                <div>
                  <p className="text-sm text-gray-600">Teslim Tarihi</p>
                  <p className="font-medium">{formatDate(order.delivery_date)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sipariş Ürünleri */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Ürünleri</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürün
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Birim Fiyat
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
                        <div className="text-sm font-medium text-gray-900">
                          {item.name || item.product?.name || 'Ürün adı bulunamadı'}
                        </div>
                        {item.notes && (
                          <div className="text-sm text-gray-500">Not: {item.notes}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {Number(item.unit_price || item.price || 0).toFixed(2)} TL
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">x{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {Number(item.total_price || item.total || (item.unit_price * item.quantity) || 0).toFixed(2)} TL
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
                        {Number(order.subtotal || 0).toFixed(2)} TL
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-right font-medium">
                      Teslimat Ücreti:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {Number(order.delivery_fee || 0).toFixed(2)} TL
                      </div>
                    </td>
                  </tr>
                  {Number(order.discount_amount || 0) > 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-right font-medium text-green-600">
                        İndirim:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          -{Number(order.discount_amount || 0).toFixed(2)} TL
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-right font-medium">
                      Toplam:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">
                        {Number(order.total_amount || order.total || 0).toFixed(2)} TL
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Durum Geçmişi */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Geçmişi</h2>
              
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <ul className="space-y-4">
                  {order.statusHistory.map((history, index) => (
                    <li key={index} className="relative pl-10">
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{history.note}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(history.timestamp)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Yan Panel */}
        <div className="space-y-6">
          {/* Admin İşlemleri */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin İşlemleri</h2>
            
            {/* Durum Değiştirme */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sipariş Durumu Değiştir
              </label>
              <select
                value={order.status}
                onChange={(e) => handleChangeStatus(e.target.value)}
                disabled={updating}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Beklemede</option>
                <option value="confirmed">Onaylandı</option>
                <option value="preparing">Hazırlanıyor</option>
                <option value="ready">Hazır</option>
                <option value="delivering">Yolda</option>
                <option value="delivered">Teslim Edildi</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
            </div>

            {/* Ödeme Durumu Değiştirme */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ödeme Durumu Değiştir
              </label>
              <select
                value={order.payment_status}
                onChange={(e) => handleChangePaymentStatus(e.target.value)}
                disabled={updating}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Beklemede</option>
                <option value="paid">Ödendi</option>
                <option value="refunded">İade Edildi</option>
              </select>
            </div>

            {updating && (
              <div className="text-sm text-blue-600 mb-4">
                İşlem yapılıyor...
              </div>
            )}
          </div>

          {/* Teslimat Bilgileri */}
          {order.delivery_address && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Teslimat Bilgileri</h2>
              <div className="space-y-2 text-sm">
                {(() => {
                  try {
                    const address = typeof order.delivery_address === 'string' 
                      ? JSON.parse(order.delivery_address) 
                      : order.delivery_address;
                    return (
                      <>
                        <p className="font-medium">{address.full_name || address.fullName || 'Bilinmiyor'}</p>
                        <p>{address.phone || 'Telefon belirtilmemiş'}</p>
                        <p className="text-gray-600">
                          {address.neighborhood || address.street || ''}
                          {address.full_address || address.fullAddress ? `, ${address.full_address || address.fullAddress}` : ''}
                        </p>
                        <p className="text-gray-600">
                          {address.district || ''} / {address.city || ''}
                        </p>
                        {address.directions && (
                          <p className="text-gray-600 mt-2">
                            <span className="font-medium">Tarif: </span>
                            {address.directions}
                          </p>
                        )}
                      </>
                    );
                  } catch (e) {
                    return <p className="text-gray-500">Adres bilgisi görüntülenemiyor</p>;
                  }
                })()}
              </div>
              
              {order.delivery_notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700">Teslimat Notu:</p>
                  <p className="text-sm text-gray-600">{order.delivery_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Müşteri ve Mağaza Bilgileri */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">İletişim Bilgileri</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800">Müşteri</h3>
                <p className="text-sm text-gray-600">{order.user?.name || 'Bilinmiyor'}</p>
                <p className="text-sm text-gray-600">{order.user?.email || 'Bilinmiyor'}</p>
                <p className="text-sm text-gray-600">{order.user?.phone || 'Telefon belirtilmemiş'}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800">Mağaza</h3>
                <p className="text-sm text-gray-600">{order.store?.name || 'Bilinmiyor'}</p>
                <p className="text-sm text-gray-600">{order.store?.email || 'Email belirtilmemiş'}</p>
                <p className="text-sm text-gray-600">{order.store?.phone || 'Telefon belirtilmemiş'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 