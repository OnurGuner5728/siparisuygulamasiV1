'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockRestaurants, mockCampaigns } from '@/app/data/mockdatas';

export default function YemekPage() {
  // Dummy data - Gerçek uygulamada API'den gelecek
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setRestaurants(mockRestaurants);
      setLoading(false);
    }, 500);
  }, []);

  // Kampanyalar için data
  const campaigns = mockCampaigns.filter(campaign => 
    mockRestaurants.some(r => r.name === campaign.store)
  );

  // Filtreler
  const [filters, setFilters] = useState({
    cuisine: '',
    rating: 0,
    isOpen: false,
  });

  // Filtrelenen restoranlar
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);

  // Filtre değiştiğinde restoranları filtrele
  useEffect(() => {
    let result = restaurants;
    
    if (filters.cuisine) {
      result = result.filter(restaurant => restaurant.cuisine === filters.cuisine);
    }

    if (filters.rating > 0) {
      result = result.filter(restaurant => restaurant.rating >= filters.rating);
    }

    if (filters.isOpen) {
      result = result.filter(restaurant => restaurant.isOpen);
    }

    setFilteredRestaurants(result);
  }, [filters, restaurants]);

  // Mutfak tiplerini restaurants dizisinden çıkart
  const cuisineTypes = [...new Set(restaurants.map(r => r.cuisine))];

  // Filtre değişikliklerini yönet
  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Yemek Siparişi</h1>
      <p className="text-gray-600 mb-8">Restoran ve yemek siparişi için aradığınız her şey burada!</p>
      
      {/* Kampanyalar */}
      {campaigns.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Güncel Kampanyalar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-blue-700">{campaign.title}</h3>
                <p className="text-sm text-blue-600">{campaign.description}</p>
                <p className="text-xs text-gray-500 mt-2">Geçerli olduğu yer: {campaign.store}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Filtreler */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8">
        <div className="flex flex-wrap gap-4">
          {/* Mutfak türü filtresi */}
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
          
          {/* Değerlendirme filtresi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Puan</label>
            <select 
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
            >
              <option value="0">Tümü</option>
              <option value="3">3+</option>
              <option value="3.5">3.5+</option>
              <option value="4">4+</option>
              <option value="4.5">4.5+</option>
            </select>
          </div>
          
          {/* Açık restoranlar filtresi */}
          <div className="flex items-center">
            <input
              id="isOpen"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-6"
              checked={filters.isOpen}
              onChange={(e) => handleFilterChange('isOpen', e.target.checked)}
            />
            <label htmlFor="isOpen" className="ml-2 block text-sm text-gray-700 mt-6">
              Sadece açık restoranlar
            </label>
          </div>
        </div>
      </div>
      
      {/* Restoranlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map(restaurant => (
            <Link 
              key={restaurant.id} 
              href={`/yemek/${restaurant.id}`}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-48 bg-gray-200 relative">
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${restaurant.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {restaurant.isOpen ? 'Açık' : 'Kapalı'}
                </div>
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-gray-400">Resim yüklenemiyor</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold">{restaurant.name}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <span className="mr-2">{restaurant.cuisine}</span>
                  <span>⭐ {restaurant.rating}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
                  <span>Min. {restaurant.minOrder} TL</span>
                  <span>{restaurant.deliveryTime}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            <p>Bu kriterlere uygun restoran bulunamadı.</p>
            <button 
              className="mt-2 text-blue-600 hover:underline"
              onClick={() => setFilters({ cuisine: '', rating: 0, isOpen: false })}
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 