'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  
  // Hydration mismatch önlemek için client-side mounting kontrolü
  const [isMounted, setIsMounted] = useState(false);
  
  // Form state'leri ayrılmış - kişisel ve mağaza bilgileri
  const [accountType, setAccountType] = useState('customer'); // customer veya business
  
  // Kişisel bilgiler (Her iki rol için de gerekli)
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  // Müşteri için detaylı adres bilgileri
  const [addressInfo, setAddressInfo] = useState({
    city: '',
    district: '',
    neighborhood: '',
    street: '',
    buildingNo: '',
    floor: '',
    apartmentNo: '',
    directions: ''
  });
  
  // İş ortağı için yetkili kişi adres bilgileri (detaylı)
  const [ownerAddressInfo, setOwnerAddressInfo] = useState({
    city: '',
    district: '',
    neighborhood: '',
    street: '',
    buildingNo: '',
    floor: '',
    apartmentNo: '',
    directions: ''
  });
  
  // İş ortağı için işletme bilgileri (basit adres)
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessCity: '',
    businessDistrict: '',
    businessAddress: '',
    businessDescription: '',
    categoryId: '',
    subcategories: []
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Kategorileri yükle
  useEffect(() => {
    setIsMounted(true);
    
    const loadCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await api.getCategories();
        setCategories(categoriesData);
        
        const subcategoriesData = await api.getAllSubcategories();
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error('Kategoriler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  // Alt kategorileri filtrele
  useEffect(() => {
    if (businessInfo.categoryId) {
      const filtered = subcategories.filter(sub => 
        sub.parent_id === parseInt(businessInfo.categoryId)
      );
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
      setSelectedSubcategories([]);
      setBusinessInfo({ ...businessInfo, subcategories: [] });
    }
  }, [businessInfo.categoryId, subcategories]);

  // Input change handler'ları
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));

    // Hata varsa temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleAddressInfoChange = (e) => {
    const { name, value } = e.target;
    setAddressInfo(prev => ({
        ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleBusinessInfoChange = (e) => {
    const { name, value } = e.target;
    setBusinessInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Kategori değiştiğinde alt kategori seçimlerini sıfırla
    if (name === 'categoryId') {
      setSelectedSubcategories([]);
      setBusinessInfo(prev => ({
        ...prev,
        subcategories: []
      }));
    }
  };

  const handleSubcategoryChange = (subcategoryId) => {
    let updated;
    if (selectedSubcategories.includes(subcategoryId)) {
      updated = selectedSubcategories.filter(id => id !== subcategoryId);
    } else {
      updated = [...selectedSubcategories, subcategoryId];
    }
    setSelectedSubcategories(updated);
    setBusinessInfo({ ...businessInfo, subcategories: updated });
  };

  const handleAccountTypeChange = (type) => {
    setAccountType(type);
    setErrors({}); // Hataları temizle
  };

  // Form validasyonu
  const validateForm = () => {
    const formErrors = {};
    
    // Kişisel bilgileri doğrula
    if (!personalInfo.firstName.trim()) {
        formErrors.firstName = 'Ad gereklidir';
      }
      
    if (!personalInfo.lastName.trim()) {
        formErrors.lastName = 'Soyad gereklidir';
      }
      
    if (!personalInfo.email.trim()) {
      formErrors.email = 'E-posta gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
        formErrors.email = 'Geçerli bir e-posta adresi giriniz';
      }
      
    if (!personalInfo.phone.trim()) {
      formErrors.phone = 'Telefon gereklidir';
    } else if (!/^[0-9]{10,11}$/.test(personalInfo.phone.replace(/\s/g, ''))) {
      formErrors.phone = 'Geçerli bir telefon numarası giriniz (10-11 haneli)';
    }
    
    if (!personalInfo.password) {
        formErrors.password = 'Şifre gereklidir';
    } else if (personalInfo.password.length < 6) {
        formErrors.password = 'Şifre en az 6 karakter olmalıdır';
      }
      
    if (personalInfo.password !== personalInfo.confirmPassword) {
        formErrors.confirmPassword = 'Şifreler eşleşmiyor';
      }
      
    // Müşteri için detaylı adres bilgilerini doğrula
    if (accountType === 'customer') {
      if (!addressInfo.city.trim()) {
        formErrors.city = 'Şehir gereklidir';
      }
      
      if (!addressInfo.district.trim()) {
        formErrors.district = 'İlçe gereklidir';
      }
      
      if (!addressInfo.neighborhood.trim()) {
        formErrors.neighborhood = 'Mahalle gereklidir';
      }
      
      if (!addressInfo.street.trim()) {
        formErrors.street = 'Sokak/Cadde gereklidir';
      }
    }
    
    // İş ortağı için yetkili kişi adres bilgilerini doğrula
    if (accountType === 'business') {
      if (!ownerAddressInfo.city.trim()) {
        formErrors.ownerCity = 'Yetkili kişi şehri gereklidir';
      }
      
      if (!ownerAddressInfo.district.trim()) {
        formErrors.ownerDistrict = 'Yetkili kişi ilçesi gereklidir';
      }
      
      if (!ownerAddressInfo.neighborhood.trim()) {
        formErrors.ownerNeighborhood = 'Yetkili kişi mahallesi gereklidir';
      }
      
      if (!ownerAddressInfo.street.trim()) {
        formErrors.ownerStreet = 'Yetkili kişi sokak/caddesi gereklidir';
      }
      
      // İşletme bilgilerini doğrula
      if (!businessInfo.businessName.trim()) {
        formErrors.businessName = 'İşletme adı gereklidir';
      }
      
      if (!businessInfo.businessEmail.trim()) {
        formErrors.businessEmail = 'İşletme e-postası gereklidir';
      } else if (!/\S+@\S+\.\S+/.test(businessInfo.businessEmail)) {
        formErrors.businessEmail = 'Geçerli bir e-posta adresi giriniz';
      }
      
      if (!businessInfo.businessPhone.trim()) {
        formErrors.businessPhone = 'İşletme telefonu gereklidir';
      } else if (!/^[0-9\s\-\(\)]{10,15}$/.test(businessInfo.businessPhone)) {
        formErrors.businessPhone = 'Geçerli bir telefon numarası giriniz (10-11 haneli)';
      }
      
      if (!businessInfo.categoryId) {
        formErrors.categoryId = 'Kategori seçimi gereklidir';
      }
      
      if (!businessInfo.businessCity.trim()) {
        formErrors.businessCity = 'İşletme şehri gereklidir';
      }
      
      if (!businessInfo.businessDistrict.trim()) {
        formErrors.businessDistrict = 'İşletme ilçesi gereklidir';
      }
      
      if (!businessInfo.businessAddress.trim()) {
        formErrors.businessAddress = 'İşletme adresi gereklidir';
      }
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  // Form gönderim fonksiyonu
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const userRole = accountType === 'customer' ? 'user' : 'store';
      const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();
      
      let formData;
      
      if (accountType === 'customer') {
        // Müşteri kayıtı için detaylı adres bilgilerini hazırla
        const fullAddress = `${addressInfo.street} ${addressInfo.buildingNo ? 'No:' + addressInfo.buildingNo : ''} ${addressInfo.floor ? 'Kat:' + addressInfo.floor : ''} ${addressInfo.apartmentNo ? 'Daire:' + addressInfo.apartmentNo : ''}`.trim();
        
        formData = {
          userData: {
            firstName: personalInfo.firstName,
            lastName: personalInfo.lastName,
            phone: personalInfo.phone,
            // Detaylı adres bilgileri
            city: addressInfo.city,
            district: addressInfo.district,
            neighborhood: addressInfo.neighborhood,
            street: addressInfo.street,
            buildingNo: addressInfo.buildingNo,
            floor: addressInfo.floor,
            apartmentNo: addressInfo.apartmentNo,
            directions: addressInfo.directions,
            fullAddress: fullAddress + (addressInfo.directions ? ` - ${addressInfo.directions}` : '')
          }
        };
      } else {
        // İş ortağı kayıtı için yetkili kişi ve işletme bilgilerini hazırla
        const ownerFullAddress = `${ownerAddressInfo.street} ${ownerAddressInfo.buildingNo ? 'No:' + ownerAddressInfo.buildingNo : ''} ${ownerAddressInfo.floor ? 'Kat:' + ownerAddressInfo.floor : ''} ${ownerAddressInfo.apartmentNo ? 'Daire:' + ownerAddressInfo.apartmentNo : ''}`.trim();
        
        formData = {
          userData: {
            firstName: personalInfo.firstName,
            lastName: personalInfo.lastName,
            phone: personalInfo.phone,
            // Yetkili kişi detaylı adres bilgileri
            city: ownerAddressInfo.city,
            district: ownerAddressInfo.district,
            neighborhood: ownerAddressInfo.neighborhood,
            street: ownerAddressInfo.street,
            buildingNo: ownerAddressInfo.buildingNo,
            floor: ownerAddressInfo.floor,
            apartmentNo: ownerAddressInfo.apartmentNo,
            directions: ownerAddressInfo.directions,
            fullAddress: ownerFullAddress + (ownerAddressInfo.directions ? ` - ${ownerAddressInfo.directions}` : '')
          },
          businessData: {
            name: businessInfo.businessName,
            phone: businessInfo.businessPhone,
            email: businessInfo.businessEmail,
            // İşletme için basit adres (stores tablosu için)
            city: businessInfo.businessCity,
            district: businessInfo.businessDistrict,
            address: businessInfo.businessAddress,
            description: businessInfo.businessDescription,
            category_id: businessInfo.categoryId,
            subcategories: businessInfo.subcategories,
            status: 'pending',
            is_approved: false,
            logo_url: null,
            banner_url: null,
            type: 'restaurant'
          }
        };
      }
      
      const result = await register(
        fullName,
        personalInfo.email,
        personalInfo.password,
        userRole,
        formData
      );
      
      if (result.success) {
        alert('Kayıt başarılı! E-posta adresinizi doğrulamanız gerekmektedir.');
        router.push(`/auth/email-confirmation?email=${encodeURIComponent(personalInfo.email)}`);
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      alert(error.message || 'Kayıt sırasında bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hydration mismatch önlemek için ilk render'da boş sayfa
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-4 flex items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-36 -translate-y-36"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48"></div>
      <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/30 rounded-full animate-bounce"></div>
      
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full mx-auto shadow-2xl backdrop-blur-sm max-h-[90vh] overflow-y-auto">
        <div className="px-8 pt-12 pb-8">
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              {accountType === 'customer' ? 'Hesap Oluşturun' : 'İş Ortağı Olun'}
        </h2>
            <p className="text-gray-500 text-base mb-6">
              {accountType === 'customer' 
                ? 'Lezzetli deneyimler sizi bekliyor' 
                : 'İşletmenizi büyütmek için bize katılın'
              }
            </p>
            
            {/* Account Type Selector */}
            <div className="flex bg-gray-100 rounded-2xl p-1 max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => handleAccountTypeChange('customer')}
                className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  accountType === 'customer'
                    ? 'bg-white text-orange-500 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Müşteri
              </button>
              <button
                type="button"
                onClick={() => handleAccountTypeChange('business')}
                className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  accountType === 'business'
                    ? 'bg-white text-orange-500 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                İş Ortağı
              </button>
            </div>
          </div>

          {/* Error Display */}
          {errors.form && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r">
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
            <div className="flex flex-col items-center justify-center my-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-gray-600">Kategoriler yükleniyor...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Kişisel Bilgiler Section */}
                <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  {accountType === 'business' ? 'Yetkili Kişi Bilgileri' : 'Kişisel Bilgiler'}
                </h3>
                  
                {/* Ad Soyad */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Ad <span className="text-red-500">*</span>
                    </label>
                      <input
                      id="firstName"
                      name="firstName"
                        type="text"
                      value={personalInfo.firstName}
                      onChange={handlePersonalInfoChange}
                      className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                        errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Adınız"
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                </div>

                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Soyad <span className="text-red-500">*</span>
                  </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={personalInfo.lastName}
                      onChange={handlePersonalInfoChange}
                      className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                        errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Soyadınız"
                      />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                    </div>
                  </div>
                  
              {/* E-posta */}
                  <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {accountType === 'business' ? 'Kişisel E-posta (Giriş için kullanılacak)' : 'E-posta'} <span className="text-red-500">*</span>
                    </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={handlePersonalInfoChange}
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="ornek@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  {accountType === 'business' && (
                    <p className="mt-1 text-xs text-blue-600">Bu e-posta adresiniz ile sisteme giriş yapacaksınız</p>
                      )}
                    </div>

              {/* Telefon */}
              <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    {accountType === 'business' ? 'Kişisel Telefon' : 'Telefon'} <span className="text-red-500">*</span>
                </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={personalInfo.phone}
                    onChange={handlePersonalInfoChange}
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="05XX XXX XX XX"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                  
                {/* Şifre */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Şifre <span className="text-red-500">*</span>
                      </label>
                                <input
                      id="password"
                      name="password"
                      type="password"
                      value={personalInfo.password}
                      onChange={handlePersonalInfoChange}
                      className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="En az 6 karakter"
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Şifre Onayı <span className="text-red-500">*</span>
                                </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={personalInfo.confirmPassword}
                      onChange={handlePersonalInfoChange}
                      className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                        errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Şifrenizi tekrar girin"
                    />
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                              </div>
                        </div>
                      </div>

              {/* Müşteri için adres bilgileri */}
              {accountType === 'customer' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-orange-600">Adres Bilgileri</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Şehir <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={addressInfo.city}
                        onChange={(e) => setAddressInfo({ ...addressInfo, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="İstanbul"
                        required
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        İlçe <span className="text-red-500">*</span>
                    </label>
                      <input
                        type="text"
                        value={addressInfo.district}
                        onChange={(e) => setAddressInfo({ ...addressInfo, district: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Kadıköy"
                        required
                      />
                      {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mahalle <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={addressInfo.neighborhood}
                        onChange={(e) => setAddressInfo({ ...addressInfo, neighborhood: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Caddebostan Mahallesi"
                        required
                      />
                      {errors.neighborhood && <p className="text-red-500 text-xs mt-1">{errors.neighborhood}</p>}
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sokak/Cadde <span className="text-red-500">*</span>
                    </label>
                      <input
                        type="text"
                        value={addressInfo.street}
                        onChange={(e) => setAddressInfo({ ...addressInfo, street: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Bağdat Caddesi"
                        required
                      />
                      {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bina No
                      </label>
                      <input
                        type="text"
                        value={addressInfo.buildingNo}
                        onChange={(e) => setAddressInfo({ ...addressInfo, buildingNo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="123"
                      />
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kat
                    </label>
                      <input
                        type="text"
                        value={addressInfo.floor}
                        onChange={(e) => setAddressInfo({ ...addressInfo, floor: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Daire No
                      </label>
                      <input
                        type="text"
                        value={addressInfo.apartmentNo}
                        onChange={(e) => setAddressInfo({ ...addressInfo, apartmentNo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="5"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adres Tarifi (Opsiyonel)
                    </label>
                    <textarea
                      value={addressInfo.directions}
                      onChange={(e) => setAddressInfo({ ...addressInfo, directions: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows="3"
                      placeholder="Ek adres bilgileri, tarif..."
                    />
                  </div>
                </div>
              )}

              {/* İş ortağı için yetkili kişi adres bilgileri */}
              {accountType === 'business' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-orange-600">Yetkili Kişi Adres Bilgileri</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Şehir <span className="text-red-500">*</span>
                  </label>
                    <input
                      type="text"
                        value={ownerAddressInfo.city}
                        onChange={(e) => setOwnerAddressInfo({ ...ownerAddressInfo, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="İstanbul"
                      required
                    />
                      {errors.ownerCity && <p className="text-red-500 text-xs mt-1">{errors.ownerCity}</p>}
                </div>

                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        İlçe <span className="text-red-500">*</span>
                  </label>
                    <input
                      type="text"
                        value={ownerAddressInfo.district}
                        onChange={(e) => setOwnerAddressInfo({ ...ownerAddressInfo, district: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Kadıköy"
                      required
                    />
                      {errors.ownerDistrict && <p className="text-red-500 text-xs mt-1">{errors.ownerDistrict}</p>}
              </div>

              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mahalle <span className="text-red-500">*</span>
                </label>
                  <input
                        type="text"
                        value={ownerAddressInfo.neighborhood}
                        onChange={(e) => setOwnerAddressInfo({ ...ownerAddressInfo, neighborhood: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Caddebostan Mahallesi"
                    required
                      />
                      {errors.ownerNeighborhood && <p className="text-red-500 text-xs mt-1">{errors.ownerNeighborhood}</p>}
              </div>

              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sokak/Cadde <span className="text-red-500">*</span>
                </label>
                  <input
                        type="text"
                        value={ownerAddressInfo.street}
                        onChange={(e) => setOwnerAddressInfo({ ...ownerAddressInfo, street: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Bağdat Caddesi"
                    required
                  />
                      {errors.ownerStreet && <p className="text-red-500 text-xs mt-1">{errors.ownerStreet}</p>}
                </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bina No
                      </label>
                      <input
                        type="text"
                        value={ownerAddressInfo.buildingNo}
                        onChange={(e) => setOwnerAddressInfo({ ...ownerAddressInfo, buildingNo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="123"
                      />
              </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kat
                      </label>
                        <input
                          type="text"
                        value={ownerAddressInfo.floor}
                        onChange={(e) => setOwnerAddressInfo({ ...ownerAddressInfo, floor: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Daire No
                      </label>
                        <input
                          type="text"
                        value={ownerAddressInfo.apartmentNo}
                        onChange={(e) => setOwnerAddressInfo({ ...ownerAddressInfo, apartmentNo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="5"
                        />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adres Tarifi (Opsiyonel)
                    </label>
                      <textarea
                      value={ownerAddressInfo.directions}
                      onChange={(e) => setOwnerAddressInfo({ ...ownerAddressInfo, directions: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        rows="3"
                      placeholder="Ek adres bilgileri, tarif..."
                      />
                    </div>
                  </div>
              )}

              {/* İş ortağı için işletme bilgileri */}
              {accountType === 'business' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-orange-600">İşletme Bilgileri</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        İşletme Adı <span className="text-red-500">*</span>
                </label>
                  <input
                        type="text"
                        value={businessInfo.businessName}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Restoran Adı"
                    required
                  />
                      {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
                </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        İşletme E-postası <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={businessInfo.businessEmail}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, businessEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="restoran@example.com"
                        required
                      />
                      {errors.businessEmail && <p className="text-red-500 text-xs mt-1">{errors.businessEmail}</p>}
              </div>

              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        İşletme Telefonu <span className="text-red-500">*</span>
                </label>
                  <input
                        type="tel"
                        value={businessInfo.businessPhone}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, businessPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="0212 XXX XXXX"
                    required
                  />
                      {errors.businessPhone && <p className="text-red-500 text-xs mt-1">{errors.businessPhone}</p>}
                </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={businessInfo.categoryId}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, categoryId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      >
                        <option value="">Kategori Seçin</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
              </div>

              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        İşletme Şehri <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={businessInfo.businessCity}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, businessCity: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="İstanbul"
                        required
                      />
                      {errors.businessCity && <p className="text-red-500 text-xs mt-1">{errors.businessCity}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        İşletme İlçesi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={businessInfo.businessDistrict}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, businessDistrict: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Kadıköy"
                        required
                      />
                      {errors.businessDistrict && <p className="text-red-500 text-xs mt-1">{errors.businessDistrict}</p>}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İşletme Adresi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={businessInfo.businessAddress}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, businessAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows="3"
                      placeholder="Detay adres bilgileri..."
                      required
                    />
                    {errors.businessAddress && <p className="text-red-500 text-xs mt-1">{errors.businessAddress}</p>}
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İşletme Açıklaması
                    </label>
                    <textarea
                      value={businessInfo.businessDescription}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, businessDescription: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows="3"
                      placeholder="İşletmenizi tanıtın..."
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kaydediliyor...
                    </div>
                  ) : (
                    'Kayıt Ol'
                  )}
                </button>
              </div>
            </form>
          )}
          
          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-600 text-base">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
