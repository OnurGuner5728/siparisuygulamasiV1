'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import AuthGuard from '../../components/AuthGuard';

export default function Checkout() {
  return (
    <AuthGuard requiredRole="user">
      <CheckoutContent />
    </AuthGuard>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    cartItems, 
    calculateSubtotal, 
    calculateDeliveryFee, 
    calculateTotal,
    clearCart 
  } = useCart();
  
  const [activeStep, setActiveStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  // Kullanıcı adresleri
  const [addresses, setAddresses] = useState([]);
  
  useEffect(() => {
    // Sepet boşsa ana sayfaya yönlendir
    if (cartItems.length === 0 && !orderCompleted) {
      router.push('/');
    }
    
    // Mock adres verilerini yükle
    if (user && user.addresses) {
      setAddresses(user.addresses);
      if (user.addresses.length > 0) {
        const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
        setSelectedAddress(defaultAddress.id);
      }
    } else {
      // Eğer kullanıcının adresi yoksa, mock adresler
      setAddresses([
        {
          id: 1,
          title: 'Ev',
          fullName: 'Ahmet Yılmaz',
          phone: '0555 111 2233',
          city: 'İstanbul',
          district: 'Kadıköy',
          neighborhood: 'Göztepe',
          fullAddress: 'Örnek Sokak No:1 D:5',
          isDefault: true
        },
        {
          id: 2,
          title: 'İş',
          fullName: 'Ahmet Yılmaz',
          phone: '0555 111 2233',
          city: 'İstanbul',
          district: 'Şişli',
          neighborhood: 'Mecidiyeköy',
          fullAddress: 'İş Merkezi No:10 Kat:5',
          isDefault: false
        }
      ]);
      setSelectedAddress(1);
    }
  }, [cartItems.length, router, user, orderCompleted]);

  const handleCardInfoChange = (e) => {
    const { name, value } = e.target;
    
    // Kart numarası formatlama
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/(.{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
      
      setCardInfo({
        ...cardInfo,
        [name]: formattedValue
      });
      return;
    }
    
    // Son kullanma tarihi formatlama
    if (name === 'expiryDate') {
      const formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d{0,2})/, '$1/$2')
        .slice(0, 5);
      
      setCardInfo({
        ...cardInfo,
        [name]: formattedValue
      });
      return;
    }
    
    // CVV formatlama
    if (name === 'cvv') {
      const formattedValue = value.slice(0, 3);
      
      setCardInfo({
        ...cardInfo,
        [name]: formattedValue
      });
      return;
    }
    
    setCardInfo({
      ...cardInfo,
      [name]: value
    });
  };

  const handleContinue = () => {
    if (activeStep === 1 && selectedAddress) {
      setActiveStep(2);
    } else if (activeStep === 2) {
      if (paymentMethod === 'cash') {
        // Kapıda ödeme seçilmişse, doğrudan siparişi tamamla
        handleCompleteOrder();
      } else if (validateCardInfo()) {
        handleCompleteOrder();
      }
    }
  };

  const validateCardInfo = () => {
    // Basit kart bilgisi doğrulama
    if (paymentMethod === 'online') {
      const { cardNumber, cardName, expiryDate, cvv } = cardInfo;
      
      if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
        alert('Lütfen geçerli bir kart numarası girin.');
        return false;
      }
      
      if (!cardName) {
        alert('Lütfen kart üzerindeki ismi girin.');
        return false;
      }
      
      if (!expiryDate || expiryDate.length !== 5) {
        alert('Lütfen geçerli bir son kullanma tarihi girin.');
        return false;
      }
      
      if (!cvv || cvv.length !== 3) {
        alert('Lütfen geçerli bir CVV girin.');
        return false;
      }
    }
    
    return true;
  };

  const handleCompleteOrder = () => {
    setLoading(true);
    
    // Mock sipariş tamamlama
    setTimeout(() => {
      // Rastgele sipariş numarası oluştur
      const randomOrderNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
      setOrderNumber(randomOrderNumber);
      
      setOrderCompleted(true);
      clearCart(); // Sepeti temizle
      setLoading(false);
    }, 2000);
  };

  const getSelectedAddressDetails = () => {
    return addresses.find(addr => addr.id === selectedAddress) || {};
  };

  if (orderCompleted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Siparişiniz Alındı!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Siparişiniz başarıyla oluşturuldu. Sipariş numaranız: <span className="font-bold">{orderNumber}</span>
          </p>
          
          <p className="text-gray-500 mb-8">
            Siparişinizin durumunu "Siparişlerim" sayfasından takip edebilirsiniz.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/profil/siparisler" 
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
            >
              Siparişlerime Git
            </Link>
            <Link 
              href="/" 
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Siparişi Tamamla</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          {/* Aşama İndikatörü */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className={`flex flex-col items-center ${activeStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${activeStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  1
                </div>
                <span className="text-sm mt-1">Teslimat Adresi</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${activeStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex flex-col items-center ${activeStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${activeStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  2
                </div>
                <span className="text-sm mt-1">Ödeme</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${activeStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex flex-col items-center ${activeStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${activeStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  3
                </div>
                <span className="text-sm mt-1">Tamamlandı</span>
              </div>
            </div>
          </div>
          
          {/* Adres Seçimi Adımı */}
          {activeStep === 1 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Teslimat Adresi Seçin</h2>
              
              <div className="space-y-4">
                {addresses.map(address => (
                  <div 
                    key={address.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedAddress === address.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedAddress(address.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium">{address.title}</h3>
                          {address.isDefault && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              Varsayılan
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mt-1">{address.fullName}</p>
                        <p className="text-gray-500 text-sm mt-1">{address.phone}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          {address.neighborhood}, {address.district}, {address.city}
                        </p>
                        <p className="text-gray-700 mt-1">{address.fullAddress}</p>
                      </div>
                      <div className="flex items-center h-6">
                        <input
                          type="radio"
                          className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                          checked={selectedAddress === address.id}
                          onChange={() => setSelectedAddress(address.id)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-between">
                <Link 
                  href="/profil/adresler"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Adres Ekle
                </Link>
                <button
                  onClick={handleContinue}
                  disabled={!selectedAddress}
                  className={`px-6 py-2 rounded-md text-white font-medium ${
                    selectedAddress 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Devam Et
                </button>
              </div>
            </div>
          )}
          
          {/* Ödeme Adımı */}
          {activeStep === 2 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Ödeme Yöntemi</h2>
              
              <div className="space-y-4">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'online' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setPaymentMethod('online')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <div>
                        <h3 className="font-medium">Kredi/Banka Kartı</h3>
                        <p className="text-sm text-gray-500">Güvenli ödeme</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                    />
                  </div>
                  
                  {paymentMethod === 'online' && (
                    <div className="mt-4 border-t pt-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kart Numarası
                          </label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={cardInfo.cardNumber}
                            onChange={handleCardInfoChange}
                            placeholder="0000 0000 0000 0000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kart Üzerindeki İsim
                          </label>
                          <input
                            type="text"
                            name="cardName"
                            value={cardInfo.cardName}
                            onChange={handleCardInfoChange}
                            placeholder="Ad Soyad"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Son Kullanma
                            </label>
                            <input
                              type="text"
                              name="expiryDate"
                              value={cardInfo.expiryDate}
                              onChange={handleCardInfoChange}
                              placeholder="AA/YY"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVV
                            </label>
                            <input
                              type="text"
                              name="cvv"
                              value={cardInfo.cvv}
                              onChange={handleCardInfoChange}
                              placeholder="000"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'cash' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div>
                        <h3 className="font-medium">Kapıda Ödeme</h3>
                        <p className="text-sm text-gray-500">Nakit ödeme</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Geri
                </button>
                <button
                  onClick={handleContinue}
                  disabled={loading}
                  className={`px-6 py-2 rounded-md text-white font-medium ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      İşleniyor...
                    </span>
                  ) : 'Siparişi Tamamla'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Sipariş Özeti</h2>
            
            <div className="max-h-[300px] overflow-y-auto mb-4">
              {cartItems.map(item => (
                <div key={item.id} className="py-3 border-b last:border-b-0 flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">{item.name}</span>
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">{item.quantity}x</span>
                    </div>
                    <p className="text-sm text-gray-600">{(item.price * item.quantity).toFixed(2)} TL</p>
                    {item.storeName && (
                      <p className="text-xs text-gray-400">{item.storeName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {activeStep === 2 && selectedAddress && (
              <div className="mb-4 pb-4 border-b">
                <h3 className="font-medium mb-2">Teslimat Adresi</h3>
                <div className="text-sm text-gray-600">
                  <p>{getSelectedAddressDetails().fullName}</p>
                  <p>{getSelectedAddressDetails().phone}</p>
                  <p>
                    {getSelectedAddressDetails().neighborhood}, {getSelectedAddressDetails().district}, {getSelectedAddressDetails().city}
                  </p>
                  <p>{getSelectedAddressDetails().fullAddress}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Ara Toplam</span>
              <span className="font-medium">{calculateSubtotal().toFixed(2)} TL</span>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Teslimat Ücreti</span>
              <span className="font-medium">
                {calculateDeliveryFee() === 0 
                  ? 'Ücretsiz' 
                  : `${calculateDeliveryFee().toFixed(2)} TL`}
              </span>
            </div>
            
            <hr className="my-4" />
            
            <div className="flex justify-between mb-6">
              <span className="text-lg font-semibold">Toplam</span>
              <span className="text-lg font-semibold">{calculateTotal().toFixed(2)} TL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 