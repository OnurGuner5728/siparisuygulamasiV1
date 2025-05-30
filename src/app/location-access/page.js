'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiMapPin, FiChevronRight, FiX, FiAlertCircle } from 'react-icons/fi';

export default function LocationAccess() {
  const router = useRouter();
  const [locationStatus, setLocationStatus] = useState('initial'); // initial, requesting, granted, denied, unavailable
  const [error, setError] = useState(null);
  const [address, setAddress] = useState('');
  const [suggestedAddresses, setSuggestedAddresses] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Demo adresler
  const demoAddresses = [
    'Bahçelievler Mahallesi, İstanbul',
    'Ataşehir, İstanbul',
    'Kadıköy, İstanbul',
    'Beşiktaş, İstanbul',
    'Beyoğlu, İstanbul',
    'Ümraniye, İstanbul'
  ];
  
  // Arama sonuçlarını filtrele
  useEffect(() => {
    if (address.trim().length > 2) {
      const filtered = demoAddresses.filter(
        addr => addr.toLowerCase().includes(address.toLowerCase())
      );
      setSuggestedAddresses(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [address]);
  
  // Konum erişimi iste
  const requestLocationAccess = () => {
    setLocationStatus('requesting');
    
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      setError('Tarayıcınız konum servisini desteklemiyor.');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Başarılı konum alma işlemi
        setLocationStatus('granted');
        
        // Gerçek bir uygulamada burada konumu API'ye gönderebilir
        // ve adres bilgisini çekebilirsiniz (reverse geocoding)
        // Şimdi simule ediyoruz
        setTimeout(() => {
          setAddress('Bahçelievler Mahallesi, İstanbul');
        }, 1000);
      },
      (error) => {
        setLocationStatus('denied');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Konum erişim izni reddedildi.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Konum bilgisi kullanılamıyor.');
            break;
          case error.TIMEOUT:
            setError('Konum bilgisi alınırken zaman aşımı oluştu.');
            break;
          default:
            setError('Konum alınırken bilinmeyen bir hata oluştu.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  // Adres seçme
  const selectAddress = (selectedAddress) => {
    setAddress(selectedAddress);
    setShowSuggestions(false);
  };
  
  // Konumu onaylama ve devam etme
  const confirmLocation = () => {
    if (!address.trim()) {
      setError('Lütfen bir konum seçin veya girin.');
      return;
    }
    
    // Gerçek uygulamada konumu kaydet ve adresler sayfasına yönlendir
    localStorage.setItem('userLocation', address);
    router.push('/profil/adresler');
  };
  
  // Konum izni olmadan devam et
  const continueWithoutLocation = () => {
    localStorage.setItem('locationPermissionSkipped', 'true');
    router.push('/profil/adresler');
  };
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Başlık */}
      <div className="p-4 flex justify-between items-center">
        <div className="w-8">
          {/* Sol boş alan (denge için) */}
        </div>
        <h1 className="text-xl font-bold text-gray-800">Konumunuz</h1>
        <button
          onClick={continueWithoutLocation}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
        >
          <FiX size={20} />
        </button>
      </div>
      
      {/* İçerik */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full mx-auto">
          {/* İllüstrasyon */}
          <div className="mb-8 relative w-48 h-48 mx-auto">
            <div className="w-full h-full rounded-full bg-orange-100 flex items-center justify-center">
              <FiMapPin className="text-orange-500 text-5xl" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">
            Konumunuzu paylaşın
          </h2>
          
          <p className="text-center text-gray-600 mb-8">
            Size en yakın restoranları ve en hızlı teslimat seçeneklerini gösterebilmemiz için konumunuza erişmemize izin verin.
          </p>
          
          {/* Konum Durumu */}
          {locationStatus === 'unavailable' && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start">
              <FiAlertCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" size={18} />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {locationStatus === 'denied' && (
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-6 flex items-start">
              <FiAlertCircle className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" size={18} />
              <div>
                <p className="text-sm mb-1">{error}</p>
                <p className="text-sm">Tarayıcı ayarlarınızdan konum iznini etkinleştirin veya manuel olarak adresinizi girin.</p>
              </div>
            </div>
          )}
          
          {/* Manuel Adres Girişi veya Otomatik Konum */}
          <div className="mb-8 relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMapPin className="text-gray-400" />
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Adresinizi girin veya konum paylaşın"
                className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            {/* Adres Önerileri */}
            {showSuggestions && suggestedAddresses.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                {suggestedAddresses.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectAddress(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:bg-gray-900 flex items-center"
                  >
                    <FiMapPin className="text-gray-400 mr-3 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Aksiyonlar */}
          <div className="space-y-3">
            {locationStatus !== 'granted' && (
              <button
                onClick={requestLocationAccess}
                className="w-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-700"
              >
                {locationStatus === 'requesting' ? (
                  <>
                    <div className="mr-2 animate-spin rounded-full h-5 w-5 border-t-2 border-r-2 border-white"></div>
                    Konum Alınıyor...
                  </>
                ) : (
                  <>
                    Konumumu Otomatik Bul
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={confirmLocation}
              disabled={!address.trim() || locationStatus === 'requesting'}
              className={`w-full py-3 px-6 rounded-lg font-semibold ${
                address.trim() && locationStatus !== 'requesting'
                  ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Bu Adresi Kullan
            </button>
            
            <button
              onClick={continueWithoutLocation}
              className="w-full py-3 px-6 text-gray-600 hover:text-gray-800 font-medium"
            >
              Konum Olmadan Devam Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
