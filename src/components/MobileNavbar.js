'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function MobileNavbar({ onCartClick }) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { totalItems, forceRender } = useCart();
  
  // Debug: forceRender değişikliklerini izle
  React.useEffect(() => {
    console.log('🎨 [MOBILE] forceRender değişti:', forceRender, 'totalItems:', totalItems);
  }, [forceRender, totalItems]);

  // Mobil navbar'ın gösterilmeyeceği sayfalar
  const hiddenPaths = ['/login', '/register', '/admin', '/store'];
  const shouldHide = hiddenPaths.some(path => pathname?.startsWith(path));

  if (shouldHide) return null;

  const isActive = (path) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 backdrop-blur-sm bg-white/95">
      <div className="flex items-center justify-between py-3 px-4 max-w-md mx-auto">
        {/* Home */}
        <Link href="/" className="flex flex-col items-center py-1 px-2 min-w-0 flex-1">
          <div className={`p-2 rounded-xl transition-colors ${
            isActive('/') 
              ? 'bg-orange-100 text-orange-600' 
              : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50'
          }`}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
          </div>
          <span className={`text-xs mt-1 text-center ${
            isActive('/') ? 'text-orange-600 font-medium' : 'text-gray-500'
          }`}>
            Ana Sayfa
          </span>
        </Link>

        {/* Sepetim */}
        <button onClick={onCartClick} className="flex flex-col items-center py-1 px-2 min-w-0 flex-1">
          <div className="relative p-2 rounded-xl transition-colors text-gray-500 hover:text-orange-500 hover:bg-orange-50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-xs mt-1 text-gray-500 text-center">Sepetim</span>
        </button>

        {/* Siparişlerim */}
        {isAuthenticated ? (
          <Link href="/profil/siparisler" className="flex flex-col items-center py-1 px-2 min-w-0 flex-1">
            <div className={`p-2 rounded-xl transition-colors ${
              isActive('/profil/siparisler') 
                ? 'bg-orange-100 text-orange-600' 
                : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <span className={`text-xs mt-1 text-center ${
              isActive('/profil/siparisler') ? 'text-orange-600 font-medium' : 'text-gray-500'
            }`}>
              Siparişlerim
            </span>
          </Link>
        ) : (
          <Link href="/login" className="flex flex-col items-center py-1 px-2 min-w-0 flex-1">
            <div className="p-2 rounded-xl transition-colors text-gray-500 hover:text-orange-500 hover:bg-orange-50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <span className="text-xs mt-1 text-gray-500 text-center">Siparişlerim</span>
          </Link>
        )}

        {/* Profilim */}
        {isAuthenticated ? (
          <Link href="/profil" className="flex flex-col items-center py-1 px-2 min-w-0 flex-1">
            <div className={`p-2 rounded-xl transition-colors ${
              isActive('/profil') && !isActive('/profil/siparisler')
                ? 'bg-orange-100 text-orange-600' 
                : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50'
            }`}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
            </div>
            <span className={`text-xs mt-1 text-center ${
              isActive('/profil') && !isActive('/profil/siparisler') ? 'text-orange-600 font-medium' : 'text-gray-500'
            }`}>
              Profilim
            </span>
          </Link>
        ) : (
          <Link href="/login" className="flex flex-col items-center py-1 px-2 min-w-0 flex-1">
            <div className="p-2 rounded-xl transition-colors text-gray-500 hover:text-orange-500 hover:bg-orange-50">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
            </div>
            <span className="text-xs mt-1 text-gray-500 text-center">Giriş Yap</span>
          </Link>
        )}
      </div>
    </div>
  );
} 