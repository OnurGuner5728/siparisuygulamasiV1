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
    let isCancelled = false;
    
    async function fetchData() {
      try {
        setLoading(true);

        const cacheKey = `market_data_${MARKET_CATEGORY_NAME}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);
        const CACHE_DURATION = 2 * 60 * 1000;
        
        if (cachedData && cacheTime && (Date.now() - parseInt(cacheTime)) < CACHE_DURATION) {
          const parsed = JSON.parse(cachedData);
          if (!isCancelled) {
            setMarkets(parsed.markets);
            setFilteredMarkets(parsed.markets);
            setMarketCategoryId(parsed.categoryId);
            setSubCategories(parsed.subCategories);
            setMarketTypes(parsed.marketTypes);
            setCampaigns(parsed.campaigns);
            setLoading(false);
          }
          return;
        }

        const mainCategories = await api.getMainCategories();
        const marketCategory = mainCategories.find(cat => cat.name === MARKET_CATEGORY_NAME);

        if (!marketCategory) {
          console.error(`'${MARKET_CATEGORY_NAME}' kategorisi bulunamadı.`);
          if (!isCancelled) {
          setMarkets([]);
          setFilteredMarkets([]);
          setCampaigns([]);
          setLoading(false);
          }
          return;
        }

        if (isCancelled) return;
        setMarketCategoryId(marketCategory.id);

        const [storesData, allCampaignsData, subCategoriesData] = await Promise.all([
          api.getStores({ 
            category_id: marketCategory.id, 
            status: 'active' 
          }),
          api.getCampaigns(),
          api.getCategories({ parent_category_id: marketCategory.id })
        ]);
        
        if (isCancelled) return;
        
        const approvedMarkets = (storesData || []).filter(store => store.is_approved);
        const uniqueMarketTypes = [...new Set(approvedMarkets.map(store => store.type).filter(Boolean))];
        const marketCampaigns = (allCampaignsData || []).filter(campaign => {
          if (campaign.category_id === marketCategory.id || campaign.main_category_id === marketCategory.id) return true;
          if (campaign.store_id && approvedMarkets.some(store => store.id === campaign.store_id)) return true;
          return false;
        });

        setMarkets(approvedMarkets);
        setFilteredMarkets(approvedMarkets);
        setSubCategories(subCategoriesData || []);
        setMarketTypes(uniqueMarketTypes);
        setCampaigns(marketCampaigns);

        const dataToCache = {
          markets: approvedMarkets,
          categoryId: marketCategory.id,
          subCategories: subCategoriesData || [],
          marketTypes: uniqueMarketTypes,
          campaigns: marketCampaigns
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(dataToCache));
        sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());

      } catch (error) {
        if (!isCancelled) {
        console.error('Market verileri yüklenirken bir hata oluştu:', error);
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

  useEffect(() => {
    if (!markets.length) return;

    let result = markets;

    if (filters.storeType) {
      result = result.filter(market => market.type === filters.storeType);
    }

    if (filters.minOrder > 0) {
      result = result.filter(market => (market.min_order_amount || 0) <= filters.minOrder);
    }

    if (filters.isOpen) {
      result = result.filter(market => market.is_open);
    }

    if (filters.subCategory) {
      result = result.filter(market => 
        market.tags && market.tags.map(tag => tag.toLowerCase()).includes(filters.subCategory.toLowerCase())
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
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Market View</h1>
            </div>
            <button className="p-2 text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
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
                {market.cover_image_url ? (
                  <img 
                    src={market.cover_image_url} 
                    alt={market.name} 
                        className="w-full h-full object-cover"
                  />
                ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🏪</div>
                          <div className="text-gray-500 font-medium">{market.name}</div>
                        </div>
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
                          Free
                        </span>
                        <span className="bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                          {market.delivery_time || '15-30 dk'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Market Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{market.name}</h3>
                    <p className="text-gray-600 mb-4">{market.description || 'İhtiyacınız olan her şey burada'}</p>
                    
                    {/* Market Type & Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {market.type && (
                        <span className="bg-green-500 text-white px-4 py-2 text-sm font-medium rounded-full">
                          {market.type}
                        </span>
                      )}
                      {market.tags && market.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 text-gray-600 px-4 py-2 text-sm font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Market Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Min. sipariş: {market.min_order_amount || 0} TL</span>
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