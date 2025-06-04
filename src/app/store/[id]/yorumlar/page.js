'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiStar, FiFilter, FiMessageSquare, FiShoppingBag, FiPackage } from 'react-icons/fi';
import * as api from '@/lib/api';
import OrderBasedReviewSystem from '@/components/OrderBasedReviewSystem';
import { useAuth } from '@/contexts/AuthContext';

export default function GlobalStoreReviewsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const storeId = params.id;
  const { user } = useAuth();
  
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('store'); // 'store', 'products', 'orders'
  
  // Category detection (cid parameter veya store bilgisinden)
  const [category, setCategory] = useState(null);
  const cid = searchParams.get('cid');

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const storeData = await api.getStoreById(storeId);
        setStore(storeData);
        
        // Category belirleme (cid parametresi öncelikli, sonra store category'si)
        if (cid) {
          setCategory(getCategoryInfo(cid));
        } else if (storeData?.category?.name) {
          // Store category'sine göre category belirle
          const categoryMapping = {
            'Yemek': { slug: 'yemek', name: 'Yemek', icon: '🍕' },
            'Market': { slug: 'market', name: 'Market', icon: '🛒' },
            'Su': { slug: 'su', name: 'Su', icon: '💧' },
            'Aktüel': { slug: 'aktuel', name: 'Aktüel', icon: '📰' }
          };
          const categoryInfo = categoryMapping[storeData.category.name] || { slug: 'yemek', name: 'Yemek', icon: '🍕' };
          setCategory(categoryInfo);
        } else {
          // Varsayılan olarak yemek kategorisi
          setCategory({ slug: 'yemek', name: 'Yemek', icon: '🍕' });
        }
      } catch (error) {
        console.error('Mağaza bilgileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchStoreData();
    }
  }, [storeId, cid]);

  const getCategoryInfo = (categoryId) => {
    const categories = {
      '1': { slug: 'yemek', name: 'Yemek', icon: '🍕' },
      '2': { slug: 'market', name: 'Market', icon: '🛒' },
      '3': { slug: 'su', name: 'Su', icon: '💧' },
      '4': { slug: 'aktuel', name: 'Aktüel', icon: '📰' }
    };
    return categories[categoryId] || { slug: 'yemek', name: 'Yemek', icon: '🍕' };
  };

  const getBackUrl = () => {
    if (!category) return '/';
    return `/${category.slug}/store/${storeId}`;
  };

  const getCategoryUrl = () => {
    if (!category) return '/';
    return `/${category.slug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-16 bg-gray-300 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Mağaza Bulunamadı</h1>
          <p className="text-gray-600 mb-6">Aradığınız mağaza mevcut değil.</p>
          <Link 
            href={getCategoryUrl()}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            {category?.name || 'Ana Sayfa'}ya Dön
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'store', name: 'Mağaza Yorumları', icon: FiMessageSquare },
 
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href={getBackUrl()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <FiArrowLeft className="mr-2" />
                Mağazaya Dön
              </Link>
              
              <div className="flex items-center">
                {/* Category Badge */}
                {category && (
                  <div className="flex items-center mr-3">
                    <span className="text-lg mr-1">{category.icon}</span>
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {category.name}
                    </span>
                  </div>
                )}
                
                <img 
                  src={store.logo_url || '/images/default-store.png'} 
                  alt={store.name}
                  className="w-12 h-12 rounded-lg object-cover mr-3"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="flex items-center mr-4">
                      <FiStar className="text-yellow-400 mr-1" />
                      <span className="font-medium">{store.rating || 0}</span>
                      <span className="ml-1">({store.review_count || 0} değerlendirme)</span>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {store.category?.name || category?.name || 'Mağaza'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'store' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Mağaza Yorumları</h2>
              <p className="text-gray-600 mt-1">Bu mağaza hakkındaki müşteri yorumları</p>
            </div>
            <div className="p-6">
              <OrderBasedReviewSystem 
                storeId={storeId}
                showHeader={false}
              />
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Ürün Yorumları Kaldırıldı</h2>
              <p className="text-gray-600 mt-1">Artık sadece sipariş-based değerlendirmeler kabul edilmektedir</p>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <FiShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ürün Yorumları Artık Yok
                </h3>
                <p className="text-gray-500">
                  Tüm değerlendirmeler artık sipariş-based yapılmaktadır. Mağaza sekmesini kullanın.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Sipariş Yorumları</h2>
              <p className="text-gray-600 mt-1">Tüm yorumlar artık sipariş-based - Mağaza sekmesini kullanın</p>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sipariş Yorumları Mağaza Sekmesinde
                </h3>
                <p className="text-gray-500">
                  Artık tüm yorumlar sipariş-based. "Mağaza" sekmesini kullanarak tüm yorumları görebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Gereksiz fonksiyonlar kaldırıldı - artık sadece sipariş-based yorumlar var 