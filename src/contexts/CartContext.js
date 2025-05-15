'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Cart Context oluşturma
const CartContext = createContext(null);

// Cart Provider bileşeni
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  
  // Kullanıcıya göre sepet anahtarı oluştur
  const getCartKey = useCallback(() => {
    return isAuthenticated && user ? `cart_${user.id}` : 'cart_guest';
  }, [isAuthenticated, user]);
  
  // Kullanıcı değiştiğinde sepeti güncelle
  useEffect(() => {
    if (loading) return;
    
    const cartKey = getCartKey();
    const storedCart = localStorage.getItem(cartKey);
    
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    } else {
      // Kullanıcı değiştiyse ve sepet boşsa sepeti sıfırla
      setCartItems([]);
    }
  }, [user, isAuthenticated, loading, getCartKey]);
  
  // Sayfa yüklendiğinde localStorage'dan sepet verilerini al
  useEffect(() => {
    const storedCart = localStorage.getItem(getCartKey());
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    setLoading(false);
  }, [getCartKey]);

  // Sepet verilerini localStorage'a kaydet
  const saveCartToStorage = useCallback((cartData) => {
    localStorage.setItem(getCartKey(), JSON.stringify(cartData));
  }, [getCartKey]);

  // Sepete ürün ekleme
  const addToCart = useCallback((product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      let updatedCart;
      if (existingItem) {
        // Ürün sepette varsa, miktarını artır
        updatedCart = prevItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Ürün sepette yoksa, yeni ekle
        updatedCart = [...prevItems, { ...product, quantity: 1 }];
      }
      
      saveCartToStorage(updatedCart);
      return updatedCart;
    });
  }, [saveCartToStorage]);

  // Sepetten ürün çıkarma
  const removeFromCart = useCallback((productId) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === productId);
      
      if (!existingItem) return prevItems;
      
      let updatedCart;
      if (existingItem.quantity > 1) {
        // Miktarı birden fazlaysa, miktarı azalt
        updatedCart = prevItems.map(item => 
          item.id === productId 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      } else {
        // Miktar 1 ise, ürünü tamamen kaldır
        updatedCart = prevItems.filter(item => item.id !== productId);
      }
      
      saveCartToStorage(updatedCart);
      return updatedCart;
    });
  }, [saveCartToStorage]);

  // Sepetten ürünü tamamen kaldırma
  const removeItemCompletely = useCallback((productId) => {
    setCartItems(prevItems => {
      const updatedCart = prevItems.filter(item => item.id !== productId);
      saveCartToStorage(updatedCart);
      return updatedCart;
    });
  }, [saveCartToStorage]);

  // Sepeti tamamen temizleme
  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem(getCartKey());
  }, [getCartKey]);

  // Ara toplam hesaplama
  const calculateSubtotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Teslimat ücreti hesaplama (150 TL üzeri ücretsiz)
  const calculateDeliveryFee = useCallback(() => {
    const subtotal = calculateSubtotal();
    return subtotal >= 150 ? 0 : 15;
  }, [calculateSubtotal]);

  // Toplam tutar hesaplama
  const calculateTotal = useCallback(() => {
    return calculateSubtotal() + calculateDeliveryFee();
  }, [calculateSubtotal, calculateDeliveryFee]);

  // Toplam ürün sayısı
  const totalItems = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // Context değeri
  const value = useMemo(() => ({
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    clearCart,
    calculateSubtotal,
    calculateDeliveryFee,
    calculateTotal,
    totalItems
  }), [
    cartItems, 
    loading, 
    addToCart, 
    removeFromCart, 
    removeItemCompletely, 
    clearCart, 
    calculateSubtotal, 
    calculateDeliveryFee, 
    calculateTotal, 
    totalItems
  ]);

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