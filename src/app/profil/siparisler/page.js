'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import AuthGuard from '../../../components/AuthGuard';

export default function Orders() {
  return (
    <AuthGuard requiredRole="any_auth">
      <OrdersContent />
    </AuthGuard>
  );
}

function OrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // API'den sipariş verilerini çekiyoruz (simülasyon)
    setTimeout(() => {
      // Örnek sipariş verileri
      const mockOrders = [
        { 
          id: 10001, 
          date: '2023-05-10', 
          store: { id: 1, name: 'Kebapçı Ahmet', type: 'Yemek' }, 
          total: 185.50, 
          status: 'Teslim Edildi',
          items: [
            { id: 1, name: 'Adana Kebap', quantity: 2, price: 70 },
            { id: 2, name: 'Ayran', quantity: 2, price: 15 },
            { id: 3, name: 'Künefe', quantity: 1, price: 45 }
          ],
          address: {
            title: 'Ev',
            fullAddress: 'Atatürk Mah. Cumhuriyet Cad. No:123 D:5, Kadıköy/İstanbul'
          },
          paymentMethod: 'Kapıda Nakit'
        },
        { 
          id: 10002, 
          date: '2023-05-15', 
          store: { id: 2, name: 'Süpermarket A', type: 'Market' }, 
          total: 342.75, 
          status: 'Teslim Edildi',
          items: [
            { id: 1, name: 'Süt (1L)', quantity: 3, price: 30 },
            { id: 2, name: 'Ekmek', quantity: 2, price: 7.5 },
            { id: 3, name: 'Peynir (500g)', quantity: 1, price: 120 },
            { id: 4, name: 'Yumurta (15\'li)', quantity: 1, price: 75 },
            { id: 5, name: 'Meyve Suyu (1L)', quantity: 2, price: 40 }
          ],
          address: {
            title: 'Ev',
            fullAddress: 'Atatürk Mah. Cumhuriyet Cad. No:123 D:5, Kadıköy/İstanbul'
          },
          paymentMethod: 'Kapıda Kart'
        },
        { 
          id: 10003, 
          date: '2023-05-22', 
          store: { id: 3, name: 'Hayat Su Bayisi', type: 'Su' }, 
          total: 80.00, 
          status: 'Hazırlanıyor',
          items: [
            { id: 1, name: 'Damacana Su (19L)', quantity: 2, price: 40 }
          ],
          address: {
            title: 'İş',
            fullAddress: 'Levent Mah. İş Kuleleri No:1 Kat:15, Beşiktaş/İstanbul'
          },
          paymentMethod: 'Kapıda Nakit'
        },
        { 
          id: 10004, 
          date: '2023-05-23', 
          store: { id: 1, name: 'Kebapçı Ahmet', type: 'Yemek' }, 
          total: 220.00, 
          status: 'Yolda',
          items: [
            { id: 1, name: 'Karışık Izgara', quantity: 1, price: 150 },
            { id: 2, name: 'Salata', quantity: 1, price: 35 },
            { id: 3, name: 'Kola (330ml)', quantity: 2, price: 20 }
          ],
          address: {
            title: 'Ev',
            fullAddress: 'Atatürk Mah. Cumhuriyet Cad. No:123 D:5, Kadıköy/İstanbul'
          },
          paymentMethod: 'Kapıda Kart'
        }
      ];
      
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  // Duruma göre filtreleme
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => {
        if (statusFilter === 'active') {
          return ['Hazırlanıyor', 'Yolda'].includes(order.status);
        } else if (statusFilter === 'delivered') {
          return order.status === 'Teslim Edildi';
        } else if (statusFilter === 'cancelled') {
          return order.status === 'İptal Edildi';
        }
        return true;
      });

  // Tarih formatlama fonksiyonu
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  // Kategori rengini belirle
  const getCategoryColor = (type) => {
    switch (type) {
      case 'Yemek':
        return 'text-blue-600 bg-blue-100';
      case 'Market':
        return 'text-green-600 bg-green-100';
      case 'Su':
        return 'text-indigo-600 bg-indigo-100';
      case 'Aktüel':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Sipariş durumuna göre renk ve ikon belirle
  const getStatusInfo = (status) => {
    switch (status) {
      case 'Teslim Edildi':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case 'Yolda':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )
        };
      case 'Hazırlanıyor':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'İptal Edildi':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Sipariş bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Üst başlık ve geri dönüş linki */}
      <div className="mb-6 flex items-center">
        <Link href="/profil" className="text-indigo-600 hover:text-indigo-800 mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold">Siparişlerim</h1>
      </div>
      
      {/* Durum filtreleri */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            statusFilter === 'all' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Tümü
        </button>
        <button 
          onClick={() => setStatusFilter('active')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            statusFilter === 'active' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Aktif Siparişler
        </button>
        <button 
          onClick={() => setStatusFilter('delivered')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            statusFilter === 'delivered' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Teslim Edilenler
        </button>
        <button 
          onClick={() => setStatusFilter('cancelled')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            statusFilter === 'cancelled' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          İptal Edilenler
        </button>
      </div>
      
      {/* Sipariş listesi ve detay görünümü */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sipariş listesi */}
        <div className={`lg:col-span-${selectedOrder ? '1' : '3'}`}>
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-500 mb-2">Henüz sipariş bulunamadı.</p>
              <p className="text-sm text-gray-400">Farklı bir filtre seçin veya yeni bir sipariş verin.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <div 
                    key={order.id} 
                    className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all ${
                      selectedOrder?.id === order.id ? 'ring-2 ring-indigo-500' : 'hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-gray-500 text-sm">Sipariş No: #{order.id}</span>
                        <h3 className="font-bold">{order.store.name}</h3>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(order.store.type)}`}>
                        {order.store.type}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">{formatDate(order.date)}</span>
                      <span className="font-bold">{order.total.toFixed(2)} TL</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{order.items.length} ürün</span>
                      <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} ${statusInfo.bgColor}`}>
                        {statusInfo.icon}
                        <span className="ml-1">{order.status}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Sipariş detayı */}
        {selectedOrder && (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedOrder.store.name}</h2>
                  <p className="text-gray-600">Sipariş No: #{selectedOrder.id}</p>
                  <p className="text-gray-600">{formatDate(selectedOrder.date)}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center mb-6">
                {(() => {
                  const statusInfo = getStatusInfo(selectedOrder.status);
                  return (
                    <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} ${statusInfo.bgColor}`}>
                      {statusInfo.icon}
                      <span className="ml-1">{selectedOrder.status}</span>
                    </span>
                  );
                })()}
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold text-gray-700 mb-2">Teslimat Adresi</h3>
                <p className="text-gray-600">{selectedOrder.address.fullAddress}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold text-gray-700 mb-2">Ödeme Bilgisi</h3>
                <p className="text-gray-600">{selectedOrder.paymentMethod}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold text-gray-700 mb-2">Sipariş Detayı</h3>
                <div className="divide-y">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="py-3 flex justify-between">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.quantity} adet x {item.price.toFixed(2)} TL</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{(item.price * item.quantity).toFixed(2)} TL</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Ara Toplam:</span>
                  <span>{(selectedOrder.total - selectedOrder.deliveryFee).toFixed(2)} TL</span>
                </div>
                <div className="flex justify-between mb-2 text-sm text-gray-600">
                  <span>Teslimat Ücreti:</span>
                  <span>{selectedOrder.deliveryFee.toFixed(2)} TL</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4">
                  <span>Toplam:</span>
                  <span>{selectedOrder.total.toFixed(2)} TL</span>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                {selectedOrder.status === 'Teslim Edildi' && (
                  <Link 
                    href={`/profil/yorumlar/ekle?storeId=${selectedOrder.store.id}&orderId=${selectedOrder.id}`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors duration-300"
                  >
                    Değerlendirme Yap
                  </Link>
                )}
                
                {(selectedOrder.status === 'Hazırlanıyor' || selectedOrder.status === 'Yolda') && (
                  <Link
                    href={`/profil/siparisler/${selectedOrder.id}/takip`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-300"
                  >
                    Siparişi Takip Et
                  </Link>
                )}
                
                {selectedOrder.status === 'Hazırlanıyor' && (
                  <button 
                    className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-50 rounded-md transition-colors duration-300"
                  >
                    Siparişi İptal Et
                  </button>
                )}
                
                <button
                  onClick={() => {
                    // Print işlemi için
                    window.print();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-300"
                >
                  Siparişi Yazdır
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 