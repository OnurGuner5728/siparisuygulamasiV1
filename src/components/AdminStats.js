'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiShoppingBag, FiStore, FiClock, FiTrendingUp, FiDollarSign, FiActivity, FiEye, FiAlertCircle } from 'react-icons/fi';
import * as api from '@/lib/api';

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalOrders: 0,
    pendingOrders: 0,
    pendingStores: 0,
    monthlyRevenue: 0
  });
  const [dailyStats, setDailyStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [topStores, setTopStores] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Paralel olarak tüm istatistikleri yükle
      const [
        adminStats,
        dailyData,
        categoryData,
        topStoresData,
        activitiesData
      ] = await Promise.all([
        api.getAdminStats(),
        api.getDailyOrderStats(7),
        api.getCategoryStats(),
        api.getTopStores(5),
        api.getRecentUserActivities(10)
      ]);

      setStats(adminStats);
      setDailyStats(dailyData);
      setCategoryStats(categoryData);
      setTopStores(topStoresData);
      setRecentActivities(activitiesData);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      confirmed: 'text-blue-600 bg-blue-100',
      preparing: 'text-orange-600 bg-orange-100',
      shipped: 'text-purple-600 bg-purple-100',
      delivered: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Bekliyor',
      confirmed: 'Onaylandı',
      preparing: 'Hazırlanıyor',
      shipped: 'Yolda',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi'
    };
    return texts[status] || status;
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          {Icon && <Icon className="text-white" size={24} />}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <FiTrendingUp className="text-green-500 mr-1" size={16} />
          <span className="text-sm text-green-600 font-medium">{trend}</span>
        </div>
      )}
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <FiAlertCircle className="mx-auto text-red-300 text-4xl mb-4" />
        <h3 className="text-xl font-semibold text-red-600 mb-2">İstatistikler Yüklenemedi</h3>
        <p className="text-red-500 mb-4">{error.message}</p>
        <button 
          onClick={loadAllStats}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Genel İstatistikler</h2>
        <button
          onClick={loadAllStats}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
        >
          <FiActivity className="mr-2" size={16} />
          Yenile
        </button>
      </div>

      {/* Ana İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Toplam Kullanıcı"
          value={stats.totalUsers.toLocaleString('tr-TR')}
          icon={FiUsers}
          color="bg-blue-500"
          subtitle="Kayıtlı kullanıcı sayısı"
        />
        <StatCard
          title="Toplam Mağaza"
          value={stats.totalStores.toLocaleString('tr-TR')}
          icon={FiStore}
          color="bg-green-500"
          subtitle="Aktif mağaza sayısı"
        />
        <StatCard
          title="Toplam Sipariş"
          value={stats.totalOrders.toLocaleString('tr-TR')}
          icon={FiShoppingBag}
          color="bg-purple-500"
          subtitle="Tüm zamanlar"
        />
        <StatCard
          title="Bekleyen Siparişler"
          value={stats.pendingOrders.toLocaleString('tr-TR')}
          icon={FiClock}
          color="bg-yellow-500"
          subtitle="Onay bekleyen"
        />
        <StatCard
          title="Bekleyen Mağazalar"
          value={stats.pendingStores.toLocaleString('tr-TR')}
          icon={FiEye}
          color="bg-orange-500"
          subtitle="Onay bekleyen"
        />
        <StatCard
          title="Aylık Gelir"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={FiDollarSign}
          color="bg-emerald-500"
          subtitle="Bu ay"
        />
      </div>

      {/* Günlük Sipariş Trendi */}
      {dailyStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Son 7 Günün Sipariş Trendi</h3>
          <div className="space-y-4">
            {dailyStats.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">
                    {new Date(day.date).toLocaleDateString('tr-TR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <span className="text-gray-600">
                    <span className="font-medium text-gray-900">{day.orders}</span> sipariş
                  </span>
                  <span className="text-gray-600">
                    <span className="font-medium text-gray-900">{formatCurrency(day.revenue)}</span>
                  </span>
                  <span className="text-green-600">
                    <span className="font-medium">{day.completed}</span> tamamlandı
                  </span>
                  {day.cancelled > 0 && (
                    <span className="text-red-600">
                      <span className="font-medium">{day.cancelled}</span> iptal
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* En Çok Sipariş Alan Mağazalar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">En Popüler Mağazalar</h3>
          <div className="space-y-4">
            {topStores.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Henüz sipariş verilen mağaza bulunmuyor
              </div>
            ) : (
              topStores.map((store, index) => (
                <div key={store.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{store.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>⭐ {store.rating.toFixed(1)}</span>
                        <span>•</span>
                        <span>{store.reviewCount} yorum</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{store.orders} sipariş</div>
                    <div className="text-sm text-gray-500">{formatCurrency(store.revenue)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kategori İstatistikleri */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Kategori Bazlı Satışlar</h3>
          <div className="space-y-4">
            {categoryStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Henüz kategori bazlı satış bulunmuyor
              </div>
            ) : (
              categoryStats.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{category.orders} sipariş</div>
                    <div className="text-sm text-gray-500">{formatCurrency(category.revenue)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Son Aktiviteler */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Son Sipariş Aktiviteleri</h3>
        <div className="overflow-x-auto">
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Henüz sipariş aktivitesi bulunmuyor
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Müşteri</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Mağaza</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Tutar</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Durum</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((activity) => (
                  <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{activity.customerName}</div>
                        <div className="text-sm text-gray-500">{activity.customerEmail}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{activity.storeName}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {formatCurrency(activity.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {getStatusText(activity.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(activity.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStats; 