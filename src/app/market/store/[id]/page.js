'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiMoreHorizontal, FiStar, FiClock, FiPlus, FiMinus } from 'react-icons/fi';
import api from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';

export default function MarketStoreDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [showMenu, setShowMenu] = useState(false);
  
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
    item.store_id === id && item.store_type === 'market'
  );
  
  // Market ve ürün verilerini yükle
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const storeData = await api.getStoreById(id);
        
        if (storeData) {
          setStore(storeData);
          
          const productsData = await api.getProducts({ store_id: id });
          setProducts(productsData || []);
        }
      } catch (error) {
        console.error('Market ve ürün verilerini yüklerken hata:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id]);
  
  // Sepete ürünü ekle
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
      
      await contextAddToCart(productWithStore, 1, 'market');
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
      
      await contextAddToCart(productWithStore, 1, 'market');
    } catch (error) {
      console.error("Miktar artırma hatası:", error);
      toast.error(error.message || "Ürün miktarı artırılamadı");
    }
  };
  
  // Ürün miktarını azalt
  const decreaseQuantity = (productId) => {
    removeFromCart(productId, id);
  };
  
  // Kategoriye göre ürünleri filtrele - market ürünlerine göre kategoriler
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
      
      if (name.includes('meyve') || description.includes('meyve')) categorySet.add('Meyve');
      if (name.includes('sebze') || description.includes('sebze')) categorySet.add('Sebze');
      if (name.includes('et') || description.includes('et')) categorySet.add('Et & Tavuk');
      if (name.includes('süt') || description.includes('süt') || name.includes('peynir')) categorySet.add('Süt Ürünleri');
      if (name.includes('ekmek') || description.includes('ekmek') || name.includes('fırın')) categorySet.add('Fırın');
      if (name.includes('temizlik') || description.includes('temizlik')) categorySet.add('Temizlik');
      if (name.includes('kozmetik') || description.includes('kozmetik')) categorySet.add('Kozmetik');
      if (name.includes('bebek') || description.includes('bebek')) categorySet.add('Bebek');
      if (name.includes('dondurma') || description.includes('dondurma')) categorySet.add('Dondurmalar');
      if (name.includes('atıştırmalık') || description.includes('atıştırmalık') || name.includes('cips')) categorySet.add('Atıştırmalık');
      if (name.includes('kahvaltı') || description.includes('kahvaltı')) categorySet.add('Kahvaltılık');
      if (name.includes('içecek') || description.includes('içecek') || name.includes('su')) categorySet.add('İçecekler');
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center p-6 max-w-sm mx-auto">
          <div className="text-red-500 text-5xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Market Bulunamadı</h2>
          <p className="text-gray-600 mb-6">Aradığınız market bulunamadı veya artık aktif değil.</p>
          <Link
            href="/market"
            className="inline-flex items-center justify-center bg-green-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-green-600"
          >
            Marketlere Geri Dön
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
        <div className="h-80 bg-gray-300 relative overflow-hidden">
          {store.cover_image_url || store.logo ? (
            <img
              src={store.cover_image_url || store.logo}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🏪</div>
                <div className="text-gray-700 font-semibold text-xl">{store.name}</div>
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
                <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                  <span>🏪</span>
                  <span>Market Hakkında</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                  <span>📞</span>
                  <span>İletişim</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                  <span>⭐</span>
                  <span>Değerlendirmeler</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                  <span>📍</span>
                  <span>Konum</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
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
      <div className="bg-white px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{store.name}</h1>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-1">
            <FiStar className="text-green-400 fill-current" size={16} />
            <span className="font-medium text-gray-900">{store.rating || '4.5'}</span>
          </div>
          
          <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-green-600 text-sm font-medium">Free</span>
          </div>
          
          <div className="flex items-center space-x-1 text-gray-600">
            <FiClock size={14} />
            <span className="text-sm">{store.delivery_time_estimation || '30 min'}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm leading-relaxed">
          {store.description || 'Maecenas sed diam eget risus varius blandit sit amet non magna. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.'}
        </p>
      </div>
      
      {/* Category Filter */}
      <div className="bg-white px-6 py-4 border-t border-gray-100">
        <div className="flex space-x-3 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category 
                  ? 'bg-green-500 text-white' 
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
                  {/* Product Image */}
                  <div className="h-32 bg-gray-200 relative">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-2xl">🏪</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight">{product.name}</h3>
                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                      {product.description || 'Kaliteli ve taze'}
                    </p>
                    
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
                            className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 disabled:opacity-50"
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addToCart(product)}
                          disabled={store.status !== 'active'}
                          className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="text-gray-400 text-4xl mb-4">🏪</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün Bulunamadı</h3>
            <p className="text-gray-500">Bu kategoride ürün bulunmamaktadır.</p>
          </div>
        )}
      </div>
    </div>
  );
} 