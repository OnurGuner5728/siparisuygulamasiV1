'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';

export default function EditProduct() {
  return (
    <AuthGuard requiredRole="store" permissionType="edit">
      <EditProductContent />
    </AuthGuard>
  );
}

function EditProductContent() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    is_available: true
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
              Ürün düzenlemek için mağazanızın onaylanması gerekiyor.
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
    // Ürün ve kategori verilerini yükle
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Kullanıcının mağazasını bul
        const userStores = await api.getStores({ owner_id: user?.id });
        
        if (!userStores || userStores.length === 0) {
          setError('Mağaza bilgisi bulunamadı.');
          setLoading(false);
          return;
        }
        
        const storeData = userStores[0]; // İlk mağazayı al
        setStore(storeData);
        
        // Ürün bilgisini getir
        const product = await api.getProductById(productId);
        
        if (!product) {
          setError('Ürün bulunamadı.');
          setLoading(false);
          return;
        }
        
        // Ürünün mağazaya ait olup olmadığını kontrol et
        if (product.store_id !== storeData.id) {
          setError('Bu ürünü düzenleme yetkiniz yok.');
          setLoading(false);
          return;
        }
        
        // Kategorileri getir
        const mainCategoryId = storeData.category_id;
        console.log("Edit Product - Store category_id:", mainCategoryId);
        
        let categoriesData = await api.getSubcategoriesByParentId(mainCategoryId);
        console.log("Edit Product - Categories Data:", categoriesData);
        
        // Eğer alt kategori yoksa, ana kategorilerin tümünü getir
        if (!categoriesData || categoriesData.length === 0) {
          console.log("Edit Product - No subcategories, fetching all categories");
          categoriesData = await api.getCategories();
          console.log("Edit Product - All Categories:", categoriesData);
        }
        
        setCategories(categoriesData || []);
        
        // Form verilerini doldur
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price ? product.price.toString() : '',
          category: product.category || '',
          image: product.image || '',
          is_available: product.is_available !== false // varsayılan olarak true
        });
        
      } catch (err) {
        console.error('Ürün detayları yüklenirken hata:', err);
        setError('Ürün detayları yüklenirken bir hata oluştu.');
      }
      
      setLoading(false);
    };

    if (user?.id) {
      fetchData();
    }
  }, [productId, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setSubmitting(true);
        
        // API ile dosya yükleme işlemi
        const imageUrl = await api.uploadImage(file, 'products');
        
        setFormData(prev => ({
          ...prev,
          image: imageUrl
        }));
        
      } catch (error) {
        console.error('Resim yüklenirken hata:', error);
        setError('Resim yüklenirken bir hata oluştu.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    // Form doğrulama
    if (!formData.name || !formData.price || !formData.category) {
      setError('Lütfen zorunlu alanları doldurun');
      setSubmitting(false);
      return;
    }

    // Fiyat kontrolü
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setError('Lütfen geçerli bir fiyat girin');
      setSubmitting(false);
      return;
    }

    try {
      // Ürün güncelleme API çağrısı
      await api.updateProduct(productId, {
        name: formData.name,
        description: formData.description,
        price: price,
        category: formData.category,
        image: formData.image,
        is_available: formData.is_available
      });
      
      setSuccess('Ürün başarıyla güncellendi');
      
      // Kısa süre sonra ürünler sayfasına yönlendir
      setTimeout(() => {
        router.push('/store/products');
      }, 1500);
      
    } catch (error) {
      console.error('Ürün güncellenirken hata:', error);
      setError('Ürün güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
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

  if (error && !formData.name) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
          {error}
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
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Ürün Düzenle</h1>
          <p className="text-gray-600 mt-1">{formData.name}</p>
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

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
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
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Yüklenen kategori sayısı: {categories.length}
                {categories.length > 0 && ` - İlk kategori: ${categories[0]?.name}`}
              </p>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Stok Durumu
              </label>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="is_available"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
                  Stokta var (Sipariş edilebilir)
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Açıklaması
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Görseli
              </label>
              <div className="mt-1 flex items-center">
                {formData.image ? (
                  <div className="relative w-32 h-32 mr-4 border rounded-md overflow-hidden">
                    <img
                      src={formData.image}
                      alt={formData.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 mr-4 border rounded-md flex items-center justify-center bg-gray-100">
                    <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Resim Yükle
                  </label>
                  <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF formatında 2MB'a kadar</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Link
              href="/store/products"
              className="mr-4 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className={`${
                submitting
                  ? 'bg-blue-400'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kaydediliyor...
                </span>
              ) : (
                'Değişiklikleri Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 