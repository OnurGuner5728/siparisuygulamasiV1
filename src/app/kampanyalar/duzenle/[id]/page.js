'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { mockCampaigns, campaignTypes, campaignCategories, mockStores, mockCategories } from '@/app/data/mockdatas';
import AuthGuard from '@/components/AuthGuard';

export default function EditCampaignPage() {
  return (
    <AuthGuard requiredRole="kampanya" permissionType="create">
      <EditCampaignContent />
    </AuthGuard>
  );
}

function EditCampaignContent() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [campaign, setCampaign] = useState(null);
  const [stores, setStores] = useState([]);
  
  // Form verileri
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    storeId: '',
    categoryId: null, // Kategori ID'si
    discountType: 'percent',
    discount: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    code: '',
    startDate: '',
    endDate: '',
    maxUsage: '',
    conditions: ''
  });
  
  // Kampanya ve mağaza verilerini yükle
  useEffect(() => {
    // API çağrısı simülasyonu
    setTimeout(() => {
      // Kampanyayı bul
      const foundCampaign = mockCampaigns.find(c => c.id.toString() === campaignId);
      
      if (!foundCampaign) {
        setError('Kampanya bulunamadı');
        setLoading(false);
        return;
      }
      
      setCampaign(foundCampaign);
      
      // Yetki kontrolü - sadece admin veya kampanya sahibi düzenleyebilir
      const canEdit = 
        hasPermission('kampanya', 'admin') || 
        (user && foundCampaign.createdBy && foundCampaign.createdBy.id === user.id);
      
      if (!canEdit) {
        setError('Bu kampanyayı düzenleme yetkiniz bulunmamaktadır.');
        setLoading(false);
        return;
      }
      
      // Admin için tüm mağazaları gösterelim
      if (user?.role === 'admin') {
        setStores(mockStores);
      } 
      // Mağaza kullanıcıları için kendi mağazasını gösterelim
      else if (user?.role === 'store') {
        // E-posta yerine kullanıcı ID'si ile filtreleme yapıyoruz
        const userStores = mockStores.filter(store => store.ownerId === user.id);
        setStores(userStores);
      }
      
      // Form verilerini kampanyaya göre doldur
      setFormData({
        title: foundCampaign.title,
        description: foundCampaign.description,
        storeId: foundCampaign.storeId.toString(),
        categoryId: foundCampaign.categoryId,
        discountType: foundCampaign.discountType,
        discount: foundCampaign.discount.toString(),
        minOrderAmount: foundCampaign.minOrderAmount ? foundCampaign.minOrderAmount.toString() : '',
        maxDiscountAmount: foundCampaign.maxDiscountAmount ? foundCampaign.maxDiscountAmount.toString() : '',
        code: foundCampaign.code,
        startDate: foundCampaign.startDate.split('T')[0], // Tarih kısmını alıyoruz
        endDate: foundCampaign.endDate.split('T')[0], // Tarih kısmını alıyoruz
        maxUsage: foundCampaign.maxUsage ? foundCampaign.maxUsage.toString() : '',
        conditions: foundCampaign.conditions || ''
      });
      
      setLoading(false);
    }, 500);
  }, [campaignId, user, hasPermission]);
  
  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      // Form validasyonu
      if (!formData.title || !formData.description || !formData.storeId || !formData.code) {
        throw new Error('Lütfen tüm gerekli alanları doldurun.');
      }
      
      if (!formData.categoryId) {
        throw new Error('Bir kategori seçmelisiniz.');
      }
      
      if (formData.discountType !== 'free_delivery' && (!formData.discount || isNaN(formData.discount) || Number(formData.discount) <= 0)) {
        throw new Error('Geçerli bir indirim değeri giriniz.');
      }
      
      // Gerçek uygulamada burada bir API isteği yapılacak
      // Şimdilik sadece bir simülasyon yapıyoruz
      console.log('Kampanya güncelleniyor:', formData);
      
      // Başarılı güncelleme simülasyonu
      setTimeout(() => {
        setSubmitting(false);
        setSuccess(true);
        
        // Başarılı olduktan sonra kampanyalar sayfasına yönlendir
        setTimeout(() => {
          router.push('/kampanyalar');
        }, 1500);
      }, 1000);
      
    } catch (error) {
      setSubmitting(false);
      setError(error.message);
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
    setFormData({
      ...formData,
      categoryId: parseInt(e.target.value)
    });
  };
  
  // Seçilen mağazanın adını al
  const getStoreName = (storeId) => {
    if (!storeId) return '';
    const store = stores.find(s => s.id === parseInt(storeId));
    return store ? store.name : '';
  };
  
  // Kategori adını ID'ye göre bul
  const getCategoryName = (categoryId) => {
    if (!categoryId) return '';
    const category = mockCategories.find(c => c.id === categoryId);
    return category ? category.name : '';
  };
  
  // Kullanıcının mağazalarını getir (artık e-mail değil, ID tabanlı)
  const getUserStores = () => {
    const userId = user?.id;
    
    if (!userId) return [];
    
    // Kullanıcı ID'sine göre mağazaları filtrele
    return mockStores.filter(store => store.ownerId === userId);
  };

  // Kullanıcının mağazalarına göre kampanya erişimini kontrol et
  const checkCampaignAccess = () => {
    // Kampanyayı bul
    const campaign = mockCampaigns.find(c => c.id === parseInt(campaignId));
    if (!campaign) return false;

    const userId = user?.id;
    
    if (!userId) return false;
    
    // Admin ise tam erişim ver
    if (user.role === 'admin') return true;
    
    // Kullanıcının mağazalarını bul
    const userStores = getUserStores();
    const userStoreIds = userStores.map(store => store.id);
    
    // Kampanyanın ait olduğu mağaza, kullanıcının mağazalarından biriyse erişim ver
    return userStoreIds.includes(campaign.storeId);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Kampanya yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  if (error && !formData.title) {
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
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
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
        <h1 className="text-2xl font-bold mb-6">Kampanya Düzenle - {campaign?.title}</h1>
        
        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p>Kampanya başarıyla güncellendi! Yönlendiriliyorsunuz...</p>
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
                  <label htmlFor="storeId" className="block text-sm font-medium text-gray-700 mb-1">
                    Mağaza *
                  </label>
                  <select
                    id="storeId"
                    name="storeId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.storeId}
                    onChange={handleChange}
                    required
                    disabled={user?.role !== 'admin'} // Sadece admin mağazayı değiştirebilir
                  >
                    <option value="">Mağaza Seçin</option>
                    {stores.map(store => (
                      <option key={store.id} value={store.id}>
                        {store.name} ({getCategoryName(store.categoryId)})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.categoryId || ''}
                    onChange={handleCategoryChange}
                    required
                  >
                    <option value="">Kategori Seçin</option>
                    {mockCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* İndirim Detayları */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 pb-2 border-b">İndirim Detayları</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="discountType" className="block text-sm font-medium text-gray-700 mb-1">
                    İndirim Türü *
                  </label>
                  <select
                    id="discountType"
                    name="discountType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.discountType}
                    onChange={handleChange}
                    required
                  >
                    {campaignTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                {formData.discountType !== 'free_delivery' && (
                  <div>
                    <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                      İndirim Miktarı *
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        id="discount"
                        name="discount"
                        className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.discount}
                        onChange={handleChange}
                        min="0"
                        step={formData.discountType === 'percent' ? '1' : '0.01'}
                        required={formData.discountType !== 'free_delivery'}
                      />
                      <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-100 text-gray-500 rounded-r-md">
                        {formData.discountType === 'percent' ? '%' : 'TL'}
                      </span>
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="minOrderAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Sipariş Tutarı
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      id="minOrderAmount"
                      name="minOrderAmount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.minOrderAmount}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                    />
                    <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-100 text-gray-500 rounded-r-md">
                      TL
                    </span>
                  </div>
                </div>
                
                {(formData.discountType === 'percent' || formData.discountType === 'amount') && (
                  <div>
                    <label htmlFor="maxDiscountAmount" className="block text-sm font-medium text-gray-700 mb-1">
                      Maksimum İndirim Tutarı
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        id="maxDiscountAmount"
                        name="maxDiscountAmount"
                        className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.maxDiscountAmount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                      />
                      <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-100 text-gray-500 rounded-r-md">
                        TL
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Geçerlilik Detayları */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 pb-2 border-b">Geçerlilik Detayları</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Bitiş Tarihi *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="maxUsage" className="block text-sm font-medium text-gray-700 mb-1">
                    Maksimum Kullanım Sayısı
                  </label>
                  <input
                    type="number"
                    id="maxUsage"
                    name="maxUsage"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.maxUsage}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="conditions" className="block text-sm font-medium text-gray-700 mb-1">
                    Kullanım Koşulları
                  </label>
                  <textarea
                    id="conditions"
                    name="conditions"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.conditions}
                    onChange={handleChange}
                    placeholder="Örn: Diğer kampanyalarla birleştirilemez, belirli ürünlerde geçerli değildir, vb."
                  ></textarea>
                </div>
              </div>
            </div>
            
            {/* Önizleme */}
            <div className="mb-6 bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-3">Kampanya Önizleme</h2>
              
              {formData.title && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-xl font-bold mb-2">{formData.title}</h3>
                  <p className="text-gray-600 mb-3">{formData.description}</p>
                  
                  {formData.storeId && (
                    <div className="mb-2">
                      <span className="font-medium">Mağaza:</span> {getStoreName(formData.storeId)}
                    </div>
                  )}
                  
                  {formData.categoryId && (
                    <div className="mb-2">
                      <span className="font-medium">Kategori:</span> {getCategoryName(formData.categoryId)}
                    </div>
                  )}
                  
                  <div className="mb-2">
                    <span className="font-medium">Kod:</span> {formData.code || 'XXXX'}
                  </div>
                  
                  <div className="mb-2">
                    <span className="font-medium">İndirim:</span> {' '}
                    {formData.discountType === 'percent' ? `%${formData.discount || '0'}` : 
                     formData.discountType === 'amount' ? `${formData.discount || '0'} TL` : 
                     'Ücretsiz Teslimat'}
                  </div>
                  
                  {formData.minOrderAmount && (
                    <div className="mb-2">
                      <span className="font-medium">Min. Sipariş:</span> {formData.minOrderAmount} TL
                    </div>
                  )}
                  
                  <div className="mb-2">
                    <span className="font-medium">Geçerlilik:</span> {formatDate(formData.startDate)} - {formatDate(formData.endDate)}
                  </div>
                  
                  {formData.categoryId && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          mockCategories.find(c => c.id === formData.categoryId)?.color || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {getCategoryName(formData.categoryId)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Form Butonları */}
            <div className="flex justify-end gap-2 mt-6">
              <Link 
                href="/kampanyalar" 
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
              >
                İptal
              </Link>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Kaydediliyor...
                  </span>
                ) : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Tarih formatlama fonksiyonu
function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('tr-TR', options);
} 