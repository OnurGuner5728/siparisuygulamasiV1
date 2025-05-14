'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AktuelProductDetailPage() {
  const params = useParams();
  const productId = params.id;
  
  // Dummy veri - Gerçek uygulamada API'den gelecek
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

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

  // Ürün miktarını arttır
  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  // Ürün miktarını azalt
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Sepete ekle
  const addToCart = () => {
    setAddedToCart(true);
    
    // Gerçek uygulamada burada API'ye sepete ekleme isteği yapılır
    
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

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

  // Stok ve son tarih bilgileri
  const stockStatus = getStockIndicator(product.stock);
  const daysLeft = calculateDaysLeft(product.endDate);
  const discountPercentage = Math.round((product.originalPrice - product.discountPrice) / product.originalPrice * 100);

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
      
      {/* Ürün detay bölümü */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          {/* Ürün resmi */}
          <div className="md:w-1/2 h-96 bg-gray-200 relative">
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold text-white ${stockStatus.color}`}>
              {stockStatus.text}
            </div>
            <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-bold">
              {discountPercentage}% İndirim
            </div>
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-gray-400">Ürün resmi yüklenemiyor</span>
            </div>
          </div>
          
          {/* Ürün bilgileri */}
          <div className="md:w-1/2 p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-500">{product.category}</p>
              <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-purple-700 mr-2">{product.discountPrice.toFixed(2)} TL</span>
                <span className="text-lg text-gray-500 line-through">{product.originalPrice.toFixed(2)} TL</span>
              </div>
              <div className="mt-1">
                <span className="text-sm text-red-600 font-medium">
                  Kampanya bitimine son {daysLeft} gün!
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">{product.description}</p>
            
            <div className="border-t border-b py-4 mb-6">
              <h3 className="font-bold mb-2">Özellikler</h3>
              <ul className="list-disc pl-5 space-y-1">
                {product.features.map((feature, index) => (
                  <li key={index} className="text-gray-700">{feature}</li>
                ))}
              </ul>
            </div>
            
            {product.stock > 0 ? (
              <div>
                <div className="flex items-center mb-6">
                  <span className="mr-3">Adet:</span>
                  <div className="flex border border-gray-300 rounded-md">
                    <button 
                      className="px-3 py-1 border-r border-gray-300 text-gray-600 hover:bg-gray-100"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-1 border-r border-gray-300 flex items-center">{quantity}</span>
                    <button 
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      onClick={increaseQuantity}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                  <span className="ml-4 text-sm text-gray-600">Stok: {product.stock}</span>
                </div>
                
                <button 
                  className={`w-full py-3 rounded-md font-medium transition-colors ${
                    addedToCart 
                      ? 'bg-green-600 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                  onClick={addToCart}
                  disabled={addedToCart}
                >
                  {addedToCart ? 'Sepete Eklendi ✓' : 'Sepete Ekle'}
                </button>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-md border border-red-100 text-center">
                <p className="text-red-600 font-medium">Bu ürün tükenmiştir.</p>
                <p className="text-sm text-gray-600 mt-1">Yeni stok geldiğinde bilgilendirilmek için iletişime geçin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* İlgili ürünler */}
      {product.relatedProductsData && product.relatedProductsData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Benzer Ürünler</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.relatedProductsData.map(relatedProduct => {
              const relatedStockStatus = getStockIndicator(relatedProduct.stock);
              const relatedDaysLeft = calculateDaysLeft(relatedProduct.endDate);
              const relatedDiscountPercentage = Math.round((relatedProduct.originalPrice - relatedProduct.discountPrice) / relatedProduct.originalPrice * 100);
              
              return (
                <Link 
                  key={relatedProduct.id} 
                  href={`/aktuel/${relatedProduct.id}`}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="h-48 bg-gray-200 relative">
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white ${relatedStockStatus.color}`}>
                      {relatedStockStatus.text}
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold">
                      {relatedDiscountPercentage}% İndirim
                    </div>
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-gray-400">Resim yüklenemiyor</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-1">{relatedProduct.category}</p>
                    <h3 className="text-lg font-bold truncate">{relatedProduct.name}</h3>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-lg font-bold text-purple-700">{relatedProduct.discountPrice.toFixed(2)} TL</span>
                      <span className="text-sm text-gray-500 line-through">{relatedProduct.originalPrice.toFixed(2)} TL</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-sm text-red-600 font-medium">
                        Son {relatedDaysLeft} gün!
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 