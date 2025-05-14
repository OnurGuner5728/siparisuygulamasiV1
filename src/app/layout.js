'use client';

import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import HeaderWrapper from '../components/HeaderWrapper';
import Footer from '../components/Footer';

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <title>Sipariş Uygulaması</title>
        <meta name="description" content="Yemek, Market, Su ve Aktüel ürünler için çok kategorili sipariş uygulaması" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <HeaderWrapper />
            {children}
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
