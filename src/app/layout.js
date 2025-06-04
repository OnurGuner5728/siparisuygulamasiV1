'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import HeaderWrapper from '../components/HeaderWrapper';
import Footer from '../components/Footer';
import MobileNavbar from '../components/MobileNavbar';
import { AuthProvider } from '../contexts/AuthContext';
import { ModuleProvider } from '../contexts/ModuleContext';
import { ErrorProvider } from '../contexts/ErrorContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import CartSidebar from '../components/CartSidebar';
import { FileProvider } from '../contexts/FileContext';
import { CartProvider } from '../contexts/CartContext';
import { ToastProvider } from '../contexts/ToastContext';
import ErrorBoundary from '../components/ErrorBoundary';
import NotificationContainer from '../components/NotificationContainer';
import ToastContainer from '../components/Toast';
import { SWRConfig } from 'swr';
import swrConfig from '../lib/swrConfig';
import ServiceWorkerManager from '../components/ServiceWorkerManager';
import useCacheManager from '../hooks/useCacheManager';
import DebugPanel from '../components/DebugPanel';
import AuthRouter from '../components/AuthRouter';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();
  
  // Cache yönetimi
  useCacheManager();

  const handleCartOpen = () => setIsCartOpen(true);
  const handleCartClose = () => setIsCartOpen(false);

  // Pathname değiştiğinde sepeti kapat
  useEffect(() => {
    setIsCartOpen(false);
  }, [pathname]);

  // Splash ve onboarding sayfalarında header/footer gösterme
  const hideNavigation = pathname === '/splash' || pathname === '/onboarding';

  return (
    <html lang="tr">
      <body className={inter.className} suppressHydrationWarning={true}>
        <ErrorBoundary>
          <ErrorProvider>
            <SWRConfig value={swrConfig}>
              <AuthProvider>
                <SettingsProvider>
                  <LanguageProvider>
                    <ThemeProvider>
                      <ModuleProvider>
                      <FileProvider>
                        <ToastProvider>
                          <CartProvider>
                            <AuthRouter>
                              <div className="enhanced-gradient min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
                                {!hideNavigation && <HeaderWrapper onCartClick={handleCartOpen} />}
                                <main className={`flex-1 ${!hideNavigation ? 'mb-16 md:mb-0' : ''}`}>
                                  <div className="app-container">
                                    {children}
                                  </div>
                                </main>
                                {!hideNavigation && <Footer />}
                                {!hideNavigation && <MobileNavbar onCartClick={handleCartOpen} />}
                                <CartSidebar 
                                  isOpen={isCartOpen} 
                                  onClose={handleCartClose} 
                                />
                                <NotificationContainer />
                                <ToastContainer />
                                <ServiceWorkerManager />
                                <DebugPanel />
                              </div>
                            </AuthRouter>
                          </CartProvider>
                        </ToastProvider>
                      </FileProvider>
                      </ModuleProvider>
                    </ThemeProvider>
                  </LanguageProvider>
                </SettingsProvider>
              </AuthProvider>
            </SWRConfig>
          </ErrorProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
