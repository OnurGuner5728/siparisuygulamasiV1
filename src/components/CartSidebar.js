'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext';

export default function CartSidebar({ isOpen, onClose }) {
  const { 
    cartItems, 
    removeFromCart, 
    addToCart, 
    removeItemCompletely,
    calculateSubtotal,
    calculateDeliveryFee,
    calculateTotal
  } = useCart();
  
  // Modal dışında tıklandığında kapatma
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && e.target.classList.contains('cart-overlay')) {
        onClose();
      }
    };
    
    document.addEventListener('click', handleOutsideClick);
    
    // Sidebar açıkken scroll'u engelle
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="cart-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full md:w-96 h-full overflow-y-auto shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Sepetim</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500">Sepetiniz boş</p>
              <p className="text-sm text-gray-400 mt-1">Menüden ürün ekleyebilirsiniz</p>
              <button 
                onClick={onClose}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Alışverişe Devam Et
              </button>
            </div>
          ) : (
            <>
              <div className="divide-y mb-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium">{item.name}</span>
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">{item.quantity}x</span>
                      </div>
                      <p className="text-sm text-gray-600">{(item.price * item.quantity).toFixed(2)} TL</p>
                      {item.storeName && (
                        <p className="text-xs text-gray-400">{item.storeName}</p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <button 
                        className="text-red-500 hover:text-red-700 p-1"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button 
                        className="text-blue-500 hover:text-blue-700 p-1"
                        onClick={() => addToCart(item)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button 
                        className="ml-1 text-gray-400 hover:text-gray-600 p-1"
                        onClick={() => removeItemCompletely(item.id)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Ara Toplam:</span>
                  <span>{calculateSubtotal().toFixed(2)} TL</span>
                </div>
                <div className="flex justify-between mb-2 text-sm text-gray-600">
                  <span>Teslimat Ücreti:</span>
                  <span>
                    {calculateDeliveryFee() === 0 
                      ? 'Ücretsiz' 
                      : `${calculateDeliveryFee().toFixed(2)} TL`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4">
                  <span>Toplam:</span>
                  <span>{calculateTotal().toFixed(2)} TL</span>
                </div>
                
                <Link 
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full mt-6 py-3 bg-blue-600 text-white text-center font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Siparişi Tamamla
                </Link>
                
                <button 
                  onClick={onClose}
                  className="block w-full mt-3 py-2 text-blue-600 text-center text-sm hover:text-blue-800"
                >
                  Alışverişe Devam Et
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 