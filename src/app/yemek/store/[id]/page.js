'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiStar, FiClock, FiMapPin, FiInfo, FiShoppingBag, FiChevronDown, FiChevronUp, FiMinus, FiPlus } from 'react-icons/fi';
import { mockStores, mockProducts } from '@/app/data/mockdatas';

export default function StoreDetailPage({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  
  // Restoran ve ürün verilerini yükle
  useEffect(() => {
    // API çağrısı simülasyonu
    setTimeout(() => {
      // Restoran bilgilerini al
      const storeData = mockStores.find(s => s.id === Number(id));
      if (storeData) {
        setStore(storeData);
        
        // İlk kategoriyi aktif olarak ayarla
        if (storeData.menuCategories && storeData.menuCategories.length > 0) {
          setActiveCategory(storeData.menuCategories[0]);
        }
        
        // Kategorileri genişletilmiş olarak başlat
        const initialExpandedState = {};
        storeData.menuCategories?.forEach(category => {
          initialExpandedState[category] = true;
        });
        setExpandedCategories(initialExpandedState);
        
        // Ürünleri al
        setProducts(storeData.menuItems || []);
      }
      
      setLoading(false);
    }, 500);
    
    // LocalStorage'dan sepet öğelerini al
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Sepet yüklenirken hata oluştu:', error);
      }
    }
  }, [id]);
  
  // Sepeti güncelleme ve localStorage'a kaydetme
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  // Kategori geçişi
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    // Sayfa pozisyonunu kategori bölümüne kaydır
    const categoryElement = document.getElementById(`category-${category.replace(/\s+/g, '-').toLowerCase()}`);
    if (categoryElement) {
      categoryElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Kategori genişletme/daraltma
  const toggleCategory = (category) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };
  
  // Ürünü sepete ekle
  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      // Eğer ürün zaten sepette varsa, miktarını artır
      setCartItems(
        cartItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        )
      );
    } else {
      // Yeni ürün ekle
      setCartItems([
        ...cartItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          total: product.price,
          storeId: store.id,
          storeName: store.name
        }
      ]);
    }
    
    // Sepeti göster
    setShowCart(true);
  };
  
  // Ürün miktarını artır
  const increaseQuantity = (productId) => {
    setCartItems(
      cartItems.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      )
    );
  };
  
  // Ürün miktarını azalt
  const decreaseQuantity = (productId) => {
    setCartItems(
      cartItems.map(item =>
        item.id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1, total: (item.quantity - 1) * item.price }
          : item
      ).filter(item => !(item.id === productId && item.quantity === 1))
    );
  };
  
  // Sepeti temizle
  const clearCart = () => {
    if (confirm('Sepeti temizlemek istediğinize emin misiniz?')) {
      setCartItems([]);
    }
  };
  
  // Sepet toplamını hesapla
  const cartTotal = cartItems.reduce((total, item) => total + item.total, 0);
  
  // Kategoriye göre ürünleri filtrele
  const getProductsByCategory = (category) => {
    return products.filter(product => product.category === category);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (!store) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-6 max-w-sm mx-auto">
          <div className="text-red-500 text-5xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Restoran Bulunamadı</h2>
          <p className="text-gray-600 mb-6">Aradığınız restoran bulunamadı veya artık aktif değil.</p>
          <Link
            href="/yemek"
            className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-700"
          >
            Restoranlara Geri Dön
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Başlık */}
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              className="mr-3 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              aria-label="Geri"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 truncate">{store.name}</h1>
          </div>
        </div>
      </div>
      
      {/* Restoran Bilgileri */}
      <div className="bg-white shadow-sm">
        <div className="h-40 bg-gradient-to-r from-orange-500 to-red-600 relative">
          {store.image ? (
            <Image
              src={store.image}
              alt={store.name}
              layout="fill"
              objectFit="cover"
              className="opacity-40"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-4xl font-bold opacity-20">{store.name}</span>
            </div>
          )}
        </div>
        
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{store.name}</h2>
              <p className="text-gray-600 mt-1">{store.description}</p>
              
              <div className="flex items-center flex-wrap mt-2">
                <div className="flex items-center text-sm text-yellow-500 mr-4">
                  <FiStar className="fill-current mr-1" />
                  <span>{store.rating}</span>
                  <span className="text-gray-400 ml-1">(120+ Değerlendirme)</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mr-4">
                  <FiClock className="mr-1" />
                  <span>{store.deliveryTime}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <FiMapPin className="mr-1" />
                  <span>2.5 km</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                <FiInfo className="mr-1" size={14} />
                Min. sipariş: {store.minOrder} TL
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Kategoriler (Yatay Kaydırılabilir) */}
      <div className="bg-white shadow-sm sticky top-16 z-20">
        <div className="container mx-auto">
          <div className="flex overflow-x-auto py-3 px-4 gap-2 hide-scrollbar">
            {store.menuCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-4 py-2 whitespace-nowrap rounded-full text-sm font-medium ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Ürünler */}
      <div className="container mx-auto px-4 py-6">
        {store.menuCategories.map((category) => (
          <div 
            key={category} 
            id={`category-${category.replace(/\s+/g, '-').toLowerCase()}`}
            className="mb-8"
          >
            <div 
              className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow-sm cursor-pointer"
              onClick={() => toggleCategory(category)}
            >
              <h3 className="text-lg font-medium text-gray-800">{category}</h3>
              {expandedCategories[category] ? (
                <FiChevronUp className="text-gray-500" />
              ) : (
                <FiChevronDown className="text-gray-500" />
              )}
            </div>
            
            {expandedCategories[category] && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getProductsByCategory(category).map((product) => (
                  <div 
                    key={product.id} 
                    className="bg-white rounded-lg shadow-sm overflow-hidden flex"
                  >
                    <div className="p-4 flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="font-medium text-gray-900">{product.price.toFixed(2)} TL</span>
                        <button
                          onClick={() => addToCart(product)}
                          className="p-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full hover:from-orange-600 hover:to-red-700"
                          aria-label="Sepete Ekle"
                        >
                          <FiPlus size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="w-24 h-24 bg-gray-100 relative">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          layout="fill"
                          objectFit="cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                          Resim Yok
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Sepet Özeti (Sabit Alt Çubuk) */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4 z-30">
          <div className="container mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">{cartItems.reduce((total, item) => total + item.quantity, 0)} Ürün</span>
                <div className="text-lg font-bold text-gray-900">{cartTotal.toFixed(2)} TL</div>
              </div>
              
              <Link
                href="/sepet"
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 flex items-center"
              >
                <FiShoppingBag className="mr-2" />
                Sepete Git
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Sepet Yan Panel (Mobil için genişleyebilir) */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowCart(false)}>
          <div 
            className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Sepet Başlık */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">Sepetim</h2>
                  <button 
                    onClick={() => setShowCart(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  >
                    <FiArrowLeft size={20} />
                  </button>
                </div>
              </div>
              
              {/* Sepet İçeriği */}
              <div className="flex-1 overflow-y-auto p-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiShoppingBag className="text-gray-400 text-xl" />
                    </div>
                    <p className="text-gray-500">Sepetiniz boş</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <span className="text-sm text-gray-500">{item.price.toFixed(2)} TL</span>
                        </div>
                        
                        <div className="flex items-center">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="p-1 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full"
                          >
                            <FiMinus size={16} />
                          </button>
                          <span className="mx-2 min-w-[20px] text-center">{item.quantity}</span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="p-1 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full"
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Sepet Alt Kısmı */}
              {cartItems.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Toplam</span>
                    <span className="font-bold text-gray-900">{cartTotal.toFixed(2)} TL</span>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={clearCart}
                      className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                    >
                      Sepeti Temizle
                    </button>
                    
                    <Link
                      href="/sepet"
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 text-center"
                    >
                      Sepete Git
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 