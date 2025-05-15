'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiPlus, FiCreditCard, FiMoreVertical, FiTrash, FiEdit, FiLock, FiDollarSign, FiCreditCard as FiCardPos } from 'react-icons/fi';

export default function PaymentMethods() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [cardActionMenuOpen, setCardActionMenuOpen] = useState(null);

  useEffect(() => {
    // Demo verileri
    const demoPaymentMethods = [
      {
        id: 1,
        type: 'cash',
        name: 'Kapıda Nakit Ödeme',
        description: 'Siparişinizi teslim alırken nakit ödeme yapın',
        icon: <FiDollarSign className="text-green-600 text-xl" />,
        isDefault: true
      },
      {
        id: 2,
        type: 'doorstep_card',
        name: 'Kapıda Kredi Kartı ile Ödeme',
        description: 'Siparişinizi teslim alırken kart ile ödeme yapın',
        icon: <FiCardPos className="text-blue-600 text-xl" />,
        isDefault: false
      }
    ];

    setTimeout(() => {
      setPaymentMethods(demoPaymentMethods);
      setLoading(false);
    }, 800);
  }, []);

  const handleDeleteCard = (card) => {
    setCardToDelete(card);
    setShowDeleteConfirm(true);
    setCardActionMenuOpen(null);
  };

  const confirmDeleteCard = () => {
    setPaymentMethods(paymentMethods.filter(card => card.id !== cardToDelete.id));
    setShowDeleteConfirm(false);
    setCardToDelete(null);
  };

  const setDefaultCard = (cardId) => {
    setPaymentMethods(paymentMethods.map(card => ({
      ...card,
      isDefault: card.id === cardId
    })));
    setCardActionMenuOpen(null);
  };

  const toggleCardMenu = (cardId) => {
    if (cardActionMenuOpen === cardId) {
      setCardActionMenuOpen(null);
    } else {
      setCardActionMenuOpen(cardId);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-40 bg-gray-200 rounded mb-4"></div>
            <div className="h-40 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Ödeme Yöntemlerim</h1>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiCreditCard className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Henüz Ödeme Yöntemi Eklenmemiş</h3>
            <p className="text-gray-500 mb-6">Siparişleriniz için ödeme yöntemini seçebilirsiniz.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {paymentMethods.map((method) => (
              <div key={method.id} className="border rounded-lg p-4 flex justify-between items-center relative">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    {method.icon}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-800">
                        {method.name}
                      </span>
                      {method.isDefault && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          Varsayılan
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {method.description}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <button 
                    onClick={() => toggleCardMenu(method.id)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  >
                    <FiMoreVertical />
                  </button>

                  {cardActionMenuOpen === method.id && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border">
                      <div className="py-1">
                        {!method.isDefault && (
                          <button 
                            onClick={() => setDefaultCard(method.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <FiLock className="mr-2" /> Varsayılan Yap
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Kredi Kartı Ödeme - İnaktif */}
        <div className="mb-6">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center opacity-60">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  <FiCreditCard className="text-gray-500 text-xl" />
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700">
                      Online Kredi Kartı ile Ödeme
                    </span>
                    <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                      Yakında
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Bu ödeme yöntemi şu anda kullanılamıyor
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* İnaktif Kart Ekleme Butonu */}
        <button 
          disabled
          className="w-full bg-gray-200 text-gray-500 font-semibold py-3 px-4 rounded-lg shadow-sm cursor-not-allowed flex items-center justify-center"
        >
          <FiPlus className="mr-2" />
          Kredi Kartı Ekle (Yakında)
        </button>
      </div>

      {/* Silme Onay Modalı */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ödeme Yöntemini Sil</h3>
            <p className="text-gray-600 mb-6">
              <span className="font-medium">{cardToDelete?.name}</span> ödeme yöntemini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                onClick={confirmDeleteCard}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700"
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