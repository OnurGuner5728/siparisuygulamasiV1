'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import ModuleGuard from '@/components/ModuleGuard';
import CategoryCampaignBanner from '@/components/CategoryCampaignBanner';

const SU_CATEGORY_NAME = 'Su';

export default function SuPage() {
  return (
    <ModuleGuard moduleName="su">
      <SuPageContent />
    </ModuleGuard>
  );
}

function SuPageContent() {
  const [waterVendors, setWaterVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [suCategoryId, setSuCategoryId] = useState(null);
  const [availableBrands, setAvailableBrands] = useState([]);

  const [filters, setFilters] = useState({
    brand: '',
    deliveryTimeMax: 0,
    isOpen: false,
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Kategorileri al
        const categoriesData = await api.getCategories(true);
        const suCategory = categoriesData.find(cat => cat.slug === 'su');
        
        if (suCategory) {
          setSuCategoryId(suCategory.id);
          
          // Su satıcılarını al - filtreleri API'ye gönder
          const storesData = await api.getStores({ 
            category_id: suCategory.id,
            isOpen: filters.isOpen
          });
          setWaterVendors(storesData);
        }
      } catch (error) {
        console.error('Su sayfası verileri yüklenirken hata:', error);
        setWaterVendors([]);
      }
      setLoading(false);
    }
    
    fetchData();
  }, [filters.isOpen]); // sadece isOpen filtresi API'ye gönderiliyor

  // Mevcut markaları hesapla
  useEffect(() => {
    if (waterVendors.length > 0) {
      // tags yerine type alanını kullan
      const brands = [...new Set(waterVendors.map(vendor => vendor.type).filter(Boolean))];
      setAvailableBrands(brands);
    }
  }, [waterVendors]);

  // Diğer filtreler frontend'de yapılıyor
  useEffect(() => {
    if (!waterVendors.length) return;
    
    let result = waterVendors;
    
    // Brand filtresi - type alanını kullan
    if (filters.brand) {
      result = result.filter(vendor => 
        vendor.type && vendor.type.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }
    
    setFilteredVendors(result);
  }, [filters, waterVendors]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Su</h1>
            </div>
          </div>
        </div>
      </div>
      
      {/* Kampanya Banner */}
      {suCategoryId && (
        <CategoryCampaignBanner 
          categoryId={suCategoryId} 
          categoryName="su" 
        />
      )}

      {/* Filter Tabs */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center space-x-1 overflow-x-auto">
          <button
            onClick={() => handleFilterChange('brand', '')}
            className={`px-6 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
              filters.brand === '' 
                ? 'bg-sky-500 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Tümü
          </button>
          {availableBrands.slice(0, 5).map((brand) => (
              <button
              key={brand}
                onClick={() => handleFilterChange('brand', brand === filters.brand ? '' : brand)}
              className={`px-6 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
                filters.brand === brand 
                  ? 'bg-sky-500 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
              >
                {brand}
              </button>
            ))}
          <button
            onClick={() => handleFilterChange('isOpen', !filters.isOpen)}
            className={`px-6 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
              filters.isOpen 
                ? 'bg-sky-500 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Açık Olanlar
          </button>
        </div>
      </div>
      
      {/* Water Vendors List */}
      <div className="container mx-auto px-4 py-6">
        {filteredVendors.length > 0 ? (
          <div className="space-y-4">
            {filteredVendors.map(vendor => (
              <Link 
                key={vendor.id}
                href={`/su/store/${vendor.id}`}
                className="block"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Vendor Image */}
              <div className="h-48 bg-gray-200 relative">
                {vendor.banner_url || vendor.logo_url ? (
                  <img 
                    src={vendor.banner_url || vendor.logo_url} 
                    alt={vendor.name} 
                        className="w-full h-full object-cover"
                  />
                ) : (
                      <div className="w-full h-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                        {vendor.logo_url ? <img src={vendor.logo_url} alt={vendor.name} className="w-full h-full object-cover" /> : '💧'}
                      </div>
                    )}
                    
                    {/* Vendor Status */}
                    <div className="absolute top-4 left-4">
                      <span className={`flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm ${
                        vendor.is_open ? 'text-green-700' : 'text-red-700'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          vendor.is_open ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        {vendor.is_open ? 'Açık' : 'Kapalı'}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4">
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          {vendor.delivery_fee || '0 ₺' + " teslimat ücreti"}
                        </span>
                        <span className="bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {vendor.delivery_time_min + " min" || '25 min'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vendor Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{vendor.name}</h3>
                    <p className="text-gray-600 mb-4">{vendor.description || 'Temiz ve sağlıklı su çözümleri'}</p>
                    
                    {/* Water Types */}
                    {vendor.type && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-sky-500 text-white px-4 py-2 text-sm font-medium rounded-full">
                          {vendor.type}
                        </span>
                      </div>
                    )}

                    {/* Vendor Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Min. sipariş: {vendor.minimum_order_amount || 0} TL</span>
                      {vendor.rating && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          <span>{vendor.rating.toFixed(1)}</span>
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
            <div className="text-gray-400 text-lg mb-4">💧</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Su Satıcısı Bulunamadı</h3>
            <p className="text-gray-500">Bu kriterlere uygun su satıcısı bulunamadı.</p>
            <button 
              className="mt-4 px-6 py-2 bg-sky-500 text-white rounded-lg"
              onClick={() => setFilters({ brand: '', deliveryTimeMax: 0, isOpen: false })}
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 
