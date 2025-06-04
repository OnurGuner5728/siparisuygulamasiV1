'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  
  useEffect(() => {
    // Animasyon sıralaması
    const timeout1 = setTimeout(() => setShowBackground(true), 300);
    const timeout2 = setTimeout(() => setShowLogo(true), 800);
    const timeout3 = setTimeout(() => setShowText(true), 1200);
    
    // 3 saniye sonra otomatik yönlendirme
    const timeout4 = setTimeout(() => {
      if (!authLoading) {
        if (isAuthenticated) {
          // Giriş yapılmışsa ana sayfaya
          router.push('/');
        } else {
          // Giriş yapılmamışsa onboarding'e
          // Onboarding görülmüş mü kontrol et
          const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
          if (hasSeenOnboarding === 'true') {
            router.push('/login');
          } else {
            router.push('/onboarding');
          }
        }
        
        // Splash görüldüğünü işaretle
        localStorage.setItem('hasSeenSplash', 'true');
      }
    }, 3000);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
    };
  }, [router, isAuthenticated, authLoading]);
  
  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden transition-all duration-1000 ${
        showBackground ? 'bg-gradient-to-br from-orange-500 to-red-600' : ''
      }`}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Logo */}
        <div 
          className={`relative w-32 h-32 mb-4 transform transition-all duration-700 ${
            showLogo ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
        >
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-xl">
           <img src="/images/logo/buyuklogo.jpeg" alt="easysiparis" className="w-full h-full object-contain rounded-full" />
          </div>
        </div>
        
        {/* App Name */}
        <div 
          className={`text-center transition-all duration-700 transform ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="text-3xl font-bold text-white mb-2">easysiparis</h1>
          <p className="text-white opacity-90 text-sm">Lezzetler Kapınızda</p>
        </div>
      </div>
      
      {/* Dekoratif elementler */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Sağ üst köşedeki daire */}
        <div 
          className={`absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white opacity-10 transition-all duration-1000 transform ${
            showBackground ? 'scale-100' : 'scale-0'
          }`}
        />
        
        {/* Sol alt köşedeki daire */}
        <div 
          className={`absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white opacity-10 transition-all duration-1000 transform ${
            showBackground ? 'scale-100 delay-200' : 'scale-0'
          }`}
        />
        
        {/* Orta sağdaki küçük daire */}
        <div 
          className={`absolute top-1/2 -right-8 w-24 h-24 rounded-full bg-white opacity-10 transition-all duration-1000 transform ${
            showBackground ? 'scale-100 delay-400' : 'scale-0'
          }`}
        />
      </div>
      
      {/* Loading indikatörü */}
      <div 
        className={`absolute bottom-20 transition-opacity duration-500 ${
          showText ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
} 
