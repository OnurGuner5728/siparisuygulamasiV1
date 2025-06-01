'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useModule } from '../contexts/ModuleContext';
import NotificationDropdown from './NotificationDropdown';
import AddressPopup from './AddressPopup';

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
  const { totalItems, forceRender } = useCart();
  const { isModuleEnabled, modulePermissions } = useModule();
  
  // Debug: forceRender değişikliklerini izle
  React.useEffect(() => {
    console.log('🎨 [HEADER] forceRender değişti:', forceRender, 'totalItems:', totalItems);
  }, [forceRender, totalItems]);
  
  // Debug: Module permissions değişikliklerini izle
  React.useEffect(() => {
    console.log('🎛️ [HEADER] Module permissions güncellendi:', modulePermissions);
    console.log('🎛️ [HEADER] Aktif modüller:', {
      yemek: isModuleEnabled('yemek'),
      market: isModuleEnabled('market'),
      su: isModuleEnabled('su'),
      aktuel: isModuleEnabled('aktuel')
    });
  }, [modulePermissions, isModuleEnabled]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAddressPopupOpen, setIsAddressPopupOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Initial backup user'ı sync olarak al
  const [backupUser] = useState(() => getInitialBackupUser());

  // Hydration kontrolü
  useEffect(() => {
    setIsHydrated(true);
    document.body.classList.add('hydrated');
  }, []);

  // Mobil scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Sadece mobilde scroll behavior aktif
      if (window.innerWidth < 768) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Aşağı kaydırıyor ve 100px'den fazla
          setIsHeaderVisible(false);
        } else if (currentScrollY < lastScrollY) {
          // Yukarı kaydırıyor
          setIsHeaderVisible(true);
        }
      } else {
        // Desktop'ta her zaman görünür
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    const handleResize = () => {
      // Ekran boyutu değiştiğinde header'ı göster
      if (window.innerWidth >= 768) {
        setIsHeaderVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [lastScrollY]);

  // Kullanılacak user data - priorite sırası: user > backupUser (loading'de)
  const currentUser = user || (loading ? backupUser : null);
  const currentIsAuthenticated = !!currentUser;

  // Unified portal navigation function - HEM MASAÜSTÜ HEM MOBİL
  const handlePortalLinkClick = useCallback((href) => {
    // Tüm menüleri kapat
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    
    // Biraz daha uzun delay - kullanıcının tıklama şansı olsun
    setTimeout(() => {
      window.location.href = href;
    }, 200);
  }, []);

  // Regular link navigation (portal dışı)
  const handleLinkClick = useCallback((e, href) => {
    e.preventDefault();
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    window.location.href = href;
  }, []);

  // Adres popup'ını açma fonksiyonu
  const openAddressPopup = useCallback(() => {
    setIsAddressPopupOpen(true);
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, []);

  // Adres popup'ını kapama fonksiyonu
  const closeAddressPopup = useCallback(() => {
    setIsAddressPopupOpen(false);
  }, []);

  // Menü dışına tıklandığında menüleri kapat - GEREKSİZ ÇÜNKÜ PORTAL ZATEN YAPIYOR
  // useEffect kaldırıldı, portal overlay zaten handle ediyor

  // Auth button'ların görünürlük class'ı
  const authButtonClass = `auth-buttons ${isHydrated ? 'auth-buttons-visible' : 'auth-buttons-hidden'}`;
  
  return (<header className={`bg-white  overflow-hidden shadow-lg py-2 sticky top-0 z-40 backdrop-blur-sm transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-2 left-10 w-6 h-6 bg-orange-100/50 rounded-full animate-bounce animation-delay-1000"></div>
        <div className="absolute top-8 right-20 w-4 h-4 bg-orange-50/80 rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-4 left-1/4 w-3 h-3 bg-orange-100/60 rounded-full animate-ping animation-delay-3000"></div>
        <div className="absolute top-1/2 right-10 w-2 h-2 bg-orange-100/70 rounded-full animate-bounce animation-delay-500"></div>
        <div className="absolute bottom-8 right-1/3 w-2 h-2 bg-orange-100/50 rounded-full animate-pulse animation-delay-1500"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/30 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-50/30 rounded-full translate-y-12 -translate-x-12"></div>

      <div className="relative container mx-auto px-4 flex justify-between items-center">        <div className="flex items-center">          <a href="/" className="flex items-center space-x-2 text-2xl font-bold" onClick={(e) => handleLinkClick(e, '/')}
          >
           {/* <div className="bg-orange-100 backdrop-blur-sm rounded-2xl p-3 shadow-lg transform hover:scale-105 transition-all duration-300 border border-orange-200">
              <span className="text-orange-500 font-black text-lg tracking-tight">es</span>
            </div>
            */}
            <span className="hidden sm:inline text-orange-500 font-black tracking-tight drop-shadow-lg">
              easysiparis
            </span>
          </a>        </div>

    {/* Mobil Sağ Butonlar */}
        <div className="flex md:hidden items-center space-x-2">
          {/* Bildirim ikonu - sadece giriş yapmış kullanıcılar için */}
          {currentIsAuthenticated && (
            <div className="relative">
              <NotificationDropdown />
            </div>
          )}
          
          {/* Hızlı Adres Değiştirme - sadece giriş yapmış kullanıcılar için */}
          {currentIsAuthenticated && (
            <button 
              onClick={openAddressPopup}
              className="p-3 rounded-2xl bg-orange-100 backdrop-blur-sm hover:bg-orange-200 text-orange-500 hover:scale-105 transition-all duration-200 relative group border border-orange-200"
              aria-label="Hızlı Adres Değiştir"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {/* Tooltip */}
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Adres Değiştir
              </div>
            </button>
          )}
          
          {/* Sepet ikonu - mobilde yorum satırı olarak güncellenmiş */}
          {/* 
          <button 
            onClick={onCartClick}
            className="relative p-3 rounded-2xl bg-orange-100 backdrop-blur-sm hover:bg-orange-200 text-orange-500 hover:scale-105 transition-all duration-200 group border border-orange-200"
            aria-label="Sepetim"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {totalItems}
              </span>
            )}
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Sepetim
            </div>
          </button>
          */}
          
          {/* Mobil Menü Butonu */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-3 rounded-2xl bg-orange-100 backdrop-blur-sm hover:bg-orange-200 text-orange-500 hover:scale-105 transition-all duration-200 border border-orange-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

    {/* Masaüstü Menü */}        <nav className="hidden md:flex space-x-1">          <a href="/" className="px-4 py-2 rounded-xl text-orange-600 hover:text-orange-500 hover:bg-orange-100 font-medium transition-all duration-200 backdrop-blur-sm" onClick={(e) => handleLinkClick(e, '/')}          >            Ana Sayfa          </a>                    {isModuleEnabled('yemek') && (<a href="/yemek" className="px-4 py-2 rounded-xl text-orange-600 hover:text-orange-500 hover:bg-orange-100 font-medium transition-all duration-200 backdrop-blur-sm" onClick={(e) => handleLinkClick(e, '/yemek')}            >              Yemek            </a>)}                    {isModuleEnabled('market') && (<a href="/market" className="px-4 py-2 rounded-xl text-orange-600 hover:text-orange-500 hover:bg-orange-100 font-medium transition-all duration-200 backdrop-blur-sm" onClick={(e) => handleLinkClick(e, '/market')}            >              Market            </a>)}                    {isModuleEnabled('su') && (<a href="/su" className="px-4 py-2 rounded-xl text-orange-600 hover:text-orange-500 hover:bg-orange-100 font-medium transition-all duration-200 backdrop-blur-sm" onClick={(e) => handleLinkClick(e, '/su')}            >              Su            </a>)}                    {isModuleEnabled('aktuel') && (<a href="/aktuel" className="px-4 py-2 rounded-xl text-orange-600 hover:text-orange-500 hover:bg-orange-100 font-medium transition-all duration-200 backdrop-blur-sm" onClick={(e) => handleLinkClick(e, '/aktuel')}            >              Aktüel            </a>)}        </nav>

    {/* Kullanıcı İşlemleri */}        <div className="hidden md:flex items-center space-x-3">          {/* Bildirimler - sadece giriş yapmış kullanıcılar için */}          {currentIsAuthenticated && <NotificationDropdown />}
          
          {/* Hızlı Adres Değiştirme - sadece giriş yapmış kullanıcılar için */}
          {currentIsAuthenticated && (
            <button 
              onClick={openAddressPopup}
              className="p-3 rounded-2xl bg-orange-100 backdrop-blur-sm hover:bg-orange-200 text-orange-500 hover:scale-105 transition-all duration-200 relative group border border-orange-200"
              aria-label="Hızlı Adres Değiştir"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {/* Tooltip */}
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Adres Değiştir
              </div>
            </button>
          )}
                    
          {/* Sepet ikonu masaüstünde görünür */}
          <button onClick={onCartClick} className="bg-orange-100 backdrop-blur-sm text-orange-500 p-3 rounded-2xl hover:bg-orange-200 hover:scale-105 transition-all duration-200 relative group border border-orange-200" aria-label="Sepetim"          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">                {totalItems}              </span>)}
            {/* Tooltip */}
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Sepetim
            </div>
          </button>

      {/* Auth buttons with hydration control */}          <div className={authButtonClass}>            {!currentIsAuthenticated ? (<>                <a href="/login" className="px-4 py-2 rounded-xl text-orange-600 hover:text-orange-500 hover:bg-orange-100 font-medium transition-all duration-200 backdrop-blur-sm" onClick={(e) => handleLinkClick(e, '/login')}                >                  Giriş Yap                </a>                <a href="/register" className="bg-orange-100 backdrop-blur-sm text-orange-500 px-6 py-2 rounded-xl hover:bg-orange-200 hover:scale-105 transition-all duration-200 font-medium border border-orange-200" onClick={(e) => handleLinkClick(e, '/register')}                >                  Kayıt Ol                </a>              </>) : (
        <div className="relative user-menu-container">                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center px-3 py-2 rounded-xl text-orange-600 hover:text-orange-500 hover:bg-orange-100 font-medium transition-all duration-200 backdrop-blur-sm"                >
                  {/* Mağaza sahibi ise logo göster, normal kullanıcı ise avatar göster */}
                  {currentUser?.role === 'store' && currentUser?.storeInfo?.logo_url && currentUser.storeInfo.logo_url.trim() !== '' ? (
                    <div className="flex items-center">
                      <img 
                        src={currentUser.storeInfo.logo_url} 
                        alt={currentUser.storeInfo.name || 'Mağaza'}
                        className="h-8 w-8 rounded-full object-cover mr-2 border border-orange-200"
                      />
                      <span className="hidden sm:inline text-orange-500">{currentUser.storeInfo.name || currentUser?.name || 'Mağaza'}</span>
                      <span className="sm:hidden text-orange-500">{currentUser?.name || 'Kullanıcı'}</span>
                    </div>
                  ) : currentUser?.avatar_url ? (
                    <div className="flex items-center">
                      <img 
                        src={currentUser.avatar_url} 
                        alt={currentUser?.name || 'Kullanıcı'}
                        className="h-8 w-8 rounded-full object-cover mr-2 border border-orange-200"
                      />
                      <span className="text-orange-500">{currentUser?.name || 'Kullanıcı'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-orange-500">{currentUser?.name || 'Kullanıcı'}</span>
                    </div>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform text-orange-500 ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* User Menu Portal - Portal ile body'ye taşınıyor */}
      {isUserMenuOpen && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999]"
          onClick={(e) => {
            // Eğer tıklanan menu değilse kapat
            if (!e.target.closest('.user-dropdown-menu')) {
              setTimeout(() => setIsUserMenuOpen(false), 100);
            }
          }}
        >
          <div 
            className="user-dropdown-menu absolute top-16 right-4 w-64 py-2 bg-white rounded-2xl shadow-xl border border-gray-100 backdrop-blur-sm z-[10000]"
            onClick={(e) => e.stopPropagation()}
          >
            {currentUser?.role === 'admin' && (
              <a href="/admin" className="block px-4 py-3 mx-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-all duration-200" onClick={(e) => { e.preventDefault(); handlePortalLinkClick('/admin'); }}>
                <div className="flex items-center space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Admin Paneli</span>
                </div>
              </a>
            )}
            {currentUser?.role === 'store' && (
              <div>
                {/* Mağaza Bilgileri */}
                <div className="px-4 py-3 mx-2 border-b border-gray-100 rounded-xl bg-gradient-to-r from-orange-50 to-red-50">
                  <div className="flex items-center space-x-3">
                    {currentUser?.storeInfo?.logo_url && currentUser.storeInfo.logo_url.trim() !== '' && (
                      <img src={currentUser.storeInfo.logo_url} alt={currentUser.storeInfo.name || 'Mağaza'} className="h-12 w-12 rounded-xl object-cover border border-gray-200 shadow-sm" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {currentUser.storeInfo?.name || 'Mağaza Adı'}
                      </p>
                      <p className="text-xs text-gray-600 flex items-center space-x-1">
                        {currentUser.storeInfo?.is_approved ? (
                          <>
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>Onaylanmış Mağaza</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                            <span>Onay Bekleniyor</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                {currentUser?.storeInfo?.is_approved ? (
                  <a 
                    href="/store" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    onClick={(e) => { e.preventDefault(); handlePortalLinkClick('/store'); }}
                  >
                    Mağaza Paneli
                  </a>
                ) : (
                  <a 
                    href="/store" 
                    className="block px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                    onClick={(e) => { e.preventDefault(); handlePortalLinkClick('/store'); }}
                  >
                    Mağaza Paneli (Onay Bekleniyor)
                  </a>
                )}
                
                <a 
                  href="/store/profile" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                  onClick={(e) => { e.preventDefault(); handlePortalLinkClick('/store/profile'); }}
                >
                  Mağaza Profili
                </a>
              </div>
            )}
            <a href="/profil" className="block px-4 py-3 mx-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-all duration-200" onClick={(e) => { e.preventDefault(); handlePortalLinkClick('/profil'); }}>
              <div className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profilim</span>
              </div>
            </a>
            <a href="/profil/siparisler" className="block px-4 py-3 mx-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-all duration-200" onClick={(e) => { e.preventDefault(); handlePortalLinkClick('/profil/siparisler'); }}>
              <div className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <span>Siparişlerim</span>
              </div>
            </a>
            <a href="/profil/bildirimler" className="block px-4 py-3 mx-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-all duration-200" onClick={(e) => { e.preventDefault(); handlePortalLinkClick('/profil/bildirimler'); }}>
              <div className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h10a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span>Bildirimlerim</span>
              </div>
            </a>
            <a href="/profil/adresler" className="block px-4 py-3 mx-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-all duration-200" onClick={(e) => { e.preventDefault(); handlePortalLinkClick('/profil/adresler'); }}>
              <div className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>Adreslerim</span>
              </div>
            </a>
            <div className="border-t border-gray-100 my-2"></div>
            <button onClick={logout} className="block w-full text-left px-4 py-3 mx-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200">
              <div className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                <span>Çıkış Yap</span>
              </div>
            </button>
          </div>
        </div>,
        document.body
      )}
      
      {/* Mobil Sidebar Overlay - Portal ile */}
      {isMenuOpen && typeof window !== 'undefined' && createPortal(
        <div className="mobile-menu-overlay md:hidden overflow-hidden" style={{ position: 'fixed', zIndex: 9998, inset: 0 }}>
          {/* Tam sayfa sidebar - alt navbar hariç */}
          <div className="absolute inset-0 bottom-16 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[9999]">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Menü</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Navigasyon Modülleri */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Kategoriler</h3>
                  <div className="space-y-2">
                    <a 
                      href="/" 
                      className="flex items-center space-x-3 p-3 rounded-lg border border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                      onClick={(e) => handleLinkClick(e, '/')}
                    >
                      <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Ana Sayfa</span>
                    </a>

                    {isModuleEnabled('market') && (
                      <a 
                        href="/market" 
                        className="flex items-center space-x-3 p-3 rounded-lg border border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                        onClick={(e) => handleLinkClick(e, '/market')}
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Market</span>
                      </a>
                    )}

                    {isModuleEnabled('yemek') && (
                      <a 
                        href="/yemek" 
                        className="flex items-center space-x-3 p-3 rounded-lg border border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                        onClick={(e) => handleLinkClick(e, '/yemek')}
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Yemek</span>
                      </a>
                    )}

                    {isModuleEnabled('su') && (
                      <a 
                        href="/su" 
                        className="flex items-center space-x-3 p-3 rounded-lg border border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                        onClick={(e) => handleLinkClick(e, '/su')}
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Su</span>
                      </a>
                    )}

                    {isModuleEnabled('aktuel') && (
                      <a 
                        href="/aktuel" 
                        className="flex items-center space-x-3 p-3 rounded-lg border border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                        onClick={(e) => handleLinkClick(e, '/aktuel')}
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Aktüel</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Hızlı Erişim */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Hızlı Erişim</h3>
                  <button 
                    onClick={onCartClick} 
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-lg flex items-center justify-center space-x-2 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <span className="font-medium">Sepetim</span>
                    {totalItems > 0 && (
                      <span className="bg-white text-orange-500 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </button>
                </div>

                {/* Kullanıcı Durumu */}
                <div className={authButtonClass}>
                  {!currentIsAuthenticated ? (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Hesap</h3>
                      <div className="space-y-2">
                        <a 
                          href="/login" 
                          className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors"
                          onClick={(e) => handleLinkClick(e, '/login')}
                        >
                          Giriş Yap
                        </a>
                        <a 
                          href="/register" 
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-lg text-center font-medium hover:shadow-md transition-all duration-200"
                          onClick={(e) => handleLinkClick(e, '/register')}
                        >
                          Kayıt Ol
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Hesabım</h3>
                      {/* Kullanıcı Bilgisi */}
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-orange-200">
                        {currentUser?.role === 'store' && currentUser?.storeInfo?.logo_url && currentUser.storeInfo.logo_url.trim() !== '' ? (
                          <img 
                            src={currentUser.storeInfo.logo_url} 
                            alt={currentUser.storeInfo.name || 'Mağaza'}
                            className="h-10 w-10 rounded-full object-cover border border-gray-300"
                          />
                        ) : currentUser?.avatar_url ? (
                          <img 
                            src={currentUser.avatar_url} 
                            alt={currentUser?.name || 'Kullanıcı'}
                            className="h-10 w-10 rounded-full object-cover border border-gray-300"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                            </svg>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {currentUser?.role === 'store' ? 
                              (currentUser.storeInfo?.name || 'Mağaza') : 
                              (currentUser?.name || 'Kullanıcı')
                            }
                          </p>
                          <p className="text-xs text-gray-500">
                            {currentUser?.role === 'store' ? 
                              (currentUser.storeInfo?.is_approved ? 'Onaylanmış Mağaza' : 'Onay Bekleniyor') :
                              'Kullanıcı'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {/* Kullanıcı Menü Linkleri */}
                      <div className="space-y-2">
                        <a 
                          href="/profil" 
                          className="flex items-center space-x-3 p-3 rounded-lg border border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                          onClick={(e) => { e.preventDefault(); handlePortalLinkClick('/profil'); }}
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-sm font-medium text-gray-700">Profilim</span>
                        </a>
                        <a 
                          href="/profil/siparisler" 
                          className="flex items-center space-x-3 p-3 rounded-lg border border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                          onClick={(e) => { e.preventDefault(); handlePortalLinkClick('/profil/siparisler'); }}
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                          </svg>
                          <span className="text-sm font-medium text-gray-700">Siparişlerim</span>
                        </a>
                        {currentUser?.role === 'admin' && (
                          <a 
                            href="/admin" 
                            className="flex items-center space-x-3 p-3 rounded-lg border border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                            onClick={(e) => { e.preventDefault(); handlePortalLinkClick('/admin'); }}
                          >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Admin Paneli</span>
                          </a>
                        )}
                        {currentUser?.role === 'store' && (
                          <a 
                            href="/store" 
                            className="flex items-center space-x-3 p-3 rounded-lg border border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                            onClick={(e) => { e.preventDefault(); handlePortalLinkClick('/store'); }}
                          >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Mağaza Paneli</span>
                          </a>
                        )}
                      </div>
                      
                      {/* Çıkış Butonu */}
                      <button
                        onClick={logout}
                        className="w-full p-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 hover:border-red-300 transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {/* Adres Popup */}
      <AddressPopup 
        isOpen={isAddressPopupOpen}
        onClose={closeAddressPopup}
      />
    </header>
  );
}

// useAuth hook'unu layout'un dışında kullanmak için HeaderWrapper bileşeni
export default function HeaderWrapper({ onCartClick }) {
  return <Header onCartClick={onCartClick} />;
} 