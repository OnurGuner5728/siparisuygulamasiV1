'use client';

import { useState, useEffect } from 'react';
import { FiStar, FiEdit, FiTrash2, FiPlus, FiFilter, FiUser, FiCalendar, FiMoreVertical } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useReviews } from '@/hooks/useSupabaseRealtime';
import * as api from '@/lib/api';

const ReviewSystem = ({ storeId, productId = null, type = 'store' }) => {
  const { user, isAuthenticated } = useAuth();
  const [showAddReview, setShowAddReview] = useState(false);
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [editingReview, setEditingReview] = useState(null);
  const [userExistingReview, setUserExistingReview] = useState(null);

  // Real-time reviews hook
  const {
    data: allReviews,
    loading,
    error: hookError,
    insert: insertReview,
    update: updateReview,
    remove: removeReview
  } = useReviews(storeId, {
    enabled: !!storeId,
    onInsert: (newReview) => {
      console.log('Yeni yorum eklendi:', newReview);
      // Mağaza rating'ini güncelle
      api.updateStoreRating(storeId);
    },
    onUpdate: (updatedReview) => {
      console.log('Yorum güncellendi:', updatedReview);
      // Mağaza rating'ini güncelle
      api.updateStoreRating(storeId);
    },
    onDelete: (deletedReview) => {
      console.log('Yorum silindi:', deletedReview);
      // Mağaza rating'ini güncelle
      api.updateStoreRating(storeId);
      // Eğer kullanıcının kendi yorumuysa state'i temizle
      if (userExistingReview && userExistingReview.id === deletedReview.id) {
        setUserExistingReview(null);
      }
    }
  });

  // Filtrelenmiş ve sıralanmış yorumları hesapla
  const reviews = allReviews
    .filter(review => {
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

  // Kullanıcının mevcut yorumunu kontrol et
  useEffect(() => {
    if (isAuthenticated && user && storeId && allReviews.length > 0) {
      const existingReview = allReviews.find(review => review.user_id === user.id);
      setUserExistingReview(existingReview || null);
    }
  }, [allReviews, user, isAuthenticated, storeId]);

  const handleAddReview = async (reviewData) => {
    try {
      const newReviewData = {
        user_id: user.id,
        store_id: storeId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        order_id: reviewData.order_id || null
      };

      const { data: newReview, error } = await insertReview(newReviewData);
      
      if (error) throw error;
      
      setShowAddReview(false);
      setUserExistingReview(newReview);
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Yorum eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleEditReview = async (reviewData) => {
    try {
      const { data: updatedReview, error } = await updateReview(editingReview.id, {
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      
      if (error) throw error;
      
      setEditingReview(null);
      setUserExistingReview(updatedReview);
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Yorum güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;
    
    try {
      const { error } = await removeReview(reviewId);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Yorum silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const calculateStats = () => {
    if (allReviews.length === 0) return { averageRating: 0, totalReviews: 0, distribution: [] };

    const totalReviews = allReviews.length;
    const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    const distribution = Array.from({ length: 5 }, (_, i) => {
      const rating = 5 - i;
      const count = allReviews.filter(review => review.rating === rating).length;
      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
      return { rating, count, percentage };
    });

    return { averageRating, totalReviews, distribution };
  };

  const { averageRating, totalReviews, distribution } = calculateStats();

  const StarRating = ({ rating, size = 'default', interactive = false, onRatingChange }) => {
    const [hoveredRating, setHoveredRating] = useState(0);
    const sizeClass = size === 'large' ? 'text-2xl' : size === 'small' ? 'text-sm' : 'text-lg';

    return (
      <div className={`flex items-center ${sizeClass}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-200`}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          >
            <FiStar
              className={`${
                star <= (hoveredRating || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              } transition-colors duration-200`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          Değerlendirmeler ({totalReviews})
        </h3>
        {isAuthenticated && !userExistingReview && (
          <button
            onClick={() => setShowAddReview(true)}
            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
          >
            <FiPlus className="mr-2" />
            Yorum Ekle
          </button>
        )}
        {isAuthenticated && userExistingReview && (
          <button
            onClick={() => setEditingReview(userExistingReview)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <FiEdit className="mr-2" />
            Yorumunu Düzenle
          </button>
        )}
      </div>

      {/* Rating Summary */}
      {totalReviews > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-500 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(averageRating)} size="large" />
            <p className="text-gray-600 mt-2">{totalReviews} değerlendirme</p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {distribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center">
                <span className="w-8 text-sm text-gray-600">{rating}</span>
                <FiStar className="text-yellow-400 fill-current mx-2" />
                <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-sm text-gray-600 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <FiFilter className="mr-2 text-gray-600" />
          <span className="text-sm font-medium text-gray-700 mr-2">Filtrele:</span>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tüm Puanlar</option>
            <option value="5">5 Yıldız</option>
            <option value="4">4 Yıldız</option>
            <option value="3">3 Yıldız</option>
            <option value="2">2 Yıldız</option>
            <option value="1">1 Yıldız</option>
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
            <option value="helpful">En Faydalı</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="ml-3 flex-1">
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiStar className="text-gray-400 text-2xl" />
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            Henüz değerlendirme yok
          </h4>
          <p className="text-gray-600 mb-6">
            İlk yorumu siz yazın ve diğer müşterilere yardımcı olun!
          </p>
          {isAuthenticated && (
            <button
              onClick={() => setShowAddReview(true)}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
            >
              İlk Yorumu Yaz
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard 
              key={review.id}
              review={review}
              currentUser={user}
              onEdit={() => setEditingReview(review)}
              onDelete={() => handleDeleteReview(review.id)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Review Modal */}
      {(showAddReview || editingReview) && (
        <ReviewModal
          review={editingReview}
          storeId={storeId}
          productId={productId}
          onClose={() => {
            setShowAddReview(false);
            setEditingReview(null);
          }}
          onSubmit={editingReview ? handleEditReview : handleAddReview}
        />
      )}
    </div>
  );
};

const ReviewCard = ({ review, currentUser, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0);
  const [isHelpful, setIsHelpful] = useState(false);

  const isOwner = currentUser?.id === review.user_id;
  const isAdmin = currentUser?.role === 'admin';

  // API'den gelen user bilgilerini kullan
  const userName = review.user?.name || 'Anonim Kullanıcı';
  const userAvatar = review.user?.avatar_url || null;

  const handleHelpful = () => {
    if (isHelpful) {
      setHelpfulCount(prev => prev - 1);
    } else {
      setHelpfulCount(prev => prev + 1);
    }
    setIsHelpful(!isHelpful);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const StarRating = ({ rating }) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          } text-sm`}
        />
      ))}
    </div>
  );

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover" />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="ml-3">
            <div className="flex items-center">
              <h4 className="font-semibold text-gray-900">{userName}</h4>
              {review.is_verified_purchase && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Doğrulanmış Alışveriş
                </span>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FiCalendar className="mr-1" />
              {formatDate(review.created_at)}
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <StarRating rating={review.rating} />
          {(isOwner || isAdmin) && (
            <div className="relative ml-4">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <FiMoreVertical />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                  {isOwner && (
                    <button
                      onClick={() => {
                        onEdit();
                        setShowMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiEdit className="mr-2" />
                      Düzenle
                    </button>
                  )}
                  {(isOwner || isAdmin) && (
                    <button
                      onClick={() => {
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <FiTrash2 className="mr-2" />
                      Sil
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comment */}
      <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={handleHelpful}
          className={`flex items-center text-sm transition-colors duration-200 ${
            isHelpful ? 'text-orange-500' : 'text-gray-500 hover:text-orange-500'
          }`}
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          Faydalı ({helpfulCount})
        </button>

        {review.order_id && (
          <span className="text-xs text-gray-500">
            Sipariş #{review.order_id.slice(-8)}
          </span>
        )}
      </div>
    </div>
  );
};

const ReviewModal = ({ review, storeId, productId, onClose, onSubmit }) => {
  const [rating, setRating] = useState(review?.rating || 0);
  const [comment, setComment] = useState(review?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Lütfen bir puan verin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData = {
        rating,
        comment,
        order_id: null // TODO: Eğer sipariş ID'si varsa buraya eklenebilir
      };

      await onSubmit(reviewData);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Yorum gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange }) => {
    const [hoveredRating, setHoveredRating] = useState(0);

    return (
      <div className="flex items-center text-2xl">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="cursor-pointer hover:scale-110 transition-transform duration-200"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => onRatingChange(star)}
          >
            <FiStar
              className={`${
                star <= (hoveredRating || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              } transition-colors duration-200`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {review ? 'Yorumu Düzenle' : 'Yorum Ekle'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puanınız *
              </label>
              <StarRating rating={rating} onRatingChange={setRating} />
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

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yorumunuz
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="Deneyiminizi diğer müşterilerle paylaşın..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length}/500 karakter
              </p>
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
                disabled={isSubmitting || rating === 0}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? 'Gönderiliyor...' : review ? 'Güncelle' : 'Gönder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewSystem; 