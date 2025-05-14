'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import AuthGuard from '../../../components/AuthGuard';
import { mockOrders, mockUsers, mockStores, mockCategories } from '@/app/data/mockdatas';

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
    sales: {},
    orders: {},
    users: {},
    stores: {}
  });
  const [dateRange, setDateRange] = useState('week');
  const [reportType, setReportType] = useState('sales');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    // Mock veri yükleme - gerçekte bir API isteği olacak
    setTimeout(() => {
      const orders = mockOrders;
      const users = mockUsers;
      const stores = mockStores;

      // Satış raporları
      const salesData = {
        total: orders.reduce((sum, order) => sum + order.total, 0),
        todayTotal: orders.filter(order => {
          const orderDate = new Date(order.orderDate);
          const today = new Date();
          return orderDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
        }).reduce((sum, order) => sum + order.total, 0),
        weeklyTotal: orders.filter(order => {
          const orderDate = new Date(order.orderDate);
          const today = new Date();
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          return orderDate >= weekAgo && orderDate <= today;
        }).reduce((sum, order) => sum + order.total, 0),
        monthlyTotal: orders.filter(order => {
          const orderDate = new Date(order.orderDate);
          const today = new Date();
          const monthAgo = new Date();
          monthAgo.setMonth(today.getMonth() - 1);
          return orderDate >= monthAgo && orderDate <= today;
        }).reduce((sum, order) => sum + order.total, 0),
        averageOrderValue: orders.length > 0 ? 
          orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
        byCategory: {
          Yemek: orders.filter(order => order.category === 'Yemek')
            .reduce((sum, order) => sum + order.total, 0),
          Market: orders.filter(order => order.category === 'Market')
            .reduce((sum, order) => sum + order.total, 0),
          Su: orders.filter(order => order.category === 'Su')
            .reduce((sum, order) => sum + order.total, 0),
          Aktüel: orders.filter(order => order.category === 'Aktüel')
            .reduce((sum, order) => sum + order.total, 0)
        }
      };

      // Sipariş raporları
      const ordersData = {
        total: orders.length,
        todayTotal: orders.filter(order => {
          const orderDate = new Date(order.orderDate);
          const today = new Date();
          return orderDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
        }).length,
        weeklyTotal: orders.filter(order => {
          const orderDate = new Date(order.orderDate);
          const today = new Date();
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          return orderDate >= weekAgo && orderDate <= today;
        }).length,
        monthlyTotal: orders.filter(order => {
          const orderDate = new Date(order.orderDate);
          const today = new Date();
          const monthAgo = new Date();
          monthAgo.setMonth(today.getMonth() - 1);
          return orderDate >= monthAgo && orderDate <= today;
        }).length,
        byStatus: {
          pending: orders.filter(order => order.status === 'pending').length,
          in_progress: orders.filter(order => order.status === 'in_progress').length,
          delivered: orders.filter(order => order.status === 'delivered').length,
          cancelled: orders.filter(order => order.status === 'cancelled').length
        },
        byCategory: {
          Yemek: orders.filter(order => order.category === 'Yemek').length,
          Market: orders.filter(order => order.category === 'Market').length,
          Su: orders.filter(order => order.category === 'Su').length,
          Aktüel: orders.filter(order => order.category === 'Aktüel').length
        }
      };

      // Kullanıcı raporları
      const usersData = {
        total: users.length,
        active: users.filter(user => user.status === 'active').length,
        inactive: users.filter(user => user.status === 'inactive').length,
        byRole: {
          user: users.filter(user => user.role === 'user').length,
          store: users.filter(user => user.role === 'store').length,
          admin: users.filter(user => user.role === 'admin').length
        },
        newUsersToday: users.filter(user => {
          const regDate = new Date(user.registrationDate);
          const today = new Date();
          return regDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
        }).length,
        newUsersWeek: users.filter(user => {
          const regDate = new Date(user.registrationDate);
          const today = new Date();
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          return regDate >= weekAgo && regDate <= today;
        }).length,
        newUsersMonth: users.filter(user => {
          const regDate = new Date(user.registrationDate);
          const today = new Date();
          const monthAgo = new Date();
          monthAgo.setMonth(today.getMonth() - 1);
          return regDate >= monthAgo && regDate <= today;
        }).length
      };

      // Mağaza raporları
      const storesData = {
        total: stores.length,
        active: stores.filter(store => store.status === 'active').length,
        pending: stores.filter(store => store.status === 'pending').length,
        byCategory: {
          Yemek: stores.filter(store => store.category === 'Yemek').length,
          Market: stores.filter(store => store.category === 'Market').length,
          Su: stores.filter(store => store.category === 'Su').length,
          Aktüel: stores.filter(store => store.category === 'Aktüel').length
        },
        topStores: stores
          .filter(store => store.totalRevenue > 0)
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 5)
          .map(store => ({
            id: store.id,
            name: store.name,
            revenue: store.totalRevenue,
            orders: store.ordersCount
          }))
      };

      setReportData({
        sales: salesData,
        orders: ordersData,
        users: usersData,
        stores: storesData
      });
      
      setLoading(false);
    }, 1000);
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
                          className={`h-full ${getCategoryColor(category)}`} 
                          style={{ width: `${(value / reportData.sales.total) * 100}%` }}
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
                          style={{ width: `${(count / reportData.orders.total) * 100}%` }}
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
                          className={`h-full ${getCategoryColor(category)}`} 
                          style={{ width: `${(count / reportData.orders.total) * 100}%` }}
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
                          style={{ width: `${(count / reportData.users.total) * 100}%` }}
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
                          className={`h-full ${getCategoryColor(category)}`} 
                          style={{ width: `${(count / reportData.stores.total) * 100}%` }}
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
      default: return 'bg-gray-500';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'user': return 'bg-blue-500';
      case 'store': return 'bg-green-500';
      case 'admin': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Yemek': return 'bg-blue-500';
      case 'Market': return 'bg-green-500';
      case 'Su': return 'bg-cyan-500';
      case 'Aktüel': return 'bg-amber-500';
      default: return 'bg-gray-500';
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
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`text-2xl font-bold text-${color}-700 mt-1`}>{value}</p>
        </div>
      </div>
    </div>
  );
} 