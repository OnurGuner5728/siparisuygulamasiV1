'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiUser, FiShoppingBag, FiHome, FiPackage, FiLayers, FiBarChart2, FiAlertCircle, FiChevronRight, FiDatabase } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import AuthGuard from '../../components/AuthGuard';

export default function AdminPanel() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminPanelContent />
    </AuthGuard>
  );
}

function AdminPanelContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    usersCount: 0,
    storesCount: 0,
    ordersCount: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API çağrısı - gerçek bir API'den verileri çekersiniz
    setTimeout(() => {
      setStats({
        usersCount: 245,
        storesCount: 58,
        ordersCount: 1248,
        pendingApprovals: 12
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Başlık */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Admin Paneli</h1>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Hoş geldin,</span>
              <span className="font-semibold">{user.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Dashboard İstatistikleri */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Toplam Kullanıcı" 
            value={stats.usersCount} 
            icon={<FiUser className="w-6 h-6" />}
            color="orange"
          />
          <StatCard 
            title="Toplam Mağaza" 
            value={stats.storesCount} 
            icon={<FiHome className="w-6 h-6" />}
            color="red"
          />
          <StatCard 
            title="Toplam Sipariş" 
            value={stats.ordersCount} 
            icon={<FiShoppingBag className="w-6 h-6" />}
            color="orange"
          />
          <StatCard 
            title="Onay Bekleyen" 
            value={stats.pendingApprovals} 
            icon={<FiAlertCircle className="w-6 h-6" />}
            color="red"
          />
        </div>

        {/* Ana Menü Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MenuCard 
            title="Kullanıcı Yönetimi" 
            description="Tüm kullanıcıları görüntüle, düzenle ve yönet."
            href="/admin/users"
            icon={<FiUser className="w-6 h-6" />}
          />
          <MenuCard 
            title="Mağaza Yönetimi" 
            description="Mağazaları görüntüle, düzenle ve onay işlemlerini yönet."
            href="/admin/stores"
            icon={<FiHome className="w-6 h-6" />}
          />
          <MenuCard 
            title="Sipariş Yönetimi" 
            description="Tüm siparişleri görüntüle ve yönet."
            href="/admin/orders"
            icon={<FiShoppingBag className="w-6 h-6" />}
          />
          <MenuCard 
            title="Ürün Yönetimi" 
            description="Tüm ürünleri görüntüle, düzenle ve yeni ürünler ekle."
            href="/admin/products"
            icon={<FiPackage className="w-6 h-6" />}
          />
          <MenuCard 
            title="Kategori Yönetimi" 
            description="Kategorileri görüntüle, düzenle ve yeni kategoriler ekle."
            href="/admin/categories"
            icon={<FiLayers className="w-6 h-6" />}
          />
          <MenuCard 
            title="Raporlar" 
            description="Satış, sipariş ve kullanıcı analizlerini görüntüle."
            href="/admin/reports"
            icon={<FiBarChart2 className="w-6 h-6" />}
          />
          
          {/* Kampanyalar */}
          <MenuCard 
            title="Kampanya Yönetimi" 
            description="Kampanyaları ve indirimleri yönet."
            href="/admin/kampanyalar"
            icon={<FiShoppingBag className="w-6 h-6" />}
          />
          
          {/* Veri Göçü */}
         {/* <MenuCard 
            title="Veri Göçü Yönetimi" 
            description="Mock verilerden Supabase'e veri göçünü gerçekleştir."
            href="/admin/data-migration"
            icon={<FiDatabase className="w-6 h-6" />}
          />*/}
          
          {/* Modül Yönetimi */}
          <MenuCard 
            title="Modül Yönetimi" 
            description="Uygulama modüllerinin erişim ayarlarını yönet."
            href="/admin/modules"
            icon={<FiLayers className="w-6 h-6" />}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    orange: 'from-orange-500 to-orange-400',
    red: 'from-red-500 to-red-400'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center">
        <div className={`bg-gradient-to-r ${colorClasses[color]} text-white p-2.5 rounded-lg mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
}

function MenuCard({ title, description, href, icon }) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-2.5 rounded-lg">
            {icon}
          </div>
          <FiChevronRight className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  );
} 