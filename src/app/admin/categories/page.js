'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import * as api from '../../../lib/api';
import AuthGuard from '../../../components/AuthGuard';

export default function AdminCategoriesPage() {
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
  const [categoryTypeFilter, setCategoryTypeFilter] = useState('all'); // all, main, sub
  const [activeTab, setActiveTab] = useState('categories');
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    parent_id: null, // Ana kategori için null, alt kategori için parent ID
    image_url: '',
    is_active: true,
    sort_order: 1
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [modulePermissions, setModulePermissions] = useState({
    yemek: true,
    market: true,
    su: true,
    aktuel: false
  });
  const [mainCategories, setMainCategories] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Ana kategorileri getir
        const mainCategoriesData = await api.getMainCategories(true); // admin=true
        setMainCategories(mainCategoriesData);
        
        // Tüm kategorileri getir (ana + alt)
        const categoriesData = await api.getCategories(true); // admin=true
        const categoriesWithImages = categoriesData.map(category => ({
          ...category,
          image_url: category.image_url || '',
          description: category.description || '',
          // Ana kategori mi alt kategori mi belirleme
          isMainCategory: category.parent_id === null,
          parentName: category.parent_id ? 
            mainCategoriesData.find(main => main.id === category.parent_id)?.name || 'Bilinmiyor' : 
            null
        }));
        setCategories(categoriesWithImages);

      } catch (error) {
        console.error('Kategori verileri yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Arama ve filtreleme
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          category.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesType = true;
    if (categoryTypeFilter === 'main') {
      matchesType = category.isMainCategory;
    } else if (categoryTypeFilter === 'sub') {
      matchesType = !category.isMainCategory;
    }
    
    return matchesSearch && matchesType;
  });

  // Kategori silme
  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
      try {
        // API route üzerinden silme yap
        const response = await fetch(`/api/admin/categories/${categoryId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Kategori silinemedi');
        }

        setCategories(categories.filter(category => category.id !== categoryId));
        
        // Ana kategoriler listesinden de kaldır (eğer ana kategoriyse)
        setMainCategories(mainCategories.filter(category => category.id !== categoryId));
        
        alert('Kategori başarıyla silindi!');
      } catch (error) {
        console.error('Kategori silinirken hata oluştu:', error);
        alert('Kategori silinirken bir hata oluştu: ' + error.message);
      }
    }
  };

  // Kategori durumunu değiştirme
  const handleToggleStatus = async (categoryId) => {
    try {
      const categoryToUpdate = categories.find(category => category.id === categoryId);
      const newStatus = !categoryToUpdate.is_active;
      
      // API route üzerinden güncelleme yap
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...categoryToUpdate,
          is_active: newStatus 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Kategori durumu değiştirilemedi');
      }
      
      const updatedCategories = categories.map(category => {
        if (category.id === categoryId) {
          return { ...category, is_active: newStatus };
        }
        return category;
      });
      
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Kategori durumu güncellenirken hata oluştu:', error);
      alert('Kategori durumu değiştirilirken bir hata oluştu: ' + error.message);
    }
  };

  // Kategori durumunu formatla
  const formatStatus = (is_active) => {
    return is_active ? 
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Aktif</span> :
      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Pasif</span>;
  };

  // Yeni kategori ekleme
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    try {
      const categoryData = {
        name: newCategory.name,
        description: newCategory.description,
        parent_id: newCategory.parent_id,
        image_url: newCategory.image_url,
        is_active: newCategory.is_active,
        sort_order: newCategory.sort_order
      };

      // API route üzerinden ekleme yap
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Kategori oluşturulamadı');
      }

      const newCategoryData = result.data;
      
      // Ana kategori mi alt kategori mi belirle
      const categoryWithMeta = {
        ...newCategoryData,
        isMainCategory: newCategoryData.parent_id === null,
        parentName: newCategoryData.parent_id ? 
          mainCategories.find(main => main.id === newCategoryData.parent_id)?.name || 'Bilinmiyor' : 
          null
      };
      
      setCategories([...categories, categoryWithMeta]);
      
      // Ana kategoriler listesini güncelle (eğer ana kategori eklendiyse)
      if (newCategoryData.parent_id === null) {
        setMainCategories([...mainCategories, newCategoryData]);
      }
      
      // Formu sıfırla
      setNewCategory({
        name: '',
        description: '',
        parent_id: null,
        image_url: '',
        is_active: true,
        sort_order: 1
      });
      
      setActiveTab('categories');
      alert('Kategori başarıyla eklendi!');
    } catch (error) {
      console.error('Kategori eklenirken hata oluştu:', error);
      alert('Kategori eklenirken bir hata oluştu: ' + error.message);
    }
  };

  // Kategori düzenleme
  const handleEditCategory = async (e) => {
    e.preventDefault();
    
    try {
      const updateData = {
        name: editingCategory.name,
        description: editingCategory.description,
        parent_id: editingCategory.parent_id,
        image_url: editingCategory.image_url,
        is_active: editingCategory.is_active,
        sort_order: editingCategory.sort_order
      };

      // API route üzerinden güncelleme yap
      const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Kategori güncellenemedi');
      }

      const updatedCategoryData = result.data;
      
      const updatedCategories = categories.map(category => {
        if (category.id === editingCategory.id) {
          return {
            ...updatedCategoryData,
            isMainCategory: updatedCategoryData.parent_id === null,
            parentName: updatedCategoryData.parent_id ? 
              mainCategories.find(main => main.id === updatedCategoryData.parent_id)?.name || 'Bilinmiyor' : 
              null
          };
        }
        return category;
      });
      
      setCategories(updatedCategories);

      // Ana kategoriler listesini güncelle
      if (updatedCategoryData.parent_id === null) {
        const updatedMainCategories = mainCategories.map(main => 
          main.id === updatedCategoryData.id ? updatedCategoryData : main
        );
        if (!mainCategories.find(main => main.id === updatedCategoryData.id)) {
          updatedMainCategories.push(updatedCategoryData);
        }
        setMainCategories(updatedMainCategories);
      }
      
      setEditingCategory(null);
      setActiveTab('categories');
      alert('Kategori başarıyla güncellendi!');
    } catch (error) {
      console.error(`Kategori güncellenirken hata (ID: ${editingCategory.id}):`, error);
      alert('Kategori güncellenirken bir hata oluştu: ' + error.message);
    }
  };

  // Modül izinlerini değiştirme
  const handleModulePermissionChange = (module) => {
    setModulePermissions(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
  };

  // Modül izinlerini kaydet
  const saveModulePermissions = async () => {
    try {
      await api.updateModulePermissions(modulePermissions);
      alert('Modül yetkileri başarıyla kaydedildi!');
    } catch (error) {
      console.error('Modül yetkileri kaydedilirken hata oluştu:', error);
      alert('Modül yetkileri kaydedilirken bir hata oluştu.');
    }
  };

  // Resim yükleme fonksiyonu
  const handleImageUpload = async (e, isEditMode = false) => {
    const file = e.target.files[0];
    if (!file) return;

    // Dosya boyutu kontrolü (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5MB\'dan büyük olamaz.');
      return;
    }

    // Dosya formatı kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Sadece JPG, PNG, GIF ve WebP formatındaki resimler yüklenebilir.');
      return;
    }

    setUploadingImage(true);

    try {
      // Eski resmi sil (eğer varsa)
      const currentImage = isEditMode ? editingCategory?.image_url : newCategory.image_url;
      if (currentImage) {
        try {
          await api.deleteImage(currentImage, 'categories');
        } catch (deleteError) {
          console.log('Eski resim silinirken hata (normal olabilir):', deleteError);
        }
      }

      // Yeni resmi yükle
      const imageUrl = await api.uploadImage(file, 'categories');
      
      if (isEditMode) {
        setEditingCategory(prev => ({ ...prev, image_url: imageUrl }));
      } else {
        setNewCategory(prev => ({ ...prev, image_url: imageUrl }));
      }
      
      alert('Resim başarıyla yüklendi!');
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      alert('Resim yüklenirken bir hata oluştu: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
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
          <p className="text-gray-600 mt-1">Ana kategorileri ve alt kategorileri görüntüle, düzenle veya sil</p>
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
      <div className="bg-white shadow rounded-lg mb-6">
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
                  value={categoryTypeFilter}
                  onChange={(e) => setCategoryTypeFilter(e.target.value)}
                >
                  <option value="all">Tüm Kategoriler</option>
                  <option value="main">Ana Kategoriler</option>
                  <option value="sub">Alt Kategoriler</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tür
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Üst Kategori
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sıra
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
                    <tr key={category.id} className="hover:bg-gray-50 dark:bg-gray-900">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {category.image_url && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={category.image_url}
                                alt={category.name}
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                            <div className="text-sm text-gray-500">{category.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${
                          category.isMainCategory 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {category.isMainCategory ? (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                              </svg>
                              Ana Kategori
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              Alt Kategori
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {category.parentName ? (
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                              {category.parentName}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{category.sort_order}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatStatus(category.is_active)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setEditingCategory({
                                ...category,
                                image_url: category.image_url || '',
                                description: category.description || ''
                              });
                              setActiveTab('edit');
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Düzenle
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(category.id)}
                            className={`${category.is_active ? 'text-amber-600 hover:text-amber-900' : 'text-green-600 hover:text-green-900'}`}
                          >
                            {category.is_active ? 'Pasif Yap' : 'Aktif Yap'}
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
                  <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori Türü
                  </label>
                  <select
                    id="parentCategory"
                    value={newCategory.parent_id || ''}
                    onChange={(e) => setNewCategory({ 
                      ...newCategory, 
                      parent_id: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">
                      🏷️ Ana Kategori Oluştur
                    </option>
                    {mainCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        📁 {category.name} - Alt Kategorisi
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Ana kategori: Yemek, Market gibi temel kategoriler. Alt kategori: Pizza, Burger gibi alt kategoriler.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori Resmi
                  </label>
                  
                  {newCategory.image_url && (
                    <div className="mb-4 flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={newCategory.image_url}
                          alt="Kategori resmi"
                          className="h-16 w-16 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Mevcut resim</p>
                        <button
                          type="button"
                          onClick={() => setNewCategory({ ...newCategory, image_url: '' })}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Resmi Kaldır
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>{uploadingImage ? 'Yükleniyor...' : 'Dosya seç'}</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, false)}
                            disabled={uploadingImage}
                          />
                        </label>
                        <p className="pl-1">veya sürükle bırak</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF en fazla 5MB</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-1">
                    Sıra Numarası
                  </label>
                  <input
                    type="number"
                    id="sort_order"
                    value={newCategory.sort_order}
                    onChange={(e) => setNewCategory({ ...newCategory, sort_order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Durum
                  </label>
                  <select
                    id="status"
                    value={newCategory.is_active}
                    onChange={(e) => setNewCategory({ ...newCategory, is_active: e.target.value === 'true' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={true}>Aktif</option>
                    <option value={false}>Pasif</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    id="description"
                    value={newCategory.description || ''}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Kategori açıklamasını girin"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('categories')}
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-900"
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
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingCategory.isMainCategory ? 'Ana Kategori' : 'Alt Kategori'} Düzenle
            </h2>
            
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
                  <label htmlFor="edit-parentCategory" className="block text-sm font-medium text-gray-700 mb-1">
                    {editingCategory.isMainCategory ? 'Kategori Türü' : 'Üst Kategori'}
                  </label>
                  {editingCategory.isMainCategory ? (
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Ana Kategori (Üst kategorisi yoktur)
                    </div>
                  ) : (
                    <select
                      id="edit-parentCategory"
                      value={editingCategory.parent_id || ''}
                      onChange={(e) => setEditingCategory({ 
                        ...editingCategory, 
                        parent_id: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Ana kategoriye çevir</option>
                      {mainCategories.filter(cat => cat.id !== editingCategory.id).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori Resmi
                  </label>
                  
                  {editingCategory.image_url && (
                    <div className="mb-4 flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={editingCategory.image_url}
                          alt="Kategori resmi"
                          className="h-16 w-16 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Mevcut resim</p>
                        <button
                          type="button"
                          onClick={() => setEditingCategory({ ...editingCategory, image_url: '' })}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Resmi Kaldır
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="edit-image-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>{uploadingImage ? 'Yükleniyor...' : 'Dosya seç'}</span>
                          <input
                            id="edit-image-upload"
                            name="edit-image-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, true)}
                            disabled={uploadingImage}
                          />
                        </label>
                        <p className="pl-1">veya sürükle bırak</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF en fazla 5MB</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-sort_order" className="block text-sm font-medium text-gray-700 mb-1">
                    Sıra Numarası
                  </label>
                  <input
                    type="number"
                    id="edit-sort_order"
                    value={editingCategory.sort_order}
                    onChange={(e) => setEditingCategory({ ...editingCategory, sort_order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                    Durum
                  </label>
                  <select
                    id="edit-status"
                    value={editingCategory.is_active}
                    onChange={(e) => setEditingCategory({ ...editingCategory, is_active: e.target.value === 'true' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={true}>Aktif</option>
                    <option value={false}>Pasif</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    id="edit-description"
                    value={editingCategory.description || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Kategori açıklamasını girin"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setActiveTab('categories');
                  }}
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-900"
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
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6">
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
                Modül Yetkilerini Kaydet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
