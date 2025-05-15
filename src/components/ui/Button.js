'use client';

import React from 'react';
import Link from 'next/link';

/**
 * Tekrar kullanılabilir Button bileşeni
 * @param {Object} props - Button özellikleri
 * @param {string} [props.variant="primary"] - Buton varyasyonu (primary, secondary, outline, text)
 * @param {string} [props.size="md"] - Buton boyutu (sm, md, lg)
 * @param {string} [props.href] - Link olarak davranması için href
 * @param {boolean} [props.fullWidth=false] - Tam genişlikte buton
 * @param {boolean} [props.isLoading=false] - Yükleniyor durumu
 * @param {boolean} [props.disabled=false] - Devre dışı durumu
 * @param {string} [props.className] - Ek CSS sınıfları
 * @param {React.ReactNode} props.children - Butonun içeriği
 * @param {function} [props.onClick] - Tıklama işlevi
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  href,
  fullWidth = false,
  isLoading = false,
  disabled = false,
  className = '',
  children,
  onClick,
  ...props
}) => {
  // CSS sınıfları
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Varyasyona göre sınıflar
  const variantClasses = {
    primary: 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg focus:ring-orange-500',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400',
    outline: 'border border-orange-500 bg-transparent text-orange-500 hover:bg-orange-50 focus:ring-orange-500',
    text: 'bg-transparent text-orange-500 hover:text-orange-700 focus:ring-transparent',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  };
  
  // Boyuta göre sınıflar
  const sizeClasses = {
    sm: 'text-xs px-3 py-2 rounded-lg',
    md: 'text-sm px-4 py-2 rounded-xl',
    lg: 'text-base px-6 py-3 rounded-xl',
  };
  
  // Hover, aktif ve devre dışı durumları için sınıflar
  const stateClasses = disabled
    ? 'opacity-60 cursor-not-allowed'
    : 'hover:scale-[1.02] active:scale-[0.98]';
  
  // Tam genişlik sınıfı
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Tüm sınıfları birleştir
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${stateClasses} ${widthClass} ${className}`;
  
  // Yükleniyor içeriği
  const loadingContent = (
    <>
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Yükleniyor...
    </>
  );
  
  // Link veya buton olarak render et
  if (href) {
    return (
      <Link 
        href={href}
        className={buttonClasses}
        {...props}
      >
        {isLoading ? loadingContent : children}
      </Link>
    );
  }
  
  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? loadingContent : children}
    </button>
  );
};

export default Button; 