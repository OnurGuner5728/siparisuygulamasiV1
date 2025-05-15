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
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-500 p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-xl mx-auto shadow-xl">
        <div className="px-8 pt-10 pb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Hesap Oluştur</h2>
            <p className="text-gray-500 text-sm">Lütfen bilgilerinizi girin</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="bg-red-50 p-3 rounded-xl">
                <p className="text-red-600 text-sm">{errors.form}</p>
              </div>
            )}
            
            <div className="bg-orange-50 p-4 rounded-xl mb-6">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <input
                    id="role-customer"
                    name="role"
                    type="radio"
                    value="customer"
                    className="h-5 w-5 text-orange-500 focus:ring-orange-500 border-gray-300"
                    checked={formData.role === 'customer'}
                    onChange={handleChange}
                  />
                  <label htmlFor="role-customer" className="ml-2 block text-sm font-medium text-gray-700">
                    Müşteri olarak kayıt ol
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="role-merchant"
                    name="role"
                    type="radio"
                    value="merchant"
                    className="h-5 w-5 text-orange-500 focus:ring-orange-500 border-gray-300"
                    checked={formData.role === 'merchant'}
                    onChange={handleChange}
                  />
                  <label htmlFor="role-merchant" className="ml-2 block text-sm font-medium text-gray-700">
                    İş Ortağı olarak kayıt ol (onay gerektirir)
                  </label>
                </div>
              </div>
            </div>
          
            {formData.role === 'merchant' && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-lg text-gray-800">İşletme Bilgileri</h3>
                
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">İşletme Adı</label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    className={`w-full bg-white rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 border ${
                      errors.businessName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="İşletme Adınız"
                    value={formData.businessName}
                    onChange={handleChange}
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    required
                    className={`w-full bg-white rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 border ${
                      errors.categoryId ? 'border-red-500' : 'border-gray-300'
                    }`}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alt Kategoriler</label>
                    <div className="max-h-48 overflow-y-auto p-3 border border-gray-300 rounded-xl bg-white">
                      {filteredSubcategories.map(subcategory => (
                        <div key={subcategory.id} className="flex items-center mb-2">
                          <input
                            id={`subcategory-${subcategory.id}`}
                            type="checkbox"
                            value={subcategory.id}
                            checked={selectedSubcategories.includes(subcategory.id)}
                            onChange={handleSubcategoryChange}
                            className="h-5 w-5 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`subcategory-${subcategory.id}`} className="ml-2 block text-sm text-gray-700">
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
                
                <div>
                  <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-1">İşletme Adresi</label>
                  <textarea
                    id="businessAddress"
                    name="businessAddress"
                    rows="3"
                    required
                    className={`w-full bg-white rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 border ${
                      errors.businessAddress ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="İşletme Adresiniz"
                    value={formData.businessAddress}
                    onChange={handleChange}
                  />
                  {errors.businessAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessAddress}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700 mb-1">İşletme Telefonu</label>
                  <input
                    id="businessPhone"
                    name="businessPhone"
                    type="tel"
                    required
                    className={`w-full bg-white rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 border ${
                      errors.businessPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="05XX XXX XX XX"
                    value={formData.businessPhone}
                    onChange={handleChange}
                  />
                  {errors.businessPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessPhone}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-1">İşletme E-posta Adresi</label>
                  <input
                    id="businessEmail"
                    name="businessEmail"
                    type="email"
                    required
                    className={`w-full bg-white rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 border ${
                      errors.businessEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="isletme@ornek.com"
                    value={formData.businessEmail}
                    onChange={handleChange}
                  />
                  {errors.businessEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessEmail}</p>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg text-gray-800 mt-6">Yetkili Bilgileri</h3>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.role === 'customer' ? 'Ad' : 'Yetkili Adı'}
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  className={`w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 border ${
                    errors.firstName ? 'border-red-500' : 'border-transparent'
                  }`}
                  placeholder={formData.role === 'customer' ? 'Adınız' : 'Yetkili Adı'}
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.role === 'customer' ? 'Soyad' : 'Yetkili Soyadı'}
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  className={`w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 border ${
                    errors.lastName ? 'border-red-500' : 'border-transparent'
                  }`}
                  placeholder={formData.role === 'customer' ? 'Soyadınız' : 'Yetkili Soyadı'}
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {formData.role === 'customer' ? 'E-posta Adresi' : 'Yetkili E-posta Adresi'}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 border ${
                  errors.email ? 'border-red-500' : 'border-transparent'
                }`}
                placeholder="ornek@mail.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                {formData.role === 'customer' ? 'Telefon' : 'Yetkili Telefonu'}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className={`w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 border ${
                  errors.phone ? 'border-red-500' : 'border-transparent'
                }`}
                placeholder="05XX XXX XX XX"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 border ${
                  errors.password ? 'border-red-500' : 'border-transparent'
                }`}
                placeholder="• • • • • • • •"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Şifre Tekrar</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={`w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-transparent'
                }`}
                placeholder="• • • • • • • •"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
            
            {formData.role === 'customer' && (
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  required
                  className={`w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 border ${
                    errors.address ? 'border-red-500' : 'border-transparent'
                  }`}
                  placeholder="Teslimat Adresiniz"
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
            )}
            
            <div className="flex items-center mt-4">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-orange-500 focus:ring-orange-500 rounded border-gray-300"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                <span>Kullanım koşullarını ve gizlilik politikasını kabul ediyorum</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition duration-200 ease-in-out mt-6"
            >
              {isSubmitting ? 'Kaydınız Oluşturuluyor...' : 'Kayıt Ol'}
            </button>
            
            <div className="text-center mt-4">
              <p className="text-gray-600 text-sm">
                Zaten hesabınız var mı?{' '}
                <Link href="/login" className="text-orange-500 font-medium">
                  Giriş Yap
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 