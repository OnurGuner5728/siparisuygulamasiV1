'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiHome, FiMapPin, FiBriefcase, FiCheck, FiNavigation2 } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

export default function EditAddress() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const addressId = params.id;
  
  // Form durumu
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    phone: '',
    addressType: 'home',
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
  
  // Loading durumları
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationStatus, setLocationStatus] = useState('initial');
  const [locationError, setLocationError] = useState(null);
  
  // Adres tipi seçenekleri
  const addressTypes = [
    { id: 'home', name: 'Ev', icon: <FiHome /> },
    { id: 'work', name: 'İş', icon: <FiBriefcase /> },
    { id: 'other', name: 'Diğer', icon: <FiMapPin /> }
  ];
  
  // Adresi yükle
  useEffect(() => {
    const loadAddress = async () => {
      if (!user || !addressId) return;
      
      try {
        setLoading(true);
        const addresses = await api.getUserAddresses(user.id);
        const address = addresses.find(addr => addr.id === addressId);
        
        if (address) {
          // Veritabanından gelen adresi form formatına çevir
          const fullAddressParts = address.full_address?.split(' - ') || ['', ''];
          const addressPart = fullAddressParts[0] || '';
          const directions = fullAddressParts[1] || '';
          
          // Adres parçalarını ayır (basit parsing)
          const addressTokens = addressPart.split(' ');
          let street = '', buildingNo = '', floor = '', apartmentNo = '';
          
          for (let i = 0; i < addressTokens.length; i++) {
            const token = addressTokens[i];
            if (token.startsWith('No:')) {
              buildingNo = token.replace('No:', '');
            } else if (token.startsWith('Kat:')) {
              floor = token.replace('Kat:', '');
            } else if (token.startsWith('Daire:')) {
              apartmentNo = token.replace('Daire:', '');
            } else if (!token.includes(':')) {
              street += (street ? ' ' : '') + token;
            }
          }
          
          setFormData({
            title: address.title || '',
            fullName: address.full_name || '',
            phone: address.phone || '',
            addressType: address.type || 'home',
            city: address.city || '',
            district: address.district || '',
            neighborhood: address.neighborhood || '',
            street: street,
            buildingNo: buildingNo,
            floor: floor,
            apartmentNo: apartmentNo,
            directions: directions,
            isDefault: address.is_default || false
          });
        } else {
          alert('Adres bulunamadı');
          router.push('/profil/adresler');
        }
      } catch (error) {
        console.error('Adres yükleme hatası:', error);
        alert('Adres yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    loadAddress();
  }, [user, addressId, router]);
  
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
        setLocationStatus('granted');
        
        // Demo olarak sabit değer kullanıyoruz
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
      setSaving(true);
      
      // Adres verilerini hazırla
      const fullAddress = `${formData.street} ${formData.buildingNo ? 'No:' + formData.buildingNo : ''} ${formData.floor ? 'Kat:' + formData.floor : ''} ${formData.apartmentNo ? 'Daire:' + formData.apartmentNo : ''}`.trim();
      
      const addressData = {
        title: formData.title,
        type: formData.addressType,
        full_name: formData.fullName,
        phone: formData.phone,
        city: formData.city,
        district: formData.district,
        neighborhood: formData.neighborhood,
        full_address: fullAddress + (formData.directions ? ` - ${formData.directions}` : ''),
        is_default: formData.isDefault
      };
      
      console.log('Adres güncelleme:', addressData);
      
      // API'ye güncelleme işlemi
      const result = await api.updateAddress(addressId, addressData);
      
      if (result) {
        alert('Adres başarıyla güncellendi!');
        router.push('/profil/adresler');
      } else {
        alert('Adres güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Adres güncelleme hatası:', error);
      alert('Adres güncellenirken bir hata oluştu: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Adres yükleniyor...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-xl font-bold text-gray-800">Adres Düzenle</h1>
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
                disabled={saving}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium py-3 px-4 rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  'Adresi Güncelle'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 