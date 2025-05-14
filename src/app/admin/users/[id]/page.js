'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import AuthGuard from '../../../../components/AuthGuard';
import { mockUsers } from '@/app/data/mockdatas';

export default function UserDetails() {
  return (
    <AuthGuard requiredRole="admin">
      <UserDetailsContent />
    </AuthGuard>
  );
}

function UserDetailsContent() {
  const params = useParams();
  const userId = params.id ? parseInt(params.id) : null;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  
  // Kullanıcı modülleri yetkileri
  const [modulePermissions, setModulePermissions] = useState({
    yemek: true,
    market: true,
    su: true,
    aktuel: false
  });

  useEffect(() => {
    // Mock API isteği
    const fetchUser = () => {
      setLoading(true);
      setTimeout(() => {
        // Gerçek bir API'den veri çekilecek
        const foundUser = mockUsers.find(u => u.id === userId);
        
        if (foundUser) {
          // Modül yetkilerini ayarla
          if (foundUser.modulePermissions) {
            setModulePermissions(foundUser.modulePermissions);
          }
          setUser(foundUser);
        }
        
        setLoading(false);
      }, 1000);
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleModulePermissionChange = (module) => {
    setModulePermissions(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
  };

  const savePermissions = () => {
    // Gerçek uygulamada API'ye kaydedilecek
    alert('Modül yetkileri kaydedildi!');
    // Burada user bilgisi içindeki modulePermissions de güncellenebilir
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
        {/* Kullanıcı özeti */}
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-semibold">
                {user.name.charAt(0)}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {user.role === 'admin' ? (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Admin</span>
                ) : user.role === 'store' ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Mağaza</span>
                ) : (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Müşteri</span>
                )}
                {user.status === 'active' ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Aktif</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Pasif</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sekmeler */}
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

        {/* Sekme içerikleri */}
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
                    <p>{user.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Kayıt Tarihi</span>
                    <p>{new Date(user.registrationDate).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Kullanım İstatistikleri</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Toplam Sipariş</span>
                    <p>{user.ordersCount}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Aktif Sipariş</span>
                    <p>{user.activeOrder}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Toplam Harcama</span>
                    <p>{user.totalSpent} TL</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Son Giriş</span>
                    <p>{new Date(user.lastLogin).toLocaleString('tr-TR')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Kayıtlı Adresler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.addresses.map((address) => (
                  <div key={address.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <span className="font-semibold">{address.title}</span>
                        {address.isDefault && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">Varsayılan</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm">{address.fullName}</p>
                    <p className="text-sm">{address.phone}</p>
                    <p className="text-sm mt-2">
                      {address.neighborhood}, {address.fullAddress}, {address.district}/{address.city}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Sipariş Geçmişi</h3>
              <p className="text-gray-500">Kullanıcı sipariş geçmişi burada listelenecek.</p>
              {/* Siparişler listelenecek */}
            </div>
          )}

          {activeTab === 'permissions' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Modül Yetkileri</h3>
              <p className="text-gray-500 mb-4">Kullanıcının görebileceği modülleri seçin.</p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="perm-yemek"
                      checked={modulePermissions.yemek}
                      onChange={() => handleModulePermissionChange('yemek')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="perm-yemek" className="ml-2 block text-sm text-gray-900">
                      Yemek Modülü
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="perm-market"
                      checked={modulePermissions.market}
                      onChange={() => handleModulePermissionChange('market')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="perm-market" className="ml-2 block text-sm text-gray-900">
                      Market Modülü
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="perm-su"
                      checked={modulePermissions.su}
                      onChange={() => handleModulePermissionChange('su')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="perm-su" className="ml-2 block text-sm text-gray-900">
                      Su Modülü
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="perm-aktuel"
                      checked={modulePermissions.aktuel}
                      onChange={() => handleModulePermissionChange('aktuel')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="perm-aktuel" className="ml-2 block text-sm text-gray-900">
                      Aktüel Modülü
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={savePermissions}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Yetkileri Kaydet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 