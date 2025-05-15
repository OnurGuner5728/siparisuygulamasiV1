'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { mockCampaigns, campaignCategories, mockStores, mockCategories } from '@/app/data/mockdatas';
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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Kampanya verilerini yükle
  useEffect(() => {
    // API çağrısı simülasyonu
    setTimeout(() => {
      // Aktif kampanyaları filtrele
      const activeCampaigns = mockCampaigns.filter(c => c.status === 'active');
      setCampaigns(activeCampaigns);
      setLoading(false);
    }, 500);
  }, []);

  // Mağaza adını ID'ye göre bul
  const getStoreName = (storeId) => {
    const store = mockStores.find(s => s.id === storeId);
    return store ? store.name : 'Bilinmeyen Mağaza';
  };

  // Kategori adını ID'ye göre bul
  const getCategoryName = (categoryId) => {
    const category = mockCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Genel';
  };

  // Kategori filtrelemesi için filtrelenmiş kampanyalar
  const filteredCampaigns = campaigns.filter(campaign => {
    // Kategori filtresi
    if (filter !== 'all') {
      const categoryName = getCategoryName(campaign.categoryId);
      if (categoryName !== filter) {
        return false;
      }
    }
    
    // Arama filtresi
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      const storeName = getStoreName(campaign.storeId).toLowerCase();
      return (
        campaign.title.toLowerCase().includes(search) ||
        campaign.description.toLowerCase().includes(search) ||
        storeName.includes(search)
      );
    }
    
    return true;
  });

  // Kullanıcının kampanya oluşturma yetkisi var mı?
  const canCreateCampaign = hasPermission('kampanya', 'create');
  
  // Kullanıcının kampanya yönetim paneline erişim yetkisi var mı?
  const canAccessAdmin = hasPermission('kampanya', 'admin');

  // Mağaza sayfasına yönlendirme
  const navigateToStore = (storeId) => {
    // Mağazayı ID'sine göre bul
    const store = mockStores.find(store => store.id === storeId);
    
    if (store) {
      // Kategori ID'sinden kategori adını bul
      const category = mockCategories.find(cat => cat.id === store.categoryId);
      
      if (category) {
        // Kategori adına göre doğru URL formatını belirle ve yönlendir
        const categoryName = category.name.toLowerCase();
        router.push(`/${categoryName}/${storeId}`);
      } else {
        // Kategori bulunamazsa genel mağaza sayfasına yönlendir
        router.push(`/store/${storeId}`);
      }
    } else {
      console.error(`Mağaza bulunamadı: ${storeId}`);
      // Mağaza bulunamazsa ana sayfaya yönlendir
      router.push('/');
    }
  };

  // Kampanya düzenleme sayfasına yönlendirme
  const handleEditCampaign = (campaignId) => {
    router.push(`/kampanyalar/duzenle/${campaignId}`);
  };
  // Kampanya durumunu güncelle
  const toggleCampaignStatus = (campaignId) => {
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            status: campaign.status === 'active' ? 'inactive' : 'active'
          };
        }
        return campaign;
      })
    );
  };

  // Kullanıcının kampanyayı düzenleme yetkisi var mı?
  const canEditCampaign = (campaign) => {
    // Admin her kampanyayı düzenleyebilir
    if (hasPermission('kampanya', 'admin')) {
      return true;
    }
    
    // Oluşturma yetkisi olanlar kendi kampanyalarını düzenleyebilir
    if (canCreateCampaign && user && campaign.createdBy) {
      return campaign.createdBy.id === user.id;
    }
    
    return false;
  };

  // Kullanıcının mağazalarını getir (artık email değil, ID ile filtreleme yapılıyor)
  const getUserStores = () => {
    // Kullanıcı ID'sini al
    const userId = user?.id;
    if (!userId) return [];

    // Kullanıcı ID'sine göre mağazaları filtrele
    return mockStores.filter(store => store.ownerId === userId);
  };

  // Kullanıcının mağazalarına ait kampanyaları getir
  const getUserCampaigns = () => {
    // Kullanıcının mağazalarının ID'lerini al
    const userStoreIds = getUserStores().map(store => store.id);
    if (userStoreIds.length === 0) return [];

    // Mağaza ID'lerine göre kampanyaları filtrele
    return mockCampaigns.filter(campaign => userStoreIds.includes(campaign.storeId));
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Kampanyalar</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Kampanya yönetim paneli linki - Sadece admin için */}
          {canAccessAdmin && (
            <Link 
              href="/admin/kampanyalar" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Kampanya Yönetimi
            </Link>
          )}
          
          {/* Kampanya oluşturma linki */}
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
      
      {/* Filtreler */}
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
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Tüm Kategoriler</option>
              {campaignCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Kampanya Listesi */}
      {filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map(campaign => {
            const categoryName = getCategoryName(campaign.categoryId);
            return (
              <div key={campaign.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={`h-2 ${getCategoryColor(categoryName)}`}></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2 
                      className="text-xl font-bold hover:text-blue-600 cursor-pointer"
                      onClick={() => navigateToStore(campaign.storeId)}
                    >
                      {campaign.title}
                    </h2>
                    <div className="flex space-x-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryBadgeClass(categoryName)}`}>
                        {categoryName}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{campaign.description}</p>
                  
                  {/* Mağaza bilgisi */}
                  <div className="flex items-center mt-4">
                    <div className="mr-3">
                      <div className="h-10 w-10 bg-gray-200 rounded-full overflow-hidden">
                        {campaign.storeImage ? (
                          <img src={campaign.storeImage} alt={getStoreName(campaign.storeId)} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-500">
                            <span className="text-lg font-semibold">{getStoreName(campaign.storeId).charAt(0)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 
                        className="text-sm font-medium text-gray-800 hover:text-blue-600 cursor-pointer"
                        onClick={() => navigateToStore(campaign.storeId)}
                      >
                        {getStoreName(campaign.storeId)}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Kampanya detayları ve butonlar */}
                  <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div>
                      {campaign.discountRate && (
                        <span className="text-sm font-medium text-green-600">%{campaign.discountRate} İndirim</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {/* Düzenle butonu - sadece yetkililer için */}
                      {canEditCampaign(campaign) && (
                        <button
                          onClick={() => handleEditCampaign(campaign.id)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100"
                        >
                          Düzenle
                        </button>
                      )}
                      
                      {/* Mağazaya git butonu */}
                      <button
                        onClick={() => navigateToStore(campaign.storeId)}
                        className="px-3 py-1 bg-gray-50 text-gray-800 rounded-md text-sm hover:bg-gray-100"
                      >
                        Mağazaya Git
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">Aradığınız kriterlere uygun kampanya bulunamadı.</p>
        </div>
      )}
    </div>
  );
}

// Tarih formatlama fonksiyonu
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('tr-TR', options);
}

// Kategori rengini belirleme fonksiyonu
function getCategoryColor(categoryName) {
  switch (categoryName) {
    case 'Yemek': return 'bg-blue-500';
    case 'Market': return 'bg-green-500';
    case 'Su': return 'bg-indigo-500';
    case 'Aktüel': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
}

// Kategori badge sınıfını belirleme fonksiyonu
function getCategoryBadgeClass(categoryName) {
  const found = campaignCategories.find(c => c.id === categoryName);
  return found ? found.color : 'bg-gray-100 text-gray-800';
} 