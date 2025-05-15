'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export default function Cart() {
  return <CartContent />;
}

function CartContent() {
  const { 
    cartItems, 
    removeFromCart,
    removeItemCompletely,
    addToCart,
    calculateSubtotal,
    calculateDeliveryFee,
    calculateTotal
  } = useCart();
  
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };
  
  const handleAddItem = (item) => {
    addToCart(item);
  };
  
  const handleRemoveCompletely = (itemId) => {
    removeItemCompletely(itemId);
  };
  
  const handleApplyCoupon = () => {
    // İndirim kuponu uygulaması (demo amaçlı)
    if (couponCode.toUpperCase() === 'INDIRIM20') {
      // %20 indirim
      const subtotal = calculateSubtotal();
      setDiscount(subtotal * 0.2);
      alert('İndirim kuponu başarıyla uygulandı!');
    } else {
      setDiscount(0);
      alert('Geçersiz kupon kodu');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Kullanıcı giriş yapmamışsa, giriş sayfasına yönlendir
      localStorage.setItem('redirectAfterLogin', '/checkout');
      router.push('/login');
    } else {
      // Kullanıcı giriş yapmışsa, ödeme sayfasına yönlendir
      router.push('/checkout');
    }
  };
  
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Sepetiniz Boş</h1>
          <p className="text-lg text-gray-600 mb-8">Sepetinize henüz ürün eklemediniz.</p>
          <Link 
            href="/" 
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
            Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Sepetim</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sepet Ürünleri */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md">
            {cartItems.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row items-start md:items-center py-6 px-4 border-b last:border-b-0">
                <div className="w-full md:w-16 h-16 bg-gray-200 rounded mb-4 md:mb-0 md:mr-6 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                  ) : (
                    <span className="text-gray-400 text-xs">No Image</span>
                  )}
                </div>
                
                <div className="flex-grow mb-4 md:mb-0">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  {item.storeName && (
                    <p className="text-sm text-gray-500">{item.storeName}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">{item.price.toFixed(2)} TL</p>
                </div>
                
                <div className="flex items-center">
                  <button 
                    onClick={() => handleRemoveItem(item.id)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-2 hover:bg-gray-200"
                    aria-label="Azalt"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  
                  <span className="mx-3 font-medium">{item.quantity}</span>
                  
                  <button 
                    onClick={() => handleAddItem(item)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center ml-2 hover:bg-gray-200"
                    aria-label="Arttır"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => handleRemoveCompletely(item.id)}
                    className="ml-6 text-red-600 hover:text-red-800"
                    aria-label="Kaldır"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Sipariş Özeti */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Sipariş Özeti</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Ara Toplam</span>
                <span>{calculateSubtotal().toFixed(2)} TL</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Teslimat Ücreti</span>
                <span>{calculateDeliveryFee() === 0 ? 'Ücretsiz' : `${calculateDeliveryFee().toFixed(2)} TL`}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>İndirim</span>
                  <span>-{discount.toFixed(2)} TL</span>
                </div>
              )}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Toplam</span>
                  <span>{(calculateTotal() - discount).toFixed(2)} TL</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">KDV Dahil</p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="İndirim Kodu"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-r hover:bg-gray-300 focus:outline-none"
                >
                  Uygula
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Deneme için: INDIRIM20</p>
            </div>
            
            <button 
              onClick={handleCheckout} 
              className="bg-blue-600 text-white w-full py-3 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Siparişi Tamamla
            </button>
            
            <div className="mt-4">
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Alışverişe Devam Et
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 