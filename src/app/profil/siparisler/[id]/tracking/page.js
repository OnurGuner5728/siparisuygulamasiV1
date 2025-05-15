'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiPhone, FiMessageSquare, FiInfo, FiMapPin } from 'react-icons/fi';
import { BiTime } from 'react-icons/bi';
import { mockOrders } from '@/app/data/mockdatas';

export default function OrderTracking({ params }) {
  const router = useRouter();
  const { id } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [error, setError] = useState(null);
  
  // Sipariş verilerini yükle
  useEffect(() => {
    const loadOrderData = () => {
      try {
        // Gerçek uygulamada API'dan getirme işlemi yapılır
        // Şimdilik mock veri kullanıyoruz
        setTimeout(() => {
          const foundOrder = mockOrders.find(order => order.id === id);
          
          if (!foundOrder) {
            setError('Sipariş bulunamadı');
            setLoading(false);
            return;
          }
          
          // Durumu belirlemek için
          const statusMap = {
            'pending': 'Onay Bekliyor',
            'confirmed': 'Onaylandı',
            'preparing': 'Hazırlanıyor',
            'ready': 'Hazır',
            'picked_up': 'Kurye Yolda',
            'delivered': 'Teslim Edildi',
            'cancelled': 'İptal Edildi'
          };
          
          // Sipariş verilerini düzenle
          const processedOrder = {
            id: foundOrder.id,
            orderDate: foundOrder.orderDate,
            status: foundOrder.status,
            statusText: statusMap[foundOrder.status] || 'İşlemde',
            estimatedDelivery: '30-45 dakika',
            store: {
              id: foundOrder.storeId,
              name: foundOrder.storeName,
              address: 'Bahçelievler Mah. 1. Cadde No: 15/3',
              phone: '+90 532 123 45 67',
              image: '/images/stores/store-placeholder.jpg'
            },
            courier: foundOrder.status === 'picked_up' || foundOrder.status === 'delivered' ? {
              id: 'CRR123',
              name: 'Mehmet K.',
              phone: '+90 555 987 65 43',
              photo: '/images/couriers/courier-placeholder.jpg',
              currentLocation: {
                lat: 41.015137,
                lng: 28.979530
              },
              rating: 4.8
            } : null,
            customer: {
              address: {
                text: foundOrder.deliveryAddress ? 
                  `${foundOrder.deliveryAddress.neighborhood}, ${foundOrder.deliveryAddress.district}/${foundOrder.deliveryAddress.city}, ${foundOrder.deliveryAddress.fullAddress}` : 
                  'Çiçek Mah. Böcek Sok. No:5 D:3, Kadıköy/İstanbul',
                coordinates: {
                  lat: 40.986106, 
                  lng: 29.021980
                }
              }
            },
            items: foundOrder.items,
            total: foundOrder.total,
            paymentMethod: foundOrder.paymentMethod,
            // Sipariş durum geçmişi
            statusHistory: [
              { status: 'confirmed', time: new Date(new Date(foundOrder.orderDate).getTime() - 25 * 60000).toISOString(), text: 'Sipariş Alındı' },
              { status: 'preparing', time: new Date(new Date(foundOrder.orderDate).getTime() - 20 * 60000).toISOString(), text: 'Hazırlanıyor' },
              { status: 'ready', time: new Date(new Date(foundOrder.orderDate).getTime() - 10 * 60000).toISOString(), text: 'Sipariş Hazır' },
              { status: 'picked_up', time: new Date(new Date(foundOrder.orderDate).getTime() - 5 * 60000).toISOString(), text: 'Kurye Yolda' },
              { status: 'delivered', time: new Date(new Date(foundOrder.orderDate).getTime()).toISOString(), text: 'Teslim Edildi' }
            ]
          };
          
          // Mevcut durum indeksini bul
          const statusIndex = processedOrder.statusHistory.findIndex(
            s => s.status === processedOrder.status
          );
          
          setCurrentStatus(statusIndex !== -1 ? statusIndex : 0);
          setOrder(processedOrder);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error(error);
        setError('Sipariş bilgileri yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };
    
    if (id) {
      loadOrderData();
    }
  }, [id]);
  
  // Tarih formatlama
  const formatDate = (dateString) => {
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
              <p className="text-sm text-gray-600">Sipariş #{order.id.substring(0, 8)}</p>
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
                  {order.statusHistory[currentStatus].text}
                </h2>
                <p className="text-gray-600 flex items-center">
                  <BiTime className="mr-1" />
                  Tahmini teslimat: {order.estimatedDelivery}
                </p>
              </div>
              <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                Aktif
              </div>
            </div>
            
            {/* İlerleme Çubuğu */}
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
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{order.courier.name}</h3>
                      <div className="flex items-center text-sm text-yellow-500">
                        <span className="mr-1">{order.courier.rating}</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link 
                        href={`/delivery/${order.id}/call`}
                        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                        aria-label="Kuryeyi Ara"
                      >
                        <FiPhone />
                      </Link>
                      <Link 
                        href={`/delivery/${order.id}/message`}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                        aria-label="Mesaj Gönder"
                      >
                        <FiMessageSquare />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Harita Simülasyonu */}
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-blue-50">
                  {/* Burada gerçek bir harita bileşeni kullanılacak */}
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <FiMapPin className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-sm">Harita görünümü</p>
                      <p className="text-xs">Kurye konumu takibi için gerçek uygulamada harita gösterilecektir</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Sipariş Bilgileri */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Sipariş Detayları</h2>
            
            <div className="border-b pb-4 mb-4">
              <div className="flex items-start mb-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mt-0.5 mr-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Sipariş Zamanı</div>
                  <div className="text-gray-600">{formatDate(order.orderDate)}</div>
                </div>
              </div>
              
              <div className="flex items-start mb-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mt-0.5 mr-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Teslimat Adresi</div>
                  <div className="text-gray-600">{order.customer.address.text}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-500 mt-0.5 mr-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Ödeme Yöntemi</div>
                  <div className="text-gray-600">
                    {order.paymentMethod === 'cash' ? 'Kapıda Nakit Ödeme' : 'Kapıda Kredi Kartı ile Ödeme'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Ürünler */}
            <h3 className="font-medium text-gray-800 mb-3">Sipariş İçeriği</h3>
            <div className="space-y-2 mb-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div className="flex items-start">
                    <span className="font-medium text-gray-800 mr-2">{item.quantity}x</span>
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-gray-800 font-medium">{(item.price * item.quantity).toFixed(2)} TL</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Ara Toplam</span>
                <span className="text-gray-800">{(order.total * 0.92).toFixed(2)} TL</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Teslimat Ücreti</span>
                <span className="text-gray-800">{(order.total * 0.08).toFixed(2)} TL</span>
              </div>
              <div className="flex justify-between font-semibold text-lg mt-2">
                <span>Toplam</span>
                <span>{order.total.toFixed(2)} TL</span>
              </div>
            </div>
          </div>
          
          {/* Restoran Bilgileri */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Restoran Bilgileri</h2>
            
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden mr-4">
                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-500">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800">{order.store.name}</h3>
                <p className="text-gray-600 text-sm">{order.store.address}</p>
                <p className="text-gray-600 text-sm">{order.store.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 