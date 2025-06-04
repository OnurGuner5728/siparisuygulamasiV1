'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';

export default function StoreProfile() {
  return (
    <AuthGuard requiredRole="store">
      <StoreProfileContent />
    </AuthGuard>
  );
}

function StoreProfileContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    logo_url: '',
    banner_url: '',
    delivery_fee: '',
    minimum_order_amount: '',
    minimum_order_for_free_delivery: '',
    delivery_time_min: '',
    delivery_time_max: '',
    address: {
      city: '',
      district: '',
      neighborhood: '',
      fullAddress: ''
    },
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
  const [activeTab, setActiveTab] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // API'den mağaza verilerini yükle
    const fetchStoreData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Kullanıcının mağaza ID'sini kullanarak mağaza bilgilerini getir
        const storeData = await api.getStoreByUserId(user.id);
        
        if (storeData) {
          setStore(storeData);
          
          // Mağaza adres bilgilerini stores tablosundan al
          let addressData = {
            city: storeData.city || '',
            district: storeData.district || '',
            neighborhood: storeData.neighborhood || '',
            fullAddress: storeData.address || ''
          };
          
          // WorkingHours parse işlemi
          let workingHoursData = {
            monday: '',
            tuesday: '',
            wednesday: '',
            thursday: '',
            friday: '',
            saturday: '',
            sunday: ''
          };
          
          if (storeData.workingHours) {
            try {
              const parsedWorkingHours = typeof storeData.workingHours === 'string' 
                ? JSON.parse(storeData.workingHours) 
                : storeData.workingHours;
              workingHoursData = {
                monday: parsedWorkingHours?.monday || '',
                tuesday: parsedWorkingHours?.tuesday || '',
                wednesday: parsedWorkingHours?.wednesday || '',
                thursday: parsedWorkingHours?.thursday || '',
                friday: parsedWorkingHours?.friday || '',
                saturday: parsedWorkingHours?.saturday || '',
                sunday: parsedWorkingHours?.sunday || ''
              };
            } catch (parseError) {
              console.log('WorkingHours JSON parse hatası, varsayılan değerler kullanılıyor:', parseError);
              // Parse edilemezse varsayılan boş değerler kullanılır
            }
          }
          
          setFormData({
            name: storeData.name || '',
            email: storeData.email || user.email || '', // Kullanıcı email'i ile senkronize
            phone: storeData.phone || '',
            description: storeData.description || '',
            logo_url: storeData.logo_url || '',
            banner_url: storeData.banner_url || '',
            delivery_fee: storeData.delivery_fee || '',
            minimum_order_amount: storeData.minimum_order_amount || '',
            minimum_order_for_free_delivery: storeData.minimum_order_for_free_delivery || '',
            delivery_time_min: storeData.delivery_time_min || '',
            delivery_time_max: storeData.delivery_time_max || '',
            address: addressData,
            workingHours: workingHoursData
          });
        } else {
          setError('Mağaza bilgileri bulunamadı');
        }
      } catch (err) {
        console.error('Mağaza bilgileri yüklenirken hata:', err);
        setError('Mağaza bilgileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [user]);

  // Logo yükleme fonksiyonu
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Dosya boyutu kontrolü (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Dosya boyutu 5MB\'dan büyük olamaz.');
      return;
    }

    // Dosya formatı kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Sadece JPG, PNG, GIF ve WebP formatındaki resimler yüklenebilir.');
      return;
    }

    setUploadingLogo(true);
    setError('');

    try {
      // Eski resmi sil (eğer varsa)
      if (formData.logo_url) {
        try {
          await api.deleteImage(formData.logo_url, 'stores');
        } catch (deleteError) {
          console.log('Eski logo silinirken hata (normal olabilir):', deleteError);
        }
      }

      // Yeni resmi yükle
      const imageUrl = await api.uploadImage(file, 'stores');
      setFormData(prev => ({ ...prev, logo_url: imageUrl }));
      
      // Lokalize success mesajı - global state'i etkilemez
      console.log('Logo başarıyla yüklendi:', imageUrl);
    } catch (error) {
      console.error('Logo yükleme hatası:', error);
      setError('Logo yüklenirken bir hata oluştu: ' + error.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Banner yükleme fonksiyonu
  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Dosya boyutu kontrolü (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu 10MB\'dan büyük olamaz.');
      return;
    }

    // Dosya formatı kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Sadece JPG, PNG, GIF ve WebP formatındaki resimler yüklenebilir.');
      return;
    }

    setUploadingBanner(true);
    setError('');

    try {
      // Eski banner'ı sil (eğer varsa)
      if (formData.banner_url) {
        try {
          await api.deleteImage(formData.banner_url, 'stores');
        } catch (deleteError) {
          console.log('Eski banner silinirken hata (normal olabilir):', deleteError);
        }
      }

      // Yeni resmi yükle
      const imageUrl = await api.uploadImage(file, 'stores');
      setFormData(prev => ({ ...prev, banner_url: imageUrl }));
      
      // Lokalize success mesajı - global state'i etkilemez
      console.log('Banner başarıyla yüklendi:', imageUrl);
    } catch (error) {
      console.error('Banner yükleme hatası:', error);
      setError('Banner yüklenirken bir hata oluştu: ' + error.message);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    setError('');

    try {
      console.log('Update edilecek form data:', formData);
      console.log('Store ID:', store.id);
      
      // Güncellenecek verileri hazırla
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        description: formData.description,
        logo_url: formData.logo_url,
        banner_url: formData.banner_url,
        delivery_fee: formData.delivery_fee,
        minimum_order_amount: formData.minimum_order_amount,
        minimum_order_for_free_delivery: formData.minimum_order_for_free_delivery,
        delivery_time_min: formData.delivery_time_min,
        delivery_time_max: formData.delivery_time_max,
        city: formData.address.city,
        district: formData.address.district,
        neighborhood: formData.address.neighborhood,
        address: formData.address.fullAddress,
        workingHours: JSON.stringify(formData.workingHours)
      };
      
      console.log('Update API\'ye gönderilecek data:', updateData);
      
      // Mağaza verilerini güncelle
      const updatedStore = await api.updateStore(store.id, updateData);
      
      console.log('API\'den dönen updatedStore:', updatedStore);
      setStore(updatedStore);
      setSuccess('Bilgileriniz başarıyla güncellendi.');
    } catch (err) {
      console.error('Mağaza güncelleme hatası:', err);
      setError('Bilgileriniz güncellenirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!store) return;
    
    setSubmitting(true);
    try {
      const newStatus = store.status === 'active' ? 'inactive' : 'active';
      const updatedStore = await api.updateStoreStatus(store.id, newStatus);
      
      setStore(updatedStore);
      setSuccess(`Mağaza durumu ${newStatus === 'active' ? 'aktif' : 'pasif'} olarak güncellendi.`);
    } catch (err) {
      console.error('Mağaza durumu güncellenirken hata:', err);
      setError('Mağaza durumu değiştirilirken bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  // Mağaza onaylanmamışsa özel ekran göster - tüm hooks'lardan sonra
  if (!user?.storeInfo?.is_approved) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-orange-500 text-5xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Mağaza Onayı Gerekli</h2>
            <p className="text-gray-600 mb-4">
              Mağaza profilinizi düzenlemek için önce mağazanızın onaylanması gerekiyor.
            </p>
            <Link
              href="/store"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Ana Panele Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mağaza Profili</h1>
          <p className="text-gray-600 mt-1">Bilgilerinizi görüntüleyin ve güncelleyin</p>
        </div>
        <Link 
          href="/store"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Panele Dön
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Mağaza özeti */}
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-semibold">
                {store?.name?.charAt(0) || '?'}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{store?.name || 'Mağaza Adı'}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  {typeof store?.category === 'object' ? store?.category?.name || 'Kategori' : store?.category || 'Kategori'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  store?.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {store?.status === 'active' ? 'Aktif' : 'Pasif'}
                </span>
                {!store?.is_approved && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Onay Bekliyor
                  </span>
                )}
                <div className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  <span className="mr-1">{store?.rating || '0.0'}</span>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={handleToggleStatus}
                className={`px-4 py-2 rounded-md ${
                  store?.status === 'active' 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                disabled={!store?.is_approved}
              >
                {store?.status === 'active' ? 'Mağazayı Kapat' : 'Mağazayı Aç'}
              </button>
            </div>
          </div>
        </div>

        {/* Sekmeler */}
        <div className="bg-gray-50 dark:bg-gray-900 px-6 border-b">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'general'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Genel Bilgiler
            </button>
            <button
              onClick={() => setActiveTab('address')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'address'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Adres Bilgileri
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'hours'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Çalışma Saatleri
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'delivery'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Teslimat Ayarları
            </button>
          </nav>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Genel Bilgiler Formu */}
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <input
                    type="text"
                    id="category"
                    value={typeof store?.category === 'object' ? store?.category?.name || 'Kategori' : store?.category || 'Kategori'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-900"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Kategori değiştirmek için lütfen destek ile iletişime geçin.</p>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
                
                {/* Logo Yükleme */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mağaza Logosu
                  </label>
                  
                  {/* Mevcut Logo Gösterimi */}
                  {formData.logo_url && (
                    <div className="mb-3 flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <img
                          src={formData.logo_url}
                          alt="Mağaza logosu"
                          className="h-12 w-12 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">Mevcut logo</p>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Kaldır
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Dosya Yükleme */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={uploadingLogo}
                    />
                    <label
                      htmlFor="logo-upload"
                      className={`cursor-pointer flex flex-col items-center ${uploadingLogo ? 'opacity-50' : ''}`}
                    >
                      {uploadingLogo ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-1"></div>
                          <span className="text-xs text-gray-600">Yükleniyor...</span>
                        </div>
                      ) : (
                        <>
                          <svg className="h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-xs font-medium text-gray-700">Logo yükle</span>
                          <span className="text-xs text-gray-500">Max 5MB</span>
                        </>
                      )}
                    </label>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    Kare format (200x200px) önerilir.
                  </p>
                </div>

                {/* Banner Yükleme */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mağaza Banner'ı
                  </label>
                  
                  {/* Mevcut Banner Gösterimi */}
                  {formData.banner_url && (
                    <div className="mb-3 flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <img
                          src={formData.banner_url}
                          alt="Mağaza banner'ı"
                          className="h-12 w-20 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">Mevcut banner</p>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, banner_url: '' }))}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Kaldır
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Banner Dosya Yükleme */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="banner-upload"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleBannerUpload}
                      className="hidden"
                      disabled={uploadingBanner}
                    />
                    <label
                      htmlFor="banner-upload"
                      className={`cursor-pointer flex flex-col items-center ${uploadingBanner ? 'opacity-50' : ''}`}
                    >
                      {uploadingBanner ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-1"></div>
                          <span className="text-xs text-gray-600">Yükleniyor...</span>
                        </div>
                      ) : (
                        <>
                          <svg className="h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs font-medium text-gray-700">Banner yükle</span>
                          <span className="text-xs text-gray-500">Max 10MB</span>
                        </>
                      )}
                    </label>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    Yatay format (800x300px) önerilir.
                  </p>
                </div>
              </div>
            )}

            {/* Adres Bilgileri Formu */}
            {activeTab === 'address' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                    Şehir
                  </label>
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="address.district" className="block text-sm font-medium text-gray-700 mb-1">
                    İlçe
                  </label>
                  <input
                    type="text"
                    id="address.district"
                    name="address.district"
                    value={formData.address.district}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="address.neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                    Mahalle
                  </label>
                  <input
                    type="text"
                    id="address.neighborhood"
                    name="address.neighborhood"
                    value={formData.address.neighborhood}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="address.fullAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Adres
                  </label>
                  <textarea
                    id="address.fullAddress"
                    name="address.fullAddress"
                    value={formData.address.fullAddress}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  ></textarea>
                </div>
              </div>
            )}

            {/* Çalışma Saatleri Formu */}
            {activeTab === 'hours' && (
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
                          checked={formData.workingHours[key] !== 'Kapalı' && formData.workingHours[key] !== ''}
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
                        
                        {formData.workingHours[key] !== 'Kapalı' && formData.workingHours[key] !== '' && (
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
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
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
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
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
                  • Değişiklikler otomatik olarak kaydedilir
                </p>
              </div>
            )}

            {/* Teslimat Ayarları Formu */}
            {activeTab === 'delivery' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Teslimat Ayarları</h3>
                      <p className="text-sm text-blue-600 mt-1">
                        Mağazanızın teslimat ücreti ve minimum sipariş tutarını belirleyin.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="delivery_fee" className="block text-sm font-medium text-gray-700 mb-1">
                      Teslimat Ücreti (TL)
                    </label>
                    <input
                      type="number"
                      id="delivery_fee"
                      name="delivery_fee"
                      value={formData.delivery_fee}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="12.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Müşterilerinizden alınacak teslimat ücreti
                    </p>
                  </div>

                  <div>
                    <label htmlFor="minimum_order_amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Sipariş Tutarı (TL)
                    </label>
                    <input
                      type="number"
                      id="minimum_order_amount"
                      name="minimum_order_amount"
                      value={formData.minimum_order_amount}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="30.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Sipariş verebilmek için gereken minimum tutar
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="minimum_order_for_free_delivery" className="block text-sm font-medium text-gray-700 mb-1">
                      Ücretsiz Teslimat İçin Minimum Sipariş Tutarı (TL)
                    </label>
                    <input
                      type="number"
                      id="minimum_order_for_free_delivery"
                      name="minimum_order_for_free_delivery"
                      value={formData.minimum_order_for_free_delivery}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="500.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Bu tutarın üzerindeki siparişlerde teslimat ücretsiz olacaktır. 
                      Düşük tutarlar (örn: 150 TL) teslimat ücretini sık sık ücretsiz yapar.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="delivery_time_min" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Teslimat Süresi (Dakika)
                    </label>
                    <input
                      type="number"
                      id="delivery_time_min"
                      name="delivery_time_min"
                      value={formData.delivery_time_min}
                      onChange={handleChange}
                      min="5"
                      max="120"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="30"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      En hızlı teslimat süresi (dakika)
                    </p>
                  </div>

                  <div>
                    <label htmlFor="delivery_time_max" className="block text-sm font-medium text-gray-700 mb-1">
                      Maksimum Teslimat Süresi (Dakika)
                    </label>
                    <input
                      type="number"
                      id="delivery_time_max"
                      name="delivery_time_max"
                      value={formData.delivery_time_max}
                      onChange={handleChange}
                      min="10"
                      max="180"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="60"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      En uzun teslimat süresi (dakika)
                    </p>
                  </div>
                </div>

                {/* Örnek Hesaplama */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-800 mb-3">💡 Örnek Hesaplama</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Sipariş tutarı 100 TL ise:</span>
                      <span className="font-medium">
                        Teslimat: {formData.delivery_fee || '12'} TL
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sipariş tutarı {formData.minimum_order_for_free_delivery || '500'} TL ise:</span>
                      <span className="font-medium text-green-600">
                        Teslimat: Ücretsiz!
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tahmini teslimat süresi:</span>
                      <span className="font-medium text-blue-600">
                        {formData.delivery_time_min || '30'} - {formData.delivery_time_max || '60'} dakika
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Kaydediliyor...
                  </>
                ) : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
