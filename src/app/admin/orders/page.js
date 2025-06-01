'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';

export default function AdminOrdersPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminOrdersContent />
    </AuthGuard>
  );
}

function AdminOrdersContent() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [stores, setStores] = useState([]);
  const ordersPerPage = 20;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Tüm siparişleri ve mağazaları getir
        const [ordersData, storesData] = await Promise.all([
          api.getAllOrders(),
          api.getStores({}, true) // admin olarak al
        ]);
        
        // Müşteri bilgilerini ekle
        const populatedOrders = await Promise.all(
          ordersData.map(async (order) => {
            try {
              const customer = await api.getUserById(order.user_id);
              const store = storesData.find(s => s.id === order.store_id);
              return {
                ...order,
                customerName: customer ? customer.name || customer.email : 'Bilinmiyor',
                customerEmail: customer ? customer.email : 'Bilinmiyor',
                storeName: store ? store.name : 'Bilinmiyor'
              };
            } catch (error) {
              console.error('Müşteri/mağaza bilgisi alınamadı:', error);
              return {
                ...order,
                customerName: 'Bilinmiyor',
                customerEmail: 'Bilinmiyor',
                storeName: 'Bilinmiyor'
              };
            }
          })
        );

        setOrders(populatedOrders);
        setStores(storesData);
      } catch (error) {
        console.error("Veri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Arama ve filtreleme
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      order.order_number?.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesStore = storeFilter === 'all' || order.store_id === storeFilter;
    
    return matchesSearch && matchesStatus && matchesStore;
  });

  // Sayfalama
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

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
      <span className={`px-2 py-1 ${config.bg} ${config.color} rounded-full text-xs font-medium`}>
        {config.text}
      </span>
    );
  };

  // Ödeme durumunu formatla
  const formatPaymentStatus = (status) => {
    const statusConfig = {
      paid: { text: 'Ödendi', bg: 'bg-green-100', color: 'text-green-800' },
      pending: { text: 'Beklemede', bg: 'bg-yellow-100', color: 'text-yellow-800' },
      refunded: { text: 'İade', bg: 'bg-gray-100', color: 'text-gray-800' }
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Müşteri, mağaza, sipariş no ara..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
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
          <div className="flex flex-col sm:flex-row gap-3">
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
            
            <select
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
            >
              <option value="all">Tüm Mağazalar</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl text-gray-300 mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Henüz Sipariş Yok</h2>
            <p className="text-gray-600">Sistem henüz sipariş almış değil.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sipariş
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mağaza
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
                      Ödeme
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
                        <div className="text-sm font-medium text-gray-900">#{order.order_number || order.id.substring(0,8)}</div>
                        <div className="text-sm text-gray-500">ID: {order.id.substring(0,8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.storeName}</div>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatPaymentStatus(order.payment_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link 
                          href={`/admin/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-150"
                        >
                          Detay
                        </Link>
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
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                          currentPage === pageNumber
                            ? 'bg-blue-500 text-white'
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
          </>
        )}
      </div>
    </div>
  );
} 
