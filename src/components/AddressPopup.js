'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '@/lib/api';

export default function AddressPopup({ isOpen, onClose }) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);

  // Adresleri yükle
  useEffect(() => {
    if (isOpen && user) {
      loadAddresses();
    }
  }, [isOpen, user]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const userAddresses = await api.getUserAddresses(user.id);
      console.log('📍 Popup - Adresler yüklendi:', userAddresses);
      setAddresses(userAddresses || []);
    } catch (error) {
      console.error('❌ Popup - Adresler yüklenirken hata:', error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  // Varsayılan adresi değiştir
  const setAsDefault = async (addressId) => {
    try {
      setUpdating(addressId);
      console.log('🔄 Popup - Varsayılan adres ayarlanıyor:', addressId);
      
      // Önce tüm adresleri varsayılan olmaktan çıkar
      for (const addr of addresses) {
        if (addr.is_default && addr.id !== addressId) {
          await api.updateAddress(addr.id, { is_default: false });
        }
      }
      
      // Seçilen adresi varsayılan yap
      await api.updateAddress(addressId, { is_default: true });
      
      // Local state'i güncelle
      setAddresses(addresses.map(addr => ({
        ...addr,
        is_default: addr.id === addressId
      })));
      
      console.log('✅ Popup - Varsayılan adres ayarlandı');
      
      // Popup'ı kapat
      setTimeout(() => {
        onClose();
      }, 800);
      
    } catch (error) {
      console.error('❌ Popup - Varsayılan adres ayarlanırken hata:', error);
      alert('Varsayılan adres ayarlanırken bir hata oluştu');
    } finally {
      setUpdating(null);
    }
  };

  // Adres tipi ikonunu belirleme
  const getAddressIcon = (addressType) => {
    switch (addressType) {
      case 'home':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'work':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0h2a2 2 0 012 2v6.5" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
    }
  };

  // Popup dışına tıklandığında kapat
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const popup = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[999999]"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden mx-auto my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Adres Seçimi</h2>
            <p className="text-sm text-gray-600 mt-1">Varsayılan adresinizi değiştirin</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Henüz adres eklenmemiş</h3>
              <p className="text-gray-500 mb-6">Hızlı teslimat için adres bilgilerinizi ekleyin</p>
              <button 
                onClick={() => {
                  onClose();
                  window.location.href = '/profil/adresler/yeni';
                }}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                İlk Adresimi Ekle
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => (
                <div 
                  key={address.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    address.is_default 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${updating === address.id ? 'opacity-50' : ''}`}
                  onClick={() => !address.is_default && !updating && setAsDefault(address.id)}
                >
                  <div className="flex items-start">
                    <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                      {getAddressIcon(address.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {address.title || 'Adres'}
                        </h3>
                        {address.is_default ? (
                          <span className="flex items-center text-blue-600 text-sm font-medium">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Varsayılan
                          </span>
                        ) : updating === address.id ? (
                          <div className="flex items-center text-gray-500 text-sm">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                            Ayarlanıyor...
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Seç</span>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        {address.type === 'home' ? 'Ev' : address.type === 'work' ? 'İş' : 'Diğer'} Adresi
                      </p>
                      
                      <p className="text-gray-600 text-sm mt-2 leading-relaxed line-clamp-2">
                        {address.full_address}
                      </p>
                      
                      <p className="text-gray-500 text-xs mt-1">
                        {address.district}, {address.city}
                      </p>
                      
                      {(address.full_name || address.phone) && (
                        <p className="text-gray-500 text-xs mt-1">
                          {address.full_name && <span>{address.full_name}</span>}
                          {address.full_name && address.phone && <span> • </span>}
                          {address.phone && <span>{address.phone}</span>}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {addresses.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                onClose();
                window.location.href = '/profil/adresler';
              }}
              className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Tüm Adreslerimi Yönet
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Portal ile body'ye taşıyoruz
  return typeof window !== 'undefined' ? createPortal(popup, document.body) : null;
} 