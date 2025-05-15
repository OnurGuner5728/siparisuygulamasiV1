'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

/**
 * Sipariş Kartı Bileşeni
 * @param {Object} props - Sipariş kartı özellikleri
 * @param {number} props.id - Sipariş ID'si
 * @param {string} props.orderNumber - Sipariş numarası
 * @param {string} props.storeName - Mağaza adı
 * @param {string} props.storeImageUrl - Mağaza resmi URL'i
 * @param {string} props.orderDate - Sipariş tarihi
 * @param {string} props.deliveryDate - Teslimat tarihi (varsa)
 * @param {Array} props.items - Sipariş ürünleri
 * @param {number} props.totalAmount - Toplam tutar
 * @param {string} props.status - Sipariş durumu (pending, processing, delivered, canceled)
 * @param {string} props.trackingUrl - Takip sayfası URL'i
 * @param {string} props.detailUrl - Detay sayfası URL'i
 * @param {boolean} [props.showActions=true] - Aksiyon butonlarını göster/gizle
 * @param {function} [props.onReorder] - Yeniden sipariş fonksiyonu
 * @param {function} [props.onCancel] - İptal etme fonksiyonu
 * @param {string} [props.className] - Ek CSS sınıfları
 */
const OrderCard = ({
  id,
  orderNumber,
  storeName,
  storeImageUrl,
  orderDate,
  deliveryDate,
  items = [],
  totalAmount,
  status,
  trackingUrl,
  detailUrl,
  showActions = true,
  onReorder,
  onCancel,
  className = '',
}) => {
  // Duruma göre renk ve metin belirleme
  const getStatusDetails = (status) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-blue-50 text-blue-600',
          text: 'Onay Bekliyor'
        };
      case 'processing':
        return {
          color: 'bg-orange-50 text-orange-600',
          text: 'Hazırlanıyor'
        };
      case 'on_the_way':
        return {
          color: 'bg-indigo-50 text-indigo-600',
          text: 'Yolda'
        };
      case 'delivered':
        return {
          color: 'bg-green-50 text-green-600',
          text: 'Teslim Edildi'
        };
      case 'canceled':
        return {
          color: 'bg-red-50 text-red-600',
          text: 'İptal Edildi'
        };
      default:
        return {
          color: 'bg-gray-50 text-gray-600',
          text: 'Bilinmeyen Durum'
        };
    }
  };
  
  const statusDetails = getStatusDetails(status);
  
  // Ürün listesini kısaltma
  const displayItems = () => {
    if (items.length === 0) return 'Ürün yok';
    
    if (items.length === 1) {
      return `${items[0].quantity}x ${items[0].name}`;
    }
    
    // İlk ürünü göster ve kalanları özet olarak ekle
    return `${items[0].quantity}x ${items[0].name} ve ${items.length - 1} ürün daha`;
  };
  
  // Tarih formatlama
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  return (
    <div className={`bg-white rounded-2xl shadow-md overflow-hidden ${className}`}>
      {/* Üst bilgi alanı */}
      <div className="border-b border-gray-100 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 mr-3">
            {storeImageUrl ? (
              <img
                src={storeImageUrl}
                alt={storeName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{storeName}</h3>
            <p className="text-xs text-gray-500">Sipariş no: {orderNumber}</p>
          </div>
        </div>
        
        {/* Durum etiketi */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusDetails.color}`}>
          {statusDetails.text}
        </div>
      </div>
      
      {/* Sipariş içeriği */}
      <div className="p-4">
        <div className="flex justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Sipariş:</span> {displayItems()}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Tarih:</span> {formatDate(orderDate)}
            </p>
            {deliveryDate && status === 'delivered' && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Teslim:</span> {formatDate(deliveryDate)}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-900 font-bold">{totalAmount.toFixed(2)} TL</p>
          </div>
        </div>
        
        {/* Aksiyon butonları */}
        {showActions && (
          <div className="flex justify-between items-center mt-4">
            <div className="space-x-2">
              {/* İptal butonu - sadece belirli durumlarda görünür */}
              {(status === 'pending' || status === 'processing') && onCancel && (
                <Button
                  variant="text" 
                  size="sm"
                  onClick={() => onCancel(id)}
                >
                  İptal Et
                </Button>
              )}
              
              {/* Tekrar sipariş ver butonu - iptal edilmemiş veya teslim edilmiş siparişler için */}
              {status !== 'canceled' && onReorder && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReorder(id, items)}
                >
                  Tekrar Sipariş Ver
                </Button>
              )}
            </div>
            
            <div className="space-x-2">
              {/* Detay butonu */}
              {detailUrl && (
                <Link href={detailUrl}>
                  <Button
                    variant="secondary"
                    size="sm"
                  >
                    Detaylar
                  </Button>
                </Link>
              )}
              
              {/* Takip butonu - sadece belirli durumlarda görünür */}
              {(status === 'processing' || status === 'on_the_way') && trackingUrl && (
                <Link href={trackingUrl}>
                  <Button
                    variant="primary"
                    size="sm"
                  >
                    Takip Et
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard; 