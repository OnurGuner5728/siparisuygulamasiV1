'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

/**
 * Uyarı Modalı Bileşeni
 * @param {Object} props - Uyarı modalı özellikleri
 * @param {boolean} props.isOpen - Modal açık mı
 * @param {function} props.onClose - Kapatma işlevi
 * @param {string} [props.title] - Modal başlığı
 * @param {string|React.ReactNode} props.message - Uyarı mesajı
 * @param {string} [props.type="info"] - Uyarı tipi (info, success, warning, error)
 * @param {string} [props.confirmText="Tamam"] - Onay butonu metni
 * @param {string} [props.cancelText="İptal"] - İptal butonu metni
 * @param {function} [props.onConfirm] - Onaylama işlevi
 * @param {function} [props.onCancel] - İptal işlevi
 * @param {boolean} [props.showCancelButton=false] - İptal butonu gösterilsin mi
 */
const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'Tamam',
  cancelText = 'İptal',
  onConfirm,
  onCancel,
  showCancelButton = false,
}) => {
  // Uyarı tipine göre renk ve ikon belirleme
  const getAlertStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          iconClass: 'text-green-500',
          icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          buttonVariant: 'success',
        };
      case 'warning':
        return {
          iconClass: 'text-yellow-500',
          icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          buttonVariant: 'warning',
        };
      case 'error':
        return {
          iconClass: 'text-red-500',
          icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          buttonVariant: 'danger',
        };
      case 'info':
      default:
        return {
          iconClass: 'text-blue-500',
          icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          buttonVariant: 'primary',
        };
    }
  };
  
  const alertStyles = getAlertStyles(type);
  
  // Onaylama işlevi
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };
  
  // İptal işlevi
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
    >
      <div className="flex flex-col items-center">
        {/* İkon */}
        <div className={`${alertStyles.iconClass} mb-4`}>
          {alertStyles.icon}
        </div>
        
        {/* Mesaj */}
        <div className="text-center mb-6">
          {typeof message === 'string' ? (
            <p className="text-gray-700">{message}</p>
          ) : (
            message
          )}
        </div>
        
        {/* Butonlar */}
        <div className={`flex ${showCancelButton ? 'justify-between' : 'justify-center'} w-full mt-2`}>
          {showCancelButton && (
            <Button
              variant="outline"
              onClick={handleCancel}
              className="mr-2"
            >
              {cancelText}
            </Button>
          )}
          
          <Button
            variant={alertStyles.buttonVariant}
            onClick={handleConfirm}
            fullWidth={!showCancelButton}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertModal; 