'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ModuleGuard from '@/components/ModuleGuard';
import CategoryCampaignBanner from '@/components/CategoryCampaignBanner';

export default function AktuelPage() {
  return (
    <ModuleGuard moduleName="aktuel">
      <AktuelPageContent />
    </ModuleGuard>
  );
}

function AktuelPageContent() {
  // Dummy data - Gerçek uygulamada API'den gelecek
  const [products, setProducts] = useState([
    { 
      id: 1, 
      name: 'Bluetooth Kablosuz Kulaklık', 
      image: '/aktuel1.jpg', 
      originalPrice: 699.90, 
      discountPrice: 399.90, 
      stock: 150,
      endDate: '2023-07-15', // Son tarih
      category: 'Elektronik'
    },
    { 
      id: 2, 
      name: 'Çok Fonksiyonlu Mutfak Robotu', 
      image: '/aktuel2.jpg', 
      originalPrice: 2499.90, 
      discountPrice: 1699.90, 
      stock: 50,
      endDate: '2023-07-12',
      category: 'Ev Gereçleri'
    },
    { 
      id: 3, 
      name: 'Akıllı Bileklik', 
      image: '/aktuel3.jpg', 
      originalPrice: 899.90, 
      discountPrice: 599.90, 
      stock: 75,
      endDate: '2023-07-18',
      category: 'Elektronik'
    },
    { 
      id: 4, 
      name: 'Otomatik Kahve Makinesi', 
      image: '/aktuel4.jpg', 
      originalPrice: 3999.90, 
      discountPrice: 2899.90, 
      stock: 25,
      endDate: '2023-07-11',
      category: 'Ev Gereçleri'
    },
    { 
      id: 5, 
      name: 'Kablosuz Şarj Cihazı', 
      image: '/aktuel5.jpg', 
      originalPrice: 499.90, 
      discountPrice: 299.90, 
      stock: 100,
      endDate: '2023-07-20',
      category: 'Elektronik'
    },
    { 
      id: 6, 
      name: 'LED Işıklı Gaming Mouse', 
      image: '/aktuel6.jpg', 
      originalPrice: 799.90, 
      discountPrice: 449.90, 
      stock: 80,
      endDate: '2023-07-14',
      category: 'Bilgisayar'
    },
    { 
      id: 7, 
      name: 'Elektrikli Izgara', 
      image: '/aktuel7.jpg', 
      originalPrice: 1599.90, 
      discountPrice: 999.90, 
      stock: 60,
      endDate: '2023-07-13',
      category: 'Ev Gereçleri'
    },
    { 
      id: 8, 
      name: 'Akıllı Robot Süpürge', 
      image: '/aktuel8.jpg', 
      originalPrice: 5999.90, 
      discountPrice: 4499.90, 
      stock: 30,
      endDate: '2023-07-16',
      category: 'Ev Gereçleri'
    },
  ]);

  // Kampanyalar için dummy data
  const campaigns = [
    { id: 1, title: 'Süper Fırsat Günleri', description: 'Tüm ürünlerde büyük indirimler', endDate: '2023-07-20' },
    { id: 2, title: 'Elektronik Şenliği', description: 'Elektronik ürünlerde ekstra %10 indirim', endDate: '2023-07-15' },
  ];

  // Kategori listesi
  const categories = [...new Set(products.map(p => p.category))];

  // Filtreler
  const [filters, setFilters] = useState({
    category: '',
    inStock: false,
    searchQuery: '',
  });

  // Filtrelenen ürünler
  const [filteredProducts, setFilteredProducts] = useState(products);

  // Filtre değiştiğinde ürünleri filtrele
  useEffect(() => {
    let result = products;
    
    if (filters.category) {
      result = result.filter(product => product.category === filters.category);
    }

    if (filters.inStock) {
      result = result.filter(product => product.stock > 0);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.category.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(result);
  }, [filters, products]);

  // Kalan gün sayısını hesapla
  const calculateDaysLeft = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Stok durumuna göre gösterge oluştur
  const getStockIndicator = (stock) => {
    if (stock === 0) return { color: 'bg-red-500', text: 'Tükendi' };
    if (stock < 50) return { color: 'bg-orange-500', text: 'Sınırlı Stok' };
    return { color: 'bg-green-500', text: 'Stokta' };
  };

  // Filtre değişikliklerini yönet
  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Special Offers</h1>
            </div>
            <button className="p-2 text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Kampanya Banner */}
      <CategoryCampaignBanner 
        categoryId={4} 
        categoryName="aktuel" 
      />
      
      {/* Filter Tabs */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center space-x-1 overflow-x-auto">
          <button
            onClick={() => handleFilterChange('category', '')}
            className={`px-6 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
              filters.category === '' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Tümü
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleFilterChange('category', category === filters.category ? '' : category)}
              className={`px-6 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
                filters.category === category 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
          <button
            onClick={() => handleFilterChange('inStock', !filters.inStock)}
            className={`px-6 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
              filters.inStock 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Stoktakiler
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-4 border-b">
        <div className="max-w-md">
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Ürün adı veya kategori ara..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
          />
        </div>
      </div>
      
      {/* Products List */}
      <div className="container mx-auto px-4 py-6">
        {filteredProducts.length > 0 ? (
          <div className="space-y-4">
        {filteredProducts.map(product => {
          const stockStatus = getStockIndicator(product.stock);
          const daysLeft = calculateDaysLeft(product.endDate);
          const discountPercent = Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100);
          
          return (
            <Link 
              key={product.id} 
              href={`/aktuel/${product.id}`}
                  className="block"
            >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Product Image */}
                <div className="h-48 bg-gray-200 relative">
                      <img 
                        src={product.image || '/placeholder.jpg'} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzYgMTIwTDIwNCA5Mkg0OFY5MkwyMDQgMTIwVjkySDQ4VjkyTDIwNCAxMjBIMTc2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                        }}
                      />
                  
                  {/* İndirim etiketi */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                    %{discountPercent} İndirim
                        </span>
                  </div>
                  
                      {/* Süre ve stok */}
                      <div className="absolute top-4 right-4">
                        <div className="flex flex-col space-y-1">
                          {daysLeft > 0 && (
                            <span className="bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                              {daysLeft} gün kaldı
                            </span>
                          )}
                          <span className={`${stockStatus.color} text-white px-2 py-1 rounded-full text-sm`}>
                    {stockStatus.text}
                          </span>
                        </div>
                  </div>
                </div>
                
                    {/* Product Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 mb-4">{product.category} kategorisinde özel fırsat</p>
                      
                      {/* Price */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-gray-500 line-through text-lg">{product.originalPrice.toFixed(2)} TL</span>
                        <span className="text-red-600 font-bold text-2xl">{product.discountPrice.toFixed(2)} TL</span>
              </div>
              
                      {/* Product Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{product.stock > 0 ? `${product.stock} adet stokta` : 'Stokta yok'}</span>
                        <span className="font-medium text-purple-600">{product.category}</span>
                </div>
                </div>
              </div>
            </Link>
          );
        })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">🔥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun ürün bulunamadı.</p>
              <button
                onClick={() => setFilters({ category: '', inStock: false, searchQuery: '' })}
              className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg"
              >
                Filtreleri Temizle
              </button>
          </div>
        )}
      </div>
    </div>
  );
} 