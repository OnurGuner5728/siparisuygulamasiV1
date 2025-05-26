'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '@/lib/api';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // localStorage backup for offline capability
  const [cartBackup, setCartBackup] = useLocalStorage('cart_backup', [], {
    validateData: (data) => Array.isArray(data),
    syncAcrossTabs: true
  });

  // Sepet yükle - Her seferinde API'den güncel veriyi al
  const loadCart = useCallback(async (userId) => {
    if (!userId) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      const items = await api.getUserCartItems(userId);
      setCartItems(items || []);
      setCartBackup(items || []); // Backup to localStorage
    } catch (error) {
      console.error('Sepet yüklenirken hata:', error);
      // If network fails, try to load from backup
      if (cartBackup && cartBackup.length > 0 && cartBackup[0]?.user_id === userId) {
        setCartItems(cartBackup);
      } else {
        setCartItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, [cartBackup, setCartBackup]);

  // User değiştiğinde sepeti yükle
  useEffect(() => {
    if (user?.id) {
      loadCart(user.id);
    } else {
      setCartItems([]);
    }
  }, [user?.id, loadCart]);

  // Sepete ekle
  const addToCart = useCallback(async (product, quantity = 1, storeType = 'yemek') => {
    if (!user?.id) {
      alert('Sepete ürün eklemek için giriş yapmalısınız.');
      return;
    }

    try {
      // Sepette ürün var mı kontrol et
      if (cartItems.length > 0) {
        const firstItem = cartItems[0];
        
        // Farklı kategori kontrolü (yemek, market, su)
        if (firstItem.store_type !== storeType) {
          const currentCategoryName = firstItem.store_type === 'yemek' ? 'Yemek' : 
                                     firstItem.store_type === 'market' ? 'Market' : 'Su';
          const newCategoryName = storeType === 'yemek' ? 'Yemek' : 
                                 storeType === 'market' ? 'Market' : 'Su';
          
          const shouldClear = confirm(
            `Sepetinizde ${currentCategoryName} kategorisinden ürünler var.\n\n` +
            `${newCategoryName} kategorisinden ürün eklemek için sepeti temizlememiz gerekiyor.\n\n` +
            `Sepeti temizleyip yeni ürünü eklemek istiyor musunuz?`
          );
          
          if (!shouldClear) {
            return; // Kullanıcı iptal etti
          }
          
          // Sepeti temizle
          const clearPromises = cartItems.map(item => api.removeFromCart(item.id));
          await Promise.all(clearPromises);
          setCartItems([]);
        }
        // Farklı mağaza kontrolü (aynı kategori içinde)
        else if (firstItem.store_id !== product.store_id) {
          // Mağaza adını almaya çalış
          let currentStoreName = 'mevcut mağaza';
          let newStoreName = 'yeni mağaza';
          
          try {
            // Store isimlerini products'tan veya cart items'dan alabiliyorsak al
            if (firstItem.store_name) {
              currentStoreName = firstItem.store_name;
            }
            if (product.store_name) {
              newStoreName = product.store_name;
            }
          } catch (error) {
            // Store isimleri alınamazsa default değerler kullanılır
          }
          
          const shouldClear = confirm(
            `Sepetinizde "${currentStoreName}" mağazasından ürünler var.\n\n` +
            `"${newStoreName}" mağazasından ürün eklemek için sepeti temizlememiz gerekiyor.\n\n` +
            `Sepeti temizleyip yeni ürünü eklemek istiyor musunuz?`
          );
          
          if (!shouldClear) {
            return; // Kullanıcı iptal etti
          }
          
          // Sepeti temizle
          const clearPromises = cartItems.map(item => api.removeFromCart(item.id));
          await Promise.all(clearPromises);
          setCartItems([]);
        }
      }

      // Mevcut sepette aynı ürün var mı kontrol et
      const existingItem = cartItems.find(item => item.product_id === (product.product_id || product.id));
      
      if (existingItem) {
        // Varsa miktarını güncelle
        const newQuantity = existingItem.quantity + quantity;
        const result = await api.updateCartItem(existingItem.id, {
          quantity: newQuantity,
          total: product.price * newQuantity
        });
        if (result.success) {
          // UI'ı hemen güncelle
          setCartItems(prevItems => 
            prevItems.map(item => 
              item.id === existingItem.id 
                ? { ...item, quantity: newQuantity, total: product.price * newQuantity }
                : item
            )
          );
          // Backup'ı güncelle
          await loadCart(user.id);
        } else {
          console.error('Sepet güncellemesi başarısız:', result.error);
          throw new Error(result.error || 'Sepet güncellemesi başarısız');
        }
      } else {
        // Yoksa yeni ekle
        const cartItem = {
          user_id: user.id,
          product_id: product.product_id || product.id,
          store_id: product.store_id,
          name: product.name,
          store_name: product.store_name || '',
          store_type: storeType,
          category: product.category || '',
          quantity,
          price: product.price,
          total: product.price * quantity
        };

        const result = await api.addToCart(cartItem);
        if (result.success) {
          // UI'ı hemen güncelle
          const newCartItem = { ...cartItem, id: result.data.id };
          setCartItems(prevItems => [...prevItems, newCartItem]);
          // Backup'ı güncelle
          await loadCart(user.id);
        } else {
          console.error('Sepete ekleme başarısız:', result.error);
          throw new Error(result.error || 'Sepete ekleme başarısız');
        }
      }
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      alert('Ürün sepete eklenirken hata oluştu.');
    }
  }, [user?.id, cartItems, loadCart]);

  // Sepetten kaldır (miktar azalt)
  const removeFromCart = useCallback(async (productId, storeId) => {
    try {
      const item = cartItems.find(item => item.product_id === productId && item.store_id === storeId);
      if (!item) return;
      
      if (item.quantity > 1) {
        // Miktarını azalt
        const newQuantity = item.quantity - 1;
        const result = await api.updateCartItem(item.id, {
          quantity: newQuantity,
          total: item.price * newQuantity
        });
        if (result.success) {
          // UI'ı hemen güncelle
          setCartItems(prevItems => 
            prevItems.map(cartItem => 
              cartItem.id === item.id 
                ? { ...cartItem, quantity: newQuantity, total: item.price * newQuantity }
                : cartItem
            )
          );
          await loadCart(user?.id); // Backup güncelle
        }
      } else {
        // Tamamen kaldır
        const result = await api.removeFromCart(item.id);
        if (result.success) {
          // UI'ı hemen güncelle
          setCartItems(prevItems => prevItems.filter(cartItem => cartItem.id !== item.id));
          await loadCart(user?.id); // Backup güncelle
        }
      }
    } catch (error) {
      console.error('Sepetten kaldırma hatası:', error);
    }
  }, [user?.id, cartItems, loadCart]);

  // Ürünü tamamen kaldır
  const removeItemCompletely = useCallback(async (productId, storeId) => {
    try {
      const item = cartItems.find(item => item.product_id === productId && item.store_id === storeId);
      if (!item) return;
      
      const result = await api.removeFromCart(item.id);
      if (result.success) {
        // UI'ı hemen güncelle
        setCartItems(prevItems => prevItems.filter(cartItem => cartItem.id !== item.id));
        await loadCart(user?.id); // Backup güncelle
      }
    } catch (error) {
      console.error('Sepetten tamamen kaldırma hatası:', error);
    }
  }, [user?.id, cartItems, loadCart]);

  // Sepeti temizle  
  const clearCart = useCallback(async () => {
    try {
      // UI'ı hemen güncelle
      setCartItems([]);
      setCartBackup([]);
      
      // API'den de temizle
      const promises = cartItems.map(item => api.removeFromCart(item.id));
      await Promise.all(promises);
    } catch (error) {
      console.error('Sepet temizleme hatası:', error);
      // Hata durumunda sepeti yeniden yükle
      if (user?.id) {
        await loadCart(user.id);
      }
    }
  }, [cartItems, setCartBackup, user?.id, loadCart]);

  // Sepet hesaplama fonksiyonları
  const calculateSubtotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const calculateDeliveryFee = useCallback(() => {
    const subtotal = calculateSubtotal();
    // 150 TL üzeri ücretsiz teslimat
    return subtotal >= 150 ? 0 : 15;
  }, [calculateSubtotal]);

  const calculateTotal = useCallback(() => {
    return calculateSubtotal() + calculateDeliveryFee();
  }, [calculateSubtotal, calculateDeliveryFee]);

  // Sepet toplamları - useMemo ile optimize et
  const cartSummary = React.useMemo(() => ({
    itemCount: cartItems.reduce((total, item) => total + item.quantity, 0),
    subtotal: calculateSubtotal(),
    total: calculateTotal()
  }), [cartItems, calculateSubtotal, calculateTotal]);

  const value = React.useMemo(() => ({
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    clearCart,
    refreshCart: loadCart,
    cartSummary,
    totalItems: cartSummary.itemCount,
    calculateSubtotal,
    calculateDeliveryFee,
    calculateTotal
  }), [cartItems, loading, addToCart, removeFromCart, removeItemCompletely, clearCart, loadCart, cartSummary, calculateSubtotal, calculateDeliveryFee, calculateTotal]);

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