'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiFilter, FiStar, FiShoppingBag } from 'react-icons/fi';
import api from '@/lib/api';

export default function CategoryPage({ params }) {
  // Next.js 15'te params Promise olduğu için React.use ile çözümlüyoruz
  const resolvedParams = use(params);
  const { categoryId } = resolvedParams;
  
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterActive, setFilterActive] = useState(false);
  const [sortOption, setSortOption] = useState('popular');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
  const [ratings, setRatings] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState(null);
  
  // Ürünleri ve mağazaları yükle
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Kategori bilgisini al
        const categoryData = await api.getCategoryById(categoryId);
        setCategoryName(categoryData?.name || 'Yemekler');
        
        // Kategori ID'si ile mağazaları al
        const storesData = await api.getStoresByCategory(categoryId);
        setStores(storesData || []);
        
        // Her mağazanın ürünlerini al
        let allProducts = [];
        for (const store of storesData) {
          const storeProducts = await api.getProductsByStoreId(store.id);
          
          // Ürünlere mağaza bilgisini ekle
          if (storeProducts && storeProducts.length > 0) {
            const productsWithStoreInfo = storeProducts.map(product => ({
              ...product,
              storeName: store.name,
              storeId: store.id,
              storeStatus: store.status,
              storeIsApproved: store.is_approved
            }));
            
            allProducts = [...allProducts, ...productsWithStoreInfo];
          }
        }
        
        // Ürünleri sırala
        allProducts = sortProducts(allProducts, sortOption);
        
        setProducts(allProducts);
      } catch (error) {
        console.error('Kategori ve ürün verileri yüklenirken hata:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [categoryId]);
  
  // Ürünleri sıralama fonksiyonu
  const sortProducts = (products, option) => {
    const productsCopy = [...products];
    
    switch (option) {
      case 'price-asc':
        return productsCopy.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return productsCopy.sort((a, b) => b.price - a.price);
      case 'rating':
        return productsCopy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'popular':
      default:
        return productsCopy.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
    }
  };
  
  // Sıralama değiştiğinde ürünleri güncelle
  useEffect(() => {
    if (!loading && products.length > 0) {
      setProducts(sortProducts([...products], sortOption));
    }
  }, [sortOption]);
  
  // Filtreleri uygula
  const applyFilters = async () => {
    setFilterActive(false);
    
    try {
      // Tüm mağaza ürünlerini tekrar al ve filtreleri uygula
      let filteredProducts = [];
      
      for (const store of stores) {
        const storeProducts = await api.getProductsByStoreId(store.id);
        
        if (storeProducts && storeProducts.length > 0) {
          // Filtrelerle eşleşen ürünleri seç
          const matchingProducts = storeProducts.filter(item => {
            // Fiyat aralığı kontrolü
            if (item.price >= priceRange.min && item.price <= priceRange.max) {
              // Yıldız derecelendirme kontrolü
              if (ratings.length === 0 || ratings.includes(Math.floor(item.rating || 0))) {
                return true;
              }
            }
            return false;
          });
          
          // Ürünlere mağaza bilgisini ekle
          const productsWithStoreInfo = matchingProducts.map(product => ({
            ...product,
            storeName: store.name,
            storeId: store.id
          }));
          
          filteredProducts = [...filteredProducts, ...productsWithStoreInfo];
        }
      }
      
      // Sıralama
      filteredProducts = sortProducts(filteredProducts, sortOption);
      
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Filtreler uygulanırken hata:', error);
    }
  };
  
  // Filtreleri sıfırla
  const resetFilters = async () => {
    setPriceRange({ min: 0, max: 500 });
    setRatings([]);
    
    try {
      // Tüm mağaza ürünlerini tekrar al
      let allProducts = [];
      
      for (const store of stores) {
        const storeProducts = await api.getProductsByStoreId(store.id);
        
        if (storeProducts && storeProducts.length > 0) {
          const productsWithStoreInfo = storeProducts.map(product => ({
            ...product,
            storeName: store.name,
            storeId: store.id
          }));
          
          allProducts = [...allProducts, ...productsWithStoreInfo];
        }
      }
      
      // Ürünleri sırala
      allProducts = sortProducts(allProducts, sortOption);
      
      setProducts(allProducts);
    } catch (error) {
      console.error('Filtreler sıfırlanırken hata:', error);
    }
    
    setFilterActive(false);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Başlık */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              className="mr-3 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              aria-label="Geri"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 truncate">{categoryName}</h1>
          </div>
        </div>
      </div>
      
      {/* Filtre ve Sıralama Çubuğu */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setFilterActive(true)}
              className="flex items-center text-gray-700 font-medium text-sm"
            >
              <FiFilter className="mr-1" />
              Filtrele
            </button>
            
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="text-sm border-none bg-gray-100 rounded-lg py-1.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="popular">En Popüler</option>
              <option value="rating">En Yüksek Puanlı</option>
              <option value="price-asc">Fiyat (Artan)</option>
              <option value="price-desc">Fiyat (Azalan)</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Ürün Listesi */}
      <div className="container mx-auto px-4 py-6">
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShoppingBag className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Ürün bulunamadı</h3>
            <p className="text-gray-500 mb-6">Seçilen kriterlere uygun ürün bulunamadı.</p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-700"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Link
                key={`${product.storeId}-${product.id}`}
                href={`/yemek/store/${product.storeId}`}
                className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow relative ${
                  product.storeStatus !== 'active' ? 'opacity-75' : ''
                }`}
              >
                {/* Kapalı mağaza etiketi */}
                {product.storeStatus !== 'active' && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Mağaza Kapalı
                    </span>
                  </div>
                )}
                
                <div className="relative h-40 bg-gray-200">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                      className={product.storeStatus !== 'active' ? 'filter grayscale' : ''}
                    />
                  ) : (
                    <div className={`absolute inset-0 flex items-center justify-center ${
                      product.storeStatus !== 'active' ? 'text-gray-300' : 'text-gray-400'
                    }`}>
                      <span>Resim Yok</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h2 className={`font-semibold truncate ${
                    product.storeStatus !== 'active' ? 'text-gray-600' : 'text-gray-800'
                  }`}>{product.name}</h2>
                  <p className={`text-sm truncate flex items-center ${
                    product.storeStatus !== 'active' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {product.storeName}
                    {product.storeStatus !== 'active' && (
                      <span className="ml-1 text-red-500 font-medium">(Kapalı)</span>
                    )}
                  </p>
                  
                  <div className="flex items-center mt-2">
                    {product.rating !== undefined && (
                      <div className="flex items-center mr-2">
                        <FiStar className="text-yellow-400 fill-current mr-1" size={14} />
                        <span className="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
                      </div>
                    )}
                    <span className="text-sm text-gray-400">
                      {product.category}
                    </span>
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <p className={`font-bold ${
                      product.storeStatus !== 'active' ? 'text-gray-500' : 'text-orange-600'
                    }`}>{product.price.toFixed(2)} TL</p>
                    <span className={`text-xs ${
                      product.storeStatus !== 'active' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {product.storeName}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* Filtre Modali */}
      {filterActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white rounded-t-2xl md:rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Filtrele</h3>
                <button 
                  onClick={() => setFilterActive(false)} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Fiyat Aralığı */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Fiyat Aralığı</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="priceMin" className="block text-xs text-gray-500 mb-1">En Az</label>
                    <input 
                      type="number" 
                      id="priceMin"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="priceMax" className="block text-xs text-gray-500 mb-1">En Çok</label>
                    <input 
                      type="number" 
                      id="priceMax"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Değerlendirme */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Değerlendirme</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`rating-${star}`}
                        checked={ratings.includes(star)}
                        onChange={() => {
                          if (ratings.includes(star)) {
                            setRatings(ratings.filter(r => r !== star));
                          } else {
                            setRatings([...ratings, star]);
                          }
                        }}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`rating-${star}`} className="ml-2 text-sm text-gray-700 flex items-center">
                        <span>{star}</span>
                        <FiStar className="text-yellow-400 fill-current ml-1" size={16} />
                        <span className="ml-1">ve üzeri</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium"
                >
                  Sıfırla
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium"
                >
                  Uygula
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 