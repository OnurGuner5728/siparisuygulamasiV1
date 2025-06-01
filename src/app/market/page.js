'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import ModuleGuard from '@/components/ModuleGuard';
import CategoryCampaignBanner from '@/components/CategoryCampaignBanner';

const MARKET_CATEGORY_NAME = 'Market';

export default function MarketPage() {
  return (
    <ModuleGuard moduleName="market">
      <MarketPageContent />
    </ModuleGuard>
  );
}

function MarketPageContent() {
  const [markets, setMarkets] = useState([]);
  const [filteredMarkets, setFilteredMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [marketCategoryId, setMarketCategoryId] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [marketTypes, setMarketTypes] = useState([]);

  const [filters, setFilters] = useState({
    storeType: '',
    minOrder: 0,
    isOpen: false,
    subCategory: ''
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Kategorileri al
        const categoriesData = await api.getCategories(true);
        const marketCategory = categoriesData.find(cat => cat.slug === 'market');
        
        if (marketCategory) {
          setMarketCategoryId(marketCategory.id);
          
          // Alt kategorileri al
          const subCategoriesData = await api.getSubcategoriesByParentId(marketCategory.id);
          setSubCategories(subCategoriesData);
          
          // Marketleri al - filtreleri API'ye gönder
          const storesData = await api.getStores({ 
            category_id: marketCategory.id,
            isOpen: filters.isOpen
          });
          setMarkets(storesData);
        }
      } catch (error) {
        console.error('Market sayfası verileri yüklenirken hata:', error);
        setMarkets([]);
      }
      setLoading(false);
    }
    
    fetchData();
  }, [filters.isOpen]); // sadece isOpen filtresi API'ye gönderiliyor

  // Market türlerini hesapla
  useEffect(() => {
    if (markets.length > 0) {
      const uniqueTypes = [...new Set(markets.map(market => market.type).filter(Boolean))];
      setMarketTypes(uniqueTypes);
    }
  }, [markets]);

  // Diğer filtreler frontend'de yapılıyor
  useEffect(() => {
    if (!markets.length) return;
    
    let result = markets;
    
    // Store type filtresi
    if (filters.storeType) {
      result = result.filter(market => 
        market.type && market.type.toLowerCase().includes(filters.storeType.toLowerCase())
      );
    }
    
    // SubCategory filtresi
    if (filters.subCategory) {
      result = result.filter(market => 
        market.subcategories && market.subcategories.includes(filters.subCategory)
      );
    }
    
    setFilteredMarkets(result);
  }, [filters, markets]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      {/*
      <div className="bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Market</h1>
            </div>
          </div>
        </div>
      </div>
      */}
      
      {/* Kampanya Banner */}
      {marketCategoryId && (
        <CategoryCampaignBanner 
          categoryId={marketCategoryId} 
          categoryName="market" 
        />
      )}

      {/* Filter Tabs */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center space-x-1 overflow-x-auto">
          <button
            onClick={() => handleFilterChange('storeType', '')}
            className={`px-6 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
              filters.storeType === '' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Tümü
          </button>
          {marketTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleFilterChange('storeType', type === filters.storeType ? '' : type)}
              className={`px-6 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
                filters.storeType === type 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {type}
            </button>
          ))}
          <button
            onClick={() => handleFilterChange('isOpen', !filters.isOpen)}
            className={`px-6 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
              filters.isOpen 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Açık Olanlar
          </button>
        </div>
      </div>

      {/* Quick Categories */}
      {subCategories.length > 0 && (
        <div className="bg-white px-4 py-4 border-b">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Hızlı Kategori Erişimi</h3>
          <div className="flex space-x-2 overflow-x-auto">
            {subCategories.map((category) => (
              <button
                key={category.id}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
                  filters.subCategory === category.name 
                    ? 'bg-green-100 border-green-300 text-green-800' 
                    : 'bg-white border-gray-200 text-gray-600'
                } border`}
                onClick={() => handleFilterChange('subCategory', category.name === filters.subCategory ? '' : category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Markets List */}
      <div className="container mx-auto px-4 py-6">
        {filteredMarkets.length > 0 ? (
          <div className="space-y-4">
            {filteredMarkets.map(market => (
              <Link 
                key={market.id}
                href={`/market/store/${market.id}`}
                className="block"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Market Image */}
              <div className="h-48 bg-gray-200 relative">
                {market.banner_url || market.logo_url ? (
                  <img 
                    src={market.banner_url || market.logo_url} 
                    alt={market.name} 
                        className="w-full h-full object-cover"
                  />
                ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center">
                        {market.logo_url ? <img src={market.logo_url} alt={market.name} className="w-full h-full object-cover" /> : '🏪'}
                      </div>
                    )}
                    
                    {/* Market Status */}
                    <div className="absolute top-4 left-4">
                      <span className={`flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm ${
                        market.is_open ? 'text-green-700' : 'text-red-700'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          market.is_open ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        {market.is_open ? 'Açık' : 'Kapalı'}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4">
                      <div className="flex items-center space-x-2">
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          {market.delivery_fee || '0 ₺' + " teslimat ücreti"}
                        </span>
                        <span className="bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {market.delivery_time_min + " min" || '20 min'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Market Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{market.name}</h3>
                    <p className="text-gray-600 mb-4">{market.description || 'İhtiyacınız olan her şey burada'}</p>
                    
                    {/* Market Type */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {market.type && (
                        <span className="bg-green-500 text-white px-4 py-2 text-sm font-medium rounded-full">
                          {market.type}
                        </span>
                      )}
                    </div>

                    {/* Market Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Min. sipariş: {market.minimum_order_amount || 0} TL</span>
                      {market.rating && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          <span>{market.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
                </div>
                </div>
              </Link>
            ))}
              </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">🏪</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Market Bulunamadı</h3>
            <p className="text-gray-500">Bu kriterlere uygun market bulunamadı.</p>
            <button 
              className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg"
              onClick={() => setFilters({ storeType: '', minOrder: 0, isOpen: false, subCategory: '' })}
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 
