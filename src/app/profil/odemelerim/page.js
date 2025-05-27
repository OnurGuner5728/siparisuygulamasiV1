'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import AuthGuard from '../../../components/AuthGuard';
import ProfileSidebar from '../../../components/ProfileSidebar';
import { 
  FiCreditCard, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiShield, 
  FiCheck, 
  FiStar,
  FiBank,
  FiSmartphone
} from 'react-icons/fi';
import api from '@/lib/api';

export default function PaymentMethodsPage() {
  return (
    <AuthGuard requiredRole="any_auth">
      <PaymentMethodsContent />
    </AuthGuard>
  );
}

function PaymentMethodsContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  // Ödeme yöntemlerini yükle
  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        console.log('💳 Ödeme yöntemleri yükleniyor...');
        const userPayments = await api.getUserPaymentMethods(user.id);
        console.log('💳 Ödeme yöntemleri yüklendi:', userPayments);
        setPaymentMethods(userPayments || []);
      } catch (error) {
        console.error('❌ Ödeme yöntemleri yüklenirken hata:', error);
        setPaymentMethods([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadPaymentMethods();
  }, [user]);

  // Ödeme yöntemini sil
  const deletePaymentMethod = async (paymentId) => {
    if (!confirm('Bu ödeme yöntemini silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      console.log('🗑️ Ödeme yöntemi siliniyor:', paymentId);
      await api.deletePaymentMethod(paymentId);
      
      setPaymentMethods(paymentMethods.filter(payment => payment.id !== paymentId));
      console.log('✅ Ödeme yöntemi silindi');
    } catch (error) {
      console.error('❌ Ödeme yöntemi silinirken hata:', error);
      alert('Ödeme yöntemi silinirken bir hata oluştu');
    }
  };

  // Varsayılan ödeme yöntemini ayarla
  const setAsDefault = async (paymentId) => {
    try {
      console.log('⭐ Varsayılan ödeme yöntemi ayarlanıyor:', paymentId);
      
      // Önce tüm ödeme yöntemlerini varsayılan olmaktan çıkar
      for (const payment of paymentMethods) {
        if (payment.is_default && payment.id !== paymentId) {
          await api.updatePaymentMethod(payment.id, { is_default: false });
        }
      }
      
      // Seçilen yöntemi varsayılan yap
      await api.updatePaymentMethod(paymentId, { is_default: true });
      
      // Local state'i güncelle
      setPaymentMethods(paymentMethods.map(payment => ({
        ...payment,
        is_default: payment.id === paymentId
      })));
      
      console.log('✅ Varsayılan ödeme yöntemi ayarlandı');
    } catch (error) {
      console.error('❌ Varsayılan ödeme yöntemi ayarlanırken hata:', error);
      alert('Varsayılan ödeme yöntemi ayarlanırken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row">
            <ProfileSidebar activeTab="payments" />
            
            <div className="md:flex-1 md:ml-8">
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
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:gap-8">
          <ProfileSidebar activeTab="payments" />
          
          <div className="md:flex-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <FiCreditCard className="mr-2 text-blue-500" />
                      Ödeme Yöntemlerim
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Güvenli ödeme yöntemlerinizi yönetin
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FiPlus className="mr-2" size={18} />
                    Yeni Ekle
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Güvenlik Bildirimi */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <FiShield className="text-blue-500 mr-3 mt-1" size={20} />
                    <div>
                      <h3 className="font-medium text-blue-800 mb-1">Güvenli Ödeme</h3>
                      <p className="text-blue-700 text-sm">
                        Tüm ödeme bilgileriniz SSL şifrelemesi ile korunmaktadır. 
                        Kredi kartı numaralarınız güvenli bir şekilde saklanır ve sadece maskelenmiş hali görüntülenir.
                      </p>
                    </div>
                  </div>
                </div>

                {paymentMethods.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCreditCard size={24} className="text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Henüz ödeme yöntemi eklenmemiş</h3>
                    <p className="text-gray-500 mb-6">
                      Hızlı ve güvenli ödeme için kredi kartı, banka kartı veya dijital cüzdan ekleyebilirsiniz
                    </p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      İlk Ödeme Yöntemini Ekle
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map((payment) => (
                      <PaymentMethodCard
                        key={payment.id}
                        payment={payment}
                        onDelete={deletePaymentMethod}
                        onSetDefault={setAsDefault}
                        onEdit={setEditingPayment}
                      />
                    ))}
                  </div>
                )}

                {/* Ekleme Formu Placeholder */}
                {showAddForm && (
                  <div className="mt-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FiCreditCard size={48} className="text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Ödeme Yöntemi Ekleme</h3>
                    <p className="text-gray-600 mb-4">
                      Bu özellik şu anda geliştirme aşamasındadır. 
                      Yakında güvenli ödeme yöntemi ekleme özelliği eklenecektir.
                    </p>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Kapat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodCard({ payment, onDelete, onSetDefault, onEdit }) {
  const getPaymentIcon = (type) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return <FiCreditCard className="text-blue-500" size={24} />;
      case 'bank_account':
        return <FiBank className="text-green-500" size={24} />;
      case 'digital_wallet':
        return <FiSmartphone className="text-purple-500" size={24} />;
      default:
        return <FiCreditCard className="text-gray-500" size={24} />;
    }
  };

  const getPaymentTypeName = (type) => {
    switch (type) {
      case 'credit_card':
        return 'Kredi Kartı';
      case 'debit_card':
        return 'Banka Kartı';
      case 'bank_account':
        return 'Banka Hesabı';
      case 'digital_wallet':
        return 'Dijital Cüzdan';
      default:
        return 'Ödeme Yöntemi';
    }
  };

  const getCardBrandIcon = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
      {payment.is_default && (
        <div className="bg-green-50 border-b border-green-200 py-2 px-4">
          <span className="text-xs font-medium text-green-800 flex items-center">
            <FiCheck className="mr-2" size={14} />
            Varsayılan Ödeme Yöntemi
          </span>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div className="mr-4 mt-1">
              {getPaymentIcon(payment.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h3 className="font-medium text-gray-900 mr-2">
                  {payment.nickname || getPaymentTypeName(payment.type)}
                </h3>
                {payment.card_brand && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {payment.card_brand}
                  </span>
                )}
              </div>
              
              {/* Kart bilgileri */}
              {(payment.type === 'credit_card' || payment.type === 'debit_card') && (
                <div className="space-y-1">
                  <p className="text-gray-600 text-sm flex items-center">
                    <span className="mr-2">{getCardBrandIcon(payment.card_brand)}</span>
                    {payment.card_number_masked || '**** **** **** ****'}
                  </p>
                  {payment.card_holder_name && (
                    <p className="text-gray-500 text-xs">{payment.card_holder_name}</p>
                  )}
                  {payment.card_expiry_month && payment.card_expiry_year && (
                    <p className="text-gray-500 text-xs">
                      Son kullanma: {String(payment.card_expiry_month).padStart(2, '0')}/{payment.card_expiry_year}
                    </p>
                  )}
                </div>
              )}

              {/* Banka hesabı bilgileri */}
              {payment.type === 'bank_account' && (
                <div className="space-y-1">
                  <p className="text-gray-600 text-sm">
                    {payment.bank_name || 'Banka Hesabı'}
                  </p>
                  {payment.account_number_masked && (
                    <p className="text-gray-500 text-xs">
                      Hesap: {payment.account_number_masked}
                    </p>
                  )}
                </div>
              )}

              {/* Dijital cüzdan bilgileri */}
              {payment.type === 'digital_wallet' && (
                <div className="space-y-1">
                  <p className="text-gray-600 text-sm">
                    {payment.wallet_provider || 'Dijital Cüzdan'}
                  </p>
                  {payment.wallet_email && (
                    <p className="text-gray-500 text-xs">{payment.wallet_email}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!payment.is_default && (
              <button
                onClick={() => onSetDefault(payment.id)}
                className="p-2 text-gray-400 hover:text-green-500 rounded-full hover:bg-green-50 transition-colors"
                title="Varsayılan Yap"
              >
                <FiStar size={16} />
              </button>
            )}
            <button
              onClick={() => onEdit(payment)}
              className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
              title="Düzenle"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(payment.id)}
              className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
              title="Sil"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Ekleme tarihi: {new Date(payment.created_at).toLocaleDateString('tr-TR')}
          </p>
        </div>
      </div>
    </div>
  );
} 