'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';

export default function CreateCampaignPage() {
  return (
    <AuthGuard requiredRole="kampanya" permissionType="create">
      <CreateCampaignContent />
    </AuthGuard>
  );
}

function CreateCampaignContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Mağazaları ve kategorileri yükle
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoadingData(true);
        
        // Kullanıcının rolüne göre mağazaları yükle
        let storesData = [];
        if (user.role === 'admin') {
          // Admin için tüm mağazaları getir
          storesData = await api.getStores();
        } else if (user.role === 'store') {
          // Mağaza kullanıcısı için kendi mağazasını getir
          storesData = await api.getStores({ owner_id: user.id });
        }
        
        setStores(storesData || []);
        
        // Kampanya kategorilerini getir
        const campaignCategoriesData = await api.getMainCategories();
        setCategories(campaignCategoriesData || []);
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
        setError('Veri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Form verileri
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    store_id: '',
    categories: [],
    discount_type: 'percentage',
    discount: '',
    min_order_amount: '',
    max_discount_amount: '',
    code: '',
    start_date: getTodayDateString(),
    end_date: getNextMonthDateString(),
    max_usage: '',
    conditions: '',
    image_url: '',
    is_active: true,
    main_category_id: ''
  });
  
  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Form validasyonu
      if (!formData.title || !formData.description || !formData.code) {
        throw new Error('Lütfen tüm gerekli alanları doldurun.');
      }
      
      // Mağaza veya ana kategori seçilmiş olmalı
      if (!formData.store_id && !formData.main_category_id) {
        throw new Error('Lütfen bir mağaza veya ana kategori seçin.');
      }
      
      if (formData.categories.length === 0) {
        throw new Error('En az bir kategori seçmelisiniz.');
      }
      
      // İndirim türü kontrolü
      const validDiscountTypes = ['percentage', 'amount', 'free_delivery'];
      if (!formData.discount_type || !validDiscountTypes.includes(formData.discount_type)) {
        throw new Error('Geçerli bir indirim türü seçmelisiniz.');
      }
      
      if (formData.discount_type !== 'free_delivery' && (!formData.discount || isNaN(formData.discount) || Number(formData.discount) <= 0)) {
        throw new Error('Geçerli bir indirim değeri giriniz.');
      }
      
      // API isteği için verileri hazırla
      const campaignData = {
        ...formData,
        discount: formData.discount ? parseFloat(formData.discount) : null,
        min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
        max_usage: formData.max_usage ? parseInt(formData.max_usage) : null,
        created_by: user.id,
        updated_by: user.id,
        store_id: formData.store_id || null,
        main_category_id: formData.main_category_id || null,
        discount_type: formData.discount_type || 'percentage' // Varsayılan değer olarak 'percent' kullan
      };
      
      // API üzerinden kampanya oluştur
      await api.createCampaign(campaignData);
      
      setSuccess(true);
      
      // Başarılı olduktan sonra kampanyalar sayfasına yönlendir
      setTimeout(() => {
        router.push('/kampanyalar');
      }, 1500);
      
    } catch (error) {
      console.error('Kampanya oluşturulurken hata:', error);
      setError(error.message || 'Kampanya oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  // Form alanları değiştiğinde
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Kategori seçimi
  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setFormData({
        ...formData,
        categories: [...formData.categories, value]
      });
    } else {
      setFormData({
        ...formData,
        categories: formData.categories.filter(cat => cat !== value)
      });
    }
  };
  
  // Ana kategori değiştiğinde
  const handleMainCategoryChange = (e) => {
    const value = e.target.value;
    
    setFormData({
      ...formData,
      main_category_id: value,
      // Eğer ana kategori seçiliyse store_id'yi temizle
      ...(value ? { store_id: '' } : {})
    });
  };
  
  // Mağaza değiştiğinde
  const handleStoreChange = (e) => {
    const value = e.target.value;
    
    setFormData({
      ...formData,
      store_id: value,
      // Eğer mağaza seçiliyse main_category_id'yi temizle
      ...(value ? { main_category_id: '' } : {})
    });
  };
  
  // Dosya yükleme işlemi
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setLoading(true);
      
      // API ile dosya yükleme işlemi
      const imageUrl = await api.uploadImage(file, 'campaigns');
      
      setFormData(prev => ({
        ...prev,
        image_url: imageUrl
      }));
      
    } catch (error) {
      console.error('Resim yüklenirken hata:', error);
      setError('Resim yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  // Seçilen mağazanın adını al
  const getStoreName = (storeId) => {
    if (!storeId) return '';
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : '';
  };
  
  if (isLoadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/kampanyalar" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Tüm Kampanyalar
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Yeni Kampanya Oluştur</h1>
        
        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p>Kampanya başarıyla oluşturuldu! Yönlendiriliyorsunuz...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            )}
            
            {/* Temel Bilgiler */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 pb-2 border-b">Temel Bilgiler</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Kampanya Başlığı *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                    Kampanya Kodu *
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.code}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="store_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Mağaza
                  </label>
                  <select
                    id="store_id"
                    name="store_id"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.store_id}
                    onChange={handleStoreChange}
                    disabled={formData.main_category_id}
                  >
                    <option value="">Mağaza Seçin</option>
                    {stores.map(store => (
                      <option key={store.id} value={store.id}>
                        {store.name} ({store.type})
                      </option>
                    ))}
                  </select>
                  {formData.main_category_id && (
                    <p className="text-xs text-gray-500 mt-1">
                      Ana kategori seçiliyken mağaza seçilemez.
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="main_category_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Ana Kategori
                  </label>
                  <select
                    id="main_category_id"
                    name="main_category_id"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.main_category_id}
                    onChange={handleMainCategoryChange}
                    disabled={formData.store_id}
                  >
                    <option value="">Ana Kategori Seçin</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {formData.store_id && (
                    <p className="text-xs text-gray-500 mt-1">
                      Mağaza seçiliyken ana kategori seçilemez.
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategoriler *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {categories.map(category => (
                      <label key={category.id} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-blue-600"
                          value={category.id.toString()}
                          checked={formData.categories.includes(category.id.toString())}
                          onChange={handleCategoryChange}
                        />
                        <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    Kampanya Görseli
                  </label>
                  <div className="flex items-center">
                    {formData.image_url ? (
                      <div className="relative w-32 h-32 mr-4 border rounded-md overflow-hidden">
                        <img
                          src={formData.image_url}
                          alt="Kampanya görseli"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: '' })}
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
            </div>
            
            {/* İndirim Detayları */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 pb-2 border-b">İndirim Detayları</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="discount_type" className="block text-sm font-medium text-gray-700 mb-1">
                    İndirim Türü *
                  </label>
                  <select
                    id="discount_type"
                    name="discount_type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.discount_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="percentage">Yüzde İndirim (%)</option>
                    <option value="amount">Tutar İndirim (TL)</option>
                    <option value="free_delivery">Ücretsiz Teslimat</option>
                  </select>
                </div>
                
                {formData.discount_type !== 'free_delivery' && (
                  <div>
                    <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                      İndirim Değeri *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="discount"
                        name="discount"
                        min="0"
                        step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.discount}
                        onChange={handleChange}
                        required={formData.discount_type !== 'free_delivery'}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">
                          {formData.discount_type === 'percentage' ? '%' : 'TL'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="min_order_amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Sipariş Tutarı
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="min_order_amount"
                      name="min_order_amount"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.min_order_amount}
                      onChange={handleChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">TL</span>
                    </div>
                  </div>
                </div>
                
                {formData.discount_type === 'percentage' && (
                  <div>
                    <label htmlFor="max_discount_amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Maksimum İndirim Tutarı
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="max_discount_amount"
                        name="max_discount_amount"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.max_discount_amount}
                        onChange={handleChange}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">TL</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="max_usage" className="block text-sm font-medium text-gray-700 mb-1">
                    Maksimum Kullanım Sayısı
                  </label>
                  <input
                    type="number"
                    id="max_usage"
                    name="max_usage"
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.max_usage}
                    onChange={handleChange}
                    placeholder="Sınırsız için boş bırakın"
                  />
                </div>
                
                <div>
                  <label htmlFor="conditions" className="block text-sm font-medium text-gray-700 mb-1">
                    Kullanım Koşulları
                  </label>
                  <textarea
                    id="conditions"
                    name="conditions"
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.conditions}
                    onChange={handleChange}
                    placeholder="Opsiyonel"
                  ></textarea>
                </div>
              </div>
            </div>
            
            {/* Zaman Ayarları */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 pb-2 border-b">Zaman Ayarları</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Bitiş Tarihi *
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="is_active" className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    <span className="ml-2 text-sm text-gray-700">Kampanya Aktif</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Gönder Butonu */}
            <div className="flex justify-end">
              <Link 
                href="/kampanyalar"
                className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                İptal
              </Link>
              
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Kaydediliyor...
                  </span>
                ) : (
                  'Kampanya Oluştur'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD formatı
}

function getNextMonthDateString() {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return nextMonth.toISOString().split('T')[0]; // YYYY-MM-DD formatı
}

function formatDate(dateString) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('tr-TR', options);
} 