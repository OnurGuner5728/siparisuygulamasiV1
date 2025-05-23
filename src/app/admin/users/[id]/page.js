'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import { use } from 'react';

export default function UserDetailPage({ params: promiseParams }) {
  return (
    <AuthGuard requiredRole="admin">
      <UserDetailContent promiseParams={promiseParams} />
    </AuthGuard>
  );
}

function UserDetailContent({ promiseParams }) {
  const params = use(promiseParams);
  const router = useRouter();
  const userId = params.id;
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  
  const [modulePermissions, setModulePermissions] = useState({
    yemek: false,
    market: false,
    su: false,
    aktuel: false
  });
  const [originalPermissions, setOriginalPermissions] = useState({});
  
  // Kullanıcı düzenleme modalı için state'ler
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    status: '',
    avatar_url: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        setError("Kullanıcı ID'si bulunamadı.");
        return;
      }
      setLoading(true);
      try {
        const userData = await api.getUserById(userId);
        if (userData) {
          setUser(userData);
          if (userData.module_permissions) {
            setModulePermissions(userData.module_permissions);
            setOriginalPermissions(userData.module_permissions);
          }
          const userAddresses = await api.getUserAddresses(userId);
          setAddresses(userAddresses || []);
          const userOrders = await api.getUserOrders(userId);
          setOrders(userOrders || []);

        } else {
          setError("Kullanıcı bulunamadı.");
        }
      } catch (err) {
        console.error("Kullanıcı verileri yüklenirken hata:", err);
        setError("Kullanıcı verileri yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Kullanıcı adını ad ve soyad olarak parçalama
  useEffect(() => {
    if (user) {
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setEditFormData({
        first_name: user.first_name || firstName,
        last_name: user.last_name || lastName,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
        status: user.status || 'active',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);

  // Ad ve soyad değiştiğinde tam adı güncelle
  useEffect(() => {
    const fullName = `${editFormData.first_name} ${editFormData.last_name}`.trim();
    if (fullName !== editFormData.name) {
      setEditFormData(prev => ({
        ...prev,
        name: fullName
      }));
    }
  }, [editFormData.first_name, editFormData.last_name]);

  const handleModulePermissionChange = (moduleKey) => {
    setModulePermissions(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  const savePermissions = async () => {
    if (!user) return;
    try {
      await api.updateUser(user.id, { module_permissions: modulePermissions });
      setOriginalPermissions(modulePermissions);
      alert('Modül yetkileri başarıyla güncellendi!');
    } catch (err) {
      console.error("Yetki güncelleme hatası:", err);
      alert('Modül yetkileri güncellenirken bir hata oluştu.');
      setModulePermissions(originalPermissions);
    }
  };
  
  const handleUpdateUserStatus = async (newStatus) => {
    if(!user) return;
    try {
      const updatedUser = await api.updateUser(user.id, { status: newStatus });
      setUser(updatedUser);
      alert(`Kullanıcı durumu ${newStatus} olarak güncellendi.`);
    } catch (error) {
      console.error("Kullanıcı durumu güncellenirken hata:", error);
      alert('Kullanıcı durumu güncellenemedi.');
    }
  };

  const handleDeleteUser = async () => {
    if(!user) return;
    if (window.confirm('Bu kullanıcıyı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        await api.deleteUser(user.id);
        alert('Kullanıcı başarıyla silindi.');
        router.push('/admin/users');
      } catch (error) {
        console.error("Kullanıcı silinirken hata:", error);
        alert('Kullanıcı silinirken bir hata oluştu.');
      }
    }
  };

  // Modal form değişikliklerini işle
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Kullanıcı düzenleme formunu gönder
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');

    try {
      const updatedUser = await api.updateUser(user.id, {
        first_name: editFormData.first_name,
        last_name: editFormData.last_name,
        name: editFormData.name,
        phone: editFormData.phone,
        role: editFormData.role,
        status: editFormData.status,
        avatar_url: editFormData.avatar_url
      });

      setUser(updatedUser);
      setIsEditModalOpen(false);
      alert('Kullanıcı bilgileri başarıyla güncellendi.');
    } catch (error) {
      console.error('Kullanıcı düzenleme hatası:', error);
      setEditError('Kullanıcı bilgileri güncellenirken bir hata oluştu.');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          Kullanıcı bulunamadı.
        </div>
        <div className="mt-4">
          <Link 
            href="/admin/users"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kullanıcı Listesine Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Kullanıcı Detayı</h1>
          <p className="text-gray-600 mt-1">ID: {user.id}</p>
        </div>
        <Link 
          href="/admin/users"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kullanıcı Listesine Dön
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-semibold">
                {user.name.charAt(0)}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 items-center">
                {user.role === 'admin' ? (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">Admin</span>
                ) : user.role === 'store_owner' ? (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">Mağaza Sahibi</span>
                ) : user.role === 'user' ? (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">Müşteri</span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">{user.role}</span>
                )}
                
                {user.status === 'active' ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Aktif</span>
                ) : user.status === 'inactive' ? (
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-semibold">Pasif</span>
                ) :  user.status === 'banned' ? (
                   <span className="px-3 py-1 bg-red-200 text-red-900 rounded-full text-sm font-semibold">Yasaklı</span>
                ) : (
                   <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">{user.status || 'Bilinmiyor'}</span>
                )}
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <p>Email: {user.email}</p>
                {user.phone && <p>Telefon: {user.phone}</p>}
              </div>
            </div>
            <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2 items-stretch md:items-end">
                <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-full md:w-auto text-sm"
                >
                    Düzenle
                </button>
                {user.status === 'active' && (
                    <button 
                        onClick={() => handleUpdateUserStatus('inactive')}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded w-full md:w-auto text-sm"
                    >
                        Pasif Yap
                    </button>
                )}
                {user.status === 'inactive' && (
                    <button 
                        onClick={() => handleUpdateUserStatus('active')}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded w-full md:w-auto text-sm"
                    >
                        Aktif Yap
                    </button>
                )}
                 <button 
                    onClick={() => handleUpdateUserStatus('banned')}
                    className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded w-full md:w-auto text-sm mt-2"
                >
                    Yasakla
                </button>
                <button 
                    onClick={handleDeleteUser}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded w-full md:w-auto text-sm mt-2"
                >
                    Kullanıcıyı Sil
                </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 border-b">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Profil Bilgileri
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'addresses'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Adresler
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'orders'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Siparişler
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'permissions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Yetkiler
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Kişisel Bilgiler</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Ad Soyad</span>
                    <p>{user.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">E-posta</span>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Telefon</span>
                    <p>{user.phone || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Kayıt Tarihi</span>
                    <p>{user.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : '-'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Kullanım İstatistikleri</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Toplam Sipariş Sayısı</span>
                    <p>{orders.length}</p>
                  </div>
                   <div>
                    <span className="text-sm text-gray-500">Toplam Harcama</span>
                    <p>
                      {orders.reduce((acc, order) => acc + (order.total_amount || 0), 0).toFixed(2)} TL
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Son Giriş</span>
                    <p>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('tr-TR') : 'Bilinmiyor'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Kayıtlı Adresler ({addresses.length})</h3>
              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800">{address.title || 'Adsız Adres'}</h4>
                        {address.is_default && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Varsayılan</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{address.address_line1}</p>
                      {address.address_line2 && <p className="text-sm text-gray-600">{address.address_line2}</p>}
                      <p className="text-sm text-gray-600">{address.city}, {address.postal_code}</p>
                      <p className="text-sm text-gray-600">{address.country}</p>
                      {address.phone && <p className="text-sm text-gray-600 mt-1">Tel: {address.phone}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Bu kullanıcı için kayıtlı adres bulunmamaktadır.</p>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Verilen Siparişler ({orders.length})</h3>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                        <Link href={`/admin/orders/${order.id}`} className="font-semibold text-blue-600 hover:underline">
                          Sipariş ID: {order.id.substring(0,8)}...
                        </Link>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ 
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'out_for_delivery' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status ? order.status.replace('-', ' ').replace('_', ' ').toUpperCase() : 'BİLİNMİYOR'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Tarih: {new Date(order.order_date).toLocaleString('tr-TR')}
                      </p>
                      <p className="text-sm text-gray-600">
                        Mağaza: {order.store?.name || (order.store_id ? order.store_id.substring(0,8) + "..." : 'Bilinmiyor')}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        Toplam Tutar: {(order.total_amount || 0).toFixed(2)} TL
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Ürün Sayısı: {order.order_items?.reduce((sum, item) => sum + item.count, 0) || 0}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Bu kullanıcı hiç sipariş vermemiş.</p>
              )}
            </div>
          )}

          {activeTab === 'permissions' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Modül Yetkileri</h3>
              <p className="text-sm text-gray-600 mb-4">Kullanıcının hangi ana modüllere erişebileceğini belirleyin.</p>
              <div className="space-y-3">
                {Object.keys(modulePermissions).map((moduleKey) => (
                  <div key={moduleKey} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                    <span className="capitalize font-medium text-gray-700">{moduleKey.replace('aktuel', 'Aktüel')}</span>
                    <label htmlFor={`permission-${moduleKey}`} className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          id={`permission-${moduleKey}`}
                          className="sr-only" 
                          checked={modulePermissions[moduleKey] || false}
                          onChange={() => handleModulePermissionChange(moduleKey)}
                        />
                        <div className={`block w-10 h-6 rounded-full transition ${modulePermissions[moduleKey] ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${modulePermissions[moduleKey] ? 'translate-x-full' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={savePermissions}
                  disabled={JSON.stringify(modulePermissions) === JSON.stringify(originalPermissions)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Yetkileri Kaydet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kullanıcı Düzenleme Modalı */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Kullanıcı Bilgilerini Düzenle</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="p-6">
                {editError && (
                  <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
                    {editError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Ad
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={editFormData.first_name}
                      onChange={handleEditFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Soyad
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={editFormData.last_name}
                      onChange={handleEditFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Tam Ad (Otomatik Oluşturulur)
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editFormData.name}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-posta Adresi
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editFormData.email}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon Numarası
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Kullanıcı Rolü
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={editFormData.role}
                      onChange={handleEditFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="user">Müşteri</option>
                      <option value="store">Mağaza</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Durum
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Pasif</option>
                      <option value="banned">Yasaklı</option>
                      <option value="pending">Onay Bekliyor</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 mb-1">
                      Profil Resmi URL
                    </label>
                    <input
                      type="text"
                      id="avatar_url"
                      name="avatar_url"
                      value={editFormData.avatar_url}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                    editLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {editLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 