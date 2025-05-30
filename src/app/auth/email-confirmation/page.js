'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function EmailConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // URL parametresinden e-posta adresini al
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!email) {
      setResendMessage('E-posta adresi bulunamadı. Lütfen tekrar kayıt olun.');
      return;
    }

    setIsResending(true);
    setResendMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      setResendMessage('✅ E-posta tekrar gönderildi! Gelen kutunuzu kontrol edin.');
      setCountdown(60); // 60 saniye bekletme
    } catch (error) {
      console.error('E-posta tekrar gönderme hatası:', error);
      setResendMessage('❌ E-posta gönderilirken hata oluştu: ' + error.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-4 flex items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-36 -translate-y-36"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48"></div>
      <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/30 rounded-full animate-bounce"></div>
      
      <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full mx-auto shadow-2xl backdrop-blur-sm">
        <div className="px-8 pt-12 pb-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              E-posta Doğrulama
            </h1>
            <p className="text-gray-600 text-base mb-6">
              Kayıt işleminiz başarıyla tamamlandı!
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  E-posta doğrulama linki gönderildi
                </h3>
                <div className="text-sm text-blue-700 space-y-2">
                  {email && (
                    <p className="break-all">
                      <strong>{email}</strong> adresine doğrulama e-postası gönderildi.
                    </p>
                  )}
                  <p>
                    E-postanızdaki doğrulama linkine tıklayarak hesabınızı aktifleştirin.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-800">Lütfen şu adımları takip edin:</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                <p className="text-gray-600">E-posta gelen kutunuzu kontrol edin</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                <p className="text-gray-600">FoodHub'dan gelen doğrulama e-postasını bulun</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                <p className="text-gray-600">"Hesabımı Doğrula" linkine tıklayın</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
                <p className="text-gray-600">Hesabınız aktifleştikten sonra giriş yapabilirsiniz</p>
              </div>
            </div>
          </div>

          {/* Spam Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-2">
              <svg className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-yellow-800 text-sm">
                  <strong>E-posta gelmedi mi?</strong> Spam/Junk klasörünüzü kontrol edin veya aşağıdaki butona tıklayarak tekrar gönderin.
                </p>
              </div>
            </div>
          </div>

          {/* Resend Message */}
          {resendMessage && (
            <div className={`mb-4 p-4 rounded-lg ${
              resendMessage.includes('✅') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <p className="text-sm">{resendMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Resend Email Button */}
            <button
              onClick={handleResendEmail}
              disabled={isResending || countdown > 0}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                isResending || countdown > 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
              }`}
            >
              {isResending ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Gönderiliyor...
                </div>
              ) : countdown > 0 ? (
                `Tekrar gönder (${countdown}s)`
              ) : (
                'E-postayı Tekrar Gönder'
              )}
            </button>

            {/* Back to Login */}
            <Link 
              href="/login"
              className="block w-full text-center py-3 px-6 border-2 border-orange-500 text-orange-500 rounded-xl font-semibold hover:bg-orange-50 transition-all duration-200"
            >
              Giriş Sayfasına Dön
            </Link>
          </div>

          {/* Help Text */}
          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm mb-2">
              Hala sorun yaşıyor musunuz?
            </p>
            <p className="text-gray-400 text-xs">
              Destek için{' '}
              <a href="mailto:support@foodhub.com" className="text-orange-500 hover:text-orange-600">
                support@foodhub.com
              </a>
              {' '}adresine e-posta gönderin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
