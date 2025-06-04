'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';

export default function StoreCampaignsPage() {
  return (
    <AuthGuard requiredRole="store">
      <StoreCampaignsContent />
    </AuthGuard>
  );
}

function StoreCampaignsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('available');
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mağaza bilgilerini yükle
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const storeData = await api.getStoreByOwnerId(user.id);
        setStore(storeData);
      } catch (error) {
        console.error('Mağaza bilgileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchStoreData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-red-800 mb-2">Mağaza Bulunamadı</h2>
          <p className="text-red-700">Kampanyalara katılabilmek için önce mağaza profilinizi tamamlamanız gerekir.</p>
          <Link 
            href="/store/profile" 
            className="mt-4 inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Mağaza Profiline Git
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Kampanya Yönetimi</h1>
          <p className="text-gray-600">Mağazanız için uygun kampanyalara katılın ve mevcut katılımlarınızı yönetin</p>
        </div>
        
        <Link 
          href="/store" 
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          ← Mağaza Paneli
        </Link>
      </div>

      {/* Mağaza Durum Kontrolü */}
      {!store.is_approved && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-yellow-600 text-xl mr-3">⚠️</div>
            <div>
              <h3 className="text-yellow-800 font-medium">Mağaza Onayı Bekleniyor</h3>
              <p className="text-yellow-700 text-sm">Kampanyalara katılabilmek için mağazanızın onaylanması gerekir.</p>
            </div>
          </div>
        </div>
      )}

      {/* Sekme Butonları */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button 
            className={`py-3 px-4 font-medium mr-4 border-b-2 ${
              activeTab === 'available' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('available')}
          >
            Mevcut Kampanyalar
          </button>
          <button 
            className={`py-3 px-4 font-medium mr-4 border-b-2 ${
              activeTab === 'applications' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('applications')}
          >
            Başvurularım
          </button>
          <button 
            className={`py-3 px-4 font-medium mr-4 border-b-2 ${
              activeTab === 'active' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('active')}
          >
            Aktif Katılımlarım
          </button>
        </nav>
      </div>
      
      {/* Aktif Sekmeye Göre İçerik */}
      {activeTab === 'available' && <AvailableCampaigns store={store} />}
      {activeTab === 'applications' && <MyApplications store={store} />}
      {activeTab === 'active' && <ActiveParticipations store={store} />}
    </div>
  );
}

// Mevcut Kampanyalar Bileşeni
function AvailableCampaigns({ store }) {
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Paralel olarak kampanyaları ve başvuruları getir
        const [campaignsData, applicationsData] = await Promise.all([
          api.getCampaigns({ is_admin_created: true }, true),
          api.getCampaignApplications({ store_id: store.id })
        ]);
        
        setCampaigns(campaignsData);
        setApplications(applicationsData);
      } catch (error) {
        console.error('Kampanyalar yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [store.id]);

  // Kampanya başvuru durumunu kontrol et
  const getApplicationStatus = (campaignId) => {
    const application = applications.find(app => app.campaign_id === campaignId);
    return application ? application.status : null;
  };

  // Kampanyaya başvur
  const applyCampaign = async (campaignId) => {
    if (!store.is_approved) {
      alert('Kampanyalara katılabilmek için mağazanızın onaylanması gerekir.');
      return;
    }

    try {
      // Uygunluk kontrolü
      const eligibilityCheck = await api.checkCampaignEligibility(store.id, campaignId);
      
      if (!eligibilityCheck.eligible) {
        alert(eligibilityCheck.reason || 'Bu kampanyaya katılamazsınız.');
        return;
      }

      // Başvuru oluştur
      await api.createCampaignApplication({
        campaign_id: campaignId,
        store_id: store.id,
        user_id: store.owner_id,
        status: 'pending',
        applied_at: new Date().toISOString()
      });

      alert('Kampanya başvurunuz başarıyla gönderildi! Onay sürecini takip edebilirsiniz.');
      
      // Başvuruları tekrar yükle
      const updatedApplications = await api.getCampaignApplications({ store_id: store.id });
      setApplications(updatedApplications);
      
    } catch (error) {
      console.error('Başvuru sırasında hata:', error);
      alert('Başvuru sırasında bir hata oluştu.');
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      return (
        campaign.name?.toLowerCase().includes(search) ||
        campaign.description?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
        <p className="text-gray-600">Kampanyalar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Katılabileceğiniz Kampanyalar</h2>
        
        {/* Arama */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Kampanya ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Kampanya Listesi */}
      {filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map(campaign => (
            <div key={campaign.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">{campaign.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{campaign.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">İndirim Tipi:</span>
                    <span className="font-medium">
                      {campaign.type === 'percentage' ? 'Yüzde İndirim' :
                       campaign.type === 'amount' ? 'Tutar İndirim' :
                       'Ücretsiz Teslimat'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">İndirim Değeri:</span>
                    <span className="font-medium text-green-600">
                      {campaign.type === 'percentage' ? `%${campaign.value}` :
                       campaign.type === 'amount' ? `${campaign.value} TL` :
                       'Ücretsiz'}
                    </span>
                  </div>
                  {campaign.minimum_order_amount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Min. Sipariş:</span>
                      <span className="font-medium">{campaign.minimum_order_amount} TL</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Geçerlilik:</span>
                    <span className="font-medium">
                      {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => applyCampaign(campaign.id)}
                  disabled={!store.is_approved || getApplicationStatus(campaign.id)}
                  className={`w-full px-4 py-2 rounded-md font-medium ${
                    !store.is_approved 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : getApplicationStatus(campaign.id)
                      ? 'bg-orange-300 text-orange-700 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {!store.is_approved 
                    ? 'Mağaza Onayı Gerekli'
                    : getApplicationStatus(campaign.id) === 'pending'
                    ? 'Sonuç Bekleniyor...'
                    : getApplicationStatus(campaign.id) === 'approved'
                    ? 'Onaylandı ✓'
                    : getApplicationStatus(campaign.id) === 'rejected'
                    ? 'Reddedildi ✗'
                    : 'Başvur'
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">Şu anda katılabileceğiniz bir kampanya bulunmamaktadır.</p>
        </div>
      )}
    </div>
  );
}

// Başvurularım Bileşeni
function MyApplications({ store }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const applicationsData = await api.getCampaignApplications({ store_id: store.id });
        setApplications(applicationsData);
      } catch (error) {
        console.error('Başvurular yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [store.id]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
        <p className="text-gray-600">Başvurular yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Kampanya Başvurularım</h2>
      
      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map(application => (
            <div key={application.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{application.campaign?.name}</h3>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  application.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {application.status === 'pending' ? 'Beklemede' :
                   application.status === 'approved' ? 'Onaylandı' :
                   'Reddedildi'}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{application.campaign?.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Başvuru Tarihi:</span>
                  <div className="font-medium">{formatDate(application.applied_at)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Durum Güncellemesi:</span>
                  <div className="font-medium">
                    {application.reviewed_at ? formatDate(application.reviewed_at) : 'Henüz değerlendirilmedi'}
                  </div>
                </div>
              </div>
              
              {application.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <span className="text-gray-500 text-sm">Not:</span>
                  <p className="text-gray-700 text-sm mt-1">{application.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">Henüz hiçbir kampanyaya başvurmadınız.</p>
        </div>
      )}
    </div>
  );
}

// Aktif Katılımlarım Bileşeni
function ActiveParticipations({ store }) {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipations = async () => {
      try {
        setLoading(true);
        const participationsData = await api.getStoreCampaignParticipations({ 
          store_id: store.id, 
          status: 'active' 
        });
        setParticipations(participationsData);
      } catch (error) {
        console.error('Katılımlar yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchParticipations();
  }, [store.id]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
        <p className="text-gray-600">Katılımlar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Aktif Kampanya Katılımlarım</h2>
      
      {participations.length > 0 ? (
        <div className="space-y-4">
          {participations.map(participation => (
            <div key={participation.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{participation.campaign?.name}</h3>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                  Aktif
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{participation.campaign?.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Katılım Tarihi:</span>
                  <div className="font-medium">{formatDate(participation.joined_at)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Kampanya Bitiş:</span>
                  <div className="font-medium">{formatDate(participation.campaign?.end_date)}</div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <p className="text-green-700 text-sm">
                  🎉 Bu kampanyaya başarıyla katıldınız! Müşterileriniz bu kampanyadan yararlanabilir.
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">Aktif kampanya katılımınız bulunmamaktadır.</p>
        </div>
      )}
    </div>
  );
}

// Tarih formatlama fonksiyonu
function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('tr-TR', options);
} 