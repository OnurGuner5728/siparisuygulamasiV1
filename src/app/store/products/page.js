'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiDollarSign, FiShoppingBag } from 'react-icons/fi';

export default function StoreProductsPage() {
  return (
    <AuthGuard requiredRole="store" permissionType="view">
      <StoreProductsContent />
    </AuthGuard>
  );
}

function StoreProductsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState([]);

  // Mağaza onaylanmamışsa yönlendir
  if (!user?.storeInfo?.is_approved) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-orange-500 text-5xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Mağaza Onayı Gerekli</h2>
            <p className="text-gray-600 mb-4">
              Ürünlerinizi yönetmek için mağazanızın onaylanması gerekiyor.
            </p>
            <Link
              href="/store"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Ana Panele Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Kullanıcının mağazasını bul
        const userStores = await api.getStores({ owner_id: user.id });
        
        if (userStores && userStores.length > 0) {
          const storeData = userStores[0]; // İlk mağazayı al
          setStore(storeData);
          
          // Mağazanın ürünlerini getir
          const productsData = await api.getProductsByStoreId(storeData.id);
          setProducts(productsData || []);
          
          // Kategori listesini oluştur
          const uniqueCategories = [...new Set(productsData.map(p => p.category).filter(Boolean))];
          setCategories(uniqueCategories);
        } else {
          console.warn('Kullanıcının mağazası bulunamadı');
          // Mağaza oluşturma sayfasına yönlendir
          router.push('/store/create');
        }
      } catch (error) {
        console.error('Ürün verileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [user, router]);

  const filteredProducts = products.filter(product => {
    // İsme göre filtreleme
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Kategoriye göre filtreleme
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    // Stok durumuna göre filtreleme
    const matchesAvailability = 
      availabilityFilter === 'all' ||
      (availabilityFilter === 'available' && product.is_available) ||
      (availabilityFilter === 'unavailable' && !product.is_available);
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        await api.deleteProduct(productId);
        
        // Ürün listesini güncelle
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Ürün silinirken hata:', error);
        alert('Ürün silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <StoreHeader title="Ürün Yönetimi" />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <StoreHeader title="Ürün Yönetimi" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Ürün Yönetimi</h1>
          
          <Link 
            href="/store/products/add" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Yeni Ürün Ekle
          </Link>
        </div>
        
        {store && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="w-full md:w-1/3">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Ürün Ara</label>
                <input
                  type="text"
                  id="search"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ürün adı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-1/4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Tüm Kategoriler</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-full md:w-1/4">
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">Stok Durumu</label>
                <select
                  id="availability"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                >
                  <option value="all">Tümü</option>
                  <option value="available">Stokta Var</option>
                  <option value="unavailable">Stokta Yok</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Ürün Bulunamadı</h2>
            <p className="text-gray-600 mb-6">Henüz hiç ürün eklenmemiş veya arama kriterlerinize uygun ürün bulunamadı.</p>
            <Link 
              href="/store/products/add" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni Ürün Ekle
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="h-48 bg-gray-100 relative">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Ürün resmi yok
                    </div>
                  )}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${product.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.is_available ? 'Stokta' : 'Stokta Değil'}
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-1 truncate">{product.name}</h2>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{product.description || 'Açıklama bulunmuyor'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-bold">{product.price.toFixed(2)} TL</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.category || 'Genel'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                    <Link
                      href={`/store/products/${product.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// StoreHeader bileşeni yerine basit bir başlık komponenti
const StoreHeader = ({ title }) => (
  <div className="bg-white shadow-sm mb-6 py-4">
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  </div>
); 
