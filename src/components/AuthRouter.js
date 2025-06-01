'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthRouter({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [hasSeenSplash, setHasSeenSplash] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Local storage'dan önceki ziyaret bilgilerini al
  useEffect(() => {
    const splashSeen = localStorage.getItem('hasSeenSplash');
    const onboardingSeen = localStorage.getItem('hasSeenOnboarding');
    
    setHasSeenSplash(splashSeen === 'true');
    setHasSeenOnboarding(onboardingSeen === 'true');
    setIsInitialized(true);
  }, []);

  // Public rotalar - giriş yapmadan erişilebilir
  const publicPaths = [
    '/',
    '/yemek',
    '/su', 
    '/market',
    '/cicek',
    '/aktuel',
    '/hakkimizda',
    '/iletisim',
    '/cerez-politikasi',
    '/gizlilik-politikasi',
    '/kullanim-kosullari',
    '/search',
    '/yardim'
  ];

  // Protected rotalar - giriş gerekli
  const protectedPaths = [
    '/profil',
    '/sepet',
    '/checkout',
    '/admin',
    '/store',
    '/delivery',
    '/kampanyalar'
  ];

  // Auth routing mantığından hariç tutulan sayfalar
  const excludedPaths = ['/splash', '/onboarding', '/login', '/register', '/auth', '/forgot-password', '/reset-password'];

  // Rota tipini belirle
  const isPublicPath = (path) => {
    return publicPaths.some(publicPath => 
      path === publicPath || path.startsWith(publicPath + '/')
    );
  };

  const isProtectedPath = (path) => {
    return protectedPaths.some(protectedPath => 
      path.startsWith(protectedPath)
    );
  };

  const isExcludedPath = (path) => {
    return excludedPaths.some(excludedPath => 
      path.startsWith(excludedPath)
    );
  };

  // Auth durumu değiştiğinde ve sayfa yüklendiğinde routing mantığı
  useEffect(() => {
    if (!isInitialized || authLoading) return;

    // Auth routing mantığından hariç tutulan sayfalar
    if (isExcludedPath(pathname)) {
      return; // Bu sayfalarda otomatik yönlendirme yapma
    }

    // Ana sayfa için özel mantık - splash ve onboarding kontrolü
    if (pathname === '/') {
      if (!isAuthenticated) {
        // Giriş yapmamış kullanıcı ana sayfada
        if (!hasSeenSplash) {
          // İlk kez açılış - splash göster
          router.push('/splash');
          return;
        }
        
        if (!hasSeenOnboarding) {
          // Splash gösterilmiş ama onboarding gösterilmemiş
          router.push('/onboarding');
          return;
        }
        
        // Splash ve onboarding görülmüş, ana sayfada kalabilir
        return;
      }
      // Giriş yapmış kullanıcı ana sayfada - normal davranış
      return;
    }

    // Diğer public rotalarda giriş yapmamış kullanıcılara serbestlik
    if (isPublicPath(pathname)) {
      // Public rotada - giriş yapmamış kullanıcı da erişebilir
      return; // Normal davranış, yönlendirme yapma
    }

    // Protected rotalarda auth kontrolü
    if (isProtectedPath(pathname)) {
      if (!isAuthenticated) {
        // Protected rotada ve giriş yapmamış - login'e yönlendir
        router.push('/login');
        return;
      }
      // Protected rotada ve giriş yapmış - normal davranış
      return;
    }

    // Diğer durumlarda normal davranış
    return;
    
  }, [isAuthenticated, authLoading, isInitialized, hasSeenSplash, hasSeenOnboarding, pathname, router]);

  // Splash ve onboarding tamamlandığında local storage'ı güncelle
  useEffect(() => {
    if (pathname === '/splash') {
      // Splash sayfasından çıkıldığında işaretle
      const timer = setTimeout(() => {
        localStorage.setItem('hasSeenSplash', 'true');
        setHasSeenSplash(true);
      }, 3000); // 3 saniye sonra (splash animasyonu tamamlandığında)

      return () => clearTimeout(timer);
    }

    if (pathname === '/onboarding') {
      // Onboarding tamamlandığında localStorage güncellenecek
      // Bu işlem onboarding sayfasının kendi içinde yapılacak
    }
  }, [pathname]);

  // Loading durumunda spinner göster
  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return children;
} 