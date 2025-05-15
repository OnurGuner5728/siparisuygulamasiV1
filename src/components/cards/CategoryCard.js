'use client';

import React, { useState } from 'react';
import Link from 'next/link';

/**
 * Kategori Kartı Bileşeni
 * @param {Object} props - Kategori kartı özellikleri
 * @param {number} props.id - Kategori ID'si
 * @param {string} props.name - Kategori adı
 * @param {string} props.description - Kategori açıklaması
 * @param {string} props.color - Kategori arka plan rengi
 * @param {string} props.imageUrl - Kategori resmi URL'i
 * @param {number} props.storeCount - Kategorideki mağaza sayısı
 * @param {boolean} props.isOpen - Kategorinin açık olup olmadığı
 * @param {string} props.url - Kategori detay sayfası URL'i
 * @param {string} [props.className] - Ek CSS sınıfları
 */
const CategoryCard = ({
  id,
  name,
  description,
  color,
  imageUrl,
  storeCount = 0,
  isOpen = true,
  url,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Hover işlevleri
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  
  return (
    <Link
      href={url || `/${name.toLowerCase()}`}
      className={`block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bg-white rounded-2xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div 
          className={`h-40 relative overflow-hidden ${isHovered ? 'scale-105' : 'scale-100'} transition-transform duration-500`}
          style={{ 
            backgroundColor: color,
            backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <h2 className="text-white text-3xl font-bold drop-shadow-md">{name}</h2>
          </div>
          
          {/* Status Badge */}
          <div className={`absolute bottom-0 right-0 m-4 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-75 translate-y-1'}`}>
            <div className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              {isOpen ? 'Açık' : 'Kapalı'}
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-600 line-clamp-1">{description}</p>
            <span className={`bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-medium transition-all duration-300 ${isHovered ? 'bg-orange-200' : ''}`}>
              {storeCount} Mağaza
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard; 