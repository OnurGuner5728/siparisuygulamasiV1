'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import FileUploader from '@/components/FileUploader';

export default function EditProduct() {
  return (
    <AuthGuard requiredRole="admin">
      <EditProductContent />
    </AuthGuard>
  );
}

function EditProductContent() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [allStores, setAllStores] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    store_id: '',
    category: '',
    image: '',
    is_available: true,
    options: [],
    removable_items: []
  });

  const [currentOptionName, setCurrentOptionName] = useState('');
  const [currentOptionPrice, setCurrentOptionPrice] = useState('');
  const [currentRemovableItem, setCurrentRemovableItem] = useState('');

  useEffect(() => {
    const fetchProductAndStoresData = async () => {
      if (!productId) {
        setLoading(false);
        setNotFound(true);
        return;
      }
      setLoading(true);
      try {
        const productData = await api.getProductById(productId);
        const storesData = await api.getStores({ status: 'active', approved: true });
        setAllStores(storesData || []);

        if (productData) {
          setFormData({
            name: productData.name || '',
            description: productData.description || '',
            price: productData.price !== null ? productData.price.toString() : '',
            store_id: productData.store_id || '',
            category: productData.category || '',
            image: productData.image || '',
            is_available: productData.is_available !== undefined ? productData.is_available : true,
            options: productData.options || [],
            removable_items: productData.removable_items || []
          });
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Ürün ve mağaza verileri yüklenirken hata:', err);
        setError('Veriler yüklenirken bir sorun oluştu.');
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndStoresData();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'price') {
      const regex = /^\\d*\\.?\\d{0,2}$/;
      if (value === '' || regex.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else if (name === 'is_available') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) {
      setFormData(prev => ({ ...prev, image: '' }));
      return;
    }
    setSubmitting(true);
    try {
      console.log('Dosya seçildi, FileUploader componentinin işlemesi bekleniyor:', file.name);
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      setError('Dosya yüklenirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (newImageUrl) => {
    setFormData(prev => ({ ...prev, image: newImageUrl }));
  };

  const handleAddOption = () => {
    if (currentOptionName && currentOptionPrice) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, { name: currentOptionName, price: parseFloat(currentOptionPrice) }]
      }));
      setCurrentOptionName('');
      setCurrentOptionPrice('');
    }
  };

  const handleRemoveOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleAddRemovableItem = () => {
    if (currentRemovableItem) {
      setFormData(prev => ({
        ...prev,
        removable_items: [...prev.removable_items, currentRemovableItem]
      }));
      setCurrentRemovableItem('');
    }
  };

  const handleRemoveRemovableItem = (index) => {
    setFormData(prev => ({
      ...prev,
      removable_items: prev.removable_items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) return;
    setSubmitting(true);
    setError('');

    try {
      if (!formData.name || !formData.price || !formData.store_id || !formData.category) {
        throw new Error('Lütfen Ürün Adı, Fiyat, Mağaza ve Kategori alanlarını doldurun.');
      }

      const updateData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        store_id: formData.store_id,
        category: formData.category,
        image: formData.image,
        is_available: formData.is_available,
        options: formData.options && formData.options.length > 0 ? formData.options : null,
        removable_items: formData.removable_items && formData.removable_items.length > 0 ? formData.removable_items : null,
      };
      
      await api.updateProduct(productId, updateData);
      router.push('/admin/products');

    } catch (err) {
      console.error('Ürün güncellenirken hata:', err);
      setError(err.response?.data?.message || err.message || 'Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ürün Bulunamadı</h1>
          <p className="text-gray-600 mb-6">İstediğiniz ID ({productId}) ile eşleşen bir ürün bulunamadı.</p>
          <Link 
            href="/admin/products"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Ürün Listesine Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Ürün Düzenle</h1>
          <p className="text-gray-600 mt-1">ID: {productId}</p>
        </div>
        <Link 
          href="/admin/products"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Ürün Listesine Dön
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Adı
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ürün adını girin"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Fiyat (TL)
              </label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="store_id" className="block text-sm font-medium text-gray-700 mb-1">
                Mağaza <span className="text-red-500">*</span>
              </label>
              <select
                id="store_id"
                name="store_id"
                value={formData.store_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Mağaza Seçin</option>
                {allStores.map((store) => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Kategori (Alt Kategori/Ürün Tipi) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örn: İçecekler, Tatlılar"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ürün hakkında kısa bir açıklama"
              ></textarea>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Görseli URL (veya Yükle)
              </label>
              <FileUploader 
                onUploadSuccess={handleImageChange} 
                initialUrl={formData.image}
                filePathPrefix="products/"
              />
            </div>

            <div className="flex items-center md:col-span-2 mt-2">
              <input
                type="checkbox"
                id="is_available"
                name="is_available"
                checked={formData.is_available}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
              />
              <label htmlFor="is_available" className="text-sm font-medium text-gray-700">
                Satışa Açık (Mevcut)
              </label>
            </div>
          </div>

          <div className="mb-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Ürün Seçenekleri (Opsiyonel)</h3>
            <div className="space-y-3 mb-3">
              {(formData.options || []).map((option, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                  <span>{option.name} (+{(option.price || 0).toFixed(2)} TL)</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveOption(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Kaldır
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-end p-3 border rounded-md">
              <div className="flex-grow">
                <label htmlFor="optionName" className="block text-xs text-gray-600 mb-1">Seçenek Adı</label>
                <input 
                  type="text" 
                  id="optionName"
                  value={currentOptionName} 
                  onChange={(e) => setCurrentOptionName(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Örn: Ekstra Peynir"
                />
              </div>
              <div className="w-full sm:w-40">
                <label htmlFor="optionPrice" className="block text-xs text-gray-600 mb-1">Ek Fiyat (TL)</label>
                <input 
                  type="number" 
                  id="optionPrice"
                  value={currentOptionPrice} 
                  onChange={(e) => setCurrentOptionPrice(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2.50"
                  step="0.01"
                  min="0"
                />
              </div>
              <button 
                type="button" 
                onClick={handleAddOption}
                disabled={!currentOptionName || !currentOptionPrice}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm h-10 disabled:opacity-50 whitespace-nowrap"
              >
                + Seçenek Ekle
              </button>
            </div>
          </div>

          <div className="mb-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Çıkarılabilir Malzemeler (Opsiyonel)</h3>
            <div className="space-y-3 mb-3">
              {(formData.removable_items || []).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                  <span>{item}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveRemovableItem(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Kaldır
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-end p-3 border rounded-md">
              <div className="flex-grow">
                <label htmlFor="removableItem" className="block text-xs text-gray-600 mb-1">Malzeme Adı</label>
                <input 
                  type="text" 
                  id="removableItem"
                  value={currentRemovableItem} 
                  onChange={(e) => setCurrentRemovableItem(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Örn: Soğan, Turşu"
                />
              </div>
              <button 
                type="button" 
                onClick={handleAddRemovableItem}
                disabled={!currentRemovableItem}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm h-10 disabled:opacity-50 whitespace-nowrap"
              >
                + Malzeme Ekle
              </button>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Link 
              href="/admin/products"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-md mr-3"
            >
              İptal
            </Link>
            <button 
              type="submit"
              disabled={submitting || loading}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md disabled:opacity-50"
            >
              {submitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 