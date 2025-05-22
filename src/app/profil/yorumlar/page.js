'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import ProfileSidebar from '@/components/ProfileSidebar';
import api from '@/lib/api';

export default function Reviews() {
  return (
    <AuthGuard>
      <ReviewsContent />
    </AuthGuard>
  );
}

function ReviewsContent() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Kullanıcının değerlendirmelerini getir
        const userReviews = await api.getUserReviews(user.id);
        
        // Her değerlendirme için ilgili mağaza bilgilerini getir
        const reviewsWithStoreInfo = await Promise.all(
          (userReviews || []).map(async (review) => {
            try {
              if (review.store_id) {
                const storeData = await api.getStoreById(review.store_id);
                
                return {
                  ...review,
                  storeName: storeData?.name || 'Bilinmeyen Mağaza',
                  storeType: storeData?.type || 'Genel'
                };
              }
              return {
                ...review,
                storeName: 'Bilinmeyen Mağaza',
                storeType: 'Genel'
              };
            } catch (error) {
              console.error(`Değerlendirme için mağaza bilgileri alınamadı:`, error);
              return {
                ...review,
                storeName: 'Bilinmeyen Mağaza',
                storeType: 'Genel'
              };
            }
          })
        );
        
        // Değerlendirmeleri tarihe göre sırala (en yeniden en eskiye)
        const sortedReviews = reviewsWithStoreInfo.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });
        
        setReviews(sortedReviews);
      } catch (error) {
        console.error('Değerlendirmeler yüklenirken hata:', error);
        setError('Değerlendirmeleriniz yüklenirken bir sorun oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [user]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bu değerlendirmeyi silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      await api.deleteReview(reviewId);
      
      // UI'ı güncelle
      setReviews(reviews.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error('Değerlendirme silinirken hata:', error);
      alert('Değerlendirme silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row">
            <ProfileSidebar activeTab="reviews" />
            
            <div className="md:flex-1 md:ml-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row">
            <ProfileSidebar activeTab="reviews" />
            
            <div className="md:flex-1 md:ml-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="bg-red-50 text-red-800 p-4 rounded-md">
                  {error}
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Yeniden Dene
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row">
          <ProfileSidebar activeTab="reviews" />
          
          <div className="md:flex-1 md:ml-8 mt-8 md:mt-0">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-800">Değerlendirmelerim</h1>
                <p className="text-gray-600 text-sm mt-1">Yaptığınız değerlendirmeleri görüntüleyin ve yönetin</p>
              </div>
              
              {reviews.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Henüz değerlendirme yapmadınız</h3>
                  <p className="text-gray-600 mb-4">Satın aldığınız ürünler hakkında görüşlerinizi paylaşabilirsiniz.</p>
                  <Link
                    href="/profil/siparisler"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Siparişlerimi Görüntüle
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {reviews.map(review => (
                    <ReviewCard 
                      key={review.id} 
                      review={review} 
                      onDelete={handleDeleteReview}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review, onDelete }) {
  // Formatlanmış tarihler
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };
  
  const orderDate = formatDate(review.order_date);
  const reviewDate = formatDate(review.created_at);
  
  return (
    <div className="p-6 hover:bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center">
            <span className="text-lg font-semibold">{review.storeName}</span>
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
              {review.storeType}
            </span>
          </div>
          {orderDate && (
            <p className="text-gray-600 text-sm">
              Sipariş tarihi: {orderDate}
            </p>
          )}
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
      
      {review.images && review.images.length > 0 && (
        <div className="flex mb-4 space-x-2 overflow-x-auto">
          {review.images.map((image, index) => (
            <div key={index} className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
              <img 
                src={image} 
                alt={`Değerlendirme görseli ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>{reviewDate}</span>
        <div className="flex items-center">
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span>{review.likes || 0} Beğeni</span>
          </div>
          <div className="ml-4 flex space-x-2">
            <Link 
              href={`/profil/yorumlar/${review.id}/duzenle`}
              className="text-blue-600 hover:text-blue-800"
            >
              Düzenle
            </Link>
            <button 
              onClick={() => onDelete(review.id)}
              className="text-red-600 hover:text-red-800"
            >
              Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 