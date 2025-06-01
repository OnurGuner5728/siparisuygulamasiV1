'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import api from '@/lib/api';

export default function StoreOrdersPage() {
  return (
    <AuthGuard requiredRole="store">
      <StoreOrdersContent />
    </AuthGuard>
  );
}

function StoreOrdersContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const ordersPerPage = 10;

  // Mağaza onaylanmamışsa yönlendir
  if (!user?.storeInfo?.is_approved) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-orange-500 text-5xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Mağaza Onayı Gerekli</h2>
            <p className="text-gray-600 mb-4">
              Siparişleri görüntülemek için mağazanızın onaylanması gerekiyor.
            </p>
            <Link
              href="/store"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Ana Panele Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const storeId = user?.storeInfo?.id || user?.store_id;
        
        if (!storeId) {
          console.error('Kullanıcının bağlı bir mağazası yok!');
          return;
        }

        // Mağazaya ait siparişleri getir
        const ordersData = await api.getAllOrders({ store_id: storeId });
        
        // Müşteri bilgilerini ekle
        const populatedOrders = await Promise.all(
          ordersData.map(async (order) => {
            try {
              const customer = await api.getUserById(order.user_id);
              return {
                ...order,
                customerName: customer ? customer.name || customer.email : 'Bilinmiyor',
                customerEmail: customer ? customer.email : 'Bilinmiyor'
              };
            } catch (error) {
              console.error('Müşteri bilgisi alınamadı:', error);
              return {
                ...order,
                customerName: 'Bilinmiyor',
                customerEmail: 'Bilinmiyor'
              };
            }
          })
        );

        setOrders(populatedOrders);
      } catch (error) {
        console.error("Sipariş verileri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (user?.storeInfo?.id || user?.store_id) {
      fetchData();
    }
  }, [user?.storeInfo?.id, user?.store_id]);

  // Dropdown dışına tıklandığında kapatma
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.relative')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  // Arama ve filtreleme
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sayfalama
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Sipariş durumunu değiştirme ve bildirim gönderme
  const handleChangeStatus = async (orderId, newStatus) => {
    try {
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
        updates.delivery_date = now;
      }

      await api.updateOrder(orderId, updates);
      
      // Müşteriye bildirim gönder
      const order = orders.find(o => o.id === orderId);
      if (order) {
        try {
          await api.createOrderStatusNotification(orderId, newStatus, order.user_id);
          console.log('Müşteriye bildirim gönderildi:', newStatus);
        } catch (notificationError) {
          console.error('Bildirim gönderilirken hata:', notificationError);
        }
      }
      
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      setOpenDropdownId(null);
    } catch (error) {
      console.error("Sipariş durumu güncellenirken hata:", error);
      alert("Sipariş durumu güncellenemedi: " + (error.message || 'Bilinmeyen hata'));
    }
  };

  // Sipariş durumunu formatla
  const formatStatus = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Beklemede</span>;
      case 'confirmed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Onaylandı</span>;
      case 'preparing':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Hazırlanıyor</span>;
      case 'ready':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Hazır</span>;
      case 'delivering':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Yolda</span>;
      case 'delivered':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Teslim Edildi</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">İptal Edildi</span>;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sipariş Yönetimi</h1>
          <p className="text-gray-600 mt-1">Mağazanıza gelen siparişleri görüntüle ve yönet</p>
        </div>
        <Link 
          href="/store"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Mağaza Paneli
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="mb-4 md:mb-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Müşteri adı, email veya sipariş no ara..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tüm Durumlar</option>
              <option value="pending">Beklemede</option>
              <option value="confirmed">Onaylandı</option>
              <option value="preparing">Hazırlanıyor</option>
              <option value="ready">Hazır</option>
              <option value="delivering">Yolda</option>
              <option value="delivered">Teslim Edildi</option>
              <option value="cancelled">İptal Edildi</option>
            </select>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl text-gray-300 mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Henüz Sipariş Yok</h2>
            <p className="text-gray-600">Mağazanıza henüz sipariş gelmedi. Yeni siparişler geldiğinde burada görüntülenecek.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sipariş No
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Toplam
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:bg-gray-900">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{order.id.substring(0,8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(order.order_date || order.created_at).toLocaleDateString('tr-TR')}</div>
                        <div className="text-sm text-gray-500">{new Date(order.order_date || order.created_at).toLocaleTimeString('tr-TR')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{Number(order.total_amount || 0).toFixed(2)} TL</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatStatus(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <Link 
                            href={`/store/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-150"
                          >
                            Detay
                          </Link>
                          <div className="relative">
                            <button 
                              onClick={() => setOpenDropdownId(openDropdownId === order.id ? null : order.id)}
                              className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium py-1.5 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 inline-flex items-center text-xs"
                            >
                              <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Durum
                              <svg className={`w-3 h-3 ml-1.5 transition-transform duration-200 ${openDropdownId === order.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            
                            {openDropdownId === order.id && (
                              <div className="absolute right-0 mt-1 w-48 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-20 border border-gray-100">
                                <div className="py-1" role="menu" aria-orientation="vertical">
                                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                    Durumu Değiştir
                                  </div>
                                  
                                  <button
                                    onClick={() => handleChangeStatus(order.id, 'pending')}
                                    className="group flex w-full items-center px-3 py-2 text-xs text-gray-700 hover:bg-yellow-50 hover:text-yellow-800 transition-all duration-150"
                                  >
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 group-hover:scale-110 transition-transform"></div>
                                    Beklemede
                                  </button>
                                  
                                  <button
                                    onClick={() => handleChangeStatus(order.id, 'confirmed')}
                                    className="group flex w-full items-center px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-all duration-150"
                                  >
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 group-hover:scale-110 transition-transform"></div>
                                    Onaylandı
                                  </button>
                                  
                                  <button
                                    onClick={() => handleChangeStatus(order.id, 'preparing')}
                                    className="group flex w-full items-center px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-all duration-150"
                                  >
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 group-hover:scale-110 transition-transform"></div>
                                    Hazırlanıyor
                                  </button>
                                  
                                  <button
                                    onClick={() => handleChangeStatus(order.id, 'ready')}
                                    className="group flex w-full items-center px-3 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-800 transition-all duration-150"
                                  >
                                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 group-hover:scale-110 transition-transform"></div>
                                    Hazır
                                  </button>
                                  
                                  <button
                                    onClick={() => handleChangeStatus(order.id, 'delivering')}
                                    className="group flex w-full items-center px-3 py-2 text-xs text-gray-700 hover:bg-orange-50 hover:text-orange-800 transition-all duration-150"
                                  >
                                    <div className="w-2 h-2 bg-orange-400 rounded-full mr-2 group-hover:scale-110 transition-transform"></div>
                                    Yolda
                                  </button>
                                  
                                  <button
                                    onClick={() => handleChangeStatus(order.id, 'delivered')}
                                    className="group flex w-full items-center px-3 py-2 text-xs text-gray-700 hover:bg-green-50 hover:text-green-800 transition-all duration-150"
                                  >
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 group-hover:scale-110 transition-transform"></div>
                                    Teslim Edildi
                                  </button>
                                  
                                  <div className="border-t border-gray-100 mt-1">
                                    <button
                                      onClick={() => handleChangeStatus(order.id, 'cancelled')}
                                      className="group flex w-full items-center px-3 py-2 text-xs text-gray-700 hover:bg-red-50 hover:text-red-800 transition-all duration-150"
                                    >
                                      <div className="w-2 h-2 bg-red-400 rounded-full mr-2 group-hover:scale-110 transition-transform"></div>
                                      İptal Edildi
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-700">
                  Toplam <span className="font-medium">{filteredOrders.length}</span> siparişten{' '}
                  <span className="font-medium">{indexOfFirstOrder + 1}</span>-
                  <span className="font-medium">
                    {indexOfLastOrder > filteredOrders.length ? filteredOrders.length : indexOfLastOrder}
                  </span>{' '}
                  arası gösteriliyor
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-900'
                    }`}
                  >
                    Önceki
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = index + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + index;
                    } else {
                      pageNumber = currentPage - 2 + index;
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                          currentPage === pageNumber
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-900'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-900'
                    }`}
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
