'use client';

import { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

/**
 * Favori Butonu Bileşeni
 * @param {Object} props
 * @param {string} props.itemType - 'product' veya 'store'
 * @param {string} props.itemId - Ürün veya mağaza ID'si
 * @param {string} [props.className] - Ek CSS sınıfları
 * @param {string} [props.size] - Buton boyutu ('sm', 'md', 'lg')
 */
const FavoriteButton = ({ 
  itemType, 
  itemId, 
  className = '', 
  size = 'md' 
}) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Favori durumunu kontrol et
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user || !itemId) return;
      
      try {
        const result = await api.checkIsFavorite(user.id, itemType, itemId);
        setIsFavorite(result);
      } catch (error) {
        console.error('Favori durumu kontrol edilirken hata:', error);
      }
    };

    checkFavoriteStatus();
  }, [user, itemType, itemId]);

  // Favori toggle işlevi
  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert('Favorilere eklemek için giriş yapmanız gerekir');
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      
      if (isFavorite) {
        await api.removeFromFavorites(user.id, itemType, itemId);
        setIsFavorite(false);
      } else {
        await api.addToFavorites(user.id, itemType, itemId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Favori işlemi sırasında hata:', error);
      alert('Favori işlemi sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Boyut sınıfları
  const sizeClasses = {
    sm: 'p-1.5 h-7 w-7',
    md: 'p-2 h-9 w-9',
    lg: 'p-3 h-12 w-12'
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 24
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading || !user}
      className={`
        ${sizeClasses[size]}
        rounded-full transition-all duration-300 transform hover:scale-110
        ${isFavorite 
          ? 'bg-red-500 text-white shadow-lg' 
          : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-red-500'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
        ${!user ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      title={
        !user 
          ? 'Giriş yapmanız gerekir'
          : isFavorite 
            ? 'Favorilerden çıkar' 
            : 'Favorilere ekle'
      }
    >
      {isLoading ? (
        <div className="animate-spin w-full h-full flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <FiHeart 
          size={iconSizes[size]} 
          className={`${isFavorite ? 'fill-current' : ''} transition-all duration-200`} 
        />
      )}
    </button>
  );
};

export default FavoriteButton; 