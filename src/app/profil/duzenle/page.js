'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiCheck, FiCamera, FiX, FiUpload } from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';
import AuthGuard from '../../../components/AuthGuard';
import Image from 'next/image';

export default function EditProfile() {
  return (
    <AuthGuard requiredRole="any_auth">
      <EditProfileContent />
    </AuthGuard>
  );
}

function EditProfileContent() {
  const { user, updateProfile, updateAvatar } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Avatar yükleme state'leri
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setLoading(false);
    }
  }, [user]);

  // Avatar dosya seçimi
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Dosya tipini kontrol et
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ ...errors, avatar: 'Sadece JPG, PNG, GIF ve WebP formatındaki resimler yüklenebilir.' });
      return;
    }

    // Dosya boyutunu kontrol et (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors({ ...errors, avatar: 'Dosya boyutu 5MB\'dan küçük olmalıdır.' });
      return;
    }

    // Önizleme oluştur
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    setAvatarFile(file);
    setErrors({ ...errors, avatar: null });
  };

  // Avatar yükle
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setAvatarUploading(true);
    try {
      const result = await updateAvatar(avatarFile);
      if (result.success) {
        setSuccess('Profil fotoğrafınız başarıyla güncellendi.');
        setAvatarFile(null);
        setAvatarPreview(null);
        
        // 3 saniye sonra başarı mesajını kaldır
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Avatar yüklenirken hata:', error);
      setErrors({ ...errors, avatar: error.message || 'Profil fotoğrafı yüklenirken hata oluştu.' });
    } finally {
      setAvatarUploading(false);
    }
  };

  // Avatar önizlemesini iptal et
  const handleAvatarCancel = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setErrors({ ...errors, avatar: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Ad Soyad gereklidir';
    }
    
    if (!formData.email) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Telefon numarası gereklidir';
    }
    
    // Şifre değişikliği yapılacaksa kontrol et
    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Mevcut şifre gereklidir';
      }
      
      if (!formData.newPassword) {
        newErrors.newPassword = 'Yeni şifre gereklidir';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Şifre en az 6 karakter olmalıdır';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Şifreler eşleşmiyor';
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Profil bilgilerini güncelle
      const updates = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      await updateProfile(updates);
      
      // Başarılı işlem mesajı
      setSuccess('Profil bilgileriniz başarıyla güncellendi.');
      
      // Şifre alanlarını temizle
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      setErrors({ general: error.message || 'Profil güncellenirken hata oluştu.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Başlık */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              className="mr-3 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              aria-label="Geri"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Profil Bilgilerim</h1>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {success && (
          <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <FiCheck className="text-green-500 mr-2" size={20} />
            <p>{success}</p>
          </div>
        )}

        {errors.general && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p>{errors.general}</p>
          </div>
        )}

        {/* Profil Fotoğrafı */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Profil Fotoğrafı</h2>
          
          <div className="flex flex-col items-center space-y-4">
            {/* Avatar Görüntüsü */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar Önizleme"
                    className="w-full h-full object-cover"
                  />
                ) : user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Profil Fotoğrafı"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiUser size={48} />
                  </div>
                )}
              </div>
              
              {/* Kamera İkonu */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-orange-500 text-white rounded-full p-2 shadow-lg hover:bg-orange-600 transition-colors"
                disabled={avatarUploading}
              >
                <FiCamera size={16} />
              </button>
            </div>

            {/* Dosya Seçimi */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />

            {/* Avatar Önizleme Kontrolleri */}
            {avatarPreview && (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleAvatarUpload}
                  disabled={avatarUploading}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {avatarUploading ? (
                    <>
                      <div className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-r-2 border-white"></div>
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <FiUpload className="mr-2" size={16} />
                      Kaydet
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleAvatarCancel}
                  className="flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-9000 text-white rounded-lg hover:bg-gray-600"
                >
                  <FiX className="mr-2" size={16} />
                  İptal
                </button>
              </div>
            )}

            {errors.avatar && (
              <p className="text-sm text-red-600 text-center">{errors.avatar}</p>
            )}

            <p className="text-sm text-gray-500 text-center">
              JPG, PNG, GIF veya WebP formatında, maksimum 5MB
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Kişisel Bilgiler */}
          <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Kişisel Bilgiler</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                  Ad Soyad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border ${
                      errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                    } rounded-lg focus:outline-none focus:ring-2`}
                    placeholder="Ad Soyad"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  E-posta
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border ${
                      errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                    } rounded-lg focus:outline-none focus:ring-2`}
                    placeholder="E-posta"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                  Telefon
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border ${
                      errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                    } rounded-lg focus:outline-none focus:ring-2`}
                    placeholder="Telefon Numarası"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>
            </div>
          </div>
          
          {/* Şifre Değiştirme */}
          <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Şifre Değiştirme</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="currentPassword">
                  Mevcut Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border ${
                      errors.currentPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                    } rounded-lg focus:outline-none focus:ring-2`}
                    placeholder="Mevcut Şifre"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <FiEyeOff className="text-gray-400" /> : <FiEye className="text-gray-400" />}
                  </button>
                </div>
                {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newPassword">
                  Yeni Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border ${
                      errors.newPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                    } rounded-lg focus:outline-none focus:ring-2`}
                    placeholder="Yeni Şifre"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <FiEyeOff className="text-gray-400" /> : <FiEye className="text-gray-400" />}
                  </button>
                </div>
                {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
                  Yeni Şifre (Tekrar)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border ${
                      errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                    } rounded-lg focus:outline-none focus:ring-2`}
                    placeholder="Yeni Şifre (Tekrar)"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff className="text-gray-400" /> : <FiEye className="text-gray-400" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>
          
          {/* Alt Butonlar (Sabit) */}
          <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-3 px-4 rounded-lg shadow-sm hover:from-orange-600 hover:to-red-700 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 animate-spin rounded-full h-5 w-5 border-t-2 border-r-2 border-white"></div>
                  Güncelleniyor...
                </>
              ) : (
                'Değişiklikleri Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
