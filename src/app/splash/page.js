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
    
    // Belirli bir süre sonra yönlendir - giriş yapılmışsa ana sayfaya, yapılmamışsa onboarding'e
    const timeout4 = setTimeout(() => {
      if (!authLoading) {
        if (isAuthenticated) {
          router.push('/'); // Giriş yapılmışsa ana sayfaya
        } else {
          router.push('/onboarding'); // Giriş yapılmamışsa onboarding'e
        }
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
            <svg className="w-16 h-16 text-orange-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
            </svg>
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