'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '@/lib/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sepet yükle - STABİL REFERANS
  const loadCart = useCallback(async (userId) => {
    if (!userId) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      const items = await api.getUserCartItems(userId);
      setCartItems(items || []);
    } catch (error) {
      console.error('Sepet yüklenirken hata:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []); // Boş dependency - external API kullanıyor

  // User değiştiğinde sepeti yükle
  useEffect(() => {
    loadCart(user?.id);
  }, [user?.id, loadCart]);

  // Sepete ekle
  const addToCart = useCallback(async (product, quantity = 1) => {
    if (!user?.id) {
      alert('Sepete ürün eklemek için giriş yapmalısınız.');
      return;
    }

    try {
      // Mevcut sepette aynı ürün var mı kontrol et
      const existingItem = cartItems.find(item => item.product_id === product.id);
      
      if (existingItem) {
        // Varsa miktarını güncelle
        const newQuantity = existingItem.quantity + quantity;
        const result = await api.updateCartItem(existingItem.id, {
          quantity: newQuantity,
          total: product.price * newQuantity
        });
        if (result.success) {
          await loadCart(user.id); // Sepeti yenile
        }
      } else {
        // Yoksa yeni ekle
        const cartItem = {
          user_id: user.id,
          product_id: product.id,
          quantity,
          price: product.price,
          total: product.price * quantity
        };

        const result = await api.addToCart(cartItem);
        if (result.success) {
          await loadCart(user.id); // Sepeti yenile
        }
      }
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      alert('Ürün sepete eklenirken hata oluştu.');
    }
  }, [user?.id, cartItems, loadCart]);

  // Sepetten kaldır
  const removeFromCart = useCallback(async (itemId) => {
    try {
      const result = await api.removeFromCart(itemId);
      if (result.success) {
        await loadCart(user?.id); // Sepeti yenile
      }
    } catch (error) {
      console.error('Sepetten kaldırma hatası:', error);
    }
  }, [user?.id, loadCart]);

  // Sepeti temizle
  const clearCart = useCallback(async () => {
    try {
      const promises = cartItems.map(item => api.removeFromCart(item.id));
      await Promise.all(promises);
      setCartItems([]);
    } catch (error) {
      console.error('Sepet temizleme hatası:', error);
    }
  }, [cartItems]);

  // Sepet toplamları - useMemo ile optimize et
  const cartSummary = React.useMemo(() => ({
    itemCount: cartItems.reduce((total, item) => total + item.quantity, 0),
    subtotal: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
    total: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }), [cartItems]);

  const value = React.useMemo(() => ({
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    refreshCart: loadCart,
    cartSummary
  }), [cartItems, loading, addToCart, removeFromCart, clearCart, loadCart, cartSummary]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart hook CartProvider içinde kullanılmalıdır');
  }
  return context;
} 