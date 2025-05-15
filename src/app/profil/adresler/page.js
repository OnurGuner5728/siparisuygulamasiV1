'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiHome, FiMapPin, FiBriefcase, FiPlus, FiMoreVertical, FiChevronRight, FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';

export default function AddressesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  
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

  // Adres silme işlemi
  const deleteAddress = (addressId) => {
    if (confirm('Bu adresi silmek istediğinize emin misiniz?')) {
      setAddresses(addresses.filter(address => address.id !== addressId));
      setShowOptions(false);
    }
  };
  
  // Adres tipi ikonunu belirleme
  const getAddressIcon = (iconType) => {
    switch (iconType) {
      case 'home':
        return <FiHome className="text-orange-500" />;
      case 'work':
        return <FiBriefcase className="text-orange-500" />;
      default:
        return <FiMapPin className="text-orange-500" />;
    }
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
            <h1 className="text-xl font-bold text-gray-800">Adreslerim</h1>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {addresses.length === 0 ? (
          // Adres yoksa
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMapPin className="text-orange-500 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Henüz adres eklenmemiş</h3>
            <p className="text-gray-500 mb-6">Siparişleriniz için adres ekleyebilirsiniz</p>
            <Link
              href="/profil/adresler/yeni"
              className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-700"
            >
              <FiPlus className="mr-2" />
              Yeni Adres Ekle
            </Link>
          </div>
        ) : (
          // Adresler varsa
          <div className="space-y-5 mb-24">
            {addresses.map((address) => (
              <div 
                key={address.id} 
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
              >
                {address.isDefault && (
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 py-1.5 px-4">
                    <span className="text-xs font-medium text-white">Varsayılan Adres</span>
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="h-9 w-9 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                      {getAddressIcon(address.icon)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900">{address.title}</h3>
                        <div className="relative">
                          <button 
                            onClick={() => {
                              setSelectedAddressId(address.id);
                              setShowOptions(!showOptions || selectedAddressId !== address.id);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                          >
                            <FiMoreVertical />
                          </button>
                          
                          {showOptions && selectedAddressId === address.id && (
                            <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 w-48 z-10">
                              <button
                                onClick={() => router.push(`/profil/adresler/duzenle/${address.id}`)}
                                className="flex items-center w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <FiEdit2 className="mr-2 text-gray-400" />
                                Düzenle
                              </button>
                              
                              {!address.isDefault && (
                                <button
                                  onClick={() => setAsDefault(address.id)}
                                  className="flex items-center w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <FiMapPin className="mr-2 text-gray-400" />
                                  Varsayılan Yap
                                </button>
                              )}
                              
                              <button
                                onClick={() => deleteAddress(address.id)}
                                className="flex items-center w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                              >
                                <FiTrash2 className="mr-2" />
                                Sil
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mt-1 text-sm">{address.fullAddress}</p>
                      <p className="text-gray-500 text-sm">{address.district}, {address.city}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Alt buton (Sabit) */}
      {addresses.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4">
          <Link
            href="/profil/adresler/yeni"
            className="flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-700 w-full"
          >
            <FiPlus className="mr-2" />
            Yeni Adres Ekle
          </Link>
        </div>
      )}
    </div>
  );
} 