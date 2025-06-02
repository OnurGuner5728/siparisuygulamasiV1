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

  // Debug için kullanıcı bilgilerini göster - sadece development'ta  
  useEffect(() => { if (process.env.NODE_ENV === 'development') { if (user) { console.log("Giriş yapmış kullanıcı:", user.email); console.log("Kullanıcı rolü:", user.role); } } }, [user]);

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

  // Sadece modül yükleme tamamlandığında veri çek
  useEffect(() => {
    // Modül yüklenmesini bekle
    if (moduleLoading) return;

    let isCancelled = false;

    async function fetchData() {
      try {
        setLoading(true);

        // Paralel API çağrılarıyla performansı artır
        const [mainCategoriesData, categoriesData, storesData] = await Promise.all([
          api.getMainCategories(true),
          api.getCategories(true),
          api.getStores({}, true)
        ]);

        // Component unmount olmuşsa işlemi durdur
        if (isCancelled) return;

        setMainCategories(mainCategoriesData);

        // Modül izinlerine göre kategorileri filtrele
        const filteredCategories = categoriesData.filter(cat => {
          const moduleName = getModuleNameFromCategory(cat);
          return !moduleName || isModuleEnabled(moduleName);
        });

        setCategories(filteredCategories);
        setStores(storesData);

        // Mağaza sayılarını hesapla
        const storeCount = {};
        categoriesData.forEach(category => {
          const categoryStores = storesData.filter(store =>
            store.category_id === category.id && store.is_approved
          );
          storeCount[category.id] = categoryStores.length;
        });

        setStoreCountByCategory(storeCount);
      } catch (error) {
        if (!isCancelled) {
          console.error("Ana sayfa verileri yüklenirken hata:", error);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    // Cleanup function
    return () => {
      isCancelled = true;
    };
  }, [moduleLoading, isModuleEnabled]); // user dependency'si kaldırıldı

  if (loading || authLoading || moduleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 dark:from-gray-900 dark:to-gray-800 min-h-screen">
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
              <path d="M10 2L3 6v6c0 5.55 3.84 10 7 10s7-4.45 7-10V6l-7-4z" />
            </svg>
          </div>
          <div className="absolute top-40 right-1/4 text-white/15 animate-float animation-delay-2000">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" />
            </svg>
          </div>
        </div>

        <div className="relative container mx-auto px-4 py-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 animate-fadeInUp">
              Lezzet Kapınızda!
            </h1>
            <p className="text-lg text-white/90 mb-3 animate-fadeInUp animation-delay-500">
              En sevdiğiniz yemekleri, taze ürünleri ve daha fazlasını keşfedin
            </p>
          </div>

          {/* Modern Search Bar */}
          <div className="max-w-2xl mx-auto animate-fadeInUp animation-delay-1000">
            <div className="relative">
              <Link href="/search">
                <div className="bg-white rounded-xl shadow-xl p-1 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
                  <div className="flex items-center">
                    <div className="flex-1 flex items-center px-2 py-1">
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
                    <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                      <span className="font-medium">Ara</span>
                    </button>
                  </div>
                </div>
              </Link>
            </div>

            {/*
  <div className="flex flex-wrap justify-center gap-3 mt-2 animate-fadeInUp animation-delay-1500">
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
*/}

          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Ana Modüller - Görsel odaklı tasarım */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4 md:space-y-6">
          {/* Üst kısım - Market ve Yemek büyük kartlar */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* Market Kartı */}
            {isModuleEnabled('market') && (
              <Link href="/market" className="group">
                <div className="relative bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] h-40 md:h-48">
                  {/* Background Image */}
                  {categories.find(cat => cat.name.toLowerCase() === 'market')?.image_url ? (
                    <div 
                      className="absolute inset-0 bg-center bg-no-repeat bg-cover md:bg-[length:100%_100%]"
                      style={{
                        backgroundImage: `url(${categories.find(cat => cat.name.toLowerCase() === 'market')?.image_url})`,
                      }}
                    >
                      {/* Overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    </div>
                  ) : (
                    <>
                      {/* Default gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-600"></div>
                      {/* Pattern overlay */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white/40 rounded-full"></div>
                        <div className="absolute bottom-8 left-6 w-12 h-12 border-2 border-white/30 rounded-lg rotate-45"></div>
                        <div className="absolute top-1/2 right-8 w-8 h-8 bg-white/20 rounded-full"></div>
                      </div>
                    </>
                  )}
                  
                  {/* Content overlay */}
                  <div className="relative z-10 h-full flex flex-col justify-between p-4 md:p-6">
                    <div className="flex-1 flex items-center">
                    
                    </div>
                    <div className="text-white">
                      
                      <p className="text-white/90 text-sm md:text-base mb-2 drop-shadow">Market siparişi ver!</p>
                      <div className="flex items-center text-xs md:text-sm text-white/80">
                      <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                      {storeCountByCategory[2] || 0} mağaza
                    </div>
                  </div>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </Link>
            )}

            {/* Yemek Kartı */}
            {isModuleEnabled('yemek') && (
              <Link href="/yemek" className="group">
                <div className="relative bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] h-40 md:h-48">
                  {/* Background Image */}
                  {categories.find(cat => cat.name.toLowerCase() === 'yemek')?.image_url ? (
                    <div 
                      className="absolute inset-0 bg-center bg-no-repeat bg-cover md:bg-[length:100%_100%]"
                      style={{
                        backgroundImage: `url(${categories.find(cat => cat.name.toLowerCase() === 'yemek')?.image_url})`,
                      }}
                    >
                      {/* Overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    </div>
                  ) : (
                    <>
                      {/* Default gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600"></div>
                      {/* Pattern overlay */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-6 left-4 w-14 h-14 border-2 border-white/40 rounded-full"></div>
                        <div className="absolute bottom-6 right-6 w-10 h-10 border-2 border-white/30 rounded-lg rotate-12"></div>
                        <div className="absolute top-1/3 right-4 w-6 h-6 bg-white/20 rounded-full"></div>
                      </div>
                    </>
                  )}
                  
                  {/* Content overlay */}
                  <div className="relative z-10 h-full flex flex-col justify-between p-4 md:p-6">
                    <div className="flex-1 flex items-center">
                    
                    </div>
                    <div className="text-white">
                 
                      <p className="text-white/90 text-sm md:text-base mb-2 drop-shadow">Yemek siparişi ver!</p>
                      <div className="flex items-center text-xs md:text-sm text-white/80">
                      <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 3a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" />
                      </svg>
                      {storeCountByCategory[1] || 0} restoran
                    </div>
                  </div>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </Link>
            )}
          </div>

          {/* Alt kısım - Su ve Aktüel kartları */}
          {/* Eğer hem Su hem Aktüel modülü aktifse yanyana, sadece Su aktifse yatay */}
          <div className={`grid gap-3 md:gap-4 ${isModuleEnabled('su') && isModuleEnabled('aktuel')
              ? 'grid-cols-2 md:grid-cols-2'
              : 'grid-cols-1'
            }`}>
            {/* Su ve Damacana Kartı */}
            {isModuleEnabled('su') && (
              <Link href="/su" className="group">
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] h-32 md:h-40">
                  {/* Background Image */}
                  {categories.find(cat => cat.name.toLowerCase() === 'su')?.image_url ? (
                    <div 
                      className="absolute inset-0 bg-center bg-no-repeat bg-cover md:bg-[length:100%_100%]"
                      style={{
                        backgroundImage: `url(${categories.find(cat => cat.name.toLowerCase() === 'su')?.image_url})`,
                      }}
                    >
                      {/* Overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  </div>
                  ) : (
                    <>
                      {/* Default gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600"></div>
                      {/* Pattern overlay */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-3 right-3 w-12 h-12 border-2 border-white/40 rounded-full"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-2 border-white/30 rounded-lg rotate-45"></div>
                        <div className="absolute top-1/2 right-6 w-5 h-5 bg-white/20 rounded-full"></div>
                      </div>
                    </>
                  )}
                  
                  {/* Content overlay */}
                  <div className="relative z-10 h-full flex flex-col justify-between p-4 md:p-5">
                    <div className="flex-1 flex items-center">
                  
                    </div>
                    <div className="text-white">
                     
                      <p className="text-white/90 text-sm drop-shadow">Su siparişi ver!</p>
                  
                    </div>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </Link>
            )}

            {/* Aktüel Kartı */}
            {isModuleEnabled('aktuel') && (
              <Link href="/aktuel" className="group">
                <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] h-32 md:h-40">
                  {/* Background Image */}
                  {categories.find(cat => cat.name.toLowerCase().includes('aktüel') || cat.name.toLowerCase().includes('aktuel'))?.image_url ? (
                    <div 
                      className="absolute inset-0 bg-center bg-no-repeat bg-cover md:bg-[length:100%_100%]"
                      style={{
                        backgroundImage: `url(${categories.find(cat => cat.name.toLowerCase().includes('aktüel') || cat.name.toLowerCase().includes('aktuel'))?.image_url})`,
                      }}
                    >
                      {/* Overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  </div>
                  ) : (
                    <>
                      {/* Default gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600"></div>
                      {/* Pattern overlay */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-3 left-3 w-12 h-12 border-2 border-white/40 rounded-full"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-2 border-white/30 rounded-lg rotate-12"></div>
                        <div className="absolute top-2/3 left-6 w-5 h-5 bg-white/20 rounded-full"></div>
                      </div>
                    </>
                  )}
                  
                  {/* Content overlay */}
                  <div className="relative z-10 h-full flex flex-col justify-between p-4 md:p-5">
                    <div className="flex-1 flex items-center">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
                      </svg>
                      </div>
                    </div>
                    <div className="text-white">
                      <h3 className="text-lg md:text-xl font-bold mb-1 drop-shadow-lg">Aktüel Ürünler</h3>
                      <p className="text-white/90 text-sm drop-shadow">Ürünleri keşfet!</p>
                    </div>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </Link>
            )}
          </div>

          {/* Hızlı Market Bölümü */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 md:mb-4">Hızlı Market</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              {/* Hemen Gelsin */}
              <Link href="/market" className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Hemen Gelsin</h4>
              </Link>

              {/* Dilediğin Saate */}
              <div
                className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                onClick={() => alert('Bu özellik yakında aktif edilecek!')}
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Dilediğin Saate</h4>
              </div>

              {/* Semtin */}
              <div
                className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                onClick={() => alert('Bu özellik yakında aktif edilecek!')}
              >
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Semtin</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
