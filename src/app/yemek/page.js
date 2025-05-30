'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import ModuleGuard from '@/components/ModuleGuard';
import CategoryCampaignBanner from '@/components/CategoryCampaignBanner';

// Sabit olarak Yemek kategorisinin adını tanımlayalım (ID yerine isim kullanmak daha esnek olabilir)
const YEMEK_CATEGORY_NAME = 'Yemek'; 

export default function YemekPage() {
  return (
    <ModuleGuard moduleName="yemek">
      <YemekPageContent />
    </ModuleGuard>
  );
}

function YemekPageContent() {
  // Auth context'ten kullanıcı durumunu al
  const { isAuthenticated } = useAuth();

  // Restoranları ve kampanyaları state olarak tut
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [yemekCategoryId, setYemekCategoryId] = useState(null);

  // Filtreler
  const [filters, setFilters] = useState({
    // cuisine: '', // cuisine alanı stores tablosunda tags olarak değişebilir, şimdilik kaldırıldı
    rating: 0,
    isOpen: false,
  });

  useEffect(() => {
    let isCancelled = false;
    
    async function fetchData() {
      try {
        setLoading(true);
        
        // Cache kontrolü
        const cacheKey = `yemek_data_${YEMEK_CATEGORY_NAME}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);
        const CACHE_DURATION = 2 * 60 * 1000; // 2 dakika
        
        if (cachedData && cacheTime && (Date.now() - parseInt(cacheTime)) < CACHE_DURATION) {
          const parsed = JSON.parse(cachedData);
          if (!isCancelled) {
            setRestaurants(parsed.restaurants);
            setFilteredRestaurants(parsed.restaurants);
            setYemekCategoryId(parsed.categoryId);
            setCampaigns(parsed.campaigns);
            setLoading(false);
          }
          return;
        }
        
        // Ana kategorileri çek ve Yemek kategorisinin ID'sini bul
        const mainCategories = await api.getMainCategories();
        const yemekCategory = mainCategories.find(cat => cat.name === YEMEK_CATEGORY_NAME);
        
        if (!yemekCategory) {
          console.error('\"Yemek\" kategorisi bulunamadı.');
          if (!isCancelled) {
          setRestaurants([]);
          setFilteredRestaurants([]);
          setCampaigns([]);
          setLoading(false);
          }
          return;
        }
        
        if (isCancelled) return;
        setYemekCategoryId(yemekCategory.id);

        // Paralel olarak mağazalar ve kampanyaları getir
        const [storesData, allCampaigns] = await Promise.all([
          api.getStores({ category_id: yemekCategory.id }),
          api.getCampaigns()
        ]);
        
        if (isCancelled) return;
        
        // Sadece onaylanmış mağazaları filtrele
        const yemekStores = storesData.filter(store => store.is_approved);

        // Yemek kategorisine ait kampanyaları filtrele
        const yemekCampaigns = allCampaigns.filter(campaign => {
          if (campaign.main_category_id === yemekCategory.id || campaign.category_id === yemekCategory.id) {
            return true;
          }
          if (campaign.store_id && yemekStores.some(store => store.id === campaign.store_id)) {
            return true;
          }
          return false;
        });
        
        setRestaurants(yemekStores);
        setFilteredRestaurants(yemekStores);
        setCampaigns(yemekCampaigns);
        
        // Cache'e kaydet
        const dataToCache = {
          restaurants: yemekStores,
          categoryId: yemekCategory.id,
          campaigns: yemekCampaigns
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(dataToCache));
        sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());
        
      } catch (error) {
        if (!isCancelled) {
        console.error('Veri yüklenirken bir hata oluştu:', error);
        }
      } finally {
        if (!isCancelled) {
        setLoading(false);
        }
      }
    }
    
    fetchData();
    
    return () => {
      isCancelled = true;
    };
  }, []);

  // Filtre değiştiğinde restoranları filtrele
  useEffect(() => {
    if (!restaurants.length) return;
    
    let result = restaurants;
    
    // if (filters.cuisine) { // Mutfak filtresi şimdilik kaldırıldı
    //   result = result.filter(restaurant => restaurant.cuisine === filters.cuisine);
    // }

    if (filters.rating > 0) {
      result = result.filter(restaurant => restaurant.rating >= filters.rating);
    }

    if (filters.isOpen) {
      // stores tablosunda is_open alanı var mı kontrol edilmeli.
      // api.getStores içinde çalışma saatlerine göre bu dinamik olarak hesaplanabilir.
      // Şimdilik is_open alanı olduğunu varsayıyorum.
      result = result.filter(restaurant => restaurant.is_open);
    }

    setFilteredRestaurants(result);
  }, [filters, restaurants]);

  // Mutfak tiplerini (tags) restaurants dizisinden çıkart
  // const cuisineTypes = restaurants.length 
  //   ? [...new Set(restaurants.flatMap(r => r.tags || []).filter(Boolean))]
  //   : [];
  // Şimdilik cuisineTypes kaldırıldığı için bu da kaldırıldı.

  // Filtre değişikliklerini yönet
  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
          <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Yemek</h1>
            </div>
            <button className="p-2 text-gray-600 dark:text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Kampanya Banner */}
      {yemekCategoryId && (
        <CategoryCampaignBanner 
          categoryId={yemekCategoryId} 
          categoryName="yemek" 
        />
      )}
      
      {/* Filter Tabs */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center space-x-1 overflow-x-auto">
          <button
            onClick={() => handleFilterChange('rating', 0)}
            className={`px-6 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
              filters.rating === 0 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => handleFilterChange('rating', 4)}
            className={`px-6 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
              filters.rating === 4 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            4+ Yıldız
          </button>
          <button
            onClick={() => handleFilterChange('isOpen', !filters.isOpen)}
            className={`px-6 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
              filters.isOpen 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Açık Olanlar
          </button>
        </div>
      </div>

      {/* Restaurants List */}
      <div className="container mx-auto px-4 py-6">
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">🍽️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Restoran Bulunamadı</h3>
            <p className="text-gray-500">Seçtiğiniz kriterlere uygun restoran bulunamadı.</p>
            <button 
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg"
              onClick={() => setFilters({ rating: 0, isOpen: false })}
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRestaurants.map(restaurant => (
              <Link href={`/yemek/store/${restaurant.id}`} key={restaurant.id}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Restaurant Image */}
                  <div className="h-48 bg-gray-200 relative">
                  {restaurant.logo ? (
                    <img 
                      src={restaurant.logo} 
                      alt={restaurant.name} 
                        className="w-full h-full object-cover"
                    />
                  ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center" >{restaurant.logo_url ? <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover" /> : '🍽️'}
                       
                    </div>
                  )}
                    
                    {/* Indicators */}
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                          {restaurant.rating || '4.7'}
                        </span>
                      </div>
                    </div>

                    <div className="absolute top-4 right-4">
                      <div className="flex items-center space-x-2">
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          {restaurant.delivery_fee || '0 ₺' + " teslimat ücreti"} ₺
                        </span>
                        <span className="bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {restaurant.delivery_time_min +" min"|| '20 min'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{restaurant.name}</h3>
                    <p className="text-gray-600 mb-4">{restaurant.description || 'Lezzetli yemekleri keşfedin'}</p>
                    
                    {/* Category Tags */}
                    {restaurant.tags && restaurant.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {restaurant.tags.slice(0, 4).map((tag, index) => (
                          <span 
                            key={index}
                            className={`px-4 py-2 text-sm font-medium rounded-full ${
                              index === 0 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Restaurant Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Min. sipariş: {restaurant.minimum_order_amount || 0} ₺</span>
                      <span className={`font-medium ${restaurant.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {restaurant.status === 'active' ? 'Açık' : 'Kapalı'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
