'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

/**
 * Sepet Sidebar Bileşeni
 * @param {Object} props - Sepet sidebar özellikleri
 * @param {boolean} props.isOpen - Sidebar açık mı
 * @param {function} props.onClose - Kapatma fonksiyonu
 * @param {Array} props.items - Sepetteki ürünler
 * @param {function} props.updateQuantity - Miktar güncelleme fonksiyonu
 * @param {function} props.removeItem - Ürün silme fonksiyonu
 * @param {number} props.subtotal - Ara toplam
 * @param {number} props.deliveryFee - Teslimat ücreti
 * @param {number} props.discount - İndirim tutarı
 * @param {string} props.discountCode - İndirim kodu
 * @param {function} props.applyDiscountCode - İndirim kodu uygulama fonksiyonu
 * @param {function} props.clearCart - Sepeti temizleme fonksiyonu
 */
const CartSidebar = ({
  isOpen,
  onClose,
  items = [],
  updateQuantity,
  removeItem,
  subtotal = 0,
  deliveryFee = 0,
  discount = 0,
  discountCode = '',
  applyDiscountCode,
  clearCart,
}) => {
  const router = useRouter();
  const sidebarRef = useRef(null);
  const [newDiscountCode, setNewDiscountCode] = useState('');
  const [showDiscountInput, setShowDiscountInput] = useState(false);

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
  
  // İndirim kodu uygula
  const handleApplyDiscountCode = () => {
    if (newDiscountCode.trim() && applyDiscountCode) {
      applyDiscountCode(newDiscountCode);
      setNewDiscountCode('');
      setShowDiscountInput(false);
    }
  };
  
  // Toplam miktar
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  // Toplam tutar
  const total = subtotal + deliveryFee - discount;
  
  // Sepet boşsa
  const isCartEmpty = items.length === 0;
  
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
              Sepetim {totalItems > 0 && `(${totalItems})`}
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
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 relative">
                    <div className="flex items-start">
                      {/* Ürün resmi */}
                      <div className="w-20 h-20 rounded-lg bg-gray-100 mr-3 overflow-hidden">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
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
                        {item.variant && (
                          <p className="text-xs text-gray-500 mt-0.5">{item.variant}</p>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button 
                              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                              onClick={() => updateQuantity && updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              disabled={item.quantity <= 1}
                              aria-label="Azalt"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-gray-700">{item.quantity}</span>
                            <button 
                              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                              onClick={() => updateQuantity && updateQuantity(item.id, item.quantity + 1)}
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
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="block text-xs text-gray-500 line-through">
                                {(item.originalPrice * item.quantity).toFixed(2)} TL
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Silme butonu */}
                    <button 
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 focus:outline-none transition-colors"
                      onClick={() => removeItem && removeItem(item.id)}
                      aria-label="Sil"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                {/* Temizle butonu */}
                {items.length > 0 && clearCart && (
                  <div className="flex justify-end">
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
              {/* İndirim kodu */}
              {showDiscountInput ? (
                <div className="mb-4 flex">
                  <input
                    type="text"
                    value={newDiscountCode}
                    onChange={(e) => setNewDiscountCode(e.target.value)}
                    placeholder="İndirim kodu girin"
                    className="flex-1 text-sm px-3 py-2 bg-white border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    onClick={handleApplyDiscountCode}
                    className="px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-r-lg text-sm font-medium"
                  >
                    Uygula
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDiscountInput(true)}
                  className="text-sm text-orange-600 hover:text-orange-700 mb-3 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  İndirim Kodu Ekle
                </button>
              )}
              
              {/* Aktif indirim kodu */}
              {discountCode && (
                <div className="bg-orange-50 text-orange-700 px-3 py-2 rounded-lg text-sm flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>{discountCode}</span>
                  </div>
                  <button 
                    className="text-orange-700 hover:text-orange-800"
                    onClick={() => applyDiscountCode && applyDiscountCode('')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Fiyat özeti */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span className="font-medium text-gray-800">{subtotal.toFixed(2)} TL</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Teslimat Ücreti</span>
                  <span className="font-medium text-gray-800">{deliveryFee.toFixed(2)} TL</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>İndirim</span>
                    <span className="font-medium">-{discount.toFixed(2)} TL</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                  <span className="font-semibold text-gray-800">Toplam</span>
                  <span className="font-bold text-gray-900">{total.toFixed(2)} TL</span>
                </div>
              </div>
              
              {/* Butonlar */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="md"
                  fullWidth
                >
                  Sepete Dön
                </Button>
                
                <Button
                  onClick={handleCheckout}
                  variant="primary"
                  size="md"
                  fullWidth
                >
                  Ödeme Yap
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;