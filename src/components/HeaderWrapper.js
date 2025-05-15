'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import CartSidebar from './CartSidebar';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  return (
    <>
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">SiparişApp</Link>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-600 hover:text-blue-600">Ana Sayfa</Link>
            <Link href="/yemek" className="text-gray-600 hover:text-blue-600">Yemek</Link>
            <Link href="/market" className="text-gray-600 hover:text-blue-600">Market</Link>
            <Link href="/su" className="text-gray-600 hover:text-blue-600">Su</Link>
            <Link href="/aktuel" className="text-gray-600 hover:text-blue-600">{user?.role === 'admin' || user?.modulePermissions?.aktuel ? 'Aktüel' : ''}</Link>
          </nav>
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600">
                  Giriş Yap
                </Link>
                <Link href="/register" className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Kayıt Ol
                </Link>
              </>
            ) : (
              <>
                <div className="relative group">
                  <button className="flex items-center text-sm text-gray-600 hover:text-blue-600">
                    {user?.name || 'Kullanıcı'}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-1 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-300 z-50">
                    {user?.role === 'admin' && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Admin Paneli
                      </Link>
                    )}
                    {user?.role === 'store' && (
                      <Link href="/store" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Mağaza Paneli
                      </Link>
                    )}
                    <Link href="/profil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profilim
                    </Link>
                    <Link href="/profil/siparisler" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Siparişlerim
                    </Link>
                    <Link href="/profil/adresler" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Adreslerim
                    </Link>
                    <button 
                      onClick={logout} 
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 relative"
                >
                  Sepetim
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

// useAuth hook'unu layout'un dışında kullanmak için HeaderWrapper bileşeni
export default function HeaderWrapper() {
  return <Header />;
} 