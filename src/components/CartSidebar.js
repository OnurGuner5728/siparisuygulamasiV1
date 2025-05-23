'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';

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
    addToCart, 
    clearCart,
    cartSummary
  } = useCart();
  
  // Teslimat ücreti hesaplama (150 TL üzeri ücretsiz)
  const deliveryFee = cartSummary.subtotal >= 150 ? 0 : 15;
  const total = cartSummary.subtotal + deliveryFee;

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
    await addToCart({ 
      id: item.product?.id || item.product_id, 
      price: item.product?.price || item.price 
    }, 1);
  };
  
  // Ürün miktarını azalt veya kaldır
  const handleDecreaseQuantity = async (itemId) => {
    await removeFromCart(itemId);
  };
  
  // Ürünü sepetten tamamen kaldır
  const handleRemoveItem = async (itemId) => {
    await removeFromCart(itemId);
  };
  
  // Sepet boşsa
  const isCartEmpty = cartItems.length === 0;
  
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
          className="w-full sm:w-96 bg-white shadow-xl transform transition-all ease-in-out duration-300 flex flex-col h-full"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Sepetim {cartSummary.itemCount > 0 && `(${cartSummary.itemCount})`}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
              aria-label="Kapat"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* İçerik */}
          <div className="flex-1 overflow-y-auto p-4">
            {isCartEmpty ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Sepetiniz Boş</h3>
                <p className="text-gray-500 mb-6">Sepetinize ürün ekleyin ve siparişinizi tamamlayın.</p>
                <Button onClick={onClose} variant="primary" size="md">
                  Alışverişe Başla
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Sepetteki ürünler */}
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 relative">
                    <div className="flex items-start">
                      {/* Ürün resmi */}
                      <div className="w-20 h-20 rounded-lg bg-gray-100 mr-3 overflow-hidden">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Ürün detayları */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button 
                              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                              onClick={() => handleDecreaseQuantity(item.id)}
                              aria-label="Azalt"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-gray-700">{item.quantity}</span>
                            <button 
                              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                              onClick={() => handleIncreaseQuantity(item)}
                              aria-label="Arttır"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-sm font-semibold text-gray-800">
                              {(item.price * item.quantity).toFixed(2)} TL
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Silme butonu */}
                    <button 
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 focus:outline-none transition-colors"
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label="Sil"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                {/* Temizle butonu */}
                {cartItems.length > 0 && (
                  <div className="flex justify-end pt-2">
                    <button 
                      className="text-sm text-gray-500 hover:text-red-500 flex items-center focus:outline-none transition-colors"
                      onClick={clearCart}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Sepeti Temizle
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer - Fiyat özeti ve butonlar */}
          {!isCartEmpty && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              {/* Fiyat özeti */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam:</span>
                  <span className="text-gray-800">{cartSummary.subtotal.toFixed(2)} TL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Teslimat Ücreti:</span>
                  <span className="text-gray-800">{deliveryFee.toFixed(2)} TL</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-800">Toplam:</span>
                    <span className="text-primary-600 text-lg">{total.toFixed(2)} TL</span>
                  </div>
                </div>
              </div>
              
              {/* Devam et ve alışverişe devam et butonları */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Alışverişe Devam Et
                </button>
                <button
                  onClick={handleCheckout}
                  className="px-4 py-2 text-sm text-white bg-green-600 border border-green-600 rounded-md hover:bg-green-700 transition-colors"
                >
                  Siparişi Tamamla
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;