'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import AuthGuard from '../../../components/AuthGuard';
import { mockProducts, mockStores, mockOrders } from '@/app/data/mockdatas';

export default function Reviews() {
  return (
    <AuthGuard requiredRole="any_auth">
      <ReviewsContent />
    </AuthGuard>
  );
}

function ReviewsContent() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API'den değerlendirme verilerini çekiyoruz (simülasyon)
    setTimeout(() => {
      // Bu örnekte yorumlar merkezi bir mock datadan gelmiyor.
      // Gerçek projede bu veriler veritabanından gelecek.
      // Mevcut mock verileri kullanarak ilişkili yorumlar oluşturuyoruz
      
      // Kullanıcının siparişlerini filtrele
      const userOrders = mockOrders.filter(order => order.customerId === user?.id);
      
      // Her sipariş için rastgele yorum üret (gerçek projede yorumlar veritabanından gelecek)
      const generatedReviews = userOrders
        .slice(0, 2) // Sadece 2 sipariş için yorum göster
        .map((order, index) => {
          const store = mockStores.find(s => s.id === order.storeId);
          
          return {
            id: 100 + index + 1,
            storeId: order.storeId,
            storeName: order.storeName,
            storeType: order.category,
            orderId: order.id,
            orderDate: order.orderDate.split('T')[0],
            rating: 4 + (index % 2), // 4 veya 5
            comment: index === 0 
              ? 'Yemekler lezzetliydi fakat servis biraz geç geldi.' 
              : 'Ürünler taze ve zamanında teslim edildi. Teşekkürler!',
            photos: [],
            date: new Date(new Date(order.orderDate).getTime() + 2*24*60*60*1000).toISOString().split('T')[0], // 2 gün sonra
            likes: 3 + (index * 4)
          };
        });
      
      setReviews(generatedReviews);
      setLoading(false);
    }, 1000);
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Değerlendirmelerim</h1>
        <Link
          href="/profil/siparisler"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <span>Siparişlerim</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Henüz değerlendirme yapmadınız</h3>
          <p className="text-gray-600 mb-4">Satın aldığınız ürünler hakkında görüşlerinizi paylaşabilirsiniz.</p>
          <Link
            href="/profil/siparisler"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Siparişlerimi Değerlendir
          </Link>
          </div>
        ) : (
        <div className="space-y-6">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
        <div className="flex items-center justify-between mb-4">
                  <div>
            <div className="flex items-center">
              <span className="text-lg font-semibold">{review.storeName}</span>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                {review.storeType}
                          </span>
            </div>
            <p className="text-gray-600 text-sm">
              Sipariş tarihi: {new Date(review.orderDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map(star => (
              <svg 
                key={star}
                className={`w-5 h-5 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
                  </div>
                </div>
                
        <p className="mb-4">{review.comment}</p>
        
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>{new Date(review.date).toLocaleDateString('tr-TR')}</span>
          <div className="flex items-center">
            <button className="flex items-center text-gray-600 hover:text-blue-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
              <span>{review.likes} Beğeni</span>
                  </button>
            <div className="ml-4 flex space-x-2">
              <button className="text-blue-600 hover:text-blue-800">Düzenle</button>
              <button className="text-red-600 hover:text-red-800">Sil</button>
                </div>
              </div>
            </div>
      </div>
    </div>
  );
} 