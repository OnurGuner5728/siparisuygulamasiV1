'use client';

import { useEffect, useState } from 'react';
import { useModule } from '@/contexts/ModuleContext';
import { useAuth } from '@/contexts/AuthContext';
import { FiLock } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * ModuleGuard - Bir modülün aktif olup olmadığını kontrol eden ve
 * yalnızca aktifse içeriği gösteren bir bileşen.
 * 
 * @param {Object} props
 * @param {string} props.moduleName - Kontrol edilecek modül adı ('yemek', 'market', 'su', 'aktuel')
 * @param {React.ReactNode} props.children - Koruma altındaki içerik
 * @param {string} props.fallbackUrl - Modül aktif değilse yönlendirilecek URL (isteğe bağlı)
 * @param {React.ReactNode} props.fallbackContent - Modül aktif değilse gösterilecek içerik (isteğe bağlı)
 */
export default function ModuleGuard({ moduleName, children, fallbackUrl, fallbackContent }) {
  const { isModuleEnabled, isLoading } = useModule();
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Sayfa client tarafında render edildiğinde modülün durumunu kontrol et
    if (!isLoading) {
      const moduleStatus = isModuleEnabled(moduleName);
      setIsEnabled(moduleStatus);
      
      // Eğer modül etkin değilse ve kullanıcı admin değilse ve fallbackUrl varsa yönlendir
      if (!moduleStatus && !(user && user.role === 'admin') && fallbackUrl) {
        router.push(fallbackUrl);
      }
    }
  }, [isLoading, moduleName, isModuleEnabled, user, fallbackUrl, router]);

  // Henüz yükleme aşamasındaysa bir şey gösterme
  if (isLoading) {
    return null;
  }

  // Modül etkinse veya kullanıcı admin ise içeriği göster
  if (isEnabled || (user && user.role === 'admin')) {
    return <>{children}</>;
  }

  // Özel fallback içeriği varsa göster
  if (fallbackContent) {
    return <>{fallbackContent}</>;
  }

  // Varsayılan olarak basit bir "erişim yok" mesajı göster
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
      <div className="bg-orange-100 text-orange-800 p-8 rounded-lg shadow-sm max-w-md">
        <FiLock className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Bu modül şu anda aktif değil</h2>
        <p className="mb-4">
          &ldquo;{moduleName}&rdquo; modülü sistem yöneticisi tarafından geçici olarak devre dışı bırakılmıştır.
        </p>
        <Link href="/" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md">
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
} 