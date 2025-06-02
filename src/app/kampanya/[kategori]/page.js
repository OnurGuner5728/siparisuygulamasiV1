'use client';

import { use, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function CampaignCategoryPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const { kategori } = resolvedParams;
  const campaignId = searchParams.get('cid'); // URL'den kampanya ID'sini al
  
  const [campaigns, setCampaigns] = useState([]);
  const [participatingStores, setParticipatingStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  
  // Kategori adını formatla
  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      'yemek': 'Yemek',
      'market': 'Market', 
      'su': 'Su'
    };
    return categoryMap[category.toLowerCase()] || category;
  };
  
  // Kategori rengini al
  const getCategoryColor = (category) => {
    const colorMap = {
      'yemek': 'from-orange-400 to-red-500',
      'market': 'from-green-400 to-emerald-500',
      'su': 'from-blue-400 to-cyan-500'
    };
    return colorMap[category.toLowerCase()] || 'from-gray-400 to-gray-500';
  };
  
  // Kategori ikonu
  const getCategoryIcon = (category) => {
    const iconMap = {
      'yemek': '',
      'market': '',
      'su': ''
    };
    return iconMap[category.toLowerCase()] || '';
  };
  
  useEffect(() => {
    const fetchCampaignStores = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const categoryName = getCategoryDisplayName(kategori);
        
        // 1. Bu kategorideki aktif kampanyaları getir
        const campaignsData = await api.getCampaignBanners(categoryName);
        
        if (!campaignsData || campaignsData.length === 0) {
          setCampaigns([]);
          setParticipatingStores([]);
          setLoading(false);
          return;
        }
        
        setCampaigns(campaignsData);
        
        // URL'den gelen kampanya ID'sine göre seçili kampanyayı belirle
        let selectedCamp = campaignsData[0]; // Varsayılan olarak ilk kampanya
        if (campaignId) {
          const foundCampaign = campaignsData.find(c => c.id === campaignId);
          if (foundCampaign) {
            selectedCamp = foundCampaign;
          }
        }
        setSelectedCampaign(selectedCamp);
        
        // 2. Her kampanya için onaylanmış başvuruları getir
        const allParticipatingStores = [];
        
        for (const campaign of campaignsData) {
          try {
            // Kampanya başvurularını getir (sadece onaylananlar)
            const applications = await api.getCampaignApplications({
              campaign_id: campaign.id,
              status: 'approved'
            });
            
            // Her başvuru için mağaza bilgilerini tam olarak getir
            for (const application of applications) {
              if (application.store_id && !allParticipatingStores.find(s => s.id === application.store_id)) {
                try {
                  // Store bilgilerini tam olarak çek
                  const fullStoreData = await api.getStoreById(application.store_id);
                  if (fullStoreData) {
                    allParticipatingStores.push({
                      ...fullStoreData,
                      campaign: campaign,
                      application: application,
                      categoryName: kategori
                    });
                  }
                } catch (storeErr) {
                  console.error(`Store ${application.store_id} bilgileri alınırken hata:`, storeErr);
                  // Fallback olarak application'dan gelen store bilgisini kullan
                  if (application.store) {
                    allParticipatingStores.push({
                      ...application.store,
                      campaign: campaign,
                      application: application,
                      categoryName: kategori
                    });
                  }
                }
              }
            }
          } catch (err) {
            console.error(`Kampanya ${campaign.id} için başvurular alınırken hata:`, err);
          }
        }
        
        setParticipatingStores(allParticipatingStores);
        
      } catch (error) {
        console.error('Kampanya mağazaları yüklenirken hata:', error);
        setError('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    if (kategori) {
      fetchCampaignStores();
    }
  }, [kategori, campaignId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6">
                  <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Bir Hata Oluştu</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.back()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }
  
  const categoryDisplayName = getCategoryDisplayName(kategori);
  const categoryIcon = getCategoryIcon(kategori);
  const categoryGradient = getCategoryColor(kategori);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Kampanya Banner */}
      {selectedCampaign ? (
        <div className="relative h-[200px] md:h-[250px] overflow-hidden">
          {/* Kampanya Banner Görseli */}
          <div 
            className="absolute inset-0 bg-center bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url(${selectedCampaign.banner_image_url})`,
            }}
          ></div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
          
          {/* Geri Butonu - Sol Üst */}
          <button 
            onClick={() => router.back()}
            className="absolute top-4 left-4 p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors backdrop-blur-sm z-10"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Content - Alt Kısım */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            <div className="container mx-auto">
              <div className="text-white">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{selectedCampaign.name}</h1>
                <div className="flex items-center space-x-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedCampaign.type === 'percentage' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {selectedCampaign.type === 'percentage' 
                      ? `%${selectedCampaign.value} İndirim` 
                      : `${selectedCampaign.value}₺ İndirim`
                    }
                  </span>
                  <span className="text-white/90 text-sm">
                    {new Date(selectedCampaign.end_date).toLocaleDateString('tr-TR')} tarihine kadar
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Fallback header kampanya yoksa
        <div className={`relative bg-gradient-to-r ${categoryGradient} text-white py-8`}>
          {/* Geri Butonu - Sol Üst */}
          <button 
            onClick={() => router.back()}
            className="absolute top-4 left-4 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="container mx-auto px-4 pt-8">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold">{categoryDisplayName} Kampanyaları</h1>
              <p className="text-white/90 mt-2">Kampanyaya katılan mağazalar</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        {/* Diğer Kampanyalar (Eğer birden fazla varsa) */}
        {campaigns.length > 1 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Diğer Aktif Kampanyalar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.filter(c => c.id !== selectedCampaign?.id).map((campaign) => (
                <button
                  key={campaign.id}
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    // URL'yi güncelle
                    router.push(`/kampanya/${kategori}?cid=${campaign.id}`, { scroll: false });
                  }}
                  className="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-bold text-lg mb-2">{campaign.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{campaign.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.type === 'percentage' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {campaign.type === 'percentage' 
                          ? `%${campaign.value} İndirim` 
                          : `${campaign.value}₺ İndirim`
                        }
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(campaign.end_date).toLocaleDateString('tr-TR')} tarihine kadar
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Katılan Mağazalar */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Kampanyaya Katılan Mağazalar 
            <span className="text-sm text-gray-500 font-normal ml-2">
              ({participatingStores.length} mağaza)
            </span>
          </h2>
          
          {participatingStores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {participatingStores.map((store) => (
                <Link 
                  key={store.id}
                  href={`/${store.categoryName}/store/${store.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                    {/* Mağaza Görseli */}
                    <div className="h-40 bg-gray-200 relative overflow-hidden">
                      {store.logo_url ? (
                        <img 
                          src={store.logo_url}
                          alt={store.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${categoryGradient} flex items-center justify-center`}>
                          <div className="text-center">
                            <div className="text-4xl mb-2">{categoryIcon}</div>
                            <div className="text-white font-semibold">{store.name}</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Kampanya Badge */}
                      <div className="absolute top-2 right-2">
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Kampanya
                        </span>
                      </div>
                    </div>
                    
                    {/* Mağaza Bilgileri */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors">
                        {store.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {store.description || 'Kaliteli hizmet için bizimle olun'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-400">⭐</span>
                            <span className="text-sm font-medium">
                              {store.rating ? parseFloat(store.rating).toFixed(1) : '4.5'}
                            </span>
                          </div>
                          <div className="text-gray-300">•</div>
                          <span className="text-sm text-gray-600">
                            {store.delivery_time_min || 30}-{store.delivery_time_max || 60} dk
                          </span>
                        </div>
                        
                        <div className="text-sm">
                          {store.campaign && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              store.campaign.type === 'percentage' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {store.campaign.type === 'percentage' 
                                ? `%${store.campaign.value}` 
                                : `${store.campaign.value}₺`
                              }
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {store.minimum_order_amount && store.minimum_order_amount > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          Min. sipariş: {parseFloat(store.minimum_order_amount).toFixed(0)}₺
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">{categoryIcon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Henüz Kampanyaya Katılan Mağaza Yok
              </h3>
              <p className="text-gray-600 mb-6">
                {categoryDisplayName} kategorisinde kampanyaya katılan mağaza bulunmuyor.
              </p>
              <Link 
                href={`/${kategori}`}
                className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${categoryGradient} text-white rounded-lg hover:shadow-lg transition-all duration-300`}
              >
                {categoryDisplayName} Sayfasına Dön
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 