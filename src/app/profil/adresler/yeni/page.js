'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiHome, FiMapPin, FiBriefcase, FiCheck, FiNavigation2 } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

export default function NewAddress() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Form durumu
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    phone: '',
    addressType: 'home', // home, work, other
    city: '',
    district: '',
    neighborhood: '',
    street: '',
    buildingNo: '',
    floor: '',
    apartmentNo: '',
    directions: '',
    isDefault: false
  });
  
  // Loading durumu
  const [loading, setLoading] = useState(false);
  
  // Location durumları
  const [locationStatus, setLocationStatus] = useState('initial'); // initial, requesting, granted, denied, unavailable
  const [locationError, setLocationError] = useState(null);
  
  // Adres tipi seçenekleri
  const addressTypes = [
    { id: 'home', name: 'Ev', icon: <FiHome /> },
    { id: 'work', name: 'İş', icon: <FiBriefcase /> },
    { id: 'other', name: 'Diğer', icon: <FiMapPin /> }
  ];
  
  // Form değişikliği işleyicisi
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Adres tipi seçim değişikliği
  const handleAddressTypeChange = (type) => {
    setFormData({
      ...formData,
      addressType: type
    });
  };
  
  // Konum erişimi iste
  const requestLocationAccess = () => {
    setLocationStatus('requesting');
    
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      setLocationError('Tarayıcınız konum servisini desteklemiyor.');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Başarılı konum alma işlemi
        setLocationStatus('granted');
        
        // Gerçek uygulamada bu koordinatlarla bir geocoding API'sine istek yapılır
        // ve adres bilgileri alınır. Burada demo olarak sabit değer kullanıyoruz
        setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            city: 'İstanbul',
            district: 'Bahçelievler',
            neighborhood: 'Bahçelievler Mahallesi',
            street: 'Cumhuriyet Caddesi'
          }));
        }, 1000);
      },
      (error) => {
        setLocationStatus('denied');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Konum erişim izni reddedildi.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Konum bilgisi kullanılamıyor.');
            break;
          case error.TIMEOUT:
            setLocationError('Konum bilgisi alınırken zaman aşımı oluştu.');
            break;
          default:
            setLocationError('Konum alınırken bilinmeyen bir hata oluştu.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Lütfen giriş yapın');
      return;
    }
    
    try {
      setLoading(true);
      
      // Adres verilerini hazırla - veritabanı şemasına uygun
      const fullAddress = `${formData.street} ${formData.buildingNo ? 'No:' + formData.buildingNo : ''} ${formData.floor ? 'Kat:' + formData.floor : ''} ${formData.apartmentNo ? 'Daire:' + formData.apartmentNo : ''}`.trim();
      
      const addressData = {
        user_id: user.id,
        title: formData.title,
        type: formData.addressType, // Veritabanında 'type' alanı var
        full_name: formData.fullName,
        phone: formData.phone,
        city: formData.city,
        district: formData.district,
        neighborhood: formData.neighborhood,
        full_address: fullAddress + (formData.directions ? ` - ${formData.directions}` : ''),
        postal_code: null, // Şimdilik null
        is_default: formData.isDefault
      };
      
      console.log('Yeni adres:', addressData);
      
      // API'ye kayıt işlemi
      const result = await api.createAddress(addressData);
      
      if (result) {
        // Başarılı kayıt
        alert('Adres başarıyla eklendi!');
        router.push('/profil/adresler');
      } else {
        alert('Adres eklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Adres ekleme hatası:', error);
      alert('Adres eklenirken bir hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Başlık */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              className="mr-3 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              aria-label="Geri"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Yeni Adres Ekle</h1>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 pb-28">
        {/* Konum Erişimi */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Konumumu Kullan</h2>
            <div className="text-xs text-gray-500">Adres alanlarını otomatik doldurur</div>
          </div>
          
          <button
            type="button"
            onClick={requestLocationAccess}
            className={`w-full flex items-center justify-center ${
              locationStatus === 'granted' 
                ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
            } font-medium py-3 px-4 rounded-lg transition-colors duration-200`}
            disabled={locationStatus === 'requesting'}
          >
            {locationStatus === 'requesting' ? (
              <>
                <div className="mr-2 animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-700"></div>
                Konum Alınıyor...
              </>
            ) : locationStatus === 'granted' ? (
              <>
                <FiCheck className="mr-2" size={18} />
                Konum Alındı
              </>
            ) : (
              <>
                <FiNavigation2 className="mr-2" size={18} />
                {locationStatus === 'denied' ? 'Tekrar Dene' : 'Konumumu Kullan'}
              </>
            )}
          </button>
          
          {locationStatus === 'denied' && (
            <div className="mt-3 text-sm text-red-600">
              {locationError} Lütfen tarayıcı ayarlarınızdan konum iznini etkinleştirin veya adresi manuel olarak girin.
            </div>
          )}
          
          {locationStatus === 'unavailable' && (
            <div className="mt-3 text-sm text-red-600">
              {locationError} Lütfen adresi manuel olarak girin.
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Adres Tipi Seçimi */}
          <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Adres Tipi</h2>
            
            <div className="grid grid-cols-3 gap-3">
              {addressTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleAddressTypeChange(type.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                    formData.addressType === type.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-3 rounded-full mb-2 ${
                    formData.addressType === type.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {type.icon}
                  </div>
                  <span className={`text-sm font-medium ${
                    formData.addressType === type.id ? 'text-orange-600' : 'text-gray-700'
                  }`}>
                    {type.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Adres Başlığı ve Kişisel Bilgiler */}
          <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Kişisel Bilgiler</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                  Adres Başlığı
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Örn: Evim, İş Yerim, Annemin Evi"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Teslimat yapılacak kişi"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="05XX XXX XXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          {/* Adres Detayları */}
          <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Adres Detayları</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="city">
                    İl
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    placeholder="İl"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="district">
                    İlçe
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    placeholder="İlçe"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="neighborhood">
                  Mahalle
                </label>
                <input
                  type="text"
                  id="neighborhood"
                  name="neighborhood"
                  placeholder="Mahalle"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="street">
                  Sokak/Cadde
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  placeholder="Sokak/Cadde"
                  value={formData.street}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="buildingNo">
                    Bina No
                  </label>
                  <input
                    type="text"
                    id="buildingNo"
                    name="buildingNo"
                    placeholder="Bina No"
                    value={formData.buildingNo}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="floor">
                    Kat
                  </label>
                  <input
                    type="text"
                    id="floor"
                    name="floor"
                    placeholder="Kat"
                    value={formData.floor}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="apartmentNo">
                    Daire No
                  </label>
                  <input
                    type="text"
                    id="apartmentNo"
                    name="apartmentNo"
                    placeholder="Daire No"
                    value={formData.apartmentNo}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="directions">
                  Tarif (Opsiyonel)
                </label>
                <textarea
                  id="directions"
                  name="directions"
                  placeholder="Adres tarifi, ek bilgiler..."
                  value={formData.directions}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
          
          {/* Varsayılan Adres */}
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">
                Bu adresi varsayılan adres olarak ayarla
              </span>
            </label>
          </div>
          
          {/* Kaydet Butonu */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <div className="container mx-auto">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium py-3 px-4 rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  'Adresi Kaydet'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 