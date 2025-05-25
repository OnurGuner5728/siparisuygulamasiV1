'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import HeaderWrapper from '../components/HeaderWrapper';
import Footer from '../components/Footer';
import { AuthProvider } from '../contexts/AuthContext';
import { ModuleProvider } from '../contexts/ModuleContext';
import { ErrorProvider } from '../contexts/ErrorContext';
import CartSidebar from '../components/CartSidebar';
import { FileProvider } from '../contexts/FileContext';
import { CartProvider } from '../contexts/CartContext';
import ErrorBoundary from '../components/ErrorBoundary';
import NotificationContainer from '../components/NotificationContainer';
import { SWRConfig } from 'swr';
import swrConfig from '../lib/swrConfig';
import ServiceWorkerManager from '../components/ServiceWorkerManager';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
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
        <ErrorBoundary>
          <ErrorProvider>
            <SWRConfig value={swrConfig}>
              <AuthProvider>
                <ModuleProvider>
                  <FileProvider>
                    <CartProvider>
                      <div className="enhanced-gradient min-h-screen bg-gray-50 flex flex-col">
                        <HeaderWrapper onCartClick={handleCartOpen} />
                        <main className="flex-1">
                          {children}
                        </main>
                        <Footer />
                        <CartSidebar 
                          isOpen={isCartOpen} 
                          onClose={handleCartClose} 
                        />
                        <NotificationContainer />
                        <ServiceWorkerManager />
                      </div>
                    </CartProvider>
                  </FileProvider>
                </ModuleProvider>
              </AuthProvider>
            </SWRConfig>
          </ErrorProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
