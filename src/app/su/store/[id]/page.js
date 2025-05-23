'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiStar, FiClock, FiMapPin, FiInfo, FiShoppingBag, FiChevronDown, FiChevronUp, FiMinus, FiPlus } from 'react-icons/fi';
import api from '@/lib/api';
import { useCart } from '@/contexts/CartContext';

export default function SuStoreDetailPage({ params }) {
  const router = useRouter();
  // Next.js 15'te params Promise olduğu için React.use ile çözümlüyoruz
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showCart, setShowCart] = useState(false);
  
  // CartContext'ten sepet fonksiyonlarını al
  const { 
    cartItems, 
    addToCart: contextAddToCart, 
    removeFromCart,
    removeItemCompletely,
    clearCart: contextClearCart,
    calculateSubtotal
  } = useCart();
  
  // Sadece bu mağazaya ait ürünleri filtreleme
  const storeCartItems = cartItems.filter(item => 
    item.store_id === id && item.store_type === 'su'
  );
  
  // Su satıcısı ve ürün verilerini yükle
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Su satıcısı bilgilerini al
        const storeData = await api.getStoreById(id);
        
        if (storeData) {
          setStore(storeData);
          
          // Ürünleri al
          const productsData = await api.getProducts({ store_id: id });
          setProducts(productsData || []);
          
          // Ürün kategorilerini belirle
          const categories = [...new Set(productsData.map(p => p.category))].filter(Boolean);
          
          // İlk kategoriyi aktif olarak ayarla
          if (categories.length > 0) {
            setActiveCategory(categories[0]);
          }
          
          // Kategorileri genişletilmiş olarak başlat
          const initialExpandedState = {};
          categories.forEach(category => {
            initialExpandedState[category] = true;
          });
          setExpandedCategories(initialExpandedState);
        }
      } catch (error) {
        console.error('Su satıcısı ve ürün verilerini yüklerken hata:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id]);
  
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
  
  // Sepete ürünü ekle
  const addToCart = (product) => {
    try {
      // CartContext'i kullanarak sepete ekle
      contextAddToCart({
        product_id: product.id,
        name: product.name,
        price: parseFloat(product.price) || 0,
        quantity: 1,
        image: product.image || null,
        store_id: store?.id || null,
        store_name: store?.name || '',
        store_type: 'su',
        category: product.category || '',
        notes: ''
      });
      
      // Sepeti göster
      setShowCart(true);
    } catch (error) {
      console.error("Sepete ekleme hatası:", error);
      alert("Ürün sepete eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };
  
  // Ürün miktarını artır
  const increaseQuantity = (product) => {
    addToCart(product);
  };
  
  // Ürün miktarını azalt
  const decreaseQuantity = (productId) => {
    removeFromCart(productId, id);
  };
  
  // Sepeti temizle
  const clearCart = () => {
    if (confirm('Sepeti temizlemek istediğinize emin misiniz?')) {
      // Sadece bu su satıcısına ait ürünleri temizle
      storeCartItems.forEach(item => {
        removeItemCompletely(item.product_id, item.store_id);
      });
    }
  };
  
  // Sepet toplamını hesapla
  const cartTotal = storeCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Kategoriye göre ürünleri filtrele
  const getProductsByCategory = (category) => {
    return products.filter(product => product.category === category);
  };
  
  // Tüm benzersiz ürün kategorilerini elde et
  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }
  
  if (!store) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-6 max-w-sm mx-auto">
          <div className="text-red-500 text-5xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Su Satıcısı Bulunamadı</h2>
          <p className="text-gray-600 mb-6">Aradığınız su satıcısı bulunamadı veya artık aktif değil.</p>
          <Link
            href="/su"
            className="inline-flex items-center justify-center bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:from-sky-600 hover:to-blue-700"
          >
            Su Satıcılarına Geri Dön
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
      
      {/* Su Satıcısı Bilgileri */}
      <div className="bg-white shadow-sm">
        <div className="h-40 bg-gradient-to-r from-sky-500 to-blue-600 relative">
          {store.cover_image_url ? (
            <Image
              src={store.cover_image_url}
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
              <p className="text-gray-600 mt-1">{store.description || 'Bu su satıcısı hakkında bilgi bulunmamaktadır.'}</p>
              
              <div className="flex items-center flex-wrap mt-2">
                <div className="flex items-center text-sm text-yellow-500 mr-4">
                  <FiStar className="fill-current mr-1" />
                  <span>{store.rating || '0.0'}</span>
                  <span className="text-gray-400 ml-1">({store.review_count || '0'} Değerlendirme)</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mr-4">
                  <FiClock className="mr-1" />
                  <span>{store.delivery_time_estimation || 'Belirtilmemiş'}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <FiMapPin className="mr-1" />
                  <span>{store.address ? `${store.address.substring(0, 20)}...` : 'Adres belirtilmemiş'}</span>
                </div>
              </div>
              
              {/* Su Markaları */}
              {store.tags && store.tags.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {store.tags.map((brand) => (
                      <span 
                        key={brand}
                        className="bg-sky-100 text-sky-700 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {brand}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="bg-sky-50 text-sky-600 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                <FiInfo className="mr-1" size={14} />
                Min. sipariş: {store.min_order_amount || 0} TL
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* İçerik */}
      <div className="container mx-auto px-4 pt-6">
        <div className="flex flex-col lg:flex-row">
          {/* Kategori Menüsü */}
          <div className="w-full lg:w-1/4 lg:pr-6 mb-6 lg:mb-0">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
              <h3 className="font-bold text-gray-800 mb-4">Su Ürünleri</h3>
              
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category}>
                    <button
                      className={`w-full text-left py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        activeCategory === category 
                          ? 'bg-sky-100 text-sky-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => handleCategoryClick(category)}
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Ürünler */}
          <div className="w-full lg:w-2/4">
            {categories.map((category) => {
              const categoryProducts = getProductsByCategory(category);
              
              return (
                <div 
                  key={category}
                  id={`category-${category.replace(/\s+/g, '-').toLowerCase()}`}
                  className="mb-8"
                >
                  <div 
                    className="flex items-center justify-between bg-white p-4 rounded-t-lg shadow-sm cursor-pointer"
                    onClick={() => toggleCategory(category)}
                  >
                    <h3 className="font-bold text-gray-800">{category}</h3>
                    {expandedCategories[category] ? (
                      <FiChevronUp className="text-gray-500" />
                    ) : (
                      <FiChevronDown className="text-gray-500" />
                    )}
                  </div>
                  
                  {expandedCategories[category] && (
                    <div className="bg-white rounded-b-lg shadow-sm divide-y">
                      {categoryProducts.map((product) => (
                        <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{product.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{product.description || 'Ürün açıklaması bulunmuyor.'}</p>
                              <p className="text-sky-600 font-medium mt-2">{product.price.toFixed(2)} TL</p>
                            </div>
                            
                            <div className="ml-4">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-20 h-20 object-cover rounded-md"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                                  <span className="text-gray-400 text-xs text-center">Resim yok</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            {storeCartItems.find(item => item.product_id === product.id) ? (
                              <div className="flex items-center">
                                <button 
                                  onClick={() => decreaseQuantity(product.id)}
                                  className="p-1 text-gray-500 hover:text-sky-600"
                                >
                                  <FiMinus size={14} />
                                </button>
                                
                                <span className="mx-2 text-sm font-medium">
                                  {storeCartItems.find(item => item.product_id === product.id).quantity}
                                </span>
                                
                                                                <button                                   onClick={() => {                              const foundProduct = products.find(p => p.id === item.product_id);                              if (foundProduct) increaseQuantity(foundProduct);                            }}                            className="p-1 text-gray-500 hover:text-sky-600"                          >                            <FiPlus size={14} />                          </button>                              </div>                            ) : (                              <button                                 onClick={() => addToCart(product)}                                className="text-sm bg-sky-100 hover:bg-sky-200 text-sky-700 py-1 px-3 rounded-full transition-colors"                              >                                Sepete Ekle                              </button>                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Sepet */}
          <div className="w-full lg:w-1/4 lg:pl-6">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Sepetim</h3>
                <button 
                  onClick={clearCart}
                  className={`text-xs text-gray-500 hover:text-red-500 ${storeCartItems.length === 0 ? 'invisible' : ''}`}
                >
                  Temizle
                </button>
              </div>
              
              {storeCartItems.length === 0 ? (
                <div className="text-center py-8">
                  <FiShoppingBag className="mx-auto text-gray-300" size={32} />
                  <p className="text-gray-500 mt-2">Sepetiniz boş</p>
                  <p className="text-gray-400 text-sm mt-1">Su ürünlerini sepete ekleyin</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 space-y-3">
                    {storeCartItems.map((item) => (
                      <div key={item.product_id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.price.toFixed(2)} TL</p>
                        </div>
                        
                        <div className="flex items-center">
                          <button 
                            onClick={() => decreaseQuantity(item.product_id)}
                            className="p-1 text-gray-500 hover:text-sky-600"
                          >
                            <FiMinus size={14} />
                          </button>
                          
                          <span className="mx-2 text-sm font-medium">{item.quantity}</span>
                          
                                                    <button                             onClick={() => {                              const foundProduct = products.find(p => p.id === item.product_id);                              if (foundProduct) increaseQuantity(foundProduct);                            }}                            className="p-1 text-gray-500 hover:text-sky-600"                          >                            <FiPlus size={14} />                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Ara Toplam</span>
                      <span className="font-medium">{cartTotal.toFixed(2)} TL</span>
                    </div>
                    
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-gray-600">Teslimat Ücreti</span>
                      <span className="font-medium">5.90 TL</span>
                    </div>
                    
                    <div className="flex justify-between font-bold">
                      <span>Toplam</span>
                      <span>{(cartTotal + 5.9).toFixed(2)} TL</span>
                    </div>
                  </div>
                  
                  <Link 
                    href="/sepet"
                    className="block w-full text-center bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:from-sky-600 hover:to-blue-700 mt-4"
                  >
                    Siparişi Tamamla
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 