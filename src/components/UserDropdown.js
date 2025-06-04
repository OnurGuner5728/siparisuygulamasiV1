'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiUser, FiSettings, FiShoppingBag, FiBell, FiMapPin, FiLogOut, FiX, FiShield, FiStore } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const UserDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Modal dışına tıklandığında kapama
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  // Portal navigation function
  const handlePortalLinkClick = (href) => {
    setIsOpen(false);
    setTimeout(() => {
      window.location.href = href;
    }, 200);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  if (!user) return null;

  const userMenuModal = isOpen && (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[999999]"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden mx-auto my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Hesabım</h2>
            <p className="text-sm text-gray-600 mt-1">
              {user?.role === 'store' ? 
                (user.storeInfo?.name || 'Mağaza') : 
                (user?.name || 'Kullanıcı')
              }
            </p>
          </div>
          
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* User Profile Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {user?.role === 'store' && user?.storeInfo?.logo_url && user.storeInfo.logo_url.trim() !== '' ? (
              <img 
                src={user.storeInfo.logo_url} 
                alt={user.storeInfo.name || 'Mağaza'}
                className="h-16 w-16 rounded-full object-cover border-2 border-orange-200"
              />
            ) : user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user?.name || 'Kullanıcı'}
                className="h-16 w-16 rounded-full object-cover border-2 border-orange-200"
              />
            ) : (
              <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center border-2 border-orange-200">
                <FiUser className="w-8 h-8 text-orange-600" />
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {user?.role === 'store' ? 
                  (user.storeInfo?.name || 'Mağaza') : 
                  (user?.name || 'Kullanıcı')
                }
              </h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
              {user?.role === 'store' && (
                <div className="flex items-center space-x-1 mt-1">
                  {user.storeInfo?.is_approved ? (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-xs text-green-600">Onaylanmış Mağaza</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                      <span className="text-xs text-orange-600">Onay Bekleniyor</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {/* Admin Panel */}
            {user?.role === 'admin' && (
              <button
                onClick={() => handlePortalLinkClick('/admin')}
                className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors duration-200"
              >
                <FiShield className="w-5 h-5" />
                <span className="text-sm font-medium">Admin Paneli</span>
              </button>
            )}

            {/* Store Panel */}
            {user?.role === 'store' && (
              <button
                onClick={() => handlePortalLinkClick('/store')}
                className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors duration-200"
              >
                <FiStore className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {user.storeInfo?.is_approved ? 'Mağaza Paneli' : 'Mağaza Paneli (Onay Bekleniyor)'}
                </span>
              </button>
            )}

            {/* Profile */}
            <button
              onClick={() => handlePortalLinkClick('/profil')}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors duration-200"
            >
              <FiUser className="w-5 h-5" />
              <span className="text-sm font-medium">Profilim</span>
            </button>

            {/* Orders */}
            <button
              onClick={() => handlePortalLinkClick('/profil/siparisler')}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors duration-200"
            >
              <FiShoppingBag className="w-5 h-5" />
              <span className="text-sm font-medium">Siparişlerim</span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => handlePortalLinkClick('/profil/bildirimler')}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors duration-200"
            >
              <FiBell className="w-5 h-5" />
              <span className="text-sm font-medium">Bildirimlerim</span>
            </button>

            {/* Addresses */}
            <button
              onClick={() => handlePortalLinkClick('/profil/adresler')}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors duration-200"
            >
              <FiMapPin className="w-5 h-5" />
              <span className="text-sm font-medium">Adreslerim</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => handlePortalLinkClick('/profil/ayarlar')}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors duration-200"
            >
              <FiSettings className="w-5 h-5" />
              <span className="text-sm font-medium">Ayarlar</span>
            </button>
          </div>
        </div>

        {/* Footer - Logout */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Çıkış Yap</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 p-2 rounded-full bg-gradient-to-r from-orange-300 to-orange-500 text-white hover:from-orange-400 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        aria-label="Kullanıcı Menüsü"
      >
        {user?.role === 'store' && user?.storeInfo?.logo_url && user.storeInfo.logo_url.trim() !== '' ? (
          <img 
            src={user.storeInfo.logo_url} 
            alt={user.storeInfo.name || 'Mağaza'}
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : user?.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt={user?.name || 'Kullanıcı'}
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <FiUser className="h-5 w-5" />
        )}
        
        <span className="hidden sm:inline text-sm font-medium">
          {user?.role === 'store' ? 
            (user.storeInfo?.name || 'Mağaza') : 
            (user?.name || 'Kullanıcı')
          }
        </span>
        
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* User Modal - Portal ile body'ye taşınıyor */}
      {typeof window !== 'undefined' && createPortal(userMenuModal, document.body)}
    </>
  );
};

export default UserDropdown; 