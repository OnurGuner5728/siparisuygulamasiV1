'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

export default function AktuelProductDetailPage() {
  const params = useParams();
  const productId = params.id;
  
  // useCart hook'unu doğrudan çağırıyoruz - React Hook kuralları gereği koşulsuz olmalı
  const cartFunctions = useCart();
  
  // Hata yönetimini hook çağrısı sonrası yapıyoruz
  const addToCart = cartFunctions?.addToCart || (() => {});
  const removeFromCart = cartFunctions?.removeFromCart || (() => {});
  const cartItems = cartFunctions?.cartItems || [];
  
  // Dummy veri - Gerçek uygulamada API'den gelecek
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // Sahte veritabanından ürün bilgilerini al
  useEffect(() => {
    // Gerçek uygulamada bir API isteği yapılacak
    const mockProducts = [
      { 
        id: 1, 
        name: 'Bluetooth Kablosuz Kulaklık', 
        image: '/aktuel1.jpg', 
        originalPrice: 699.90, 
        discountPrice: 399.90, 
        stock: 150,
        endDate: '2023-07-15',
        category: 'Elektronik',
        description: 'En son teknoloji ile üretilen kablosuz kulaklık. 20 saat pil ömrü, aktif gürültü engelleme ve yüksek ses kalitesi.',
        features: [
          'Bluetooth 5.0',
          'Aktif Gürültü Engelleme',
          '20 saat pil ömrü',
          'Hızlı şarj desteği',
          'Su sıçramalarına dayanıklı'
        ],
        relatedProducts: [3, 5, 6] // Diğer ilgili ürünlerin ID'leri
      },
      { 
        id: 2, 
        name: 'Çok Fonksiyonlu Mutfak Robotu', 
        image: '/aktuel2.jpg', 
        originalPrice: 2499.90, 
        discountPrice: 1699.90, 
        stock: 50,
        endDate: '2023-07-12',
        category: 'Ev Gereçleri',
        description: 'Mutfakta işlerinizi kolaylaştıracak 10 farklı fonksiyona sahip mutfak robotu. Karıştırma, doğrama, rendeleme ve daha fazlası.',
        features: [
          '1200W güçlü motor',
          '10 farklı fonksiyon',
          '5L kapasiteli kase',
          'Paslanmaz çelik bıçaklar',
          'Kolay temizlenebilir parçalar'
        ],
        relatedProducts: [4, 7, 8]
      },
      { 
        id: 3, 
        name: 'Akıllı Bileklik', 
        image: '/aktuel3.jpg', 
        originalPrice: 899.90, 
        discountPrice: 599.90, 
        stock: 75,
        endDate: '2023-07-18',
        category: 'Elektronik',
        description: 'Sağlık verilerinizi takip etmenize yardımcı olan akıllı bileklik. Kalp atış hızı, adım sayısı ve uyku kalitesi ölçümü.',
        features: [
          'Renkli OLED ekran',
          'Kalp atış hızı sensörü',
          'Su geçirmez tasarım',
          '7 gün pil ömrü',
          'Akıllı telefon bildirimleri'
        ],
        relatedProducts: [1, 5, 6]
      },
      { 
        id: 4, 
        name: 'Otomatik Kahve Makinesi', 
        image: '/aktuel4.jpg', 
        originalPrice: 3999.90, 
        discountPrice: 2899.90, 
        stock: 25,
        endDate: '2023-07-11',
        category: 'Ev Gereçleri',
        description: 'Tek dokunuşla profesyonel kahveler hazırlayabileceğiniz tam otomatik kahve makinesi. Espresso, cappuccino ve latte seçenekleri.',
        features: [
          'LCD dokunmatik ekran',
          'Entegre öğütücü',
          'Ayarlanabilir kahve sertliği',
          'Otomatik temizleme',
          'Programlanabilir ön ayarlar'
        ],
        relatedProducts: [2, 7, 8]
      },
      { 
        id: 5, 
        name: 'Kablosuz Şarj Cihazı', 
        image: '/aktuel5.jpg', 
        originalPrice: 499.90, 
        discountPrice: 299.90, 
        stock: 100,
        endDate: '2023-07-20',
        category: 'Elektronik',
        description: 'Tüm kablosuz şarj destekli telefonlar ile uyumlu hızlı şarj cihazı. Şık tasarımı ile her mekana uyum sağlar.',
        features: [
          '15W hızlı şarj desteği',
          'Çoklu cihaz desteği',
          'LED gösterge',
          'Aşırı şarj koruması',
          'İnce ve şık tasarım'
        ],
        relatedProducts: [1, 3, 6]
      },
      { 
        id: 6, 
        name: 'LED Işıklı Gaming Mouse', 
        image: '/aktuel6.jpg', 
        originalPrice: 799.90, 
        discountPrice: 449.90, 
        stock: 80,
        endDate: '2023-07-14',
        category: 'Bilgisayar',
        description: 'Oyun deneyiminizi bir üst seviyeye taşıyacak yüksek DPI sensörlü gaming mouse. Özelleştirilebilir LED ışıklandırma.',
        features: [
          '16000 DPI optik sensör',
          '8 programlanabilir buton',
          'RGB LED aydınlatma',
          'Ergonomik tasarım',
          'Ayarlanabilir ağırlık sistemi'
        ],
        relatedProducts: [1, 3, 5]
      },
      { 
        id: 7, 
        name: 'Elektrikli Izgara', 
        image: '/aktuel7.jpg', 
        originalPrice: 1599.90, 
        discountPrice: 999.90, 
        stock: 60,
        endDate: '2023-07-13',
        category: 'Ev Gereçleri',
        description: 'Sağlıklı yemekler pişirmek için idealdir. Yağ akıtma sistemi sayesinde az yağlı yemekler hazırlayabilirsiniz.',
        features: [
          '2000W güç',
          'Yapışmaz yüzey',
          'Ayarlanabilir sıcaklık',
          'Kolay temizlenebilir',
          'Geniş pişirme yüzeyi'
        ],
        relatedProducts: [2, 4, 8]
      },
      { 
        id: 8, 
        name: 'Akıllı Robot Süpürge', 
        image: '/aktuel8.jpg', 
        originalPrice: 5999.90, 
        discountPrice: 4499.90, 
        stock: 30,
        endDate: '2023-07-16',
        category: 'Ev Gereçleri',
        description: 'Evinizi temizlemek için ideal robot süpürge. Akıllı haritalandırma sistemi ve uzaktan kontrol özelliği.',
        features: [
          'LiDAR haritalandırma',
          'Mobil uygulama kontrolü',
          '3 saate kadar çalışma süresi',
          'Otomatik şarj istasyonuna dönüş',
          'Çoklu oda temizleme'
        ],
        relatedProducts: [2, 4, 7]
      },
    ];

    setTimeout(() => {
      const foundProduct = mockProducts.find(p => p.id.toString() === productId);
      
      if (foundProduct) {
        // İlgili ürünleri de getir
        const relatedProductsData = foundProduct.relatedProducts.map(id => 
          mockProducts.find(p => p.id === id)
        ).filter(Boolean);
        
        setProduct({ ...foundProduct, relatedProductsData });
      } else {
        setProduct(null);
      }
      
      setLoading(false);
    }, 500); // Gerçek API çağrısını simüle etmek için kısa gecikme
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
      price: product.discountPrice,
      quantity: 1,
      image: product.image || 'https://placehold.co/100',
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
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Ürün bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Ürün Bulunamadı</h2>
          <p className="text-gray-600 mb-8">Üzgünüz, aradığınız ürün bulunamadı veya satıştan kaldırılmış olabilir.</p>
          <Link href="/aktuel" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">
            Tüm Aktüel Ürünler
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Geri dönüş linki */}
      <div className="mb-6">
        <Link href="/aktuel" className="text-purple-600 hover:text-purple-800 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Tüm Aktüel Ürünler
        </Link>
      </div>
      
      {/* Ürün detay kartı */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Ürün görsel alanı */}
          <div className="md:w-2/5 bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full h-80 relative">
              {calculateDaysLeft(product.endDate) <= 3 && (
                <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1 text-sm font-bold z-10">
                  Son {calculateDaysLeft(product.endDate)} Gün
                </div>
              )}
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400">Ürün görseli yüklenemiyor</span>
              </div>
            </div>
          </div>
          
          {/* Ürün bilgi alanı */}
          <div className="md:w-3/5 p-6">
            <div className="flex flex-wrap justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-800 mb-2 mr-4">{product.name}</h1>
              <div className={`${getStockIndicator(product.stock).color} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                {getStockIndicator(product.stock).text}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className="text-3xl font-bold text-purple-700">{product.discountPrice.toFixed(2)} TL</span>
                <span className="ml-3 text-lg text-gray-500 line-through">{product.originalPrice.toFixed(2)} TL</span>
                <span className="ml-3 bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-bold">
                  %{Math.round((1 - product.discountPrice / product.originalPrice) * 100)} İndirim
                </span>
              </div>
              
              <p className="text-sm text-gray-500">
                Kampanya Bitiş: {new Date(product.endDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            <p className="text-gray-600 mb-6">{product.description}</p>
            
            <div className="mb-6">
              <h3 className="font-bold text-gray-700 mb-2">Özellikler</h3>
              <ul className="list-disc pl-5 text-gray-600">
                {product.features.map((feature, index) => (
                  <li key={index} className="mb-1">{feature}</li>
                ))}
              </ul>
            </div>
            
            {isInCart() ? (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Sepetinizde</p>
                    <p className="font-bold text-purple-700">{getCartQuantity()} adet</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => removeFromCart(product.id)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                    >
                      -1
                    </button>
                    <Link 
                      href="/sepet"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
                    >
                      Sepete Git
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleAddToCart}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-full flex-1 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={product?.stock <= 0 || !product}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Sepete Ekle ({(product?.discountPrice * quantity).toFixed(2)} TL)</span>
                </button>
                
                <Link href="/checkout" className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-2 px-6 rounded-full flex-1 flex items-center justify-center gap-2 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Hemen Satın Al</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* İlgili ürünler */}
      {product.relatedProductsData && product.relatedProductsData.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Benzer Ürünler</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.relatedProductsData.map(relatedProduct => (
              <Link href={`/aktuel/${relatedProduct.id}`} key={relatedProduct.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Ürün görseli yüklenemiyor</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2 truncate">{relatedProduct.name}</h3>
                  <div className="flex items-center mb-2">
                    <span className="text-lg font-bold text-purple-700">{relatedProduct.discountPrice.toFixed(2)} TL</span>
                    <span className="ml-2 text-sm text-gray-500 line-through">{relatedProduct.originalPrice.toFixed(2)} TL</span>
                  </div>
                  <div className={`${getStockIndicator(relatedProduct.stock).color} text-white px-2 py-0.5 rounded-full text-xs inline-block`}>
                    {getStockIndicator(relatedProduct.stock).text}
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