'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthRouter({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [hasSeenSplash, setHasSeenSplash] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Local storage'dan önceki ziyaret bilgilerini al - sadece bir kez
  useEffect(() => {
    const splashSeen = localStorage.getItem('hasSeenSplash');
    const onboardingSeen = localStorage.getItem('hasSeenOnboarding');
    
    setHasSeenSplash(splashSeen === 'true');
    setHasSeenOnboarding(onboardingSeen === 'true');
    setIsInitialized(true);
  }, []);

  // Path kategorilerini memoize et
  const pathCategories = useMemo(() => {
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

    return { publicPaths, protectedPaths, excludedPaths };
  }, []);

  // Rota tipini belirle - memoized
  const getPathType = useCallback((path) => {
    const { publicPaths, protectedPaths, excludedPaths } = pathCategories;
    
    if (excludedPaths.some(excludedPath => path.startsWith(excludedPath))) {
      return 'excluded';
    }
    
    if (publicPaths.some(publicPath => path === publicPath || path.startsWith(publicPath + '/'))) {
      return 'public';
    }
    
    if (protectedPaths.some(protectedPath => path.startsWith(protectedPath))) {
      return 'protected';
    }
    
    return 'unknown';
  }, [pathCategories]);

  // Navigation logic - sadece gerekli durumlarda çalışır
  useEffect(() => {
    if (!isInitialized || authLoading) return;

    const pathType = getPathType(pathname);
    
    // Excluded paths'de hiçbir şey yapma
    if (pathType === 'excluded') {
      return;
    }

    // Ana sayfa için özel mantık
    if (pathname === '/') {
      if (!isAuthenticated) {
        if (!hasSeenSplash) {
          router.push('/splash');
          return;
        }
        
        if (!hasSeenOnboarding) {
          router.push('/onboarding');
          return;
        }
        
        // Splash ve onboarding görülmüş, ana sayfada kalabilir
        return;
      }
      // Giriş yapmış kullanıcı ana sayfada - normal davranış
      return;
    }

    // Public paths - herkes erişebilir
    if (pathType === 'public') {
      return;
    }

    // Protected paths - auth gerekli
    if (pathType === 'protected') {
      if (!isAuthenticated) {
        localStorage.setItem('redirectAfterLogin', pathname);
        router.push('/login');
        return;
      }
      return;
    }

    // Unknown paths - varsayılan davranış
    if (process.env.NODE_ENV === 'development') {
      console.log('AuthRouter: Unknown path type for:', pathname);
    }
  }, [isAuthenticated, authLoading, isInitialized, hasSeenSplash, hasSeenOnboarding, pathname, router, getPathType]);

  // Splash completed tracking
  useEffect(() => {
    if (pathname === '/splash') {
      const timer = setTimeout(() => {
        localStorage.setItem('hasSeenSplash', 'true');
        setHasSeenSplash(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Loading state
  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return children;
} 