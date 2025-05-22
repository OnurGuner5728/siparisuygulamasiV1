'use client';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FiUser, 
  FiShoppingBag, 
  FiHeart, 
  FiMapPin, 
  FiCreditCard,
  FiMessageSquare,
  FiSettings,
  FiLogOut
} from 'react-icons/fi';

export default function ProfileSidebar({ activeTab = 'profile' }) {
  const { user, logout } = useAuth();
  
  const menuItems = [
    {
      id: 'profile',
      name: 'Profil Bilgilerim',
      href: '/profil',
      icon: FiUser
    },
    {
      id: 'orders',
      name: 'Siparişlerim',
      href: '/profil/siparisler',
      icon: FiShoppingBag
    },
    {
      id: 'favorites',
      name: 'Favorilerim',
      href: '/profil/favorilerim',
      icon: FiHeart
    },
    {
      id: 'addresses',
      name: 'Adreslerim',
      href: '/profil/adreslerim',
      icon: FiMapPin
    },
    {
      id: 'payments',
      name: 'Ödeme Yöntemlerim',
      href: '/profil/odemelerim',
      icon: FiCreditCard
    },
    {
      id: 'reviews',
      name: 'Değerlendirmelerim',
      href: '/profil/yorumlar',
      icon: FiMessageSquare
    },
    {
      id: 'settings',
      name: 'Hesap Ayarları',
      href: '/profil/ayarlar',
      icon: FiSettings
    }
  ];
  
  return (
    <div className="w-full md:w-64 bg-white rounded-lg shadow-md overflow-hidden">
      {/* Profil özeti */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-3">
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user?.name || 'Kullanıcı'} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <FiUser className="w-6 h-6 text-gray-500" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-800">{user?.name || 'Kullanıcı'}</div>
            <div className="text-sm text-gray-500">{user?.email || ''}</div>
          </div>
        </div>
      </div>
      
      {/* Menü öğeleri */}
      <nav className="p-2">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link 
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-md ${
                  activeTab === item.id 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${
                  activeTab === item.id ? 'text-blue-600' : 'text-gray-500'
                }`} />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
          
          {/* Çıkış yap butonu */}
          <li>
            <button 
              onClick={logout}
              className="w-full flex items-center px-4 py-3 rounded-md text-red-600 hover:bg-gray-50"
            >
              <FiLogOut className="w-5 h-5 mr-3 text-red-500" />
              <span>Çıkış Yap</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
} 