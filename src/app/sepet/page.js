'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlus, FiMinus, FiTrash2, FiArrowLeft, FiShoppingBag, FiClock, FiInfo, FiUser } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // CartContext'ten sepet fonksiyonlarını al
  const { 
    cartItems, 
    addToCart, 
    removeFromCart,
    removeItemCompletely,
    clearCart,
    calculateSubtotal
  } = useCart();
  
  // Sepet durumu
  const [loading, setLoading] = useState(false);
  
  // Promosyon kodu
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  
  // Sepet öğelerini mağazaya göre gruplama
  const groupedCartItems = cartItems.reduce((groups, item) => {
    const key = `${item.store_type}-${item.store_id}`;
    if (!groups[key]) {
      groups[key] = {
        store_type: item.store_type,
        store_id: item.store_id,
        store_name: item.store_name,
        items: []
      };
    }
    groups[key].items.push(item);
    return groups;
  }, {});
  
  // Her mağaza grubu için teslimat ücreti hesaplama
  const getDeliveryFee = (storeType) => {
    switch (storeType) {
      case 'yemek': return 9.90;
      case 'su': return 5.90;
      case 'market': return 7.90;
      default: return 0;
    }
  };
  
  // Ürün miktarı artırma - Cart Context kullanarak
  const increaseQuantity = (productId, storeId) => {
    const item = cartItems.find(item => item.product_id === productId && item.store_id === storeId);
    if (item) {
      addToCart(item);
    }
  };
  
  // Ürün miktarı azaltma - Cart Context kullanarak
  const decreaseQuantity = (productId, storeId) => {
    removeFromCart(productId, storeId);
  };
  
  // Ürünü sepetten tamamen kaldırma
  const removeItem = (productId, storeId) => {
    if (confirm('Bu ürünü sepetten kaldırmak istediğinize emin misiniz?')) {
      removeItemCompletely(productId, storeId);
    }
  };
  
  // Promosyon kodu uygulama
  const applyPromoCode = () => {
    if (promoCode.trim() === '') {
      setPromoError('Lütfen bir promosyon kodu girin');
      return;
    }
    
    // Gerçek uygulamada API'ye promosyon kodu gönderilir
    // Burada örnek olarak basit bir kontrol yapıyoruz
    if (promoCode.toUpperCase() === 'INDIRIM20') {
      setDiscount(subtotal * 0.2); // %20 indirim
      setPromoError('');
    } else {
      setDiscount(0);
      setPromoError('Geçersiz promosyon kodu');
    }
  };
  
  // Login kontrolü ve checkout yönlendirmesi
  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Login olmamışsa login sayfasına yönlendir ve checkout'u param olarak geçir
      router.push('/login?redirect=/sepet&action=checkout');
    } else {
      // Login olmuşsa direkt checkout sayfasına git
      router.push('/checkout');
    }
  };
  
  // Sepet toplamını hesaplama - mağaza gruplarına göre
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalDeliveryFee = Object.values(groupedCartItems).reduce((total, group) => {
    return total + getDeliveryFee(group.store_type);
  }, 0);
  const total = subtotal + totalDeliveryFee - discount;
  
  // Minimum sipariş kontrolü - her mağaza için ayrı ayrı kontrol edilebilir
  const minOrderMet = subtotal > 0; // Şimdilik basit kontrol

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Başlık */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              className="mr-3 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              aria-label="Geri"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Sepetim</h1>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 pb-32">
        {loading ? (
          // Yükleniyor durumu
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : cartItems.length === 0 ? (
          // Boş sepet durumu
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShoppingBag className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Sepetiniz boş</h3>
            <p className="text-gray-500 mb-6">Lezzetli yemekler sizi bekliyor!</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-700"
            >
              Restoranlara Göz At
            </Link>
          </div>
        ) : (
          // Dolu sepet
          <div className="space-y-4">
            {/* Login Durumu Bilgisi */}
            {!isAuthenticated && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                <FiUser className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Sepetinizi görüntülüyorsunuz</p>
                  <p>Siparişi tamamlamak için giriş yapmanız gerekecek.</p>
                </div>
              </div>
            )}
            
            {/* Mağaza Gruplarına Göre Sepet Öğeleri */}
            {Object.values(groupedCartItems).map((group) => (
              <div key={`${group.store_type}-${group.store_id}`} className="space-y-2">
                {/* Mağaza Bilgisi */}
                <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {group.store_type}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">{group.store_name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="capitalize">{group.store_type}</span>
                      <span className="mx-1">•</span>
                      <span>Teslimat: {getDeliveryFee(group.store_type).toFixed(2)} TL</span>
                    </div>
                  </div>
                </div>

                {/* Bu mağazanın ürünleri */}
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                  {group.items.map((item) => (
                    <div key={`${item.product_id}-${item.store_id}`} className="p-4">
                      <div className="flex items-start">
                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                              <span className="text-xs">Resim</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <span className="font-medium text-gray-900">{(item.price * item.quantity).toFixed(2)} TL</span>
                          </div>
                          
                          {item.category && (
                            <p className="text-sm text-gray-500 mt-1">
                              {item.category}
                            </p>
                          )}
                          
                          {item.notes && (
                            <p className="text-xs text-gray-500 italic mt-1">
                              Not: {item.notes}
                            </p>
                          )}
                          
                          <div className="flex justify-between items-center mt-3">
                            <div className="flex items-center">
                              <button
                                onClick={() => decreaseQuantity(item.product_id, item.store_id)}
                                className="p-1 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full"
                                disabled={item.quantity <= 1}
                              >
                                <FiMinus size={16} />
                              </button>
                              <span className="mx-3 text-gray-800 min-w-[20px] text-center">{item.quantity}</span>
                              <button
                                onClick={() => increaseQuantity(item.product_id, item.store_id)}
                                className="p-1 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full"
                              >
                                <FiPlus size={16} />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => removeItem(item.product_id, item.store_id)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Promosyon Kodu */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-medium text-gray-800 mb-3">Promosyon Kodu</h3>
              <div className="flex">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promosyon kodunuzu girin"
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  onClick={applyPromoCode}
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 rounded-r-lg hover:from-orange-600 hover:to-red-700"
                >
                  Uygula
                </button>
              </div>
              {promoError && (
                <p className="text-red-500 text-sm mt-2">{promoError}</p>
              )}
              {discount > 0 && (
                <p className="text-green-600 text-sm mt-2">
                  %20 indirim uygulandı!
                </p>
              )}
            </div>
            
            {/* Hesap Özeti */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-medium text-gray-800 mb-4">Sipariş Özeti</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam</span>
                  <span>{subtotal.toFixed(2)} TL</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Teslimat Ücreti</span>
                  <span>{totalDeliveryFee.toFixed(2)} TL</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>İndirim</span>
                    <span>-{discount.toFixed(2)} TL</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2 mt-2"></div>
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Toplam</span>
                  <span>{total.toFixed(2)} TL</span>
                </div>
              </div>
              
              {/* Mağaza sayısı bilgisi */}
              {Object.keys(groupedCartItems).length > 1 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start mb-4">
                  <FiInfo className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <span className="font-medium">{Object.keys(groupedCartItems).length} farklı mağazadan</span> sipariş veriyorsunuz. Her mağaza için ayrı teslimat ücreti hesaplanmıştır.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Alt Butonlar (Sabit) */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">Toplam</span>
            <span className="text-lg font-bold text-gray-900">{total.toFixed(2)} TL</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={!minOrderMet}
            className={`w-full py-3 px-4 rounded-lg shadow-sm flex justify-center items-center font-semibold ${
              minOrderMet
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {!isAuthenticated ? 'Giriş Yaparak Siparişi Tamamla' : 'Siparişi Tamamla'}
          </button>
        </div>
      )}
    </div>
  );
} 