'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { mockRestaurants } from '@/app/data/mockdatas';
import { useCart } from '@/contexts/CartContext';

export default function RestaurantDetail() {
  const { id } = useParams();
  const { addToCart, removeFromCart, cartItems } = useCart();
  
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [cart, setCart] = useState([]);
  
  useEffect(() => {
    // Mock API çağrısı - gerçek bir API'den veri çekersiniz
    setLoading(true);
    
    // ID'ye göre restoran verilerini al
    const restaurantData = mockRestaurants.find(r => r.id === parseInt(id));
    
    setTimeout(() => {
      setRestaurant(restaurantData);
      if (restaurantData?.categories?.length > 0) {
        setActiveCategory('Tümü');
      }
      setLoading(false);
    }, 1000);
  }, [id]);

  useEffect(() => {
    // CartContext'ten bu restorana ait ürünleri filtrele
    const restaurantItems = cartItems.filter(item => 
      item.storeName === restaurant?.name
    );
    setCart(restaurantItems);
  }, [cartItems, restaurant]);

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      storeName: restaurant.name,
      image: item.image || 'https://placehold.co/100'
    });
  };

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
  };

  const getFilteredItems = () => {
    if (!restaurant || !restaurant.menu) return [];
    
    if (activeCategory === 'Tümü') {
      return restaurant.menu;
    } else {
      return restaurant.menu.filter(item => item.category === activeCategory);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Restaurant Bulunamadı</h1>
        <p className="text-gray-600 mb-8">Aradığınız restoran bulunamadı veya kaldırılmış olabilir.</p>
        <Link href="/yemek" className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
          Tüm Restoranlara Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Geri Dönüş Bağlantısı */}
      <Link 
        href="/yemek" 
        className="inline-flex items-center text-blue-600 hover:underline mb-6"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Tüm Restoranlar
      </Link>
      
      {/* Restoran Bilgileri */}
      <div className="bg-gray-100 rounded-lg overflow-hidden mb-8">
        <div className="relative h-60 bg-gray-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-500">Restoran resmi yüklenememiyor</span>
          </div>
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent h-1/2"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <span className={`px-2 py-1 text-xs rounded-full ${restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
              {restaurant.isOpen ? 'Açık' : 'Kapalı'}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{restaurant.name}</h1>
              <div className="flex items-center mt-2">
                <span className="text-yellow-500 flex items-center mr-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {restaurant.rating}
                </span>
                <span className="text-gray-600 mr-2">•</span>
                <span className="text-gray-600">{restaurant.cuisine}</span>
                <span className="text-gray-600 mx-2">•</span>
                <span className="text-gray-600">{restaurant.deliveryTime}</span>
              </div>
              <p className="text-gray-600 mt-2">{restaurant.address}</p>
              {restaurant.description && (
                <p className="text-gray-700 mt-4">{restaurant.description}</p>
              )}
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="font-semibold text-gray-700">Minimum Sipariş Tutarı</p>
              <p className="text-xl font-bold text-blue-600">{restaurant.minOrder} TL</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Menü */}
        <div className="w-full lg:w-2/3">
          {/* Kategori Seçimi */}
          <div className="border-b overflow-x-auto whitespace-nowrap mb-6 pb-2">
            <button 
              onClick={() => setActiveCategory('Tümü')} 
              className={`px-4 py-2 mr-2 rounded-full ${
                activeCategory === 'Tümü' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tümü
            </button>
            
            {restaurant.categories && restaurant.categories.map((category, index) => (
              <button 
                key={index}
                onClick={() => setActiveCategory(category)} 
                className={`px-4 py-2 mr-2 rounded-full ${
                  activeCategory === category 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Ürünler */}
          <div className="space-y-6">
            {getFilteredItems().map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-4 flex justify-between">
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  {item.description && (
                    <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                  )}
                  <p className="text-blue-600 font-medium mt-2">{item.price.toFixed(2)} TL</p>
                </div>
                
                <div className="flex items-center ml-4">
                  {/* Ürün resmi */}
                  <div className="w-20 h-20 bg-gray-200 rounded-md mr-4 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-gray-500">Görsel yok</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Sepete ekle butonu */}
                  {cart.find(cartItem => cartItem.id === item.id) ? (
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="mx-2 font-medium">
                        {cart.find(cartItem => cartItem.id === item.id).quantity}
                      </span>
                      <button 
                        onClick={() => handleAddToCart(item)}
                        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleAddToCart(item)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                    >
                      + Ekle
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 