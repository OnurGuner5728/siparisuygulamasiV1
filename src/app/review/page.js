'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiArrowLeft, FiStar, FiUpload, FiThumbsUp, FiXCircle } from 'react-icons/fi';

// Demo sipariş detayı
const demoOrder = {
  id: 'order123',
  storeId: 'store1',
  storeName: 'Lezzet Durağı Restoran',
  orderDate: '2023-11-15T18:30:00Z',
  deliveryTime: '19:15',
  status: 'delivered',
  totalAmount: 165.80,
  items: [
    {
      id: 'item1',
      name: 'Kral Burger Menü',
      price: 125.90,
      quantity: 1,
      options: ['Orta Boy', 'Cola']
    },
    {
      id: 'item2',
      name: 'Patates Kızartması (Büyük)',
      price: 39.90,
      quantity: 1,
      options: []
    }
  ],
  courier: {
    id: 'courier1',
    name: 'Mehmet A.',
    photo: '/images/couriers/placeholder.jpg'
  }
};

// Loading komponenti
function ReviewPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );
}

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  // Durumlar
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storeRating, setStoreRating] = useState(0);
  const [storeReview, setStoreReview] = useState('');
  const [courierRating, setCourierRating] = useState(0);
  const [courierReview, setCourierReview] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Sipariş detayını yükle
  useEffect(() => {
    // Gerçek uygulamada API'den sipariş verisi çekilir
    setLoading(true);
    
    // API çağrısı simulasyonu
    setTimeout(() => {
      // Demo amaçlı her zaman demo siparişi kullanıyoruz
      setOrder(demoOrder);
      setLoading(false);
    }, 500);
  }, [orderId]);
  
  // Resim yükleme işleyicisi
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Maksimum 3 resim kontrolü
    if (photos.length + files.length > 3) {
      alert('En fazla 3 resim yükleyebilirsiniz.');
      return;
    }
    
    // Resim önizlemesi için URL oluştur
    const newPhotos = files.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setPhotos([...photos, ...newPhotos]);
  };
  
  // Resim kaldırma işleyicisi
  const handleRemovePhoto = (photoId) => {
    setPhotos(photos.filter(photo => photo.id !== photoId));
  };
  
  // Değerlendirme gönderme işleyicisi
  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    // Validasyon: Restoran puanı
    if (storeRating === 0) {
      alert('Lütfen restoran için bir puan verin.');
      return;
    }
    
    // Validasyon: Kurye puanı (eğer kurye varsa)
    if (order.courier && courierRating === 0) {
      alert('Lütfen kurye için bir puan verin.');
      return;
    }
    
    setSubmitLoading(true);
    
    // Gerçek uygulamada API'ye değerlendirme gönderilir
    setTimeout(() => {
      console.log('Değerlendirme gönderildi:', {
        orderId: order.id,
        storeId: order.storeId,
        storeRating,
        storeReview,
        courierId: order.courier?.id,
        courierRating,
        courierReview,
        photos: photos.map(p => p.file)
      });
      
      setSubmitLoading(false);
      setSuccess(true);
      
      // Başarı durumunda yönlendirme
      setTimeout(() => {
        router.push('/profil/siparisler');
      }, 2000);
    }, 1500);
  };
  
  // Yıldız derecelendirme bileşeni
  const StarRating = ({ rating, setRating, size = 28 }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none"
          >
            <FiStar
              size={size}
              className={`${
                star <= rating
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-300'
              } mr-1`}
            />
          </button>
        ))}
      </div>
    );
  };
  
  // Eğer yükleniyor durumundaysa
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  // Eğer sipariş bulunamadıysa
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiXCircle className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Sipariş bulunamadı</h3>
          <p className="text-gray-500 mb-6">Bu sipariş artık mevcut değil veya erişiminiz yok.</p>
          <button
            onClick={() => router.push('/profil/siparisler')}
            className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-700"
          >
            Siparişlerime Dön
          </button>
        </div>
      </div>
    );
  }
  
  // Başarı durumunda
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiThumbsUp className="text-green-500 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Değerlendirmeniz için teşekkürler!</h3>
          <p className="text-gray-500 mb-6">Yorumunuz başarıyla kaydedildi.</p>
          <p className="text-sm text-gray-500">Siparişler sayfasına yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Başlık */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              className="mr-3 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              aria-label="Geri"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Siparişi Değerlendir</h1>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 pb-32">
        <form onSubmit={handleSubmitReview}>
          {/* Sipariş Özeti */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h2 className="font-medium text-gray-800 mb-3">{order.storeName}</h2>
            <div className="flex justify-between text-sm text-gray-500 mb-3">
              <span>Sipariş No: #{order.id}</span>
              <span>{new Date(order.orderDate).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-2">
                  <div className="flex justify-between">
                    <div className="flex">
                      <span className="font-medium text-gray-700">{item.quantity}x</span>
                      <span className="ml-2 text-gray-800">{item.name}</span>
                    </div>
                    <span className="text-gray-700">{item.price.toFixed(2)} TL</span>
                  </div>
                  {item.options.length > 0 && (
                    <div className="text-xs text-gray-500 pl-5 mt-1">
                      {item.options.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between font-medium">
              <span>Toplam</span>
              <span>{order.totalAmount.toFixed(2)} TL</span>
            </div>
          </div>
          
          {/* Restoran Değerlendirmesi */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h2 className="font-medium text-gray-800 mb-4">Restoran Değerlendirmesi</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puanınız <span className="text-red-500">*</span>
              </label>
              <StarRating rating={storeRating} setRating={setStoreRating} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yorumunuz
              </label>
              <textarea
                value={storeReview}
                onChange={(e) => setStoreReview(e.target.value)}
                placeholder="Yemekler, servis kalitesi, paketleme vb. hakkında deneyiminizi yazın..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows="3"
              ></textarea>
            </div>
          </div>
          
          {/* Kurye Değerlendirmesi (eğer kurye varsa) */}
          {order.courier && (
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <h2 className="font-medium text-gray-800 mb-4">Kurye Değerlendirmesi</h2>
              
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 rounded-full">
                    <span className="text-xs">Foto</span>
                  </div>
                </div>
                <span className="ml-3 text-gray-800">{order.courier.name}</span>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Puanınız <span className="text-red-500">*</span>
                </label>
                <StarRating rating={courierRating} setRating={setCourierRating} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yorumunuz
                </label>
                <textarea
                  value={courierReview}
                  onChange={(e) => setCourierReview(e.target.value)}
                  placeholder="Kurye, teslimat hızı ve hizmeti hakkında deneyiminizi yazın..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows="3"
                ></textarea>
              </div>
            </div>
          )}
          
          {/* Fotoğraf Yükleme */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h2 className="font-medium text-gray-800 mb-4">Fotoğraf Ekleyin (İsteğe Bağlı)</h2>
            
            <p className="text-sm text-gray-500 mb-4">
              Siparişinize ait fotoğraflar ekleyebilirsiniz. En fazla 3 fotoğraf yükleyebilirsiniz.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                  <img src={photo.preview} alt="Yüklenen fotoğraf" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md text-gray-600 hover:text-gray-900"
                  >
                    <FiXCircle size={16} />
                  </button>
                </div>
              ))}
              
              {photos.length < 3 && (
                <label className="flex flex-col items-center justify-center w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 dark:bg-gray-900">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="text-gray-400 mb-1" size={20} />
                    <p className="text-xs text-gray-500">Yükle</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handlePhotoUpload}
                    multiple
                  />
                </label>
              )}
            </div>
            
            <p className="text-xs text-gray-500">
              Fotoğraflar en fazla 5MB boyutunda olmalıdır. Kabul edilen formatlar: JPG, PNG.
            </p>
          </div>
        </form>
      </div>
      
      {/* Alt Butonlar (Sabit) */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4">
        <button
          type="submit"
          onClick={handleSubmitReview}
          disabled={submitLoading}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-3 px-4 rounded-lg shadow-sm hover:from-orange-600 hover:to-red-700 flex items-center justify-center"
        >
          {submitLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Gönderiliyor...
            </>
          ) : (
            'Değerlendirmeyi Gönder'
          )}
        </button>
      </div>
    </div>
  );
}

// Ana bileşeni Suspense ile sarıyoruz
export default function ReviewPage() {
  return (
    <Suspense fallback={<ReviewPageLoading />}>
      <ReviewContent />
    </Suspense>
  );
} 
