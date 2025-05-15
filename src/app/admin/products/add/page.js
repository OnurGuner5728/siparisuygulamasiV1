'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { mockStores, mockCategories } from '@/app/data/mockdatas';

export default function AddProduct() {
  return (
    <AuthGuard requiredRole="admin">
      <AddProductContent />
    </AuthGuard>
  );
}

function AddProductContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    storeId: '',
    category: '',
    mainCategory: '',
    image: 'https://placehold.co/150',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Mağazaları getir
    setLoading(true);
    setTimeout(() => {
      // Aktif mağazaları filtrele
      const activeStores = mockStores.filter(store => 
        store.status === 'active' && store.approved
      );
      setStores(activeStores);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    // Mağaza seçildiğinde kategorileri güncelle
    if (formData.storeId) {
      const storeId = parseInt(formData.storeId);
      const store = stores.find(s => s.id === storeId);
      
      if (store) {
        // Ana kategoriyi güncelle
        setFormData(prev => ({
          ...prev,
          mainCategory: store.categoryId
        }));

        // Seçilen mağazanın ana kategorisine göre alt kategorileri getir
        const mainCategory = mockCategories.find(cat => cat.id === parseInt(store.categoryId));
        
        if (mainCategory && mainCategory.subcategories) {
          const subCategories = mainCategory.subcategories.map(subcat => subcat.name);
          setCategories(subCategories);
          
          // Eğer mevcut kategori bu yeni seçenekler arasında değilse, ilk kategoriyi seç
          if (!subCategories.includes(formData.category) && subCategories.length > 0) {
            setFormData(prev => ({
              ...prev,
              category: subCategories[0]
            }));
          }
        } else {
          setCategories([]);
        }
      }
    }
  }, [formData.storeId, stores]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Fiyat alanı için sayısal kontrol
    if (name === 'price') {
      const regex = /^\d*\.?\d{0,2}$/;
      if (value === '' || regex.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Formda eksik bilgi kontrolü
      if (!formData.name || !formData.price || !formData.storeId || !formData.category) {
        throw new Error('Lütfen gerekli tüm alanları doldurun.');
      }

      // Gerçek projede burada bir API isteği yapılarak ürün eklenir
      // Simülasyon amaçlı timeout kullanıyoruz
      setTimeout(() => {
        // Başarılı ekleme durumunda ürün listesine yönlendir
        router.push('/admin/products');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Bir hata oluştu, lütfen tekrar deneyin.');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Yeni Ürün Ekle</h1>
          <p className="text-gray-600 mt-1">Yeni bir ürün eklemek için formu doldurun</p>
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
              <label htmlFor="storeId" className="block text-sm font-medium text-gray-700 mb-1">
                Mağaza
              </label>
              <select
                id="storeId"
                name="storeId"
                value={formData.storeId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Mağaza Seçin</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={categories.length === 0}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Kategori Seçin</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Görseli URL
              </label>
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ürün görsel URL'si"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Açıklaması
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ürün hakkında açıklama girin"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Link
              href="/admin/products"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                submitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 