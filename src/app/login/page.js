'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  
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
      router.push(redirectTo);
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
        // Başarılı giriş - redirect parametresine göre yönlendir
        router.push(redirectTo);
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
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-500 p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-md mx-auto shadow-xl">
        <div className="px-8 pt-10 pb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Giriş Yap</h2>
            <p className="text-gray-500 text-sm">
              {action === 'checkout' 
                ? 'Siparişi tamamlamak için giriş yapın' 
                : 'Lütfen bilgilerinizi girin'
              }
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && (
              <div className="bg-red-50 p-3 rounded-xl">
                <p className="text-red-600 text-sm">{errors.form}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.email ? 'border-2 border-red-500' : 'border-none'
                    }`}
                    placeholder="ornekmail@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Şifre</label>
                  <Link href="/forgot-password" className="text-orange-500 text-xs font-medium">
                    Şifremi Unuttum
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
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
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-orange-500 focus:ring-orange-500 rounded border-gray-300"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Beni Hatırla
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition duration-200 ease-in-out"
            >
              {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
          
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              Henüz hesabınız yok mu?{' '}
              <Link href="/register" className="text-orange-500 font-medium">
                Kayıt Ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 