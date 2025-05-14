'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { mockStores } from '@/app/data/mockdatas';

export default function EditStore() {
  return (
    <AuthGuard requiredRole="admin">
      <EditStoreContent />
    </AuthGuard>
  );
}

function EditStoreContent() {
  const router = useRouter();
  const params = useParams();
  const storeId = params?.id ? parseInt(params.id) : null;
  
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    category: '',
    description: '',
    address: '',
    status: 'active',
    approved: true,
    modulePermissions: {
      yemek: false,
      market: false,
      su: false,
      aktuel: false
    }
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (storeId) {
      setLoading(true);
      
      // Mock veri deposundan mağaza bilgilerini yükle
      setTimeout(() => {
        const store = mockStores.find(s => s.id === storeId);
        
        if (store) {
          setFormData({
            name: store.name || '',
            ownerName: store.ownerName || '',
            email: store.email || '',
            phone: store.phone || '',
            category: store.category || '',
            description: store.description || '',
            address: store.address || '',
            status: store.status || 'active',
            approved: store.approved !== undefined ? store.approved : true,
            modulePermissions: {
              yemek: store.modulePermissions?.yemek || false,
              market: store.modulePermissions?.market || false,
              su: store.modulePermissions?.su || false,
              aktuel: store.modulePermissions?.aktuel || false
            }
          });
          setNotFound(false);
        } else {
          setNotFound(true);
        }
        
        setLoading(false);
      }, 1000);
    }
  }, [storeId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('module-')) {
      const moduleName = name.replace('module-', '');
      setFormData(prev => ({
        ...prev,
        modulePermissions: {
          ...prev.modulePermissions,
          [moduleName]: checked
        }
      }));
    } else if (name === 'approved') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
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
    setError('');

    try {
      // Formda eksik bilgi kontrolü
      if (!formData.name || !formData.email || !formData.category) {
        throw new Error('Lütfen gerekli tüm alanları doldurun.');
      }

      // Email formatı kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Lütfen geçerli bir e-posta adresi girin.');
      }

      // Telefon numarası kontrolü (basit)
      if (formData.phone && !/^[0-9\s-+()]{10,15}$/.test(formData.phone)) {
        throw new Error('Lütfen geçerli bir telefon numarası girin.');
      }

      // Gerçek projede burada bir API isteği yapılarak mağaza güncellenir
      // Simülasyon amaçlı timeout kullanıyoruz
      setTimeout(() => {
        // Başarılı güncelleme durumunda mağaza listesine yönlendir
        router.push('/admin/stores');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Bir hata oluştu, lütfen tekrar deneyin.');
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

  if (notFound) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Mağaza Bulunamadı</h1>
          <p className="text-gray-600 mb-6">İstediğiniz ID ({storeId}) ile eşleşen bir mağaza bulunamadı.</p>
          <Link 
            href="/admin/stores"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Mağazalar Listesine Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mağaza Düzenle</h1>
          <p className="text-gray-600 mt-1">ID: {storeId}</p>
        </div>
        <Link 
          href="/admin/stores"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Mağazalar Listesine Dön
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
                Mağaza Adı <span className="text-red-500">*</span>
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
              <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
                Mağaza Sahibi
              </label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mağaza sahibinin adını girin"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-posta <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="ornek@mail.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="05XX XXX XX XX"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Kategori Seçin</option>
                <option value="Yemek">Yemek</option>
                <option value="Market">Market</option>
                <option value="Su">Su</option>
                <option value="Aktüel">Aktüel</option>
              </select>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Adres
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mağaza adresini girin"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
                <option value="pending">Beklemede</option>
              </select>
            </div>

            <div className="flex items-center mt-1">
              <input
                type="checkbox"
                id="approved"
                name="approved"
                checked={formData.approved}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="approved" className="ml-2 block text-sm text-gray-700">
                Onaylanmış
              </label>
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
                placeholder="Mağaza hakkında açıklama girin"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-1">Modül İzinleri</legend>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="module-yemek"
                      name="module-yemek"
                      checked={formData.modulePermissions.yemek}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="module-yemek" className="ml-2 block text-sm text-gray-700">
                      Yemek
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="module-market"
                      name="module-market"
                      checked={formData.modulePermissions.market}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="module-market" className="ml-2 block text-sm text-gray-700">
                      Market
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="module-su"
                      name="module-su"
                      checked={formData.modulePermissions.su}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="module-su" className="ml-2 block text-sm text-gray-700">
                      Su
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="module-aktuel"
                      name="module-aktuel"
                      checked={formData.modulePermissions.aktuel}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="module-aktuel" className="ml-2 block text-sm text-gray-700">
                      Aktüel
                    </label>
                  </div>
                </div>
              </fieldset>
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
              disabled={submitting}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                submitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 