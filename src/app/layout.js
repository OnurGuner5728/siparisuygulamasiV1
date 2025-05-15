'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { useState } from 'react';
import HeaderWrapper from '../components/HeaderWrapper';
import Footer from '../components/Footer';
import { AuthProvider } from '../contexts/AuthContext';
import CartSidebar from '../components/CartSidebar';
import { FileProvider } from '../contexts/FileContext';
import { CartProvider } from '../contexts/CartContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleCartOpen = () => setIsCartOpen(true);
  const handleCartClose = () => setIsCartOpen(false);

  return (
    <html lang="tr">
      <head>
        <title>Sipariş Uygulaması</title>
        <meta name="description" content="Yemek, Market, Su ve Aktüel ürünler için çok kategorili sipariş uygulaması" />
      </head>
      <body className={inter.className + ' min-h-screen flex flex-col'}>
        <AuthProvider>
          <CartProvider>
            <FileProvider>
              <div className="flex flex-col flex-grow">
                <HeaderWrapper onCartClick={handleCartOpen} />
                <CartSidebar isOpen={isCartOpen} onClose={handleCartClose} />
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
            </FileProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
