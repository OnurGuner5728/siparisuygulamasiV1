'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('E-posta doğrulanıyor...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL'den hash parametrelerini al
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        // Eğer email confirmation ise
        if (type === 'signup') {
          if (accessToken && refreshToken) {
            // Session'ı elle ayarla
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (error) {
              throw error;
            }

            if (data.user) {
              setStatus('success');
              setMessage('E-posta başarıyla doğrulandı! Giriş yapılıyor...');
              
              // 2 saniye bekle ve ana sayfaya yönlendir
              setTimeout(() => {
                router.push('/');
              }, 2000);
            } else {
              throw new Error('Kullanıcı bilgileri alınamadı');
            }
          } else {
            throw new Error('Gerekli parametreler eksik');
          }
        } else {
          // Diğer callback türleri için standart işlem
          const { error } = await supabase.auth.getSessionFromUrl();
          
          if (error) {
            throw error;
          }

          setStatus('success');
          setMessage('Doğrulama başarılı! Yönlendiriliyorsunuz...');
          
          setTimeout(() => {
            router.push('/');
          }, 2000);
        }

      } catch (error) {
        console.error('Auth callback hatası:', error);
        setStatus('error');
        setMessage('Doğrulama sırasında bir hata oluştu: ' + error.message);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-4 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-auto shadow-2xl text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Doğrulanıyor...</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="bg-green-500 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Başarılı!</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="bg-red-500 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Hata!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/register')}
                className="w-full bg-orange-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
              >
                Tekrar Kayıt Ol
              </button>
              <button
                onClick={() => router.push('/login')}
                className="w-full border-2 border-orange-500 text-orange-500 py-3 px-6 rounded-xl font-semibold hover:bg-orange-50 transition-colors"
              >
                Giriş Yap
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-auto shadow-2xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Doğrulanıyor...</h2>
          <p className="text-gray-600">E-posta doğrulanıyor...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
} 
