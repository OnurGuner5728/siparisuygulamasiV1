'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import supabase from '@/lib/supabase';

function AuthConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('confirming'); // confirming, success, error
  const [message, setMessage] = useState('E-posta adresiniz doğrulanıyor...');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const next = searchParams.get('next') || '/';
        const error = searchParams.get('error');
        const error_code = searchParams.get('error_code');
        const error_description = searchParams.get('error_description');

        console.log('Confirmation params:', {
          token_hash: token_hash?.substring(0, 10) + '...',
          type,
          next,
          error,
          error_code,
          error_description
        });

        setDebugInfo(`Token: ${token_hash ? 'Mevcut' : 'Yok'}, Type: ${type || 'Yok'}, Error: ${error || 'Yok'}`);

        // Eğer URL'de hata varsa direk hata göster
        if (error) {
          setStatus('error');
          setMessage(`Doğrulama hatası: ${error_description || error}`);
          return;
        }

        if (token_hash && type) {
          console.log('Attempting to verify OTP...');
          
          const { data, error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
          });

          console.log('Verify OTP result:', { data, error });

          if (error) {
            console.error('Email confirmation error:', error);
            setStatus('error');
            setMessage(`E-posta doğrulama başarısız: ${error.message}`);
            setDebugInfo(debugInfo + ` | Error: ${error.message}`);
          } else {
            console.log('Email confirmed successfully!');
            setStatus('success');
            setMessage('E-posta adresiniz başarıyla doğrulandı! Giriş sayfasına yönlendiriliyorsunuz...');
            
            // 2 saniye sonra yönlendir
            setTimeout(() => {
              router.push('/login?confirmed=true');
            }, 2000);
          }
        } else {
          setStatus('error');
          setMessage('Geçersiz doğrulama bağlantısı. Token veya tip bilgisi eksik.');
          setDebugInfo(debugInfo + ' | Token veya type eksik');
        }
      } catch (error) {
        console.error('Confirmation process error:', error);
        setStatus('error');
        setMessage(`Doğrulama işlemi sırasında bir hata oluştu: ${error.message}`);
        setDebugInfo(debugInfo + ` | Catch Error: ${error.message}`);
      }
    };

    confirmEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md w-full">
        {status === 'confirming' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">E-posta Doğrulanıyor</h2>
            <p className="text-gray-600">{message}</p>
            {debugInfo && (
              <p className="text-xs text-gray-400 mt-2 bg-gray-100 p-2 rounded">{debugInfo}</p>
            )}
          </>
        )}

        {status === 'success' && (
          <>
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Başarılı!</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Doğrulama Başarısız</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            {debugInfo && (
              <p className="text-xs text-gray-400 mb-4 bg-gray-100 p-2 rounded">{debugInfo}</p>
            )}
            <div className="space-y-3">
              <a
                href="/login"
                className="block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition"
              >
                Giriş Sayfasına Git
              </a>
              <a
                href="/register"
                className="block w-full border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 dark:bg-gray-900 transition"
              >
                Yeniden Kayıt Ol
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthConfirmContent />
    </Suspense>
  );
} 
