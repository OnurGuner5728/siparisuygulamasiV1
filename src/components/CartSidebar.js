'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { FiMinus, FiPlus, FiX, FiShoppingBag, FiTrash2 } from 'react-icons/fi';

/**
 * Sepet Sidebar Bileşeni
 * @param {Object} props - Sepet sidebar özellikleri
 * @param {boolean} props.isOpen - Sidebar açık mı
 * @param {function} props.onClose - Kapatma fonksiyonu
 */
const CartSidebar = ({ isOpen, onClose }) => {
  const router = useRouter();
  const sidebarRef = useRef(null);
  
  // CartContext'ten sepet fonksiyonlarını al
  const { 
    cartItems, 
    removeFromCart, 
    removeItemCompletely,
    addToCart: contextAddToCart, 
    clearCart,
    calculateSubtotal,
    calculateDeliveryFee,
    calculateTotal
  } = useCart();
  
  // ESC tuşuna basıldığında sidebar'ı kapat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  // Sidebar açıldığında body scroll'unu kapat
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Dışarı tıklanınca kapat
  const handleOutsideClick = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  // Ödeme sayfasına git
  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };
  
  // Ürün miktarını arttır
  const handleIncreaseQuantity = async (item) => {
    try {
      const product = {
        id: item.product_id,
        product_id: item.product_id,
        price: parseFloat(item.price),
        name: item.name,
        store_id: item.store_id,
        store_name: item.store_name,
        category: item.category || ''
      };
      await contextAddToCart(product, 1, item.store_type);
    } catch (error) {
      console.error('Miktar artırma hatası:', error);
    }
  };
  
  // Ürün miktarını azalt
  const handleDecreaseQuantity = async (item) => {
    try {
      await removeFromCart(item.product_id, item.store_id);
    } catch (error) {
      console.error('Miktar azaltma hatası:', error);
    }
  };
  
  // Ürünü sepetten tamamen kaldır
  const handleRemoveItem = async (item) => {
    try {
      await removeItemCompletely(item.product_id, item.store_id);
    } catch (error) {
      console.error('Ürün kaldırma hatası:', error);
    }
  };
  
  // Sepeti temizle
  const handleClearCart = async () => {
    if (confirm('Sepeti tamamen temizlemek istediğinize emin misiniz?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Sepet temizleme hatası:', error);
      }
    }
  };
  
  // Sepet boşsa
  const isCartEmpty = cartItems.length === 0;
  
  // Fiyat hesaplamaları
  const subtotal = calculateSubtotal();
  const deliveryFee = calculateDeliveryFee();
  const total = calculateTotal();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden"
      onClick={handleOutsideClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div 
          ref={sidebarRef}
          className="w-full sm:w-96 bg-gray-900 shadow-xl transform transition-all ease-in-out duration-300 flex flex-col h-full"
        >
          {/* Header */}
          <div className="px-4 py-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Sepetim</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white focus:outline-none transition-colors p-2"
                aria-label="Kapat"
              >
                <FiX size={24} />
              </button>
            </div>
            {itemCount > 0 && (
              <p className="text-gray-400 text-sm mt-1">{itemCount} ürün</p>
            )}
          </div>
          
          {/* İçerik */}
          <div className="flex-1 overflow-y-auto">
            {isCartEmpty ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <FiShoppingBag className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Sepetiniz Boş</h3>
                <p className="text-gray-400 mb-6">Sepetinize ürün ekleyin ve siparişinizi tamamlayın.</p>
                <button
                  onClick={onClose}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Alışverişe Başla
                </button>
              </div>
            ) : (
              <div className="p-4">
                {/* Mağaza bilgisi */}
                {cartItems.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center text-white">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-700 rounded-full mr-3">
                        {cartItems[0].store_type === 'yemek' ? '🍽️' : 
                         cartItems[0].store_type === 'market' ? '🏪' : '💧'}
                      </div>
                      <div>
                        <div className="font-medium">{cartItems[0].store_name || 'Mağaza'}</div>
                        <div className="text-sm text-gray-400">
                          {cartItems[0].store_type === 'yemek' ? 'Restaurant' : 
                           cartItems[0].store_type === 'market' ? 'Market' : 'Su Satıcısı'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Sepetteki ürünler */}
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-gray-800 rounded-lg p-4 relative">
                      <div className="flex items-start">
                        {/* Ürün resmi */}
                        <div className="w-16 h-16 rounded-lg bg-gray-700 mr-3 overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              <span className="text-xs">Resim Yok</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Ürün detayları */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm mb-2 leading-tight">{item.name}</h4>
                          
                          <div className="flex items-center justify-between">
                            {/* Miktar kontrolleri */}
                            <div className="flex items-center space-x-3">
                              <button 
                                className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                                onClick={() => handleDecreaseQuantity(item)}
                                aria-label="Azalt"
                              >
                                <FiMinus size={14} />
                              </button>
                              
                              <span className="text-white font-medium min-w-[20px] text-center">{item.quantity}</span>
                              
                              <button 
                                className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
                                onClick={() => handleIncreaseQuantity(item)}
                                aria-label="Arttır"
                              >
                                <FiPlus size={14} />
                              </button>
                            </div>
                            
                            {/* Fiyat */}
                            <div className="text-right">
                              <div className="text-orange-400 font-bold">
                                {(item.price * item.quantity).toFixed(2)} TL
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Silme butonu */}
                      <button 
                        className="absolute top-3 right-3 text-gray-500 hover:text-red-400 focus:outline-none transition-colors"
                        onClick={() => handleRemoveItem(item)}
                        aria-label="Sil"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Sepeti temizle butonu */}
                {cartItems.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-700">
                    <button 
                      className="w-full flex items-center justify-center text-gray-400 hover:text-red-400 py-2 focus:outline-none transition-colors"
                      onClick={handleClearCart}
                    >
                      <FiTrash2 className="mr-2" size={16} />
                      Sepeti Temizle
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer - Fiyat özeti ve butonlar */}
          {!isCartEmpty && (
            <div className="border-t border-gray-700 p-4">
              {/* Fiyat özeti */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Ara Toplam:</span>
                  <span className="text-white">{subtotal.toFixed(2)} TL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Teslimat:</span>
                  <span className="text-white">
                    {deliveryFee === 0 ? 'Ücretsiz' : `${deliveryFee.toFixed(2)} TL`}
                  </span>
                </div>
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Toplam:</span>
                    <span className="text-orange-400 text-xl">{total.toFixed(2)} TL</span>
                  </div>
                </div>
              </div>
              
              {/* Sipariş butonu */}
              <button
                onClick={handleCheckout}
                className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold hover:bg-orange-600 transition-colors text-lg"
              >
                SİPARİŞİ TAMAMLA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;