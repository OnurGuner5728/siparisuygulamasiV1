'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import AuthGuard from '../../../../components/AuthGuard';

export default function AddUser() {
  return (
    <AuthGuard requiredRole="admin">
      <AddUserContent />
    </AuthGuard>
  );
}

function AddUserContent() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    // Kişisel bilgiler
    first_name: '',
    last_name: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Adres bilgileri
    city: '',
    district: '',
    address: '',
    
    // Sistem bilgileri
    role: 'user',
    status: 'active',
    is_active: true
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // first_name ve last_name değiştiğinde name alanını otomatik güncelle
  useEffect(() => {
    const fullName = `${formData.first_name} ${formData.last_name}`.trim();
    setFormData(prev => ({
      ...prev,
      name: fullName
    }));
  }, [formData.first_name, formData.last_name]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Hata varsa temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Form validasyonu
  const validateForm = () => {
    const formErrors = {};
    
    // Kişisel bilgileri doğrula
    if (!formData.first_name.trim()) {
      formErrors.first_name = 'Ad gereklidir';
    }
      
    if (!formData.last_name.trim()) {
      formErrors.last_name = 'Soyad gereklidir';
    }
      
    if (!formData.email.trim()) {
      formErrors.email = 'E-posta gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      formErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
      
    if (!formData.phone.trim()) {
      formErrors.phone = 'Telefon gereklidir';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      formErrors.phone = 'Geçerli bir telefon numarası giriniz (10-11 haneli)';
    }
    
    if (!formData.password) {
      formErrors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 6) {
      formErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }
      
    if (formData.password !== formData.confirmPassword) {
      formErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    // Adres bilgilerini doğrula (opsiyonel)
    if (formData.city && !formData.district.trim()) {
      formErrors.district = 'Şehir seçildiyse ilçe de gereklidir';
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Kullanıcı verilerini hazırla
      const userData = {
        firstName: formData.first_name,
        lastName: formData.last_name,
        phone: formData.phone,
        city: formData.city,
        district: formData.district,
        address: formData.address,
        status: formData.status,
        is_active: formData.is_active
      };

      // AuthContext register fonksiyonunu kullan
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        { userData }
      );

      if (result.success) {
        // Başarılı kayıt durumunda kullanıcı listesine yönlendir
        router.push('/admin/users');
      } else {
        setError(result.error || 'Kullanıcı eklenemedi.');
      }
    } catch (err) {
      console.error('Kullanıcı ekleme hatası:', err);
      setError('Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'user', label: 'Müşteri' },
    { value: 'store', label: 'Mağaza Sahibi' },
    { value: 'admin', label: 'Admin' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Pasif' },
    { value: 'pending', label: 'Beklemede' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Yeni Kullanıcı Ekle</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Admin paneli üzerinden yeni bir kullanıcı oluştur</p>
        </div>
        <Link 
          href="/admin/users"
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kullanıcı Listesine Dön
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md">
              {error}
            </div>
          )}

          {/* Kişisel Bilgiler */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Kişisel Bilgiler
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ad *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Adı girin"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Soyad *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Soyadı girin"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tam Ad (Otomatik Oluşturulur)
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 dark:text-gray-300"
                  placeholder="Ad ve soyad otomatik birleştirilecek"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  E-posta Adresi *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="E-posta adresini girin"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefon Numarası *
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="5XXXXXXXXX"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Şifre Bilgileri */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Şifre Bilgileri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Şifre *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="En az 6 karakter"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Şifre Tekrarı *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Şifreyi tekrar girin"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Adres Bilgileri */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Adres Bilgileri (Opsiyonel)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Şehir
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  placeholder="Şehir girin"
                />
              </div>

              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  İlçe
                </label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${
                    errors.district ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="İlçe girin"
                />
                {errors.district && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.district}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Adres
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  placeholder="Detaylı adres bilgisi girin"
                />
              </div>
            </div>
          </div>

          {/* Sistem Bilgileri */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Sistem Bilgileri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kullanıcı Rolü *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Durum *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Kullanıcı aktif durumda
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Aksiyonları */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-md transition duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kullanıcı Ekleniyor...
                </>
              ) : (
                'Kullanıcı Ekle'
              )}
            </button>
            
            <Link
              href="/admin/users"
              className="flex-1 sm:flex-initial bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold py-3 px-8 rounded-md text-center transition duration-200"
            >
              İptal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 
