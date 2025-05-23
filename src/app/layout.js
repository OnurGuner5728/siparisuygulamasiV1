'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import HeaderWrapper from '../components/HeaderWrapper';
import Footer from '../components/Footer';
import { AuthProvider } from '../contexts/AuthContext';
import { ModuleProvider } from '../contexts/ModuleContext';
import CartSidebar from '../components/CartSidebar';
import { FileProvider } from '../contexts/FileContext';
import { CartProvider } from '../contexts/CartContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleCartOpen = () => setIsCartOpen(true);
  const handleCartClose = () => setIsCartOpen(false);

  // Pathname değiştiğinde sepeti kapat
  useEffect(() => {
    setIsCartOpen(false);
  }, [pathname]);

  return (
    <html lang="tr">
      <body className={inter.className}>
        <AuthProvider>
          <ModuleProvider>
            <FileProvider>
              <CartProvider>
                <div className="min-h-screen bg-gray-50 flex flex-col">
                  <HeaderWrapper onCartClick={handleCartOpen} />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                  <CartSidebar 
                    isOpen={isCartOpen} 
                    onClose={handleCartClose} 
                  />
                </div>
              </CartProvider>
            </FileProvider>
          </ModuleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
