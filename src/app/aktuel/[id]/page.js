'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import api from '@/lib/api';

export default function AktuelProductDetailPage() {
  const params = useParams();
  const productId = params.id;
  
  // useCart hook'unu doğrudan çağırıyoruz - React Hook kuralları gereği koşulsuz olmalı
  const cartFunctions = useCart();
  
  // Hata yönetimini hook çağrısı sonrası yapıyoruz
  const addToCart = cartFunctions?.addToCart || (() => {});
  const removeFromCart = cartFunctions?.removeFromCart || (() => {});
  const cartItems = cartFunctions?.cartItems || [];
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  // Veritabanından ürün bilgilerini al
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Ürün detaylarını getir
        const productData = await api.getAktuelProductById(productId);
        
        if (!productData) {
          setError('Ürün bulunamadı');
          setLoading(false);
          return;
        }
        
        setProduct(productData);
        
        // İlgili ürünleri getir
        if (productData.related_product_ids && productData.related_product_ids.length > 0) {
          const relatedProductsData = await api.getAktuelProductsByIds(productData.related_product_ids);
          setRelatedProducts(relatedProductsData || []);
        }
      } catch (err) {
        console.error('Ürün yüklenirken hata:', err);
        setError('Ürün bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  // Ürünün sepette olup olmadığını kontrol et
  const isInCart = () => {
    return product ? cartItems.some(item => item.id === product.id) : false;
  };

  // Sepetteki miktarı getir
  const getCartQuantity = () => {
    if (!product) return 0;
    const cartItem = cartItems.find(item => item.id === product.id);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.discount_price || product.original_price,
      quantity: 1,
      image: product.image_url || 'https://placehold.co/100',
      storeName: 'Aktüel Ürünler'
    });
  };

  const handleIncreaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Kalan gün sayısını hesapla
  const calculateDaysLeft = (endDate) => {
    if (!endDate) return 0;
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error || 'Ürün bulunamadı.'}</p>
        </div>
        <Link href="/aktuel" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Aktüel Ürünler Sayfasına Dön
        </Link>
      </div>
    );
  }

  const stockIndicator = getStockIndicator(product.stock);
  const daysLeft = calculateDaysLeft(product.end_date);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-5" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="text-gray-600 hover:text-blue-600">
              Ana Sayfa
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <Link href="/aktuel" className="text-gray-600 hover:text-blue-600 ml-1 md:ml-2">
                Aktüel Ürünler
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <span className="text-gray-500 ml-1 md:ml-2 truncate max-w-xs">{product.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col md:flex-row">
        {/* Ürün Görseli */}
        <div className="md:w-1/2 mb-6 md:mb-0">
          <div className="rounded-lg overflow-hidden border border-gray-200 bg-white p-2 relative">
            <img 
              src={product.image_url || '/placeholder-product.jpg'} 
              alt={product.name} 
              className="w-full h-auto object-contain aspect-square"
            />
            
            {/* Fiyat Etiketi */}
            {product.discount_price && product.original_price && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                %{Math.round(((product.original_price - product.discount_price) / product.original_price) * 100)} İndirim
              </div>
            )}
            
            {/* Kalan Gün */}
            {daysLeft > 0 && (
              <div className="absolute bottom-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full font-semibold text-sm">
                Son {daysLeft} gün
              </div>
            )}
          </div>
        </div>

        {/* Ürün Bilgileri */}
        <div className="md:w-1/2 md:pl-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
          
          <div className="flex items-center mb-4">
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white ${stockIndicator.color}`}>
              {stockIndicator.text}
            </span>
            {product.category && (
              <span className="ml-3 text-gray-600 text-sm border border-gray-300 rounded px-2 py-1">
                {product.category}
              </span>
            )}
          </div>

          <div className="mb-5">
            {product.discount_price ? (
              <div className="flex items-center">
                <span className="text-3xl font-bold text-gray-900">{product.discount_price.toFixed(2)} ₺</span>
                <span className="ml-3 text-lg text-gray-500 line-through">{product.original_price.toFixed(2)} ₺</span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-900">{product.original_price.toFixed(2)} ₺</span>
            )}
          </div>
          
          <p className="text-gray-700 mb-5">{product.description}</p>
          
          {/* Özellikler */}
          {product.features && product.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Özellikler</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Stok Bilgisi */}
          <div className="mb-5">
            <span className="text-gray-600">Stok Durumu: </span>
            <span className="font-semibold">{product.stock} adet</span>
          </div>
          
          {/* Sepet İşlemleri */}
          {product.stock > 0 ? (
            <>
              {!isInCart() ? (
                <div className="flex items-center mb-4">
                  <div className="flex border border-gray-300 rounded mr-4">
                    <button 
                      onClick={handleDecreaseQuantity}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 border-l border-r border-gray-300 flex items-center">
                      {quantity}
                    </span>
                    <button 
                      onClick={handleIncreaseQuantity}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    Sepete Ekle
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center justify-between">
                    <div>
                      <span className="font-bold">Sepetinizde</span>
                      <span className="ml-2">{getCartQuantity()} adet</span>
                    </div>
                    <Link 
                      href="/sepet" 
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md text-sm"
                    >
                      Sepete Git
                    </Link>
                  </div>
                </div>
              )}
              
              {/* Son kullanma tarihi */}
              {product.end_date && (
                <div className="text-gray-600 text-sm">
                  Kampanya Bitiş Tarihi: {new Date(product.end_date).toLocaleDateString('tr-TR')}
                </div>
              )}
            </>
          ) : (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p className="font-bold">Bu ürün tükenmiştir.</p>
            </div>
          )}
        </div>
      </div>

      {/* İlgili Ürünler */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Benzer Ürünler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <Link href={`/aktuel/${relatedProduct.id}`} key={relatedProduct.id}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={relatedProduct.image_url || '/placeholder-product.jpg'} 
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{relatedProduct.name}</h3>
                    <div className="flex justify-between items-center">
                      {relatedProduct.discount_price ? (
                        <div>
                          <span className="font-bold text-blue-600">{relatedProduct.discount_price.toFixed(2)} ₺</span>
                          <span className="text-sm text-gray-500 line-through ml-2">{relatedProduct.original_price.toFixed(2)} ₺</span>
                        </div>
                      ) : (
                        <span className="font-bold text-blue-600">{relatedProduct.original_price.toFixed(2)} ₺</span>
                      )}
                      <span className={`inline-block w-3 h-3 rounded-full ${getStockIndicator(relatedProduct.stock).color}`}></span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 