'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import { use } from 'react';

export default function OrderDetail({ params: promiseParams }) {
  return (
    <AuthGuard requiredRole="any_auth">
      <OrderDetailContent promiseParams={promiseParams} />
    </AuthGuard>
  );
}

function OrderDetailContent({ promiseParams }) {
  const params = use(promiseParams);
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        const orderData = await api.getOrderById(params.id);
        
        if (orderData) {
          // Kullanıcının kendi siparişi mi veya store sahibinin mağaza siparişi mi kontrol et
          const isCustomerOrder = orderData.user_id === user?.id;
          const isStoreOwnerOrder = user?.role === 'store' && orderData.store?.owner_id === user?.id;
          
          if (!isCustomerOrder && !isStoreOwnerOrder) {
            setError('Bu siparişi görüntüleme yetkiniz yok.');
            return;
          }
          setOrder(orderData);
        } else {
          setError('Sipariş bulunamadı.');
        }
      } catch (err) {
        console.error('Sipariş yüklenirken hata:', err);
        setError('Sipariş bilgileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id, user?.id]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sipariş Bulunamadı</h2>
          <p className="text-gray-600 mb-6">{error || 'İstediğiniz sipariş bulunamadı.'}</p>
          <Link 
            href="/profil/siparisler"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Siparişlerime Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sipariş Detayı</h1>
              <p className="text-gray-600 mt-1">Sipariş No: #{order.id.substring(0, 8)}</p>
            </div>
            <Link 
              href="/profil/siparisler"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Geri Dön
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ana İçerik */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sipariş Bilgileri */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Sipariş Bilgileri</h2>
                {formatStatus(order.status)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Sipariş Tarihi</p>
                  <p className="font-medium">{new Date(order.order_date).toLocaleString('tr-TR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mağaza</p>
                  <p className="font-medium">{order.store?.name || 'Bilinmiyor'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ödeme Yöntemi</p>
                  <p className="font-medium">
                    {order.payment_method === 'cash' ? 'Kapıda Ödeme' : 'Kredi Kartı'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ödeme Durumu</p>
                  <div>{formatPaymentStatus(order.payment_status)}</div>
                </div>
                {order.actual_delivery_time && (
                  <div>
                    <p className="text-sm text-gray-600">Teslim Tarihi</p>
                    <p className="font-medium">{new Date(order.actual_delivery_time).toLocaleString('tr-TR')}</p>
                  </div>
                )}
                {order.estimated_delivery_time && (
                  <div>
                    <p className="text-sm text-gray-600">Tahmini Teslimat</p>
                    <p className="font-medium">{order.estimated_delivery_time}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sipariş Ürünleri */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Ürünleri</h2>
              
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center">
                      {item.product?.image && (
                        <img 
                          src={item.product.image} 
                          alt={item.product?.name || 'Ürün'}
                          className="w-12 h-12 object-cover rounded-md mr-4"
                        />
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{item.product?.name || 'Ürün'}</h3>
                        {item.notes && (
                          <p className="text-sm text-gray-500">Not: {item.notes}</p>
                        )}
                        <p className="text-sm text-gray-600">
                          {item.quantity} x {Number(item.unit_price || 0).toFixed(2)} TL
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{Number(item.total_price || 0).toFixed(2)} TL</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Toplam */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ara Toplam</span>
                    <span>{Number(order.subtotal || 0).toFixed(2)} TL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Teslimat Ücreti</span>
                    <span>{Number(order.delivery_fee || 0).toFixed(2)} TL</span>
                  </div>
                  {Number(order.discount_amount || 0) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>İndirim</span>
                      <span>-{Number(order.discount_amount || 0).toFixed(2)} TL</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                    <span>Toplam</span>
                    <span>{Number(order.total_amount || 0).toFixed(2)} TL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Durum Geçmişi */}
            {order.status_history && Array.isArray(order.status_history) && order.status_history.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Geçmişi</h2>
                
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <ul className="space-y-4">
                    {order.status_history.map((history, index) => (
                      <li key={index} className="relative pl-10">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{history.note}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(history.timestamp).toLocaleString('tr-TR')}
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
            {/* Teslimat Adresi */}
            {order.delivery_address && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Teslimat Adresi</h2>
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
                        </>
                      );
                    } catch (e) {
                      return <p className="text-gray-500">Adres bilgisi görüntülenemiyor</p>;
                    }
                  })()}
                </div>
              </div>
            )}

            {/* Hızlı İşlemler */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">İşlemler</h2>
              <div className="space-y-3">
                {/* Değerlendirme Butonu - Sadece teslim edilmiş siparişler için */}
                {order.status === 'delivered' && (
                  <Link 
                    href={`/profil/siparisler/${order.id}/degerlendirme`}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md inline-flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Değerlendir
                  </Link>
                )}
                
                {order.status === 'delivered' && (
                  <Link 
                    href={`/profil/siparisler/${order.id}/tracking`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md inline-flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Yeniden Sipariş Ver
                  </Link>
                )}
                
                {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing') && (
                  <button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
                    onClick={async () => {
                      if (window.confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
                        try {
                          const now = new Date().toISOString();
                          const updates = {
                            status: 'cancelled',
                            cancelled_at: now,
                            cancellation_reason: 'Müşteri tarafından iptal edildi',
                            status_history: {
                              status: 'cancelled',
                              timestamp: now,
                              note: 'Sipariş müşteri tarafından iptal edildi'
                            }
                          };
                          
                          await api.updateOrder(order.id, updates);
                          setOrder({ ...order, status: 'cancelled' });
                        } catch (error) {
                          console.error('Sipariş iptal edilirken hata:', error);
                          alert('Sipariş iptal edilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
                        }
                      }
                    }}
                  >
                    Siparişi İptal Et
                  </button>
                )}
                
                <Link 
                  href={`tel:${order.store?.phone || '+90 212 123 45 67'}`}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md inline-flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Mağazayı Ara
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 