'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import { FiStar, FiArrowLeft, FiUser, FiCheck } from 'react-icons/fi';
import { use } from 'react';

export default function OrderReviewPage({ params: promiseParams }) {
  return (
    <AuthGuard requiredRole="any_auth">
      <OrderReviewContent promiseParams={promiseParams} />
    </AuthGuard>
  );
}

function OrderReviewContent({ promiseParams }) {
  const params = use(promiseParams);
  const router = useRouter();
  const { user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Değerlendirme form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const fetchOrderAndReview = async () => {
      if (!params.id || !user?.id) return;
      
      try {
        setLoading(true);
        
        // Sipariş bilgilerini al
        const orderData = await api.getOrderById(params.id);
        
        if (!orderData || orderData.customer_id !== user.id) {
          setError('Bu sipariş için değerlendirme yapma yetkiniz yok.');
          return;
        }
        
        // Sadece teslim edilmiş siparişler değerlendirilebilir
        if (orderData.status !== 'delivered') {
          setError('Sadece teslim edilmiş siparişleri değerlendirebilirsiniz.');
          return;
        }
        
        setOrder(orderData);
        
        // Mevcut değerlendirme var mı kontrol et
        const existingReviewData = await api.getUserReviewForStore(user.id, orderData.store_id);
        if (existingReviewData) {
          setExistingReview(existingReviewData);
          setRating(existingReviewData.rating);
          setComment(existingReviewData.comment || '');
        }
        
      } catch (err) {
        console.error('Sipariş ve değerlendirme yüklenirken hata:', err);
        setError('Bilgiler yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndReview();
  }, [params.id, user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Lütfen bir puan verin.');
      return;
    }
    
    if (!comment.trim()) {
      alert('Lütfen bir yorum yazın.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const reviewData = {
        user_id: user.id,
        store_id: order.store_id,
        order_id: order.id,
        rating: rating,
        comment: comment.trim()
      };
      
      if (existingReview) {
        // Mevcut değerlendirmeyi güncelle
        await api.updateReview(existingReview.id, {
          rating: rating,
          comment: comment.trim()
        });
      } else {
        // Yeni değerlendirme oluştur
        await api.createReview(reviewData);
      }
      
      // Mağaza rating'ini güncelle
      await api.updateStoreRating(order.store_id);
      
      setSuccess(true);
      
      // 2 saniye sonra sipariş detayına yönlendir
      setTimeout(() => {
        router.push(`/profil/siparisler/${params.id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Değerlendirme kaydedilirken hata:', error);
      alert('Değerlendirme kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          size={32}
          className={`cursor-pointer transition-colors duration-200 ${
            i <= (interactive ? (hoverRating || rating) : rating)
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          }`}
          onClick={interactive ? () => setRating(i) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <FiUser className="w-16 h-16 text-gray-400 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Değerlendirme Yapılamıyor</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/profil/siparisler"
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md inline-flex items-center"
          >
            <FiArrowLeft className="mr-2" size={16} />
            Siparişlerime Dön
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <FiCheck className="w-16 h-16 text-green-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {existingReview ? 'Değerlendirme Güncellendi!' : 'Değerlendirme Kaydedildi!'}
          </h2>
          <p className="text-gray-600 mb-6">
            Değerlendirmeniz başarıyla {existingReview ? 'güncellendi' : 'kaydedildi'}. 
            Yönlendiriliyorsunuz...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/profil/siparisler/${params.id}`}
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4"
          >
            <FiArrowLeft className="mr-2" size={16} />
            Sipariş Detayına Dön
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {existingReview ? 'Değerlendirmeni Güncelle' : 'Siparişini Değerlendir'}
          </h1>
          <p className="text-gray-600">
            Sipariş No: #{order.id.substring(0, 8)} - {order.store?.name}
          </p>
        </div>

        {/* Sipariş Özeti */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Özeti</h3>
          
          <div className="space-y-2">
            {order.order_items?.slice(0, 3).map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.name}
                </span>
                <span className="text-gray-900 font-medium">
                  {(item.total || 0).toFixed(2)} TL
                </span>
              </div>
            ))}
            
            {order.order_items?.length > 3 && (
              <div className="text-sm text-gray-500 italic">
                +{order.order_items.length - 3} ürün daha...
              </div>
            )}
            
            <div className="pt-2 border-t border-gray-200 flex justify-between font-semibold">
              <span>Toplam</span>
              <span>{order.total.toFixed(2)} TL</span>
            </div>
          </div>
        </div>

        {/* Değerlendirme Formu */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Puan Verme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Mağazaya Kaç Puan Veriyorsun?
              </label>
              <div className="flex items-center space-x-1">
                {renderStars(true)}
              </div>
              {rating > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {rating === 1 && "Çok kötü"}
                  {rating === 2 && "Kötü"}
                  {rating === 3 && "Orta"}
                  {rating === 4 && "İyi"}
                  {rating === 5 && "Mükemmel"}
                </p>
              )}
            </div>

            {/* Yorum */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Yorumun
              </label>
              <textarea
                id="comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Siparişin ve mağaza hakkındaki deneyimini paylaş..."
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Minimum 10 karakter gereklidir
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Link
                href={`/profil/siparisler/${params.id}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                İptal
              </Link>
              
              <button
                type="submit"
                disabled={submitting || rating === 0 || comment.trim().length < 10}
                className="px-6 py-2 bg-orange-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Kaydediliyor...' : (existingReview ? 'Güncelle' : 'Değerlendirmeyi Kaydet')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 