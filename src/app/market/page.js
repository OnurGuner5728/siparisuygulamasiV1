'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockMarkets, mockCampaigns } from '@/app/data/mockdatas';

export default function MarketPage() {
  // Dummy data - Gerçek uygulamada API'den gelecek
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setMarkets(mockMarkets);
      
      // Market kategorisine ait kampanyaları filtrele
      const filteredCampaigns = mockCampaigns.filter(campaign => 
        mockMarkets.some(m => m.id === campaign.storeId)
      );
      setCampaigns(filteredCampaigns);
      
      setLoading(false);
    }, 500);
  }, []);

  // Kategori listesi
  const productCategories = [
    'Temel Gıda', 'Meyve & Sebze', 'Süt Ürünleri', 'Et & Tavuk', 
    'Temizlik', 'Kişisel Bakım', 'İçecekler', 'Atıştırmalıklar'
  ];

  // Filtreler
  const [filters, setFilters] = useState({
    type: '',
    minOrder: 0,
    isOpen: false,
    category: ''
  });

  // Filtrelenen marketler
  const [filteredMarkets, setFilteredMarkets] = useState(markets);

  // Filtre değiştiğinde marketleri filtrele
  useEffect(() => {
    let result = markets;
    
    if (filters.type) {
      result = result.filter(market => market.type === filters.type);
    }

    if (filters.minOrder > 0) {
      result = result.filter(market => market.minOrder <= filters.minOrder);
    }

    if (filters.isOpen) {
      result = result.filter(market => market.isOpen);
    }

    // Kategori filtresi gerçek uygulamada backend'den filtreleme yapacak
    // Burada dummy data ile ilişkilendirmek için basit olarak bırakıyoruz

    setFilteredMarkets(result);
  }, [filters, markets]);

  // Market tiplerini markets dizisinden çıkart
  const marketTypes = [...new Set(markets.map(m => m.type))];

  // Filtre değişikliklerini yönet
  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Market Alışverişi</h1>
      <p className="text-gray-600 mb-8">Marketlerden ihtiyacınız olan her şeyi sipariş edin!</p>
      
      {/* Kampanyalar */}
      {campaigns.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Güncel Kampanyalar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map(campaign => {
              const store = mockMarkets.find(m => m.id === campaign.storeId);
              const storeName = store ? store.name : 'Bilinmeyen Mağaza';
              
              return (
                <div key={campaign.id} className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-bold text-green-700">{campaign.title}</h3>
                  <p className="text-sm text-green-600">{campaign.description}</p>
                  <p className="text-xs text-gray-500 mt-2">Geçerli olduğu yer: {storeName}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hızlı Kategori Erişimi */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Kategoriler</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {productCategories.map((category, index) => (
            <button
              key={index}
              className={`p-2 text-center text-sm rounded-lg border transition-colors
              ${filters.category === category 
                ? 'bg-green-100 border-green-300 text-green-800' 
                : 'bg-white border-gray-200 hover:bg-gray-50'}`}
              onClick={() => handleFilterChange('category', category === filters.category ? '' : category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Filtreler */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8">
        <div className="flex flex-wrap gap-4">
          {/* Market türü filtresi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Market Türü</label>
            <select 
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">Tümü</option>
              {marketTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {/* Minimum sepet tutarı filtresi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maksimum Min. Sepet Tutarı</label>
            <select 
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              value={filters.minOrder}
              onChange={(e) => handleFilterChange('minOrder', Number(e.target.value))}
            >
              <option value="0">Fark etmez</option>
              <option value="50">50 TL ve altı</option>
              <option value="75">75 TL ve altı</option>
              <option value="100">100 TL ve altı</option>
              <option value="150">150 TL ve altı</option>
            </select>
          </div>
          
          {/* Açık marketler filtresi */}
          <div className="flex items-center">
            <input
              id="isOpen"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 mt-6"
              checked={filters.isOpen}
              onChange={(e) => handleFilterChange('isOpen', e.target.checked)}
            />
            <label htmlFor="isOpen" className="ml-2 block text-sm text-gray-700 mt-6">
              Sadece açık marketler
            </label>
          </div>
        </div>
      </div>
      
      {/* Marketler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMarkets.length > 0 ? (
          filteredMarkets.map(market => (
            <Link 
              key={market.id} 
              href={`/market/${market.id}`}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-48 bg-gray-200 relative">
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${market.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {market.isOpen ? 'Açık' : 'Kapalı'}
                </div>
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-gray-400">Resim yüklenemiyor</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold">{market.name}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <span className="mr-2">{market.type}</span>
                  <span>⭐ {market.rating}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
                  <span>Min. {market.minOrder} TL</span>
                  <span>{market.deliveryTime}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            <p>Bu kriterlere uygun market bulunamadı.</p>
            <button 
              className="mt-2 text-green-600 hover:underline"
              onClick={() => setFilters({ type: '', minOrder: 0, isOpen: false, category: '' })}
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 