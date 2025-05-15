'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { mockProducts, mockStores, mockCategories } from '@/app/data/mockdatas';
import FileUploader from '@/components/FileUploader';
import { useFileUpload } from '@/contexts/FileContext';

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
  const productId = params?.id ? parseInt(params.id) : null;
  const { uploadFile } = useFileUpload();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    storeId: '',
    category: '',
    mainCategory: '',
    image: '',
    status: 'active'
  });

  // Mağaza listesini yükle
  useEffect(() => {
    // Mock API çağrısı - Mağaza listesi
    setTimeout(() => {
      const activeStores = mockStores.filter(store => store.status === 'active');
      setStores(activeStores);
      
      // Ana kategorileri yükle
      const mainCats = mockCategories.map(cat => ({
        id: cat.id,
        name: cat.name
      }));
      setMainCategories(mainCats);
    }, 500);
  }, []);
  
  // Ürün verilerini yükle
  useEffect(() => {
    // Ürün verilerini yükle
    if (productId !== null && stores.length > 0) {
      setLoading(true);
      
      // Mock API çağrısı - Ürün detayları
      setTimeout(() => {
        // Merkezi mock veri deposundan ürünü bul
        const product = mockProducts.find(p => p.id === productId);
        
        if (product) {
          setFormData({
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            storeId: product.storeId.toString(),
            category: product.category,
            mainCategory: product.mainCategory,
            image: product.image,
            status: product.status
          });
          
          // Mağaza seçildiğinde uygun kategorileri yükle
          const store = stores.find(s => s.id === product.storeId);
          if (store) {
            // Ana kategoriyi bul
            const mainCategory = mockCategories.find(cat => cat.id === parseInt(store.categoryId));
            setSelectedMainCategory(mainCategory);
            
            if (mainCategory && mainCategory.subcategories) {
              const subCategories = mainCategory.subcategories.map(subcat => subcat.name);
              setCategories(subCategories);
            } else {
              setCategories([]);
            }
          }
          
          setNotFound(false);
        } else {
          // Ürün bulunamadı
          setNotFound(true);
        }
        
        setLoading(false);
      }, 1000);
    }
  }, [productId, stores]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'storeId' && value) {
      // Mağaza seçildiğinde uygun kategorileri yükle
      const store = stores.find(s => s.id === parseInt(value));
      if (store) {
        // Ana kategoriyi bul
        const mainCategory = mockCategories.find(cat => cat.id === parseInt(store.categoryId));
        setSelectedMainCategory(mainCategory);
        
        if (mainCategory && mainCategory.subcategories) {
          const subCategories = mainCategory.subcategories.map(subcat => subcat.name);
          setCategories(subCategories);
          
          // Kategori seçimini sıfırla
          setFormData(prev => ({ ...prev, [name]: value, category: '' }));
          return;
        }
      }
      
      // Kategori bulunamadıysa kategorileri temizle
      setCategories([]);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (file) => {
    if (!file) {
      setFormData(prev => ({ ...prev, image: '' }));
      return;
    }

    try {
      // FileContext üzerinden dosya yükleme işlemi
      const fileInfo = await uploadFile(file, {
        path: 'products',
        fileName: `product_${productId}_${Date.now()}`
      });
      
      if (fileInfo && fileInfo.url) {
        setFormData(prev => ({ ...prev, image: fileInfo.url }));
      }
    } catch (error) {
      console.error("Dosya yükleme hatası:", error);
      setError('Dosya yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
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

      // Gerçek projede burada bir API isteği yapılarak ürün güncellenir
      // Simülasyon amaçlı timeout kullanıyoruz
      setTimeout(() => {
        // Başarılı güncelleme durumunda ürün listesine yönlendir
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
              <div className="flex flex-col space-y-2">
                {selectedMainCategory && (
                  <div className="text-sm text-gray-500">
                    Ana Kategori: {selectedMainCategory.name}
                  </div>
                )}
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  disabled={categories.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Alt Kategori Seçin</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
                {categories.length === 0 && formData.storeId && (
                  <p className="text-xs text-amber-600">Seçilen mağazanın kategorisi için alt kategori bulunamadı.</p>
                )}
              </div>
            </div>

            <div>
              <FileUploader
                defaultImage={formData.image}
                onImageUpload={handleImageUpload}
                label="Ürün Görseli"
                id="productImage"
                name="productImage"
                accept="image/*"
                maxSizeInMB={2}
                showCropper={true}
                placeholderImage="/placeholder-product.jpg"
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
              {submitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 