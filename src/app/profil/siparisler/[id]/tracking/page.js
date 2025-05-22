'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiPhone, FiMessageSquare, FiInfo, FiMapPin } from 'react-icons/fi';
import { BiTime } from 'react-icons/bi';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';

export default function OrderTracking({ params }) {
  return (
    <AuthGuard>
      <OrderTrackingContent params={params} />
    </AuthGuard>
  );
}

function OrderTrackingContent({ params }) {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [error, setError] = useState(null);
  
  // Sipariş verilerini yükle
  useEffect(() => {
    const loadOrderData = async () => {
      if (!id || !user?.id) return;
      
      try {
        setLoading(true);
        
        // Siparişi API'dan getir
        const orderData = await api.getOrderById(id);
        
        if (!orderData) {
          setError('Sipariş bulunamadı');
          setLoading(false);
          return;
        }
        
        // Siparişin kullanıcıya ait olup olmadığını kontrol et
        if (orderData.user_id !== user.id) {
          setError('Bu siparişi görüntüleme yetkiniz yok');
          setLoading(false);
          return;
        }
        
        // Sipariş ürünlerini getir
        const orderItems = await api.getOrderItems(id);
        
        // Mağaza bilgisini getir
        let storeInfo = { name: 'Bilinmeyen Mağaza' };
        if (orderData.store_id) {
          try {
            const storeData = await api.getStoreById(orderData.store_id);
            if (storeData) {
              storeInfo = {
                id: storeData.id,
                name: storeData.name,
                address: storeData.address,
                phone: storeData.phone,
                image: storeData.logo || '/images/stores/store-placeholder.jpg'
              };
            }
          } catch (e) {
            console.error('Mağaza bilgileri alınamadı:', e);
          }
        }
        
        // Kurye bilgisini getir (gerçek uygulamada API'dan gelecektir)
        const courierInfo = (orderData.status === 'on_the_way' || orderData.status === 'delivered') ? {
          id: orderData.courier_id || 'CRR123',
          name: orderData.courier_name || 'Kurye',
          phone: orderData.courier_phone || '+90 555 000 00 00',
          photo: orderData.courier_photo || '/images/couriers/courier-placeholder.jpg',
          currentLocation: orderData.courier_location || {
            lat: 41.015137,
            lng: 28.979530
          },
          rating: orderData.courier_rating || 4.5
        } : null;
        
        // Durumu belirlemek için
        const statusMap = {
          'pending': 'Onay Bekliyor',
          'confirmed': 'Onaylandı',
          'preparing': 'Hazırlanıyor',
          'ready': 'Hazır',
          'on_the_way': 'Kurye Yolda',
          'delivered': 'Teslim Edildi',
          'canceled': 'İptal Edildi'
        };
        
        // Sipariş durum geçmişini oluştur
        let statusHistory = orderData.status_history || [];
        
        // Eğer status_history yoksa veya boşsa, mevcut durumdan bir tane oluştur
        if (!statusHistory || statusHistory.length === 0) {
          const baseTime = new Date(orderData.order_date || orderData.created_at);
          statusHistory = [];
          
          switch (orderData.status) {
            case 'delivered':
              statusHistory.push(
                { status: 'delivered', time: new Date().toISOString(), text: 'Teslim Edildi' }
              );
              // Devam et, alttaki case'ler de çalışacak
            case 'on_the_way':
              statusHistory.push(
                { status: 'on_the_way', time: new Date(baseTime.getTime() - 5 * 60000).toISOString(), text: 'Kurye Yolda' }
              );
              // Devam et
            case 'preparing':
              statusHistory.push(
                { status: 'preparing', time: new Date(baseTime.getTime() - 15 * 60000).toISOString(), text: 'Hazırlanıyor' }
              );
              // Devam et
            case 'pending':
              statusHistory.push(
                { status: 'pending', time: new Date(baseTime.getTime() - 20 * 60000).toISOString(), text: 'Sipariş Alındı' }
              );
              break;
            case 'canceled':
              statusHistory.push(
                { status: 'canceled', time: new Date().toISOString(), text: 'İptal Edildi' },
                { status: 'pending', time: new Date(baseTime.getTime() - 20 * 60000).toISOString(), text: 'Sipariş Alındı' }
              );
              break;
            default:
              statusHistory.push(
                { status: orderData.status, time: new Date().toISOString(), text: statusMap[orderData.status] || 'İşlemde' }
              );
          }
          
          // Tersine çevir (en eski başa gelsin)
          statusHistory.reverse();
        }
        
        // Sipariş verilerini düzenle
        const processedOrder = {
          id: orderData.id,
          orderDate: orderData.order_date || orderData.created_at,
          status: orderData.status,
          statusText: statusMap[orderData.status] || 'İşlemde',
          estimatedDelivery: orderData.estimated_delivery || '30-45 dakika',
          store: storeInfo,
          courier: courierInfo,
          customer: {
            address: {
              text: orderData.delivery_address || 'Adres bilgisi bulunamadı',
              coordinates: orderData.delivery_coordinates || {
                lat: 40.986106, 
                lng: 29.021980
              }
            }
          },
          items: orderItems || [],
          total: orderData.total || 0,
          paymentMethod: orderData.payment_method,
          statusHistory: statusHistory
        };
        
        // Mevcut durum indeksini bul
        const statusIndex = processedOrder.statusHistory.findIndex(
          s => s.status === processedOrder.status
        );
        
        setCurrentStatus(statusIndex !== -1 ? statusIndex : 0);
        setOrder(processedOrder);
      } catch (error) {
        console.error('Sipariş bilgileri yüklenirken hata:', error);
        setError('Sipariş bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id && user?.id) {
      loadOrderData();
    }
  }, [id, user]);
  
  // Tarih formatlama
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { 
      hour: '2-digit', 
      minute: '2-digit',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  // Saat formatlama (sadece saat ve dakika)
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const options = { 
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleTimeString('tr-TR', options);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
          <div className="text-red-500 text-5xl mb-4">
            <FiInfo className="inline-block" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{error}</h1>
          <p className="text-gray-600 mb-6">Bu sipariş bulunamadı veya erişim izniniz yok.</p>
          <Link 
            href="/profil/siparisler" 
            className="inline-block bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-700"
          >
            Siparişlerime Dön
          </Link>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
          <div className="text-yellow-500 text-5xl mb-4">
            <FiInfo className="inline-block" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Sipariş bilgileri yüklenemedi</h1>
          <p className="text-gray-600 mb-6">Lütfen daha sonra tekrar deneyiniz.</p>
          <Link 
            href="/profil/siparisler" 
            className="inline-block bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-700"
          >
            Siparişlerime Dön
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Üst başlık */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              aria-label="Geri Dön"
            >
              <FiArrowLeft />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Sipariş Takibi</h1>
              <p className="text-sm text-gray-600">Sipariş #{order.id?.substring(0, 8)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {/* Teslimat Durumu Kartı */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  {order.statusHistory[currentStatus]?.text || order.statusText}
                </h2>
                <p className="text-gray-600 flex items-center">
                  <BiTime className="mr-1" />
                  Tahmini teslimat: {order.estimatedDelivery}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'canceled' 
                  ? 'bg-red-100 text-red-700' 
                  : order.status === 'delivered' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {order.status === 'canceled' ? 'İptal Edildi' : 
                 order.status === 'delivered' ? 'Tamamlandı' : 'Aktif'}
              </div>
            </div>
            
            {/* İlerleme Çubuğu */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="relative pt-6 pb-12">
                <div className="absolute top-6 inset-x-0 h-0.5 bg-gray-200"></div>
                
                {order.statusHistory.map((status, index) => {
                  const isActive = index <= currentStatus;
                  return (
                    <div 
                      key={index} 
                      className={`absolute top-4 transform -translate-y-1/2 flex flex-col items-center`}
                      style={{ left: `${(index / (order.statusHistory.length - 1)) * 100}%` }}
                    >
                      <div 
                        className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center 
                          ${isActive ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gray-300'}`}
                      >
                        {index <= currentStatus && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="mt-2 text-xs font-medium text-center absolute w-32 -left-16">
                        <div className={isActive ? 'text-gray-800' : 'text-gray-500'}>
                          {status.text}
                        </div>
                        <div className={`text-xs ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                          {formatTime(status.time)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Kurye Bilgileri (Eğer sipariş yoldaysa) */}
          {order.courier && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Kurye Bilgileri</h2>
              
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden mr-4">
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-500">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="font-semibold text-gray-800">{order.courier.name}</h3>
                    {order.courier.rating && (
                      <div className="ml-2 flex items-center text-sm">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1">{order.courier.rating}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Kurye</p>
                </div>
                
                <div className="flex">
                  <a 
                    href={`tel:${order.courier.phone}`} 
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full"
                    aria-label="Ara"
                  >
                    <FiPhone className="w-5 h-5" />
                  </a>
                  <a 
                    href={`sms:${order.courier.phone}`} 
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                    aria-label="Mesaj Gönder"
                  >
                    <FiMessageSquare className="w-5 h-5" />
                  </a>
                </div>
              </div>
              
              {/* Harita yerine sadece bilgi gösteriyoruz */}
              <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3 text-blue-500">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-blue-800">
                    Kurye şu anda yolda ve yaklaşık {order.estimatedDelivery} içinde teslimat adresinizde olacak.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Sipariş Bilgileri */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Sipariş Bilgileri</h2>
            </div>
            
            <div className="p-6">
              <div className="flex items-start mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4 overflow-hidden">
                  <img 
                    src={order.store.image || '/images/stores/store-placeholder.jpg'} 
                    alt={order.store.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{order.store.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{order.store.address}</p>
                  <a 
                    href={`tel:${order.store.phone}`} 
                    className="text-sm text-orange-600 hover:text-orange-800 mt-1 inline-flex items-center"
                  >
                    <FiPhone className="mr-1" /> Ara
                  </a>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Sipariş Özeti</div>
                
                <div className="space-y-3 mb-4">
                  {order.items && order.items.map((item, index) => (
                    <div key={item.id || index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="font-medium text-gray-800">
                          {item.quantity || 1}x
                        </div>
                        <div className="ml-2">
                          <div className="text-gray-800">{item.product_name || item.name}</div>
                          {item.options && item.options.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {item.options.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="font-medium text-gray-800">
                        {((item.price || 0) * (item.quantity || 1)).toFixed(2)} TL
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-3 pb-1">
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-gray-600">Ara Toplam</span>
                    <span className="text-gray-800">{(order.total - (order.delivery_fee || 0)).toFixed(2)} TL</span>
                  </div>
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-gray-600">Teslimat Ücreti</span>
                    <span className="text-gray-800">{(order.delivery_fee || 0).toFixed(2)} TL</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200 mt-2">
                    <span>Toplam</span>
                    <span>{(order.total || 0).toFixed(2)} TL</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <div><strong>Sipariş Tarihi:</strong> {formatDate(order.orderDate)}</div>
                <div><strong>Ödeme Yöntemi:</strong> {order.paymentMethod === 'card' ? 'Kredi Kartı' : 'Kapıda Ödeme'}</div>
                <div className="mt-2"><strong>Teslimat Adresi:</strong></div>
                <div className="mt-1">{order.customer.address.text}</div>
              </div>
            </div>
          </div>
          
          {/* Sipariş İptal Etme */}
          {(order.status === 'pending' || order.status === 'confirmed') && (
            <div className="text-center mt-4">
              <button 
                onClick={async () => {
                  if (window.confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
                    try {
                      await api.updateOrder(order.id, { status: 'canceled' });
                      router.refresh();
                    } catch (error) {
                      console.error('Sipariş iptal edilirken hata:', error);
                      alert('Sipariş iptal edilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
                    }
                  }
                }}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Siparişi İptal Et
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 