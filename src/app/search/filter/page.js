'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';

function FilterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL'den parametreleri al
  const query = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'Hepsi';
  const activeTab = searchParams.get('tab') || 'stores'; // stores veya products
  
  // Filtre durumları
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [deliveryTime, setDeliveryTime] = useState('any'); // any, under30, under45, under60
  const [minRating, setMinRating] = useState(0); // 0, 3, 3.5, 4, 4.5
  const [priceRange, setPriceRange] = useState([0, 500]); // [min, max]
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [hasDiscounts, setHasDiscounts] = useState(false);
  
  // Kategoriler (gerçek uygulamada API'dan çekilebilir)
  const storeCategories = [
    'Restoran', 'Fast Food', 'Cafe', 'Market', 'Pastane', 'Su', 'Manav', 'Şarküteri'
  ];
  
  const productCategories = [
    'Burger', 'Pizza', 'Kebap', 'Döner', 'Tatlı', 'Kahve', 'İçecek', 'Meyve', 'Sebze', 'Et Ürünleri', 'Süt Ürünleri'
  ];
  
  // Aktif sekmeye göre kategori listesini belirle
  const categories = activeTab === 'stores' ? storeCategories : productCategories;
  
  // Başlangıçta seçili kategoriyi belirle
  useEffect(() => {
    if (initialCategory && initialCategory !== 'Hepsi') {
      setSelectedCategories([initialCategory]);
    }
  }, [initialCategory]);
  
  // Kategori seçme/kaldırma fonksiyonu
  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  // Fiyat aralığı değişim işleyicisi
  const handlePriceRangeChange = (type, value) => {
    const [min, max] = priceRange;
    if (type === 'min') {
      setPriceRange([parseInt(value), max]);
    } else {
      setPriceRange([min, parseInt(value)]);
    }
  };
  
  // Filtreleri uygula ve arama sayfasına dön
  const applyFilters = () => {
    // Yeni arama parametreleri oluştur
    const params = new URLSearchParams();
    
    // Temel parametreleri ekle
    if (query) params.set('q', query);
    params.set('tab', activeTab);
    
    // Kategori filtresi
    if (selectedCategories.length === 1) {
      params.set('category', selectedCategories[0]);
    } else if (selectedCategories.length > 1) {
      params.set('categories', selectedCategories.join(','));
    } else {
      params.set('category', 'Hepsi');
    }
    
    // Diğer filtreler
    if (deliveryTime !== 'any') params.set('delivery_time', deliveryTime);
    if (minRating > 0) params.set('min_rating', minRating.toString());
    if (priceRange[0] > 0) params.set('min_price', priceRange[0].toString());
    if (priceRange[1] < 500) params.set('max_price', priceRange[1].toString());
    if (freeDelivery) params.set('free_delivery', 'true');
    if (hasDiscounts) params.set('discounts', 'true');
    
    // Arama sayfasına yönlendir
    router.push(`/search?${params.toString()}`);
  };
  
  // Tüm filtreleri temizle
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setDeliveryTime('any');
    setMinRating(0);
    setPriceRange([0, 500]);
    setFreeDelivery(false);
    setHasDiscounts(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Başlık */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => router.back()} 
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                aria-label="Geri"
              >
                <FiArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-gray-800">Filtreler</h1>
            </div>
            
            <button 
              onClick={clearAllFilters}
              className="text-red-600 text-sm font-medium"
            >
              Tümünü Temizle
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Kategoriler */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Kategoriler</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-4 py-3 rounded-lg text-sm font-medium ${
                  selectedCategories.includes(category)
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {selectedCategories.includes(category) && (
                  <FiCheck className="inline-block mr-1" />
                )}
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Teslimat Süresi (Sadece restoranlar için) */}
        {activeTab === 'stores' && (
          <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Teslimat Süresi</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeliveryTime('any')}
                className={`px-4 py-3 rounded-lg text-sm font-medium ${
                  deliveryTime === 'any'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setDeliveryTime('under30')}
                className={`px-4 py-3 rounded-lg text-sm font-medium ${
                  deliveryTime === 'under30'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                30 dk altı
              </button>
              <button
                onClick={() => setDeliveryTime('under45')}
                className={`px-4 py-3 rounded-lg text-sm font-medium ${
                  deliveryTime === 'under45'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                45 dk altı
              </button>
              <button
                onClick={() => setDeliveryTime('under60')}
                className={`px-4 py-3 rounded-lg text-sm font-medium ${
                  deliveryTime === 'under60'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                60 dk altı
              </button>
            </div>
          </div>
        )}
        
        {/* Minimum Değerlendirme */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Minimum Puan</h2>
          
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setMinRating(0)}
              className={`px-4 py-3 rounded-lg text-sm font-medium ${
                minRating === 0
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setMinRating(3)}
              className={`px-4 py-3 rounded-lg text-sm font-medium ${
                minRating === 3
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              3.0+
            </button>
            <button
              onClick={() => setMinRating(3.5)}
              className={`px-4 py-3 rounded-lg text-sm font-medium ${
                minRating === 3.5
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              3.5+
            </button>
            <button
              onClick={() => setMinRating(4)}
              className={`px-4 py-3 rounded-lg text-sm font-medium ${
                minRating === 4
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              4.0+
            </button>
            <button
              onClick={() => setMinRating(4.5)}
              className={`px-4 py-3 rounded-lg text-sm font-medium ${
                minRating === 4.5
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              4.5+
            </button>
          </div>
        </div>
        
        {/* Fiyat Aralığı */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Fiyat Aralığı</h2>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-full">
              <label className="block text-sm text-gray-600 mb-1">Minimum</label>
              <input
                type="number"
                min="0"
                max={priceRange[1]}
                value={priceRange[0]}
                onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="w-full">
              <label className="block text-sm text-gray-600 mb-1">Maksimum</label>
              <input
                type="number"
                min={priceRange[0]}
                max="500"
                value={priceRange[1]}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          <div className="relative h-2 bg-gray-200 rounded-full mb-2">
            <div
              className="absolute h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
              style={{
                left: `${(priceRange[0] / 500) * 100}%`,
                right: `${100 - (priceRange[1] / 500) * 100}%`
              }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>0 TL</span>
            <span>500 TL</span>
          </div>
        </div>
        
        {/* Ekstra Opsiyonlar */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ekstra Seçenekler</h2>
          
          <label className="flex items-center py-2 mb-2">
            <input
              type="checkbox"
              checked={freeDelivery}
              onChange={() => setFreeDelivery(!freeDelivery)}
              className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-3 text-gray-700">Ücretsiz Teslimat</span>
          </label>
          
          <label className="flex items-center py-2">
            <input
              type="checkbox"
              checked={hasDiscounts}
              onChange={() => setHasDiscounts(!hasDiscounts)}
              className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-3 text-gray-700">İndirimli</span>
          </label>
        </div>
      </div>
      
      {/* Alt Buton (Sabit) */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4">
        <button
          onClick={applyFilters}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-3 px-4 rounded-lg shadow-sm hover:from-orange-600 hover:to-red-700"
        >
          Filtreleri Uygula
        </button>
      </div>
    </div>
  );
}

// Loading komponenti
function FilterPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );
}

// Suspense boundary içerisinde FilterPageContent'i sarıyoruz
export default function FilterPage() {
  return (
    <Suspense fallback={<FilterPageLoading />}>
      <FilterPageContent />
    </Suspense>
  );
} 
