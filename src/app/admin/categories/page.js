'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import AuthGuard from '../../../components/AuthGuard';
import { mockCategories, mainCategories } from '@/app/data/mockdatas';

export default function AdminCategories() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminCategoriesContent />
    </AuthGuard>
  );
}

function AdminCategoriesContent() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mainCategoryFilter, setMainCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('categories');
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    mainCategory: 'Yemek',
    image: '',
    status: 'active'
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [modulePermissions, setModulePermissions] = useState({
    yemek: true,
    market: true,
    su: true,
    aktuel: false
  });

  useEffect(() => {
    // Mock API çağrısı
    setTimeout(() => {
      // Gerçek projede burası bir API isteği olacaktır
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
  }, []);

  // Ana kategoriler
  const filteredMainCategories = mainCategories.filter(category => 
    modulePermissions[category.name.toLowerCase()]
  );

  // Arama ve filtreleme
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          category.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMainCategory = mainCategoryFilter === 'all' || category.mainCategory === mainCategoryFilter;
    
    return matchesSearch && matchesMainCategory;
  });

  // Kategori silme
  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
      // Gerçek projede API isteği yapılır
      setCategories(categories.filter(category => category.id !== categoryId));
    }
  };

  // Kategori durumunu değiştirme
  const handleToggleStatus = (categoryId) => {
    const updatedCategories = categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          status: category.status === 'active' ? 'inactive' : 'active'
        };
      }
      return category;
    });
    
    setCategories(updatedCategories);
  };

  // Kategori durumunu formatla
  const formatStatus = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Aktif</span>;
      case 'inactive':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Pasif</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Bilinmiyor</span>;
    }
  };

  // Yeni kategori ekleme
  const handleAddCategory = (e) => {
    e.preventDefault();
    
    // ID oluştur (gerçek uygulamada backend tarafında yapılır)
    const id = Math.max(...categories.map(c => c.id)) + 1;
    
    // Yeni kategoriyi ekle
    const newCategoryWithId = {
      ...newCategory,
      id,
      productsCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setCategories([...categories, newCategoryWithId]);
    
    // Formu sıfırla
    setNewCategory({
      name: '',
      description: '',
      mainCategory: 'Yemek',
      image: '',
      status: 'active'
    });
    
    // Kategoriler sekmesine geri dön
    setActiveTab('categories');
  };

  // Kategori düzenleme
  const handleEditCategory = (e) => {
    e.preventDefault();
    
    const updatedCategories = categories.map(category => {
      if (category.id === editingCategory.id) {
        return editingCategory;
      }
      return category;
    });
    
    setCategories(updatedCategories);
    setEditingCategory(null);
    setActiveTab('categories');
  };

  // Modül izinlerini değiştirme
  const handleModulePermissionChange = (module) => {
    setModulePermissions(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
  };

  // Modül izinlerini kaydet
  const saveModulePermissions = () => {
    // Gerçek uygulamada API'ye kaydedilecek
    alert('Modül yetkileri kaydedildi!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Kategori Yönetimi</h1>
          <p className="text-gray-600 mt-1">Tüm kategorileri görüntüle, düzenle veya sil</p>
        </div>
        <Link 
          href="/admin"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Admin Paneli
        </Link>
      </div>

      {/* Sekmeler */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-6 py-4 border-b">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 font-medium rounded ${
                activeTab === 'categories'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Kategoriler
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-4 py-2 font-medium rounded ${
                activeTab === 'add'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Yeni Kategori Ekle
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-4 py-2 font-medium rounded ${
                activeTab === 'permissions'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Modül Yetkileri
            </button>
          </div>
        </div>

        {/* Kategoriler Listesi */}
        {activeTab === 'categories' && (
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="mb-4 md:mb-0">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Kategori adı veya açıklama ara..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <select
                  className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={mainCategoryFilter}
                  onChange={(e) => setMainCategoryFilter(e.target.value)}
                >
                  <option value="all">Tüm Ana Kategoriler</option>
                  {filteredMainCategories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ana Kategori
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürün Sayısı
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-md object-cover" src={category.image} alt={category.name} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                            <div className="text-xs text-gray-500">{category.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {category.mainCategory}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{category.productsCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatStatus(category.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setEditingCategory(category);
                              setActiveTab('edit');
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Düzenle
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(category.id)}
                            className={`${category.status === 'active' ? 'text-amber-600 hover:text-amber-900' : 'text-green-600 hover:text-green-900'}`}
                          >
                            {category.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Yeni Kategori Ekleme Formu */}
        {activeTab === 'add' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Yeni Kategori Ekle</h2>
            <form onSubmit={handleAddCategory}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori Adı
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Kategori adını girin"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="mainCategory" className="block text-sm font-medium text-gray-700 mb-1">
                    Ana Kategori
                  </label>
                  <select
                    id="mainCategory"
                    value={newCategory.mainCategory}
                    onChange={(e) => setNewCategory({ ...newCategory, mainCategory: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {filteredMainCategories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    Resim URL
                  </label>
                  <input
                    type="text"
                    id="image"
                    value={newCategory.image}
                    onChange={(e) => setNewCategory({ ...newCategory, image: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Resim URL'sini girin"
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Durum
                  </label>
                  <select
                    id="status"
                    value={newCategory.status}
                    onChange={(e) => setNewCategory({ ...newCategory, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    id="description"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Kategori açıklamasını girin"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('categories')}
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Kategori Ekle
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Kategori Düzenleme Formu */}
        {activeTab === 'edit' && editingCategory && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Kategori Düzenle</h2>
            <form onSubmit={handleEditCategory}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori Adı
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Kategori adını girin"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-mainCategory" className="block text-sm font-medium text-gray-700 mb-1">
                    Ana Kategori
                  </label>
                  <select
                    id="edit-mainCategory"
                    value={editingCategory.mainCategory}
                    onChange={(e) => setEditingCategory({ ...editingCategory, mainCategory: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {filteredMainCategories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-image" className="block text-sm font-medium text-gray-700 mb-1">
                    Resim URL
                  </label>
                  <input
                    type="text"
                    id="edit-image"
                    value={editingCategory.image}
                    onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Resim URL'sini girin"
                  />
                </div>
                <div>
                  <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                    Durum
                  </label>
                  <select
                    id="edit-status"
                    value={editingCategory.status}
                    onChange={(e) => setEditingCategory({ ...editingCategory, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    id="edit-description"
                    value={editingCategory.description}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Kategori açıklamasını girin"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setActiveTab('categories');
                  }}
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modül Yetkileri */}
        {activeTab === 'permissions' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Modül Yetkileri</h2>
            <p className="text-gray-500 mb-4">
              Kullanıcı ve mağazalara gösterilecek modülleri seçin. Aktif olmayan modüller sadece admin tarafından görüntülenebilir.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-yemek"
                    checked={modulePermissions.yemek}
                    onChange={() => handleModulePermissionChange('yemek')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="perm-yemek" className="ml-2 block text-sm text-gray-900">
                    Yemek Modülü
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-market"
                    checked={modulePermissions.market}
                    onChange={() => handleModulePermissionChange('market')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="perm-market" className="ml-2 block text-sm text-gray-900">
                    Market Modülü
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-su"
                    checked={modulePermissions.su}
                    onChange={() => handleModulePermissionChange('su')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="perm-su" className="ml-2 block text-sm text-gray-900">
                    Su Modülü
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-aktuel"
                    checked={modulePermissions.aktuel}
                    onChange={() => handleModulePermissionChange('aktuel')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="perm-aktuel" className="ml-2 block text-sm text-gray-900">
                    Aktüel Modülü
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={saveModulePermissions}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Yetkileri Kaydet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 