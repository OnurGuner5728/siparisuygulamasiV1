'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useModule } from '../contexts/ModuleContext';

function Header({ onCartClick }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { isModuleEnabled } = useModule();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Menü dışına tıklandığında menüleri kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);
  
  return (
    <header className="bg-white shadow-md py-4 sticky top-0 z-40">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-orange-500">
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              SiparişApp
            </span>
          </Link>
        </div>
        
        {/* Mobil Menü Butonu */}
        <button 
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
        
        {/* Masaüstü Menü */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="text-gray-600 hover:text-orange-500 font-medium">Ana Sayfa</Link>
          
          {isModuleEnabled('yemek') && (
            <Link href="/yemek" className="text-gray-600 hover:text-orange-500 font-medium">Yemek</Link>
          )}
          
          {isModuleEnabled('market') && (
            <Link href="/market" className="text-gray-600 hover:text-orange-500 font-medium">Market</Link>
          )}
          
          {isModuleEnabled('su') && (
            <Link href="/su" className="text-gray-600 hover:text-orange-500 font-medium">Su</Link>
          )}
          
          {isModuleEnabled('aktuel') && (
            <Link href="/aktuel" className="text-gray-600 hover:text-orange-500 font-medium">Aktüel</Link>
          )}
        </nav>
        
        {/* Kullanıcı İşlemleri */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Sepet ikonu her zaman görünür */}
          <button 
            onClick={onCartClick}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-2 rounded-full hover:shadow-md transition-all relative"
            aria-label="Sepetim"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="text-gray-600 hover:text-orange-500 font-medium">
                Giriş Yap
              </Link>
              <Link href="/register" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full hover:shadow-md transition-all">
                Kayıt Ol
              </Link>
            </>
          ) : (
            <div className="relative user-menu-container">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center text-gray-600 hover:text-orange-500 font-medium"
              >
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </span>
                {user?.name || 'Kullanıcı'}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 w-48 mt-2 py-1 bg-white rounded-lg shadow-lg z-50">
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500">
                      Admin Paneli
                    </Link>
                  )}
                  {user?.role === 'store' && (
                    <Link href="/store" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500">
                      Mağaza Paneli
                    </Link>
                  )}
                  <Link href="/profil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500">
                    Profilim
                  </Link>
                  <Link href="/profil/siparisler" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500">
                    Siparişlerim
                  </Link>
                  <Link href="/profil/adresler" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500">
                    Adreslerim
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Mobil Menü (Açılır Panel) */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2 px-4 mt-4 shadow-md">
          <nav className="flex flex-col space-y-3 mb-4">
            <Link href="/" className="text-gray-600 hover:text-orange-500 py-2 font-medium">Ana Sayfa</Link>
            
            {isModuleEnabled('yemek') && (
              <Link href="/yemek" className="text-gray-600 hover:text-orange-500 py-2 font-medium">Yemek</Link>
            )}
            
            {isModuleEnabled('market') && (
              <Link href="/market" className="text-gray-600 hover:text-orange-500 py-2 font-medium">Market</Link>
            )}
            
            {isModuleEnabled('su') && (
              <Link href="/su" className="text-gray-600 hover:text-orange-500 py-2 font-medium">Su</Link>
            )}
            
            {isModuleEnabled('aktuel') && (
              <Link href="/aktuel" className="text-gray-600 hover:text-orange-500 py-2 font-medium">Aktüel</Link>
            )}
          </nav>
          
          <div className="flex flex-col space-y-3 border-t border-gray-200 pt-3">
            {/* Sepet ikonu her zaman görünür */}
            <button 
              onClick={onCartClick}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-full text-center flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Sepetim
              {totalItems > 0 && (
                <span className="ml-2 bg-white text-orange-500 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="text-gray-600 hover:text-orange-500 py-2 font-medium">
                  Giriş Yap
                </Link>
                <Link href="/register" className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-full text-center">
                  Kayıt Ol
                </Link>
              </>
            ) : (
              <>
                <Link href="/profil" className="text-gray-600 hover:text-orange-500 py-2 font-medium">
                  Profilim
                </Link>
                {user?.role === 'admin' && (
                  <Link href="/admin" className="text-gray-600 hover:text-orange-500 py-2 font-medium">
                    Admin Paneli
                  </Link>
                )}
                {user?.role === 'store' && (
                  <Link href="/store" className="text-gray-600 hover:text-orange-500 py-2 font-medium">
                    Mağaza Paneli
                  </Link>
                )}
                <Link href="/profil/siparisler" className="text-gray-600 hover:text-orange-500 py-2 font-medium">
                  Siparişlerim
                </Link>
                <Link href="/profil/adresler" className="text-gray-600 hover:text-orange-500 py-2 font-medium">
                  Adreslerim
                </Link>
                <button
                  onClick={logout}
                  className="text-left text-red-600 hover:text-red-700 py-2 font-medium"
                >
                  Çıkış Yap
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// useAuth hook'unu layout'un dışında kullanmak için HeaderWrapper bileşeni
export default function HeaderWrapper({ onCartClick }) {
  return <Header onCartClick={onCartClick} />;
} 