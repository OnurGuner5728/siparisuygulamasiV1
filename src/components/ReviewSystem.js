'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiStar, FiEdit, FiTrash2, FiPlus, FiFilter, FiUser, FiCalendar, FiMoreVertical, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';

const ReviewSystem = ({ storeId, orderId = null, showHeader = true }) => {
  const { user, isAuthenticated } = useAuth();
  const [showAddReview, setShowAddReview] = useState(false);
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [editingReview, setEditingReview] = useState(null);
  const [userExistingReview, setUserExistingReview] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(null);
  const [userReviewableOrders, setUserReviewableOrders] = useState([]);

  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hookError, setHookError] = useState(null);

  // Reviews'u yükle ve state'i güncelle
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
      setHookError(error);
    } finally {
      setLoading(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    if (storeId) {
      loadReviews();
    }
  }, [storeId, orderId, isAuthenticated, user]);

  // Manual CRUD işlemleri - hemen state'i güncelle
  const insertReview = async (reviewData) => {
    try {
      const result = await api.createReview(reviewData);
      // State'i hemen güncelle
      setAllReviews(prev => [result, ...prev]);
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateReview = async (reviewId, updates) => {
    try {
      const result = await api.updateReview(reviewId, updates);
      // State'i hemen güncelle
      setAllReviews(prev => prev.map(review => 
        review.id === reviewId ? result : review
      ));
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const removeReview = async (reviewId) => {
    try {
      await api.deleteReview(reviewId);
      // State'i hemen güncelle
      setAllReviews(prev => prev.filter(review => review.id !== reviewId));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Filtrelenmiş ve sıralanmış yorumları hesapla
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

  // Kullanıcının mevcut yorumunu kontrol et
  useEffect(() => {
    if (isAuthenticated && user && storeId && allReviews.length > 0) {
      const existingReview = allReviews.find(review => review.user_id === user.id);
      setUserExistingReview(existingReview || null);
    }
  }, [allReviews, user, isAuthenticated, storeId]);

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

      const { data: newReview, error } = await insertReview(newReviewData);
      
      if (error) throw error;
      
      setShowAddReview(false);
      setUserExistingReview(newReview);
      
      // Store rating güncellemesi (artık trigger otomatik yapıyor)
      // await api.updateStoreRating(storeId);
      
      // Değerlendirilebilir siparişleri yeniden yükle
      const reviewableOrders = await api.getUserReviewableOrders(user.id);
      const storeOrders = reviewableOrders.filter(order => order.store_id === storeId);
      setUserReviewableOrders(storeOrders);
      
      // Mağaza sahibine bildirim gönder
      try {
        const store = await api.getStoreById(storeId);
        if (store?.owner_id) {
          await api.createNotification({
            user_id: store.owner_id,
            type: 'new_review',
            title: 'Yeni Değerlendirme',
            message: `${newReview.is_anonymous ? 'Anonim bir müşteri' : (user?.name || 'Bir müşteri')} mağazanıza ${newReview.rating} yıldız verdi.`,
            data: {
              review_id: newReview.id,
              store_id: storeId,
              order_id: reviewData.order_id,
              rating: newReview.rating,
              reviewer_name: newReview.is_anonymous ? 'Anonim' : (user?.name || 'Anonim')
            }
          });
        }
      } catch (notificationError) {
        console.warn('Bildirim gönderilirken hata:', notificationError.message || notificationError);
      }
    } catch (error) {
      console.error('Error adding review:', error.message || error);
      alert(error.message || 'Yorum eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleEditReview = async (reviewData) => {
    try {
      const { data: updatedReview, error } = await updateReview(editingReview.id, {
        rating: reviewData.rating,
        title: reviewData.title || null,
        comment: reviewData.comment,
        is_anonymous: reviewData.is_anonymous
      });
      
      if (error) throw error;
      
      setEditingReview(null);
      setUserExistingReview(updatedReview);
      
      // Store rating güncellemesi
      if (type === 'store') {
        await api.updateStoreRating(storeId);
      }
    } catch (error) {
      console.error('Error updating review:', error.message || error);
      alert('Yorum güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;
    
    try {
      const { error } = await removeReview(reviewId);
      if (error) throw error;
      
      // Store rating güncellemesi
      if (type === 'store') {
        await api.updateStoreRating(storeId);
      }
      
      // Kullanıcının mevcut yorumunu temizle
      if (userExistingReview && userExistingReview.id === reviewId) {
        setUserExistingReview(null);
      }
    } catch (error) {
      console.error('Error deleting review:', error.message || error);
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
    <div className={showHeader ? "bg-white rounded-lg shadow-lg p-6" : ""}>
      {/* Header */}
      {showHeader && (
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          Değerlendirmeler ({totalReviews})
        </h3>
          {isAuthenticated && !userExistingReview && user?.storeInfo?.id !== storeId && (
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
      )}

      {/* Yorum Ekle Butonu (header olmadığında) */}
      {!showHeader && isAuthenticated && !userExistingReview && user?.storeInfo?.id !== storeId && (
        <div className="mb-6">
          <button
            onClick={() => setShowAddReview(true)}
            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
          >
            <FiPlus className="mr-2" />
            Yorum Ekle
          </button>
        </div>
      )}

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
          {isAuthenticated && user?.storeInfo?.id !== storeId && (
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
              storeId={storeId}
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
          type={type}
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

const ReviewCard = ({ review, currentUser, onEdit, onDelete, storeId }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0);
  const [isHelpful, setIsHelpful] = useState(false);
  const [responses, setResponses] = useState([]);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [loadingResponses, setLoadingResponses] = useState(true);

  const isOwner = currentUser?.id === review.user_id;
  const isAdmin = currentUser?.role === 'admin';
  const isStoreOwner = currentUser?.role === 'store_owner' || currentUser?.store_id === storeId;

  // Anonim yorum desteği - Anonimlik mutlak korunmalı
  const userName = review.is_anonymous ? 'Anonim Müşteri' : (review.user?.name || 'Anonim Kullanıcı');
  const userAvatar = review.is_anonymous ? null : (review.user?.avatar_url || null);

  // Review responses ve like durumunu yükle
  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setLoadingResponses(true);
        const responseData = await api.getReviewResponses(review.id);
        setResponses(responseData);
      } catch (error) {
        console.error('Cevaplar yüklenirken hata:', error);
      } finally {
        setLoadingResponses(false);
      }
    };

    const fetchLikeStatus = async () => {
      if (currentUser?.id) {
        try {
          const liked = await api.checkReviewLike(review.id, currentUser.id);
          setIsHelpful(liked);
          const count = await api.getReviewLikeCount(review.id);
          setHelpfulCount(count);
        } catch (error) {
          console.error('Like durumu kontrol hatası:', error);
        }
      }
    };

    fetchResponses();
    fetchLikeStatus();
  }, [review.id, currentUser?.id]);

  const handleHelpful = async () => {
    if (!currentUser?.id) return;
    
    try {
      const result = await api.likeReview(review.id, currentUser.id);
      
      if (result.action === 'liked') {
        setIsHelpful(true);
        setHelpfulCount(prev => prev + 1);
    } else {
        setIsHelpful(false);
        setHelpfulCount(prev => Math.max(0, prev - 1));
      }
          } catch (error) {
        console.error('Beğeni işlemi hatası:', error.message || error);
      }
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) return;

    try {
      const newResponse = await api.createReviewResponse({
        review_id: review.id,
        store_id: storeId,
        responder_id: currentUser.id,
        response_text: responseText.trim()
      });

      setResponses(prev => [...prev, newResponse]);
      setResponseText('');
      setShowResponseForm(false);
      
      // Yorum yapan kişiye bildirim gönder (kendi yorumuna cevap vermiyorsa)
      if (review.user_id !== currentUser.id) {
        try {
          // Store bilgisini al
          const store = await api.getStoreById(storeId);
          await api.createNotification({
            user_id: review.user_id,
            type: 'review_response',
            title: 'Yorumunuza Cevap Geldi',
            message: `${store?.name || 'Mağaza'} yorumunuza cevap verdi.`,
            data: {
              review_id: review.id,
              response_id: newResponse.id,
              store_id: storeId,
              store_name: store?.name || 'Mağaza'
            }
          });
        } catch (notificationError) {
          console.warn('Response bildirimi gönderilirken hata:', notificationError.message || notificationError);
        }
      }
    } catch (error) {
      console.error('Cevap gönderilirken hata:', error.message || error);
      alert('Cevap gönderilirken bir hata oluştu.');
    }
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

      {/* Title */}
      {review.title && (
        <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
      )}

      {/* Comment */}
      <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

      {/* Store Responses */}
      {!loadingResponses && responses.length > 0 && (
        <div className="mb-4 pl-4 border-l-2 border-orange-200">
          {responses.map((response) => (
            <div key={response.id} className="bg-orange-50 rounded-lg p-3 mb-2">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  M
                </div>
                <div className="ml-2">
                  <span className="text-sm font-medium text-orange-800">
                    {response.store?.name || 'Mağaza'} - Yetkili Cevabı
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

      {/* Response Form */}
      {showResponseForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <form onSubmit={handleSubmitResponse}>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Müşterinize cevap yazın..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              rows="3"
              required
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                type="button"
                onClick={() => setShowResponseForm(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
              >
                Cevapla
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
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

          {/* Store owner response button - sadece cevabı olmayan yorumlara */}
          {isStoreOwner && !showResponseForm && !responses.length && (
            <button
              onClick={() => setShowResponseForm(true)}
              className="flex items-center text-sm text-orange-500 hover:text-orange-600"
            >
              <FiMessageSquare className="w-4 h-4 mr-1" />
              Cevapla
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-500">
          {review.review_type && (
            <span className="px-2 py-1 bg-gray-100 rounded">
              {review.review_type === 'product' ? 'Ürün' : 
               review.review_type === 'order' ? 'Sipariş' : 'Mağaza'}
          </span>
        )}
          {review.order_id && (
            <span>Sipariş #{review.order_id.slice(-8)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const ReviewModal = ({ review, storeId, productId, type = 'store', onClose, onSubmit }) => {
  const [rating, setRating] = useState(review?.rating || 0);
  const [title, setTitle] = useState(review?.title || '');
  const [comment, setComment] = useState(review?.comment || '');
  const [isAnonymous, setIsAnonymous] = useState(review?.is_anonymous || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        rating,
        title: title.trim() || null,
        comment: comment.trim(),
        is_anonymous: isAnonymous,
        order_id: null // TODO: Eğer sipariş ID'si varsa buraya eklenebilir
      };

      await onSubmit(reviewData);
    } catch (error) {
        console.error('Error submitting review:', error.message || error);
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
              <p className="text-xs text-gray-500 mt-1">
                {title.length}/100 karakter
              </p>
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
              <p className="text-xs text-gray-500 mt-1">
                Anonim yorumlarda adınız gizlenir
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