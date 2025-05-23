'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';

export default function AddProduct() {
  return (
    <AuthGuard requiredRole="store">
      <AddProductContent />
    </AuthGuard>
  );
}

function AddProductContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: 'https://via.placeholder.com/150',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [store, setStore] = useState(null);

  // Mağaza onaylanmamışsa yönlendir
  if (!user?.storeInfo?.is_approved) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-orange-500 text-5xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Mağaza Onayı Gerekli</h2>
            <p className="text-gray-600 mb-4">
              Ürün eklemek için mağazanızın onaylanması gerekiyor.
            </p>
            <Link
              href="/store"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Ana Panele Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Kategori verilerini ve mağaza bilgilerini yükle
    const fetchData = async () => {
      try {
        // Kullanıcının mağaza bilgilerini al
        if (user) {
          console.log("Add Product - User:", user);
          const storeData = await api.getStoreByUserId(user.id);
          console.log("Add Product - Store Data:", storeData);
          
          if (storeData) {
            setStore(storeData);
            
            // Mağaza kategorisine uygun alt kategorileri getir
            console.log("Add Product - Store category_id:", storeData.category_id);
            const categoriesData = await api.getSubcategoriesByParentId(storeData.category_id);
            console.log("Add Product - Categories Data:", categoriesData);
            setCategories(categoriesData || []);
            
            // Eğer alt kategori yoksa, ana kategorilerin tümünü getir
            if (!categoriesData || categoriesData.length === 0) {
              console.log("Add Product - No subcategories, fetching all categories");
              const allCategories = await api.getCategories();
              console.log("Add Product - All Categories:", allCategories);
              setCategories(allCategories || []);
            }
          }
        }
      } catch (err) {
        console.error('Veri yüklenirken hata:', err);
        setError('Kategoriler yüklenirken bir hata oluştu');
      }
    };

    fetchData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`handleChange - ${name}:`, value);
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log("Submit - Form Data:", formData);
    console.log("Submit - Categories:", categories);
    console.log("Submit - Store:", store);

    // Form doğrulama
    if (!formData.name || !formData.price || !formData.category) {
      setError('Lütfen zorunlu alanları doldurun');
      setLoading(false);
      return;
    }

    // Fiyat kontrolü
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setError('Lütfen geçerli bir fiyat girin');
      setLoading(false);
      return;
    }

    try {
      // Ürünü ekle
      const productData = {
        name: formData.name,
        description: formData.description || '',
        price: parseFloat(formData.price),
        category: formData.category, // Bu category ID'si veya name'i olabilir
        image: formData.image || 'https://via.placeholder.com/150',
        store_id: store.id,
        is_available: formData.status === 'active', // status'u is_available'a çevir
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Eğer category numeric ise integer'a çevir
      if (formData.category && !isNaN(formData.category)) {
        productData.category = parseInt(formData.category);
      }
      
      console.log("Submit - Product Data:", productData);
      console.log("Submit - Store ID:", store.id);
      console.log("Submit - Category Value:", formData.category);
      console.log("Submit - Category Type:", typeof productData.category);
      
      await api.createProduct(productData);
      router.push('/store/products');
    } catch (err) {
      console.error('Ürün eklenirken hata:', err);
      console.error('Hata detayı:', {
        message: err.message,
        stack: err.stack,
        response: err.response,
        data: err.response?.data,
        status: err.response?.status
      });
      
      // Daha anlamlı hata mesajları
      let errorMessage = 'Ürün eklenirken bir hata oluştu';
      
      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;
        
        switch (status) {
          case 400:
            if (errorData?.message) {
              errorMessage = `Geçersiz veri: ${errorData.message}`;
            } else if (errorData?.error) {
              errorMessage = `Veritabanı hatası: ${errorData.error}`;
            } else {
              errorMessage = 'Gönderilen veriler geçersiz. Lütfen tüm alanları kontrol edin.';
            }
            break;
          case 401:
            errorMessage = 'Yetkiniz yok. Lütfen tekrar giriş yapın.';
            break;
          case 403:
            errorMessage = 'Bu işlem için yetkiniz bulunmuyor.';
            break;
          case 500:
            errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
            break;
          default:
            errorMessage = `Beklenmeyen hata (${status}). Lütfen tekrar deneyin.`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Yeni Ürün Ekle</h1>
          <p className="text-gray-600 mt-1">Menünüze yeni bir ürün ekleyin</p>
        </div>
        <Link 
          href="/store/products"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Ürünlere Dön
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Fiyat (TL) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Kategori Seçin</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Yüklenen kategori sayısı: {categories.length}
                {categories.length > 0 && ` - İlk kategori: ${categories[0]?.name}`}
              </p>
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
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Görseli
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 h-32 w-32 bg-gray-100 rounded-md overflow-hidden">
                  <img 
                    src={formData.image} 
                    alt="Ürün önizleme" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="image" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                    Görsel Seç
                  </label>
                  <input 
                    id="image" 
                    name="image" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="sr-only" 
                  />
                  <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF max 1MB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Link 
              href="/store/products"
              className="mr-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  İşleniyor...
                </>
              ) : (
                'Ürünü Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 