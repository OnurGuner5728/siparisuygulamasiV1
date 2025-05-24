'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useModule } from '../contexts/ModuleContext';
import NotificationDropdown from './NotificationDropdown';

// localStorage'tan sync user backup oku
function getInitialBackupUser() {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('auth_user_backup');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Expiry kontrolü
      if (parsed.expiry && Date.now() < parsed.expiry) {
        return parsed.value;
      }
    }
  } catch (error) {
    console.error('Error loading initial user backup:', error);
  }
  return null;
}

function Header({ onCartClick }) {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { totalItems } = useCart();
  const { isModuleEnabled } = useModule();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Initial backup user'ı sync olarak al
  const [backupUser] = useState(() => getInitialBackupUser());

  // Hydration kontrolü
  useEffect(() => {
    setIsHydrated(true);
    document.body.classList.add('hydrated');
  }, []);

  // Kullanılacak user data - priorite sırası: user > backupUser (loading'de)
  const currentUser = user || (loading ? backupUser : null);
  const currentIsAuthenticated = !!currentUser;

  // Hard navigation function - FORCE REFRESH
  const navigateTo = useCallback((href) => {
    // Close menus first
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    
    // Force hard navigation - NO CLIENT SIDE ROUTING
    window.location.href = href;
  }, []);

  // Link click handler - HARD NAVIGATION ONLY
  const handleLinkClick = useCallback((e, href) => {
    e.preventDefault();
    navigateTo(href);
  }, [navigateTo]);

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

  // Auth button'ların görünürlük class'ı
  const authButtonClass = `auth-buttons ${isHydrated ? 'auth-buttons-visible' : 'auth-buttons-hidden'}`;
  
  return (
    <header className="bg-white shadow-md py-4 sticky top-0 z-40">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <a 
            href="/" 
            className="text-2xl font-bold text-orange-500"
            onClick={(e) => handleLinkClick(e, '/')}
          >
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              easysiparis
            </span>
          </a>
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
          <a 
            href="/" 
            className="text-gray-600 hover:text-orange-500 font-medium"
            onClick={(e) => handleLinkClick(e, '/')}
          >
            Ana Sayfa
          </a>
          
          {isModuleEnabled('yemek') && (
            <a 
              href="/yemek" 
              className="text-gray-600 hover:text-orange-500 font-medium"
              onClick={(e) => handleLinkClick(e, '/yemek')}
            >
              Yemek
            </a>
          )}
          
          {isModuleEnabled('market') && (
            <a 
              href="/market" 
              className="text-gray-600 hover:text-orange-500 font-medium"
              onClick={(e) => handleLinkClick(e, '/market')}
            >
              Market
            </a>
          )}
          
          {isModuleEnabled('su') && (
            <a 
              href="/su" 
              className="text-gray-600 hover:text-orange-500 font-medium"
              onClick={(e) => handleLinkClick(e, '/su')}
            >
              Su
            </a>
          )}
          
          {isModuleEnabled('aktuel') && (
            <a 
              href="/aktuel" 
              className="text-gray-600 hover:text-orange-500 font-medium"
              onClick={(e) => handleLinkClick(e, '/aktuel')}
            >
              Aktüel
            </a>
          )}
        </nav>
        
        {/* Kullanıcı İşlemleri */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Bildirimler - sadece giriş yapmış kullanıcılar için */}
          {currentIsAuthenticated && <NotificationDropdown />}
          
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
          
          {/* Auth buttons with hydration control */}
          <div className={authButtonClass}>
            {!currentIsAuthenticated ? (
              <>
                <a 
                  href="/login" 
                  className="text-gray-600 hover:text-orange-500 font-medium"
                  onClick={(e) => handleLinkClick(e, '/login')}
                >
                  Giriş Yap
                </a>
                <a 
                  href="/register" 
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full hover:shadow-md transition-all ml-4"
                  onClick={(e) => handleLinkClick(e, '/register')}
                >
                  Kayıt Ol
                </a>
              </>
            ) : (
              <div className="relative user-menu-container">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center text-gray-600 hover:text-orange-500 font-medium"
                >
                  {/* Mağaza sahibi ise logo göster */}
                  {currentUser?.role === 'store' && currentUser?.storeInfo?.logo && currentUser.storeInfo.logo.trim() !== '' ? (
                    <div className="flex items-center">
                      <img 
                        src={currentUser.storeInfo.logo} 
                        alt={currentUser.storeInfo.name || 'Mağaza'}
                        className="h-8 w-8 rounded-full object-cover mr-2 border border-gray-300"
                      />
                      <span className="hidden sm:inline">{currentUser.storeInfo.name || currentUser?.name || 'Mağaza'}</span>
                      <span className="sm:hidden">{currentUser?.name || 'Kullanıcı'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </span>
                      {currentUser?.name || 'Kullanıcı'}
                    </div>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 w-56 mt-2 py-1 bg-white rounded-lg shadow-lg z-50">
                    {currentUser?.role === 'admin' && (
                      <a 
                        href="/admin" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                        onClick={(e) => handleLinkClick(e, '/admin')}
                      >
                        Admin Paneli
                      </a>
                    )}
                    {currentUser?.role === 'store' && (
                      <div>
                        {/* Mağaza Bilgileri */}
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="flex items-center space-x-2">
                            {currentUser?.storeInfo?.logo && currentUser.storeInfo.logo.trim() !== '' && (
                              <img 
                                src={currentUser.storeInfo.logo} 
                                alt={currentUser.storeInfo.name || 'Mağaza'}
                                className="h-10 w-10 rounded-full object-cover border border-gray-300"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {currentUser.storeInfo?.name || 'Mağaza Adı'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {currentUser.storeInfo?.is_approved ? 'Onaylanmış Mağaza' : 'Onay Bekleniyor'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {currentUser?.storeInfo?.is_approved ? (
                          <a 
                            href="/store" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                            onClick={(e) => handleLinkClick(e, '/store')}
                          >
                            Mağaza Paneli
                          </a>
                        ) : (
                          <a 
                            href="/store" 
                            className="block px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                            onClick={(e) => handleLinkClick(e, '/store')}
                          >
                            Mağaza Paneli (Onay Bekleniyor)
                          </a>
                        )}
                        
                        <a 
                          href="/store/profile" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                          onClick={(e) => handleLinkClick(e, '/store/profile')}
                        >
                          Mağaza Profili
                        </a>
                      </div>
                    )}
                    <a 
                      href="/profil" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                      onClick={(e) => handleLinkClick(e, '/profil')}
                    >
                      Profilim
                    </a>
                    <a 
                      href="/profil/siparisler" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                      onClick={(e) => handleLinkClick(e, '/profil/siparisler')}
                    >
                      Siparişlerim
                    </a>
                    <a 
                      href="/profil/bildirimler" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                      onClick={(e) => handleLinkClick(e, '/profil/bildirimler')}
                    >
                      Bildirimlerim
                    </a>
                    <a 
                      href="/profil/adresler" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                      onClick={(e) => handleLinkClick(e, '/profil/adresler')}
                    >
                      Adreslerim
                    </a>
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
      </div>
      
      {/* Mobil Menü (Açılır Panel) */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2 px-4 mt-4 shadow-md">
          <nav className="flex flex-col space-y-3 mb-4">
            <a 
              href="/" 
              className="text-gray-600 hover:text-orange-500 py-2 font-medium"
              onClick={(e) => handleLinkClick(e, '/')}
            >
              Ana Sayfa
            </a>
            
            {isModuleEnabled('yemek') && (
              <a 
                href="/yemek" 
                className="text-gray-600 hover:text-orange-500 py-2 font-medium"
                onClick={(e) => handleLinkClick(e, '/yemek')}
              >
                Yemek
              </a>
            )}
            
            {isModuleEnabled('market') && (
              <a 
                href="/market" 
                className="text-gray-600 hover:text-orange-500 py-2 font-medium"
                onClick={(e) => handleLinkClick(e, '/market')}
              >
                Market
              </a>
            )}
            
            {isModuleEnabled('su') && (
              <a 
                href="/su" 
                className="text-gray-600 hover:text-orange-500 py-2 font-medium"
                onClick={(e) => handleLinkClick(e, '/su')}
              >
                Su
              </a>
            )}
            
            {isModuleEnabled('aktuel') && (
              <a 
                href="/aktuel" 
                className="text-gray-600 hover:text-orange-500 py-2 font-medium"
                onClick={(e) => handleLinkClick(e, '/aktuel')}
              >
                Aktüel
              </a>
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
            
            {/* Mobile auth buttons with hydration control */}
            <div className={authButtonClass}>
              {!currentIsAuthenticated ? (
                <>
                  <a 
                    href="/login" 
                    className="text-gray-600 hover:text-orange-500 py-2 font-medium block"
                    onClick={(e) => handleLinkClick(e, '/login')}
                  >
                    Giriş Yap
                  </a>
                  <a 
                    href="/register" 
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-full text-center block"
                    onClick={(e) => handleLinkClick(e, '/register')}
                  >
                    Kayıt Ol
                  </a>
                </>
              ) : (
                <>
                  {/* Kullanıcı/Mağaza Bilgileri */}
                  {currentUser?.role === 'store' && currentUser?.storeInfo?.logo && currentUser.storeInfo.logo.trim() !== '' && (
                    <div className="flex items-center py-2 border-b border-gray-200 mb-2">
                      <img 
                        src={currentUser.storeInfo.logo} 
                        alt={currentUser.storeInfo.name || 'Mağaza'}
                        className="h-10 w-10 rounded-full object-cover mr-3 border border-gray-300"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {currentUser.storeInfo.name || 'Mağaza Adı'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currentUser.storeInfo.is_approved ? 'Onaylanmış Mağaza' : 'Onay Bekleniyor'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <a 
                    href="/profil" 
                    className="text-gray-600 hover:text-orange-500 py-2 font-medium block"
                    onClick={(e) => handleLinkClick(e, '/profil')}
                  >
                    Profilim
                  </a>
                  {currentUser?.role === 'admin' && (
                    <a 
                      href="/admin" 
                      className="text-gray-600 hover:text-orange-500 py-2 font-medium block"
                      onClick={(e) => handleLinkClick(e, '/admin')}
                    >
                      Admin Paneli
                    </a>
                  )}
                  {currentUser?.role === 'store' && (
                    <>
                      {currentUser?.storeInfo?.is_approved ? (
                        <a 
                          href="/store" 
                          className="text-gray-600 hover:text-orange-500 py-2 font-medium block"
                          onClick={(e) => handleLinkClick(e, '/store')}
                        >
                          Mağaza Paneli
                        </a>
                      ) : (
                        <a 
                          href="/store" 
                          className="text-gray-600 hover:text-orange-500 py-2 font-medium block"
                          onClick={(e) => handleLinkClick(e, '/store')}
                        >
                          Mağaza Paneli (Onay Bekleniyor)
                        </a>
                      )}
                      <a 
                        href="/store/profile" 
                        className="text-gray-600 hover:text-orange-500 py-2 font-medium block"
                        onClick={(e) => handleLinkClick(e, '/store/profile')}
                      >
                        Mağaza Profili
                      </a>
                    </>
                  )}
                  <a 
                    href="/profil/siparisler" 
                    className="text-gray-600 hover:text-orange-500 py-2 font-medium block"
                    onClick={(e) => handleLinkClick(e, '/profil/siparisler')}
                  >
                    Siparişlerim
                  </a>
                  <a 
                    href="/profil/bildirimler" 
                    className="text-gray-600 hover:text-orange-500 py-2 font-medium block"
                    onClick={(e) => handleLinkClick(e, '/profil/bildirimler')}
                  >
                    Bildirimlerim
                  </a>
                  <a 
                    href="/profil/adresler" 
                    className="text-gray-600 hover:text-orange-500 py-2 font-medium block"
                    onClick={(e) => handleLinkClick(e, '/profil/adresler')}
                  >
                    Adreslerim
                  </a>
                  <button
                    onClick={logout}
                    className="text-left text-red-600 hover:text-red-700 py-2 font-medium block"
                  >
                    Çıkış Yap
                  </button>
                </>
              )}
            </div>
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