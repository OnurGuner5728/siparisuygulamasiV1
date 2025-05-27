'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FiUser, 
  FiShoppingBag, 
  FiHeart, 
  FiMapPin, 
  FiCreditCard,
  FiMessageSquare,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronRight
} from 'react-icons/fi';

export default function ProfileSidebar({ activeTab = 'profile' }) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Menü dışına tıklandığında kapat ve body scroll lock (sadece mobilde)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && window.innerWidth < 768) {
        const profileSidebar = event.target.closest('.mobile-profile-sidebar');
        if (!profileSidebar) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    if (isMobileMenuOpen) {
      // Body scroll'u kilitle
      document.body.style.overflow = 'hidden';
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    } else {
      // Body scroll'u serbest bırak
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen]);
  
  const menuItems = [
    {
      id: 'profile',
      name: 'Profil Bilgilerim',
      href: '/profil',
      icon: FiUser
    },
    {
      id: 'orders',
      name: 'Siparişlerim',
      href: '/profil/siparisler',
      icon: FiShoppingBag
    },
    {
      id: 'favorites',
      name: 'Favorilerim',
      href: '/profil/favorilerim',
      icon: FiHeart
    },
    {
      id: 'addresses',
      name: 'Adreslerim',
      href: '/profil/adresler',
      icon: FiMapPin
    },
    {
      id: 'payments',
      name: 'Ödeme Yöntemlerim',
      href: '/profil/odemelerim',
      icon: FiCreditCard
    },
    {
      id: 'reviews',
      name: 'Değerlendirmelerim',
      href: '/profil/yorumlar',
      icon: FiMessageSquare
    },
    {
      id: 'settings',
      name: 'Hesap Ayarları',
      href: '/profil/ayarlar',
      icon: FiSettings
    }
  ];
  
  const activeMenuItem = menuItems.find(item => item.id === activeTab);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Profil özeti */}
        <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4 ring-2 ring-white/30">
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user?.name || 'Kullanıcı'} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FiUser className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <div className="font-semibold text-lg">{user?.name || 'Kullanıcı'}</div>
              <div className="text-sm text-white/80">{user?.email || ''}</div>
              <div className="mt-1">
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                  {user?.role === 'admin' ? 'Yönetici' : user?.role === 'store_owner' ? 'Mağaza Sahibi' : 'Kullanıcı'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Menü öğeleri */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link 
                  href={item.href}
                  className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-md border border-blue-100' 
                      : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm hover:scale-[1.02]'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                    activeTab === item.id ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-500'
                  }`} />
                  <span className="font-medium">{item.name}</span>
                  {activeTab === item.id && (
                    <FiChevronRight className="w-4 h-4 ml-auto text-blue-600" />
                  )}
                </Link>
              </li>
            ))}
            
            {/* Çıkış yap butonu */}
            <li className="pt-4 border-t border-gray-100">
              <button 
                onClick={logout}
                className="group w-full flex items-center px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:shadow-sm transition-all duration-200"
              >
                <FiLogOut className="w-5 h-5 mr-3 text-red-500 group-hover:text-red-600" />
                <span className="font-medium">Çıkış Yap</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden relative">
        <div className="mobile-profile-sidebar bg-white rounded-2xl shadow-lg mb-6 overflow-hidden border border-gray-100 sticky top-4 z-50 relative">
          {/* Mobile Profil Header */}
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 ring-2 ring-white/30 flex-shrink-0">
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user?.name || 'Kullanıcı'} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white truncate">{user?.name || 'Kullanıcı'}</div>
                  <div className="text-sm text-white/80 truncate">{user?.email || ''}</div>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors flex-shrink-0 ml-2"
              >
                {isMobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Active Tab */}
          <div className="p-4 bg-gray-50/50">
            <div className="flex items-center">
              {activeMenuItem && (
                <>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                    <activeMenuItem.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-800">{activeMenuItem.name}</span>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="border-t border-gray-200 bg-white animate-slideInUp relative z-50">
              <nav className="p-3">
                <ul className="space-y-2">
                  {menuItems.map((item, index) => (
                    <li key={item.id} style={{ animationDelay: `${index * 50}ms` }}>
                      <Link 
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 animate-fadeInUp ${
                          activeTab === item.id 
                            ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' 
                            : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors ${
                          activeTab === item.id ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <item.icon className={`w-4 h-4 transition-colors ${
                            activeTab === item.id ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                        </div>
                        <span className="font-medium flex-1">{item.name}</span>
                        <FiChevronRight className="w-4 h-4 text-gray-400 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          )}
        </div>

        {/* Mobile Overlay - Blur Background */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-lg z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>

    </>
  );
} 