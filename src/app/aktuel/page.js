'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AktuelPage() {
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Aktüel Ürünler</h1>
      <p className="text-gray-600 mb-8">Özel indirimli ve sınırlı stoklarla sunulan ürünleri kaçırmayın!</p>
      
      {/* Kampanyalar */}
      {campaigns.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Güncel Kampanyalar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="text-lg font-bold text-purple-700">{campaign.title}</h3>
                <p className="text-sm text-purple-600">{campaign.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Son {calculateDaysLeft(campaign.endDate)} gün!
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Arama ve Filtreler */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Ara</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            placeholder="Ürün adı veya kategori..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          {/* Kategori filtresi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select 
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Stok durumu filtresi */}
          <div className="flex items-center">
            <input
              id="inStock"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-6"
              checked={filters.inStock}
              onChange={(e) => handleFilterChange('inStock', e.target.checked)}
            />
            <label htmlFor="inStock" className="ml-2 block text-sm text-gray-700 mt-6">
              Sadece stokta olanlar
            </label>
          </div>
        </div>
      </div>
      
      {/* Ürünler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => {
            const stockStatus = getStockIndicator(product.stock);
            const daysLeft = calculateDaysLeft(product.endDate);
            
            return (
              <div 
                key={product.id} 
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-48 bg-gray-200 relative">
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white ${stockStatus.color}`}>
                    {stockStatus.text}
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold">
                    {Math.round((product.originalPrice - product.discountPrice) / product.originalPrice * 100)}% İndirim
                  </div>
                  <div className="h-full w-full flex items-center justify-center">
                    <span className="text-gray-400">Resim yüklenemiyor</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                  <h3 className="text-lg font-bold truncate">{product.name}</h3>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-lg font-bold text-purple-700">{product.discountPrice.toFixed(2)} TL</span>
                    <span className="text-sm text-gray-500 line-through">{product.originalPrice.toFixed(2)} TL</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-red-600 font-medium">
                        Son {daysLeft} gün!
                      </span>
                      <button 
                        className={`px-3 py-1 rounded text-white text-sm font-medium 
                        ${product.stock > 0 ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'}`}
                        disabled={product.stock === 0}
                      >
                        Sepete Ekle
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            <p>Bu kriterlere uygun ürün bulunamadı.</p>
            <button 
              className="mt-2 text-purple-600 hover:underline"
              onClick={() => setFilters({ category: '', inStock: false, searchQuery: '' })}
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 