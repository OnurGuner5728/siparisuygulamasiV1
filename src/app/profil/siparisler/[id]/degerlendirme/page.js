'use client';

import React, { useState, useEffect, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import { FiStar, FiArrowLeft, FiUser, FiCheck } from 'react-icons/fi';

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
        
        if (!orderData || orderData.user_id !== user.id) {
          setError('Bu sipariş için değerlendirme yapma yetkiniz yok.');
          return;
        }
        
        // Sadece teslim edilmiş siparişler değerlendirilebilir
        if (orderData.status !== 'delivered') {
          setError('Sadece teslim edilmiş siparişleri değerlendirebilirsiniz.');
          return;
        }
        
        setOrder(orderData);
        
        // Mevcut değerlendirme var mı kontrol et (sipariş bazlı)
        const existingReviewData = await api.getUserReviewForOrder(user.id, orderData.id);
        if (existingReviewData) {
          setExistingReview(existingReviewData);
          setRating(existingReviewData.rating);
          setComment(existingReviewData.comment || '');
        }
        
      } catch (err) {
        console.error('Sipariş ve değerlendirme yüklenirken hata:', err.message || err);
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
      
      let newReview = null;
      
      if (existingReview) {
        // Mevcut değerlendirmeyi güncelle
        newReview = await api.updateReview(existingReview.id, {
          rating: rating,
          comment: comment.trim()
        });
      } else {
        // Yeni değerlendirme oluştur
        newReview = await api.createReview(reviewData);
      }
      
      // Mağaza rating'ini güncelle
      await api.updateStoreRating(order.store_id);
      
      // Mağaza sahibine bildirim gönder (sadece yeni değerlendirmeler için)
      if (!existingReview) {
        try {
          // Mağaza bilgilerini al (owner_id için)
          const storeData = await api.getStoreById(order.store_id);
          
          if (storeData?.owner_id && storeData.owner_id !== user.id) {
            await api.createNotification({
              user_id: storeData.owner_id,
              type: 'new_review',
              title: 'Yeni Değerlendirme',
              message: `${user.name || 'Bir müşteri'} mağazanız için ${rating} yıldızlı bir değerlendirme yaptı.`,
              data: {
                review_id: newReview.id,
                order_id: order.id,
                store_id: order.store_id,
                store_name: order.store?.name || storeData.name,
                rating: rating,
                customer_name: user.name || 'Anonim Müşteri'
              }
            });
          }
        } catch (notificationError) {
          console.warn('Mağaza sahibine bildirim gönderilirken hata:', notificationError.message || notificationError);
        }
      }
      
      setSuccess(true);
      
      // 2 saniye sonra sipariş detayına yönlendir
      setTimeout(() => {
        router.push(`/profil/siparisler/${params.id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Değerlendirme kaydedilirken hata:', error.message || error);
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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-orange-600 text-white p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">
                {existingReview ? 'Değerlendirmeni Güncelle' : 'Siparişini Değerlendir'}
              </h1>
              <Link 
                href={`/profil/siparisler/${params.id}`}
                className="text-white hover:text-orange-200 transition-colors"
              >
                <FiArrowLeft size={24} />
              </Link>
            </div>
          </div>

          {/* Sipariş Bilgileri */}
          {order && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 text-orange-600 rounded-full p-3 mr-4">
                  <FiCheck size={24} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{order.store?.name || 'Bilinmeyen Mağaza'}</h2>
                  <p className="text-gray-600 text-sm">
                    Sipariş No: #{order.id.substring(0, 8)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Sipariş Tarihi:</span>
                  <p className="font-medium">
                    {new Date(order.order_date).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Toplam Tutar:</span>
                  <p className="font-medium">{order.total_amount.toFixed(2).replace('.', ',')} TL</p>
                </div>
              </div>
            </div>
          )}

          {/* Değerlendirme Formu */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Puan Verme */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Mağazayı puanla
              </label>
              <div className="flex items-center justify-center space-x-2 py-4">
                {renderStars(true)}
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                {rating === 0 ? 'Lütfen bir puan verin' : 
                 rating === 1 ? 'Çok Kötü' :
                 rating === 2 ? 'Kötü' :
                 rating === 3 ? 'Orta' :
                 rating === 4 ? 'İyi' : 'Mükemmel'}
              </p>
            </div>

            {/* Yorum Yazma */}
            <div className="mb-6">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Yorumun
              </label>
              <textarea
                id="comment"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="Siparişin hakkında düşüncelerini paylaş..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Deneyimini detaylı anlat ki diğer kullanıcılara yardımcı ol.
                </p>
                <span className="text-xs text-gray-400">
                  {comment.length}/500
                </span>
              </div>
            </div>

            {/* Gönderme Butonu */}
            <button
              type="submit"
              disabled={submitting || rating === 0 || !comment.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              {submitting ? 'Kaydediliyor...' : (existingReview ? 'Güncelle' : 'Değerlendirmeyi Kaydet')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 