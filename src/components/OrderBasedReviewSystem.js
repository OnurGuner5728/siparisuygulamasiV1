'use client';

import { useState, useEffect } from 'react';
import { FiStar, FiMessageSquare, FiUser, FiCalendar, FiFilter, FiPlus } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';

const OrderBasedReviewSystem = ({ storeId, orderId = null, showHeader = true }) => {
  const { user, isAuthenticated } = useAuth();
  const [showAddReview, setShowAddReview] = useState(false);
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [userReviewableOrders, setUserReviewableOrders] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reviews'u yükle
  const loadReviews = async () => {
    try {
      setLoading(true);
      
      // Eğer orderId varsa, o siparişin yorumunu getir
      const reviewsData = orderId 
        ? await api.getOrderReviews(orderId)
        : await api.getReviews({ store_id: storeId });
      
      setAllReviews(reviewsData || []);
      
      // Kullanıcının değerlendirme yapabileceği siparişleri de yükle
      if (isAuthenticated && user && !orderId) {
        const reviewableOrders = await api.getUserReviewableOrders(user.id);
        // Sadece bu mağazaya ait siparişleri filtrele
        const storeOrders = reviewableOrders.filter(order => order.store_id === storeId);
        setUserReviewableOrders(storeOrders);
      }
    } catch (error) {
      console.error('Reviews yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) {
      loadReviews();
    }
  }, [storeId, orderId, isAuthenticated, user]);

  // Filtrelenmiş ve sıralanmış yorumlar
  const reviews = allReviews
    .filter(review => {
      // Artık sadece store review'lar var ve order_id gerekli
      if (!review.order_id) return false;
      
      // Rating filtresi
      if (filterRating === 'all') return true;
      return review.rating === parseInt(filterRating);
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

  // İstatistikleri hesapla
  const calculateStats = () => {
    if (reviews.length === 0) return { averageRating: 0, ratingCounts: [0, 0, 0, 0, 0] };
    
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = total / reviews.length;
    
    const ratingCounts = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      ratingCounts[review.rating - 1]++;
    });
    
    return { averageRating, ratingCounts };
  };

  const { averageRating, ratingCounts } = calculateStats();

  const handleAddReview = async (reviewData) => {
    try {
      // Mağaza sahibinin kendi mağazasına yorum yazmasını engelle
      if (user?.storeInfo?.id === storeId) {
        alert('Kendi mağazanıza yorum yazamazsınız.');
        return;
      }

      // Order ID kontrolü - artık zorunlu
      if (!reviewData.order_id) {
        alert('Yorum yapmak için bir sipariş seçmelisiniz.');
        return;
      }

      const newReviewData = {
        user_id: user.id,
        store_id: storeId,
        order_id: reviewData.order_id,
        rating: reviewData.rating,
        title: reviewData.title || null,
        comment: reviewData.comment,
        is_anonymous: reviewData.is_anonymous || false
      };

      const result = await api.createReview(newReviewData);
      
      // State'i hemen güncelle
      setAllReviews(prev => [result, ...prev]);
      setShowAddReview(false);
      
      // Değerlendirilebilir siparişleri yeniden yükle
      const reviewableOrders = await api.getUserReviewableOrders(user.id);
      const storeOrders = reviewableOrders.filter(order => order.store_id === storeId);
      setUserReviewableOrders(storeOrders);
      
    } catch (error) {
      console.error('Error adding review:', error.message || error);
      alert(error.message || 'Yorum eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {showHeader && (
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Müşteri Değerlendirmeleri</h2>
          
          {/* İstatistikler */}
          {reviews.length > 0 && (
            <div className="bg-orange-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(averageRating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      {reviews.length} değerlendirme
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 ml-8">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center mb-1">
                      <span className="text-sm text-gray-600 w-8">{rating}</span>
                      <FiStar className="w-3 h-3 text-yellow-400 fill-current mx-1" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{
                            width: `${reviews.length > 0 ? (ratingCounts[rating - 1] / reviews.length) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">
                        {ratingCounts[rating - 1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filtreler */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <FiFilter className="w-4 h-4 text-gray-400" />
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">Tüm Puanlar</option>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} Yıldız ({ratingCounts[rating - 1]})
                  </option>
                ))}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="newest">En Yeni</option>
              <option value="oldest">En Eski</option>
              <option value="highest">En Yüksek Puan</option>
              <option value="lowest">En Düşük Puan</option>
            </select>
          </div>

          {/* Yorum Ekleme Butonu */}
          {isAuthenticated && user && userReviewableOrders.length > 0 && (
            <button
              onClick={() => setShowAddReview(true)}
              className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              <span>Değerlendirme Yap</span>
            </button>
          )}
        </div>
      )}

      {/* Yorumlar Listesi */}
      <div className="p-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <FiStar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz değerlendirme yok
            </h3>
            <p className="text-gray-500">
              Bu mağaza için henüz müşteri değerlendirmesi bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>

      {/* Yorum Ekleme Modalı */}
      {showAddReview && (
        <ReviewModal
          storeId={storeId}
          userReviewableOrders={userReviewableOrders}
          onClose={() => setShowAddReview(false)}
          onSubmit={handleAddReview}
        />
      )}
    </div>
  );
};

// Review Kartı Componenti
const ReviewCard = ({ review }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <FiUser className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">
              {review.is_anonymous ? 'Anonim Müşteri' : (review.users?.name || 'Müşteri')}
            </h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FiCalendar className="w-4 h-4" />
              <span>{formatDate(review.created_at)}</span>
              {review.orders && (
                <>
                  <span>•</span>
                  <span>Sipariş #{review.orders.order_number}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <FiStar
              key={star}
              className={`w-4 h-4 ${
                star <= review.rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {review.title && (
        <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
      )}

      <p className="text-gray-700 leading-relaxed">{review.comment}</p>

      {/* Store Response */}
      {review.review_responses && review.review_responses.length > 0 && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <FiMessageSquare className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-gray-900">Mağaza Yanıtı</span>
                <span className="text-xs text-gray-500">
                  {formatDate(review.review_responses[0].created_at)}
                </span>
              </div>
              <p className="text-gray-700 text-sm">
                {review.review_responses[0].response_text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Review Modal Componenti
const ReviewModal = ({ storeId, userReviewableOrders, onClose, onSubmit }) => {
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedOrderId) {
      alert('Lütfen bir sipariş seçin.');
      return;
    }
    
    if (rating === 0) {
      alert('Lütfen bir puan verin.');
      return;
    }
    
    if (!comment.trim()) {
      alert('Lütfen yorumunuzu yazın.');
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData = {
        order_id: selectedOrderId,
        rating,
        title: title.trim() || null,
        comment: comment.trim(),
        is_anonymous: isAnonymous
      };

      await onSubmit(reviewData);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Yorum gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Değerlendirme Yap
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sipariş Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hangi siparişiniz için değerlendirme yapıyorsunuz? *
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Sipariş seçin...</option>
                {userReviewableOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    #{order.order_number} - {order.total_amount.toFixed(2)} TL 
                    ({new Date(order.created_at).toLocaleDateString('tr-TR')})
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puanınız *
              </label>
              <div className="flex items-center text-2xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="cursor-pointer hover:scale-110 transition-transform duration-200"
                    onClick={() => setRating(star)}
                  >
                    <FiStar
                      className={`${
                        star <= rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      } transition-colors duration-200`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {rating === 5 && 'Mükemmel!'}
                  {rating === 4 && 'Çok İyi'}
                  {rating === 3 && 'İyi'}
                  {rating === 2 && 'Ortalama'}
                  {rating === 1 && 'Kötü'}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlık (Opsiyonel)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Yorumunuz için kısa bir başlık..."
                maxLength={100}
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yorumunuz *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="Deneyiminizi diğer müşterilerle paylaşın..."
                maxLength={500}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length}/500 karakter
              </p>
            </div>

            {/* Anonymous Option */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Anonim olarak yorum yap
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || rating === 0 || !selectedOrderId}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderBasedReviewSystem; 