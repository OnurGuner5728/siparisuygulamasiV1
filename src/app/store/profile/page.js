'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import StoreGuard from '@/components/StoreGuard';
import api from '@/lib/api';

export default function StoreProfile() {
  return (
    <StoreGuard>
      <StoreProfileContent />
    </StoreGuard>
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
          setFormData({
            name: storeData.name || '',
            email: storeData.email || '',
            phone: storeData.phone || '',
            description: storeData.description || '',
            address: { 
              city: storeData.address?.city || '',
              district: storeData.address?.district || '',
              neighborhood: storeData.address?.neighborhood || '',
              fullAddress: storeData.address?.fullAddress || '' 
            },
            workingHours: { 
              monday: storeData.workingHours?.monday || '',
              tuesday: storeData.workingHours?.tuesday || '',
              wednesday: storeData.workingHours?.wednesday || '',
              thursday: storeData.workingHours?.thursday || '',
              friday: storeData.workingHours?.friday || '',
              saturday: storeData.workingHours?.saturday || '',
              sunday: storeData.workingHours?.sunday || '' 
            }
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
      // Mağaza verilerini güncelle
      const updatedStore = await api.updateStore(store.id, {
        ...formData,
        address: JSON.stringify(formData.address),
        workingHours: JSON.stringify(formData.workingHours)
      });
      
      setStore(updatedStore);
      setSuccess('Bilgileriniz başarıyla güncellendi.');
    } catch (err) {
      console.error('Mağaza güncelleme hatası:', err);
      setError('Bilgileriniz güncellenirken bir hata oluştu.');
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
                {store.name.charAt(0)}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{store.name}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  {store.category}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  store.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {store.status === 'active' ? 'Aktif' : 'Pasif'}
                </span>
                {!store.approved && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Onay Bekliyor
                  </span>
                )}
                <div className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  <span className="mr-1">{store.rating}</span>
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
                  store.status === 'active' 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                disabled={!store.approved}
              >
                {store.status === 'active' ? 'Mağazayı Kapat' : 'Mağazayı Aç'}
              </button>
            </div>
          </div>
        </div>

        {/* Sekmeler */}
        <div className="bg-gray-50 px-6 border-b">
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
                    value={store.category}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="workingHours.monday" className="block text-sm font-medium text-gray-700 mb-1">
                      Pazartesi
                    </label>
                    <input
                      type="text"
                      id="workingHours.monday"
                      name="workingHours.monday"
                      value={formData.workingHours.monday}
                      onChange={handleChange}
                      placeholder="09:00 - 18:00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="workingHours.tuesday" className="block text-sm font-medium text-gray-700 mb-1">
                      Salı
                    </label>
                    <input
                      type="text"
                      id="workingHours.tuesday"
                      name="workingHours.tuesday"
                      value={formData.workingHours.tuesday}
                      onChange={handleChange}
                      placeholder="09:00 - 18:00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="workingHours.wednesday" className="block text-sm font-medium text-gray-700 mb-1">
                      Çarşamba
                    </label>
                    <input
                      type="text"
                      id="workingHours.wednesday"
                      name="workingHours.wednesday"
                      value={formData.workingHours.wednesday}
                      onChange={handleChange}
                      placeholder="09:00 - 18:00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="workingHours.thursday" className="block text-sm font-medium text-gray-700 mb-1">
                      Perşembe
                    </label>
                    <input
                      type="text"
                      id="workingHours.thursday"
                      name="workingHours.thursday"
                      value={formData.workingHours.thursday}
                      onChange={handleChange}
                      placeholder="09:00 - 18:00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="workingHours.friday" className="block text-sm font-medium text-gray-700 mb-1">
                      Cuma
                    </label>
                    <input
                      type="text"
                      id="workingHours.friday"
                      name="workingHours.friday"
                      value={formData.workingHours.friday}
                      onChange={handleChange}
                      placeholder="09:00 - 18:00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="workingHours.saturday" className="block text-sm font-medium text-gray-700 mb-1">
                      Cumartesi
                    </label>
                    <input
                      type="text"
                      id="workingHours.saturday"
                      name="workingHours.saturday"
                      value={formData.workingHours.saturday}
                      onChange={handleChange}
                      placeholder="10:00 - 17:00 (veya Kapalı)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="workingHours.sunday" className="block text-sm font-medium text-gray-700 mb-1">
                      Pazar
                    </label>
                    <input
                      type="text"
                      id="workingHours.sunday"
                      name="workingHours.sunday"
                      value={formData.workingHours.sunday}
                      onChange={handleChange}
                      placeholder="Kapalı (veya çalışma saati)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Çalışma saatlerini &ldquo;HH:MM - HH:MM&rdquo; formatında girin. Kapalı günler için &ldquo;Kapalı&rdquo; yazabilirsiniz.
                </p>
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