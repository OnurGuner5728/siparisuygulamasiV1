'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiHome, FiMapPin, FiBriefcase, FiPlus, FiMoreVertical, FiChevronRight, FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import api from '@/lib/api';

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
    const loadAddresses = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userAddresses = await api.getUserAddresses(user.id);
        setAddresses(userAddresses);
      } catch (error) {
        console.error('Adresler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAddresses();
  }, [user]);
  
  // Dropdown menü dışına tıklandığında menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptions && !event.target.closest('.address-menu-container')) {
        setShowOptions(false);
        setSelectedAddressId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);

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

     const setAsDefault = async (addressId) => {
         try {        
           for (const addr of addresses) {  
                  if (addr.is_default && addr.id !== addressId) {      
                        await api.updateAddress(addr.id, { is_default: false });    
                          }      } 
                       await api.updateAddress(addressId, { is_default: true });     
                                    setAddresses(addresses.map(addr => ({ 
                                             ...addr,        is_default: addr.id === addressId  
                                                })));     
                                                 setShowOptions(false);    
                                                } catch (error) {     
                                                   console.error('Varsayılan adres ayarlanırken hata:', error);     
                                                    alert('Varsayılan adres ayarlanırken bir hata oluştu');    }  };

  // Adres silme işlemi
  const deleteAddress = async (addressId) => {
    if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      await api.deleteAddress(addressId);
      
      // Local state'den kaldır
      setAddresses(addresses.filter(address => address.id !== addressId));
      setShowOptions(false);
    } catch (error) {
      console.error('Adres silinirken hata:', error);
      alert('Adres silinirken bir hata oluştu');
    }
  };
  
  // Adres tipi ikonunu belirleme
  const getAddressIcon = (addressType) => {
    switch (addressType) {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Adresler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Başlık */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">Adreslerim</h1>
            <button 
              onClick={() => router.push('/profil/adresler/yeni')}
              className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:shadow-md transition-all"
            >
              <FiPlus className="mr-2" size={18} />
              Yeni Adres
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {addresses.length === 0 ? (
          // Adres yoksa
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiMapPin size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">Henüz adres eklenmemiş</h2>
            <p className="text-gray-500 mb-8">Hızlı teslimat için adres bilgilerinizi ekleyin</p>
            <button 
              onClick={() => router.push('/profil/adresler/yeni')}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:shadow-md transition-all"
            >
              İlk Adresimi Ekle
            </button>
          </div>
        ) : (
          // Adresler varsa
          <div className="space-y-5 mb-24">
            {addresses.map((address) => (
              <div 
                key={address.id} 
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
              >
                {address.is_default && (
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 py-1.5 px-4">
                    <span className="text-xs font-medium text-white">Varsayılan Adres</span>
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="h-9 w-9 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                      {getAddressIcon(address.type)}
                    </div>
                    
                                                            <div className="flex-1">                      <div className="flex justify-between items-start">                        <div>                          <h3 className="font-medium text-gray-900">{address.title}</h3>                        </div>                        <div className="flex items-center space-x-2">                          {!address.is_default && (                            <button                              onClick={() => setAsDefault(address.id)}                              className="p-2 text-gray-400 hover:text-orange-500 rounded-full hover:bg-orange-50 transition-colors"                              title="Varsayılan Yap"                            >                              <FiMapPin size={18} />                            </button>                          )}                          <button                            onClick={() => router.push(`/profil/adresler/duzenle/${address.id}`)}                            className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors"                            title="Düzenle"                          >                            <FiEdit2 size={18} />                          </button>                          <button                            onClick={() => deleteAddress(address.id)}                            className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"                            title="Sil"                          >                            <FiTrash2 size={18} />                          </button>                        </div>                      </div>
                      
                      <p className="text-gray-600 mt-1 text-sm">{address.full_address}</p>
                      <p className="text-gray-500 text-sm">{address.district}, {address.city}</p>
                      {address.full_name && (
                        <p className="text-gray-500 text-sm mt-1">{address.full_name} - {address.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 