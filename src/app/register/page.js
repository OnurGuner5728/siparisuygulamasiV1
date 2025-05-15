'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { mockCategories, mockSubcategories } from '../data/mockdatas';

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

  // Kategori değiştiğinde alt kategori listesini güncelle
  useEffect(() => {
    if (formData.categoryId) {
      const categoryId = parseInt(formData.categoryId);
      const subs = mockSubcategories.filter(sub => sub.parentId === categoryId);
      setFilteredSubcategories(subs);
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.categoryId]);

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
      // AuthContext'in register fonksiyonunu çağırıyoruz
      const fullName = `${formData.firstName} ${formData.lastName}`;
      const userRole = formData.role === 'customer' ? 'user' : 'store';
      
      let result;
      
      if (userRole === 'store') {
        // İş ortağı kaydı için gerekli bilgileri hazırla
        const businessData = {
          businessName: formData.businessName,
          businessPhone: formData.businessPhone,
          businessEmail: formData.businessEmail,
          businessAddress: formData.businessAddress,
          categoryId: formData.categoryId,
          subcategories: formData.subcategories,
          phone: formData.phone
        };
        
        result = register(fullName, formData.email, formData.password, userRole, businessData);
      } else {
        // Normal kullanıcı kaydı
        result = register(fullName, formData.email, formData.password, userRole);
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
      setErrors({ form: 'Kayıt oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.' });
      console.error('Kayıt hatası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Yeni Hesap Oluştur
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Giriş yapın
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.form && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{errors.form}</div>
            </div>
          )}
          
          <div>
            <div className="flex items-center mb-4">
              <input
                id="role-customer"
                name="role"
                type="radio"
                value="customer"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                checked={formData.role === 'customer'}
                onChange={handleChange}
              />
              <label htmlFor="role-customer" className="ml-2 block text-sm text-gray-900">
                Müşteri olarak kayıt ol
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="role-merchant"
                name="role"
                type="radio"
                value="merchant"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                checked={formData.role === 'merchant'}
                onChange={handleChange}
              />
              <label htmlFor="role-merchant" className="ml-2 block text-sm text-gray-900">
                İş Ortağı olarak kayıt ol (onay gerektirir)
              </label>
            </div>
          </div>
          
          <div className="rounded-md shadow-sm -space-y-px">
            {formData.role === 'merchant' && (
              <>
                <div className="mb-4">
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">İşletme Adı</label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                      errors.businessName ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                    placeholder="İşletme Adı"
                    value={formData.businessName}
                    onChange={handleChange}
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    required
                    className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                      errors.categoryId ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                    value={formData.categoryId}
                    onChange={handleChange}
                  >
                    <option value="">Kategori Seçin</option>
                    {mockCategories.filter(cat => ['Yemek', 'Market', 'Su'].includes(cat.name)).map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                  )}
                </div>
                
                {formData.categoryId && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alt Kategoriler</label>
                    <div className="max-h-48 overflow-y-auto p-2 border border-gray-300 rounded-md">
                      {filteredSubcategories.map(subcategory => (
                        <div key={subcategory.id} className="flex items-center mb-2">
                          <input
                            id={`subcategory-${subcategory.id}`}
                            type="checkbox"
                            value={subcategory.id}
                            checked={selectedSubcategories.includes(subcategory.id)}
                            onChange={handleSubcategoryChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`subcategory-${subcategory.id}`} className="ml-2 block text-sm text-gray-900">
                            {subcategory.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.subcategories && (
                      <p className="mt-1 text-sm text-red-600">{errors.subcategories}</p>
                    )}
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-1">İşletme Adresi</label>
                  <textarea
                    id="businessAddress"
                    name="businessAddress"
                    rows="3"
                    required
                    className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                      errors.businessAddress ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                    placeholder="İşletme Adresi"
                    value={formData.businessAddress}
                    onChange={handleChange}
                  />
                  {errors.businessAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessAddress}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700 mb-1">İşletme Telefonu</label>
                  <input
                    id="businessPhone"
                    name="businessPhone"
                    type="tel"
                    required
                    className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                      errors.businessPhone ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                    placeholder="İşletme Telefonu"
                    value={formData.businessPhone}
                    onChange={handleChange}
                  />
                  {errors.businessPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessPhone}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-1">İşletme E-posta Adresi</label>
                  <input
                    id="businessEmail"
                    name="businessEmail"
                    type="email"
                    required
                    className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                      errors.businessEmail ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                    placeholder="İşletme E-posta Adresi"
                    value={formData.businessEmail}
                    onChange={handleChange}
                  />
                  {errors.businessEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessEmail}</p>
                  )}
                </div>
                
                <div className="mt-8 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">Yetkili Bilgileri</h3>
                </div>
              </>
            )}
            
            <div className="grid grid-cols-1 gap-y-2 gap-x-3 sm:grid-cols-2 mb-4">
              <div className="col-span-1">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.role === 'customer' ? 'Ad' : 'Yetkili Adı'}
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder={formData.role === 'customer' ? 'Ad' : 'Yetkili Adı'}
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>
              
              <div className="col-span-1">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.role === 'customer' ? 'Soyad' : 'Yetkili Soyadı'}
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder={formData.role === 'customer' ? 'Soyad' : 'Yetkili Soyadı'}
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {formData.role === 'customer' ? 'E-posta Adresi' : 'Yetkili E-posta Adresi'}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder={formData.role === 'customer' ? 'E-posta Adresi' : 'Yetkili E-posta Adresi'}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                {formData.role === 'customer' ? 'Telefon' : 'Yetkili Telefonu'}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder={formData.role === 'customer' ? 'Telefon Numarası' : 'Yetkili Telefon Numarası'}
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Şifre"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Şifre Tekrar</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Şifre Tekrar"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
            
            {formData.role === 'customer' && (
              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  required
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                    errors.address ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Teslimat Adresi"
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isSubmitting ? 'Kaydınız oluşturuluyor...' : 'Kayıt Ol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 