'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FiStar, FiMessageSquare, FiFilter, FiCalendar, FiUser, FiEye, FiCornerUpLeft } from 'react-icons/fi';
import * as api from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

export default function StoreReviewsManagement() {
  return (
    <AuthGuard requiredRole="store">
      <ReviewsManagementContent />
    </AuthGuard>
  );
}

function ReviewsManagementContent() {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unanswered, answered
  const [sortBy, setSortBy] = useState('newest');
  const [selectedReview, setSelectedReview] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Mağaza ve yorumları yükle
  useEffect(() => {
    const loadStoreAndReviews = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        // Admin kullanıcılar için kontrol
        if (user.role === 'admin') {
          console.log('Admin kullanıcıların mağaza yorumları yok');
          setLoading(false);
          return;
        }
        
        // Mağaza bilgisini al
        const storeData = await api.getStoreByOwnerId(user.id);
        if (!storeData) {
          console.error('Mağaza bulunamadı');
          setLoading(false);
          return;
        }
        setStore(storeData);

        // Mağazanın tüm yorumlarını al
        const reviewsData = await api.getReviews({ 
          store_id: storeData.id,
          review_type: 'store'
        });
        
        // Her yorum için cevapları da yükle
        const reviewsWithResponses = await Promise.all(
          reviewsData.map(async (review) => {
            const responses = await api.getReviewResponses(review.id);
            return { ...review, responses };
          })
        );
        
        setReviews(reviewsWithResponses);
      } catch (error) {
        console.error('Veri yüklenirken hata:', error.message || error);
      } finally {
        setLoading(false);
      }
    };

    loadStoreAndReviews();
  }, [user?.id]);

  // Filtrelenmiş ve sıralanmış yorumlar
  const filteredReviews = reviews
    .filter(review => {
      if (filter === 'unanswered') {
        return !review.review_responses || review.review_responses.length === 0;
      }
      if (filter === 'answered') {
        return review.review_responses && review.review_responses.length > 0;
      }
      return true; // all
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  // Cevap gönder
  const handleSubmitResponse = async (reviewId) => {
    if (!responseText.trim()) return;

    try {
      setSubmitting(true);
      
      const newResponse = await api.createReviewResponse({
        review_id: reviewId,
        store_id: store.id,
        responder_id: user.id,
        response_text: responseText.trim()
      });

      // Reviews listesini güncelle
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, review_responses: [...(review.review_responses || []), newResponse] }
          : review
      ));
      
      // Form'u temizle ve kapat
      setResponseText('');
      setSelectedReview(null);
      
      // Bildirim gönder
      const review = reviews.find(r => r.id === reviewId);
      if (review && review.user_id !== user.id) {
        try {
          await api.createNotification({
            user_id: review.user_id,
            type: 'review_response',
            title: 'Yorumunuza Cevap Geldi',
            message: `${store.name} mağazası yorumunuza cevap verdi.`,
            data: {
              review_id: reviewId,
              response_id: newResponse.id,
              store_id: store.id,
              store_name: store.name
            }
          });
        } catch (notificationError) {
          console.warn('Bildirim gönderilirken hata:', notificationError.message || notificationError);
        }
      }
    } catch (error) {
      console.error('Cevap gönderilirken hata:', error.message || error);
      alert('Cevap gönderilirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StarRating = ({ rating }) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`text-sm ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!store) {
    // Admin kullanıcılar için özel mesaj
    if (user?.role === 'admin') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FiMessageSquare className="mx-auto text-gray-400 text-6xl mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Panel</h3>
            <p className="text-gray-600 mb-4">Bu sayfa sadece mağaza sahipleri içindir.</p>
            <div className="space-x-4">
              <Link 
                href="/admin"
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Admin Paneli
              </Link>
              <Link 
                href="/admin/stores"
                className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Mağazaları Yönet
              </Link>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Mağaza Bulunamadı</h3>
          <p className="text-gray-600">Lütfen mağaza bilgilerinizi kontrol edin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Müşteri Yorumları</h1>
              <p className="text-gray-600 mt-1">{store.name} - Tüm değerlendirmeler</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">{store.rating?.toFixed(1) || '0.0'}</div>
              <StarRating rating={Math.round(store.rating || 0)} />
              <p className="text-sm text-gray-600 mt-1">{store.review_count || 0} değerlendirme</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiMessageSquare className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Toplam Yorum</p>
                <p className="text-2xl font-semibold text-gray-900">{reviews.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FiCornerUpLeft className="text-orange-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Cevaplanmış</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {reviews.filter(r => r.review_responses && r.review_responses.length > 0).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <FiEye className="text-red-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Cevap Bekleyen</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {reviews.filter(r => !r.review_responses || r.review_responses.length === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <FiFilter className="mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 mr-2">Filtrele:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">Tüm Yorumlar</option>
                <option value="unanswered">Cevaplanmamış</option>
                <option value="answered">Cevaplanmış</option>
              </select>
            </div>

            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">Sırala:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="newest">En Yeni</option>
                <option value="oldest">En Eski</option>
                <option value="highest">En Yüksek Puan</option>
                <option value="lowest">En Düşük Puan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FiMessageSquare className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz yorum yok</h3>
              <p className="text-gray-600">Müşterilerinizden gelecek yorumları burada görebileceksiniz.</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {review.is_anonymous ? 'A' : (review.user?.name?.charAt(0) || 'U')}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-semibold text-gray-900">
                        {review.is_anonymous ? 'Anonim Müşteri' : (review.user?.name || 'Anonim Kullanıcı')}
                      </h4>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiCalendar className="mr-1" />
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StarRating rating={review.rating} />
                    {!review.review_responses?.length ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Cevap Bekliyor
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Cevaplanmış
                      </span>
                    )}
                  </div>
                </div>

                {/* Review Content */}
                {review.title && (
                  <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                )}
                <p className="text-gray-700 mb-4">{review.comment}</p>

                {/* Existing Responses */}
                {review.review_responses && review.review_responses.length > 0 && (
                  <div className="mb-4 pl-4 border-l-2 border-orange-200">
                    {review.review_responses.map((response) => (
                      <div key={response.id} className="bg-orange-50 rounded-lg p-3 mb-2">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            M
                          </div>
                          <div className="ml-2">
                            <span className="text-sm font-medium text-orange-800">
                              Mağaza Yanıtı
                            </span>
                            <div className="text-xs text-orange-600">
                              {formatDate(response.created_at)}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">{response.response_text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Response Form - Sadece cevapı olmayan ve mağaza sahibinin yazmadığı yorumlar için */}
                {selectedReview === review.id ? (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-3">Yoruma Cevap Ver:</h5>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Müşterinize profesyonel bir cevap yazın..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      rows="3"
                    />
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        onClick={() => {
                          setSelectedReview(null);
                          setResponseText('');
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                      >
                        İptal
                      </button>
                      <button
                        onClick={() => handleSubmitResponse(review.id)}
                        disabled={!responseText.trim() || submitting}
                        className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-50"
                      >
                        {submitting ? 'Gönderiliyor...' : 'Cevap Gönder'}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Sadece cevapı olmayan, mağaza sahibinin yazmadığı yorumlara cevap verilebilir
                  // ÇİFT KONTROL: Hem response array'i hem de length kontrolü
                  !review.review_responses?.length && 
                  review.user_id !== user.id && 
                  store && review.store_id === store.id && 
                  selectedReview !== review.id && (
                    <div className="border-t pt-4">
                      <button
                        onClick={() => setSelectedReview(review.id)}
                        className="flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium"
                      >
                        <FiCornerUpLeft className="mr-2" />
                        Bu Yoruma Cevap Ver
                      </button>
                    </div>
                  )
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 