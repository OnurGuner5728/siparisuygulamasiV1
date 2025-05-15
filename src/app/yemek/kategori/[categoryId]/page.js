'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiFilter, FiStar, FiShoppingBag } from 'react-icons/fi';
import { mockStores, mockProducts } from '@/app/data/mockdatas';

export default function CategoryPage({ params }) {
  const router = useRouter();
  const { categoryId } = params;
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterActive, setFilterActive] = useState(false);
  const [sortOption, setSortOption] = useState('popular');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
  const [ratings, setRatings] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  
  // Ürünleri yükle
  useEffect(() => {
    // API çağrısı simülasyonu
    setTimeout(() => {
      // Tüm mock ürünlerden kategoriye ait olanları filtrele
      let categoryProducts = [];
      
      // Kategorileri belirle
      const foodCategories = {
        'burgers': 'Burgerler',
        'kebabs': 'Kebaplar',
        'pizzas': 'Pizzalar',
        'desserts': 'Tatlılar',
        'drinks': 'İçecekler',
        'fastfood': 'Fast Food',
        'breakfast': 'Kahvaltı',
        'seafood': 'Deniz Ürünleri'
      };
      
      setCategoryName(foodCategories[categoryId] || 'Yemekler');
      
      // mockProducts'dan ilgili kategoriye ait ürünleri bul
      mockStores.forEach(store => {
        if (store.menuItems) {
          store.menuItems.forEach(item => {
            // Eğer kategori eşleşiyorsa ya da tüm yemekleri göster
            if ((categoryId === 'all') || 
                (item.category && item.category.toLowerCase().includes(categoryId.toLowerCase())) || 
                (item.name && item.name.toLowerCase().includes(categoryId.toLowerCase()))) {
              categoryProducts.push({
                ...item,
                storeName: store.name,
                storeId: store.id
              });
            }
          });
        }
      });
      
      // Ürünleri sırala
      categoryProducts = sortProducts(categoryProducts, sortOption);
      
      setProducts(categoryProducts);
      setLoading(false);
    }, 500);
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
        return productsCopy.sort((a, b) => b.rating - a.rating);
      case 'popular':
      default:
        return productsCopy.sort((a, b) => b.reviewCount - a.reviewCount);
    }
  };
  
  // Sıralama değiştiğinde ürünleri güncelle
  useEffect(() => {
    if (!loading) {
      setProducts(sortProducts([...products], sortOption));
    }
  }, [sortOption]);
  
  // Filtreleri uygula
  const applyFilters = () => {
    setFilterActive(false);
    
    // Tüm ürünleri al ve filtreleri uygula
    let filteredProducts = [];
    
    mockStores.forEach(store => {
      if (store.menuItems) {
        store.menuItems.forEach(item => {
          // Kategori kontrolü
          if ((categoryId === 'all') || 
              (item.category && item.category.toLowerCase().includes(categoryId.toLowerCase())) || 
              (item.name && item.name.toLowerCase().includes(categoryId.toLowerCase()))) {
            
            // Fiyat aralığı kontrolü
            if (item.price >= priceRange.min && item.price <= priceRange.max) {
              
              // Yıldız derecelendirme kontrolü
              if (ratings.length === 0 || ratings.includes(Math.floor(item.rating))) {
                filteredProducts.push({
                  ...item,
                  storeName: store.name,
                  storeId: store.id
                });
              }
            }
          }
        });
      }
    });
    
    // Sıralama
    filteredProducts = sortProducts(filteredProducts, sortOption);
    
    setProducts(filteredProducts);
  };
  
  // Filtreleri sıfırla
  const resetFilters = () => {
    setPriceRange({ min: 0, max: 500 });
    setRatings([]);
    
    // Tüm ürünleri yeniden yükle
    setTimeout(() => {
      let categoryProducts = [];
      
      mockStores.forEach(store => {
        if (store.menuItems) {
          store.menuItems.forEach(item => {
            if ((categoryId === 'all') || 
                (item.category && item.category.toLowerCase().includes(categoryId.toLowerCase())) || 
                (item.name && item.name.toLowerCase().includes(categoryId.toLowerCase()))) {
              categoryProducts.push({
                ...item,
                storeName: store.name,
                storeId: store.id
              });
            }
          });
        }
      });
      
      // Ürünleri sırala
      categoryProducts = sortProducts(categoryProducts, sortOption);
      
      setProducts(categoryProducts);
    }, 100);
    
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
                href={`/yemek/${product.storeId}/${product.id}`}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-40 bg-gray-200">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      Ürün resmi yok
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{product.storeName}</p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center text-sm">
                      <FiStar className="text-yellow-500 fill-current mr-1" size={14} />
                      <span>{product.rating || 4.5}</span>
                      <span className="mx-1 text-gray-300">•</span>
                      <span className="text-gray-500">{product.reviewCount || 10}+ değerlendirme</span>
                    </div>
                    
                    <span className="font-bold text-gray-900">{product.price.toFixed(2)} TL</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* Filtre Yan Menü */}
      {filterActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setFilterActive(false)}>
          <div 
            className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Filtre Başlık */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">Filtreler</h2>
                  <button 
                    onClick={() => setFilterActive(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  >
                    <FiArrowLeft size={20} />
                  </button>
                </div>
              </div>
              
              {/* Filtre İçeriği */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">Fiyat Aralığı</h3>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                      className="w-24 p-2 border border-gray-300 rounded-lg"
                      min="0"
                    />
                    <span className="mx-2 text-gray-400">-</span>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                      className="w-24 p-2 border border-gray-300 rounded-lg"
                      min="0"
                    />
                    <span className="ml-2 text-gray-500">TL</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">Değerlendirme</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={ratings.includes(rating)}
                          onChange={() => {
                            if (ratings.includes(rating)) {
                              setRatings(ratings.filter(r => r !== rating));
                            } else {
                              setRatings([...ratings, rating]);
                            }
                          }}
                          className="form-checkbox h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <div className="ml-2 flex items-center">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <FiStar
                              key={index}
                              className={`${
                                index < rating
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                              } mr-0.5`}
                              size={16}
                            />
                          ))}
                          {rating === 5 && <span className="ml-1 text-sm text-gray-600">ve üzeri</span>}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Filtre Alt Kısmı */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={resetFilters}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    Sıfırla
                  </button>
                  
                  <button
                    onClick={applyFilters}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-700"
                  >
                    Uygula
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 