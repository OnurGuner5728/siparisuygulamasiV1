'use client'; // Client tarafında çalışması için eklendi
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  // AuthContext'ten kullanıcı bilgileri ve yetki kontrolü için useAuth hook'unu kullanıyoruz
  const { user, loading, isAuthenticated, hasPermission } = useAuth();

  // Ana kategoriler
  const categories = [
    { id: 1, name: 'Yemek', icon: '🍔', path: '/yemek' },
    { id: 2, name: 'Market', icon: '🛒', path: '/market' },
    { id: 3, name: 'Su', icon: '💧', path: '/su' },
    { id: 4, name: 'Aktüel', icon: '🔥', path: '/aktuel' },
    { id: 5, name: 'Kampanyalar', icon: '🎉', path: '/kampanyalar' },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-16 lg:p-24">
      <div className="flex flex-col items-center w-full max-w-6xl">
        {/* Hero Bölümü */}
        <div className="w-full bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-8 mb-10 text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Hızlı ve Güvenilir Teslimat</h1>
          <p className="text-xl">Tek bir yerden tüm ihtiyaçlarınız için sipariş verin.</p>
        </div>
        
        {/* Kategori Kartları */}
        <h2 className="text-3xl font-bold mb-6 text-gray-800 self-start">Kategoriler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {categories.map((category) => {
            // Aktüel kategorisi için yetki kontrolü yap
            if (category.name === 'Aktüel' && !loading) {
              // Eğer kullanıcı yetkili değilse bu kategoriyi atla
              if (!hasPermission('aktuel')) {
                return null;
              }
            }
            
            // Kampanyalar kategorisi için yetki kontrolü yap
            if (category.name === 'Kampanyalar' && !loading) {
              // Eğer kullanıcı yetkili değilse bu kategoriyi atla
              if (!hasPermission('kampanya', 'view')) {
                return null;
              }
            }
            
            return (
              <Link key={category.id} href={category.path} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center">
                  <span className="text-5xl mb-4">{category.icon}</span>
                  <h3 className="text-xl font-semibold text-gray-800">{category.name}</h3>
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Promosyonlar/Kampanyalar */}
        {!loading && hasPermission('kampanya', 'view') && (
          <>
            <h2 className="text-3xl font-bold my-10 text-gray-800 self-start">Aktif Kampanyalar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Yemek Siparişlerinde %15 İndirim</h3>
                <p className="mb-4">İlk siparişinizde geçerli, minimum sipariş tutarı 120 TL.</p>
                <Link href="/kampanyalar" className="bg-white text-purple-700 px-4 py-2 rounded-lg font-medium">
                  İncele
                </Link>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Ücretsiz Teslimat</h3>
                <p className="mb-4">Market alışverişlerinde 200 TL ve üzeri siparişlerde geçerli.</p>
                <Link href="/kampanyalar" className="bg-white text-orange-700 px-4 py-2 rounded-lg font-medium">
                  İncele
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
