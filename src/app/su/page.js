'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockWaterVendors, mockCampaigns } from '@/app/data/mockdatas';

export default function SuPage() {
  // Dummy data - Gerçek uygulamada API'den gelecek
  const [waterVendors, setWaterVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setWaterVendors(mockWaterVendors);
      
      // Su kategorisine ait kampanyaları filtrele
      const filteredCampaigns = mockCampaigns.filter(campaign => 
        mockWaterVendors.some(v => v.id === campaign.storeId)
      );
      setCampaigns(filteredCampaigns);
      
      setLoading(false);
    }, 500);
  }, []);

  // Su markaları
  const popularBrands = ['Hayat', 'Erikli', 'Saka', 'Sırma', 'Pınar', 'Damla', 'Nestle', 'Buzdağı'];

  // Filtreler
  const [filters, setFilters] = useState({
    brand: '',
    deliveryTime: '',
    isOpen: false,
  });

  // Filtrelenen satıcılar
  const [filteredVendors, setFilteredVendors] = useState(waterVendors);

  // Filtre değiştiğinde satıcıları filtrele
  useEffect(() => {
    let result = waterVendors;
    
    if (filters.brand) {
      result = result.filter(vendor => vendor.brand === filters.brand);
    }

    if (filters.deliveryTime) {
      // Bu örnek implementation. Gerçek uygulamada daha karmaşık bir mantıkla yapılabilir
      const maxMinutes = parseInt(filters.deliveryTime);
      result = result.filter(vendor => {
        const deliveryTimeParts = vendor.deliveryTime.split('-');
        const maxDeliveryTime = parseInt(deliveryTimeParts[1]);
        return maxDeliveryTime <= maxMinutes;
      });
    }

    if (filters.isOpen) {
      result = result.filter(vendor => vendor.isOpen);
    }

    setFilteredVendors(result);
  }, [filters, waterVendors]);

  // Su markalarını satıcılar dizisinden çıkart
  const availableBrands = [...new Set(waterVendors.map(vendor => vendor.brand))];

  // Filtre değişikliklerini yönet
  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Su Siparişi</h1>
      <p className="text-gray-600 mb-8">Damacana ve şişe su siparişlerinizi hızlıca verin!</p>
      
      {/* Kampanyalar */}
      {campaigns.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Güncel Kampanyalar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map(campaign => {
              const vendor = mockWaterVendors.find(v => v.id === campaign.storeId);
              const vendorName = vendor ? vendor.name : 'Bilinmeyen Satıcı';
              
              return (
                <div key={campaign.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-700">{campaign.title}</h3>
                  <p className="text-sm text-blue-600">{campaign.description}</p>
                  <p className="text-xs text-gray-500 mt-2">Geçerli olduğu yer: {vendorName}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Popüler Su Markaları */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Popüler Su Markaları</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {popularBrands.map((brand, index) => (
            <button
              key={index}
              className={`p-3 text-center rounded-lg border transition-colors
              ${filters.brand === brand 
                ? 'bg-blue-100 border-blue-300 text-blue-800' 
                : 'bg-white border-gray-200 hover:bg-gray-50'}`}
              onClick={() => handleFilterChange('brand', brand === filters.brand ? '' : brand)}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
      
      {/* Filtreler */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8">
        <div className="flex flex-wrap gap-4">
          {/* Marka filtresi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Su Markası</label>
            <select 
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            >
              <option value="">Tümü</option>
              {availableBrands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
          
          {/* Teslimat süresi filtresi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maksimum Teslimat Süresi</label>
            <select 
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filters.deliveryTime}
              onChange={(e) => handleFilterChange('deliveryTime', e.target.value)}
            >
              <option value="">Fark etmez</option>
              <option value="30">30 dakika ve altı</option>
              <option value="35">35 dakika ve altı</option>
              <option value="40">40 dakika ve altı</option>
              <option value="45">45 dakika ve altı</option>
            </select>
          </div>
          
          {/* Açık satıcılar filtresi */}
          <div className="flex items-center">
            <input
              id="isOpen"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-6"
              checked={filters.isOpen}
              onChange={(e) => handleFilterChange('isOpen', e.target.checked)}
            />
            <label htmlFor="isOpen" className="ml-2 block text-sm text-gray-700 mt-6">
              Sadece açık satıcılar
            </label>
          </div>
        </div>
      </div>
      
      {/* Su Satıcıları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.length > 0 ? (
          filteredVendors.map(vendor => (
            <Link 
              key={vendor.id} 
              href={`/su/${vendor.id}`}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-48 bg-gray-200 relative">
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${vendor.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {vendor.isOpen ? 'Açık' : 'Kapalı'}
                </div>
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-gray-400">Resim yüklenemiyor</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold">{vendor.name}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <span className="mr-2">{vendor.brand}</span>
                  <span>⭐ {vendor.rating}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
                  <span>Min. {vendor.minOrder} TL</span>
                  <span>{vendor.deliveryTime}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            <p>Bu kriterlere uygun su satıcısı bulunamadı.</p>
            <button 
              className="mt-2 text-blue-600 hover:underline"
              onClick={() => setFilters({ brand: '', deliveryTime: '', isOpen: false })}
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 