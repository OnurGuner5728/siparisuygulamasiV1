'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Cart Context oluşturma
const CartContext = createContext(null);

// Cart Provider bileşeni
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Sayfa yüklendiğinde localStorage'dan sepet verilerini al
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    setLoading(false);
  }, []);

  // Sepete ürün ekleme
  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    let updatedCart;
    if (existingItem) {
      // Ürün sepette varsa, miktarını artır
      updatedCart = cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
    } else {
      // Ürün sepette yoksa, yeni ekle
      updatedCart = [...cartItems, { ...product, quantity: 1 }];
    }
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Sepetten ürün çıkarma
  const removeFromCart = (productId) => {
    const existingItem = cartItems.find(item => item.id === productId);
    
    if (!existingItem) return;
    
    let updatedCart;
    if (existingItem.quantity > 1) {
      // Miktarı birden fazlaysa, miktarı azalt
      updatedCart = cartItems.map(item => 
        item.id === productId 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      );
    } else {
      // Miktar 1 ise, ürünü tamamen kaldır
      updatedCart = cartItems.filter(item => item.id !== productId);
    }
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Sepetten ürünü tamamen kaldırma
  const removeItemCompletely = (productId) => {
    const updatedCart = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Sepeti tamamen temizleme
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  // Ara toplam hesaplama
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Teslimat ücreti hesaplama (150 TL üzeri ücretsiz)
  const calculateDeliveryFee = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 150 ? 0 : 15;
  };

  // Toplam tutar hesaplama
  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryFee();
  };

  // Context değeri
  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    clearCart,
    calculateSubtotal,
    calculateDeliveryFee,
    calculateTotal,
    totalItems: cartItems.reduce((total, item) => total + item.quantity, 0)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Context kullanımı için hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 