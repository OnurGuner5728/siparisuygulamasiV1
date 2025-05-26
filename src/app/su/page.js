'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api'; // Mock importları kaldırıldı
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
  const [availableBrands, setAvailableBrands] = useState([]); // Dinamik olarak mağazaların tag'lerinden alınacak

  const [filters, setFilters] = useState({
    brand: '',
    deliveryTimeMax: 0, // stores.delivery_time_estimation (örn: "20-30 dk" ise 30 alınacak)
    isOpen: false,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const mainCategories = await api.getMainCategories();
        const suCategory = mainCategories.find(cat => cat.name === SU_CATEGORY_NAME);

        if (!suCategory) {
          console.error(`'${SU_CATEGORY_NAME}' kategorisi bulunamadı.`);
          setWaterVendors([]);
          setFilteredVendors([]);
          setCampaigns([]);
          setLoading(false);
          return;
        }
        setSuCategoryId(suCategory.id);

        const [storesData, allCampaignsData] = await Promise.all([
          api.getStores({ 
            category_id: suCategory.id, 
            status: 'active' 
          }),
          api.getCampaigns(),
        ]);

        // Sadece onaylanmış su satıcılarını göster
        const approvedVendors = (storesData || []).filter(store => store.is_approved);
        setWaterVendors(approvedVendors);
        setFilteredVendors(approvedVendors);

        // Mağazaların tag'lerinden markaları çıkar
        const brands = [...new Set(approvedVendors.flatMap(store => store.tags || []).filter(Boolean))];
        setAvailableBrands(brands);

        const suCampaigns = (allCampaignsData || []).filter(campaign => {
          if (campaign.category_id === suCategory.id || campaign.main_category_id === suCategory.id) return true;
          if (campaign.store_id && approvedVendors.some(store => store.id === campaign.store_id)) return true;
          return false;
        });
        setCampaigns(suCampaigns);

      } catch (error) {
        console.error('Su verileri yüklenirken bir hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!waterVendors.length) return;
    let result = waterVendors;

    if (filters.brand) {
      // Su satıcılarının tags alanı (JSONB array) içinde bu markanın olup olmadığını kontrol et
      result = result.filter(vendor => vendor.tags && vendor.tags.includes(filters.brand));
    }

    if (filters.deliveryTimeMax > 0) {
      result = result.filter(vendor => {
        if (!vendor.delivery_time_estimation) return false;
        // "20-30 dk" formatından maksimum süreyi al
        const timeParts = vendor.delivery_time_estimation.split('-');
        const maxTime = parseInt(timeParts[timeParts.length - 1]);
        return !isNaN(maxTime) && maxTime <= filters.deliveryTimeMax;
      });
    }

    if (filters.isOpen) {
      result = result.filter(vendor => vendor.is_open);
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
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{SU_CATEGORY_NAME} Siparişi</h1>
      <p className="text-gray-600 mb-8">Damacana ve şişe su siparişlerinizi hızlıca verin!</p>
      
      {/* Kampanya Banner */}
      {suCategoryId && (
        <CategoryCampaignBanner 
          categoryId={suCategoryId} 
          categoryName="su" 
        />
      )}

      {availableBrands.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Popüler Su Markaları (Mağaza Etiketlerinden)</h2>
          <div className="flex flex-wrap gap-2">
            {availableBrands.map((brand) => (
              <button
                key={brand} // Marka adı unique olmalı
                className={`px-4 py-2 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400
                ${filters.brand === brand 
                  ? 'bg-sky-100 border-sky-300 text-sky-800 font-medium' 
                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
                onClick={() => handleFilterChange('brand', brand === filters.brand ? '' : brand)}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-gray-50 p-4 rounded-lg mb-8 shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="brandFilter" className="block text-sm font-medium text-gray-700 mb-1">Su Markası</label>
            <select 
              id="brandFilter"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            >
              <option value="">Tüm Markalar</option>
              {availableBrands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="deliveryTimeFilter" className="block text-sm font-medium text-gray-700 mb-1">Maks. Teslimat Süresi</label>
            <select 
              id="deliveryTimeFilter"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              value={filters.deliveryTimeMax}
              onChange={(e) => handleFilterChange('deliveryTimeMax', Number(e.target.value))}
            >
              <option value="0">Fark etmez</option>
              <option value="30">30 dk ve altı</option>
              <option value="45">45 dk ve altı</option>
              <option value="60">60 dk ve altı</option>
            </select>
          </div>
          
          <div className="flex items-center pt-2 sm:pt-0 md:pt-5">
            <input
              id="isOpenSu"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
              checked={filters.isOpen}
              onChange={(e) => handleFilterChange('isOpen', e.target.checked)}
            />
            <label htmlFor="isOpenSu" className="ml-2 block text-sm text-gray-900">
              Sadece açık satıcılar
            </label>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
        {filteredVendors.length > 0 ? (
          filteredVendors.map(vendor => (
                        <Link               key={vendor.id}               href={`/su/store/${vendor.id}`}              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"            >
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 truncate" title={vendor.name}>{vendor.name}</h3>
                {/* Marka bilgisi vendor.tags içinde varsa gösterilebilir */}
                {vendor.tags && vendor.tags.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">Markalar: {vendor.tags.join(', ')}</p>
                )}
                {vendor.rating !== null && vendor.rating !== undefined && 
                  <span className="flex items-center text-sm text-gray-600 mt-1">
                      <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                      {vendor.rating.toFixed(1)}
                  </span>
                }
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797A8.333 8.333 0 0112 5.85c1.267 0 2.453-.331 3.362-.886zM12 15a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Su Satıcısı Bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">Bu kriterlere uygun su satıcısı bulunamadı.</p>
            <button 
              className="mt-2 text-sm font-medium text-sky-600 hover:text-sky-500"
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