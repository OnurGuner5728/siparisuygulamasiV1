'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiCheck, FiClock, FiMapPin, FiChevronRight, FiStar, FiAlertCircle, FiFilter } from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';
import AuthGuard from '../../../components/AuthGuard';
import { mockOrders } from '@/app/data/mockdatas';

export default function Orders() {
  const router = useRouter();
  
  return (
    <AuthGuard requiredRole="any_auth">
      <OrdersContent router={router} />
    </AuthGuard>
  );
}

function OrdersContent({ router }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // API'den sipariş verilerini çekiyoruz (simülasyon)
    setTimeout(() => {
      // Kullanıcıya ait siparişleri filtrele
      const userOrders = mockOrders
        .filter(order => order.customerId === user?.id)
        .map(order => ({
          id: order.id,
          date: order.orderDate.split('T')[0], 
          store: { 
            id: order.storeId, 
            name: order.storeName, 
            type: order.category 
          }, 
          total: order.total,
          status: order.status === 'delivered' ? 'Teslim Edildi' : 
                 order.status === 'in_progress' ? (
                   order.statusHistory.some(sh => sh.note.includes('Kurye')) ? 'Yolda' : 'Hazırlanıyor'
                 ) : 'İşleme Alındı',
          items: order.items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          address: {
            title: order.deliveryAddress ? 'Teslimat Adresi' : '',
            fullAddress: order.deliveryAddress ? 
              `${order.deliveryAddress.neighborhood}, ${order.deliveryAddress.district}/${order.deliveryAddress.city}, ${order.deliveryAddress.fullAddress}` : ''
          },
          paymentMethod: order.paymentMethod === 'cash' ? 'Kapıda Nakit' : 'Kapıda Kart'
        }));
      
      setOrders(userOrders);
      setLoading(false);
    }, 1000);
  }, [user]);

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

  // Saati formatlama fonksiyonu
  const formatTime = (dateString) => {
    const options = { 
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleTimeString('tr-TR', options);
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
            <FiCheck className="text-green-500" />
          )
        };
      case 'Yolda':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          icon: (
            <FiClock className="text-orange-500" />
          )
        };
      case 'Hazırlanıyor':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: (
            <FiClock className="text-orange-500" />
          )
        };
      case 'İptal Edildi':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: (
            <FiAlertCircle className="text-red-500" />
          )
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: (
            <FiClock className="text-gray-500" />
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
    <div className="min-h-screen bg-gray-50">
      {/* Başlık */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              className="mr-3 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              aria-label="Geri"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Siparişlerim</h1>
          </div>
        </div>
      </div>
      
      {/* Filtreler */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-2 overflow-x-auto">
          <div className="flex space-x-2 py-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                statusFilter === 'active'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Aktif Siparişler
            </button>
            <button
              onClick={() => setStatusFilter('delivered')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                statusFilter === 'delivered'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Teslim Edilenler
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                statusFilter === 'cancelled'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              İptal Edilenler
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          // Yükleniyor durumu
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          // Sipariş yoksa
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiFilter className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Sipariş Bulunamadı</h3>
            <p className="text-gray-500 mb-6">Seçilen filtre için sipariş bulunamadı.</p>
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-700"
              >
                Tüm Siparişleri Göster
              </button>
            )}
          </div>
        ) : (
          // Siparişleri listele
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              
              return (
                <div 
                  key={order.id} 
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  {/* Sipariş Başlığı */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{order.store.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(order.date)} • {formatTime(order.date)}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.icon}
                        <span className="ml-1">{order.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sipariş Özeti */}
                  <div className="p-4">
                    <div className="space-y-1 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.quantity}x {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between text-sm font-medium">
                      <span>Toplam</span>
                      <span>{order.total.toFixed(2)} TL</span>
                    </div>
                  </div>
                  
                  {/* Sipariş Aksiyonları */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex flex-wrap justify-between items-center">
                      {order.status === 'Hazırlanıyor' || order.status === 'Yolda' ? (
                        // Devam eden sipariş
                        <Link
                          href={`/profil/siparisler/${order.id}/takip`}
                          className="flex items-center text-orange-600 font-medium text-sm"
                        >
                          <FiMapPin className="mr-1" />
                          Siparişi Takip Et
                          <FiChevronRight className="ml-1" size={16} />
                        </Link>
                      ) : order.status === 'Teslim Edildi' && !order.isRated ? (
                        // Teslim edilen ve değerlendirilmemiş sipariş
                        <Link
                          href={`/profil/yorumlar/ekle?storeId=${order.store.id}&orderId=${order.id}`}
                          className="flex items-center text-orange-600 font-medium text-sm"
                        >
                          <FiStar className="mr-1" />
                          Değerlendir
                          <FiChevronRight className="ml-1" size={16} />
                        </Link>
                      ) : order.status === 'Teslim Edildi' && order.isRated ? (
                        // Teslim edilen ve değerlendirilmiş sipariş
                        <div className="flex items-center text-gray-600 text-sm">
                          <div className="flex items-center">
                            <FiStar className="text-yellow-500 mr-1" size={14} />
                            <span>{order.rating}</span>
                          </div>
                          <span className="ml-2 text-gray-500">Değerlendirildi</span>
                        </div>
                      ) : null}
                      
                      {/* Ürünleri tekrar sipariş etme */}
                      {order.status !== 'Hazırlanıyor' && order.status !== 'Yolda' && (
                        <button
                          onClick={() => {
                            router.push(`/yemek/store/${order.store.id}`);
                          }}
                          className="mt-2 sm:mt-0 text-sm text-gray-700 font-medium py-2 px-4 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          Tekrar Sipariş Ver
                        </button>
                      )}
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