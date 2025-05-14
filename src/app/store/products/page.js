'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import StoreGuard from '@/components/StoreGuard';

export default function StoreProducts() {
  return (
    <StoreGuard>
      <StoreProductsContent />
    </StoreGuard>
  );
}

function StoreProductsContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const productsPerPage = 10;

  useEffect(() => {
    // Mock API çağrısı
    setTimeout(() => {
      // Gerçek projede burası bir API isteği olacaktır
      const mockProducts = [
        {
          id: 1,
          name: 'Adana Kebap',
          description: 'Lezzetli Adana kebap',
          price: 120.00,
          category: 'Ana Yemekler',
          status: 'active',
          image: 'https://via.placeholder.com/150',
          rating: 4.8,
          reviewCount: 120,
          createdAt: '2023-01-15'
        },
        {
          id: 2,
          name: 'Urfa Kebap',
          description: 'Lezzetli Urfa kebap',
          price: 110.00,
          category: 'Ana Yemekler',
          status: 'active',
          image: 'https://via.placeholder.com/150',
          rating: 4.7,
          reviewCount: 95,
          createdAt: '2023-01-20'
        },
        {
          id: 3,
          name: 'Ayran',
          description: 'Soğuk ayran',
          price: 15.00,
          category: 'İçecekler',
          status: 'active',
          image: 'https://via.placeholder.com/150',
          rating: 4.5,
          reviewCount: 200,
          createdAt: '2023-01-10'
        },
        {
          id: 4,
          name: 'Döner Porsiyon',
          description: 'Lezzetli tavuk döner porsiyon',
          price: 85.00,
          category: 'Ana Yemekler',
          status: 'active',
          image: 'https://via.placeholder.com/150',
          rating: 4.5,
          reviewCount: 110,
          createdAt: '2023-02-20'
        },
        {
          id: 5,
          name: 'Patates Kızartması',
          description: 'Çıtır patates kızartması',
          price: 35.00,
          category: 'Yan Ürünler',
          status: 'active',
          image: 'https://via.placeholder.com/150',
          rating: 4.4,
          reviewCount: 95,
          createdAt: '2023-02-22'
        },
        {
          id: 6,
          name: 'Cola 330ml',
          description: 'Soğuk kola 330ml',
          price: 25.00,
          category: 'İçecekler',
          status: 'inactive',
          image: 'https://via.placeholder.com/150',
          rating: 4.3,
          reviewCount: 85,
          createdAt: '2023-02-25'
        },
        {
          id: 7,
          name: 'Künefe',
          description: 'Sıcak künefe tatlısı',
          price: 60.00,
          category: 'Tatlılar',
          status: 'active',
          image: 'https://via.placeholder.com/150',
          rating: 4.9,
          reviewCount: 150,
          createdAt: '2023-03-01'
        }
      ];
      
      // Kategorileri çıkar
      const uniqueCategories = Array.from(new Set(mockProducts.map(product => product.category)));
      
      setProducts(mockProducts);
      setCategories(uniqueCategories);
      setLoading(false);
    }, 1000);
  }, []);

  // Arama ve filtreleme
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sayfalama
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Sayfa değiştirme
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Ürün silme
  const handleDeleteProduct = (productId) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      // Gerçek projede API isteği yapılır
      setProducts(products.filter(product => product.id !== productId));
    }
  };

  // Ürün durumunu değiştirme
  const handleToggleStatus = (productId) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          status: product.status === 'active' ? 'inactive' : 'active'
        };
      }
      return product;
    });
    
    setProducts(updatedProducts);
  };

  // Ürün durumunu formatla
  const formatStatus = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Aktif</span>;
      case 'inactive':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Pasif</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Bilinmiyor</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Ürünler</h1>
          <p className="text-gray-600 mt-1">Menünüzü yönetin ve güncelleyin</p>
        </div>
        <Link 
          href="/store"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Panele Dön
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="mb-4 md:mb-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Ürün adı veya açıklama ara..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
            <select
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
            <Link 
              href="/store/products/add"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni Ürün
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ürün
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiyat
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-md object-cover" src={product.image} alt={product.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.price.toFixed(2)} TL</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-1">{product.rating}</span>
                      <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatStatus(product.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/store/products/${product.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Düzenle
                      </Link>
                      <button 
                        onClick={() => handleToggleStatus(product.id)}
                        className={`${product.status === 'active' ? 'text-amber-600 hover:text-amber-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {product.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-700">
              Toplam <span className="font-medium">{filteredProducts.length}</span> üründen{' '}
              <span className="font-medium">{indexOfFirstProduct + 1}</span>-
              <span className="font-medium">
                {indexOfLastProduct > filteredProducts.length ? filteredProducts.length : indexOfLastProduct}
              </span>{' '}
              arası gösteriliyor
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Önceki
              </button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = index + 1;
                } else if (currentPage <= 3) {
                  pageNumber = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + index;
                } else {
                  pageNumber = currentPage - 2 + index;
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => paginate(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNumber
                        ? 'z-10 bg-blue-600 text-white'
                        : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 