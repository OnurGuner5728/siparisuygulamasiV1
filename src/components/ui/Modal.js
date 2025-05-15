'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal Bileşeni
 * @param {Object} props - Modal özellikleri
 * @param {boolean} props.isOpen - Modal açık mı
 * @param {function} props.onClose - Kapatma işlevi
 * @param {string} [props.title] - Modal başlığı
 * @param {React.ReactNode} props.children - Modal içeriği
 * @param {string} [props.size="md"] - Modal boyutu (sm, md, lg, xl, full)
 * @param {boolean} [props.closeOnClickOutside=true] - Dışarı tıklamada kapansın mı
 * @param {boolean} [props.closeOnEsc=true] - ESC tuşu ile kapansın mı
 * @param {boolean} [props.showCloseButton=true] - Kapatma butonu gösterilsin mi
 * @param {string} [props.className] - Ek CSS sınıfları
 * @param {string} [props.overlayClassName] - Arka plan için ek CSS sınıfları
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnClickOutside = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = '',
  overlayClassName = '',
}) => {
  const modalRef = useRef(null);
  
  // ESC tuşuna basıldığında modal'ı kapat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (closeOnEsc && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeOnEsc, isOpen, onClose]);
  
  // Modal açıldığında body scroll'unu kapat
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Modal dışına tıklamayı yönet
  const handleOverlayClick = (e) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  // Boyut sınıfları
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full h-full m-0 rounded-none',
  };
  
  const modalSizeClass = sizeClasses[size] || sizeClasses.md;
  
  // Modal açık değilse hiçbir şey render etme
  if (!isOpen) return null;
  
  // Portal kullanarak modal'ı body içine ekle
  return createPortal(
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${overlayClassName}`}
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div 
        ref={modalRef}
        className={`relative bg-white rounded-2xl shadow-xl transform transition-all ${modalSizeClass} ${size === 'full' ? '' : 'mx-4 my-6'} overflow-hidden ${className}`}
      >
        {/* Modal Başlık */}
        {(title || showCloseButton) && (
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            {title && (
              <h3 id="modal-title" className="text-lg font-bold text-gray-900">
                {title}
              </h3>
            )}
            
            {showCloseButton && (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                onClick={onClose}
                aria-label="Kapat"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Modal İçerik */}
        <div className={`${title || showCloseButton ? '' : 'pt-6'} px-6 pb-6`}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal; 