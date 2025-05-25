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
    <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 min-h-screen">
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce animation-delay-1000"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/5 rounded-full animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/15 rounded-full animate-ping animation-delay-3000"></div>
          <div className="absolute top-1/2 right-10 w-8 h-8 bg-white/20 rounded-full animate-bounce animation-delay-500"></div>
          <div className="absolute bottom-32 right-1/3 w-6 h-6 bg-white/10 rounded-full animate-pulse animation-delay-1500"></div>
          
          {/* Floating Food Icons */}
          <div className="absolute top-16 left-1/3 text-white/20 animate-float animation-delay-1000">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2L3 6v6c0 5.55 3.84 10 7 10s7-4.45 7-10V6l-7-4z"/>
            </svg>
          </div>
          <div className="absolute top-40 right-1/4 text-white/15 animate-float animation-delay-2000">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"/>
            </svg>
          </div>
        </div>
        
        <div className="relative container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fadeInUp">
              Lezzet Kapınızda!
            </h1>
            <p className="text-xl text-white/90 mb-8 animate-fadeInUp animation-delay-500">
              En sevdiğiniz yemekleri, taze ürünleri ve daha fazlasını keşfedin
            </p>
          </div>
          
          {/* Modern Search Bar */}
          <div className="max-w-2xl mx-auto animate-fadeInUp animation-delay-1000">
            <div className="relative">
              <Link href="/search">
                <div className="bg-white rounded-2xl shadow-xl p-2 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
                  <div className="flex items-center">
                    <div className="flex-1 flex items-center px-4 py-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Yemek, market, ürün arayın..."
                        className="w-full text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none text-lg"
                        readOnly
                      />
                    </div>
                    <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                      <span className="font-medium">Ara</span>
                    </button>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* Quick Categories */}
            <div className="flex flex-wrap justify-center gap-3 mt-6 animate-fadeInUp animation-delay-1500">
              {categories.map((category, index) => {
                const moduleName = getModuleNameFromCategory(category);
                if (!moduleName || !isModuleEnabled(moduleName)) return null;
                
                return (
                  <Link 
                    key={category.id} 
                    href={`/${category.name.toLowerCase()}`} 
                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/30 hover:scale-110 transition-all duration-200 text-sm font-medium flex items-center space-x-2 animate-slideInLeft"
                    style={{ animationDelay: `${2000 + index * 100}ms` }}
                  >
                    {category.image && (
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="w-4 h-4 rounded-sm object-cover"
                      />
                    )}
                    <span>{category.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
      </div>
      
      {/* Kampanya Banner */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          <CampaignBanner />
        </div>
      </div>
      
      {/* Ana kategoriler */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fadeInUp">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Kategoriler
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            İhtiyacınız olan her şey için geniş kategori seçeneklerimizi keşfedin
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="animate-fadeInUp"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <CategoryCard
                id={category.id}
                name={category.name}
                description={category.description}
                color={getCategoryColor(category.id)}
                imageUrl={category.image}
                storeCount={storeCountByCategory[category.id] || 0}
                isOpen={isCategoryOpen(category.id)}
                url={`/${category.name.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
        
        {/* Popüler Restoranlar - Yemek modülü aktifse göster */}
        {isModuleEnabled('yemek') && (
          <div className="mt-16">
            <div className="text-center mb-12 animate-fadeInUp">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Popüler Restoranlar
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                En çok tercih edilen lezzet durağları
              </p>
              <Button href="/yemek" variant="text" className="text-orange-500 hover:text-orange-600 font-semibold">
                Tümünü Gör →
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stores
                .filter(store => store.category_id === 1 && store.is_approved)
                .slice(0, 4)
                .map((store, index) => (
                  <Link 
                    key={store.id} 
                    href={`/yemek/store/${store.id}`} 
                    className="group animate-slideInUp"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
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
          <div className="mt-16">
            <div className="text-center mb-12 animate-fadeInUp">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Yakındaki Marketler
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Taze ürünler kapınızda
              </p>
              <Button href="/market" variant="text" className="text-orange-500 hover:text-orange-600 font-semibold">
                Tümünü Gör →
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stores
                .filter(store => store.category_id === 2 && store.is_approved)
                .slice(0, 4)
                .map((store, index) => (
                  <Link 
                    key={store.id} 
                    href={`/market/store/${store.id}`} 
                    className="group animate-slideInUp"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
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
            <div className="flex justify-between items-center mb-6 animate-fadeInUp">
              <h2 className="text-2xl font-bold text-gray-800">Su Satıcıları</h2>
              <Button href="/su" variant="text">Tümünü Gör</Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {stores
                .filter(store => store.category_id === 3 && store.is_approved)
                .slice(0, 4)
                .map((store, index) => (
                  <Link 
                    key={store.id} 
                    href={`/su/store/${store.id}`} 
                    className="group animate-slideInUp"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
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
            <div className="flex justify-between items-center mb-6 animate-fadeInUp">
              <h2 className="text-2xl font-bold text-gray-800">Aktüel Ürünler</h2>
              <Button href="/aktuel" variant="text">Tümünü Gör</Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {stores
                .filter(store => store.category_id === 4 && store.is_approved)
                .slice(0, 4)
                .map((store, index) => (
                  <Link 
                    key={store.id} 
                    href={`/aktuel/store/${store.id}`} 
                    className="group animate-slideInUp"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
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
