'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!email) {
      setError('Lütfen e-posta adresinizi girin');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Geçerli bir e-posta adresi girin');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // API çağrısı burada gerçekleştirilecek
      // Şimdilik sadece simülasyon yapıyoruz
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Başarıyla gönderildiğini varsayalım
      setSuccess(true);
    } catch (error) {
      setError('Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Şifre sıfırlama hatası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-500 p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-md mx-auto shadow-xl">
        <div className="px-8 pt-10 pb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Şifremi Unuttum</h2>
            <p className="text-gray-500 text-sm">
              {!success 
                ? 'Şifrenizi sıfırlamak için e-posta adresinizi girin' 
                : 'Şifre sıfırlama bağlantısı gönderildi'}
            </p>
          </div>
          
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 p-3 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta Adresi
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 border-none"
                  placeholder="ornekmail@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition duration-200 ease-in-out disabled:opacity-70"
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
              </button>
              
              <div className="text-center mt-4">
                <Link href="/login" className="text-orange-500 text-sm font-medium">
                  Giriş sayfasına dön
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 p-5 rounded-xl text-center">
                <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">E-posta Gönderildi</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi. 
                  Lütfen e-postanızı kontrol edin.
                </p>
                <p className="text-gray-500 text-xs">
                  E-posta 5-10 dakika içinde gelmezse, spam klasörünü kontrol edin veya tekrar deneyin.
                </p>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Link href="/login" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition duration-200 ease-in-out text-center">
                  Giriş Sayfasına Dön
                </Link>
                <button 
                  onClick={() => setSuccess(false)} 
                  className="text-gray-500 text-sm font-medium underline"
                >
                  Farklı bir e-posta adresi dene
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 