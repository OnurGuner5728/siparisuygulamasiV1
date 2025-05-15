'use client';

import React, { useState } from 'react';

/**
 * Yıldız Değerlendirme Bileşeni
 * @param {Object} props - Yıldız değerlendirme özellikleri
 * @param {number} [props.value=0] - Mevcut değerlendirme değeri (0-5)
 * @param {boolean} [props.editable=false] - Değerlendirmenin düzenlenebilir olup olmadığı
 * @param {number} [props.count=5] - Toplam yıldız sayısı
 * @param {number} [props.size="md"] - Yıldız boyutu (sm, md, lg)
 * @param {function} [props.onChange] - Değer değiştiğinde çağrılacak fonksiyon
 * @param {string} [props.className] - Ek CSS sınıfları
 */
const Rating = ({
  value = 0,
  editable = false,
  count = 5,
  size = "md",
  onChange,
  className = '',
}) => {
  const [rating, setRating] = useState(value);
  const [hover, setHover] = useState(null);
  
  // Boyuta göre sınıflar
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  const starSize = sizeClasses[size] || sizeClasses.md;
  
  // Tıklama işlemi
  const handleClick = (newValue) => {
    if (!editable) return;
    
    setRating(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };
  
  return (
    <div className={`flex ${className}`}>
      {[...Array(count)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = (hover !== null ? hover : rating) >= starValue;
        
        return (
          <div
            key={index}
            className={`cursor-${editable ? 'pointer' : 'default'} px-0.5`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => editable && setHover(starValue)}
            onMouseLeave={() => editable && setHover(null)}
          >
            <svg
              className={`${starSize} ${isFilled ? 'text-yellow-500' : 'text-gray-300'} transition-colors duration-150`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        );
      })}
      
      {/* Sayısal değer (isteğe bağlı olarak gösterilebilir) */}
      {/* <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span> */}
    </div>
  );
};

export default Rating; 