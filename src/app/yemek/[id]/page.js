'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { mockRestaurants } from '@/app/data/mockdatas';

export default function RestaurantDetailPage() {
  const params = useParams();
  const restaurantId = params?.id ? parseInt(params.id) : null;
  
  // Dummy veri - Gerçek uygulamada API'den gelecek
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);

  // Sahte veritabanından restoran bilgilerini al
  useEffect(() => {
    // Gerçek uygulamada bir API isteği yapılacak
    setTimeout(() => {
      const foundRestaurant = mockRestaurants.find(r => r.id === restaurantId);
      if (foundRestaurant) {
        setRestaurant(foundRestaurant);
        if (foundRestaurant.categories && foundRestaurant.categories.length > 0) {
          setSelectedCategory(foundRestaurant.categories[0]);
        }
      }
      setLoading(false);
    }, 500);
  }, [restaurantId]);

  // Sepete ürün ekle
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      // Ürün zaten sepette, miktarı artır
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      ));
    } else {
      // Yeni ürün, sepete ekle
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Sepetten ürün çıkar
  const removeFromCart = (itemId) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    
    if (existingItem.quantity === 1) {
      // Sepetteki son ürün, tamamen kaldır
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    } else {
      // Miktarı azalt
      setCart(cart.map(cartItem => 
        cartItem.id === itemId 
          ? { ...cartItem, quantity: cartItem.quantity - 1 } 
          : cartItem
      ));
    }
  };

  // Sepet toplamını hesapla
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Filtrelenmiş menü öğeleri
  const filteredMenuItems = restaurant?.menu.filter(item => 
    selectedCategory === 'Tümü' || item.category === selectedCategory
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Restoran bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Restoran Bulunamadı</h2>
          <p className="text-gray-600 mb-8">Üzgünüz, aradığınız restoran bulunamadı.</p>
          <Link href="/yemek" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            Tüm Restoranlar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Geri dönüş linki */}
      <div className="mb-6">
        <Link href="/yemek" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Tüm Restoranlar
        </Link>
      </div>
      
      {/* Restoran bilgisi başlık kısmı */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="h-64 bg-gray-200 relative">
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold ${restaurant.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {restaurant.isOpen ? 'Açık' : 'Kapalı'}
          </div>
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-gray-400">Restoran resmi yüklenemiyor</span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-3xl font-bold">{restaurant.name}</h1>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <span className="mr-2">{restaurant.cuisine}</span>
                <span className="mr-2">⭐ {restaurant.rating}</span>
                <span>{restaurant.deliveryTime} teslimat</span>
              </div>
              <p className="text-gray-600 mt-2">{restaurant.address}</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-sm font-medium">Minimum Sipariş Tutarı</p>
                <p className="text-xl font-bold text-blue-700">{restaurant.minOrder} TL</p>
              </div>
            </div>
          </div>
          
          <p className="mt-4 text-gray-700 border-t pt-4">{restaurant.description}</p>
        </div>
      </div>
      
      {/* Ana içerik bölümü: Menü ve Sepet */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Menü */}
        <div className="w-full lg:w-2/3">
          <h2 className="text-2xl font-bold mb-4">Menü</h2>
          
          {/* Kategori Filtreleri */}
          <div className="flex flex-wrap mb-6 gap-2">
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === 'Tümü' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedCategory('Tümü')}
            >
              Tümü
            </button>
            
            {restaurant.categories.map((category, index) => (
              <button 
                key={index}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Menü Öğeleri */}
          <div className="space-y-4">
            {filteredMenuItems.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 flex">
                <div className="flex-1">
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <p className="font-bold text-blue-700">{item.price.toFixed(2)} TL</p>
                </div>
                <div className="ml-4 flex items-center">
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                    onClick={() => addToCart(item)}
                  >
                    + Ekle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Sepet */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-2xl font-bold mb-4">Sepetim</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500">Sepetiniz boş</p>
                <p className="text-sm text-gray-400 mt-1">Menüden ürün ekleyebilirsiniz</p>
              </div>
            ) : (
              <>
                <div className="divide-y mb-4">
                  {cart.map(item => (
                    <div key={item.id} className="py-3 flex justify-between items-center">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">{item.name}</span>
                          <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">{item.quantity}x</span>
                        </div>
                        <p className="text-sm text-gray-600">{(item.price * item.quantity).toFixed(2)} TL</p>
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
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Ara Toplam:</span>
                    <span>{calculateTotal().toFixed(2)} TL</span>
                  </div>
                  <div className="flex justify-between mb-2 text-sm text-gray-600">
                    <span>Teslimat Ücreti:</span>
                    <span>15.00 TL</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-4">
                    <span>Toplam:</span>
                    <span>{(calculateTotal() + 15).toFixed(2)} TL</span>
                  </div>
                  
                  <button 
                    className={`w-full mt-4 py-3 rounded-md text-white font-medium transition-colors ${
                      calculateTotal() >= restaurant.minOrder 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    disabled={calculateTotal() < restaurant.minOrder}
                  >
                    {calculateTotal() >= restaurant.minOrder 
                      ? 'Siparişi Tamamla' 
                      : `Min. ${restaurant.minOrder} TL sipariş vermelisiniz`}
                  </button>
                  
                  {calculateTotal() < restaurant.minOrder && (
                    <p className="text-sm text-red-500 mt-2 text-center">
                      Minimum sipariş tutarına {(restaurant.minOrder - calculateTotal()).toFixed(2)} TL kaldı
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 