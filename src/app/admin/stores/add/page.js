'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import AuthGuard from '../../../../components/AuthGuard';

export default function AddStore() {
  return (
    <AuthGuard requiredRole="admin">
      <AddStoreContent />
    </AuthGuard>
  );
}

function AddStoreContent() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    category: 'Yemek',
    description: '',
    workingHours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modulePermissions, setModulePermissions] = useState({
    yemek: false,
    market: false,
    su: false,
    aktuel: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleModulePermissionChange = (module) => {
    setModulePermissions(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Kategori seçimine göre modül izinlerini otomatik olarak ayarla
      let updatedModulePermissions = { ...modulePermissions };
      
      if (formData.category === 'Yemek') {
        updatedModulePermissions.yemek = true;
      } else if (formData.category === 'Market') {
        updatedModulePermissions.market = true;
      } else if (formData.category === 'Su') {
        updatedModulePermissions.su = true;
      } else if (formData.category === 'Aktüel') {
        updatedModulePermissions.aktuel = true;
      }
      
      setModulePermissions(updatedModulePermissions);
      
      // Mağaza kaydı auth context ile yapılıyor
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        'store' // Rol otomatik olarak mağaza
      );

      if (result.success) {
        // Başarılı kayıt durumunda mağaza listesine yönlendir
        router.push('/admin/stores');
      } else {
        setError(result.error || 'Mağaza eklenemedi.');
      }
    } catch (err) {
      setError('Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Yeni Mağaza Ekle</h1>
          <p className="text-gray-600 mt-1">Admin paneli üzerinden yeni bir mağaza oluştur</p>
        </div>
        <Link 
          href="/admin/stores"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Mağaza Listesine Dön
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Mağaza Adı
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mağaza adını girin"
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
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="E-posta adresini girin"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Şifre
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Şifre girin"
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
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Telefon numarasını girin"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Mağaza Kategorisi
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Yemek">Yemek</option>
                <option value="Market">Market</option>
                <option value="Su">Su</option>
                <option value="Aktüel">Aktüel</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Mağaza Açıklaması
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mağaza hakkında kısa bir açıklama girin"
              ></textarea>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Modül Yetkileri</h3>
            <p className="text-gray-500 mb-3 text-sm">Mağazanın görebileceği modülleri seçin. Kategori seçimine göre otomatik olarak belirlenecektir, değiştirebilirsiniz.</p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-yemek"
                    checked={modulePermissions.yemek || formData.category === 'Yemek'}
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
                    checked={modulePermissions.market || formData.category === 'Market'}
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
                    checked={modulePermissions.su || formData.category === 'Su'}
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
                    checked={modulePermissions.aktuel || formData.category === 'Aktüel'}
                    onChange={() => handleModulePermissionChange('aktuel')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="perm-aktuel" className="ml-2 block text-sm text-gray-900">
                    Aktüel Modülü
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Çalışma Saatleri</h3>
            <p className="text-gray-500 mb-3 text-sm">Mağazanın çalışma saatlerini belirleyin.</p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-6">
                  {Object.entries({
                    monday: 'Pazartesi',
                    tuesday: 'Salı', 
                    wednesday: 'Çarşamba',
                    thursday: 'Perşembe',
                    friday: 'Cuma',
                    saturday: 'Cumartesi',
                    sunday: 'Pazar'
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-4">
                      <div className="w-24 text-sm font-medium text-gray-700">
                        {label}
                      </div>
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="checkbox"
                          id={`${key}_open`}
                          checked={formData.workingHours[key] !== 'Kapalı' && formData.workingHours[key] !== '' && formData.workingHours[key] !== 'Geçici Kapalı'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                workingHours: {
                                  ...prev.workingHours,
                                  [key]: '09:00 - 18:00'
                                }
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                workingHours: {
                                  ...prev.workingHours,
                                  [key]: 'Kapalı'
                                }
                              }));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`${key}_open`} className="text-sm text-gray-600 w-12">
                          Açık
                        </label>
                        
                        {formData.workingHours[key] !== 'Kapalı' && formData.workingHours[key] !== '' && formData.workingHours[key] !== 'Geçici Kapalı' && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="time"
                              value={formData.workingHours[key]?.split(' - ')[0] || '09:00'}
                              onChange={(e) => {
                                const endTime = formData.workingHours[key]?.split(' - ')[1] || '18:00';
                                setFormData(prev => ({
                                  ...prev,
                                  workingHours: {
                                    ...prev.workingHours,
                                    [key]: `${e.target.value} - ${endTime}`
                                  }
                                }));
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                              type="time"
                              value={formData.workingHours[key]?.split(' - ')[1] || '18:00'}
                              onChange={(e) => {
                                const startTime = formData.workingHours[key]?.split(' - ')[0] || '09:00';
                                setFormData(prev => ({
                                  ...prev,
                                  workingHours: {
                                    ...prev.workingHours,
                                    [key]: `${startTime} - ${e.target.value}`
                                  }
                                }));
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  workingHours: {
                                    ...prev.workingHours,
                                    [key]: 'Geçici Kapalı'
                                  }
                                }));
                              }}
                              className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs hover:bg-orange-200"
                            >
                              Geçici Kapat
                            </button>
                          </div>
                        )}
                        
                        {formData.workingHours[key] === 'Geçici Kapalı' && (
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm">
                              Geçici Kapalı
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  workingHours: {
                                    ...prev.workingHours,
                                    [key]: '09:00 - 18:00'
                                  }
                                }));
                              }}
                              className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                            >
                              Yeniden Aç
                            </button>
                          </div>
                        )}
                        
                        {formData.workingHours[key] === 'Kapalı' && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                            Kapalı
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  • Çalışma saatlerini belirlemek için önce "Açık" seçeneğini işaretleyin<br/>
                  • "Geçici Kapat" ile o günü geçici olarak kapatabilirsiniz<br/>
                  • Zaman formatı: 09:00 - 18:00 şeklinde olmalıdır
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Link
              href="/admin/stores"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Kaydediliyor...' : 'Mağaza Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 