'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Cart Context oluşturma
const CartContext = createContext(null);

// Varsayılan değerler
const defaultCartValue = {
  cartItems: [],
  loading: false,
  addToCart: () => {},
  removeFromCart: () => {},
  removeItemCompletely: () => {},
  clearCart: () => {},
  calculateSubtotal: () => 0,
  calculateDeliveryFee: () => 0,
  calculateTotal: () => 0,
  totalItems: 0
};

// Cart Provider bileşeni
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();
  
  // Kullanıcıya göre sepet anahtarı oluştur
  const getCartKey = useCallback(() => {
    return isAuthenticated && user ? `cart_${user.id}` : 'cart_guest';
  }, [isAuthenticated, user]);
  
  // Kullanıcı değiştiğinde sepeti güncelle
  useEffect(() => {
    if (loading) return;
    
    try {
      const cartKey = getCartKey();
      const storedCart = localStorage.getItem(cartKey);
      
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      } else {
        // Kullanıcı değiştiyse ve sepet boşsa sepeti sıfırla
        setCartItems([]);
      }
    } catch (err) {
      console.error('Sepet güncelleme hatası:', err);
      setError(err);
    }
  }, [user, isAuthenticated, loading, getCartKey]);
  
  // Sayfa yüklendiğinde localStorage'dan sepet verilerini al
  useEffect(() => {
    try {
      const cartKey = getCartKey();
      const storedCart = localStorage.getItem(cartKey);
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (err) {
      console.error('Sepet yükleme hatası:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [getCartKey]);

  // Sepet verilerini localStorage'a kaydet
  const saveCartToStorage = useCallback((cartData) => {
    try {
      localStorage.setItem(getCartKey(), JSON.stringify(cartData));
    } catch (err) {
      console.error('Sepet kaydetme hatası:', err);
      setError(err);
    }
  }, [getCartKey]);

  // Sepete ürün ekleme
  const addToCart = useCallback((product) => {
    try {
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
    } catch (err) {
      console.error('Ürün ekleme hatası:', err);
      setError(err);
    }
  }, [saveCartToStorage]);

  // Sepetten ürün çıkarma
  const removeFromCart = useCallback((productId) => {
    try {
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
    } catch (err) {
      console.error('Ürün çıkarma hatası:', err);
      setError(err);
    }
  }, [saveCartToStorage]);

  // Sepetten ürünü tamamen kaldırma
  const removeItemCompletely = useCallback((productId) => {
    try {
      setCartItems(prevItems => {
        const updatedCart = prevItems.filter(item => item.id !== productId);
        saveCartToStorage(updatedCart);
        return updatedCart;
      });
    } catch (err) {
      console.error('Ürünü tamamen kaldırma hatası:', err);
      setError(err);
    }
  }, [saveCartToStorage]);

  // Sepeti tamamen temizleme
  const clearCart = useCallback(() => {
    try {
      setCartItems([]);
      localStorage.removeItem(getCartKey());
    } catch (err) {
      console.error('Sepeti temizleme hatası:', err);
      setError(err);
    }
  }, [getCartKey]);

  // Ara toplam hesaplama
  const calculateSubtotal = useCallback(() => {
    try {
      return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    } catch (err) {
      console.error('Ara toplam hesaplama hatası:', err);
      setError(err);
      return 0;
    }
  }, [cartItems]);

  // Teslimat ücreti hesaplama (150 TL üzeri ücretsiz)
  const calculateDeliveryFee = useCallback(() => {
    try {
      const subtotal = calculateSubtotal();
      return subtotal >= 150 ? 0 : 15;
    } catch (err) {
      console.error('Teslimat ücreti hesaplama hatası:', err);
      setError(err);
      return 0;
    }
  }, [calculateSubtotal]);

  // Toplam tutar hesaplama
  const calculateTotal = useCallback(() => {
    try {
      return calculateSubtotal() + calculateDeliveryFee();
    } catch (err) {
      console.error('Toplam tutar hesaplama hatası:', err);
      setError(err);
      return 0;
    }
  }, [calculateSubtotal, calculateDeliveryFee]);

  // Toplam ürün sayısı
  const totalItems = useMemo(() => {
    try {
      return cartItems.reduce((total, item) => total + item.quantity, 0);
    } catch (err) {
      console.error('Toplam ürün sayısı hesaplama hatası:', err);
      setError(err);
      return 0;
    }
  }, [cartItems]);

  // Context değeri
  const value = useMemo(() => ({
    cartItems,
    loading,
    error,
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
    error,
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
  try {
    const context = useContext(CartContext);
    if (!context) {
      console.error('useCart must be used within a CartProvider');
      return defaultCartValue;
    }
    return context;
  } catch (err) {
    console.error('useCart hatası:', err);
    return defaultCartValue;
  }
}; 