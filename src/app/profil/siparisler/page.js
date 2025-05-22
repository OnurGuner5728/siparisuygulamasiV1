'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiCheck, FiClock, FiMapPin, FiChevronRight, FiStar, FiAlertCircle, FiFilter } from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';
import AuthGuard from '../../../components/AuthGuard';
import api from '@/lib/api';
import ProfileSidebar from '@/components/ProfileSidebar';

export default function Orders() {
  return (
    <AuthGuard>
      <OrdersList />
    </AuthGuard>
  );
}

function OrdersList() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, active, completed, canceled
  
  useEffect(() => {
    async function fetchOrders() {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const userOrders = await api.getUserOrders(user.id);
        setOrders(userOrders || []);
      } catch (error) {
        console.error('Siparişler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrders();
  }, [user]);
  
  // Filtrelenmiş siparişler
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['pending', 'preparing', 'on_the_way'].includes(order.status);
    if (activeTab === 'completed') return order.status === 'delivered';
    if (activeTab === 'canceled') return order.status === 'canceled';
    return true;
  });
  
  // Duruma göre badge oluştur
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Onay Bekliyor</span>;
      case 'preparing':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Hazırlanıyor</span>;
      case 'on_the_way':
        return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">Yolda</span>;
      case 'delivered':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Teslim Edildi</span>;
      case 'canceled':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">İptal Edildi</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Bilinmiyor</span>;
    }
  };
  
  // Mağaza kategorisine göre renk döndür
  function getCategoryColor(categoryId) {
    const colors = {
      1: 'bg-red-500', // Yemek
      2: 'bg-green-500', // Market
      3: 'bg-blue-500', // Su
      4: 'bg-pink-500', // Çiçek
      5: 'bg-yellow-500', // Tatlı
      default: 'bg-gray-500'
    };
    return colors[categoryId] || colors.default;
  }
  
  // Fiyat formatla
  const formatPrice = (price) => {
    return price.toFixed(2).replace('.', ',') + ' TL';
  };
  
  // Tarih formatla
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row">
            <ProfileSidebar activeTab="orders" />
            
            <div className="md:flex-1 md:ml-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row">
          <ProfileSidebar activeTab="orders" />
          
          <div className="md:flex-1 md:ml-8 mt-8 md:mt-0">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Siparişlerim</h2>
                <p className="text-gray-600 text-sm mt-1">Geçmiş ve mevcut siparişlerinizi görüntüleyin</p>
              </div>
              
              {/* Tab menüsü */}
              <div className="flex border-b border-gray-200">
                <button
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('all')}
                >
                  Tümü ({orders.length})
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('active')}
                >
                  Aktif
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('completed')}
                >
                  Tamamlanan
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'canceled' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('canceled')}
                >
                  İptal Edilen
                </button>
              </div>
              
              {filteredOrders.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Siparişiniz bulunmuyor</h3>
                  <p className="text-gray-500 mb-4">
                    {activeTab === 'all' 
                      ? 'Henüz hiç sipariş vermediniz.' 
                      : `${activeTab === 'active' ? 'Aktif' : activeTab === 'completed' ? 'Tamamlanmış' : 'İptal edilmiş'} siparişiniz bulunmuyor.`}
                  </p>
                  <Link 
                    href="/" 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Alışverişe Başla
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="p-4 sm:p-6 hover:bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                        <div className="mb-2 sm:mb-0">
                          <div className="flex items-center mb-2">
                            <div className={`h-8 w-8 rounded-md ${getCategoryColor(order.store?.category_id)} text-white flex items-center justify-center mr-2`}>
                              {order.store?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span className="font-medium">{order.store?.name || 'Bilinmeyen Mağaza'}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Sipariş No: #{order.id.substring(0, 8)}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <div className="mb-1">{getStatusBadge(order.status)}</div>
                          <div className="text-sm text-gray-500">{formatDate(order.order_date)}</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t pt-4 mt-4">
                        <div>
                          <div className="text-lg font-medium text-gray-900">{formatPrice(order.total)}</div>
                          <div className="text-sm text-gray-500">
                            {order.order_items?.length || 0} ürün
                          </div>
                        </div>
                        
                        <div className="mt-3 sm:mt-0">
                          <Link 
                            href={`/profil/siparisler/${order.id}`} 
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
                          >
                            Sipariş Detayları
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"></path>
                            </svg>
                          </Link>
                          
                          {/* Sipariş durumu pending ise iptal etme butonu göster */}
                          {order.status === 'pending' && (
                            <button 
                              className="text-red-600 hover:text-red-800 text-sm font-medium ml-4"
                              onClick={async () => {
                                if (window.confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
                                  try {
                                    await api.updateOrder(order.id, { status: 'canceled' });
                                    // Sipariş listesini güncelle
                                    setOrders(orders.map(o => 
                                      o.id === order.id ? { ...o, status: 'canceled' } : o
                                    ));
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
                          
                          {/* Sipariş tamamlandıysa ve henüz değerlendirme yapılmadıysa değerlendirme butonu göster */}
                          {order.status === 'delivered' && (
                            <Link 
                              href={`/profil/siparisler/${order.id}/değerlendirme`}
                              className="text-orange-600 hover:text-orange-800 text-sm font-medium ml-4"
                            >
                              Değerlendir
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 