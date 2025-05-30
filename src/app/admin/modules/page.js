'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiInfo } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';

export default function ModulesManagement() {
  return (
    <AuthGuard requiredRole="admin">
      <ModulesManagementContent />
    </AuthGuard>
  );
}

function ModulesManagementContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modulePermissions, setModulePermissions] = useState({
    enable_yemek: true,
    enable_market: true,
    enable_su: true,
    enable_aktuel: false
  });

  // Modül izinlerini veritabanından yükle
  useEffect(() => {
    const fetchModulePermissions = async () => {
      setLoading(true);
      try {
        const permissions = await api.getModulePermissions();
        setModulePermissions(permissions);
      } catch (err) {
        console.error("Modül izinleri yüklenirken hata:", err);
        setError("Modül izinleri yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchModulePermissions();
  }, []);

  // Modül durumunu değiştir
  const handleToggleModule = (moduleName) => {
    setModulePermissions(prev => ({
      ...prev,
      [`enable_${moduleName}`]: !prev[`enable_${moduleName}`]
    }));
  };

  // Modül izinlerini kaydet
  const handleSavePermissions = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const result = await api.updateModulePermissions(modulePermissions);
      if (result.success) {
        setSuccess("Modül izinleri başarıyla güncellendi.");
      } else {
        throw new Error("Modül izinleri güncellenirken bir sorun oluştu.");
      }
    } catch (err) {
      console.error("Modül izinleri kaydedilirken hata:", err);
      setError(err.message || "Modül izinleri kaydedilirken bir sorun oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Başlık */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Modül Yönetimi</h1>
            <Link 
              href="/admin"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft className="mr-1" />
              Admin Paneline Dön
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <div className="flex items-start mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
              <FiInfo className="mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm">
                Modül yönetimi, uygulamanın belirli bölümlerinin kullanıma açılıp kapatılmasını sağlar. 
                Admin kullanıcıları her zaman tüm modüllere erişebilir, ancak diğer kullanıcılar ve mağaza sahipleri 
                sadece aktif modülleri görebilir.
              </p>
            </div>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
                {success}
              </div>
            )}
          </div>

          <div className="grid gap-4 mb-8">
            <ModuleCard 
              name="yemek" 
              title="Yemek Modülü" 
              description="Restoran ve yemek siparişi özellikleri"
              enabled={modulePermissions.enable_yemek}
              onToggle={() => handleToggleModule('yemek')}
            />
            
            <ModuleCard 
              name="market" 
              title="Market Modülü" 
              description="Market ve bakkal ürünleri siparişi özellikleri"
              enabled={modulePermissions.enable_market}
              onToggle={() => handleToggleModule('market')}
            />
            
            <ModuleCard 
              name="su" 
              title="Su Modülü" 
              description="Su ve içecek siparişi özellikleri"
              enabled={modulePermissions.enable_su}
              onToggle={() => handleToggleModule('su')}
            />
            
            <ModuleCard 
              name="aktuel" 
              title="Aktüel Modülü" 
              description="Aktüel ürünler ve kampanyalar"
              enabled={modulePermissions.enable_aktuel}
              onToggle={() => handleToggleModule('aktuel')}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSavePermissions}
              disabled={saving}
              className="flex items-center bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="mr-2">Kaydediliyor...</span>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ name, title, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:bg-gray-900">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
      <div className="flex items-center">
        <span className="mr-3 text-sm font-medium text-gray-700">
          {enabled ? 'Aktif' : 'Pasif'}
        </span>
        <button
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
            enabled ? 'bg-orange-500' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
} 
