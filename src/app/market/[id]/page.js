'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { mockMarkets, mockProducts } from '@/app/data/mockdatas';
import { useCart } from '@/contexts/CartContext';

export default function MarketDetailPage() {
  const params = useParams();
  const marketId = params?.id ? parseInt(params.id) : null;
  const { addToCart, removeFromCart, cartItems } = useCart();
  
  // Dummy veri - Gerçek uygulamada API'den gelecek
  const [market, setMarket] = useState(null);
  const [marketProducts, setMarketProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [localCart, setLocalCart] = useState([]);

  // Sahte veritabanından market bilgilerini al
  useEffect(() => {
    // Gerçek uygulamada bir API isteği yapılacak
    setTimeout(() => {
      if (marketId) {
        const foundMarket = mockMarkets.find(m => m.id === marketId);
        
        if (foundMarket) {
          setMarket(foundMarket);
          
          // Market için ürünleri filtrele - Şimdi sadece bu mağazaya ait ürünleri gösteriyoruz
          const marketRelatedProducts = mockProducts.filter(p => 
            p.storeId === marketId
          );
          
          // Ürünlerin kategorilerini al
          const categories = [...new Set(marketRelatedProducts.map(p => p.category))];
          
          // Market nesnesini kategori bilgisi ile güncelle
          setMarket({
            ...foundMarket,
            categories: categories,
            products: marketRelatedProducts
          });
          
          setMarketProducts(marketRelatedProducts);
          
          // İlk kategoriyi seç
          setSelectedCategory('Tümü');
        }
      }
      setLoading(false);
    }, 500);
  }, [marketId]);

  useEffect(() => {
    // CartContext'ten bu markete ait ürünleri filtrele
    if (market) {
      const marketItems = cartItems.filter(item => 
        item.storeName === market.name
      );
      setLocalCart(marketItems);
    }
  }, [cartItems, market]);

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      storeName: market.name,
      image: item.image || 'https://placehold.co/100'
    });
  };

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
  };

  // Filtrelenmiş ürünler
  const filteredProducts = marketProducts?.filter(item => 
    selectedCategory === 'Tümü' || item.category === selectedCategory
  ) || [];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Market bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Market Bulunamadı</h2>
          <p className="text-gray-600 mb-8">Üzgünüz, aradığınız market bulunamadı.</p>
          <Link href="/market" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
            Tüm Marketler
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Geri dönüş linki */}
      <div className="mb-6">
        <Link href="/market" className="text-green-600 hover:text-green-800 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Tüm Marketler
        </Link>
      </div>
      
      {/* Market bilgisi başlık kısmı */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="h-64 bg-gray-200 relative">
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold ${market.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {market.isOpen ? 'Açık' : 'Kapalı'}
          </div>
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-gray-400">Market resmi yüklenemiyor</span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-3xl font-bold">{market.name}</h1>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <span className="mr-2">{market.type}</span>
                <span className="mr-2">⭐ {market.rating}</span>
                <span>{market.deliveryTime} teslimat</span>
              </div>
              <p className="text-gray-600 mt-2">{market.address}</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <p className="text-sm font-medium">Minimum Sipariş Tutarı</p>
                <p className="text-xl font-bold text-green-700">{market.minOrder} TL</p>
              </div>
            </div>
          </div>
          
          <p className="mt-4 text-gray-700 border-t pt-4">{market.description}</p>
        </div>
      </div>
      
      {/* Ana içerik bölümü: Ürünler ve Sepet */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Ürünler */}
        <div className="w-full lg:w-2/3">
          <h2 className="text-2xl font-bold mb-4">Ürünler</h2>
          
          {/* Kategori Filtreleri */}
          <div className="flex flex-wrap mb-6 gap-2">
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === 'Tümü' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedCategory('Tümü')}
            >
              Tümü
            </button>
            
            {market.categories && market.categories.map((category, index) => (
              <button 
                key={index}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category 
                    ? 'bg-green-600 text-white' 
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
                    <span className="text-gray-400 text-sm">Ürün resmi yüklenemiyor</span>
                  </div>
                  <h3 className="font-bold truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{product.category}</p>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-green-700">{product.price.toFixed(2)} TL</p>
                    
                    {cartItems.find(item => item.id === product.id) ? (
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
                          {cartItems.find(item => item.id === product.id).quantity}
                        </span>
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
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
      </div>
    </div>
  );
} 