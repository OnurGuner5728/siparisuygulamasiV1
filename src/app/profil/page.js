'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import AuthGuard from '../../components/AuthGuard';
import ProfileSidebar from '../../components/ProfileSidebar';
import { 
  FiEdit, 
  FiUser, 
  FiShield, 
  FiPhone, 
  FiMail,
  FiShoppingBag, 
  FiHeart, 
  FiMapPin, 
  FiCreditCard,
  FiStar,
  FiCalendar,
  FiTrendingUp,
  FiSettings,
  FiClock,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { getUserStats } from '@/lib/api';

export default function Profile() {
  return (
    <AuthGuard requiredRole="any_auth">
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        console.log('🔍 Debug - User object:', user);
        console.log('🔍 Debug - User bilgileri:', {
          id: user?.id,
          email: user?.email,
          name: user?.name,
          first_name: user?.first_name,
          last_name: user?.last_name,
          phone: user?.phone,
          status: user?.status,
          role: user?.role
        });
        
        // Kullanıcı istatistiklerini database'den çek
        const stats = await getUserStats(user?.id);
        setUserStats(stats);
      } catch (error) {
        console.error('Kullanıcı istatistikleri yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserStats();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row">
            <ProfileSidebar activeTab="profile" />
            
            <div className="md:flex-1 md:ml-8">
              <div className="space-y-6">
                {/* Loading skeleton */}
                <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Kullanıcı bilgisi yüklenemedi</h2>
          <p className="text-gray-500">Lütfen sayfayı yenileyin veya tekrar giriş yapın.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Tarih formatlanırken hata:', error);
      return 'Geçersiz tarih';
    }
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return { name: 'Yönetici', color: 'red', icon: FiShield };
      case 'store':
        return { name: 'Mağaza Sahibi', color: 'orange', icon: FiShoppingBag };
      default:
        return { name: 'Müşteri', color: 'green', icon: FiUser };
    }
  };

  const roleInfo = getRoleInfo(user?.role);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:gap-8">
          <ProfileSidebar activeTab="profile" />
          
          <div className="md:flex-1 space-y-6">
            {/* Modern Profile Header */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-20 md:h-32 relative">
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
              
              <div className="relative px-6 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 md:-mt-16">
                  <div className="flex flex-col sm:flex-row sm:items-end">
                    {/* Avatar */}
                    <div className="relative self-center sm:self-auto">
                      <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-1 shadow-xl">
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                          {user?.avatar_url ? (
                            <img 
                              src={user.avatar_url} 
                              alt={user?.name || 'Kullanıcı'} 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            user?.name?.charAt(0)?.toUpperCase() || 'U'
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* User Info */}
                    <div className="sm:ml-6 sm:pb-2 text-center sm:text-left mt-4 sm:mt-0">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                        {user?.name || 'Kullanıcı'}
                      </h1>
                      <div className="flex items-center justify-center sm:justify-start text-gray-600 mb-2">
                        <FiMail className="w-4 h-4 mr-2" />
                        <span className="text-sm md:text-base">{user?.email}</span>
                      </div>
                      {user?.phone && (
                        <div className="flex items-center justify-center sm:justify-start text-gray-600 mb-3">
                          <FiPhone className="w-4 h-4 mr-2" />
                          <span className="text-sm md:text-base">{user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-center sm:justify-start">
                        <div 
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: roleInfo.color === 'red' ? '#fee2e2' : 
                                           roleInfo.color === 'orange' ? '#fef3c7' : '#dcfce7',
                            color: roleInfo.color === 'red' ? '#991b1b' : 
                                   roleInfo.color === 'orange' ? '#92400e' : '#166534'
                          }}
                        >
                          <roleInfo.icon className="w-4 h-4 mr-1" />
                          {roleInfo.name}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="mt-6 sm:mt-0">
                    <Link
                      href="/profil/duzenle"
                      className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <FiEdit className="w-4 h-4 mr-2" />
                      Profili Düzenle
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard
                title="Siparişler"
                value={userStats?.total_orders || 0}
                icon={FiShoppingBag}
                color="blue"
                href="/profil/siparisler"
              />
              <StatsCard
                title="Favoriler"
                value={userStats?.total_favorites || 0}
                icon={FiHeart}
                color="red"
                href="/profil/favorilerim"
              />
              <StatsCard
                title="Adresler"
                value={userStats?.total_addresses || 0}
                icon={FiMapPin}
                color="green"
                href="/profil/adresler"
              />
              <StatsCard
                title="Ödemeler"
                value={userStats?.total_payment_methods || 0}
                icon={FiCreditCard}
                color="purple"
                href="/profil/odemelerim"
              />
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FiUser className="w-5 h-5 mr-3 text-blue-500" />
                Hesap Detayları
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <InfoItem
                    label="Ad"
                    value={user?.first_name || user?.firstName || 'Belirtilmemiş'}
                    icon={FiUser}
                  />
                  <InfoItem
                    label="Soyad"
                    value={user?.last_name || user?.lastName || 'Belirtilmemiş'}
                    icon={FiUser}
                  />
                  <InfoItem
                    label="E-posta"
                    value={user?.email || 'Belirtilmemiş'}
                    icon={FiMail}
                  />
                  <InfoItem
                    label="Telefon"
                    value={user?.phone || 'Belirtilmemiş'}
                    icon={FiPhone}
                  />
                </div>
                
                <div className="space-y-6">
                  <InfoItem
                    label="Hesap Durumu"
                    value={
                      <div className="flex items-center">
                        {(user?.status === 'active' || !user?.status) ? (
                          <>
                            <FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-green-700 font-medium">Aktif</span>
                          </>
                        ) : (
                          <>
                            <FiXCircle className="w-4 h-4 text-red-500 mr-2" />
                            <span className="text-red-700 font-medium">Pasif</span>
                          </>
                        )}
                      </div>
                    }
                    icon={FiShield}
                  />
                  <InfoItem
                    label="Hesap Türü"
                    value={
                      <div className="flex items-center">
                        <roleInfo.icon className="w-4 h-4 mr-2" style={{ color: roleInfo.color === 'red' ? '#dc2626' : roleInfo.color === 'orange' ? '#f59e0b' : '#059669' }} />
                        <span className="font-medium">{roleInfo.name}</span>
                      </div>
                    }
                    icon={FiShield}
                  />
                  <InfoItem
                    label="Kayıt Tarihi"
                    value={user?.created_at ? formatDate(user.created_at) : 'Belirtilmemiş'}
                    icon={FiCalendar}
                  />
                  <InfoItem
                    label="Son Güncelleme"
                    value={user?.updated_at ? formatDate(user.updated_at) : 'Belirtilmemiş'}
                    icon={FiClock}
                  />
                </div>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FiTrendingUp className="w-5 h-5 mr-3 text-blue-500" />
                Hesap İstatistikleri
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">
                    {userStats?.total_orders || 0}
                  </div>
                  <div className="text-sm text-blue-500 font-medium">Toplam Sipariş</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                  <div className="text-2xl font-bold text-red-600">
                    {userStats?.total_favorites || 0}
                  </div>
                  <div className="text-sm text-red-500 font-medium">Favori</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">
                    {userStats?.total_addresses || 0}
                  </div>
                  <div className="text-sm text-green-500 font-medium">Adres</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">
                    {userStats?.total_reviews || 0}
                  </div>
                  <div className="text-sm text-purple-500 font-medium">Değerlendirme</div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}

// Modern Stat Card Component
function StatsCard({ title, value, icon: Icon, color, href }) {
  const getColors = (color) => {
    switch (color) {
      case 'blue':
        return { bg: 'from-blue-50 to-blue-100', text: '#2563eb', textBold: '#1d4ed8', iconBg: '#3b82f6' };
      case 'red':
        return { bg: 'from-red-50 to-red-100', text: '#dc2626', textBold: '#b91c1c', iconBg: '#ef4444' };
      case 'green':
        return { bg: 'from-green-50 to-green-100', text: '#16a34a', textBold: '#15803d', iconBg: '#22c55e' };
      case 'purple':
        return { bg: 'from-purple-50 to-purple-100', text: '#9333ea', textBold: '#7c3aed', iconBg: '#a855f7' };
      default:
        return { bg: 'from-gray-50 to-gray-100', text: '#6b7280', textBold: '#4b5563', iconBg: '#6b7280' };
    }
  };

  const colors = getColors(color);

  return (
    <Link href={href}>
      <div className={`bg-gradient-to-br ${colors.bg} p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1 border border-gray-100`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: colors.text }}>{title}</p>
            <p className="text-2xl font-bold" style={{ color: colors.textBold }}>{value}</p>
          </div>
          <div 
            className="p-3 rounded-full text-white shadow-lg"
            style={{ backgroundColor: colors.iconBg }}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// Info Item Component
function InfoItem({ label, value, icon: Icon }) {
  const renderValue = () => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">Belirtilmemiş</span>;
    }
    
    if (typeof value === 'string') {
      return value || <span className="text-gray-400 italic">Belirtilmemiş</span>;
    }
    
    if (typeof value === 'number') {
      return value.toString();
    }
    
    // React component'i ise direkt render et
    return value;
  };

  return (
    <div className="flex items-start">
      <div className="p-2 bg-gray-100 rounded-lg mr-3 mt-1">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <div className="text-gray-900 font-medium">
          {renderValue()}
        </div>
      </div>
    </div>
  );
} 