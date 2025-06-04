'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import AuthGuard from '../../components/AuthGuard';
import api from '@/lib/api';

export default function Checkout() {
  return (
    <AuthGuard requiredRole="user">
      <CheckoutContent />
    </AuthGuard>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { 
    cartItems, 
    calculateSubtotal, 
    calculateDeliveryFee, 
    calculateTotal,
    calculateDeliveryTime,
    clearCart,
    currentStore
  } = useCart();
  const { error, warning, success } = useToast();
  
  const [activeStep, setActiveStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash veya card_on_delivery
  const [loading, setLoading] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  // Kampanya ile ilgili state'ler
  const [availableCampaigns, setAvailableCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [campaignDiscount, setCampaignDiscount] = useState(0);
  
  // Kullanıcı adresleri
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  
  useEffect(() => {
    // Sepet boşsa ana sayfaya yönlendir
    if (cartItems.length === 0 && !orderCompleted) {
      router.push('/');
      return;
    }
    
    // Kullanıcı giriş yapmadıysa ve sepette ürün varsa login'e yönlendir
    if (!isAuthenticated && !orderCompleted) {
      // Giriş sayfasına yönlendirmeden önce dönüş URLsini kaydet
      localStorage.setItem('redirectAfterLogin', '/checkout');
      router.push('/login');
      return;
    }
    
    // Kullanıcı adreslerini yükle
    const loadAddresses = async () => {
      if (!user) return;
      
      setLoadingAddresses(true);
      try {
        const userAddresses = await api.getUserAddresses(user.id);
        
        if (userAddresses && userAddresses.length > 0) {
          setAddresses(userAddresses);
          
          // Varsayılan adres veya ilk adresi seç
          const defaultAddress = userAddresses.find(addr => addr.is_default) || userAddresses[0];
          setSelectedAddress(defaultAddress.id);
        } else {
          // Kullanıcının adresi yoksa
          console.log('Kullanıcının kayıtlı adresi bulunamadı');
        }
      } catch (err) {
        console.error('Adresler yüklenirken hata:', err);
      } finally {
        setLoadingAddresses(false);
      }
    };
    
    loadAddresses();
    
    // Sepette ürün varsa mağaza kampanyalarını yükle
    const loadStoreCampaigns = async () => {
      if (cartItems.length > 0 && cartItems[0].store_id) {
        setLoadingCampaigns(true);
        try {
          // Mağazanın onaylanmış kampanya başvurularını getir
          const applications = await api.getCampaignApplications({
            store_id: cartItems[0].store_id,
            status: 'approved'
          });
          
          if (applications && applications.length > 0) {
            // Aktif kampanyaları filtrele
            const activeCampaigns = applications
              .filter(app => 
                app.campaign && 
                app.campaign.is_active && 
                new Date(app.campaign.end_date) > new Date() &&
                new Date(app.campaign.start_date) <= new Date()
              )
              .map(app => app.campaign);
            
            setAvailableCampaigns(activeCampaigns);
          }
        } catch (error) {
          console.error('Mağaza kampanyaları yüklenirken hata:', error);
        } finally {
          setLoadingCampaigns(false);
        }
      }
    };
    
    loadStoreCampaigns();
  }, [cartItems.length, router, user, orderCompleted, isAuthenticated]);

  // Kampanya indirimini hesapla
  const calculateCampaignDiscount = (campaign, subtotal) => {
    if (!campaign) return 0;
    
    // Minimum sipariş tutarı kontrolü
    const minAmount = campaign.minimum_order_amount || campaign.min_order_amount || 0;
    if (subtotal < minAmount) return 0;
    
    let discount = 0;
    
    if (campaign.type === 'percentage' || campaign.discount_type_new === 'percentage') {
      // Yüzde indirim
      discount = (subtotal * parseFloat(campaign.value)) / 100;
      
      // Maksimum indirim tutarı kontrolü
      const maxDiscount = campaign.max_discount_amount;
      if (maxDiscount && discount > maxDiscount) {
        discount = maxDiscount;
      }
    } else if (campaign.type === 'fixed_amount' || campaign.discount_type_new === 'fixed_amount') {
      // Sabit tutar indirim
      discount = parseFloat(campaign.value);
      
      // İndirim tutarı sepet tutarından fazla olamaz
      if (discount > subtotal) {
        discount = subtotal;
      }
    }
    
    return discount;
  };
  
  // Kampanya seçimi
  const handleCampaignSelect = (campaign) => {
    if (selectedCampaign?.id === campaign.id) {
      // Aynı kampanya seçilmişse kaldır
      setSelectedCampaign(null);
      setCampaignDiscount(0);
    } else {
      // Yeni kampanya seç
      setSelectedCampaign(campaign);
      const discount = calculateCampaignDiscount(campaign, calculateSubtotal());
      setCampaignDiscount(discount);
    }
  };
  
  // Güncellenmiş toplam hesaplama (kampanya indirimi dahil)
  const calculateDiscountedSubtotal = () => {
    return Math.max(0, calculateSubtotal() - campaignDiscount);
  };
  
  // Güncellenmiş teslimat ücreti hesaplama (indirimli tutara göre)
  const calculateDiscountedDeliveryFee = () => {
    const discountedTotal = calculateDiscountedSubtotal();
    
    // Store bilgisi yoksa varsayılan değerleri kullan
    if (!currentStore) {
      return discountedTotal >= 150 ? 0 : 12;
    }
    
    const deliveryFee = currentStore.delivery_fee || 12;
    const freeDeliveryThreshold = currentStore.minimum_order_for_free_delivery || 150;
    
    return discountedTotal >= freeDeliveryThreshold ? 0 : deliveryFee;
  };
  
  // Güncellenmiş genel toplam hesaplama
  const calculateDiscountedTotal = () => {
    return calculateDiscountedSubtotal() + calculateDiscountedDeliveryFee();
  };

  const handleContinue = () => {
    if (activeStep === 1 && selectedAddress) {
      setActiveStep(2);
    } else if (activeStep === 2) {
      // Kampanya seçimi varsa 3. adıma geç, yoksa siparişi tamamla
      if (availableCampaigns.length > 0) {
        setActiveStep(3);
      } else {
        handleCompleteOrder();
      }
    } else if (activeStep === 3) {
      // Kampanya seçiminden sonra siparişi tamamla
      handleCompleteOrder();
    }
  };

  const handleCompleteOrder = async () => {
    console.log('🚀 Sipariş tamamlama başlatıldı');
    console.log('📦 CartItems:', cartItems);
    console.log('👤 User:', user);
    console.log('📍 SelectedAddress:', selectedAddress);
    console.log('💳 PaymentMethod:', paymentMethod);
    
    if (!selectedAddress) {
      warning('Lütfen bir adres seçin');
      return;
    }
    
    if (!user || !user.id) {
      error('Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }
    
    if (!cartItems || cartItems.length === 0) {
      warning('Sepetiniz boş. Lütfen ürün ekleyin.');
      return;
    }
    
    const storeId = cartItems[0]?.store_id;
    if (!storeId) {
      error('Mağaza bilgisi bulunamadı. Lütfen sepeti yenileyin.');
      console.error('Store ID bulunamadı:', cartItems[0]);
      return;
    }
    
    setLoading(true);
    
    try {
      // Sepet öğelerinden sipariş öğeleri oluştur
      const orderItems = cartItems.map(item => ({
        product_id: item.product_id || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        notes: item.notes || ''
      }));
      
      console.log('🛍️ OrderItems:', orderItems);
      
      // Seçilen adresi bul
      const address = addresses.find(addr => addr.id === selectedAddress);
      console.log('🏠 Selected address:', address);
      
      // Ödeme yöntemi detayları
      const paymentMethodDetails = {
        type: paymentMethod === 'cash' ? 'cash' : 'card'
      };
      
      // Sipariş verisi oluştur (kampanya indirimi dahil)
      const finalSubtotal = campaignDiscount > 0 ? calculateDiscountedSubtotal() : calculateSubtotal();
      const finalDeliveryFee = campaignDiscount > 0 ? calculateDiscountedDeliveryFee() : calculateDeliveryFee();
      const finalTotal = campaignDiscount > 0 ? calculateDiscountedTotal() : calculateTotal();
      
      const orderData = {
        user_id: user.id,
        store_id: storeId,
        subtotal: calculateSubtotal(), // Orijinal ara toplam
        delivery_fee: finalDeliveryFee,
        total_amount: finalTotal,
        discount_amount: campaignDiscount,
        campaign_id: selectedCampaign?.id || null,
        payment_method: paymentMethod, // cash veya card_on_delivery
        payment_method_details: JSON.stringify(paymentMethodDetails),
        delivery_address: JSON.stringify(address),
        estimated_delivery_time: `${calculateDeliveryTime().min}-${calculateDeliveryTime().max} dakika`,
        delivery_notes: ''
      };
      
      console.log('📋 OrderData:', orderData);
      
      // Siparişi oluştur
      console.log('🔄 API çağrısı başlatılıyor...');
      const result = await api.createOrder(orderData, orderItems);
      console.log('✅ API sonucu:', result);
      
      if (result.error) {
        throw new Error(result.error.message || 'Sipariş oluşturulamadı');
      }
      
      // Mağaza sahibine yeni sipariş bildirimi gönder
      try {
        const store = await api.getStoreById(storeId);
        if (store && store.owner_id) {
          await api.createNewOrderNotification(
            result.data.id,
            store.owner_id,
            user.name || user.email,
            calculateTotal()
          );
          console.log('✅ Mağaza sahibine bildirim gönderildi');
        }
      } catch (notificationError) {
        console.error('❌ Mağaza bildirimi gönderilirken hata:', notificationError);
        // Bildirim hatası sipariş işlemini etkilemesin
      }
      
      setOrderNumber(result.data.id);
      setOrderCompleted(true);
      
      // Success sayfasında kullanmak üzere bilgileri localStorage'a kaydet
      localStorage.setItem('paymentMethod', paymentMethod);
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      localStorage.setItem('selectedAddress', JSON.stringify(address));
      
      clearCart(); // Sepeti temizle
      console.log('🎉 Sipariş başarıyla tamamlandı!');
      
    } catch (err) {
      console.error('❌ Sipariş oluşturulurken hata:', err);
      error('Sipariş oluşturulurken bir hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
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
            Siparişinizin durumunu &quot;Siparişlerim&quot; sayfasından takip edebilirsiniz.
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
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 dark:bg-gray-900"
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
                <span className="text-sm mt-1">Kampanya</span>
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
                          {address.is_default && (
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
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:bg-gray-900"
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
                {/* Kapıda Nakit Ödeme */}
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
                        <h3 className="font-medium">Kapıda Nakit Ödeme</h3>
                        <p className="text-sm text-gray-500">Kurye geldiğinde nakit olarak ödeyin</p>
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

                {/* Kapıda Kart ile Ödeme */}
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'card_on_delivery' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setPaymentMethod('card_on_delivery')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <div>
                        <h3 className="font-medium">Kapıda Kart ile Ödeme</h3>
                        <p className="text-sm text-gray-500">Kurye geldiğinde POS cihazı ile kartınızla ödeyin</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                      checked={paymentMethod === 'card_on_delivery'}
                      onChange={() => setPaymentMethod('card_on_delivery')}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:bg-gray-900"
                >
                  Geri
                </button>
                <button
                  onClick={handleContinue}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
                >
                  {availableCampaigns.length > 0 ? 'Kampanya Seçimi' : 'Siparişi Tamamla'}
                </button>
              </div>
            </div>
          )}

          {/* Kampanya Seçimi Adımı */}
          {activeStep === 3 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Kampanya Seçimi</h2>
              
              {loadingCampaigns ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2">Kampanyalar yükleniyor...</span>
                </div>
              ) : availableCampaigns.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aktif Kampanya Yok</h3>
                  <p className="text-gray-500">Bu mağaza için şu anda geçerli bir kampanya bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Aşağıdaki kampanyalardan birini seçebilirsiniz (isteğe bağlı):
                  </p>
                  
                  {availableCampaigns.map(campaign => {
                    const currentSubtotal = calculateSubtotal();
                    const discount = calculateCampaignDiscount(campaign, currentSubtotal);
                    const minAmount = campaign.minimum_order_amount || campaign.min_order_amount || 0;
                    const isEligible = currentSubtotal >= minAmount;
                    
                    return (
                      <div 
                        key={campaign.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedCampaign?.id === campaign.id
                            ? 'border-green-500 bg-green-50' 
                            : isEligible
                            ? 'border-gray-200 hover:border-green-300'
                            : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                        }`}
                        onClick={() => isEligible && handleCampaignSelect(campaign)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                                </svg>
                                <h3 className="font-medium">{campaign.name}</h3>
                              </div>
                              {selectedCampaign?.id === campaign.id && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                  Seçili
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                            
                            <div className="text-sm space-y-1">
                              <div className="flex items-center">
                                <span className="font-medium text-green-600">
                                  {campaign.type === 'percentage' || campaign.discount_type_new === 'percentage' 
                                    ? `%${campaign.value} İndirim` 
                                    : `${campaign.value} TL İndirim`}
                                </span>
                                {campaign.max_discount_amount && (campaign.type === 'percentage' || campaign.discount_type_new === 'percentage') && (
                                  <span className="ml-2 text-gray-500">
                                    (Max {campaign.max_discount_amount} TL)
                                  </span>
                                )}
                              </div>
                              
                              {minAmount > 0 && (
                                <div className="text-gray-500">
                                  Minimum sipariş: {minAmount} TL
                                </div>
                              )}
                              
                              {isEligible && discount > 0 && (
                                <div className="text-green-600 font-medium">
                                  Bu siparişte indirim: {discount.toFixed(2)} TL
                                </div>
                              )}
                              
                              {!isEligible && (
                                <div className="text-red-500">
                                  {(minAmount - currentSubtotal).toFixed(2)} TL daha harcayın
                                </div>
                              )}
                            </div>
                            
                            <div className="text-xs text-gray-400 mt-2">
                              {new Date(campaign.start_date).toLocaleDateString('tr-TR')} - {new Date(campaign.end_date).toLocaleDateString('tr-TR')}
                            </div>
                          </div>
                          
                          <div className="flex items-center ml-4">
                            <input
                              type="radio"
                              className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500"
                              checked={selectedCampaign?.id === campaign.id}
                              onChange={() => isEligible && handleCampaignSelect(campaign)}
                              disabled={!isEligible}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:bg-gray-900"
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
              {cartItems.map((item, index) => (
                <div key={`${item.product_id}-${item.store_id}-${index}`} className="py-3 border-b last:border-b-0 flex items-center space-x-3">
                  {/* Ürün resmi */}
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {(item.product?.image || item.image) ? (
                      <img 
                        src={item.product?.image || item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-lg">
                          {item.store_type === 'yemek' ? '🍽️' : 
                           item.store_type === 'market' ? '🏪' : '💧'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Ürün bilgileri */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-sm">{item.name}</span>
                          <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">{item.quantity}x</span>
                        </div>
                        <p className="text-sm text-gray-600">{(item.price * item.quantity).toFixed(2)} TL</p>
                        {item.storeName && (
                          <p className="text-xs text-gray-400">{item.storeName}</p>
                        )}
                      </div>
                    </div>
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
            
            {/* Kampanya indirimi */}
            {campaignDiscount > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-green-600">Kampanya İndirimi</span>
                <span className="font-medium text-green-600">-{campaignDiscount.toFixed(2)} TL</span>
              </div>
            )}
            
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Teslimat Ücreti</span>
              <span className="font-medium">
                {(campaignDiscount > 0 ? calculateDiscountedDeliveryFee() : calculateDeliveryFee()) === 0 
                  ? 'Ücretsiz' 
                  : `${(campaignDiscount > 0 ? calculateDiscountedDeliveryFee() : calculateDeliveryFee()).toFixed(0)} TL`}
              </span>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tahmini Teslimat</span>
              <span className="font-medium text-blue-600">
                {calculateDeliveryTime().min}-{calculateDeliveryTime().max} dakika
              </span>
            </div>
            
            {/* Ücretsiz teslimat bilgisi */}
            {currentStore && currentStore.minimum_order_for_free_delivery && (campaignDiscount > 0 ? calculateDiscountedDeliveryFee() : calculateDeliveryFee()) > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <div className="text-orange-700 text-sm">
                  <div className="font-medium mb-1">🚚 Ücretsiz Teslimat</div>
                  <div>
                    {(() => {
                      const currentTotal = campaignDiscount > 0 ? calculateDiscountedSubtotal() : calculateSubtotal();
                      const freeDeliveryThreshold = currentStore.minimum_order_for_free_delivery;
                      
                      if (freeDeliveryThreshold > currentTotal) {
                        return `${(freeDeliveryThreshold - currentTotal).toFixed(0)} TL daha harcayın, teslimat ücretsiz olsun!`;
                      } else {
                        return 'Tebrikler! Teslimat ücretsiz!';
                      }
                    })()}
                  </div>
                </div>
              </div>
            )}
            
            <hr className="my-4" />
            
            <div className="flex justify-between mb-6">
              <span className="text-lg font-semibold">Toplam</span>
              <span className="text-lg font-semibold">
                {(campaignDiscount > 0 ? calculateDiscountedTotal() : calculateTotal()).toFixed(2)} TL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
