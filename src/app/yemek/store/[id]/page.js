'use client';

import { use, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';
import ProductDetailModal from '@/components/ProductDetailModal';
import StoreCampaignBanner from '@/components/StoreCampaignBanner';

// React Icons'ları dinamik olarak import et
const FiArrowLeft = dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiArrowLeft })), { ssr: false });
const FiMoreHorizontal = dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiMoreHorizontal })), { ssr: false });
const FiStar = dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiStar })), { ssr: false });
const FiClock = dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiClock })), { ssr: false });
const FiPlus = dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiPlus })), { ssr: false });
const FiMinus = dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiMinus })), { ssr: false });

export default function StoreDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [showMenu, setShowMenu] = useState(false);
  
  // Popup states
  const [showAboutPopup, setShowAboutPopup] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showReviewsPopup, setShowReviewsPopup] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showComplaintPopup, setShowComplaintPopup] = useState(false);
  
  // Product detail modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Reviews data
  const [storeReviews, setStoreReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
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
    item.store_id === id && item.store_type === 'yemek'
  );
  
  // Restoran ve ürün verilerini yükle
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const storeData = await api.getStoreById(id);
        
        if (storeData) {
          setStore(storeData);
          
          const productsData = await api.getProducts({ store_id: id });
          setProducts(productsData || []);
          
          // URL'de hash varsa (örn: #review-123) reviews popup'ını aç
          if (window.location.hash.startsWith('#review-')) {
            setShowReviewsPopup(true);
            loadStoreReviews();
          }
        }
      } catch (error) {
        console.error('Restoran ve ürün verilerini yüklerken hata:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id]);
  
  // Ürün detaylarını göster
  const showProductDetails = async (product) => {
    // Önce ürünün seçenekleri var mı kontrol et
    const options = await api.getProductOptions(product.id);
    
    if (options && options.length > 0) {
      // Seçenekleri varsa modal aç
      setSelectedProduct({
        ...product,
        store_id: id,
        store_name: store?.name || ''
      });
      setShowProductModal(true);
    } else {
      // Seçenekleri yoksa direkt sepete ekle
      await addToCart(product);
    }
  };

  // Sepete ürünü ekle (seçeneksiz)
  const addToCart = async (product) => {
    try {
      if (!product.id || !product.name || !product.price) {
        toast.error('Ürün bilgileri eksik');
        return;
      }

      const productWithStore = {
        id: product.id,
        product_id: product.id,
        store_id: id,
        name: product.name,
        price: parseFloat(product.price),
        category: product.category || '',
        store_name: store?.name || '',
        image: product.image || ''
      };
      
      await contextAddToCart(productWithStore, 1, 'yemek');
      toast.success('Ürün sepete eklendi');
    } catch (error) {
      console.error("Sepete ekleme hatası:", error);
      toast.error(error.message || "Ürün sepete eklenirken bir hata oluştu");
    }
  };

  // Modal'dan sepete ekleme (seçenekli)
  const addToCartWithOptions = async (productWithOptions, quantity) => {
    try {
      const productWithStore = {
        ...productWithOptions,
        store_id: id,
        store_name: store?.name || ''
      };
      
      await contextAddToCart(productWithStore, quantity, 'yemek');
      toast.success('Ürün sepete eklendi');
    } catch (error) {
      console.error("Sepete ekleme hatası:", error);
      toast.error(error.message || "Ürün sepete eklenirken bir hata oluştu");
    }
  };
  
  // Ürün miktarını artır
  const increaseQuantity = async (product) => {
    try {
    const productWithStore = {
        id: product.id,
        product_id: product.id,
        store_id: id,
        name: product.name,
        price: parseFloat(product.price),
        category: product.category || '',
        store_name: store?.name || '',
        image: product.image || ''
    };
      
      await contextAddToCart(productWithStore, 1, 'yemek');
    } catch (error) {
      console.error("Miktar artırma hatası:", error);
      toast.error(error.message || "Ürün miktarı artırılamadı");
    }
  };
  
  // Ürün miktarını azalt
  const decreaseQuantity = (productId) => {
    removeFromCart(productId, id);
  };
  
  // Popup fonksiyonları
  const handleMenuClick = (action) => {
    setShowMenu(false);
    
    switch (action) {
      case 'about':
        setShowAboutPopup(true);
        break;
      case 'contact':
        setShowContactPopup(true);
        break;
      case 'reviews':
        setShowReviewsPopup(true);
        loadStoreReviews();
        break;
      case 'location':
        setShowLocationPopup(true);
        break;
      case 'complaint':
        setShowComplaintPopup(true);
        break;
    }
  };
  
  // Store reviews yükle
  const loadStoreReviews = async () => {
    try {
      setReviewsLoading(true);
      const reviews = await api.getReviews({ store_id: id, review_type: 'store' });
      
      // Her yorum için cevapları da yükle
      const reviewsWithResponses = await Promise.all(
        reviews.map(async (review) => {
          const responses = await api.getReviewResponses(review.id);
          return { ...review, responses };
        })
      );
      
      setStoreReviews(reviewsWithResponses);
      
      // Eğer URL'de belirli bir review hash'i varsa, o review'a scroll yap
      if (window.location.hash.startsWith('#review-')) {
        setTimeout(() => {
          const element = document.querySelector(window.location.hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    } catch (error) {
      console.error('Reviews yüklenemedi:', error);
    } finally {
      setReviewsLoading(false);
    }
  };
  
  // Popup kapatma
  const closeAllPopups = () => {
    setShowAboutPopup(false);
    setShowContactPopup(false);
    setShowReviewsPopup(false);
    setShowLocationPopup(false);
    setShowComplaintPopup(false);
  };
  
  // Kategoriye göre ürünleri filtrele - ürün içeriklerine ve açıklamalarına göre kategoriler
  const getCategoriesFromProducts = () => {
    const categorySet = new Set();
    products.forEach(product => {
      // Kategori alanından
      if (product.category) {
        categorySet.add(product.category);
      }
      // Ürün adından kategoriler çıkar
      const name = product.name?.toLowerCase() || '';
      const description = product.description?.toLowerCase() || '';
      
      if (name.includes('pizza') || description.includes('pizza')) categorySet.add('Pizza');
      if (name.includes('burger') || description.includes('burger')) categorySet.add('Burger');
      if (name.includes('kebap') || description.includes('kebap')) categorySet.add('Kebap');
      if (name.includes('döner') || description.includes('döner')) categorySet.add('Döner');
      if (name.includes('tavuk') || description.includes('tavuk')) categorySet.add('Tavuk');
      if (name.includes('balık') || description.includes('balık')) categorySet.add('Balık');
      if (name.includes('çorba') || description.includes('çorba')) categorySet.add('Çorbalar');
      if (name.includes('salata') || description.includes('salata')) categorySet.add('Salatalar');
      if (name.includes('makarna') || description.includes('makarna')) categorySet.add('Makarna');
      if (name.includes('pilav') || description.includes('pilav')) categorySet.add('Pilavlar');
      if (name.includes('tatlı') || description.includes('tatlı') || name.includes('dessert')) categorySet.add('Tatlılar');
      if (name.includes('içecek') || description.includes('içecek') || name.includes('drink')) categorySet.add('İçecekler');
      if (name.includes('kahve') || description.includes('kahve') || name.includes('coffee')) categorySet.add('Kahve');
      if (name.includes('çay') || description.includes('çay') || name.includes('tea')) categorySet.add('Çay');
    });
    return Array.from(categorySet).sort();
  };
  
  const categories = ['Tümü', ...getCategoriesFromProducts()];
  
  const filteredProducts = selectedCategory === 'Tümü' 
    ? products 
    : products.filter(product => {
        // Direkt kategori eşleşmesi
        if (product.category === selectedCategory) return true;
        
        // İçerik tabanlı filtreleme
        const name = product.name?.toLowerCase() || '';
        const description = product.description?.toLowerCase() || '';
        const searchTerm = selectedCategory.toLowerCase();
        
        return name.includes(searchTerm) || description.includes(searchTerm);
      });
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center p-6 max-w-sm mx-auto">
          <div className="text-red-500 text-5xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Restoran Bulunamadı</h2>
          <p className="text-gray-600 mb-6">Aradığınız restoran bulunamadı veya artık aktif değil.</p>
          <Link
            href="/yemek"
            className="inline-flex items-center justify-center bg-orange-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-orange-600"
          >
            Restoranlara Geri Dön
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image Section */}
      <div className="relative">
        {/* Large Image Area */}
        <div className="h-40 sm:h-40 md:h-60 lg:h-60 bg-gray-300 relative overflow-hidden">
          {store.banner_url || store.logo_url ? (
              <div 
                className="absolute inset-0 bg-center bg-no-repeat bg-[length:100%_100%]"
                style={{
                  backgroundImage: `url(${store.banner_url || store.logo_url})`,
                }}
              ></div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                <div className="text-center">
                <div className="text-4xl mb-2">🍽️</div>
                <div className="text-gray-700 font-semibold text-lg">{store.name}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Buttons */}
        <button 
          onClick={() => router.back()} 
          className="absolute top-6 left-6 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
        >
          <FiArrowLeft size={20} className="text-gray-800" />
        </button>
        
        <div className="absolute top-6 right-6">
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <FiMoreHorizontal size={20} className="text-gray-800" />
            </button>
            
            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute top-12 right-0 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <button 
                  onClick={() => handleMenuClick('about')}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <span>🍽️</span>
                  <span>Mağaza Hakkında</span>
                </button>
             
                <button 
                  onClick={() => handleMenuClick('reviews')}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <span>⭐</span>
                  <span>Değerlendirmeler</span>
                </button>
                <button 
                  onClick={() => handleMenuClick('location')}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <span>📍</span>
                  <span>Konum</span>
                </button>
                <button 
                  onClick={() => handleMenuClick('complaint')}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <span>🚨</span>
                  <span>Şikayet Et</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Carousel Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <div className="w-2 h-2 bg-white/60 rounded-full"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full"></div>
          <div className="w-6 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            </div>
          </div>
      
      {/* Store Info */}
      <div className="bg-white px-2 md:px-4 py-2 md:py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{store.name}</h1>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-1">
            <FiStar className="text-orange-400 fill-current" size={16} />
            <span className="font-medium text-gray-900">{store.rating || '4.7'}</span>
                </div>
          
          <div className="flex items-center space-x-1 bg-orange-100 px-2 py-1 rounded-full">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-orange-600 text-sm font-medium">
              {parseFloat(store.delivery_fee || 0) === 0 ? 'Ücretsiz' : `${parseFloat(store.delivery_fee || 12).toFixed(0)} TL`}
            </span>
                </div>
          
          <div className="flex items-center space-x-1 text-gray-600">
            <FiClock size={14} />
            <span className="text-sm">
              {store.delivery_time_min && store.delivery_time_max 
                ? `${store.delivery_time_min}-${store.delivery_time_max} dk`
                : '30-60 dk'
              }
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm leading-relaxed">
          {store.description || 'Maecenas sed diam eget risus varius blandit sit amet non magna. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.'}
        </p>
      </div>
      
      {/* Store Campaign Banner */}
      <StoreCampaignBanner storeId={id} categoryName="yemek" />
      
      {/* Category Filter */}
      <div className="bg-white px-6 py-4 border-t border-gray-100">
        <div className="flex space-x-3 overflow-x-auto">
                {categories.map((category) => (
                    <button
                key={category}
                onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category 
                    ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                ))}
            </div>
          </div>
          
      {/* Products Section */}
      <div className="bg-white px-6 py-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {selectedCategory === 'Tümü' ? 'Tüm Ürünler' : selectedCategory} ({filteredProducts.length})
        </h2>
        
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => {
              const cartItem = storeCartItems.find(item => item.product_id === product.id);
              
              return (
                <div key={product.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  {/* Product Image - Clickable */}
                  <div 
                    className="h-32 bg-gray-200 relative cursor-pointer"
                    onClick={() => showProductDetails(product)}
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-2xl">🍽️</span>
                      </div>
                    )}
                  </div>
                  
                      {/* Product Info - Clickable */}
                  <div className="p-4">
                    <div 
                      className="cursor-pointer"
                      onClick={() => showProductDetails(product)}
                    >
                      <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight">{product.name}</h3>
                      <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                        {product.description || 'Lezzetli ve taze'}
                      </p>
                    </div>
                        
                        <div className="flex items-center justify-between">
                      <span className="text-gray-900 font-bold">{product.price.toFixed(0)} ₺</span>
                          
                          {cartItem ? (
                        <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => decreaseQuantity(product.id)}
                                  disabled={store.status !== 'active'}
                            className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                                >
                            <FiMinus size={12} />
                                </button>
                                
                          <span className="font-medium text-sm min-w-[16px] text-center">{cartItem.quantity}</span>
                                
                                <button 
                                  onClick={() => increaseQuantity(product)}
                                  disabled={store.status !== 'active'}
                            className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 disabled:opacity-50"
                                >
                            <FiPlus size={12} />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => showProductDetails(product)}
                                disabled={store.status !== 'active'}
                          className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                          <FiPlus size={16} />
                              </button>
                            )}
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">🍽️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün Bulunamadı</h3>
            <p className="text-gray-500">Bu kategoride ürün bulunmamaktadır.</p>
          </div>
        )}
          </div>
          
      {/* Popup'lar */}
      {/* Mağaza Hakkında Popup */}
      {showAboutPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">🍽️ Mağaza Hakkında</h3>
                <button 
                  onClick={closeAllPopups}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{store.name}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {store.description || 'Bu mağaza hakkında henüz detaylı bilgi eklenmemiş.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Puan</p>
                    <p className="font-medium">⭐ {store.rating || '4.7'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Değerlendirme</p>
                    <p className="font-medium">{store.review_count || 0} yorum</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Min. Sipariş</p>
                    <p className="font-medium">{store.min_order_amount || 0} ₺</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Teslimat</p>
                    <p className="font-medium">
                      {store.delivery_time_min && store.delivery_time_max 
                        ? `${store.delivery_time_min}-${store.delivery_time_max} dk`
                        : '30-60 dk'
                      }
                    </p>
                  </div>
                </div>
                
                {store.tags && store.tags.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Kategoriler</p>
                    <div className="flex flex-wrap gap-2">
                      {store.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* İletişim Popup */}
      {showContactPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">📞 İletişim</h3>
                <button 
                  onClick={closeAllPopups}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {store.email && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      📧
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">E-posta</p>
                      <p className="font-medium">{store.email}</p>
                    </div>
                  </div>
                )}
                
                {store.address && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      📍
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Adres</p>
                      <p className="font-medium">{store.address}</p>
                    </div>
                  </div>
                )}
                
                {(!store.email && !store.address) && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">İletişim bilgileri henüz eklenmemiş.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Değerlendirmeler Popup */}
      {showReviewsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">⭐ Değerlendirmeler</h3>
                <button 
                  onClick={closeAllPopups}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              
              {!reviewsLoading && storeReviews.length > 0 && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{store.rating || '4.7'}</div>
                      <div className="text-xs text-gray-500">Ortalama</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{storeReviews.length}</div>
                      <div className="text-xs text-gray-500">Değerlendirme</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : storeReviews.length > 0 ? (
                <>
                <div className="space-y-4">
                    {storeReviews.slice(0, 5).map((review) => (
                    <div 
                      key={review.id} 
                      id={`review-${review.id}`}
                      className={`border rounded-lg p-4 transition-colors ${
                        window.location.hash === `#review-${review.id}`
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{review.user?.name || 'Anonim Kullanıcı'}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{review.comment}</p>
                      
                      {/* Store Response */}
                      {review.review_responses && review.review_responses.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3 mt-3">
                          <div className="flex items-center mb-2">
                            <span className="text-xs font-medium text-gray-600">🏪 {store.name} yanıtladı:</span>
                          </div>
                          <p className="text-sm text-gray-700">{review.review_responses[0].response_text}</p>
                          <span className="text-xs text-gray-500 mt-1 block">
                            {new Date(review.review_responses[0].created_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <Link 
                      href={`/store/${id}/yorumlar?cid=1`}
                      className="block w-full bg-orange-500 text-white text-center py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                      onClick={closeAllPopups}
                    >
                      Tüm Yorumları Görüntüle ({storeReviews.length})
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">⭐</div>
                  <p className="text-gray-500 mb-4">Henüz değerlendirme yok.</p>
                  <Link 
                    href={`/store/${id}/yorumlar?cid=1`}
                    className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    onClick={closeAllPopups}
                  >
                    İlk Yorumu Siz Yazın
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Konum Popup */}
      {showLocationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">📍 Konum</h3>
                <button 
                  onClick={closeAllPopups}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {store.address ? (
                  <>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm">
                          📍
              </div>
              <div>
                          <p className="font-medium text-gray-900">{store.name}</p>
                          <p className="text-gray-600 text-sm mt-1">{store.address}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg text-sm font-medium">
                        Yol Tarifi Al
                      </button>
                      <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium">
                        Haritada Göster
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📍</div>
                    <p className="text-gray-500">Konum bilgisi henüz eklenmemiş.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Şikayet Et Popup */}
      {showComplaintPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">🚨 Şikayet Et</h3>
                <button 
                  onClick={closeAllPopups}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Şikayet Konusu</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>Teslimat Sorunu</option>
                    <option>Ürün Kalitesi</option>
                    <option>Müşteri Hizmetleri</option>
                    <option>Yanlış Ürün</option>
                    <option>Diğer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Şikayet Detayı</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24 resize-none"
                    placeholder="Şikayetinizi detaylı olarak açıklayın..."
                  ></textarea>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={closeAllPopups}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium"
                  >
                    İptal
                  </button>
                  <button className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-medium">
                    Şikayet Gönder
          </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        storeType="yemek"
        onAddToCart={addToCartWithOptions}
      />
    </div>
  );
} 