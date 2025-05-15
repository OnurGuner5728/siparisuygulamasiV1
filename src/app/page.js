'use client'; // Client tarafında çalışması için eklendi
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { mainCategories, mockCategories, mockStores } from '@/app/data/mockdatas';
import CampaignBanner from '@/components/CampaignBanner';

export default function Home() {
  // AuthContext'ten kullanıcı bilgileri ve yetki kontrolü için useAuth hook'unu kullanıyoruz
  const { user, loading, isAuthenticated, hasPermission } = useAuth();
  const [categories, setCategories] = useState([]);
  const [storeCountByCategory, setStoreCountByCategory] = useState({});

  // Kategori arka plan rengini belirle
  const getCategoryColor = (categoryId) => {
    switch (categoryId) {
      case 1: // Yemek
        return '#FF6B6B';
      case 2: // Market
        return '#4ECDC4';
      case 3: // Su
        return '#1A85FF';
      case 4: // Aktüel
        return '#9649CB';
      default:
        return '#6c757d';
    }
  };

  // Kategorinin açık olup olmadığını kontrol et (en az bir aktif ve açık mağazası varsa)
  const isCategoryOpen = (categoryId) => {
    const stores = mockStores.filter(store => 
      store.categoryId === categoryId && 
      store.approved === true &&
      store.isOpen === true
    );
    return stores.length > 0;
  };

  useEffect(() => {
    // API çağrısı simülasyonu
    setTimeout(() => {
      let filteredCategories = [...mockCategories];
      
      // Kullanıcı giriş yapmamışsa veya admin değilse aktüel kategorisini gösterme
      if (!user || user.role !== 'admin') {
        filteredCategories = filteredCategories.filter(cat => cat.name.toLowerCase() !== 'aktüel');
      }
      
      setCategories(filteredCategories);

      // Her kategori için mağaza sayısını hesapla
      const storeCount = {};
      
      console.log("Tüm mağazalar:", mockStores.map(s => `${s.name} (id:${s.id}, cat:${s.categoryId}, status:${s.status}, approved:${s.approved})`));
      
      const yemekMagazalari = mockStores.filter(s => s.categoryId === 1 && s.approved === true);
      const marketMagazalari = mockStores.filter(s => s.categoryId === 2 && s.approved === true);
      const suMagazalari = mockStores.filter(s => s.categoryId === 3 && s.approved === true);
      const aktuelMagazalari = mockStores.filter(s => s.categoryId === 4 && s.approved === true);
      
      storeCount[1] = yemekMagazalari.length; // Yemek
      storeCount[2] = marketMagazalari.length; // Market
      storeCount[3] = suMagazalari.length; // Su
      storeCount[4] = aktuelMagazalari.length; // Aktüel
      
      console.log("Yemek mağazaları:", yemekMagazalari.map(s => `${s.name} (${s.status})`));
      console.log("Market mağazaları:", marketMagazalari.map(s => `${s.name} (${s.status})`));
      console.log("Su mağazaları:", suMagazalari.map(s => `${s.name} (${s.status})`));
      console.log("Aktüel mağazaları:", aktuelMagazalari.map(s => `${s.name} (${s.status})`));
      
      setStoreCountByCategory(storeCount);
    }, 500);
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Kampanya Banner */}
      <div className="mb-10">
        <CampaignBanner />
      </div>
      
  
      
      {/* Ana kategoriler */}
      <h1 className="text-3xl font-bold mb-6">Kategoriler</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.id}
            href={`/${category.name.toLowerCase()}`}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
              <div 
                className="h-48 bg-cover bg-center"
                style={{ 
                  backgroundColor: getCategoryColor(category.id),
                  backgroundImage: 'none'
                }}
              >
                <div className="w-full h-full bg-black bg-opacity-10 flex items-center justify-center">
                  <h2 className="text-white text-3xl font-bold">{category.name}</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-600">{category.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-blue-600 font-medium">{storeCountByCategory[category.id] || 0} Mağaza</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {isCategoryOpen(category.id) ? 'Açık' : 'Kapalı'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
