'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api'; // API servisini import et
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
              activeTab === 'applications' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('applications')}
          >
            Başvurular
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
      {activeTab === 'applications' && <ApplicationsManagement />}
      {activeTab === 'permissions' && <PermissionsManagement />}
    </div>
  );
}

// Kampanya Yönetimi Bileşeni
function CampaignsManagement() {
  const [campaigns, setCampaigns] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();

  // Mağaza adını ID'ye göre bul
  const getStoreName = (storeId) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : 'Bilinmeyen Mağaza';
  };

  // Kategori adını ID'ye göre bul
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Genel';
  };

  // Kampanya verilerini yükle
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const campaignsData = await api.getCampaigns();
        const storesData = await api.getStores();
        const categoriesData = await api.getCategories();
        setCampaigns(campaignsData);
        setStores(storesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Kampanya verileri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Kampanya durumunu güncelle
  const toggleCampaignStatus = async (campaignId, currentStatus) => {
    try {
      const newIsActive = !currentStatus; // is_active boolean değeri
      await api.updateCampaign(campaignId, { is_active: newIsActive });
      setCampaigns(prevCampaigns =>
        prevCampaigns.map(campaign => 
          campaign.id === campaignId ? { ...campaign, is_active: newIsActive } : campaign
        )
      );
    } catch (error) {
      console.error("Kampanya durumu güncellenirken hata:", error);
      alert('Kampanya durumu güncellenemedi.');
    }
  };

  // Kampanya düzenleme sayfasına yönlendir
  const handleEditCampaign = (campaignId) => {
    router.push(`/kampanyalar/duzenle/${campaignId}`);
  };

  // Mağaza sayfasına yönlendir
  const navigateToStore = (storeId) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
      const category = categories.find(cat => cat.id === store.category_id);
      if (category) {
        router.push(`/${category.name.toLowerCase()}/store/${store.id}`);
      } else {
        router.push(`/magaza/store/${store.id}`);
      }
    } else {
      router.push(`/magaza/store/${storeId}`);
    }
  };

  // Filtrelenmiş kampanyalar
  const filteredCampaigns = campaigns.filter(campaign => {
    if (statusFilter !== 'all') {
      const isActiveFilter = statusFilter === 'active';
      if (campaign.is_active !== isActiveFilter) {
      return false;
      }
    }
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      const storeName = getStoreName(campaign.store_id).toLowerCase();
      return (
        campaign.name.toLowerCase().includes(search) ||
        campaign.description.toLowerCase().includes(search) ||
        storeName.includes(search) ||
        (campaign.code && campaign.code.toLowerCase().includes(search))
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
      
      {/* Kampanya Kartları */}
      {filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map(campaign => (
            <div key={campaign.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Banner Görseli */}
              <div className="relative h-48 bg-gray-100">
                {campaign.banner_image_url ? (
                  <img 
                    src={campaign.banner_image_url} 
                    alt={campaign.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/banners/default.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c1.5-2 4.5-2 6 0s2 4.5 0 6H13l-4 4-2-2.5L7 7z" />
                    </svg>
                  </div>
                )}
                
                {/* Durum Badge'i */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    campaign.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {campaign.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                
                {/* Kategori Badge'i */}
                {campaign.campaign_category && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {campaign.campaign_category}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Kampanya Bilgileri */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{campaign.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{campaign.description}</p>
                
                {/* İndirim Bilgisi */}
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">İndirim:</span>
                    <span className="font-medium text-orange-600">
                      {campaign.type === 'percentage' ? `%${campaign.value}` : 
                       campaign.type === 'amount' ? `${campaign.value} TL` : 
                       'Ücretsiz Teslimat'}
                    </span>
                      </div>
                  {campaign.code && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-500">Kod:</span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                        {campaign.code}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Mağaza Bilgisi */}
                {campaign.store_id && (
                  <div className="mb-3">
                    <span className="text-sm text-gray-500">Mağaza: </span>
                    <span 
                      className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm"
                      onClick={() => navigateToStore(campaign.store_id)}
                    >
                      {getStoreName(campaign.store_id)}
                      </span>
                  </div>
                )}
                
                {/* Tarih Bilgisi */}
                <div className="text-xs text-gray-500 mb-4">
                  {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                </div>
                
                {/* İşlem Butonları */}
                <div className="flex space-x-2">
                        <button 
                    onClick={() => toggleCampaignStatus(campaign.id, campaign.is_active)}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      campaign.is_active 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {campaign.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                        </button>
                        <button 
                          onClick={() => handleEditCampaign(campaign.id)} 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                        >
                          Düzenle
                        </button>
                      </div>
              </div>
            </div>
                ))}
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [viewPermFilter, setViewPermFilter] = useState('all');
  const [createPermFilter, setCreatePermFilter] = useState('all');

  // Kullanıcı verilerini yükle
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const allUsers = await api.getAllUsers();
        const filteredUsers = allUsers.filter(user => user.role !== 'admin');
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Kullanıcı yetki verileri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Kullanıcının kampanya görüntüleme yetkisini güncelle
  const toggleViewPermission = async (userId, currentPermissions) => {
    try {
      const newViewPerm = !(currentPermissions?.kampanya?.view || false);
      // updateUserPermissions API'de olmalı
      await api.updateUser(userId, { 
        module_permissions: { 
          ...currentPermissions, 
          kampanya: { ...currentPermissions?.kampanya, view: newViewPerm } 
        }
      }); 
      setUsers(prevUsers =>
        prevUsers.map(user => 
          user.id === userId ? { 
            ...user, 
            module_permissions: { 
              ...user.module_permissions, 
              kampanya: { ...user.module_permissions?.kampanya, view: newViewPerm }
            }
          } : user
        )
      );
    } catch (error) {
      console.error("Görüntüleme yetkisi güncellenirken hata:", error);
      alert('Görüntüleme yetkisi güncellenemedi.');
    }
  };

  // Kullanıcının kampanya oluşturma yetkisini güncelle
  const toggleCreatePermission = async (userId, currentPermissions, userRole) => {
    if (userRole === 'user') {
      alert('Müşteri kullanıcılara kampanya oluşturma yetkisi verilemez!');
      return;
    }
    try {
      const newCreatePerm = !(currentPermissions?.kampanya?.create || false);
      const newViewPerm = newCreatePerm ? true : (currentPermissions?.kampanya?.view || false); 
      // updateUserPermissions API'de olmalı
      await api.updateUser(userId, { 
        module_permissions: { 
          ...currentPermissions, 
          kampanya: { ...currentPermissions?.kampanya, create: newCreatePerm, view: newViewPerm } 
        } 
      });
      setUsers(prevUsers =>
        prevUsers.map(user => 
          user.id === userId ? { 
            ...user, 
            module_permissions: { 
              ...user.module_permissions, 
              kampanya: { ...user.module_permissions?.kampanya, create: newCreatePerm, view: newViewPerm }
            }
          } : user
        )
      );
    } catch (error) {
      console.error("Oluşturma yetkisi güncellenirken hata:", error);
      alert('Oluşturma yetkisi güncellenemedi.');
    }
  };

  // Filtrelenmiş kullanıcılar
  const filteredUsers = users.filter(user => {
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false;
    }
    if (viewPermFilter !== 'all') {
      const hasViewPerm = user.module_permissions?.kampanya?.view || false;
      if (viewPermFilter === 'yes' && !hasViewPerm) return false;
      if (viewPermFilter === 'no' && hasViewPerm) return false;
    }
    if (createPermFilter !== 'all') {
      const hasCreatePerm = user.module_permissions?.kampanya?.create || false;
      if (createPermFilter === 'yes' && !hasCreatePerm) return false;
      if (createPermFilter === 'no' && hasCreatePerm) return false;
    }
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      return (
        (user.name && user.name.toLowerCase().includes(search)) ||
        (user.email && user.email.toLowerCase().includes(search))
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
              <thead className="bg-gray-50 dark:bg-gray-900">
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
                  <tr key={user.id} className="hover:bg-gray-50 dark:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">ID: {user.id.substring(0,8)}...</div>
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
                        onClick={() => toggleViewPermission(user.id, user.module_permissions)}
                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${
                          user.module_permissions?.kampanya?.view ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      >
                        <span 
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                            user.module_permissions?.kampanya?.view ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        ></span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={() => toggleCreatePermission(user.id, user.module_permissions, user.role)}
                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${
                          user.module_permissions?.kampanya?.create ? 'bg-green-500' : 'bg-gray-200'
                        } ${user.role === 'user' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={user.role === 'user'}
                      >
                        <span 
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                            user.module_permissions?.kampanya?.create ? 'translate-x-5' : 'translate-x-0'
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



// Kampanya Başvuruları Yönetimi Bileşeni
function ApplicationsManagement() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();

  // Başvuru verilerini yükle
  useEffect(() => {
    async function fetchApplications() {
      try {
        setLoading(true);
        const applicationsData = await api.getCampaignApplications();
        setApplications(applicationsData);
      } catch (error) {
        console.error("Başvuru verileri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  // Başvuruyu onayla
  const approveApplication = async (applicationId) => {
    try {
      const updatedApplication = await api.approveCampaignApplication(applicationId, user.id);
      setApplications(prevApplications =>
        prevApplications.map(app => 
          app.id === applicationId ? { ...app, ...updatedApplication } : app
        )
      );
    } catch (error) {
      console.error("Başvuru onaylanırken hata:", error);
      alert('Başvuru onaylanamadı.');
    }
  };

  // Başvuruyu reddet
  const rejectApplication = async (applicationId, notes = '') => {
    try {
      const updatedApplication = await api.rejectCampaignApplication(applicationId, user.id, notes);
      setApplications(prevApplications =>
        prevApplications.map(app => 
          app.id === applicationId ? { ...app, ...updatedApplication } : app
        )
      );
    } catch (error) {
      console.error("Başvuru reddedilirken hata:", error);
      alert('Başvuru reddedilemedi.');
    }
  };

  // Filtrelenmiş başvurular
  const filteredApplications = applications.filter(application => {
    if (statusFilter !== 'all' && application.status !== statusFilter) {
      return false;
    }
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      return (
        application.campaign?.name?.toLowerCase().includes(search) ||
        application.store?.name?.toLowerCase().includes(search)
      );
    }
    return true;
  });

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
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Kampanya Başvuruları</h2>
        <p className="text-gray-600">Mağazaların kampanyalara katılım başvurularını yönetin</p>
      </div>
      
      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-full md:w-1/2">
            <label htmlFor="appSearch" className="block text-sm font-medium text-gray-700 mb-1">Ara</label>
            <input
              type="text"
              id="appSearch"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kampanya veya mağaza adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-1/2">
            <label htmlFor="appStatus" className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
            <select
              id="appStatus"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tüm Durumlar</option>
              <option value="pending">Beklemede</option>
              <option value="approved">Onaylandı</option>
              <option value="rejected">Reddedildi</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Başvuru Tablosu */}
      {filteredApplications.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mağaza
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kampanya
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Başvuru Tarihi
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
                {filteredApplications.map(application => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{application.store?.name}</div>
                      <div className="text-sm text-gray-500">ID: {application.store_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{application.campaign?.name}</div>
                      <div className="text-sm text-gray-500">{application.campaign?.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(application.applied_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {application.status === 'pending' ? 'Beklemede' :
                         application.status === 'approved' ? 'Onaylandı' :
                         'Reddedildi'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {application.status === 'pending' && (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => approveApplication(application.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                          >
                            Onayla
                          </button>
                          <button
                            onClick={() => rejectApplication(application.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                          >
                            Reddet
                          </button>
                        </div>
                      )}
                      {application.status !== 'pending' && (
                        <span className="text-gray-400 text-sm">
                          {formatDate(application.reviewed_at)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">Aradığınız kriterlere uygun başvuru bulunamadı.</p>
        </div>
      )}
    </div>
  );
}

// Tarih formatlama fonksiyonu
function formatDate(dateString) {
  if (!dateString) return ''; // Eğer tarih yoksa boş string döndür
  const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('tr-TR', options);
} 
