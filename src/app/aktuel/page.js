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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Aktüel Ürünler</h1>
      <p className="text-gray-600 mb-8">Özel indirimli ve sınırlı stoklarla sunulan ürünleri kaçırmayın!</p>
      
      {/* Kampanya Banner */}
      <CategoryCampaignBanner 
        categoryId={4} 
        categoryName="aktuel" 
      />
      
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
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Stok durumu filtresi */}
          <div className="flex items-center pt-5">
            <input
              id="inStock"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              checked={filters.inStock}
              onChange={(e) => handleFilterChange('inStock', e.target.checked)}
            />
            <label htmlFor="inStock" className="ml-2 block text-sm text-gray-900">
              Sadece stoktaki ürünler
            </label>
          </div>
        </div>
      </div>
      
      {/* Ürünler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => {
          const stockStatus = getStockIndicator(product.stock);
          const daysLeft = calculateDaysLeft(product.endDate);
          const discountPercent = Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100);
          
          return (
            <Link 
              key={product.id} 
              href={`/aktuel/${product.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative">
                <div className="h-48 bg-gray-200 relative">
                  <img src={product.image || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" />
                  
                  {/* İndirim etiketi */}
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    %{discountPercent} İndirim
                  </div>
                  
                  {/* Stok durumu */}
                  <div className={`absolute top-2 right-2 ${stockStatus.color} text-white text-xs font-bold px-2 py-1 rounded`}>
                    {stockStatus.text}
                  </div>
                </div>
                
                {/* Kalan gün */}
                {daysLeft > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-center text-sm py-1">
                    Son {daysLeft} gün
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 h-12">{product.name}</h3>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 line-through mr-2">{product.originalPrice.toFixed(2)} TL</span>
                  <span className="text-red-600 font-bold">{product.discountPrice.toFixed(2)} TL</span>
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  {product.stock > 0 ? `${product.stock} adet stokta` : 'Stokta yok'}
                </div>
              </div>
            </Link>
          );
        })}
        
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Ürün Bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">Arama kriterlerinize uygun ürün bulunamadı.</p>
            <div className="mt-6">
              <button
                onClick={() => setFilters({ category: '', inStock: false, searchQuery: '' })}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 