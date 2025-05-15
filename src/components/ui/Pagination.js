'use client';

import React from 'react';
import Link from 'next/link';

/**
 * Sayfa numaralandırma bileşeni
 * @param {Object} props - Pagination özellikleri
 * @param {number} props.currentPage - Aktif sayfa numarası
 * @param {number} props.totalPages - Toplam sayfa sayısı
 * @param {function} props.onPageChange - Sayfa değişikliği işlevi
 * @param {string} [props.baseUrl] - Sayfa URL'i (URL tabanlı sayfalama için)
 * @param {number} [props.siblingCount=1] - Aktif sayfanın yanında gösterilecek sayfa sayısı
 * @param {boolean} [props.showFirstLast=true] - İlk/son sayfa butonları gösterilsin mi
 * @param {string} [props.size="md"] - Boyut (sm, md, lg)
 * @param {string} [props.className] - Ek CSS sınıfları
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  baseUrl,
  siblingCount = 1,
  showFirstLast = true,
  size = 'md',
  className = '',
}) => {
  // Toplam sayfa sayısı 1 ise veya geçersizse sayfalama gösterme
  if (!totalPages || totalPages <= 1) return null;
  
  // Geçerli sayfa kontrolü
  const page = Math.max(1, Math.min(currentPage, totalPages));
  
  // Boyut sınıfları
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };
  
  const buttonSize = sizeClasses[size] || sizeClasses.md;
  
  // Sayfa aralığını oluştur
  const range = (start, end) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };
  
  // Görünecek sayfa numaralarını hesapla
  const generatePagination = () => {
    // Toplam gösterilecek buton sayısı (sayfa numaraları + ilk/son + önceki/sonraki)
    const totalPageNumbers = siblingCount * 2 + 3; // siblingCount + current + siblingCount + first + last
    
    // Toplam sayfa sayısı, toplam gösterilecek buton sayısından az ise, tüm sayfaları göster
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }
    
    // Siblinglerı hesapla
    const leftSiblingIndex = Math.max(page - siblingCount, 1);
    const rightSiblingIndex = Math.min(page + siblingCount, totalPages);
    
    // Ellipsis (üç nokta) gösterilecek mi?
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;
    
    // Özel durumlar
    if (!shouldShowLeftDots && shouldShowRightDots) {
      // Sol tarafta dots yok, sağ tarafta var
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, -1, totalPages];
    } else if (shouldShowLeftDots && !shouldShowRightDots) {
      // Sağ tarafta dots yok, sol tarafta var
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [1, -2, ...rightRange];
    } else if (shouldShowLeftDots && shouldShowRightDots) {
      // Her iki tarafta da dots var
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, -2, ...middleRange, -1, totalPages];
    }
  };
  
  const pages = generatePagination();
  
  // Sayfa değişikliği olduğunda
  const handlePageChange = (pageNumber) => {
    if (pageNumber === page) return;
    if (onPageChange) {
      onPageChange(pageNumber);
    }
  };
  
  // Sayfa butonunu render et
  const renderPageButton = (pageNumber, index) => {
    // Dots (ellipsis) gösterimi
    if (pageNumber < 0) {
      return (
        <span
          key={`dots-${index}-${pageNumber}`}
          className="flex items-center justify-center mx-1 text-gray-500"
        >
          …
        </span>
      );
    }
    
    // Aktif sayfa
    const isActive = pageNumber === page;
    
    // Ortak sınıflar
    const commonClasses = `flex items-center justify-center rounded-full mx-1 ${buttonSize} focus:outline-none transition-colors`;
    
    // Aktif/pasif duruma göre stil
    const buttonClasses = isActive
      ? `${commonClasses} bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium`
      : `${commonClasses} bg-gray-100 text-gray-700 hover:bg-gray-200`;
    
    // URL tabanlı sayfalama
    if (baseUrl) {
      const url = `${baseUrl}${pageNumber === 1 ? '' : `?page=${pageNumber}`}`;
      return (
        <Link
          key={pageNumber}
          href={url}
          className={buttonClasses}
          aria-current={isActive ? 'page' : undefined}
        >
          {pageNumber}
        </Link>
      );
    }
    
    // Event tabanlı sayfalama
    return (
      <button
        key={pageNumber}
        onClick={() => handlePageChange(pageNumber)}
        className={buttonClasses}
        disabled={isActive}
        aria-current={isActive ? 'page' : undefined}
      >
        {pageNumber}
      </button>
    );
  };
  
  // Önceki sayfa butonu
  const renderPrevButton = () => {
    const isPrevDisabled = page === 1;
    
    // Ortak sınıflar
    const commonClasses = `flex items-center justify-center rounded-full mx-1 ${buttonSize} focus:outline-none transition-colors`;
    
    // Aktif/pasif duruma göre stil
    const buttonClasses = isPrevDisabled
      ? `${commonClasses} bg-gray-100 text-gray-400 cursor-not-allowed`
      : `${commonClasses} bg-gray-100 text-gray-700 hover:bg-gray-200`;
    
    // URL tabanlı sayfalama
    if (baseUrl && !isPrevDisabled) {
      const url = `${baseUrl}${page - 1 === 1 ? '' : `?page=${page - 1}`}`;
      return (
        <Link
          href={url}
          className={buttonClasses}
          aria-label="Önceki sayfa"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      );
    }
    
    // Event tabanlı sayfalama
    return (
      <button
        onClick={() => !isPrevDisabled && handlePageChange(page - 1)}
        disabled={isPrevDisabled}
        className={buttonClasses}
        aria-label="Önceki sayfa"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    );
  };
  
  // Sonraki sayfa butonu
  const renderNextButton = () => {
    const isNextDisabled = page === totalPages;
    
    // Ortak sınıflar
    const commonClasses = `flex items-center justify-center rounded-full mx-1 ${buttonSize} focus:outline-none transition-colors`;
    
    // Aktif/pasif duruma göre stil
    const buttonClasses = isNextDisabled
      ? `${commonClasses} bg-gray-100 text-gray-400 cursor-not-allowed`
      : `${commonClasses} bg-gray-100 text-gray-700 hover:bg-gray-200`;
    
    // URL tabanlı sayfalama
    if (baseUrl && !isNextDisabled) {
      const url = `${baseUrl}?page=${page + 1}`;
      return (
        <Link
          href={url}
          className={buttonClasses}
          aria-label="Sonraki sayfa"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      );
    }
    
    // Event tabanlı sayfalama
    return (
      <button
        onClick={() => !isNextDisabled && handlePageChange(page + 1)}
        disabled={isNextDisabled}
        className={buttonClasses}
        aria-label="Sonraki sayfa"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  };
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {renderPrevButton()}
      {pages.map(renderPageButton)}
      {renderNextButton()}
    </div>
  );
};

export default Pagination; 