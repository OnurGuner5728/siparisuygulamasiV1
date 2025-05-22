'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api'; // Mock importları kaldırıldı, api eklendi
import ModuleGuard from '@/components/ModuleGuard';

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
  const [subCategories, setSubCategories] = useState([]); // Market ana kategorisine ait alt kategoriler
  const [marketTypes, setMarketTypes] = useState([]); // Mağaza türleri (stores.type)

  const [filters, setFilters] = useState({
    storeType: '', // stores.type için (önceki filters.type idi)
    minOrder: 0,
    isOpen: false,
    subCategory: '' // Alt kategori filtresi (önceki filters.category idi ve productCategories kullanıyordu)
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const mainCategories = await api.getMainCategories();
        const marketCategory = mainCategories.find(cat => cat.name === MARKET_CATEGORY_NAME);

        if (!marketCategory) {
          console.error(`'${MARKET_CATEGORY_NAME}' kategorisi bulunamadı.`);
          setMarkets([]);
          setFilteredMarkets([]);
          setCampaigns([]);
          setLoading(false);
          return;
        }
        setMarketCategoryId(marketCategory.id);

        const [storesData, allCampaignsData, subCategoriesData] = await Promise.all([
          api.getStores({ 
            category_id: marketCategory.id, 
            status: 'active' 
          }),
          api.getCampaigns(),
          api.getCategories({ parent_category_id: marketCategory.id })
        ]);
        
        // Sadece onaylanmış marketleri göster
        const approvedMarkets = (storesData || []).filter(store => store.is_approved);
        setMarkets(approvedMarkets);
        setFilteredMarkets(approvedMarkets);
        setSubCategories(subCategoriesData || []);

        const uniqueMarketTypes = [...new Set(approvedMarkets.map(store => store.type).filter(Boolean))];
        setMarketTypes(uniqueMarketTypes);

        const marketCampaigns = (allCampaignsData || []).filter(campaign => {
          if (campaign.category_id === marketCategory.id || campaign.main_category_id === marketCategory.id) return true;
          if (campaign.store_id && approvedMarkets.some(store => store.id === campaign.store_id)) return true;
          return false;
        });
        setCampaigns(marketCampaigns);

      } catch (error) {
        console.error('Market verileri yüklenirken bir hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!markets.length) return;

    let result = markets;

    if (filters.storeType) {
      result = result.filter(market => market.type === filters.storeType);
    }

    if (filters.minOrder > 0) {
      // min_order_amount stores tablosunda var, filtreyi ona göre ayarlayalım.
      // Kullanıcı "50 TL ve altı" seçtiğinde, min_order_amount <= 50 olanları göstermeliyiz.
      result = result.filter(market => (market.min_order_amount || 0) <= filters.minOrder);
    }

    if (filters.isOpen) {
      result = result.filter(market => market.is_open);
    }

    if (filters.subCategory) {
      // Bu filtreleme, marketin ürünlerinin o alt kategoride olup olmadığına göre yapılmalı.
      // Şimdilik, marketin `tags` alanı bu alt kategori adını içeriyorsa filtreleyelim.
      // Veya `stores` tablosuna `sub_category_ids` gibi bir alan eklenip direkt onunla filtrelenebilir.
      // Mevcut durumda `stores.tags` (JSONB) kullanalım varsayalım.
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
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{MARKET_CATEGORY_NAME} Alışverişi</h1>
      <p className="text-gray-600 mb-8">Marketlerden ihtiyacınız olan her şeyi sipariş edin!</p>
      
      {campaigns.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Güncel {MARKET_CATEGORY_NAME} Kampanyaları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="bg-green-50 p-4 rounded-lg border border-green-200 shadow hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-green-700">{campaign.title}</h3>
                <p className="text-sm text-green-600 line-clamp-2">{campaign.description}</p>
                {campaign.store && (
                  <p className="text-xs text-gray-600 mt-2">
                    Sadece: <span className="font-medium">{campaign.store.name}</span>
                  </p>
                )}
                {!campaign.store_id && campaign.main_category_id === marketCategoryId && (
                    <p className="text-xs text-gray-500 mt-2">Tüm {MARKET_CATEGORY_NAME}lerde geçerli</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {subCategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Hızlı Kategori Erişimi</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {subCategories.map((category) => (
              <button
                key={category.id}
                className={`p-3 text-center text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-green-400
                ${filters.subCategory === category.name 
                  ? 'bg-green-100 border-green-300 text-green-800 font-medium' 
                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
                onClick={() => handleFilterChange('subCategory', category.name === filters.subCategory ? '' : category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-gray-50 p-4 rounded-lg mb-8 shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="marketTypeFilter" className="block text-sm font-medium text-gray-700 mb-1">Market Türü</label>
            <select 
              id="marketTypeFilter"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              value={filters.storeType}
              onChange={(e) => handleFilterChange('storeType', e.target.value)}
            >
              <option value="">Tümü</option>
              {marketTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="minOrderFilter" className="block text-sm font-medium text-gray-700 mb-1">Maks. Min. Sepet Tutarı</label>
            <select 
              id="minOrderFilter"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              value={filters.minOrder} // Bu değerin 0, 50, 75, 100, 150 olması bekleniyor
              onChange={(e) => handleFilterChange('minOrder', Number(e.target.value))}
            >
              <option value="0">Fark etmez</option>
              <option value="50">50 TL</option>
              <option value="75">75 TL</option>
              <option value="100">100 TL</option>
              <option value="150">150 TL</option>
              {/* Daha yüksek veya dinamik seçenekler eklenebilir */}
            </select>
          </div>
          
          <div className="flex items-center pt-2 sm:pt-0 md:pt-5">
            <input
              id="isOpenMarket"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              checked={filters.isOpen}
              onChange={(e) => handleFilterChange('isOpen', e.target.checked)}
            />
            <label htmlFor="isOpenMarket" className="ml-2 block text-sm text-gray-900">
              Sadece açık marketler
            </label>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
        {filteredMarkets.length > 0 ? (
          filteredMarkets.map(market => (
                        <Link               key={market.id}               href={`/market/store/${market.id}`}              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"            >
              <div className="h-48 bg-gray-200 relative">
                {market.is_open !== undefined && (
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${market.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {market.is_open ? 'Açık' : 'Kapalı'}
                    </div>
                )}
                {market.cover_image_url ? (
                  <img 
                    src={market.cover_image_url} 
                    alt={market.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <svg className="w-12 h-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 truncate" title={market.name}>{market.name}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  {market.type && <span className="mr-2 capitalize">{market.type}</span>}
                  {market.rating !== null && market.rating !== undefined && 
                    <span className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        {market.rating.toFixed(1)}
                    </span>
                  }
                </div>
                <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                  <span>Min. {market.min_order_amount || 0} TL</span>
                  <span>{market.delivery_time || '15-30 dk'}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797A8.333 8.333 0 0112 5.85c1.267 0 2.453-.331 3.362-.886zM12 15a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Market Bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">Bu kriterlere uygun market bulunamadı.</p>
            <button 
              className="mt-2 text-sm font-medium text-green-600 hover:text-green-500"
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