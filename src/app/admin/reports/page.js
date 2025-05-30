'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import AuthGuard from '../../../components/AuthGuard';
import api from '@/lib/api'; // API servisini import et

export default function AdminReports() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminReportsContent />
    </AuthGuard>
  );
}

function AdminReportsContent() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    sales: { byCategory: {} }, // Başlangıçta byCategory tanımlı olmalı
    orders: { byStatus: {}, byCategory: {} }, // Başlangıçta byStatus ve byCategory tanımlı olmalı
    users: { byRole: {} }, // Başlangıçta byRole tanımlı olmalı
    stores: { byCategory: {}, topStores: [] } // Başlangıçta byCategory ve topStores tanımlı olmalı
  });
  // const [dateRange, setDateRange] = useState('week'); // Bu filtre henüz aktif değil
  const [reportType, setReportType] = useState('sales');
  // const [categoryFilter, setCategoryFilter] = useState('all'); // Bu filtre henüz aktif değil
  const [mainCategories, setMainCategories] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const ordersData = await api.getAllOrders(); 
        const usersData = await api.getAllUsers();
        const storesData = await api.getStores();
        const mainCategoriesData = await api.getMainCategories();
        setMainCategories(mainCategoriesData);

        // Tarih fonksiyonları
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        const monthAgo = new Date();
        monthAgo.setMonth(today.getMonth() - 1);

        // Rapor verilerini hesapla
        const salesReport = {
          total: ordersData.reduce((sum, order) => sum + order.total_amount, 0),
          todayTotal: ordersData.filter(order => new Date(order.order_date).setHours(0,0,0,0) === today.setHours(0,0,0,0)).reduce((sum, order) => sum + order.total_amount, 0),
          weeklyTotal: ordersData.filter(order => {
            const orderDate = new Date(order.order_date);
            return orderDate >= weekAgo && orderDate <= today;
          }).reduce((sum, order) => sum + order.total_amount, 0),
          monthlyTotal: ordersData.filter(order => {
            const orderDate = new Date(order.order_date);
            return orderDate >= monthAgo && orderDate <= today;
          }).reduce((sum, order) => sum + order.total_amount, 0),
          averageOrderValue: ordersData.length > 0 ? ordersData.reduce((sum, order) => sum + order.total_amount, 0) / ordersData.length : 0,
          byCategory: mainCategoriesData.reduce((acc, category) => {
            acc[category.name] = ordersData
              .filter(order => {
                const store = storesData.find(s => s.id === order.store_id);
                return store && store.category_id === category.id;
              })
              .reduce((sum, order) => sum + order.total_amount, 0);
            return acc;
          }, {}),
        };

        const ordersReport = {
          total: ordersData.length,
          todayTotal: ordersData.filter(order => new Date(order.order_date).setHours(0,0,0,0) === today.setHours(0,0,0,0)).length,
          weeklyTotal: ordersData.filter(order => {
            const orderDate = new Date(order.order_date);
            return orderDate >= weekAgo && orderDate <= today;
          }).length,
          monthlyTotal: ordersData.filter(order => {
            const orderDate = new Date(order.order_date);
            return orderDate >= monthAgo && orderDate <= today;
          }).length,
          byStatus: ordersData.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
          }, {}),
          byCategory: mainCategoriesData.reduce((acc, category) => {
            acc[category.name] = ordersData
              .filter(order => {
                const store = storesData.find(s => s.id === order.store_id);
                return store && store.category_id === category.id;
              }).length;
            return acc;
          }, {}),
        };

        const usersReport = {
          total: usersData.length,
          active: usersData.filter(user => user.status === 'active').length, // users tablosunda status alanı varsa
          inactive: usersData.filter(user => user.status === 'inactive').length, // users tablosunda status alanı varsa
          byRole: usersData.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
          }, {}),
          newUsersToday: usersData.filter(user => new Date(user.created_at).setHours(0,0,0,0) === today.setHours(0,0,0,0)).length,
          newUsersWeek: usersData.filter(user => {
            const regDate = new Date(user.created_at);
            return regDate >= weekAgo && regDate <= today;
          }).length,
          newUsersMonth: usersData.filter(user => {
            const regDate = new Date(user.created_at);
            return regDate >= monthAgo && regDate <= today;
          }).length,
        };

        const storesReport = {
          total: storesData.length,
          active: storesData.filter(store => store.status === 'active').length,
          pending: storesData.filter(store => store.status === 'pending').length, // stores tablosunda status alanı varsa
          byCategory: mainCategoriesData.reduce((acc, category) => {
            acc[category.name] = storesData.filter(store => store.category_id === category.id).length;
            return acc;
          }, {}),
          topStores: storesData
            .map(store => ({
              ...store,
              totalRevenue: ordersData
                .filter(order => order.store_id === store.id)
                .reduce((sum, order) => sum + order.total_amount, 0),
              ordersCount: ordersData.filter(order => order.store_id === store.id).length,
            }))
            .filter(store => store.totalRevenue > 0)
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5)
            .map(store => ({
              id: store.id,
              name: store.name,
              revenue: store.totalRevenue,
              orders: store.ordersCount,
            })),
        };

        setReportData({
          sales: salesReport,
          orders: ordersReport,
          users: usersReport,
          stores: storesReport,
        });

      } catch (error) {
        console.error("Rapor verileri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Rapor tipine göre içerik
  const renderReportContent = () => {
    if (reportType === 'sales') {
      return (
        <div>
          <h2 className="text-xl font-bold mb-4">Satış Raporları</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Toplam Satış" 
              value={`${reportData.sales.total?.toFixed(2)} TL`}
              color="green"
            />
            <StatCard 
              title="Bugünkü Satış" 
              value={`${reportData.sales.todayTotal?.toFixed(2)} TL`} 
              color="blue"
            />
            <StatCard 
              title="Haftalık Satış" 
              value={`${reportData.sales.weeklyTotal?.toFixed(2)} TL`} 
              color="purple"
            />
            <StatCard 
              title="Aylık Satış" 
              value={`${reportData.sales.monthlyTotal?.toFixed(2)} TL`} 
              color="indigo"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3">Kategori Bazında Satışlar</h3>
              <div className="space-y-3">
                {Object.entries(reportData.sales.byCategory || {}).map(([category, value]) => (
                  <div key={category} className="flex items-center">
                    <div className="w-24 font-medium">{category}</div>
                    <div className="flex-grow mx-2">
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getCategoryColorByName(category)}`} 
                          style={{ width: `${reportData.sales.total > 0 ? (value / reportData.sales.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-24 text-right">{value.toFixed(2)} TL</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3">Satış İstatistikleri</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Ortalama Sepet Tutarı</p>
                  <p className="text-xl font-bold">{reportData.sales.averageOrderValue?.toFixed(2)} TL</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">En Yüksek Satış Kategorisi</p>
                  <p className="text-xl font-bold">
                    {Object.entries(reportData.sales.byCategory || {})
                      .sort((a, b) => b[1] - a[1])[0]?.[0] || '-'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">En Düşük Satış Kategorisi</p>
                  <p className="text-xl font-bold">
                    {Object.entries(reportData.sales.byCategory || {})
                      .sort((a, b) => a[1] - b[1])[0]?.[0] || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (reportType === 'orders') {
      return (
        <div>
          <h2 className="text-xl font-bold mb-4">Sipariş Raporları</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Toplam Sipariş" 
              value={reportData.orders.total}
              color="indigo"
            />
            <StatCard 
              title="Bugünkü Siparişler" 
              value={reportData.orders.todayTotal} 
              color="blue"
            />
            <StatCard 
              title="Haftalık Siparişler" 
              value={reportData.orders.weeklyTotal} 
              color="purple"
            />
            <StatCard 
              title="Aylık Siparişler" 
              value={reportData.orders.monthlyTotal} 
              color="green"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3">Sipariş Durumları</h3>
              <div className="space-y-3">
                {Object.entries(reportData.orders.byStatus || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center">
                    <div className="w-24 font-medium">{formatStatus(status)}</div>
                    <div className="flex-grow mx-2">
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getStatusColor(status)}`} 
                          style={{ width: `${reportData.orders.total > 0 ? (count / reportData.orders.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-10 text-right">{count}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3">Kategori Bazında Siparişler</h3>
              <div className="space-y-3">
                {Object.entries(reportData.orders.byCategory || {}).map(([category, count]) => (
                  <div key={category} className="flex items-center">
                    <div className="w-24 font-medium">{category}</div>
                    <div className="flex-grow mx-2">
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getCategoryColorByName(category)}`} 
                          style={{ width: `${reportData.orders.total > 0 ? (count / reportData.orders.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-10 text-right">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    } else if (reportType === 'users') {
      return (
        <div>
          <h2 className="text-xl font-bold mb-4">Kullanıcı Raporları</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Toplam Kullanıcı" 
              value={reportData.users.total}
              color="blue"
            />
            <StatCard 
              title="Aktif Kullanıcılar" 
              value={reportData.users.active} 
              color="green"
            />
            <StatCard 
              title="Pasif Kullanıcılar" 
              value={reportData.users.inactive} 
              color="red"
            />
            <StatCard 
              title="Haftalık Yeni Kullanıcı" 
              value={reportData.users.newUsersWeek} 
              color="indigo"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3">Kullanıcı Rolleri</h3>
              <div className="space-y-3">
                {Object.entries(reportData.users.byRole || {}).map(([role, count]) => (
                  <div key={role} className="flex items-center">
                    <div className="w-24 font-medium">{formatRole(role)}</div>
                    <div className="flex-grow mx-2">
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getRoleColor(role)}`} 
                          style={{ width: `${reportData.users.total > 0 ? (count / reportData.users.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-10 text-right">{count}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3">Yeni Kullanıcı Kayıtları</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Bugün</p>
                  <p className="text-xl font-bold">{reportData.users.newUsersToday}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Son 7 Gün</p>
                  <p className="text-xl font-bold">{reportData.users.newUsersWeek}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Son 30 Gün</p>
                  <p className="text-xl font-bold">{reportData.users.newUsersMonth}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (reportType === 'stores') {
      return (
        <div>
          <h2 className="text-xl font-bold mb-4">Mağaza Raporları</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <StatCard 
              title="Toplam Mağaza" 
              value={reportData.stores.total}
              color="green"
            />
            <StatCard 
              title="Aktif Mağazalar" 
              value={reportData.stores.active} 
              color="blue"
            />
            <StatCard 
              title="Onay Bekleyen Mağazalar" 
              value={reportData.stores.pending} 
              color="amber"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3">Kategori Bazında Mağazalar</h3>
              <div className="space-y-3">
                {Object.entries(reportData.stores.byCategory || {}).map(([category, count]) => (
                  <div key={category} className="flex items-center">
                    <div className="w-24 font-medium">{category}</div>
                    <div className="flex-grow mx-2">
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getCategoryColorByName(category)}`} 
                          style={{ width: `${reportData.stores.total > 0 ? (count / reportData.stores.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-10 text-right">{count}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3">En Çok Kazanç Sağlayan Mağazalar</h3>
              <div className="space-y-3">
                {(reportData.stores.topStores || []).map((store, index) => (
                  <div key={store.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm mr-3">
                        {index + 1}
                      </span>
                      <span className="font-medium">{store.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{store.revenue.toFixed(2)} TL</div>
                      <div className="text-xs text-gray-500">{store.orders} sipariş</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'in_progress': return 'Hazırlanıyor';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const formatRole = (role) => {
    switch (role) {
      case 'user': return 'Müşteri';
      case 'store': return 'Mağaza';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-50 dark:bg-gray-9000';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'user': return 'bg-blue-500';
      case 'store': return 'bg-green-500';
      case 'admin': return 'bg-purple-500';
      default: return 'bg-gray-50 dark:bg-gray-9000';
    }
  };

  const getCategoryColorByName = (categoryName) => {
    const category = mainCategories.find(cat => cat.name === categoryName);
    if (!category) return 'bg-gray-50 dark:bg-gray-9000'; // Varsayılan renk

    switch (category.id) { // ID'ye göre renk ataması daha tutarlı olabilir
      case 1: return 'bg-red-500'; // Yemek
      case 2: return 'bg-teal-500'; // Market (Orjinalde #4ECDC4, teal'e yakın)
      case 3: return 'bg-sky-500'; // Su (Orjinalde #1A85FF, sky'a yakın)
      case 4: return 'bg-purple-500'; // Aktüel (Orjinalde #9649CB, purple'a yakın)
      default: return 'bg-gray-50 dark:bg-gray-9000';
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
          <h1 className="text-3xl font-bold text-gray-800">Raporlar</h1>
          <p className="text-gray-600 mt-1">Satış, sipariş ve kullanıcı analizleri</p>
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

      {/* Rapor Türü Seçimi */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            className={`px-4 py-2 rounded-md font-medium ${
              reportType === 'sales' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setReportType('sales')}
          >
            Satış Raporları
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium ${
              reportType === 'orders' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setReportType('orders')}
          >
            Sipariş Raporları
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium ${
              reportType === 'users' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setReportType('users')}
          >
            Kullanıcı Raporları
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium ${
              reportType === 'stores' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setReportType('stores')}
          >
            Mağaza Raporları
          </button>
        </div>
      </div>

      {/* Rapor İçeriği */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {renderReportContent()}
      </div>
    </div>
  );
}

// İstatistik Kartı Bileşeni
function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-600">
      {/* StatCard renkleri Tailwind CSS class'ları ile daha dinamik hale getirilebilir */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`text-2xl font-bold text-${color}-700 mt-1`}>{value}</p> 
        </div>
      </div>
    </div>
  );
} 
