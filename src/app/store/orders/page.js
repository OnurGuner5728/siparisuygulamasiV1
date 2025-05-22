'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import api from '@/lib/api';
import { FiPackage, FiClock, FiCheckCircle, FiXCircle, FiUser, FiPhone, FiMapPin, FiCalendar, FiDollarSign } from 'react-icons/fi';

// StoreHeader bileşeni yerine basit bir başlık komponenti
const StoreHeader = ({ title }) => (
  <div className="bg-white shadow-sm mb-6 py-4">
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  </div>
);

export default function StoreOrdersPage() {
  const { user, isAuthenticated, isStoreOwner } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Mağaza sahibi değilse yönlendir
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/store/orders');
      return;
    }
    
    if (isAuthenticated && !isStoreOwner) {
      router.push('/');
      return;
    }
    
    // Siparişleri yükle
    const loadOrders = async () => {
      try {
        setLoading(true);
        const storeId = user?.store_id;
        
        if (!storeId) {
          console.error('Kullanıcının bağlı bir mağazası yok!');
          return;
        }
        
        const ordersData = await api.getStoreOrders(storeId);
        setOrders(ordersData || []);
      } catch (error) {
        console.error('Siparişler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.store_id) {
      loadOrders();
    }
  }, [isAuthenticated, isStoreOwner, router, user]);
  
  // Sipariş durumunu güncelle
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      
      // Sipariş listesini güncelle
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Sipariş durumu güncellenirken hata:', error);
      alert('Sipariş durumu güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };
  
  // Sipariş durumuna göre renk ve simge belirle
  const getOrderStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { 
          color: 'text-yellow-500', 
          bgColor: 'bg-yellow-100', 
          icon: <FiClock className="mr-1" />, 
          text: 'Bekliyor' 
        };
      case 'processing':
        return { 
          color: 'text-blue-500', 
          bgColor: 'bg-blue-100', 
          icon: <FiPackage className="mr-1" />, 
          text: 'Hazırlanıyor' 
        };
      case 'completed':
        return { 
          color: 'text-green-500', 
          bgColor: 'bg-green-100', 
          icon: <FiCheckCircle className="mr-1" />, 
          text: 'Tamamlandı' 
        };
      case 'cancelled':
        return { 
          color: 'text-red-500', 
          bgColor: 'bg-red-100', 
          icon: <FiXCircle className="mr-1" />, 
          text: 'İptal Edildi' 
        };
      default:
        return { 
          color: 'text-gray-500', 
          bgColor: 'bg-gray-100', 
          icon: <FiClock className="mr-1" />, 
          text: 'Bilinmiyor' 
        };
    }
  };
  
  // Sipariş tarihini formatlama
  const formatOrderDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StoreHeader title="Siparişler" />
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <StoreHeader title="Siparişler" />
      
      <div className="container mx-auto px-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-5xl text-gray-300 mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Henüz Sipariş Yok</h2>
            <p className="text-gray-600 mb-6">Şu anda hiç sipariş bulunmuyor. Yeni siparişler geldiğinde burada görüntülenecek.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getOrderStatusInfo(order.status);
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Sipariş Başlığı */}
                  <div className="border-b p-4 flex justify-between items-center flex-wrap">
                    <div>
                      <div className="flex items-center">
                        <span className="font-bold text-gray-800 mr-2">Sipariş #{order.id.substring(0, 8)}</span>
                        <span className={`${statusInfo.bgColor} ${statusInfo.color} text-xs px-2 py-1 rounded-full inline-flex items-center`}>
                          {statusInfo.icon} {statusInfo.text}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1 flex items-center">
                        <FiCalendar className="mr-1" size={14} />
                        {formatOrderDate(order.created_at)}
                      </div>
                    </div>
                    
                    <div className="flex mt-2 sm:mt-0">
                      {order.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'processing')}
                            className="ml-2 bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs px-3 py-1 rounded-full"
                          >
                            Hazırlamaya Başla
                          </button>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            className="ml-2 bg-red-100 text-red-600 hover:bg-red-200 text-xs px-3 py-1 rounded-full"
                          >
                            İptal Et
                          </button>
                        </>
                      )}
                      
                      {order.status === 'processing' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="ml-2 bg-green-100 text-green-600 hover:bg-green-200 text-xs px-3 py-1 rounded-full"
                        >
                          Tamamlandı
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Sipariş İçeriği */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Sipariş Öğeleri */}
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Sipariş Öğeleri</h3>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <div className="flex items-start">
                                <div className="bg-gray-100 w-10 h-10 rounded-md flex items-center justify-center mr-3">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-md" />
                                  ) : (
                                    <span className="text-xs text-gray-500">Resim yok</span>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{item.name}</p>
                                  <p className="text-xs text-gray-500">{item.quantity} x {item.price} TL</p>
                                  {item.notes && (
                                    <p className="text-xs text-gray-500 italic mt-1">Not: {item.notes}</p>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm font-medium">{(item.quantity * item.price).toFixed(2)} TL</div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Fiyat Özeti */}
                        <div className="border-t mt-4 pt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Ara Toplam</span>
                            <span>{order.subtotal.toFixed(2)} TL</span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-600">Teslimat Ücreti</span>
                            <span>{order.delivery_fee.toFixed(2)} TL</span>
                          </div>
                          <div className="flex justify-between font-bold mt-2">
                            <span>Toplam</span>
                            <span className="flex items-center">
                              <FiDollarSign size={14} className="mr-1" />
                              {order.total.toFixed(2)} TL
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Müşteri ve Teslimat Bilgileri */}
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Müşteri Bilgileri</h3>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-start mb-2">
                            <FiUser className="text-gray-500 mt-0.5 mr-2" size={16} />
                            <div>
                              <p className="text-sm font-medium">{order.customer.name}</p>
                              <p className="text-xs text-gray-500">{order.customer.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start mb-2">
                            <FiPhone className="text-gray-500 mt-0.5 mr-2" size={16} />
                            <div>
                              <p className="text-sm">{order.customer.phone || 'Telefon belirtilmemiş'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <FiMapPin className="text-gray-500 mt-0.5 mr-2" size={16} />
                            <div>
                              <p className="text-sm">{order.delivery_address || 'Adres belirtilmemiş'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <h3 className="font-medium text-gray-800 mt-4 mb-2">Teslimat Bilgileri</h3>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-start mb-2">
                            <div className="text-gray-500 mr-2">🕒</div>
                            <div>
                              <p className="text-sm font-medium">Tahmini Teslimat</p>
                              <p className="text-xs text-gray-500">{order.estimated_delivery_time || 'Belirtilmemiş'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="text-gray-500 mr-2">💳</div>
                            <div>
                              <p className="text-sm font-medium">Ödeme Yöntemi</p>
                              <p className="text-xs text-gray-500">{order.payment_method || 'Belirtilmemiş'}</p>
                            </div>
                          </div>
                        </div>
                        
                        {order.notes && (
                          <>
                            <h3 className="font-medium text-gray-800 mt-4 mb-2">Sipariş Notu</h3>
                            <div className="bg-yellow-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700">{order.notes}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 