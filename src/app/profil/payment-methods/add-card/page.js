'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCreditCard, FiCalendar, FiUser, FiLock } from 'react-icons/fi';

export default function AddCard() {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState('');
  const [makeDefault, setMakeDefault] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Kredi kartı numarasını formatlama
  const formatCardNumber = (value) => {
    const val = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = val.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Son kullanma tarihini formatlama
  const formatExpiryDate = (value) => {
    const val = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (val.length >= 2) {
      return val.slice(0, 2) + (val.length > 2 ? '/' + val.slice(2, 4) : '');
    }
    
    return val;
  };

  // Kart tipini belirleme (basit versiyon)
  const detectCardType = (number) => {
    const re = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
    };
    
    const numberOnly = number.replace(/\s+/g, '');
    
    if (re.visa.test(numberOnly)) {
      return 'Visa';
    } else if (re.mastercard.test(numberOnly)) {
      return 'Mastercard';
    } else if (re.amex.test(numberOnly)) {
      return 'American Express';
    }
    
    return '';
  };

  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
    setCardType(detectCardType(formattedValue));
    
    if (errors.cardNumber) {
      setErrors({...errors, cardNumber: null});
    }
  };

  const handleExpiryDateChange = (e) => {
    const formattedValue = formatExpiryDate(e.target.value);
    setExpiryDate(formattedValue);
    
    if (errors.expiryDate) {
      setErrors({...errors, expiryDate: null});
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!cardNumber || cardNumber.replace(/\s+/g, '').length < 16) {
      newErrors.cardNumber = 'Geçerli bir kart numarası giriniz';
    }
    
    if (!cardHolder) {
      newErrors.cardHolder = 'Kart sahibinin adını giriniz';
    }
    
    if (!expiryDate || expiryDate.length < 5) {
      newErrors.expiryDate = 'Geçerli bir son kullanma tarihi giriniz (AA/YY)';
    } else {
      const [month, year] = expiryDate.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Geçerli bir ay giriniz (01-12)';
      } else if (parseInt(year) < currentYear || 
                (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Kartınızın süresi dolmuş';
      }
    }
    
    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'Geçerli bir güvenlik kodu giriniz';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      // Burada gerçek uygulamada API çağrısı yapılacaktır
      setTimeout(() => {
        // Başarılı ekleme sonrası ödeme yöntemleri sayfasına dön
        router.push('/profil/payment-methods');
      }, 1500);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-2" />
          <span>Geri</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Yeni Kart Ekle</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Kart Numarası */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Kart Numarası
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCreditCard className="text-gray-400" />
              </div>
              <input
                type="text"
                className={`w-full pl-10 pr-3 py-3 border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                value={cardNumber}
                onChange={handleCardNumberChange}
              />
              {cardType && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-sm font-medium text-gray-500">{cardType}</span>
                </div>
              )}
            </div>
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
            )}
          </div>
          
          {/* Kart Sahibi */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Kart Sahibi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                type="text"
                className={`w-full pl-10 pr-3 py-3 border ${errors.cardHolder ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Ad Soyad"
                value={cardHolder}
                onChange={(e) => {
                  setCardHolder(e.target.value);
                  if (errors.cardHolder) setErrors({...errors, cardHolder: null});
                }}
              />
            </div>
            {errors.cardHolder && (
              <p className="mt-1 text-sm text-red-600">{errors.cardHolder}</p>
            )}
          </div>
          
          <div className="flex flex-wrap -mx-2 mb-4">
            {/* Son Kullanma Tarihi */}
            <div className="w-1/2 px-2">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Son Kullanma Tarihi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className={`w-full pl-10 pr-3 py-3 border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="AA/YY"
                  maxLength="5"
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                />
              </div>
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
              )}
            </div>
            
            {/* CVV */}
            <div className="w-1/2 px-2">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Güvenlik Kodu (CVV)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className={`w-full pl-10 pr-3 py-3 border ${errors.cvv ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="123"
                  maxLength="4"
                  value={cvv}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setCvv(val);
                    if (errors.cvv) setErrors({...errors, cvv: null});
                  }}
                />
              </div>
              {errors.cvv && (
                <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
              )}
            </div>
          </div>
          
          {/* Varsayılan Kart */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={makeDefault}
                onChange={(e) => setMakeDefault(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">Bu kartı varsayılan ödeme yöntemi olarak ayarla</span>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-3 px-4 rounded-lg shadow-sm hover:from-orange-600 hover:to-red-700 focus:outline-none ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                <span>İşleniyor...</span>
              </div>
            ) : (
              'Kartı Kaydet'
            )}
          </button>
        </form>
        
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Kartınız güvenle saklanacak ve bilgileriniz şifrelenecektir.</p>
          <p className="mt-1">Ödeme işlemleriniz SSL ile korunmaktadır.</p>
        </div>
      </div>
    </div>
  );
} 
