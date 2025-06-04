'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import AuthGuard from '../../../components/AuthGuard';
import ProfileSidebar from '../../../components/ProfileSidebar';
import { FiHeart, FiShoppingBag, FiMapPin, FiStar, FiClock, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import api from '@/lib/api';

export default function FavoritesPage() {
  return (
    <AuthGuard requiredRole="any_auth">
      <FavoritesContent />
    </AuthGuard>
  );
}

function FavoritesContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // all, products, stores
  const [favoriteDetails, setFavoriteDetails] = useState({});

  // Favorileri yükle
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        console.log('📍 Favoriler yükleniyor...');
        const userFavorites = await api.getUserFavorites(user.id);
        console.log('❤️ Favoriler yüklendi:', userFavorites);
        setFavorites(userFavorites || []);
        
        // Favori detaylarını yükle
        await loadFavoriteDetails(userFavorites || []);
      } catch (error) {
        console.error('❌ Favoriler yüklenirken hata:', error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadFavorites();
  }, [user]);

  // Favori detaylarını yükle
  const loadFavoriteDetails = async (favoritesList) => {
    const details = {};
    
    for (const favorite of favoritesList) {
      try {
        if (favorite.item_type === 'product') {
          const product = await api.getProductById(favorite.item_id);
          if (product) {
            details[favorite.id] = {
              ...product,
              type: 'product'
            };
          }
        } else if (favorite.item_type === 'store') {
          const store = await api.getStoreById(favorite.item_id);
          if (store) {
            details[favorite.id] = {
              ...store,
              type: 'store'
            };
          }
        }
      } catch (error) {
        console.error(`❌ Favori detayı yüklenirken hata (${favorite.item_type}:${favorite.item_id}):`, error);
      }
    }
    
    setFavoriteDetails(details);
  };

  // Favorilerden çıkar
  const removeFromFavorites = async (favoriteId, itemType, itemId) => {
    try {
      console.log('💔 Favorilerden çıkarılıyor:', { favoriteId, itemType, itemId });
      await api.removeFromFavorites(user.id, itemType, itemId);
      
      // Local state'den kaldır
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      
      // Detayları da kaldır
      const newDetails = { ...favoriteDetails };
      delete newDetails[favoriteId];
      setFavoriteDetails(newDetails);
      
      console.log('✅ Favorilerden çıkarıldı');
    } catch (error) {
      console.error('❌ Favorilerden çıkarılırken hata:', error);
      alert('Favorilerden çıkarılırken bir hata oluştu');
    }
  };

  // Filtrelenmiş favoriler
  const filteredFavorites = favorites.filter(favorite => {
    if (activeTab === 'all') return true;
    if (activeTab === 'products') return favorite.item_type === 'product';
    if (activeTab === 'stores') return favorite.item_type === 'store';
    return true;
  });

  const productCount = favorites.filter(f => f.item_type === 'product').length;
  const storeCount = favorites.filter(f => f.item_type === 'store').length;

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row">
            <ProfileSidebar activeTab="favorites" />
            
            <div className="md:flex-1 md:ml-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
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
          <ProfileSidebar activeTab="favorites" />
          
          <div className="md:flex-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <FiHeart className="mr-2 text-red-500" />
                      Favorilerim
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Beğendiğin ürün ve mağazalar
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-800">{favorites.length}</div>
                    <div className="text-xs text-gray-500">Toplam Favori</div>
                  </div>
                </div>

                {/* Filtre Sekmeleri */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'all'
                        ? 'bg-red-100 text-red-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Tümü ({favorites.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'products'
                        ? 'bg-red-100 text-red-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Ürünler ({productCount})
                  </button>
                  <button
                    onClick={() => setActiveTab('stores')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'stores'
                        ? 'bg-red-100 text-red-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Mağazalar ({storeCount})
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {filteredFavorites.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiHeart size={24} className="text-red-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      {activeTab === 'all' ? 'Henüz favori eklenmemiş' :
                       activeTab === 'products' ? 'Favori ürün yok' : 'Favori mağaza yok'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Beğendiğin {activeTab === 'products' ? 'ürünleri' : activeTab === 'stores' ? 'mağazaları' : 'ürün ve mağazaları'} favorilere ekleyerek hızlıca erişebilirsin
                    </p>
                    <Link
                      href="/"
                      className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Alışverişe Başla
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFavorites.map((favorite) => {
                      const detail = favoriteDetails[favorite.id];
                      if (!detail) return null;

                      return (
                        <FavoriteCard
                          key={favorite.id}
                          favorite={favorite}
                          detail={detail}
                          onRemove={(itemType, itemId) => removeFromFavorites(favorite.id, itemType, itemId)}
                        />
                      );
                    })}
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

function FavoriteCard({ favorite, detail, onRemove }) {
  // Kategori adından slug oluştur
  const getCategorySlug = (categoryName) => {
    if (!categoryName) return 'yemek'; // varsayılan
    
    const categoryMap = {
      'Yemek': 'yemek',
      'Market': 'market', 
      'Su': 'su',
      'Aktüel': 'aktuel'
    };
    
    return categoryMap[categoryName] || 'yemek';
  };
  if (detail.type === 'product') {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative">
          <img
            src={detail.logo_url || '/placeholder-product.jpg'}
            alt={detail.name}
            className="w-full h-48 object-cover"
          />
          <button
            onClick={() => onRemove(favorite.item_type, favorite.item_id)}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
            title="Favorilerden Çıkar"
          >
            <FiTrash2 size={16} className="text-red-500" />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{detail.name}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{detail.description}</p>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-gray-900">
              {detail.price ? `₺${Number(detail.price).toFixed(2)}` : 'Fiyat belirtilmemiş'}
            </span>
            {detail.rating > 0 && (
              <div className="flex items-center">
                <FiStar className="text-yellow-400 mr-1" size={14} />
                <span className="text-sm text-gray-600">{detail.rating}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Link
              href={`/urun/${detail.id}`}
              className="flex-1 bg-blue-500 text-white text-center py-2 px-3 rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              Görüntüle
            </Link>
            <button className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors">
              <FiShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (detail.type === 'store') {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative">
          <img
            src={detail.cover_image || detail.logo || '/placeholder-store.jpg'}
            alt={detail.name}
            className="w-full h-48 object-cover"
          />
          <button
            onClick={() => onRemove(favorite.item_type, favorite.item_id)}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
            title="Favorilerden Çıkar"
          >
            <FiTrash2 size={16} className="text-red-500" />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-2">{detail.name}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{detail.description}</p>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <FiStar className="text-yellow-400 mr-1" size={14} />
              <span className="text-sm text-gray-600">
                {detail.rating || 0} ({detail.review_count || 0} değerlendirme)
              </span>
            </div>
            {detail.delivery_time_estimation && (
              <div className="flex items-center text-gray-500">
                <FiClock className="mr-1" size={14} />
                <span className="text-xs">{detail.delivery_time_estimation}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Link
              href={`/${getCategorySlug(detail.category?.name)}/store/${detail.id}`}
              className="flex-1 bg-blue-500 text-white text-center py-2 px-3 rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              Mağazayı Ziyaret Et
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 
