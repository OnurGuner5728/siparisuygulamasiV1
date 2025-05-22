'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import ModuleGuard from '@/components/ModuleGuard';

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
    async function fetchData() {
      try {
        setLoading(true);
        
        // 1. Ana kategorileri çek ve Yemek kategorisinin ID'sini bul
        const mainCategories = await api.getMainCategories();
        const yemekCategory = mainCategories.find(cat => cat.name === YEMEK_CATEGORY_NAME);
        
        if (!yemekCategory) {
          console.error('\"Yemek\" kategorisi bulunamadı.');
          setRestaurants([]);
          setFilteredRestaurants([]);
          setCampaigns([]);
          setLoading(false);
          return;
        }
        setYemekCategoryId(yemekCategory.id);

        // 2. Yemek kategorisindeki mağazaları getir
        const storesData = await api.getStores({ 
          category_id: yemekCategory.id,  // Kategori ID'si ile filtreleme
          status: 'active'
        });
        
        // Sadece aktif ve onaylanmış mağazaları filtrele
        const yemekStores = storesData.filter(store => 
          store.status === 'active' && store.is_approved
        );
        
        setRestaurants(yemekStores);
        setFilteredRestaurants(yemekStores);
        
        // 3. Kampanyaları getir
        const allCampaigns = await api.getCampaigns(); 

        // Yemek kategorisine ait veya Yemek kategorisindeki mağazalara ait kampanyaları filtrele
        const yemekCampaigns = allCampaigns.filter(campaign => {
          // Kampanya doğrudan yemek kategorisine bağlı ise
          if (campaign.main_category_id === yemekCategory.id || campaign.category_id === yemekCategory.id) {
            return true;
          }
          // Kampanya bir mağazaya bağlıysa ve o mağaza yemek kategorisinde ise
          if (campaign.store_id && yemekStores.some(store => store.id === campaign.store_id)) {
            return true;
          }
          return false;
        });
        
        setCampaigns(yemekCampaigns);
      } catch (error) {
        console.error('Veri yüklenirken bir hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
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
      <div className="container mx-auto px-4 py-8 flex justify-center">
        {/* Gelişmiş bir yükleme göstergesi eklenebilir */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{YEMEK_CATEGORY_NAME} Siparişi</h1>
          <p className="text-gray-600 mb-8">Restoran ve yemek siparişi için aradığınız her şey burada!</p>
        </div>
        {/* İleride kullanıcı girişi varsa adres seçimi gibi özellikler eklenebilir */}
      </div>
      
      {/* Kampanyalar */}
      {campaigns.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Güncel {YEMEK_CATEGORY_NAME} Kampanyaları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-blue-700">{campaign.title}</h3>
                <p className="text-sm text-blue-600 line-clamp-2">{campaign.description}</p>
                {campaign.store && (
                  <p className="text-xs text-gray-600 mt-2">
                    Sadece: <span className="font-medium">{campaign.store.name}</span>
                  </p>
                )}
                {!campaign.store_id && campaign.main_category_id === yemekCategoryId && (
                    <p className="text-xs text-gray-500 mt-2">Tüm {YEMEK_CATEGORY_NAME} restoranlarında geçerli</p>
                )}
                {(campaign.store_id && !restaurants.find(r => r.id === campaign.store_id)) && (
                    <p className="text-xs text-orange-500 mt-2">
                      Bu kampanya şu anda bulunduğunuz bölgedeki bir {YEMEK_CATEGORY_NAME} restoranına ait değil.
                    </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Filtreler */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8 shadow">
        <div className="flex flex-wrap items-end gap-4">
          {/* Mutfak türü filtresi kaldırıldı, ileride tags ile eklenebilir */}
          {/* 
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mutfak Türü</label>
            <select 
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filters.cuisine}
              onChange={(e) => handleFilterChange('cuisine', e.target.value)}
            >
              <option value="">Tümü</option>
              {cuisineTypes.map((cuisine) => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
          </div>
          */}
          
          <div>
            <label htmlFor="ratingFilter" className="block text-sm font-medium text-gray-700 mb-1">Minimum Puan</label>
            <select 
              id="ratingFilter"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
            >
              <option value="0">Tümü</option>
              <option value="3">3 ve üzeri</option>
              <option value="4">4 ve üzeri</option>
              <option value="4.5">4.5 ve üzeri</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              id="isOpenFilter"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={filters.isOpen}
              onChange={(e) => handleFilterChange('isOpen', e.target.checked)}
            />
            <label htmlFor="isOpenFilter" className="text-sm font-medium text-gray-700">
              Sadece açık restoranlar
            </label>
          </div>
        </div>
      </div>

      {/* Restoranlar Listesi */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Restoranlar ({filteredRestaurants.length})</h2>
        
        {filteredRestaurants.length === 0 ? (
          <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
            <p className="text-gray-500">Seçtiğiniz kriterlere uygun restoran bulunamadı.</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              onClick={() => setFilters({ cuisine: '', rating: 0, isOpen: false })}
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRestaurants.map(restaurant => (
              <Link href={`/yemek/store/${restaurant.id}`} key={restaurant.id}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full">
                  {restaurant.logo ? (
                    <img 
                      src={restaurant.logo} 
                      alt={restaurant.name} 
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Resim Yok</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{restaurant.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{restaurant.description || 'Bu restoran hakkında açıklama bulunmuyor.'}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <span>{restaurant.rating || '0'}/5</span>
                      </div>
                      <span className="mx-2">•</span>
                      <span>{restaurant.is_open ? 'Açık' : 'Kapalı'}</span>
                      
                      {/* Restoran için etiketler varsa göster */}
                      {restaurant.tags && restaurant.tags.length > 0 && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{restaurant.tags.join(', ')}</span>
                        </>
                      )}
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