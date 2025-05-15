'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiHome, FiMapPin, FiBriefcase, FiCheck, FiNavigation2 } from 'react-icons/fi';

// Demo adresler (gerçek uygulamada API'dan gelecektir)
const demoAddresses = [
  {
    id: 'addr1',
    title: 'Ev',
    icon: 'home',
    fullName: 'Ahmet Yılmaz',
    phone: '05551234567',
    addressType: 'home',
    city: 'İstanbul',
    district: 'Bahçelievler',
    neighborhood: 'Bahçelievler Mah.',
    street: '1234 Sk.',
    buildingNo: '5',
    floor: '3',
    apartmentNo: '7',
    directions: 'Marketin karşısındaki sarı bina',
    isDefault: true
  },
  {
    id: 'addr2',
    title: 'İş',
    icon: 'work',
    fullName: 'Ahmet Yılmaz',
    phone: '05551234567',
    addressType: 'work',
    city: 'İstanbul',
    district: 'Levent',
    neighborhood: 'Levent Mah.',
    street: 'Plaza Cad.',
    buildingNo: '15',
    floor: '3',
    apartmentNo: '',
    directions: 'B Blok, Resepsiyonda bilgi verilecek',
    isDefault: false
  },
  {
    id: 'addr3',
    title: 'Annemin Evi',
    icon: 'other',
    fullName: 'Fatma Yılmaz',
    phone: '05557654321',
    addressType: 'other',
    city: 'İstanbul',
    district: 'Çamlık',
    neighborhood: 'Çamlık Mah.',
    street: 'Güneş Sk.',
    buildingNo: '12',
    floor: '2',
    apartmentNo: '4',
    directions: '',
    isDefault: false
  }
];

export default function EditAddress({ params }) {
  const router = useRouter();
  const { id } = params;
  
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
  
  // Location durumları
  const [locationStatus, setLocationStatus] = useState('initial'); // initial, requesting, granted, denied, unavailable
  const [locationError, setLocationError] = useState(null);
  
  // Sayfa yüklendiğinde adresi getir
  useEffect(() => {
    // Gerçek uygulamada API'den adres bilgisi alınır
    const address = demoAddresses.find(addr => addr.id === id);
    
    if (address) {
      setFormData({
        title: address.title,
        fullName: address.fullName,
        phone: address.phone,
        addressType: address.addressType,
        city: address.city,
        district: address.district,
        neighborhood: address.neighborhood,
        street: address.street,
        buildingNo: address.buildingNo,
        floor: address.floor,
        apartmentNo: address.apartmentNo,
        directions: address.directions,
        isDefault: address.isDefault
      });
    } else {
      // Adres bulunamazsa adresler sayfasına yönlendir
      router.push('/profil/adresler');
    }
  }, [id, router]);
  
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
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Gerçek uygulamada burada API'ye güncelleme işlemi yapılır
    console.log('Güncellenen adres:', formData);
    
    // Adresler sayfasına geri dön
    router.push('/profil/adresler');
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
            <h1 className="text-xl font-bold text-gray-800">Adresi Düzenle</h1>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 pb-28">
        {/* Konum Erişimi */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Konumumu Güncelle</h2>
            <div className="text-xs text-gray-500">Adres alanlarını güncel konumla doldurur</div>
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
                {locationStatus === 'denied' ? 'Tekrar Dene' : 'Güncel Konumumu Kullan'}
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
        
        <form id="address-form" onSubmit={handleSubmit}>
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
                  Cadde/Sokak
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  placeholder="Cadde/Sokak"
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
                    placeholder="No"
                    value={formData.buildingNo}
                    onChange={handleChange}
                    required
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
                    Daire
                  </label>
                  <input
                    type="text"
                    id="apartmentNo"
                    name="apartmentNo"
                    placeholder="Daire"
                    value={formData.apartmentNo}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="directions">
                  Adres Tarifi (İsteğe Bağlı)
                </label>
                <textarea
                  id="directions"
                  name="directions"
                  placeholder="Apartman girişi, zil, kapı rengi vb. detaylar"
                  value={formData.directions}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Varsayılan Adres */}
          <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-3 text-gray-700 font-medium">Bu adresi varsayılan adresim yap</span>
            </label>
          </div>
        </form>
      </div>
      
      {/* Alt Butonlar (Sabit) */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4">
        <button
          type="submit"
          form="address-form"
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-3 px-4 rounded-lg shadow-sm hover:from-orange-600 hover:to-red-700"
        >
          Değişiklikleri Kaydet
        </button>
      </div>
    </div>
  );
} 