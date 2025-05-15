'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlus, FiMinus, FiTrash2, FiArrowLeft, FiShoppingBag, FiClock, FiInfo } from 'react-icons/fi';

// Demo sepet ürünleri (gerçek uygulamada API'dan gelecektir)
const demoCartItems = [
  {
    id: 'item1',
    productId: 'product1',
    storeId: 'store1',
    name: 'Kral Burger Menü',
    image: '/images/products/product-placeholder.jpg',
    price: 125.90,
    quantity: 2,
    options: ['Orta Boy', 'Cola'],
    notes: 'Soğansız olsun lütfen'
  },
  {
    id: 'item2',
    productId: 'product2',
    storeId: 'store1',
    name: 'Patates Kızartması (Büyük)',
    image: '/images/products/product-placeholder.jpg',
    price: 45.00,
    quantity: 1,
    options: ['Ketçap İlave'],
    notes: ''
  },
  {
    id: 'item3',
    productId: 'product3',
    storeId: 'store1',
    name: 'Çikolatalı Milkshake',
    image: '/images/products/product-placeholder.jpg',
    price: 35.50,
    quantity: 1,
    options: [],
    notes: ''
  }
];

// Demo restoran bilgisi
const demoStore = {
  id: 'store1',
  name: 'Lezzet Durağı Restoran',
  image: '/images/stores/store-placeholder.jpg',
  minOrder: 100,
  deliveryFee: 15,
  deliveryTime: '25-40 dk',
  distance: 1.8
};

export default function CartPage() {
  const router = useRouter();
  
  // Sepet durumu
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  
  // Promosyon kodu
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  
  // Sepet öğelerini yükle
  useEffect(() => {
    // Gerçek uygulamada API'den sepet verisi çekilir
    setLoading(true);
    
    // API çağrısı simulasyonu
    setTimeout(() => {
      setCartItems(demoCartItems);
      setStore(demoStore);
      setLoading(false);
    }, 500);
  }, []);
  
  // Ürün miktarı artırma
  const increaseQuantity = (itemId) => {
    setCartItems(cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };
  
  // Ürün miktarı azaltma
  const decreaseQuantity = (itemId) => {
    setCartItems(cartItems.map(item => 
      item.id === itemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };
  
  // Ürünü sepetten kaldırma
  const removeItem = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
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
  
  // Sepet toplamını hesaplama
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = store ? store.deliveryFee : 0;
  const total = subtotal + deliveryFee - discount;
  
  // Minimum sipariş kontrolü
  const minOrderMet = store ? subtotal >= store.minOrder : true;
  
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
            {/* Restoran Bilgisi */}
            {store && (
              <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                    <span className="text-xs">Resim</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">{store.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <FiClock className="mr-1" size={14} />
                    <span>{store.deliveryTime} • {store.distance} km</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Sepet Öğeleri */}
            <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
              {cartItems.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                        <span className="text-xs">Resim</span>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <span className="font-medium text-gray-900">{(item.price * item.quantity).toFixed(2)} TL</span>
                      </div>
                      
                      {item.options.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          {item.options.join(', ')}
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
                            onClick={() => decreaseQuantity(item.id)}
                            className="p-1 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full"
                            disabled={item.quantity <= 1}
                          >
                            <FiMinus size={16} />
                          </button>
                          <span className="mx-3 text-gray-800 min-w-[20px] text-center">{item.quantity}</span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="p-1 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full"
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
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
                  <span>{deliveryFee.toFixed(2)} TL</span>
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
              
              {!minOrderMet && store && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start mb-4">
                  <FiInfo className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-700">
                    Minimum sipariş tutarı {store.minOrder.toFixed(2)} TL. Siparişinizi tamamlamak için {(store.minOrder - subtotal).toFixed(2)} TL daha ürün eklemelisiniz.
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
            onClick={() => router.push('/checkout')}
            disabled={!minOrderMet}
            className={`w-full py-3 px-4 rounded-lg shadow-sm flex justify-center items-center font-semibold ${
              minOrderMet
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {minOrderMet ? 'Siparişi Tamamla' : `Minimum Tutar: ${store?.minOrder.toFixed(2)} TL`}
          </button>
        </div>
      )}
    </div>
  );
} 