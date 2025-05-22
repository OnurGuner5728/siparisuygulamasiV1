'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api'; // API servisini import et

export default function EditStore() {
  return (
    <AuthGuard requiredRole="admin">
      <EditStoreContent />
    </AuthGuard>
  );
}

function EditStoreContent() {
  const router = useRouter();
  const params = useParams();
  // storeId string olarak kalmalı, Supabase UUID kullanıyor
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
    approved: true,
    module_permissions: { // enable_ prefix'i olmadan
      yemek: false,
      market: false,
      su: false,
      aktuel: false
    },
    working_hours: { // Çalışma saatleri için state eklendi
      monday: { open: '', close: '', is_open: false },
      tuesday: { open: '', close: '', is_open: false },
      wednesday: { open: '', close: '', is_open: false },
      thursday: { open: '', close: '', is_open: false },
      friday: { open: '', close: '', is_open: false },
      saturday: { open: '', close: '', is_open: false },
      sunday: { open: '', close: '', is_open: false },
    },
    delivery_settings: { // Teslimat ayarları için state eklendi
      min_order_amount: 0,
      delivery_fee: 0,
      free_delivery_threshold: 0,
      delivery_time_estimation: '', // Örneğin "30-45 dk"
    },
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
    if (storeId) {
      setLoading(true);
      
      const fetchData = async () => {
        try {
          const storeData = await api.getStoreById(storeId);
          const usersData = await api.getAllUsers(); // Tüm kullanıcıları al
          const categoriesData = await api.getMainCategories();

          setAllUsers(usersData.filter(user => user.role === 'store' || user.role === 'admin')); // Sadece mağaza veya admin rollerini al
          setMainCategories(categoriesData);

          if (storeData) {
            setFormData({
              name: storeData.name || '',
              owner_id: storeData.owner_id || '',
              email: storeData.email || '',
              phone: storeData.phone || '',
              category_id: storeData.category_id || '',
              description: storeData.description || '',
              address: storeData.address || '',
              status: storeData.status || 'active',
              approved: storeData.approved !== undefined ? storeData.approved : true,
              module_permissions: { // enable_ prefix'lerini kaldırarak state'e ata
                yemek: storeData.module_permissions?.enable_yemek || false,
                market: storeData.module_permissions?.enable_market || false,
                su: storeData.module_permissions?.enable_su || false,
                aktuel: storeData.module_permissions?.enable_aktuel || false
              },
              working_hours: storeData.working_hours || { // Varsayılan çalışma saatleri
                monday: { open: '09:00', close: '18:00', is_open: true },
                tuesday: { open: '09:00', close: '18:00', is_open: true },
                wednesday: { open: '09:00', close: '18:00', is_open: true },
                thursday: { open: '09:00', close: '18:00', is_open: true },
                friday: { open: '09:00', close: '18:00', is_open: true },
                saturday: { open: '10:00', close: '17:00', is_open: false },
                sunday: { open: '', close: '', is_open: false },
              },
              delivery_settings: storeData.delivery_settings || {
                min_order_amount: 0,
                delivery_fee: 0,
                free_delivery_threshold: 0,
                delivery_time_estimation: '',
              },
              logo_url: storeData.logo_url || '',
              banner_url: storeData.banner_url || '',
              commission_rate: storeData.commission_rate || 0,
              payment_link: storeData.payment_link || '',
            });
            setNotFound(false);
          } else {
            setNotFound(true);
          }
        } catch (err) {
          console.error("Veri yüklenirken hata:", err);
          setError("Veriler yüklenirken bir sorun oluştu.");
          setNotFound(true);
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('module-')) {
      const moduleName = name.replace('module-', '');
      setFormData(prev => ({
        ...prev,
        module_permissions: {
          ...prev.module_permissions,
          [moduleName]: checked
        }
      }));
    } else if (name === 'approved' || name.endsWith('is_open')) { // working_hours için is_open kontrolü
      if (name.includes('.')) { // working_hours.monday.is_open
        const [parent, day, field] = name.split('.');
         setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [day]: {
              ...prev[parent][day],
              [field]: checked
            }
          }
        }));
      } else { // approved
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else if (name.includes('.')) { // working_hours veya delivery_settings için
        const [parent, dayOrField, field] = name.split('.'); // ör: working_hours.monday.open veya delivery_settings.min_order_amount
        if (field) { // working_hours.monday.open
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [dayOrField]: {
                        ...prev[parent][dayOrField],
                        [field]: value
                    }
                }
            }));
        } else { // delivery_settings.min_order_amount
             setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [dayOrField]: type === 'number' ? parseFloat(value) : value
                }
            }));
        }
    }
    else {
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
      
      // Supabase'e gönderilecek module_permissions objesini hazırla
      const modulePermissionsForSupabase = {};
      for (const key in formData.module_permissions) {
        modulePermissionsForSupabase[`enable_${key}`] = formData.module_permissions[key];
      }

      const updateData = {
        ...formData,
        module_permissions: modulePermissionsForSupabase,
        // category_id zaten formData içinde doğru isimle bulunuyor.
        // owner_id de formData içinde doğru isimle bulunuyor.
      };
      // ownerName'i siliyoruz çünkü Supabase'de böyle bir alan yok
      delete updateData.ownerName; 


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
                id="approved"
                name="approved"
                checked={formData.approved}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
              />
              <label htmlFor="approved" className="text-sm font-medium text-gray-700">
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

          <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-700">Modül İzinleri</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.keys(formData.module_permissions).map(moduleName => (
              <div key={moduleName} className="flex items-center">
                <input
                  type="checkbox"
                  id={`module-${moduleName}`}
                  name={`module-${moduleName}`}
                  checked={formData.module_permissions[moduleName]}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                />
                <label htmlFor={`module-${moduleName}`} className="text-sm font-medium text-gray-700 capitalize">
                  {moduleName}
                </label>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-700">Çalışma Saatleri</h2>
          <div className="space-y-4 mb-6">
            {Object.keys(formData.working_hours).map(day => (
              <div key={day} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-3 border rounded-md">
                <label className="font-medium capitalize md:col-span-1">{day.charAt(0).toUpperCase() + day.slice(1)}</label>
                <div className="flex items-center md:col-span-1">
                  <input 
                    type="checkbox" 
                    id={`working_hours.${day}.is_open`}
                    name={`working_hours.${day}.is_open`}
                    checked={formData.working_hours[day]?.is_open || false} 
                    onChange={handleChange} 
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                  />
                  <label htmlFor={`working_hours.${day}.is_open`} className="text-sm">Açık</label>
                </div>
                <div className="md:col-span-1">
                  <label htmlFor={`working_hours.${day}.open`} className="block text-xs text-gray-600">Açılış</label>
                  <input 
                    type="time" 
                    id={`working_hours.${day}.open`}
                    name={`working_hours.${day}.open`}
                    value={formData.working_hours[day]?.open || ''} 
                    onChange={handleChange} 
                    disabled={!formData.working_hours[day]?.is_open}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                  />
                </div>
                <div className="md:col-span-1">
                  <label htmlFor={`working_hours.${day}.close`} className="block text-xs text-gray-600">Kapanış</label>
                  <input 
                    type="time" 
                    id={`working_hours.${day}.close`}
                    name={`working_hours.${day}.close`}
                    value={formData.working_hours[day]?.close || ''} 
                    onChange={handleChange} 
                    disabled={!formData.working_hours[day]?.is_open}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                  />
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-700">Teslimat Ayarları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="delivery_settings.min_order_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Sipariş Tutarı (TL)
              </label>
              <input
                type="number"
                id="delivery_settings.min_order_amount"
                name="delivery_settings.min_order_amount"
                value={formData.delivery_settings.min_order_amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
             <div>
              <label htmlFor="delivery_settings.delivery_fee" className="block text-sm font-medium text-gray-700 mb-1">
                Teslimat Ücreti (TL)
              </label>
              <input
                type="number"
                id="delivery_settings.delivery_fee"
                name="delivery_settings.delivery_fee"
                value={formData.delivery_settings.delivery_fee}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="delivery_settings.free_delivery_threshold" className="block text-sm font-medium text-gray-700 mb-1">
                Ücretsiz Teslimat Eşiği (TL)
              </label>
              <input
                type="number"
                id="delivery_settings.free_delivery_threshold"
                name="delivery_settings.free_delivery_threshold"
                value={formData.delivery_settings.free_delivery_threshold}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="delivery_settings.delivery_time_estimation" className="block text-sm font-medium text-gray-700 mb-1">
                Tahmini Teslimat Süresi
              </label>
              <input
                type="text"
                id="delivery_settings.delivery_time_estimation"
                name="delivery_settings.delivery_time_estimation"
                value={formData.delivery_settings.delivery_time_estimation}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örn: 30-45 dk"
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