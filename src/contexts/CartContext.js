'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import supabase from '@/lib/supabase';

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
  totalItems: 0,
  getCartItemsByStoreType: () => []
};

// Cart Provider bileşeni
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();
  
  // Ref'ler ile state takibi - gereksiz yeniden yüklemeleri engellemek için
  const lastUserIdRef = useRef(null);
  const lastAuthStateRef = useRef(null);
  const isLoadingRef = useRef(false);
  const loadTimeoutRef = useRef(null);
  
  // Sepeti kullanıcı ID veya konuk ID'ye göre yükleme
  const loadCart = useCallback(async (forceReload = false) => {
    // Gereksiz yeniden yüklemeyi engelle
    const currentUserId = user?.id || null;
    const currentAuthState = isAuthenticated;
    
    if (!forceReload && 
        lastUserIdRef.current === currentUserId && 
        lastAuthStateRef.current === currentAuthState &&
        !isLoadingRef.current) {
      return; // Aynı kullanıcı ve auth durumu, yeniden yükleme
    }
    
    if (isLoadingRef.current) {
      return; // Zaten yükleniyor
    }
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      
      // Timeout ile debounce
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      
      await new Promise(resolve => {
        loadTimeoutRef.current = setTimeout(resolve, 100);
      });
      
      lastUserIdRef.current = currentUserId;
      lastAuthStateRef.current = currentAuthState;
      
      if (isAuthenticated && user) {
        try {
          // Önce localStorage'dan konuk sepetini kontrol et
          const guestCart = localStorage.getItem('cart_guest');
          let guestCartItems = [];
          
          if (guestCart) {
            try {
              guestCartItems = JSON.parse(guestCart);
            } catch (parseError) {
              console.error('Guest cart parse hatası:', parseError);
              guestCartItems = [];
            }
          }
          
          // Kullanıcı oturum açmışsa, veritabanından sepetini al
          const { data, error: supabaseError } = await supabase
            .from('cart_items')
            .select('product_id, name, price, quantity, image, store_id, store_name, store_type, notes, category, user_id')
            .eq('user_id', user.id);
            
          if (supabaseError) throw supabaseError;
          
          let userCartItems = data || [];
          
          // Eğer konuk sepeti varsa, kullanıcı sepeti ile birleştir
          if (guestCartItems.length > 0) {
            // Konuk sepetindeki ürünleri kullanıcı sepetine ekle
            for (const guestItem of guestCartItems) {
              const existingItem = userCartItems.find(item => 
                item.product_id === guestItem.product_id && 
                item.store_id === guestItem.store_id
              );
              
              if (existingItem) {
                // Ürün zaten varsa miktarı artır
                existingItem.quantity += guestItem.quantity;
              } else {
                // Yeni ürün ekle
                userCartItems.push({
                  product_id: guestItem.product_id,
                  name: guestItem.name,
                  price: guestItem.price,
                  quantity: guestItem.quantity,
                  image: guestItem.image,
                  store_id: guestItem.store_id,
                  store_name: guestItem.store_name || '',
                  store_type: guestItem.store_type || 'market',
                  notes: guestItem.notes || '',
                  category: guestItem.category || '',
                  user_id: user.id
                });
              }
            }
            
            // Birleştirilmiş sepeti veritabanına kaydet
            if (userCartItems.length > 0) {
              // Önce mevcut sepeti temizle
              await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id);
                
              // Yeni sepeti kaydet
              const { error: insertError } = await supabase
                .from('cart_items')
                .insert(userCartItems);
                
                if (insertError) throw insertError;
            }
            
            // Konuk sepetini temizle
            localStorage.removeItem('cart_guest');
          }
          
          setCartItems(userCartItems);
        } catch (authError) {
          console.error('Oturum hatası:', authError);
          // Oturum hatası durumunda localStorage'dan sepeti al
          const storedCart = localStorage.getItem('cart_guest');
          if (storedCart) {
            try {
              setCartItems(JSON.parse(storedCart));
            } catch (parseError) {
              console.error('Stored cart parse hatası:', parseError);
              setCartItems([]);
            }
          } else {
            setCartItems([]);
          }
        }
      } else {
        // Kullanıcı oturum açmamışsa, localStorage'dan sepeti al
        const storedCart = localStorage.getItem('cart_guest');
        if (storedCart) {
          try {
            setCartItems(JSON.parse(storedCart));
          } catch (parseError) {
            console.error('Guest cart parse hatası:', parseError);
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      }
    } catch (err) {
      console.error('Sepet yükleme hatası:', err);
      setError(err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [isAuthenticated, user]);
  
  // Kullanıcı değiştiğinde sepeti yükle - debounced
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCart();
    }, 200);
    
    return () => clearTimeout(timeoutId);
  }, [loadCart]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);
  
  // Sepet verilerini kaydetme
  const saveCart = useCallback(async (cartData) => {
    try {
      if (isAuthenticated && user) {
        try {
          // Önce mevcut sepeti temizle
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);
            
          // Sepet boş değilse yeni öğeleri ekle
          if (cartData.length > 0) {
            // Her öğeye kullanıcı ID'si ekle ve gerekli alanları kontrol et
            const cartItemsWithUserId = cartData.map(item => ({
              product_id: item.product_id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image || '',
              store_id: item.store_id,
              store_name: item.store_name || '',
              store_type: item.store_type || 'market',
              notes: item.notes || '',
              category: item.category || '',
              user_id: user.id
            }));
            
            const { error: insertError } = await supabase
              .from('cart_items')
              .insert(cartItemsWithUserId);
              
            if (insertError) throw insertError;
          }
        } catch (authError) {
          console.error('Sepet kaydetme oturum hatası:', authError);
          // Hata durumunda localStorage'a kaydet
          localStorage.setItem('cart_guest', JSON.stringify(cartData));
        }
      } else {
        // Kullanıcı oturum açmamışsa, localStorage'a kaydet
        localStorage.setItem('cart_guest', JSON.stringify(cartData));
      }
    } catch (err) {
      console.error('Sepet kaydetme hatası:', err);
      setError(err);
      // Hata durumunda localStorage'a kaydet
      localStorage.setItem('cart_guest', JSON.stringify(cartData));
    }
  }, [isAuthenticated, user]);

  // Sepete ürün ekleme
  const addToCart = useCallback(async (product) => {
    try {
      let updatedCart = [];
      
      // product.id yerine product.product_id kullan (ürün detay sayfasından gelen property)
      const productId = product.product_id || product.id;
      
      if (!productId) {
        console.error('Ürün ID bulunamadı:', product);
        throw new Error('Ürün ID bulunamadı');
      }
      
      // Store type kontrol et (market, yemek, su, çiçek, vs.)
      const storeType = product.store_type || 'market';
      
      const existingItem = cartItems.find(item => 
        item.product_id === productId && 
        item.store_id === product.store_id
      );
      
      if (existingItem) {
        // Ürün sepette varsa, miktarını artır
        updatedCart = cartItems.map(item => 
          item.product_id === productId && item.store_id === product.store_id
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Ürün sepette yoksa, yeni ekle
        const newItem = {
          product_id: productId,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image || '',
          store_id: product.store_id,
          store_name: product.storeName || product.store_name || '',
          store_type: storeType,
          notes: product.notes || '',
          category: product.category || ''
        };
        
        updatedCart = [...cartItems, newItem];
      }
      
      setCartItems(updatedCart);
      await saveCart(updatedCart);
    } catch (err) {
      console.error('Ürün ekleme hatası:', err);
      setError(err);
    }
  }, [cartItems, saveCart]);

  // Sepetten ürün çıkarma
  const removeFromCart = useCallback(async (productId, storeId) => {
    try {
      const existingItem = cartItems.find(item => 
        item.product_id === productId && 
        (!storeId || item.store_id === storeId)
      );
      
      if (!existingItem) return;
      
      let updatedCart = [];
      
      if (existingItem.quantity > 1) {
        // Miktarı birden fazlaysa, miktarı azalt
        updatedCart = cartItems.map(item => 
          item.product_id === productId && (!storeId || item.store_id === storeId)
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      } else {
        // Miktar 1 ise, ürünü tamamen kaldır
        updatedCart = cartItems.filter(item => 
          !(item.product_id === productId && (!storeId || item.store_id === storeId))
        );
      }
      
      setCartItems(updatedCart);
      await saveCart(updatedCart);
    } catch (err) {
      console.error('Ürün çıkarma hatası:', err);
      setError(err);
    }
  }, [cartItems, saveCart]);

  // Sepetten ürünü tamamen kaldırma
  const removeItemCompletely = useCallback(async (productId, storeId) => {
    try {
      const updatedCart = cartItems.filter(item => 
        !(item.product_id === productId && (!storeId || item.store_id === storeId))
      );
      setCartItems(updatedCart);
      await saveCart(updatedCart);
    } catch (err) {
      console.error('Ürünü tamamen kaldırma hatası:', err);
      setError(err);
    }
  }, [cartItems, saveCart]);

  // Sepeti tamamen temizleme
  const clearCart = useCallback(async () => {
    try {
      setCartItems([]);
      
      if (isAuthenticated && user) {
        // Veritabanından sepeti temizle
        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
          
        if (deleteError) throw deleteError;
      } else {
        // LocalStorage'dan sepeti temizle
        localStorage.removeItem('cart_guest');
      }
    } catch (err) {
      console.error('Sepeti temizleme hatası:', err);
      setError(err);
    }
  }, [isAuthenticated, user]);

  // Mağaza tipine göre sepetteki ürünleri getir
  const getCartItemsByStoreType = useCallback((storeType) => {
    try {
      return cartItems.filter(item => 
        !storeType || item.store_type === storeType
      );
    } catch (err) {
      console.error('Mağaza tipine göre sepet filtreleme hatası:', err);
      return [];
    }
  }, [cartItems]);

  // Ara toplam hesaplama
  const calculateSubtotal = useCallback((storeType) => {
    try {
      const items = storeType 
        ? cartItems.filter(item => item.store_type === storeType) 
        : cartItems;
        
      return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    } catch (err) {
      console.error('Ara toplam hesaplama hatası:', err);
      setError(err);
      return 0;
    }
  }, [cartItems]);

  // Teslimat ücreti hesaplama (150 TL üzeri ücretsiz)
  const calculateDeliveryFee = useCallback((storeType) => {
    try {
      const subtotal = calculateSubtotal(storeType);
      return subtotal >= 150 ? 0 : 15;
    } catch (err) {
      console.error('Teslimat ücreti hesaplama hatası:', err);
      setError(err);
      return 0;
    }
  }, [calculateSubtotal]);

  // Toplam tutar hesaplama
  const calculateTotal = useCallback((storeType) => {
    try {
      return calculateSubtotal(storeType) + calculateDeliveryFee(storeType);
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
    totalItems,
    getCartItemsByStoreType
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
    totalItems,
    getCartItemsByStoreType
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