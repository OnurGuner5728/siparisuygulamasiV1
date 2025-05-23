'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';

export default function CampaignsPage() {
  return (
    <AuthGuard requiredRole="kampanya" permissionType="view">
      <CampaignsContent />
    </AuthGuard>
  );
}

function CampaignsContent() {
  const { user, hasPermission } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [allMainCategories, setAllMainCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [campaignsData, categoriesData] = await Promise.all([
          api.getCampaigns(),
          api.getMainCategories()
        ]);
        
        // Kampanyaları getir ve her kampanya için ilgili mağaza bilgilerini yükle
        const enhancedCampaigns = await Promise.all(
          (campaignsData || []).map(async (campaign) => {
            if (campaign.store_id) {
              try {
                const storeData = await api.getStoreById(campaign.store_id);
                
                // Mağaza kategorisini bul
                let storeCategory = null;
                if (storeData.category_id) {
                  const category = categoriesData.find(c => c.id === storeData.category_id);
                  storeCategory = category || null;
                }
                
                return {
                  ...campaign,
                  store: {
                    ...storeData,
                    category: storeCategory
                  }
                };
              } catch (error) {
                console.error(`Kampanya ${campaign.id} için mağaza bilgileri yüklenirken hata:`, error);
                return campaign;
              }
            }
            return campaign;
          })
        );
        
        setCampaigns(enhancedCampaigns);
        setAllMainCategories(categoriesData || []);
      } catch (err) {
        console.error("Kampanya ve kategori verileri yüklenirken hata:", err);
        setError("Veriler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCampaigns = campaigns.filter(campaign => {
    const storeName = campaign.store?.name?.toLowerCase() || '';
    const storeCategoryName = campaign.store?.category?.name?.toLowerCase() || '';

    const matchesSearch = 
      (campaign.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (campaign.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      storeName.includes(searchTerm.toLowerCase()) ||
      storeCategoryName.includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || 
      (campaign.store?.category_id && campaign.store.category_id.toString() === categoryFilter) ||
      (campaign.main_category_id && campaign.main_category_id.toString() === categoryFilter);

    return matchesSearch && matchesCategory;
  });

  const canCreateCampaign = hasPermission('kampanya', 'create');
  const canAccessAdmin = hasPermission('kampanya', 'admin');

  const navigateToStore = (campaign) => {
    if (campaign.store && campaign.store.id) {
      // Mağaza kategorisine göre yönlendirme yapılması
      const categoryMapping = {
        1: 'yemek',
        2: 'market',
        3: 'su',
        4: 'cicek',
        5: 'tatli'
      };
      
      const categorySlug = categoryMapping[campaign.store.category_id] || 'yemek';
      const storeId = campaign.store.id;
      
      // Yemek için doğrudan yemek/store/id, diğerleri için category/store/id
      router.push(`/${categorySlug}/store/${storeId}`);
    } else {
      console.warn("Kampanyaya ait mağaza bilgisi eksik:", campaign);
      router.push('/'); 
    }
  };
  
  function getCategoryColor(categoryId) {
    const colors = {
      1: 'bg-red-500',    // Yemek
      2: 'bg-blue-500',   // Market
      3: 'bg-sky-500',    // Su
      4: 'bg-pink-500',   // Çiçek
      5: 'bg-yellow-500', // Tatlı
      default: 'bg-indigo-500'
    };
    return colors[categoryId] || colors.default;
  }

  function getCategoryBadgeClass(categoryId) {
    const badges = {
      1: 'bg-red-100 text-red-800',       // Yemek
      2: 'bg-blue-100 text-blue-800',     // Market
      3: 'bg-sky-100 text-sky-800',       // Su
      4: 'bg-pink-100 text-pink-800',     // Çiçek
      5: 'bg-yellow-100 text-yellow-800', // Tatlı
      default: 'bg-indigo-100 text-indigo-800'
    };
    return badges[categoryId] || badges.default;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Kampanyalar yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-3xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Bir Hata Oluştu</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Kampanyalar</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {canAccessAdmin && (
            <Link 
              href="/admin/kampanyalar" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Kampanya Yönetimi
            </Link>
          )}
          
          {canCreateCampaign && (
            <Link 
              href="/kampanyalar/olustur" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Yeni Kampanya Oluştur
            </Link>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-full md:w-1/3">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Ara</label>
            <input
              type="text"
              id="search"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kampanya ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-1/3">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              id="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Tüm Kategoriler</option>
              {allMainCategories.map(category => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {filteredCampaigns.map(campaign => {
            const categoryId = campaign.store?.category_id || campaign.main_category_id;
            const categoryName = campaign.store?.category?.name || allMainCategories.find(c => c.id === campaign.main_category_id)?.name || 'Genel';
            
            return (
              <div 
                key={campaign.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col"
              >
                <div className="relative">
                  {campaign.image_url ? (
                    <img 
                      src={campaign.image_url} 
                      alt={campaign.title} 
                      className="w-full h-48 object-cover" 
                    />
                  ) : (
                    <div className={`w-full h-48 flex items-center justify-center ${getCategoryColor(categoryId)}`}>
                      <span className="text-white text-2xl font-semibold px-4 text-center">{campaign.store?.name || campaign.title || 'Kampanya'}</span>
                    </div>
                  )}
                  <div className={`absolute top-0 right-0 m-2 px-2 py-1 text-xs font-semibold rounded-full shadow-sm ${getCategoryBadgeClass(categoryId)}`}>
                    {categoryName}
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold mb-2 line-clamp-2">{campaign.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{campaign.description}</p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {campaign.store && (
                          <div className="flex items-center text-sm text-gray-500">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getCategoryColor(categoryId)}`}>
                              {campaign.store.name[0].toUpperCase()}
                            </div>
                            <span className="ml-2 font-medium truncate max-w-[120px]">{campaign.store.name}</span>
                          </div>
                        )}
                        
                        {!campaign.store_id && campaign.main_category_id && (
                          <span className="text-sm text-gray-500">
                            Tüm {categoryName} mağazalarında
                          </span>
                        )}
                      </div>
                      
                      {campaign.store && (
                        <button 
                          onClick={() => navigateToStore(campaign)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Mağazaya Git
                        </button>
                      )}
                    </div>
                    
                    {campaign.end_date && (
                      <div className="mt-3 text-xs text-gray-500">
                        Son geçerlilik: {new Date(campaign.end_date).toLocaleDateString('tr-TR')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Kampanya Bulunamadı</h2>
          <p className="text-gray-600 mb-6">Arama kriterlerinize uygun kampanya bulunamadı.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}
    </div>
  );
} 