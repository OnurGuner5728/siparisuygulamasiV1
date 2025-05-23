'use client'; // Client tarafında çalışması için eklendi
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useModule } from '@/contexts/ModuleContext';
import api from '@/lib/api';
import CampaignBanner from '@/components/CampaignBanner';
import CategoryCard from '@/components/cards/CategoryCard';
import Button from '@/components/ui/Button';

export default function Home() {
  // AuthContext'ten kullanıcı bilgileri ve yetki kontrolü için useAuth hook'unu kullanıyoruz
  const { user, loading: authLoading, isAuthenticated, hasPermission } = useAuth();
  const { isModuleEnabled, isLoading: moduleLoading } = useModule();
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [storeCountByCategory, setStoreCountByCategory] = useState({});
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loading, setLoading] = useState(true);

  // Debug için kullanıcı bilgilerini göster - sadece development'ta  useEffect(() => {    if (process.env.NODE_ENV === 'development') {      if (user) {        console.log("Giriş yapmış kullanıcı:", user.email);        console.log("Kullanıcı rolü:", user.role);      }    }  }, [user]);

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
    const categoryStores = stores.filter(store => 
      store.category_id === categoryId && 
      store.status === 'active'
    );
    return categoryStores.length > 0;
  };

  // Kategori adından modül adını belirle
  const getModuleNameFromCategory = (category) => {
    if (!category || !category.name) return null;
    
    const name = category.name.toLowerCase();
    if (name.includes('yemek')) return 'yemek';
    if (name.includes('market')) return 'market';
    if (name.includes('su')) return 'su';
    if (name.includes('aktüel')) return 'aktuel';
    return null;
  };

  // Kategori ID'sinden modül adını belirle
  const getModuleNameFromCategoryId = (categoryId) => {
    switch (categoryId) {
      case 1: return 'yemek';
      case 2: return 'market';
      case 3: return 'su';
      case 4: return 'aktuel';
      default: return null;
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Ana kategorileri yükle - Yönetici yetkisiyle
        const mainCategoriesData = await api.getMainCategories(true);
        setMainCategories(mainCategoriesData);
        
        // Kategorileri yükle - Yönetici yetkisiyle
        const categoriesData = await api.getCategories(true);
        
        // Kullanıcı giriş yapmamışsa veya admin değilse, modül izinlerine göre kategorileri filtrele
        let filteredCategories = categoriesData;
        if (!moduleLoading) {
          filteredCategories = categoriesData.filter(cat => {
            const moduleName = getModuleNameFromCategory(cat);
            // Modül adı yoksa veya modül aktifse göster
            return !moduleName || isModuleEnabled(moduleName);
          });
        }
        
        setCategories(filteredCategories);
        
        // Mağazaları yükle - Yönetici yetkisiyle (tüm mağazalar, kapalı olanlar da dahil)
        const storesData = await api.getStores({}, true);
        setStores(storesData);
        
        // Her kategori için mağaza sayısını hesapla
        const storeCount = {};
        
        // Mağazaları kategorilere göre grupla (kapalı olanlar da dahil)
        categoriesData.forEach(category => {
          const categoryStores = storesData.filter(store => 
            store.category_id === category.id && store.is_approved
          );
          storeCount[category.id] = categoryStores.length;
        });
        
        setStoreCountByCategory(storeCount);
      } catch (error) {
        console.error("Ana sayfa verileri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [user, moduleLoading, isModuleEnabled]);

  if (loading || authLoading || moduleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Arama Çubuğu */}
      <div className={`bg-white shadow-sm py-4 transition-all duration-300 ${isSearchFocused ? 'sticky top-16 z-30 shadow-md' : ''}`}>
        <div className="container mx-auto px-4">
          <div className="relative">
            <Link href="/search">
              <input
                type="text"
                placeholder="Yemek, market veya ürün arayın..."
                className={`w-full bg-gray-100 rounded-full py-3 px-5 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${isSearchFocused ? 'bg-white shadow-sm' : ''}`}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                readOnly
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-orange-500 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Kampanya Banner */}
      <div className="py-4">
        <div className="container mx-auto px-4">
          <CampaignBanner />
        </div>
      </div>
      
      {/* Ana kategoriler */}
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Kategoriler</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              id={category.id}
              name={category.name}
              description={category.description}
              color={getCategoryColor(category.id)}
              imageUrl={category.image}
              storeCount={storeCountByCategory[category.id] || 0}
              isOpen={isCategoryOpen(category.id)}
              url={`/${category.name.toLowerCase()}`}
            />
          ))}
        </div>
        
        {/* Popüler Restoranlar - Yemek modülü aktifse göster */}
        {isModuleEnabled('yemek') && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Popüler Restoranlar</h2>
              <Button href="/yemek" variant="text">Tümünü Gör</Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {stores
                .filter(store => store.category_id === 1 && store.is_approved)
                .slice(0, 4)
                .map(store => (
                  <Link key={store.id} href={`/yemek/store/${store.id}`} className="group">
                    <div className={`bg-white rounded-2xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative ${
                      store.status !== 'active' ? 'opacity-75' : ''
                    }`}>
                      {/* Kapalı mağaza etiketi */}
                      {store.status !== 'active' && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                            Kapalı
                          </span>
                        </div>
                      )}
                      
                      <div className="h-32 bg-gray-200 relative">
                        {store.logo && (
                          <img 
                            src={store.logo} 
                            alt={store.name} 
                            className={`w-full h-full object-cover ${
                              store.status !== 'active' ? 'filter grayscale' : ''
                            }`}
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className={`font-bold ${
                          store.status !== 'active' ? 'text-gray-600' : 'text-gray-800'
                        }`}>{store.name}</h3>
                        <p className={`text-sm line-clamp-1 ${
                          store.status !== 'active' ? 'text-gray-400' : 'text-gray-500'
                        }`}>{store.description || 'Lezzetli yemekler'}</p>
                        <div className="flex items-center mt-2">
                          <div className="text-yellow-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="ml-1 text-xs">{store.rating?.toFixed(1) || '0.0'}</span>
                          </div>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className={`text-xs ${
                            store.status !== 'active' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {store.status === 'active' ? '30-45 dk' : 'Kapalı'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
        
        {/* Yakındaki Marketler - Market modülü aktifse göster */}
        {isModuleEnabled('market') && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Yakındaki Marketler</h2>
              <Button href="/market" variant="text">Tümünü Gör</Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {stores
                .filter(store => store.category_id === 2 && store.is_approved)
                .slice(0, 4)
                .map(store => (
                  <Link key={store.id} href={`/market/store/${store.id}`} className="group">
                    <div className={`bg-white rounded-2xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative ${
                      store.status !== 'active' ? 'opacity-75' : ''
                    }`}>
                      {/* Kapalı mağaza etiketi */}
                      {store.status !== 'active' && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                            Kapalı
                          </span>
                        </div>
                      )}
                      
                      <div className="h-32 bg-gray-200 relative">
                        {store.logo && (
                          <img 
                            src={store.logo} 
                            alt={store.name} 
                            className={`w-full h-full object-cover ${
                              store.status !== 'active' ? 'filter grayscale' : ''
                            }`}
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className={`font-bold ${
                          store.status !== 'active' ? 'text-gray-600' : 'text-gray-800'
                        }`}>{store.name}</h3>
                        <p className={`text-sm line-clamp-1 ${
                          store.status !== 'active' ? 'text-gray-400' : 'text-gray-500'
                        }`}>{store.description || 'Taze ürünler'}</p>
                        <div className="flex items-center mt-2">
                          <div className="text-yellow-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="ml-1 text-xs">{store.rating?.toFixed(1) || '0.0'}</span>
                          </div>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className={`text-xs ${
                            store.status !== 'active' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {store.status === 'active' ? '15-25 dk' : 'Kapalı'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
        
        {/* Su Satıcıları - Su modülü aktifse göster */}
        {isModuleEnabled('su') && (
          <div className="mt-12 pb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Su Satıcıları</h2>
              <Button href="/su" variant="text">Tümünü Gör</Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {stores
                .filter(store => store.category_id === 3 && store.is_approved)
                .slice(0, 4)
                .map(store => (
                  <Link key={store.id} href={`/su/store/${store.id}`} className="group">
                    <div className={`bg-white rounded-2xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative ${
                      store.status !== 'active' ? 'opacity-75' : ''
                    }`}>
                      {/* Kapalı mağaza etiketi */}
                      {store.status !== 'active' && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                            Kapalı
                          </span>
                        </div>
                      )}
                      
                      <div className="h-32 bg-gray-200 relative">
                        {store.logo && (
                          <img 
                            src={store.logo} 
                            alt={store.name} 
                            className={`w-full h-full object-cover ${
                              store.status !== 'active' ? 'filter grayscale' : ''
                            }`}
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className={`font-bold ${
                          store.status !== 'active' ? 'text-gray-600' : 'text-gray-800'
                        }`}>{store.name}</h3>
                        <p className={`text-sm line-clamp-1 ${
                          store.status !== 'active' ? 'text-gray-400' : 'text-gray-500'
                        }`}>{store.description || 'Kaliteli içme suyu'}</p>
                        <div className="flex items-center mt-2">
                          <div className="text-yellow-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="ml-1 text-xs">{store.rating?.toFixed(1) || '0.0'}</span>
                          </div>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className={`text-xs ${
                            store.status !== 'active' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {store.status === 'active' ? '45-60 dk' : 'Kapalı'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
        
        {/* Aktüel Ürünler - Aktüel modülü aktifse göster */}
        {isModuleEnabled('aktuel') && (
          <div className="mt-12 pb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Aktüel Ürünler</h2>
              <Button href="/aktuel" variant="text">Tümünü Gör</Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {stores
                .filter(store => store.category_id === 4 && store.is_approved)
                .slice(0, 4)
                .map(store => (
                  <Link key={store.id} href={`/aktuel/store/${store.id}`} className="group">
                    <div className={`bg-white rounded-2xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative ${
                      store.status !== 'active' ? 'opacity-75' : ''
                    }`}>
                      {/* Kapalı mağaza etiketi */}
                      {store.status !== 'active' && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                            Kapalı
                          </span>
                        </div>
                      )}
                      
                      <div className="h-32 bg-gray-200 relative">
                        {store.logo && (
                          <img 
                            src={store.logo} 
                            alt={store.name} 
                            className={`w-full h-full object-cover ${
                              store.status !== 'active' ? 'filter grayscale' : ''
                            }`}
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className={`font-bold ${
                          store.status !== 'active' ? 'text-gray-600' : 'text-gray-800'
                        }`}>{store.name}</h3>
                        <p className={`text-sm line-clamp-1 ${
                          store.status !== 'active' ? 'text-gray-400' : 'text-gray-500'
                        }`}>{store.description || 'Güncel kampanyalar'}</p>
                        <div className="flex items-center mt-2">
                          <span className={`text-xs ${
                            store.status !== 'active' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {store.status === 'active' ? 'Yeni Kampanyalar' : 'Kapalı'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
