'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import AuthGuard from '../../../components/AuthGuard';
import api from '@/lib/api'; // API servisini import et

export default function AdminOrders() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminOrdersContent />
    </AuthGuard>
  );
}

function AdminOrdersContent() {
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]); // Mağazaları tutmak için
  const [users, setUsers] = useState([]); // Kullanıcıları tutmak için
  const [categories, setCategories] = useState([]); // Kategorileri tutmak için
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all'); // Bu filtre için ana kategori ID'si kullanılacak
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const ordersPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const ordersData = await api.getAllOrders(); // Tüm siparişleri getirecek bir API fonksiyonu varsayılıyor
        const storesData = await api.getStores();
        const usersData = await api.getAllUsers(); 
        const mainCategoriesData = await api.getMainCategories(); // Ana kategorileri al
        
        // Sipariş verilerine mağaza adı, müşteri adı ve kategori adı ekle
        const populatedOrders = ordersData.map(order => {
          const store = storesData.find(s => s.id === order.store_id);
          const customer = usersData.find(u => u.id === order.customer_id);
          const mainCategory = store ? mainCategoriesData.find(mc => mc.id === store.category_id) : null;
          return {
            ...order,
            storeName: store ? store.name : 'Bilinmiyor',
            customerName: customer ? customer.name : 'Bilinmiyor',
            mainCategoryId: store ? store.category_id : null, // Ana kategori ID'si
            categoryName: mainCategory ? mainCategory.name : 'Diğer' // Kategori adı
          };
        });

        setOrders(populatedOrders);
        setStores(storesData);
        setUsers(usersData);
        setCategories(mainCategoriesData); // Ana kategorileri state'e ata
      } catch (error) {
        console.error("Sipariş verileri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
      order.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const matchesCategory = categoryFilter === 'all' || order.mainCategoryId === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sayfalama
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Sayfa değiştirme
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Sipariş durumunu değiştirme
  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      const now = new Date().toISOString();
      
      const statusNote = {
        pending: 'Sipariş beklemede',
        processing: 'Sipariş hazırlanıyor',
        shipped: 'Sipariş yolda',
        delivered: 'Sipariş teslim edildi',
        cancelled: 'Sipariş iptal edildi'
      };

      const updates = {
        status: newStatus,
        status_history: [{
          status: newStatus,
          timestamp: now,
          note: statusNote[newStatus] || 'Durum güncellendi'
        }]
      };

      if (newStatus === 'delivered') {
        updates.delivery_date = now;
      }

      await api.updateOrder(orderId, updates);
      
      // Müşteriye bildirim gönder
      const order = orders.find(o => o.id === orderId);
      if (order) {
        try {
          await api.createOrderStatusNotification(orderId, newStatus, order.customer_id);
          console.log('✅ Müşteriye bildirim gönderildi:', newStatus);
        } catch (notificationError) {
          console.error('❌ Bildirim gönderilirken hata:', notificationError);
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
          <p className="text-gray-600 mt-1">Tüm siparişleri görüntüle ve yönet</p>
        </div>
        <Link 
          href="/admin"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Admin Paneli
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="mb-4 md:mb-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Müşteri, mağaza veya sipariş no ara..."
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
              <option value="processing">Hazırlanıyor</option>
              <option value="shipped">Yolda</option>
              <option value="delivered">Teslim Edildi</option>
              <option value="cancelled">İptal Edildi</option>
            </select>
            <select
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={categoryFilter} // Değer olarak ana kategori ID'si kullanılacak
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sipariş No
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mağaza
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
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
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.id.substring(0,8)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-sm text-gray-500">ID: {order.customer_id.substring(0,8)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.storeName}</div>
                    <div className="text-sm text-gray-500">ID: {order.store_id.substring(0,8)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {order.categoryName} 
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(order.order_date).toLocaleDateString('tr-TR')}</div>
                    <div className="text-sm text-gray-500">{new Date(order.order_date).toLocaleTimeString('tr-TR')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.total.toFixed(2)} TL</div>
                    {/* itemCount mock veride vardı, Supabase şemasında order_items üzerinden hesaplanmalı */}
                    {/* <div className="text-sm text-gray-500">{order.itemCount} ürün</div> */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatStatus(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <Link 
                        href={`/admin/orders/${order.id}`}
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
                                onClick={() => handleChangeStatus(order.id, 'processing')}
                                className="group flex w-full items-center px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-all duration-150"
                              >
                                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 group-hover:scale-110 transition-transform"></div>
                                Hazırlanıyor
                              </button>
                              
                              <button
                                onClick={() => handleChangeStatus(order.id, 'shipped')}
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
                    : 'text-gray-700 bg-white hover:bg-gray-50'
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
                    key={index}
                    onClick={() => paginate(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNumber
                        ? 'z-10 bg-blue-600 text-white'
                        : 'text-gray-700 bg-white hover:bg-gray-50'
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
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 