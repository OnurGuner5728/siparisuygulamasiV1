'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import ConfirmModal from '@/components/ConfirmModal';
import api from '@/lib/api';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { success, error, warning } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [cartBackup, setCartBackup] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forceRender, setForceRender] = useState(0);
  const [forceNewProduct, setForceNewProduct] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null });
  const [currentStore, setCurrentStore] = useState(null); // Mağaza bilgisi cache
  
  // localStorage backup for offline capability
  const [cartBackupLocal, setCartBackupLocal] = useLocalStorage('cart_backup', [], {
    validateData: (data) => Array.isArray(data),
    syncAcrossTabs: true
  });

    // Sepet yükle - Her seferinde API'den güncel veriyi al
  const loadCart = useCallback(async (userId, skipBackup = false) => {
    console.log('🔄 loadCart çağrıldı:', { userId, skipBackup, currentCartLength: cartItems.length });
    
    if (!userId) {
      console.log('❌ loadCart: userId yok, sepet temizleniyor');
      setCartItems([]);
      setCurrentStore(null);
      setForceRender(prev => prev + 1); // UI force refresh
      return;
    }

    setLoading(true);
    try {
      console.log('📡 API çağrısı başlatılıyor: getUserCartItems');
      const items = await api.getUserCartItems(userId, skipBackup); // cache bypass için skipBackup kullan
      console.log('📦 API den gelen items:', items?.length || 0, 'öğe');
      
      setCartItems(items || []);
      
      // Sepette ürün varsa store bilgisini yükle
      if (items && items.length > 0) {
        const storeId = items[0].store_id;
        if (storeId) {
          try {
            const store = await api.getStoreById(storeId);
            setCurrentStore(store);
            console.log('🏪 Store bilgisi yüklendi:', store?.name);
          } catch (storeError) {
            console.error('❌ Store bilgisi yüklenirken hata:', storeError);
            setCurrentStore(null);
          }
        }
      } else {
        setCurrentStore(null);
      }
      
      setForceRender(prev => prev + 1); // UI force refresh
      if (!skipBackup) {
        // Backup güncelleme - daha güvenli yöntem
        const currentBackup = JSON.parse(localStorage.getItem('cart_backup') || '[]');
        if (JSON.stringify(currentBackup) !== JSON.stringify(items || [])) {
          setCartBackup(items || []);
          console.log('💾 Backup güncellendi:', items?.length || 0, 'öğe');
        }
      }
    } catch (error) {
      console.error('❌ Sepet yüklenirken hata:', error);
      // If network fails, try to load from backup
      if (!skipBackup) {
        const currentBackup = JSON.parse(localStorage.getItem('cart_backup') || '[]');
        if (currentBackup && currentBackup.length > 0 && currentBackup[0]?.user_id === userId) {
          console.log('🔄 Backup tan yükleniyor:', currentBackup.length, 'öğe');
          setCartItems(currentBackup);
          setCurrentStore(null); // Backup'tan store bilgisi yüklenemez
          setForceRender(prev => prev + 1); // UI force refresh
        } else {
          console.log('🗑️ Sepet temizlendi (hata + backup yok)');
          setCartItems([]);
          setCurrentStore(null);
          setForceRender(prev => prev + 1); // UI force refresh
        }
      } else {
        console.log('🗑️ Sepet temizlendi (skipBackup=true)');
        setCartItems([]);
        setCurrentStore(null);
        setForceRender(prev => prev + 1); // UI force refresh
      }
    } finally {
      setLoading(false);
    }
  }, []); // cartItems dependency'si yok - infinite loop'u önlemek için
  
  // User değiştiğinde sepeti yükle
  useEffect(() => {
    console.log('🔄 useEffect tetiklendi:', { userId: user?.id });
    
    if (user?.id) {
      loadCart(user.id);
    } else {
      console.log('❌ User ID yok, sepet temizleniyor');
      setCartItems([]);
      setForceRender(prev => prev + 1); // UI force refresh
    }
  }, [user?.id]); // Sadece user.id dependency



  // Sepete ekle
  const addToCart = useCallback(async (product, quantity = 1, storeType = 'yemek', selectedOptions = [], forceNew = false) => {
    if (!user?.id) {
      warning('Sepete ürün eklemek için giriş yapmalısınız.');
      return;
    }

    try {
      // FRESH STATE AL - closure problemi için
      let freshCartItems = [];
      let freshForceNewProduct = false;
      
      // State'i callback ile al
      setCartItems(items => {
        freshCartItems = [...items];
        return items; // State'i değiştirme, sadece oku
      });
      
      setForceNewProduct(flag => {
        freshForceNewProduct = flag;
        return flag; // State'i değiştirme, sadece oku
      });
      
      console.log('🔍 [FRESH] freshCartItems length:', freshCartItems.length, 'forceNewProduct:', freshForceNewProduct);
      
      // Sepette ürün var mı kontrol et
      if (freshCartItems.length > 0) {
        const firstItem = freshCartItems[0];
        let shouldContinue = true;
        
        // Farklı kategori kontrolü (yemek, market, su)
        if (firstItem.store_type !== storeType) {
          const currentCategoryName = firstItem.store_type === 'yemek' ? 'Yemek' : 
                                     firstItem.store_type === 'market' ? 'Market' : 'Su';
          const newCategoryName = storeType === 'yemek' ? 'Yemek' : 
                                 storeType === 'market' ? 'Market' : 'Su';
          
          shouldContinue = await new Promise((resolve) => {
            setConfirmModal({
              isOpen: true,
              data: {
                title: 'Sepet Temizleme Gerekli',
                message: `Sepetinizde "${currentCategoryName}" kategorisinden ürünler var.\n\n"${newCategoryName}" kategorisinden ürün eklemek için sepeti temizlememiz gerekiyor.\n\nSepeti temizleyip yeni ürünü eklemek istiyor musunuz?`,
                onConfirm: async () => {
                  try {
                    console.log('🗑️ [KATEGORI] Sepet temizleme başlatıldı, mevcut items:', freshCartItems.length);
                    
                    // Önce sepeti temizle
                    const clearPromises = freshCartItems.map(item => {
                      console.log('🗑️ [KATEGORI] Siliniyor:', item.id, item.name);
                      return api.removeFromCart(item.id);
                    });
                    await Promise.all(clearPromises);
                    
                    console.log('✅ [KATEGORI] API silme işlemleri tamamlandı');
                    
                    // Cache'i de temizle
                    api.clearCartCache(user.id);
                    
                    console.log('🎯 [KATEGORI] State, cache ve backup temizleniyor');
                    
                    // State'i temizle ve modal'ı kapat - flushSync ile zorla güncelle
                    console.log('🔄 [KATEGORI] flushSync ile state güncelleniyor...');
                    flushSync(() => {
                      setCartItems([]);
                      setCartBackup([]);
                      setForceNewProduct(true);
                      setForceRender(prev => {
                        console.log('🔄 [KATEGORI] forceRender güncellendi:', prev, '=>', prev + 1);
                        return prev + 1;
                      });
                    });
                    
                    setConfirmModal({ isOpen: false, data: null });
                    
                    console.log('✅ [KATEGORI] State güncellendi, UI yenilendi');
                    
                    // Sepet temizlendi mesajını göster
                    success('Sepet temizlendi');
                    
                    console.log('🎯 [KATEGORI] Yeni ürün ekleme onaylandı');
                    resolve(true);
                    
                  } catch (err) {
                    console.error('❌ [KATEGORI] Sepet temizlenirken hata:', err);
                    error('Sepet temizlenirken hata oluştu');
                    setConfirmModal({ isOpen: false, data: null });
                    resolve(false);
                  }
                },
                onCancel: () => {
                  setConfirmModal({ isOpen: false, data: null });
                  resolve(false);
                }
              }
            });
          });
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
          
          shouldContinue = await new Promise((resolve) => {
            setConfirmModal({
              isOpen: true,
              data: {
                title: 'Sepet Temizleme Gerekli',
                message: `Sepetinizde "${currentStoreName}" mağazasından ürünler var.\n\n"${newStoreName}" mağazasından ürün eklemek için sepeti temizlememiz gerekiyor.\n\nSepeti temizleyip yeni ürünü eklemek istiyor musunuz?`,
                onConfirm: async () => {
                  try {
                    console.log('🗑️ [MAĞAZA] Sepet temizleme başlatıldı, mevcut items:', freshCartItems.length);
                    
                    // Önce sepeti temizle
                    const clearPromises = freshCartItems.map(item => {
                      console.log('🗑️ [MAĞAZA] Siliniyor:', item.id, item.name);
                      return api.removeFromCart(item.id);
                    });
                    await Promise.all(clearPromises);
                    
                    console.log('✅ [MAĞAZA] API silme işlemleri tamamlandı');
                    
                    // Cache'i de temizle
                    api.clearCartCache(user.id);
                    
                    console.log('🎯 [MAĞAZA] State, cache ve backup temizleniyor');
                    
                    // State'i temizle ve modal'ı kapat - flushSync ile zorla güncelle
                    console.log('🔄 [MAĞAZA] flushSync ile state güncelleniyor...');
                    flushSync(() => {
                      setCartItems([]);
                      setCartBackup([]);
                      setForceNewProduct(true);
                      setForceRender(prev => {
                        console.log('🔄 [MAĞAZA] forceRender güncellendi:', prev, '=>', prev + 1);
                        return prev + 1;
                      });
                    });
                    
                    setConfirmModal({ isOpen: false, data: null });
                    
                    console.log('✅ [MAĞAZA] State güncellendi, UI yenilendi');
                    
                    // Sepet temizlendi mesajını göster
                    success('Sepet temizlendi');
                    
                    console.log('🎯 [MAĞAZA] Yeni ürün ekleme onaylandı');
                    resolve(true);
                    
                  } catch (err) {
                    console.error('❌ [MAĞAZA] Sepet temizlenirken hata:', err);
                    error('Sepet temizlenirken hata oluştu');
                    setConfirmModal({ isOpen: false, data: null });
                    resolve(false);
                  }
                },
                onCancel: () => {
                  setConfirmModal({ isOpen: false, data: null });
                  resolve(false);
                }
              }
            });
          });
        }
        
        if (!shouldContinue) {
          return; // Kullanıcı iptal etti
        }
        
        // Modal resolve işleminden sonra fresh state'i yeniden al
        setCartItems(items => {
          freshCartItems = [...items];
          return items; // State'i değiştirme, sadece oku
        });
        
        setForceNewProduct(flag => {
          freshForceNewProduct = flag;
          return flag; // State'i değiştirme, sadece oku
        });
        
        console.log('🔄 [AFTER MODAL] Fresh state yeniden alındı - freshCartItems length:', freshCartItems.length, 'forceNewProduct:', freshForceNewProduct);
      }

          // Mevcut sepette aynı ürün var mı kontrol et
      // NOT: forceNew=true veya forceNewProduct=true ise mevcut kontrolü atla
      const shouldForceNew = forceNew || freshForceNewProduct;
      console.log('🔍 [DEBUG] Fresh cartItems length:', freshCartItems.length, 'shouldForceNew:', shouldForceNew);
      const existingItem = shouldForceNew ? null : freshCartItems.find(item => item.product_id === (product.product_id || product.id));
      
              if (existingItem && !shouldForceNew) {
        // Varsa miktarını güncelle
        const newQuantity = existingItem.quantity + quantity;
        const result = await api.updateCartItem(existingItem.id, {
          quantity: newQuantity,
          total: product.price * newQuantity
        });
        if (result.success) {
          // UI'ı hemen güncelle
          const updatedItems = freshCartItems.map(item => 
            item.id === existingItem.id 
              ? { ...item, quantity: newQuantity, total: product.price * newQuantity }
              : item
          );
          setCartItems(updatedItems);
          setCartBackup(updatedItems); // Backup'ı da güncelle
          setForceRender(prev => prev + 1); // UI force refresh
        } else {
          console.error('Sepet güncellemesi başarısız:', result.error);
          throw new Error(result.error || 'Sepet güncellemesi başarısız');
        }
      } else {
        // Yoksa yeni ekle
        // Seçenekler varsa finalPrice kullan, yoksa normal price
        const finalPrice = product.finalPrice || product.price;
        
        const cartItem = {
          user_id: user.id,
          product_id: product.product_id || product.id,
          store_id: product.store_id,
          name: product.name,
          store_name: product.store_name || '',
          store_type: storeType,
          category: product.category || '',
          quantity,
          price: finalPrice,
          total: finalPrice * quantity,
          image: product.image || null
        };

        // Seçenekleri de gönder
        console.log('🛒 Yeni ürün ekleniyor, mevcut sepet uzunluğu:', freshCartItems.length);
        console.log('🛒 shouldForceNew:', shouldForceNew, 'forceNewProduct:', freshForceNewProduct);
        console.log('🛒 Eklenecek ürün:', cartItem);
        
        const result = await api.addToCart(cartItem, selectedOptions);
        if (result.success) {
          // UI'ı hemen güncelle
          const newCartItem = { ...cartItem, id: result.data.id };
          const updatedItems = [...freshCartItems, newCartItem];
          
          console.log('✅ Ürün başarıyla eklendi, yeni sepet uzunluğu:', updatedItems.length);
          
          setCartItems(updatedItems);
          setCartBackup(updatedItems); // Backup'ı da güncelle
          
          // Store bilgisini güncelle (yeni mağaza veya sepet boştu)
          if (!currentStore || freshCartItems.length === 0) {
            try {
              const store = await api.getStoreById(product.store_id);
              setCurrentStore(store);
              console.log('🏪 Store bilgisi güncellendi:', store?.name);
            } catch (storeError) {
              console.error('❌ Store bilgisi yüklenirken hata:', storeError);
            }
          }
          
          setForceRender(prev => prev + 1); // UI force refresh
          
          // Force flag'ı sıfırla
          if (freshForceNewProduct) {
            console.log('🔄 forceNewProduct flag sıfırlandı');
            setForceNewProduct(false);
          }
          
          // Sepet daha önce temizlendiyse farklı mesaj göster
          if (freshCartItems.length === 0 || shouldForceNew) {
            console.log('🎯 Sepet boştu veya force new, yeni ürün mesajı gösteriliyor');
            success('Yeni ürün sepete eklendi');
          } else {
            console.log('📦 Sepette ürün vardı, normal ekleme mesajı gösteriliyor');
            success('Ürün sepete eklendi');
          }
        } else {
          console.error('Sepete ekleme başarısız:', result.error);
          throw new Error(result.error || 'Sepete ekleme başarısız');
        }
      }
    } catch (err) {
      console.error('Sepete ekleme hatası:', err);
      error('Ürün sepete eklenirken hata oluştu');
    }
  }, [user?.id, cartItems]);

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
          const updatedItems = cartItems.map(cartItem => 
            cartItem.id === item.id 
              ? { ...cartItem, quantity: newQuantity, total: item.price * newQuantity }
              : cartItem
          );
          setCartItems(updatedItems);
          setCartBackup(updatedItems); // Backup güncelle
          setForceRender(prev => prev + 1); // UI force refresh
        }
      } else {
        // Tamamen kaldır
        const result = await api.removeFromCart(item.id);
        if (result.success) {
          // UI'ı hemen güncelle
          const updatedItems = cartItems.filter(cartItem => cartItem.id !== item.id);
          setCartItems(updatedItems);
          setCartBackup(updatedItems); // Backup güncelle
          
          // Sepet boşaldıysa store bilgisini temizle
          if (updatedItems.length === 0) {
            setCurrentStore(null);
          }
          
          setForceRender(prev => prev + 1); // UI force refresh
        }
      }
    } catch (error) {
      console.error('Sepetten kaldırma hatası:', error);
    }
  }, [user?.id, cartItems]);

  // Ürünü tamamen kaldır
  const removeItemCompletely = useCallback(async (productId, storeId) => {
    try {
      const item = cartItems.find(item => item.product_id === productId && item.store_id === storeId);
      if (!item) return;
      
      const result = await api.removeFromCart(item.id);
      if (result.success) {
        // UI'ı hemen güncelle
        const updatedItems = cartItems.filter(cartItem => cartItem.id !== item.id);
        setCartItems(updatedItems);
        setCartBackup(updatedItems); // Backup güncelle
        
        // Sepet boşaldıysa store bilgisini temizle
        if (updatedItems.length === 0) {
          setCurrentStore(null);
        }
        
        setForceRender(prev => prev + 1); // UI force refresh
      }
    } catch (error) {
      console.error('Sepetten tamamen kaldırma hatası:', error);
    }
  }, [user?.id, cartItems]);


    // Sepeti temizle
    const clearCart = useCallback(async () => {
      if (!user?.id || cartItems.length === 0) return;
      
      try {
        const clearPromises = cartItems.map(item => api.removeFromCart(item.id));
        await Promise.all(clearPromises);
        
        // Cache'i de temizle
        api.clearCartCache(user.id);
        
        // flushSync ile zorla güncelle
        flushSync(() => {
          setCartItems([]);
          setCartBackup([]);
          setCurrentStore(null);
          setForceRender(prev => prev + 1);
        });
        
        success('Sepet temizlendi');
      } catch (err) {
        console.error('Sepet temizlenirken hata:', err);
        error('Sepet temizlenirken hata oluştu');
      }
    }, [user?.id, cartItems, success, error]);


 

  // Sepet hesaplama fonksiyonları
  const calculateSubtotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Teslimat ücreti hesaplama fonksiyonu
  const calculateDeliveryFee = useCallback(() => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Store bilgisi yoksa varsayılan değerleri kullan
    if (!currentStore) {
      return total >= 150 ? 0 : 12;
    }
    
    const deliveryFee = currentStore.delivery_fee || 12;
    const freeDeliveryThreshold = currentStore.minimum_order_for_free_delivery || 150;
    
    return total >= freeDeliveryThreshold ? 0 : deliveryFee;
  }, [cartItems, currentStore]);

  // Teslimat süresi hesaplama fonksiyonu
  const calculateDeliveryTime = useCallback(() => {
    // Store bilgisi yoksa varsayılan değerleri kullan
    if (!currentStore) {
      return { min: 30, max: 60 };
    }
    
    const minTime = currentStore.delivery_time_min || 30;
    const maxTime = currentStore.delivery_time_max || 60;
    
    return { min: minTime, max: maxTime };
  }, [currentStore]);

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
    calculateTotal,
    calculateDeliveryTime,
    forceRender, // UI refresh için
    currentStore // Mağaza bilgisi
  }), [cartItems, loading, addToCart, removeFromCart, removeItemCompletely, clearCart, loadCart, cartSummary, calculateSubtotal, calculateDeliveryFee, calculateTotal, calculateDeliveryTime, forceRender, currentStore]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={confirmModal.data?.onCancel}
          onConfirm={confirmModal.data?.onConfirm}
          title={confirmModal.data?.title}
          message={confirmModal.data?.message}
          confirmText="Tamam"
          cancelText="İptal"
          type="warning"
        />
      )}
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