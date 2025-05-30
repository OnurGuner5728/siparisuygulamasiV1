'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import AuthGuard from '../../../components/AuthGuard';

export default function Addresses() {
  return (
    <AuthGuard requiredRole="any_auth">
      <AddressesContent />
    </AuthGuard>
  );
}

function AddressesContent() {
  const { user, updateUserData } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    if (user && user.addresses) {
      setAddresses(user.addresses);
    }
    setLoading(false);
  }, [user]);

  // Adres silme işlemini başlat (modal göster)
  const handleDeleteStart = (addressId) => {
    setAddressToDelete(addressId);
    setShowDeleteModal(true);
  };

  // Adres silme işlemini iptal et
  const handleCancelDelete = () => {
    setAddressToDelete(null);
    setShowDeleteModal(false);
  };

  // Adres silme işlemini tamamla
  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    
    try {
      // Kullanıcının güncellenmiş adres listesi
      const updatedAddresses = addresses.filter(address => address.id !== addressToDelete);
      
      // AuthContext üzerinden kullanıcı verisini güncelle
      await updateUserData({ ...user, addresses: updatedAddresses });
      
      // Lokal state güncelleme
      setAddresses(updatedAddresses);
      
      // Başarı bildirimi göster
      setNotification({
        show: true,
        message: 'Adres başarıyla silindi',
        type: 'success'
      });
      
      // 3 saniye sonra bildirimi kapat
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      // Hata bildirimi göster
      setNotification({
        show: true,
        message: 'Adres silinirken bir hata oluştu',
        type: 'error'
      });
      
      // 3 saniye sonra bildirimi kapat
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
      
      console.error('Adres silme hatası:', error);
    } finally {
      // Modal'ı kapat
      setShowDeleteModal(false);
      setAddressToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Bildirim */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {notification.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}
      
      {/* Başlık ve yeni adres ekle butonu */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/profil" className="mr-2 text-blue-600 hover:text-blue-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-semibold">Adreslerim</h1>
        </div>
        <Link 
          href="/profil/adreslerim/yeni"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Yeni Adres Ekle
        </Link>
      </div>

      {/* Adres listesi */}
      {addresses.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Adres bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500">Yeni bir adres ekleyerek başlayın</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{address.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{address.fullName}</p>
                </div>
                <div className="flex space-x-2">
                  <Link 
                    href={`/profil/adreslerim/duzenle/${address.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  <button 
                    onClick={() => handleDeleteStart(address.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-700 mt-2">
                <p className="mb-1">{address.fullAddress}</p>
                <p>{address.neighborhood}, {address.district}/{address.city}</p>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {address.phone}
                </span>
                {address.isDefault && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Varsayılan
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Silme onay modalı */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Adresi Sil</h3>
            <p className="text-gray-700 mb-6">Bu adresi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                İptal
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
