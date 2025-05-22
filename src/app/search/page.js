'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiSearch, FiFilter, FiX, FiArrowLeft, FiChevronDown, FiStar } from 'react-icons/fi';
import { BiSort } from 'react-icons/bi';
import api from '@/lib/api';

// Kategori verileri (API'den gelebilir)
const categories = ['Hepsi', 'Yemek', 'Market', 'Su', 'Aktüel']; 

function SearchLoading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef(null);
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Hepsi');
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'stores'); // stores, products
  const [sortOption, setSortOption] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);

  // Arama işlemini gerçekleştir
  useEffect(() => {
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const performSearch = async () => {
      setSearching(true);
      
      try {
        let results;
        
        // Aktif sekmeye göre farklı API çağrıları yap
        if (activeTab === 'stores') {
          // Mağaza araması
          const searchParams = {
            query: query,
            category: selectedCategory !== 'Hepsi' ? selectedCategory : null,
            sort: sortOption
          };
          
          results = await api.searchStores(searchParams);
        } else {
          // Ürün araması
          const searchParams = {
            query: query,
            category: selectedCategory !== 'Hepsi' ? selectedCategory : null,
            sort: sortOption
          };
          
          results = await api.searchProducts(searchParams);
        }
        
        setSearchResults(results);
      } catch (err) {
        console.error('Arama yapılırken hata:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };
    
    // Debouce arama işlemi
    const timer = setTimeout(() => {
      performSearch();
    }, 300);
    
    return () => {
      clearTimeout(timer);
    };
  }, [query, selectedCategory, sortOption, activeTab]);
  
  // Arama kutusu temizleme
  const clearSearch = () => {
    setQuery('');
    searchInputRef.current?.focus();
  };
  
  // Filtre sayfasına yönlendirme
  const goToFilters = () => {
    router.push(`/search/filter?q=${encodeURIComponent(query)}&category=${selectedCategory}&tab=${activeTab}`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Arama Başlığı */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center">
            {/* Geri Butonu */}
            <button 
              onClick={() => router.back()} 
              className="mr-3 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              aria-label="Geri"
            >
              <FiArrowLeft size={20} />
            </button>
            
            {/* Arama Kutusu */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-gray-100 border-0 rounded-full py-2 pl-10 pr-12 focus:ring-2 focus:ring-orange-500 focus:bg-white"
                placeholder="Ne aramıştınız?"
                autoFocus
              />
              
              {query && (
                <button 
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <FiX />
                </button>
              )}
            </div>
            
            {/* Filtre Butonu */}
            <button 
              onClick={goToFilters}
              className="ml-3 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              aria-label="Filtrele"
            >
              <FiFilter size={20} />
            </button>
          </div>
          
          {/* Sekmeler: Restoranlar / Ürünler */}
          <div className="flex mt-3 border-b">
            <button
              className={`flex-1 py-2 px-4 text-center ${
                activeTab === 'stores' 
                  ? 'text-orange-600 border-b-2 border-orange-600 font-medium' 
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('stores')}
            >
              Restoranlar
            </button>
            <button
              className={`flex-1 py-2 px-4 text-center ${
                activeTab === 'products' 
                  ? 'text-orange-600 border-b-2 border-orange-600 font-medium' 
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('products')}
            >
              Ürünler
            </button>
          </div>
        </div>
      </div>
      
      {/* Kategori ve Sıralama Filtreleri */}
      <div className="bg-white shadow-sm mb-4 overflow-hidden">
        <div className="container mx-auto px-4 py-3">
          {/* Kategori Kaydırma Listesi */}
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Sıralama Seçenekleri */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t">
            <div className="text-sm text-gray-500">
              {searchResults.length > 0 ? `${searchResults.length} sonuç bulundu` : ''}
            </div>
            
            <div className="relative inline-block text-left">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <BiSort className="mr-1" />
                {sortOption === 'relevance' && 'Alakalılık'}
                {sortOption === 'rating' && 'En Yüksek Puan'}
                {sortOption === 'deliveryTime' && 'En Hızlı Teslimat'}
                {sortOption === 'minPrice' && 'En Düşük Fiyat'}
                {sortOption === 'distance' && 'En Yakın'}
                <FiChevronDown className="ml-1" />
              </button>
              
              {showFilters && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSortOption('relevance');
                        setShowFilters(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Alakalılık
                    </button>
                    <button
                      onClick={() => {
                        setSortOption('rating');
                        setShowFilters(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      En Yüksek Puan
                    </button>
                    {activeTab === 'stores' && (
                      <button
                        onClick={() => {
                          setSortOption('deliveryTime');
                          setShowFilters(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        En Hızlı Teslimat
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSortOption(activeTab === 'stores' ? 'minPrice' : 'minPrice');
                        setShowFilters(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      En Düşük Fiyat
                    </button>
                    {activeTab === 'stores' && (
                      <button
                        onClick={() => {
                          setSortOption('distance');
                          setShowFilters(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        En Yakın
                      </button>
                    )}
                    {activeTab === 'products' && (
                      <button
                        onClick={() => {
                          setSortOption('maxPrice');
                          setShowFilters(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        En Yüksek Fiyat
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Arama Sonuçları */}
      <div className="container mx-auto px-4 pb-12">
        {searching ? (
          // Arama yükleniyor
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : query.trim() === '' ? (
          // Arama kutusu boş
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">Arama yapmak için birşeyler yazın</h3>
            <p className="text-gray-500 mt-2">Restoran, yemek veya mutfak türü arayabilirsiniz</p>
          </div>
        ) : searchResults.length === 0 ? (
          // Sonuç bulunamadı
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">Sonuç bulunamadı</h3>
            <p className="text-gray-500 mt-2">Farklı anahtar kelimeler deneyebilir veya filtreleri değiştirebilirsiniz</p>
          </div>
        ) : (
          // Arama sonuçları
          <div className="grid gap-4">
            {activeTab === 'stores' ? (
              // Restoran sonuçları
              searchResults.map((store) => (
                <Link 
                  key={store.id} 
                  href={`/yemek/store/${store.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden flex border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-24 h-24 bg-gray-200 shrink-0">
                    {store.image_url ? (
                      <img src={store.image_url} alt={store.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-300">
                        <span className="text-sm">Resim</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 p-3">
                    <h3 className="font-medium text-gray-900">{store.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{store.category_name}</span>
                      <span className="mx-2">•</span>
                      <div className="flex items-center">
                        <FiStar className="text-yellow-500 mr-1" size={14} />
                        <span>{store.rating || '0.0'}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <span>{store.delivery_time || '30-45 dk'}</span>
                      <span className="mx-2">•</span>
                      <span>{store.distance ? `${store.distance} km` : '---'}</span>
                      <span className="mx-2">•</span>
                      <span>{store.delivery_fee === 0 ? 'Ücretsiz Teslimat' : `${store.delivery_fee || '5'} TL Teslimat`}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              // Ürün sonuçları
              searchResults.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/yemek/store/${product.store_id}/product/${product.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden flex border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-24 h-24 bg-gray-200 shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-300">
                        <span className="text-sm">Resim</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 p-3">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{product.store_name}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded">{product.category_name}</span>
                        <span className="mx-2">•</span>
                        <div className="flex items-center">
                          <FiStar className="text-yellow-500 mr-1" size={14} />
                          <span>{product.rating || '0.0'}</span>
                        </div>
                      </div>
                      <div className="text-orange-600 font-medium">
                        {parseFloat(product.price).toFixed(2)} TL
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Search() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
} 