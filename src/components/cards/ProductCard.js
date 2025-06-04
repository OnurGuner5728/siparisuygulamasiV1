'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import FavoriteButton from '@/components/FavoriteButton';

/**
 * Ürün Kartı Bileşeni
 * @param {Object} props - Ürün kartı özellikleri
 * @param {number} props.id - Ürün ID'si
 * @param {number} props.storeId - Mağaza ID'si
 * @param {string} props.name - Ürün adı
 * @param {string} props.description - Ürün açıklaması
 * @param {number} props.price - Ürün fiyatı
 * @param {number} props.discountedPrice - İndirimli fiyat (varsa)
 * @param {string} props.imageUrl - Ürün resmi URL'i
 * @param {Array} props.categories - Ürün kategorileri
 * @param {boolean} props.isNew - Yeni ürün mü
 * @param {boolean} props.isPopular - Popüler ürün mü
 * @param {string} props.url - Ürün detay sayfası URL'i
 * @param {boolean} props.isHorizontal - Yatay görünüm
 * @param {function} props.onAddToCart - Sepete ekleme fonksiyonu
 * @param {string} [props.className] - Ek CSS sınıfları
 */
const ProductCard = ({
  id,
  storeId,
  name,
  description,
  price,
  discountedPrice,
  imageUrl = '',
  categories = [],
  isNew = false,
  isPopular = false,
  url,
  isHorizontal = false,
  onAddToCart,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // Hover işlevleri
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  
  // Sepete ekle işlevi
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onAddToCart) {
      onAddToCart({
        id,
        storeId,
        name,
        price: discountedPrice || price,
        quantity,
        imageUrl,
      });
    }
  };
  
  // Miktar arttırma ve azaltma
  const increaseQuantity = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(quantity + 1);
  };
  
  const decreaseQuantity = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  // İndirim yüzdesini hesapla
  const calculateDiscountPercentage = () => {
    if (!discountedPrice || price <= discountedPrice) return null;
    
    const discount = ((price - discountedPrice) / price) * 100;
    return Math.round(discount);
  };
  
  const discountPercentage = calculateDiscountPercentage();
  const currentPrice = discountedPrice || price;
  
  // Yatay görünüm için stil sınıfları
  const containerClasses = isHorizontal
    ? 'flex bg-white rounded-2xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1'
    : 'bg-white rounded-2xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1';
  
  // Resim alanı için stil sınıfları
  const imageContainerClasses = isHorizontal
    ? 'relative w-1/3'
    : 'relative h-48';
  
  return (
    <Link
      href={url || `/yemek/${storeId}/${id}`}
      className={`block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={containerClasses}>
        {/* Resim alanı */}
        <div className={imageContainerClasses}>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name} 
              className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Yeni veya Popüler etiketi */}
          {(isNew || isPopular) && (
            <div className="absolute top-3 left-3">
              {isNew && (
                <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium mr-2">
                  Yeni
                </span>
              )}
              {isPopular && (
                <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                  Popüler
                </span>
              )}
            </div>
          )}
          
          {/* Favori butonu */}
          <FavoriteButton
            itemType="product"
            itemId={id}
            className="absolute top-3 right-3"
            size="sm"
          />

          {/* İndirim etiketi */}
          {discountPercentage && (
            <div className="absolute top-3 left-3">
              <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                %{discountPercentage} İndirim
              </span>
            </div>
          )}
        </div>
        
        {/* Bilgi alanı */}
        <div className={isHorizontal ? 'p-4 w-2/3 flex flex-col' : 'p-4'}>
          <div className="mb-2">
            <div className="flex flex-wrap gap-1 mb-1">
              {categories.slice(0, 2).map((category, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                >
                  {category}
                </span>
              ))}
              {categories.length > 2 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  +{categories.length - 2} daha
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-800">{name}</h3>
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-2 mb-3 flex-grow">{description}</p>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center">
              {discountedPrice && (
                <span className="text-gray-500 text-sm line-through mr-2">{price.toFixed(2)} TL</span>
              )}
              <span className="text-lg font-bold text-gray-800">{currentPrice.toFixed(2)} TL</span>
            </div>
            
            <div className="flex items-center">
              {!isHovered ? (
                <Button 
                  onClick={handleAddToCart}
                  variant="primary"
                  size="sm"
                  className="h-9"
                >
                  Sepete Ekle
                </Button>
              ) : (
                <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                  <button 
                    onClick={decreaseQuantity}
                    className="px-2 py-1 text-gray-600 hover:bg-gray-200 h-9 w-9 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="px-2 text-gray-800 font-medium">{quantity}</span>
                  <button 
                    onClick={increaseQuantity}
                    className="px-2 py-1 text-gray-600 hover:bg-gray-200 h-9 w-9 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 