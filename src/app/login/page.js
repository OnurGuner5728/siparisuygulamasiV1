'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/lib/supabase';

// SearchParams için ayrı bir bileşen oluşturuyoruz
function LoginContent() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL parametrelerini al
  const redirectTo = searchParams.get('redirect') || '/';
  const action = searchParams.get('action');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Zaten login olmuş kullanıcıları redirect et
  useEffect(() => {
    if (isAuthenticated) {
      // localStorage'dan redirect URL'i kontrol et
      const storedRedirect = localStorage.getItem('redirectAfterLogin');
      if (storedRedirect) {
        localStorage.removeItem('redirectAfterLogin');
        router.push(storedRedirect);
      } else {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, router, redirectTo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    let formErrors = {};
    
    if (!formData.email) {
      formErrors.email = 'E-posta adresi gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      formErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!formData.password) {
      formErrors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 6) {
      formErrors.password = 'Şifre en az 6 karakter olmalıdır';
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
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Başarılı giriş - localStorage'dan redirect kontrol et
        const storedRedirect = localStorage.getItem('redirectAfterLogin');
        if (storedRedirect) {
          localStorage.removeItem('redirectAfterLogin');
          router.push(storedRedirect);
        } else {
          router.push(redirectTo);
        }
      } else {
        // Başarısız giriş
        setErrors({ form: result.message || 'Giriş yapılırken bir hata oluştu' });
      }
    } catch (error) {
      setErrors({ form: 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.' });
      console.error('Giriş hatası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-4 flex items-center justify-center relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-36 -translate-y-36"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48"></div>
      <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/30 rounded-full animate-bounce"></div>
      
      <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full mx-auto shadow-2xl backdrop-blur-sm">
        <div className="px-8 pt-12 pb-8">
          {/* Logo/Brand Section */}
          <div className="text-center mb-10">
              <img src="/images/logo/logo.jpg" alt="logo" className="w-50 h-50" />
           
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Hoş Geldiniz!</h2>
            <p className="text-gray-500 text-base">
              {action === 'checkout' 
                ? 'Siparişi tamamlamak için hesabınıza giriş yapın' 
                : 'Hesabınıza giriş yapın ve lezzetin tadını çıkarın'
              }
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && (
              <div className="bg-red-50 p-3 rounded-xl">
                <p className="text-red-600 text-sm">{errors.form}</p>
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`w-full bg-gray-50 dark:bg-gray-900 border-2 rounded-2xl pl-12 pr-4 py-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-orange-500 transition-all duration-200 ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Şifre
                  </label>
                  <Link href="/forgot-password" className="text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors">
                    Şifremi Unuttum?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className={`w-full bg-gray-50 dark:bg-gray-900 border-2 rounded-2xl pl-12 pr-4 py-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-orange-500 transition-all duration-200 ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Şifrenizi girin"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="relative">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-5 w-5 text-orange-500 focus:ring-orange-500 rounded-md border-2 border-gray-300 focus:border-orange-500 transition-colors"
                />
              </div>
              <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-gray-600 select-none cursor-pointer">
                Beni Hatırla
              </label>
            </div>

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
                  Giriş yapılıyor...
                </div>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>
          
          <div className="text-center mt-8">
            <p className="text-gray-600 text-base">
              Henüz hesabınız yok mu?{' '}
              <Link href="/register" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                Kayıt Ol
              </Link>
            </p>
          </div>
          
          {/* Additional Security Info */}
          <div className="text-center mt-6 pt-6 border-t border-gray-100">
            <p className="text-gray-400 text-xs">
              Güvenli SSL şifreleme ile korunan giriş
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full mx-auto shadow-2xl">
          <div className="px-8 pt-12 pb-8 text-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Yükleniyor...</h2>
            <p className="text-gray-500">Giriş sayfası hazırlanıyor</p>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
} 
