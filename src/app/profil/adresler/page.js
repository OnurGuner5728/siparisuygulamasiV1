'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';

export default function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    phone: '',
    city: '',
    district: '',
    neighborhood: '',
    fullAddress: '',
    isDefault: false
  });

  // Kullanıcının adres verilerini yükleme
  useEffect(() => {
    // API çağrısı simülasyonu
    setTimeout(() => {
      // Kullanıcının adreslerini mockUsers'dan al
      // Normalde bu veriler API'den gelecek
      if (user && user.addresses) {
        setAddresses(user.addresses);
      } else {
        // Eğer kullanıcı adresleri yoksa boş dizi göster
        setAddresses([]);
      }
      setLoading(false);
    }, 1000);
  }, [user]);

  // Form verilerini güncelle
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Yeni adres ekle
  const handleAddAddress = (e) => {
    e.preventDefault();
    
    const newAddress = {
      id: Date.now(), // Gerçek uygulamada API bir ID atayacak
      ...formData
    };
    
    // Varsayılan adres işaretlendiyse diğerlerini false yap
    if (newAddress.isDefault) {
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: false
      })));
    }
    
    setAddresses([...addresses, newAddress]);
    setShowAddForm(false);
    
    // Form verilerini sıfırla
    setFormData({
      title: '',
      fullName: '',
      phone: '',
      city: '',
      district: '',
      neighborhood: '',
      fullAddress: '',
      isDefault: false
    });
    
    // Gerçek uygulamada burada API'ye PATCH isteği yapılır
    // Kullanıcı bilgileri güncellenir
  };

  // Adres düzenle
  const handleEditAddress = (e) => {
    e.preventDefault();
    
    const updatedAddress = {
      ...editingAddress,
      ...formData
    };
    
    // Varsayılan adres işaretlendiyse diğerlerini false yap
    if (updatedAddress.isDefault && !editingAddress.isDefault) {
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === updatedAddress.id ? true : false
      })));
    } else {
      setAddresses(addresses.map(addr => 
        addr.id === updatedAddress.id ? updatedAddress : addr
      ));
    }
    
    setEditingAddress(null);
    
    // Form verilerini sıfırla
    setFormData({
      title: '',
      fullName: '',
      phone: '',
      city: '',
      district: '',
      neighborhood: '',
      fullAddress: '',
      isDefault: false
    });
  };

  // Adres sil
  const handleDeleteAddress = (id) => {
    const isDefaultAddress = addresses.find(addr => addr.id === id)?.isDefault;
    
    // Adres listesinden çıkar
    const newAddresses = addresses.filter(addr => addr.id !== id);
    
    // Eğer silinen adres varsayılan ise ve başka adresler varsa, ilk adresi varsayılan yap
    if (isDefaultAddress && newAddresses.length > 0) {
      newAddresses[0].isDefault = true;
    }
    
    setAddresses(newAddresses);
  };

  // Düzenleme için adres seç
  const startEditingAddress = (address) => {
    setEditingAddress(address);
    setFormData({
      title: address.title,
      fullName: address.fullName,
      phone: address.phone,
      city: address.city,
      district: address.district,
      neighborhood: address.neighborhood,
      fullAddress: address.fullAddress,
      isDefault: address.isDefault
    });
  };

  // Varsayılan adres olarak işaretle
  const setAsDefault = (id) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Adres bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Üst başlık ve geri dönüş linki */}
      <div className="mb-8 flex items-center">
        <Link href="/profil" className="text-indigo-600 hover:text-indigo-800 mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold">Adreslerim</h1>
      </div>
      
      {/* Yeni adres ekleme butonu */}
      {!showAddForm && !editingAddress && (
        <button 
          onClick={() => setShowAddForm(true)}
          className="mb-6 flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Yeni Adres Ekle
        </button>
      )}
      
      {/* Adres ekleme/düzenleme formu */}
      {(showAddForm || editingAddress) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
          </h2>
          <form onSubmit={editingAddress ? handleEditAddress : handleAddAddress}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
                  Adres Başlığı
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Örn: Ev, İş, Yazlık"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="fullName">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Teslimat için ad soyad"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="0555 123 4567"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="city">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="district">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="neighborhood">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="fullAddress">
                Açık Adres
              </label>
              <textarea
                id="fullAddress"
                name="fullAddress"
                placeholder="Cadde, sokak, bina no, daire no"
                value={formData.fullAddress}
                onChange={handleChange}
                rows="3"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Bu adresi varsayılan adresim yap</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAddress(null);
                  setFormData({
                    title: '',
                    fullName: '',
                    phone: '',
                    city: '',
                    district: '',
                    neighborhood: '',
                    fullAddress: '',
                    isDefault: false
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-300"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors duration-300"
              >
                {editingAddress ? 'Kaydet' : 'Adres Ekle'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Adres listesi */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500 mb-4">Henüz kayıtlı adresiniz bulunmuyor.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              İlk Adresinizi Ekleyin
            </button>
          </div>
        ) : (
          addresses.map((address) => (
            <div 
              key={address.id} 
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${address.isDefault ? 'border-indigo-600' : 'border-transparent'}`}
            >
              <div className="flex justify-between mb-2">
                <div className="flex items-center">
                  <h3 className="text-lg font-bold">{address.title}</h3>
                  {address.isDefault && (
                    <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                      Varsayılan
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => startEditingAddress(address)}
                    className="text-gray-600 hover:text-indigo-600"
                    title="Düzenle"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDeleteAddress(address.id)}
                    className="text-gray-600 hover:text-red-600"
                    title="Sil"
                    disabled={addresses.length === 1} // Son adresi silmeyi engelle
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="mb-2">
                <p className="text-gray-800">{address.fullName}</p>
                <p className="text-gray-600 text-sm">{address.phone}</p>
              </div>
              
              <div className="text-gray-700">
                <p>{address.neighborhood}, {address.fullAddress}</p>
                <p>{address.district}/{address.city}</p>
              </div>
              
              {!address.isDefault && (
                <button
                  onClick={() => setAsDefault(address.id)}
                  className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Varsayılan Yap
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 