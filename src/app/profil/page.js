'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import AuthGuard from '../../components/AuthGuard';

export default function Profile() {
  return (
    <AuthGuard requiredRole="any_auth">
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Profil verilerini yükleme simülasyonu
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profilim</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-6">
          <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-white text-2xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Hesap Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Rol</p>
              <p>{user.role === 'user' ? 'Müşteri' : user.role === 'admin' ? 'Admin' : 'Mağaza'}</p>
            </div>
            {user.role === 'store' && (
              <div>
                <p className="text-sm text-gray-500">Mağaza Durumu</p>
                <p>
                  {user.storeInfo?.approved 
                    ? <span className="text-green-600">Onaylanmış</span> 
                    : <span className="text-red-600">Onay Bekliyor</span>}
                </p>
              </div>
            )}
          </div>
        </div>
        </div>
        
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProfileCard 
          title="Adreslerim" 
          description="Teslimat adreslerini görüntüle ve düzenle" 
          href="/profil/adresler"
          icon="🏠"
        />
        <ProfileCard 
          title="Siparişlerim" 
          description="Siparişlerini takip et ve geçmişi görüntüle" 
          href="/profil/siparisler"
          icon="📦"
        />
        <ProfileCard 
          title="Yorumlarım" 
          description="Yaptığın değerlendirmeleri görüntüle" 
          href="/profil/yorumlar"
          icon="⭐"
        />
        <ProfileCard 
          title="Profil Düzenle" 
          description="Kişisel bilgilerini ve şifreni güncelle" 
          href="/profil/duzenle"
          icon="✏️"
        />
      </div>
    </div>
  );
}

function ProfileCard({ title, description, href, icon }) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow-md p-5 transition-transform transform hover:scale-105 cursor-pointer">
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  );
} 