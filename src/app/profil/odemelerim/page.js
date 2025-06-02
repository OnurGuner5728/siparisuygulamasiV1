'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import ProfileSidebar from '@/components/ProfileSidebar';
import { FiDollarSign, FiCreditCard, FiPlus } from 'react-icons/fi';

export default function PaymentMethodsPageNew() {
  return (
    <AuthGuard requiredRole="any_auth">
      <PaymentMethodsContent />
    </AuthGuard>
  );
}

function PaymentMethodsContent() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      // Kapıda ödeme seçenekleri
      const paymentOptions = [
        {
          id: 1,
          type: 'cash',
          name: 'Kapıda Nakit Ödeme',
          description: 'Siparişinizi teslim alırken nakit ödeme yapın',
          icon: <FiDollarSign className="text-green-600 text-xl" />,
          is_default: true,
          isActive: true
        },
        {
          id: 2,
          type: 'card_on_delivery',
          name: 'Kapıda Kart ile Ödeme',
          description: 'Siparişinizi teslim alırken POS cihazı ile kart ödeme yapın',
          icon: <FiCreditCard className="text-blue-600 text-xl" />,
          is_default: false,
          isActive: true
        }
      ];

      setPaymentMethods(paymentOptions);
      setLoading(false);
    };

    loadPaymentMethods();
  }, [user]);

  const setDefaultPayment = (paymentId) => {
    setPaymentMethods(paymentMethods.map(payment => ({
      ...payment,
      is_default: payment.id === paymentId
    })));
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="flex flex-col md:flex-row md:gap-8">
            <ProfileSidebar activeTab="payment-methods" />
            
            <div className="md:flex-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:gap-8">
          <ProfileSidebar activeTab="payment-methods" />
          
          <div className="md:flex-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Ödeme Tercihleri</h2>
                <p className="text-gray-600 text-sm mt-1">Varsayılan ödeme yönteminizi seçin</p>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {paymentMethods.map((payment) => (
                    <div key={payment.id} className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      payment.is_default 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`} onClick={() => setDefaultPayment(payment.id)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            {payment.icon}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="font-semibold text-gray-800">
                                {payment.name}
                              </span>
                              {payment.is_default && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                  Varsayılan
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.description}
                            </div>
                          </div>
                        </div>
                        <input
                          type="radio"
                          className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                          checked={payment.is_default}
                          onChange={() => setDefaultPayment(payment.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bilgi Kutusu */}
                <div className="mb-6">
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h3 className="font-medium text-blue-800 mb-1">Kapıda Ödeme</h3>
                        <p className="text-sm text-blue-700">
                          Tüm siparişlerinizde kapıda ödeme yapabilirsiniz. Nakit veya kart ile ödeme seçenekleriniz mevcuttur. 
                          Varsayılan tercih olarak seçtiğiniz yöntem checkout sırasında otomatik olarak seçili gelecektir.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Online Kredi Kartı - İnaktif */}
                <div className="mb-6">
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
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
                            Online kart ödeme özelliği geliştirilmekte
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
                  Online Kart Ödeme (Yakında)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodCard({ payment, onDelete, onSetDefault, onEdit }) {
  return 'Ödeme Yöntemi';
} 
