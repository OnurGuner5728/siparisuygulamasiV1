'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { mockCampaigns, mockUsers, mockStores, mockCategories } from '@/app/data/mockdatas';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';

export default function AdminCampaignsPage() {
  return (
    <AuthGuard requiredRole="kampanya" permissionType="admin">
      <AdminCampaignsContent />
    </AuthGuard>
  );
}

function AdminCampaignsContent() {
  // Sekme durumu
  const [activeTab, setActiveTab] = useState('campaigns');
  const router = useRouter();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Kampanya Yönetimi</h1>
        
        <Link 
          href="/kampanyalar" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Kampanyalar Sayfasına Dön
        </Link>
      </div>
      
      {/* Sekme Butonları */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button 
            className={`py-3 px-4 font-medium mr-4 border-b-2 ${
              activeTab === 'campaigns' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('campaigns')}
          >
            Kampanyalar
          </button>
          <button 
            className={`py-3 px-4 font-medium mr-4 border-b-2 ${
              activeTab === 'permissions' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('permissions')}
          >
            Yetkilendirmeler
          </button>
        </nav>
      </div>
      
      {/* Aktif Sekmeye Göre İçerik */}
      {activeTab === 'campaigns' && <CampaignsManagement />}
      {activeTab === 'permissions' && <PermissionsManagement />}
    </div>
  );
}

// Kampanya Yönetimi Bileşeni
function CampaignsManagement() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();

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

  // Kampanya verilerini yükle
  useEffect(() => {
    // API çağrısı simülasyonu
    setTimeout(() => {
      setCampaigns(mockCampaigns);
      setLoading(false);
    }, 500);
  }, []);

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

  // Kampanya düzenleme sayfasına yönlendir
  const handleEditCampaign = (campaignId) => {
    router.push(`/kampanyalar/duzenle/${campaignId}`);
  };

  // Mağaza sayfasına yönlendir
  const navigateToStore = (storeId) => {
    // Mağazayı ID'sine göre bul
    const store = mockStores.find(store => store.id === storeId);
    
    if (store) {
      // Kategori ID'si üzerinden kategori adını bul
      const category = mockCategories.find(cat => cat.id === store.categoryId);
      if (category) {
        // Kategori adına göre yönlendir
        router.push(`/${category.name.toLowerCase()}/${storeId}`);
      } else {
        // Kategori bulunamazsa genel mağaza sayfasına yönlendir
        router.push(`/magaza/${storeId}`);
      }
    } else {
      // Mağaza bulunamazsa ana sayfaya yönlendir
      router.push(`/magaza/${storeId}`);
    }
  };

  // Filtrelenmiş kampanyalar
  const filteredCampaigns = campaigns.filter(campaign => {
    // Durum filtresi
    if (statusFilter !== 'all' && campaign.status !== statusFilter) {
      return false;
    }
    
    // Arama filtresi
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      const storeName = getStoreName(campaign.storeId).toLowerCase();
      return (
        campaign.title.toLowerCase().includes(search) ||
        campaign.description.toLowerCase().includes(search) ||
        storeName.includes(search) ||
        campaign.code.toLowerCase().includes(search)
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-xl font-bold mb-4 md:mb-0">Tüm Kampanyalar</h2>
        
        <Link 
          href="/kampanyalar/olustur" 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + Yeni Kampanya
        </Link>
      </div>
      
      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-full md:w-1/2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Ara</label>
            <input
              type="text"
              id="search"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Başlık, açıklama, mağaza veya kod ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-1/4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tümü</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Kampanya Tablosu */}
      {filteredCampaigns.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Başlık
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mağaza
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kod
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İndirim
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Geçerlilik
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map(campaign => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => navigateToStore(campaign.storeId)}>
                        {campaign.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{campaign.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => navigateToStore(campaign.storeId)}>
                      {getStoreName(campaign.storeId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                        {campaign.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.discountType === 'percent' ? `%${campaign.discount}` : 
                       campaign.discountType === 'amount' ? `${campaign.discount} TL` : 
                       'Ücretsiz Teslimat'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {campaign.status === 'active' ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => toggleCampaignStatus(campaign.id)}
                          className={`px-2 py-1 rounded-md text-white ${
                            campaign.status === 'active' 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {campaign.status === 'active' ? 'Pasifleştir' : 'Aktifleştir'}
                        </button>
                        <button 
                          onClick={() => handleEditCampaign(campaign.id)} 
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                        >
                          Düzenle
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">Aradığınız kriterlere uygun kampanya bulunamadı.</p>
        </div>
      )}
    </div>
  );
}

// Yetkilendirme Yönetimi Bileşeni
function PermissionsManagement() {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [viewPermFilter, setViewPermFilter] = useState('all');
  const [createPermFilter, setCreatePermFilter] = useState('all');

  // Kullanıcı verilerini yükle
  useEffect(() => {
    // API çağrısı simülasyonu
    setTimeout(() => {
      // Admin hariç tüm kullanıcıları al
      const filteredUsers = mockUsers.filter(user => user.role !== 'admin');
      setUsers(filteredUsers);
      
      // Tüm mağazaları al
      setStores(mockStores);
      setLoading(false);
    }, 500);
  }, []);

  // Kullanıcının kampanya görüntüleme yetkisini güncelle
  const toggleViewPermission = (userId) => {
    setUsers(prevUsers =>
      prevUsers.map(user => {
        if (user.id === userId) {
          // Kullanıcının kampanya izinlerini değiştir
          const currentViewPerm = user.modulePermissions.kampanya?.view || false;
          
          return {
            ...user,
            modulePermissions: {
              ...user.modulePermissions,
              kampanya: {
                ...user.modulePermissions.kampanya,
                view: !currentViewPerm
              }
            }
          };
        }
        return user;
      })
    );
  };

  // Kullanıcının kampanya oluşturma yetkisini güncelle
  const toggleCreatePermission = (userId) => {
    setUsers(prevUsers =>
      prevUsers.map(user => {
        if (user.id === userId) {
          // Kullanıcı eğer 'user' rolündeyse kampanya oluşturma yetkisi verilmeyecek
          if (user.role === 'user') {
            // Kullanıcı rolündeki kişilere kampanya oluşturma yetkisi verilmez - admin dahil
            alert('Müşteri kullanıcılara kampanya oluşturma yetkisi verilemez!');
            return user;
          }
          
          // Mağaza kullanıcısı ise yetki değiştirilebilir
          const currentCreatePerm = user.modulePermissions.kampanya?.create || false;
          
          return {
            ...user,
            modulePermissions: {
              ...user.modulePermissions,
              kampanya: {
                ...user.modulePermissions.kampanya,
                view: true, // Oluşturma yetkisi veriliyorsa, görüntüleme yetkisi de otomatik verilir
                create: !currentCreatePerm
              }
            }
          };
        }
        return user;
      })
    );
  };

  // Filtrelenmiş kullanıcılar
  const filteredUsers = users.filter(user => {
    // Rol filtresi
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false;
    }
    
    // Görüntüleme yetkisi filtresi
    if (viewPermFilter !== 'all') {
      const hasViewPerm = user.modulePermissions.kampanya?.view || false;
      if (viewPermFilter === 'yes' && !hasViewPerm) return false;
      if (viewPermFilter === 'no' && hasViewPerm) return false;
    }
    
    // Oluşturma yetkisi filtresi
    if (createPermFilter !== 'all') {
      const hasCreatePerm = user.modulePermissions.kampanya?.create || false;
      if (createPermFilter === 'yes' && !hasCreatePerm) return false;
      if (createPermFilter === 'no' && hasCreatePerm) return false;
    }
    
    // Arama filtresi
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
        <p className="text-gray-600">Veriler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Yetkilendirme Yönetimi</h2>
        <p className="text-gray-600 mb-4">
          Bu sayfadan kullanıcıların ve mağazaların kampanya modülüne erişim yetkileri yönetilebilir.
          <br />
          <span className="text-red-600 font-medium">Not: Müşteri kullanıcılara kampanya oluşturma yetkisi verilemez.</span>
        </p>
      </div>
      
      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="w-full md:w-1/2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Ara</label>
            <input
              type="text"
              id="search"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="İsim veya e-posta ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-1/2">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              id="role"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Tüm Roller</option>
              <option value="user">Müşteri</option>
              <option value="store">Mağaza</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-full md:w-1/2">
            <label htmlFor="viewPerm" className="block text-sm font-medium text-gray-700 mb-1">Görüntüleme Yetkisi</label>
            <select
              id="viewPerm"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={viewPermFilter}
              onChange={(e) => setViewPermFilter(e.target.value)}
            >
              <option value="all">Tüm Kullanıcılar</option>
              <option value="yes">Var</option>
              <option value="no">Yok</option>
            </select>
          </div>
          
          <div className="w-full md:w-1/2">
            <label htmlFor="createPerm" className="block text-sm font-medium text-gray-700 mb-1">Oluşturma Yetkisi</label>
            <select
              id="createPerm"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={createPermFilter}
              onChange={(e) => setCreatePermFilter(e.target.value)}
            >
              <option value="all">Tüm Kullanıcılar</option>
              <option value="yes">Var</option>
              <option value="no">Yok</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Kullanıcı Tablosu */}
      {filteredUsers.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-posta
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Görüntüleme Yetkisi
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oluşturma Yetkisi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">ID: {user.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'user' ? 'bg-blue-100 text-blue-800' : 
                        user.role === 'store' ? 'bg-green-100 text-green-800' : 
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {user.role === 'user' ? 'Müşteri' : 
                         user.role === 'store' ? 'Mağaza' : 
                         'Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={() => toggleViewPermission(user.id)}
                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${
                          user.modulePermissions.kampanya?.view ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      >
                        <span 
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                            user.modulePermissions.kampanya?.view ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        ></span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={() => toggleCreatePermission(user.id)}
                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${
                          user.modulePermissions.kampanya?.create ? 'bg-green-500' : 'bg-gray-200'
                        } ${user.role === 'user' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={user.role === 'user'}
                      >
                        <span 
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                            user.modulePermissions.kampanya?.create ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        ></span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">Aradığınız kriterlere uygun kullanıcı bulunamadı.</p>
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