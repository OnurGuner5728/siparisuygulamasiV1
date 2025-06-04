'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import FavoriteButton from '@/components/FavoriteButton';

/**
 * Restoran Kartı Bileşeni
 * @param {Object} props - Restoran kartı özellikleri
 * @param {number} props.id - Restoran ID'si
 * @param {string} props.name - Restoran adı
 * @param {string} props.description - Restoran açıklaması
 * @param {string} props.imageUrl - Restoran resmi URL'i
 * @param {string} props.category - Restoran kategorisi
 * @param {number} props.rating - Restoran puanı (0-5 arası)
 * @param {string} props.deliveryTime - Teslimat süresi
 * @param {number} props.minOrderAmount - Minimum sipariş tutarı
 * @param {boolean} props.isFavorite - Favori olup olmadığı
 * @param {boolean} props.isOpen - Restoranın açık olup olmadığı
 * @param {string} props.url - Restoran detay sayfası URL'i
 * @param {string} [props.className] - Ek CSS sınıfları
 */
const RestaurantCard = ({
  id,
  name,
  description,
  imageUrl = '/images/restaurants/default.jpg',
  category = 'Restoran',
  rating = 0,
  deliveryTime = '30-45 dk',
  minOrderAmount = 0,
  isFavorite = false,
  isOpen = true,
  url,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Hover işlevleri
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  
  // Yıldız değerlendirmesini oluştur
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    // Dolu yıldızlar
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Yarım yıldız
    if (halfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="halfGradient">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill="url(#halfGradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Boş yıldızlar
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return stars;
  };
  
  return (
    <Link
      href={url || `/yemek/store/${id}`}
      className={`block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bg-white rounded-2xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Resim alanı */}
        <div className="relative h-48">
          <img 
            src={imageUrl} 
            alt={name} 
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
          
          {/* Favori butonu */}
          <FavoriteButton
            itemType="store"
            itemId={id}
            className="absolute top-3 right-3"
            size="md"
          />
          
          {/* Açık/Kapalı durumu */}
          {!isOpen && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white px-4 py-2 rounded-lg text-gray-800 font-medium">
                Şu anda kapalı
              </div>
            </div>
          )}
          
          {/* Kategori etiketi */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-gray-800/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
              {category}
            </span>
          </div>
        </div>
        
        {/* Bilgi alanı */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-800 text-lg">{name}</h3>
            <div className="flex items-center">
              <div className="flex mr-1">
                {renderStars(rating)}
              </div>
              <span className="text-sm text-gray-600 font-medium">{rating.toFixed(1)}</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{description}</p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-600">{deliveryTime}</span>
            </div>
            
            {minOrderAmount > 0 && (
              <div className="text-gray-600">
                Min. sipariş: <span className="font-medium">{minOrderAmount} TL</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard; 