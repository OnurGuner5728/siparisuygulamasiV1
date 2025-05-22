'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useCart } from '@/contexts/CartContext';

export default function CicekVendorDetailPage() {
  const params = useParams();
  const vendorId = params?.id || null;
  
  // useCart hook'unu doğrudan çağırıyoruz - React Hook kuralları gereği koşulsuz olmalı
  const cartFunctions = useCart();
  
  // Hata yönetimini hook çağrısı sonrası yapıyoruz
  const addToCart = cartFunctions?.addToCart || (() => {});
  const removeFromCart = cartFunctions?.removeFromCart || (() => {});
  const cartItems = cartFunctions?.cartItems || [];
  
  const [vendor, setVendor] = useState(null);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [localCart, setLocalCart] = useState([]);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        if (vendorId) {
          // Çiçekçi bilgilerini getir
          const vendorData = await api.getStoreById(vendorId);
          
          if (vendorData) {
            // Çiçekçinin ürünlerini getir
            const productsData = await api.getProductsByStoreId(vendorId);
            
            // Ürünlerin kategorilerini al
            const categories = [...new Set(productsData.map(p => p.category))].filter(Boolean);
            
            // Satıcı nesnesini kategori bilgisi ile güncelle
            setVendor({
              ...vendorData,
              categories: categories,
              products: productsData
            });
            
            setVendorProducts(productsData);
            
            // İlk kategoriyi seç
            setSelectedCategory('Tümü');
          }
        }
      } catch (error) {
        console.error('Çiçekçi verileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [vendorId]);

  useEffect(() => {
    // CartContext'ten bu satıcıya ait ürünleri filtrele
    if (vendor && cartItems) {
      const vendorItems = cartItems.filter(item => 
        item.store_id === vendorId
      );
      setLocalCart(vendorItems);
    }
  }, [cartItems, vendor, vendorId]);

  const handleAddToCart = (item) => {
    addToCart({
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      store_id: vendorId,
      store_name: vendor.name,
      store_type: 'cicek',
      category: item.category || '',
      image: item.image || 'https://placehold.co/100'
    });
  };

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
  };

  // Filtrelenmiş ürünler
  const filteredProducts = vendorProducts?.filter(item => 
    selectedCategory === 'Tümü' || item.category === selectedCategory
  ) || [];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Çiçekçi bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Çiçekçi Bulunamadı</h2>
          <p className="text-gray-600 mb-8">Üzgünüz, aradığınız çiçekçi bulunamadı.</p>
          <Link href="/cicek" className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md">
            Tüm Çiçekçiler
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Geri dönüş linki */}
      <div className="mb-6">
        <Link href="/cicek" className="text-pink-600 hover:text-pink-800 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Tüm Çiçekçiler
        </Link>
      </div>
      
      {/* Satıcı bilgisi başlık kısmı */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="h-64 bg-gray-200 relative">
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold ${vendor.is_open ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {vendor.is_open ? 'Açık' : 'Kapalı'}
          </div>
          {vendor.cover_image_url ? (
            <img 
              src={vendor.cover_image_url}
              alt={vendor.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-gray-400">Çiçekçi resmi yüklenemiyor</span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-3xl font-bold">{vendor.name}</h1>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                {vendor.tags && vendor.tags.length > 0 && <span className="mr-2">{vendor.tags.join(', ')}</span>}
                {vendor.rating !== null && <span className="mr-2">⭐ {vendor.rating.toFixed(1)}</span>}
                <span>{vendor.delivery_time_estimation || 'Belirtilmemiş'} teslimat</span>
              </div>
              <p className="text-gray-600 mt-2">{vendor.address || 'Adres belirtilmemiş'}</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="bg-pink-50 p-3 rounded-lg border border-pink-100">
                <p className="text-sm font-medium">Minimum Sipariş Tutarı</p>
                <p className="text-xl font-bold text-pink-700">{vendor.min_order_amount || 0} TL</p>
              </div>
            </div>
          </div>
          
          <p className="mt-4 text-gray-700 border-t pt-4">{vendor.description || 'Bu çiçekçi hakkında detaylı bilgi bulunmamaktadır.'}</p>
        </div>
      </div>
      
      {/* Ana içerik bölümü: Ürünler ve Sepet */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Ürünler */}
        <div className="w-full lg:w-2/3">
          <h2 className="text-2xl font-bold mb-4">Çiçekler & Ürünler</h2>
          
          {/* Kategori Filtreleri */}
          <div className="flex flex-wrap mb-6 gap-2">
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === 'Tümü' 
                  ? 'bg-pink-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedCategory('Tümü')}
            >
              Tümü
            </button>
            
            {vendor.categories && vendor.categories.map((category, index) => (
              <button 
                key={index}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category 
                    ? 'bg-pink-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Ürün Listesi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="h-36 bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">Ürün resmi yüklenemiyor</span>
                    )}
                  </div>
                  <h3 className="font-bold truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{product.category}</p>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-pink-700">{product.price.toFixed(2)} TL</p>
                    
                    {cartItems.find(item => item.product_id === product.id) ? (
                      <div className="flex items-center">
                        <button 
                          onClick={() => handleRemoveFromCart(product.id)}
                          className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="mx-2 font-medium">
                          {cartItems.find(item => item.product_id === product.id).quantity}
                        </span>
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center hover:bg-pink-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded-md text-sm"
                        onClick={() => handleAddToCart(product)}
                      >
                        + Sepete Ekle
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg col-span-2">
                <p className="text-gray-500">Bu kategoride ürün bulunamadı.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Sipariş Özeti */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h3 className="text-xl font-bold mb-4">Sipariş Özeti</h3>
            
            {localCart.length > 0 ? (
              <>
                <div className="space-y-3 mb-6">
                  {localCart.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs mr-2">
                          {item.quantity}x
                        </span>
                        <span className="truncate">{item.name}</span>
                      </div>
                      <span className="font-medium">{(item.price * item.quantity).toFixed(2)} TL</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Ara Toplam</span>
                    <span className="font-medium">
                      {localCart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)} TL
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Teslimat Ücreti</span>
                    <span className="font-medium">9.90 TL</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-4">
                    <span>Toplam</span>
                    <span>
                      {(localCart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 9.90).toFixed(2)} TL
                    </span>
                  </div>
                </div>
                
                <Link 
                  href="/sepet" 
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-md font-medium text-center block"
                >
                  Sepete Git
                </Link>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Henüz sepetinizde ürün bulunmamaktadır.</p>
                <p className="text-sm text-gray-400">Sipariş vermek için ürün ekleyin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 