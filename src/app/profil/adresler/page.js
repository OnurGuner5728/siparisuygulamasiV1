'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import AuthGuard from '../../../components/AuthGuard';
import ProfileSidebar from '../../../components/ProfileSidebar';
import { useRouter } from 'next/navigation';
import { FiHome, FiMapPin, FiBriefcase, FiPlus, FiMoreVertical, FiChevronRight, FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import api from '@/lib/api';

export default function AddressesPage() {
  return (
    <AuthGuard requiredRole="any_auth">
      <AddressesContent />
    </AuthGuard>
  );
}

function AddressesContent() {
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
        console.log('📍 Adresler yüklendi:', userAddresses);
        setAddresses(userAddresses || []);
      } catch (error) {
        console.error('❌ Adresler yüklenirken hata:', error);
        setAddresses([]);
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
      console.log('🔄 Varsayılan adres ayarlanıyor:', addressId);
      
      // Önce tüm adresleri varsayılan olmaktan çıkar
      for (const addr of addresses) {
        if (addr.is_default && addr.id !== addressId) {
          await api.updateAddress(addr.id, { is_default: false });
        }
      }
      
      // Seçilen adresi varsayılan yap
      await api.updateAddress(addressId, { is_default: true });
      
      // Local state'i güncelle
      setAddresses(addresses.map(addr => ({
        ...addr,
        is_default: addr.id === addressId
      })));
      
      setShowOptions(false);
      console.log('✅ Varsayılan adres ayarlandı');
    } catch (error) {
      console.error('❌ Varsayılan adres ayarlanırken hata:', error);
      alert('Varsayılan adres ayarlanırken bir hata oluştu');
    }
  };

  // Adres silme işlemi
  const deleteAddress = async (addressId) => {
    if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      console.log('🗑️ Adres siliniyor:', addressId);
      await api.deleteAddress(addressId);
      
      // Local state'den kaldır
      setAddresses(addresses.filter(address => address.id !== addressId));
      setShowOptions(false);
      console.log('✅ Adres silindi');
    } catch (error) {
      console.error('❌ Adres silinirken hata:', error);
      alert('Adres silinirken bir hata oluştu');
    }
  };
  
  // Adres tipi ikonunu belirleme
  const getAddressIcon = (addressType) => {
    switch (addressType) {
      case 'home':
        return <FiHome className="text-blue-500" size={20} />;
      case 'work':
        return <FiBriefcase className="text-blue-500" size={20} />;
      default:
        return <FiMapPin className="text-blue-500" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row">
            <ProfileSidebar activeTab="addresses" />
            
            <div className="md:flex-1 md:ml-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:gap-8">
          <ProfileSidebar activeTab="addresses" />
          
          <div className="md:flex-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Adreslerim</h2>
                    <p className="text-gray-600 text-sm mt-1">Teslimat adreslerinizi yönetin</p>
                  </div>
                  <button 
                    onClick={() => router.push('/profil/adresler/yeni')}
                    className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FiPlus className="mr-2" size={18} />
                    Yeni Adres
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {addresses.length === 0 ? (
                  // Adres yoksa
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiMapPin size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Henüz adres eklenmemiş</h3>
                    <p className="text-gray-500 mb-6">Hızlı teslimat için adres bilgilerinizi ekleyin</p>
                    <button 
                      onClick={() => router.push('/profil/adresler/yeni')}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      İlk Adresimi Ekle
                    </button>
                  </div>
                ) : (
                  // Adresler varsa
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div 
                        key={address.id} 
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
                      >
                        {address.is_default && (
                          <div className="bg-blue-50 border-b border-blue-200 py-2 px-4">
                            <span className="text-xs font-medium text-blue-800 flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              Varsayılan Adres
                            </span>
                          </div>
                        )}
                        
                        <div className="p-4">
                          <div className="flex items-start">
                            <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                              {getAddressIcon(address.type)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-gray-900">{address.title || 'Adres'}</h3>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {address.type === 'home' ? 'Ev' : address.type === 'work' ? 'İş' : 'Diğer'} Adresi
                                  </p>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {!address.is_default && (
                                    <button
                                      onClick={() => setAsDefault(address.id)}
                                      className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
                                      title="Varsayılan Yap"
                                    >
                                      <FiMapPin size={16} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => router.push(`/profil/adresler/duzenle/${address.id}`)}
                                    className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
                                    title="Düzenle"
                                  >
                                    <FiEdit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => deleteAddress(address.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                                    title="Sil"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                </div>
                              </div>
                              
                              <p className="text-gray-600 mt-2 text-sm leading-relaxed">{address.full_address}</p>
                              <p className="text-gray-500 text-sm mt-1">{address.district}, {address.city}</p>
                              {(address.full_name || address.phone) && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                  <span className="text-gray-500 text-xs">
                                    {address.full_name && <span>{address.full_name}</span>}
                                    {address.full_name && address.phone && <span> • </span>}
                                    {address.phone && <span>{address.phone}</span>}
                                  </span>
                                </div>
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
          </div>
        </div>
      </div>
      </div>
  );
} 
