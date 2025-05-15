'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [tokenChecked, setTokenChecked] = useState(false);

  // Token kontrolü
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setTokenChecked(true);
      return;
    }

    // Normalde burada API ile token doğrulanır
    // Şimdilik sadece simülasyon yapıyoruz
    const checkToken = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Token'ın geçerli olduğunu varsayalım
        setTokenValid(true);
      } catch (error) {
        setTokenValid(false);
        console.error('Token doğrulama hatası:', error);
      } finally {
        setTokenChecked(true);
      }
    };

    checkToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    let formErrors = {};
    
    if (!formData.password) {
      formErrors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 8) {
      formErrors.password = 'Şifre en az 8 karakter olmalıdır';
    }
    
    if (!formData.confirmPassword) {
      formErrors.confirmPassword = 'Şifre onayı gereklidir';
    } else if (formData.password !== formData.confirmPassword) {
      formErrors.confirmPassword = 'Şifreler eşleşmiyor';
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
      // API çağrısı burada yapılacak
      // Şimdilik sadece simülasyon yapıyoruz
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Başarıyla değiştirildiğini varsayalım
      setSuccess(true);
    } catch (error) {
      setErrors({ form: 'Şifre sıfırlanırken bir hata oluştu. Lütfen tekrar deneyin.' });
      console.error('Şifre sıfırlama hatası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Token kontrolü tamamlanmadıysa yükleme göster
  if (!tokenChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-500 p-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl overflow-hidden max-w-md mx-auto shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Token doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  // Token geçersizse hata mesajı göster
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-500 p-4">
        <div className="bg-white rounded-3xl overflow-hidden max-w-md mx-auto shadow-xl">
          <div className="px-8 pt-10 pb-8 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Geçersiz veya Süresi Dolmuş Bağlantı</h2>
            <p className="text-gray-600 mb-6">
              Şifre sıfırlama bağlantınız geçersiz veya süresi dolmuş. Lütfen yeni bir şifre sıfırlama isteği gönderin.
            </p>
            <Link href="/forgot-password" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition duration-200 ease-in-out inline-block">
              Şifremi Unuttum
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-500 p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-md mx-auto shadow-xl">
        <div className="px-8 pt-10 pb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Şifre Sıfırlama</h2>
            <p className="text-gray-500 text-sm">
              {!success ? 'Lütfen yeni şifrenizi belirleyin' : 'Şifreniz başarıyla sıfırlandı'}
            </p>
          </div>
          
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.form && (
                <div className="bg-red-50 p-3 rounded-xl">
                  <p className="text-red-600 text-sm">{errors.form}</p>
                </div>
              )}
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Yeni Şifre
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={`w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.password ? 'border-2 border-red-500' : 'border-none'
                  }`}
                  placeholder="• • • • • • • •"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Şifreniz en az 8 karakter uzunluğunda olmalıdır
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre Tekrar
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className={`w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.confirmPassword ? 'border-2 border-red-500' : 'border-none'
                  }`}
                  placeholder="• • • • • • • •"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition duration-200 ease-in-out disabled:opacity-70"
              >
                {isSubmitting ? 'İşleniyor...' : 'Şifreyi Sıfırla'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 p-5 rounded-xl text-center">
                <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Şifre Başarıyla Sıfırlandı</h3>
                <p className="text-gray-600 text-sm">
                  Şifreniz başarıyla değiştirildi. Artık yeni şifrenizle giriş yapabilirsiniz.
                </p>
              </div>
              
              <Link href="/login" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition duration-200 ease-in-out text-center block">
                Giriş Sayfasına Git
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 