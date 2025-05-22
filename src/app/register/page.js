'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
    role: 'customer', // Varsayılan olarak müşteri
    // İş ortağı için ek alanlar
    businessName: '',
    businessPhone: '',
    businessEmail: '',
    businessAddress: '',
    categoryId: '',
    subcategories: [],
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Kategorileri ve alt kategorileri veritabanından yükle
  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        setLoading(true);
        // Ana kategorileri getir
        const mainCategories = await api.getMainCategories();
        setCategories(mainCategories || []);
        
        // Tüm alt kategorileri getir
        const allSubcategories = await api.getAllSubcategories();
        setSubcategories(allSubcategories || []);
      } catch (error) {
        console.error('Kategori verileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoriesData();
  }, []);

  // Kategori değiştiğinde alt kategori listesini güncelle
  useEffect(() => {
    if (formData.categoryId) {
      const categoryId = parseInt(formData.categoryId);
      const subs = subcategories.filter(sub => sub.parent_id === categoryId);
      setFilteredSubcategories(subs);
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.categoryId, subcategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Eğer kategori değiştiyse, alt kategori seçimlerini sıfırla
    if (name === 'categoryId') {
      setSelectedSubcategories([]);
      setFormData(prev => ({
        ...prev,
        subcategories: []
      }));
    }
  };

  const handleSubcategoryChange = (e) => {
    const subcategoryId = parseInt(e.target.value);
    
    // Eğer zaten seçiliyse kaldır, değilse ekle
    if (selectedSubcategories.includes(subcategoryId)) {
      const updatedSelection = selectedSubcategories.filter(id => id !== subcategoryId);
      setSelectedSubcategories(updatedSelection);
      setFormData(prev => ({
        ...prev,
        subcategories: updatedSelection
      }));
    } else {
      const updatedSelection = [...selectedSubcategories, subcategoryId];
      setSelectedSubcategories(updatedSelection);
      setFormData(prev => ({
        ...prev,
        subcategories: updatedSelection
      }));
    }
  };

  const validateForm = () => {
    let formErrors = {};
    
    if (formData.role === 'customer') {
      // Müşteri validasyonu
      // Ad kontrolü
      if (!formData.firstName.trim()) {
        formErrors.firstName = 'Ad gereklidir';
      }
      
      // Soyad kontrolü
      if (!formData.lastName.trim()) {
        formErrors.lastName = 'Soyad gereklidir';
      }
      
      // E-posta kontrolü
      if (!formData.email) {
        formErrors.email = 'E-posta adresi gereklidir';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        formErrors.email = 'Geçerli bir e-posta adresi giriniz';
      }
      
      // Şifre kontrolü
      if (!formData.password) {
        formErrors.password = 'Şifre gereklidir';
      } else if (formData.password.length < 6) {
        formErrors.password = 'Şifre en az 6 karakter olmalıdır';
      }
      
      // Şifre onay kontrolü
      if (formData.password !== formData.confirmPassword) {
        formErrors.confirmPassword = 'Şifreler eşleşmiyor';
      }
      
      // Adres kontrolü
      if (!formData.address.trim()) {
        formErrors.address = 'Adres gereklidir';
      }
      
      // Telefon kontrolü
      if (!formData.phone) {
        formErrors.phone = 'Telefon numarası gereklidir';
      } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
        formErrors.phone = 'Geçerli bir telefon numarası giriniz';
      }
    } else {
      // İş ortağı validasyonu
      // İşletme adı kontrolü
      if (!formData.businessName.trim()) {
        formErrors.businessName = 'İşletme adı gereklidir';
      }
      
      // Kategori kontrolü
      if (!formData.categoryId) {
        formErrors.categoryId = 'Kategori seçimi gereklidir';
      }
      
      // Alt kategori kontrolü
      if (!formData.subcategories.length) {
        formErrors.subcategories = 'En az bir alt kategori seçimi gereklidir';
      }
      
      // İşletme adresi kontrolü
      if (!formData.businessAddress.trim()) {
        formErrors.businessAddress = 'İşletme adresi gereklidir';
      }
      
      // İşletme telefonu kontrolü
      if (!formData.businessPhone) {
        formErrors.businessPhone = 'İşletme telefon numarası gereklidir';
      } else if (!/^[0-9]{10,11}$/.test(formData.businessPhone.replace(/[^0-9]/g, ''))) {
        formErrors.businessPhone = 'Geçerli bir telefon numarası giriniz';
      }
      
      // İşletme e-posta kontrolü
      if (!formData.businessEmail) {
        formErrors.businessEmail = 'İşletme e-posta adresi gereklidir';
      } else if (!/\S+@\S+\.\S+/.test(formData.businessEmail)) {
        formErrors.businessEmail = 'Geçerli bir e-posta adresi giriniz';
      }
      
      // Yetkili adı kontrolü
      if (!formData.firstName.trim()) {
        formErrors.firstName = 'Yetkili adı gereklidir';
      }
      
      // Yetkili soyadı kontrolü
      if (!formData.lastName.trim()) {
        formErrors.lastName = 'Yetkili soyadı gereklidir';
      }
      
      // Yetkili telefonu
      if (!formData.phone) {
        formErrors.phone = 'Yetkili telefon numarası gereklidir';
      } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
        formErrors.phone = 'Geçerli bir telefon numarası giriniz';
      }
      
      // Yetkili e-posta kontrolü
      if (!formData.email) {
        formErrors.email = 'Yetkili e-posta adresi gereklidir';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        formErrors.email = 'Geçerli bir e-posta adresi giriniz';
      }
      
      // Şifre kontrolü
      if (!formData.password) {
        formErrors.password = 'Şifre gereklidir';
      } else if (formData.password.length < 6) {
        formErrors.password = 'Şifre en az 6 karakter olmalıdır';
      }
      
      // Şifre onay kontrolü
      if (formData.password !== formData.confirmPassword) {
        formErrors.confirmPassword = 'Şifreler eşleşmiyor';
      }
    }
    
    return formErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Kullanıcı kayıt işlemi
      const fullName = `${formData.firstName} ${formData.lastName}`;
      const userRole = formData.role === 'customer' ? 'user' : 'store';
      
      let result;
      
      if (userRole === 'store') {
        // İş ortağı kaydı için gerekli bilgileri hazırla
        const businessData = {
          name: formData.businessName,
          phone: formData.businessPhone,
          email: formData.businessEmail,
          address: formData.businessAddress,
          category_id: parseInt(formData.categoryId),
          subcategories: formData.subcategories,
          owner_phone: formData.phone,
          is_approved: false, // Yeni mağazalar onay bekleyecek
          logo: null,
          type: categories.find(c => c.id === parseInt(formData.categoryId))?.name || ''
        };
        
        result = await register(fullName, formData.email, formData.password, userRole, businessData);
      } else {
        // Normal kullanıcı kaydı
        const userData = {
          address: formData.address,
          phone: formData.phone
        };
        
        result = await register(fullName, formData.email, formData.password, userRole, userData);
      }
      
      if (result.success) {
        // Başarılı kayıt
        if (userRole === 'store') {
          alert('Mağaza başvurunuz alınmıştır. Onay sonrası bilgilendirileceksiniz.');
        }
        router.push('/');
      } else {
        // Başarısız kayıt
        setErrors({ form: result.error || 'Kayıt oluşturulurken bir hata oluştu' });
      }
    } catch (error) {
      console.error('Kayıt işlemi sırasında hata:', error);
      setErrors({ form: error.message || 'Kayıt oluşturulurken bir hata oluştu' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {formData.role === 'customer' ? 'Kullanıcı Kaydı' : 'İş Ortağı Kaydı'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Giriş yapın
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Hesap Türü Seçimi */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'customer'})}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  formData.role === 'customer'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Müşteri Kaydı
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'business'})}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  formData.role === 'business'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                İş Ortağı Kaydı
              </button>
            </div>
          </div>

          {errors.form && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errors.form}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center my-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {formData.role === 'business' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">İşletme Bilgileri</h3>
                  
                  {/* İşletme Adı */}
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                      İşletme Adı <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        id="businessName"
                        name="businessName"
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          errors.businessName ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      />
                      {errors.businessName && (
                        <p className="mt-2 text-sm text-red-600">{errors.businessName}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Kategori Seçimi */}
                  <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <select
                        id="categoryId"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        className={`block w-full px-3 py-2 border ${
                          errors.categoryId ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      >
                        <option value="">Kategori Seçin</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.categoryId && (
                        <p className="mt-2 text-sm text-red-600">{errors.categoryId}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Alt Kategori Seçimi */}
                  {formData.categoryId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Alt Kategoriler <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-300 rounded-md">
                          {filteredSubcategories.length > 0 ? (
                            filteredSubcategories.map((subcategory) => (
                              <div key={subcategory.id} className="flex items-center">
                                <input
                                  id={`subcategory-${subcategory.id}`}
                                  name={`subcategory-${subcategory.id}`}
                                  type="checkbox"
                                  value={subcategory.id}
                                  checked={selectedSubcategories.includes(subcategory.id)}
                                  onChange={handleSubcategoryChange}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                  htmlFor={`subcategory-${subcategory.id}`}
                                  className="ml-2 block text-sm text-gray-900"
                                >
                                  {subcategory.name}
                                </label>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 col-span-2 py-2">
                              Bu kategori için alt kategori bulunamadı.
                            </p>
                          )}
                        </div>
                        {errors.subcategories && (
                          <p className="mt-2 text-sm text-red-600">{errors.subcategories}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* İşletme Adresi */}
                  <div>
                    <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
                      İşletme Adresi <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="businessAddress"
                        name="businessAddress"
                        rows="3"
                        value={formData.businessAddress}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          errors.businessAddress ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      />
                      {errors.businessAddress && (
                        <p className="mt-2 text-sm text-red-600">{errors.businessAddress}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* İşletme Telefonu */}
                  <div>
                    <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700">
                      İşletme Telefonu <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        id="businessPhone"
                        name="businessPhone"
                        type="tel"
                        value={formData.businessPhone}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          errors.businessPhone ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="05XX XXX XX XX"
                      />
                      {errors.businessPhone && (
                        <p className="mt-2 text-sm text-red-600">{errors.businessPhone}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* İşletme E-postası */}
                  <div>
                    <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700">
                      İşletme E-postası <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        id="businessEmail"
                        name="businessEmail"
                        type="email"
                        value={formData.businessEmail}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          errors.businessEmail ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      />
                      {errors.businessEmail && (
                        <p className="mt-2 text-sm text-red-600">{errors.businessEmail}</p>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 pt-4">Yetkili Bilgileri</h3>
                </div>
              )}

              {/* Kişisel Bilgiler */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Ad */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    {formData.role === 'business' ? 'Yetkili Adı' : 'Ad'} <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.firstName ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.firstName && (
                      <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                </div>

                {/* Soyad */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    {formData.role === 'business' ? 'Yetkili Soyadı' : 'Soyad'} <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.lastName ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.lastName && (
                      <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* E-posta */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {formData.role === 'business' ? 'Yetkili E-postası' : 'E-posta'} <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Telefon */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  {formData.role === 'business' ? 'Yetkili Telefonu' : 'Telefon'} <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="05XX XXX XX XX"
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Adres (sadece normal kullanıcılar için) */}
              {formData.role === 'customer' && (
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Adres <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="address"
                      name="address"
                      rows="3"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.address ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.address && (
                      <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Şifre */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Şifre <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* Şifre Onayı */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Şifre Onayı <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kaydediliyor...
                    </>
                  ) : (
                    'Kayıt Ol'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 