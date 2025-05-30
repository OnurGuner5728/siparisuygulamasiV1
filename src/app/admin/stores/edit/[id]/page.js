'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api'; // API servisini import et
import { use } from 'react';

export default function EditStorePage({ params: promiseParams }) {
  return (
    <AuthGuard requiredRole="admin">
      <EditStoreContent promiseParams={promiseParams} />
    </AuthGuard>
  );
}

function EditStoreContent({ promiseParams }) {
  const router = useRouter();
  const params = use(promiseParams);
  const storeId = params?.id; 
  
  const [formData, setFormData] = useState({
    name: '',
    owner_id: '', // ownerName yerine owner_id kullanılacak
    email: '',
    phone: '',
    category_id: '', // category yerine category_id kullanılacak
    description: '',
    address: '',
    status: 'active',
    is_approved: true,
    workingHours: { // workingHours olarak değiştirildi ve string format
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    delivery_fee: 0,
    delivery_time_min: 30,
    delivery_time_max: 60,
    minimum_order_amount: 0,
    logo_url: '', // Logo URL'i için state eklendi
    banner_url: '', // Banner URL'i için state eklendi
    commission_rate: 0, // Komisyon oranı
    payment_link: '', // Ödeme linki
  });

  const [allUsers, setAllUsers] = useState([]); // Mağaza sahibi seçimi için
  const [mainCategories, setMainCategories] = useState([]); // Kategori seçimi için

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    console.log('useEffect called with storeId:', storeId); // Debug için
    if (storeId) {
      setLoading(true);
      
      const fetchData = async () => {
        try {
          console.log('Fetching store data for ID:', storeId); // Debug için
          const storeData = await api.getStoreById(storeId);
          console.log('API response - storeData:', storeData); // Debug için
          
          const usersData = await api.getAllUsers(); // Tüm kullanıcıları al
          const categoriesData = await api.getMainCategories();

          setAllUsers(usersData.filter(user => user.role === 'store' || user.role === 'admin')); // Sadece mağaza veya admin rollerini al
          setMainCategories(categoriesData);

          if (storeData) {
            console.log('Store Data workingHours:', storeData.workingHours); // Debug için
            
            // workingHours verisini işle
            let workingHoursData = {
              monday: '',
              tuesday: '',
              wednesday: '',
              thursday: '',
              friday: '',
              saturday: '',
              sunday: ''
            };
            
            if (storeData.workingHours) {
              try {
                // workingHours string olarak gelebilir, parse etmeye çalış
                let parsedWorkingHours = storeData.workingHours;
                if (typeof storeData.workingHours === 'string') {
                  parsedWorkingHours = JSON.parse(storeData.workingHours);
                }
                
                console.log('Parsed workingHours:', parsedWorkingHours); // Debug için
                
                if (parsedWorkingHours && typeof parsedWorkingHours === 'object') {
                  workingHoursData = {
                    monday: parsedWorkingHours.monday || '',
                    tuesday: parsedWorkingHours.tuesday || '',
                    wednesday: parsedWorkingHours.wednesday || '',
                    thursday: parsedWorkingHours.thursday || '',
                    friday: parsedWorkingHours.friday || '',
                    saturday: parsedWorkingHours.saturday || '',
                    sunday: parsedWorkingHours.sunday || '',
                  };
                }
              } catch (error) {
                console.error('workingHours parse hatası:', error);
                // Parse hatası durumunda varsayılan değerleri kullan
              }
            }
            
            console.log('Processed workingHoursData:', workingHoursData); // Debug için
            
            setFormData({
              name: storeData.name || '',
              owner_id: storeData.owner_id || '',
              email: storeData.email || '',
              phone: storeData.phone || '',
              category_id: storeData.category_id || '',
              description: storeData.description || '',
              address: storeData.address || '',
              status: storeData.status || 'active',
              is_approved: storeData.is_approved !== undefined ? storeData.is_approved : true,
              workingHours: workingHoursData,
              delivery_fee: storeData.delivery_fee || 0,
              delivery_time_min: storeData.delivery_time_min || 30,
              delivery_time_max: storeData.delivery_time_max || 60,
              minimum_order_amount: storeData.minimum_order_amount || 0,
              logo_url: storeData.logo_url || '',
              banner_url: storeData.banner_url || '',
              commission_rate: storeData.commission_rate || 0,
              payment_link: storeData.payment_link || '',
            });
            
            console.log('Set formData with workingHours:', workingHoursData); // Debug için
            setNotFound(false);
            
            // Async olarak formData'nın güncellenip güncellenmediğini kontrol et
            setTimeout(() => {
              console.log('formData after setState:', formData.workingHours);
            }, 100);
          } else {
            setNotFound(true);
          }
        } catch (error) {
          console.error('Mağaza bilgileri yüklenirken hata:', error);
          setError('Mağaza bilgileri yüklenirken bir hata oluştu.');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      setLoading(false); // storeId yoksa yüklemeyi bitir
      // Yeni mağaza oluşturma durumu için de kullanıcı ve kategorileri çekebiliriz.
      // Şimdilik sadece düzenleme odaklı.
       const fetchInitialData = async () => {
        try {
          const usersData = await api.getAllUsers();
          const categoriesData = await api.getMainCategories();
          setAllUsers(usersData.filter(user => user.role === 'store' || user.role === 'admin'));
          setMainCategories(categoriesData);
        } catch (err) {
          console.error("Başlangıç verileri yüklenirken hata:", err);
          setError("Sayfa için gerekli veriler yüklenemedi.");
        } finally {
            setLoading(false);
        }
      };
      fetchInitialData();
    }
  }, [storeId]);

  // formData state'inin değişimlerini izle
  useEffect(() => {
    console.log('formData updated:', formData.workingHours);
  }, [formData.workingHours]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'is_approved') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (!formData.name || !formData.email || !formData.category_id) {
        throw new Error('Lütfen Mağaza Adı, E-posta ve Kategori alanlarını doldurun.');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Lütfen geçerli bir e-posta adresi girin.');
      }

      if (formData.phone && !/^[0-9\s\-+()]{10,15}$/.test(formData.phone)) {
        throw new Error('Lütfen geçerli bir telefon numarası girin.');
      }
      
      // WorkingHours'u temizle - boş string'leri "Kapalı" yap
      const cleanWorkingHours = {};
      for (const [day, value] of Object.entries(formData.workingHours)) {
        cleanWorkingHours[day] = (value && value.trim() !== '') ? value : 'Kapalı';
      }

      const updateData = {
        ...formData,
        workingHours: JSON.stringify(cleanWorkingHours),
        // category_id zaten formData içinde doğru isimle bulunuyor.
        // owner_id de formData içinde doğru isimle bulunuyor.
      };
      // ownerName'i siliyoruz çünkü Supabase'de böyle bir alan yok
      delete updateData.ownerName;
      
      console.log('Submitting updateData.workingHours:', updateData.workingHours); // Debug için

      if (storeId) {
        await api.updateStore(storeId, updateData);
      } else {
        // Yeni mağaza oluşturma (Bu kısım bu dosyada ele alınmıyor, ayrı bir create sayfası olmalı)
        // await api.createStore(updateData); 
        // Şimdilik sadece düzenleme varsayıyoruz.
        throw new Error("Yeni mağaza oluşturma bu sayfada desteklenmiyor.");
      }
      
      router.push('/admin/stores');
    } catch (err) {
      console.error("Form gönderilirken hata:", err)
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
          <h1 className="text-2xl font-bold text-red-600 mb-4">Mağaza Bulunamadı</h1>
          <p className="text-gray-600 mb-6">İstediğiniz ID ({storeId}) ile eşleşen bir mağaza bulunamadı.</p>
          <Link 
            href="/admin/stores"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Mağazalar Listesine Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mağaza Düzenle</h1>
          <p className="text-gray-600 mt-1">ID: {storeId}</p>
        </div>
        <Link 
          href="/admin/stores"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Mağazalar Listesine Dön
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          <h2 className="text-xl font-semibold mb-4 text-gray-700">Temel Bilgiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Mağaza Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mağaza adını girin"
              />
            </div>

            <div>
              <label htmlFor="owner_id" className="block text-sm font-medium text-gray-700 mb-1">
                Mağaza Sahibi
              </label>
              <select
                id="owner_id"
                name="owner_id"
                value={formData.owner_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sahip Seçin</option>
                {allUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-posta <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="ornek@mail.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="(5xx) xxx xx xx"
              />
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Kategori Seçin</option>
                {mainCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Adres
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mağaza adresini girin"
              ></textarea>
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
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mağaza hakkında kısa bir açıklama"
              ></textarea>
            </div>
            <div>
              <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                id="logo_url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <label htmlFor="banner_url" className="block text-sm font-medium text-gray-700 mb-1">
                Banner URL
              </label>
              <input
                type="url"
                id="banner_url"
                name="banner_url"
                value={formData.banner_url}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/banner.png"
              />
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-700">Durum ve Onay</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Mağaza Durumu
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
                <option value="pending">Beklemede</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_approved"
                name="is_approved"
                checked={Boolean(formData.is_approved)}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
              />
              <label htmlFor="is_approved" className="text-sm font-medium text-gray-700">
                Onaylandı
              </label>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-700">Komisyon Ayarları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="commission_rate" className="block text-sm font-medium text-gray-700 mb-1">
                Komisyon Oranı (%)
              </label>
              <input
                type="number"
                id="commission_rate"
                name="commission_rate"
                value={formData.commission_rate}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örn: 10.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Mağazanın satışlarından alınacak komisyon yüzdesi (0-100 arasında)
              </p>
            </div>

            <div>
              <label htmlFor="payment_link" className="block text-sm font-medium text-gray-700 mb-1">
                Ödeme Linki
              </label>
              <input
                type="url"
                id="payment_link"
                name="payment_link"
                value={formData.payment_link}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://odeme.com/magaza-link"
              />
              <p className="text-xs text-gray-500 mt-1">
                Mağaza sahibinin komisyon ödemelerini yapabileceği ödeme sayfası linki
              </p>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-700">Çalışma Saatleri</h2>
          {!loading && (
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 gap-6">
              {Object.entries({
                monday: 'Pazartesi',
                tuesday: 'Salı', 
                wednesday: 'Çarşamba',
                thursday: 'Perşembe',
                friday: 'Cuma',
                saturday: 'Cumartesi',
                sunday: 'Pazar'
              }).map(([key, label]) => {
                console.log(`Rendering ${key}:`, formData.workingHours[key]); // Debug için
                const currentValue = formData.workingHours[key];
                const isChecked = currentValue !== 'Kapalı' && currentValue !== '' && currentValue !== 'Geçici Kapalı';
                console.log(`${key} - currentValue: "${currentValue}", isChecked: ${isChecked}`); // Debug için
                return (
                <div key={key} className="flex items-center space-x-4 p-3 border rounded-md">
                  <div className="w-24 text-sm font-medium text-gray-700">
                    {label}
                  </div>
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="checkbox"
                      id={`${key}_open`}
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            workingHours: {
                              ...prev.workingHours,
                              [key]: '09:00 - 18:00'
                            }
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            workingHours: {
                              ...prev.workingHours,
                              [key]: 'Kapalı'
                            }
                          }));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`${key}_open`} className="text-sm text-gray-600 w-12">
                      Açık
                    </label>
                    
                    {isChecked && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={formData.workingHours[key]?.split(' - ')[0] || '09:00'}
                          onChange={(e) => {
                            const endTime = formData.workingHours[key]?.split(' - ')[1] || '18:00';
                            setFormData(prev => ({
                              ...prev,
                              workingHours: {
                                ...prev.workingHours,
                                [key]: `${e.target.value} - ${endTime}`
                              }
                            }));
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="time"
                          value={formData.workingHours[key]?.split(' - ')[1] || '18:00'}
                          onChange={(e) => {
                            const startTime = formData.workingHours[key]?.split(' - ')[0] || '09:00';
                            setFormData(prev => ({
                              ...prev,
                              workingHours: {
                                ...prev.workingHours,
                                [key]: `${startTime} - ${e.target.value}`
                              }
                            }));
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              workingHours: {
                                ...prev.workingHours,
                                [key]: 'Geçici Kapalı'
                              }
                            }));
                          }}
                          className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs hover:bg-orange-200"
                        >
                          Geçici Kapat
                        </button>
                      </div>
                    )}
                    
                    {currentValue === 'Geçici Kapalı' && (
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm">
                          Geçici Kapalı
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              workingHours: {
                                ...prev.workingHours,
                                [key]: '09:00 - 18:00'
                              }
                            }));
                          }}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                        >
                          Yeniden Aç
                        </button>
                      </div>
                    )}
                    
                    {currentValue === 'Kapalı' && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        Kapalı
                      </span>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              • Çalışma saatlerini belirlemek için önce "Açık" seçeneğini işaretleyin<br/>
              • "Geçici Kapat" ile o günü geçici olarak kapatabilirsiniz<br/>
              • Zaman formatı: 09:00 - 18:00 şeklinde olmalıdır
            </p>
          </div>
          )}

          <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-700">Teslimat Ayarları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="minimum_order_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Sipariş Tutarı (TL)
              </label>
              <input
                type="number"
                id="minimum_order_amount"
                name="minimum_order_amount"
                value={formData.minimum_order_amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="delivery_fee" className="block text-sm font-medium text-gray-700 mb-1">
                Teslimat Ücreti (TL)
              </label>
              <input
                type="number"
                id="delivery_fee"
                name="delivery_fee"
                value={formData.delivery_fee}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="delivery_time_min" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Teslimat Süresi (dakika)
              </label>
              <input
                type="number"
                id="delivery_time_min"
                name="delivery_time_min"
                value={formData.delivery_time_min}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örn: 30"
              />
            </div>
            <div>
              <label htmlFor="delivery_time_max" className="block text-sm font-medium text-gray-700 mb-1">
                Maksimum Teslimat Süresi (dakika)
              </label>
              <input
                type="number"
                id="delivery_time_max"
                name="delivery_time_max"
                value={formData.delivery_time_max}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örn: 60"
              />
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Link 
              href="/admin/stores"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-md mr-3"
            >
              İptal
            </Link>
            <button 
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md disabled:opacity-50"
            >
              {submitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 