'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

const CICEK_CATEGORY_NAME = 'Çiçek';

export default function CicekPage() {
  const [cicekVendors, setCicekVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [cicekCategoryId, setCicekCategoryId] = useState(null);
  const [cicekTypes, setCicekTypes] = useState([]); // Çiçek türleri

  const [filters, setFilters] = useState({
    storeType: '', // stores.type
    priceRange: 0, // 0: tümü, 1: uygun, 2: orta, 3: premium
    isOpen: false,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Ana kategorileri çek ve Çiçek kategorisinin ID'sini bul
        const mainCategories = await api.getMainCategories();
        const cicekCategory = mainCategories.find(cat => cat.name === CICEK_CATEGORY_NAME);
        
        if (!cicekCategory) {
          console.error(`'${CICEK_CATEGORY_NAME}' kategorisi bulunamadı.`);
          setCicekVendors([]);
          setFilteredVendors([]);
          setCampaigns([]);
          setLoading(false);
          return;
        }
        setCicekCategoryId(cicekCategory.id);

        const [storesData, allCampaignsData] = await Promise.all([
          api.getStores({ main_category_id: cicekCategory.id, status: 'active', is_approved: true }),
          api.getCampaigns(),
        ]);
        
        setCicekVendors(storesData || []);
        setFilteredVendors(storesData || []);

        // Mağaza türlerini belirle
        const uniqueStoreTypes = [...new Set(storesData.map(store => store.type).filter(Boolean))];
        setCicekTypes(uniqueStoreTypes);

        // Çiçek kategorisine ait kampanyaları filtrele
        const cicekCampaigns = (allCampaignsData || []).filter(campaign => {
          if (campaign.main_category_id === cicekCategory.id) return true;
          if (campaign.store_id && storesData.some(store => store.id === campaign.store_id)) return true;
          return false;
        });
        setCampaigns(cicekCampaigns);

      } catch (error) {
        console.error('Çiçek verileri yüklenirken bir hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!cicekVendors.length) return;

    let result = cicekVendors;

    if (filters.storeType) {
      result = result.filter(vendor => vendor.type === filters.storeType);
    }

    if (filters.priceRange > 0) {
      // Fiyat aralığı filtrelemesi
      // Ürün fiyatlarına veya mağazanın ortalama fiyatına göre filtreleme mantığı eklenebilir
      // Şimdilik basit bir yaklaşım kullanalım:
      switch (filters.priceRange) {
        case 1: // Uygun - min_order_amount 50 TL'den az
          result = result.filter(vendor => (vendor.min_order_amount || 0) < 50);
          break;
        case 2: // Orta - min_order_amount 50-100 TL arası
          result = result.filter(vendor => 
            (vendor.min_order_amount || 0) >= 50 && 
            (vendor.min_order_amount || 0) <= 100
          );
          break;
        case 3: // Premium - min_order_amount 100 TL'den fazla
          result = result.filter(vendor => (vendor.min_order_amount || 0) > 100);
          break;
      }
    }

    if (filters.isOpen) {
      result = result.filter(vendor => vendor.is_open);
    }

    setFilteredVendors(result);
  }, [filters, cicekVendors]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{CICEK_CATEGORY_NAME} Siparişi</h1>
      <p className="text-gray-600 mb-8">Sevdiklerinize en güzel çiçekleri gönderin!</p>
      
      {campaigns.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Güncel {CICEK_CATEGORY_NAME} Kampanyaları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="bg-pink-50 p-4 rounded-lg border border-pink-200 shadow hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-pink-700">{campaign.title}</h3>
                <p className="text-sm text-pink-600 line-clamp-2">{campaign.description}</p>
                {campaign.store && (
                  <p className="text-xs text-gray-600 mt-2">
                    Sadece: <span className="font-medium">{campaign.store.name}</span>
                  </p>
                )}
                {!campaign.store_id && campaign.main_category_id === cicekCategoryId && (
                    <p className="text-xs text-gray-500 mt-2">Tüm {CICEK_CATEGORY_NAME} satıcılarında geçerli</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-8 shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="storeTypeFilter" className="block text-sm font-medium text-gray-700 mb-1">Çiçekçi Türü</label>
            <select 
              id="storeTypeFilter"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
              value={filters.storeType}
              onChange={(e) => handleFilterChange('storeType', e.target.value)}
            >
              <option value="">Tümü</option>
              {cicekTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="priceRangeFilter" className="block text-sm font-medium text-gray-700 mb-1">Fiyat Aralığı</label>
            <select 
              id="priceRangeFilter"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
              value={filters.priceRange}
              onChange={(e) => handleFilterChange('priceRange', Number(e.target.value))}
            >
              <option value="0">Tümü</option>
              <option value="1">Uygun</option>
              <option value="2">Orta</option>
              <option value="3">Premium</option>
            </select>
          </div>
          
          <div className="flex items-center pt-2 sm:pt-0 md:pt-5">
            <input
              id="isOpenCicek"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              checked={filters.isOpen}
              onChange={(e) => handleFilterChange('isOpen', e.target.checked)}
            />
            <label htmlFor="isOpenCicek" className="ml-2 block text-sm text-gray-900">
              Sadece açık çiçekçiler
            </label>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
        {filteredVendors.length > 0 ? (
          filteredVendors.map(vendor => (
            <Link 
              key={vendor.id} 
              href={`/cicek/${vendor.id}`}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <div className="h-48 bg-gray-200 relative">
                {vendor.is_open !== undefined && (
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${vendor.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {vendor.is_open ? 'Açık' : 'Kapalı'}
                    </div>
                )}
                {vendor.cover_image_url ? (
                  <img 
                    src={vendor.cover_image_url} 
                    alt={vendor.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <svg className="w-12 h-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 truncate" title={vendor.name}>{vendor.name}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <span className="mr-2">{vendor.type || 'Çiçekçi'}</span>
                  {vendor.rating !== null && vendor.rating !== undefined && 
                    <span className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        {vendor.rating.toFixed(1)}
                    </span>
                  }
                </div>
                <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                  <span>Min. {vendor.min_order_amount || 0} TL</span>
                  <span>{vendor.delivery_time_estimation || 'Bilinmiyor'}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Çiçekçi Bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">Bu kriterlere uygun çiçekçi bulunamadı.</p>
            <button 
              className="mt-2 text-sm font-medium text-pink-600 hover:text-pink-500"
              onClick={() => setFilters({ storeType: '', priceRange: 0, isOpen: false })}
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 
