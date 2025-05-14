'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import StoreGuard from '@/components/StoreGuard';

export default function EditProduct() {
  return (
    <StoreGuard>
      <EditProductContent />
    </StoreGuard>
  );
}

function EditProductContent() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Mock kategori ve ürün verilerini yükle
    const fetchData = async () => {
      setLoading(true);
      
      // Kategorileri yükle (gerçek projede bir API isteği yapılacak)
      const mockCategories = [
        'Ana Yemekler',
        'Yan Ürünler',
        'İçecekler',
        'Tatlılar',
        'Atıştırmalıklar'
      ];
      
      // Ürün verilerini yükle (gerçek projede bir API isteği yapılacak)
      setTimeout(() => {
        const mockProducts = [
          {
            id: 1,
            name: 'Adana Kebap',
            description: 'Lezzetli Adana kebap',
            price: 120.00,
            category: 'Ana Yemekler',
            status: 'active',
            image: 'https://via.placeholder.com/150',
            rating: 4.8,
            reviewCount: 120,
            createdAt: '2023-01-15'
          },
          {
            id: 2,
            name: 'Urfa Kebap',
            description: 'Lezzetli Urfa kebap',
            price: 110.00,
            category: 'Ana Yemekler',
            status: 'active',
            image: 'https://via.placeholder.com/150',
            rating: 4.7,
            reviewCount: 95,
            createdAt: '2023-01-20'
          },
          {
            id: 3,
            name: 'Ayran',
            description: 'Soğuk ayran',
            price: 15.00,
            category: 'İçecekler',
            status: 'active',
            image: 'https://via.placeholder.com/150',
            rating: 4.5,
            reviewCount: 200,
            createdAt: '2023-01-10'
          }
        ];
        
        // ID'ye göre ürünü bul
        const product = mockProducts.find(p => p.id.toString() === productId);
        
        if (product) {
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            category: product.category,
            image: product.image,
            status: product.status
          });
          setCategories(mockCategories);
          setLoading(false);
        } else {
          setError('Ürün bulunamadı');
          setLoading(false);
        }
      }, 1000);
    };

    fetchData();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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

  const handleSubmit = (e) => {
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

    // Gerçek projede bir API isteği yapılır
    setTimeout(() => {
      setSuccess('Ürün başarıyla güncellendi');
      setSubmitting(false);
    }, 1000);
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
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
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
                    Görsel Değiştir
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
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kaydediliyor...
                </>
              ) : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 