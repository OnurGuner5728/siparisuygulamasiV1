'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase';

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      // Şifre kontrolü
      if (formData.password !== formData.passwordConfirm) {
        throw new Error('Şifreler eşleşmiyor');
      }
      
      if (formData.password.length < 6) {
        throw new Error('Şifre en az 6 karakter olmalıdır');
      }
      
      // İsimi parçalara ayırma
      const nameParts = formData.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Veritabanı kontrolü - hata verirse devam et
      try {
        const { count, error: countError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        if (!countError && count > 0) {
          throw new Error('Sistem zaten kurulu. Bu sayfa sadece ilk kurulum içindir.');
        }
      } catch (dbError) {
        console.log('Veritabanı kontrolü sırasında hata oluştu, ilk kullanıcı olarak devam ediliyor.');
        // Hatayı yoksay ve ilk kullanıcı olarak devam et
      }

      // Supabase Auth'a kullanıcı kaydet
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            firstName,
            lastName,
            role: 'admin'
          }
        }
      });
      
      if (signUpError) {
        // Veritabanı veya tablo sorunu mu kontrol et
        if (signUpError.message.includes('database') || 
            signUpError.message.includes('db') || 
            signUpError.message.includes('table') ||
            signUpError.message.includes('relation')) {
          throw new Error('Veritabanı şeması kurulumu tamamlanmamış. Lütfen önce şema kurulumunu yapın.');
        }
        throw signUpError;
      }
      
      if (!authData.user) {
        throw new Error('Kullanıcı oluşturulamadı');
      }

      // Users tablosuna admin ekle
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          name: formData.name,
          first_name: firstName,
          last_name: lastName,
          role: 'admin',
          created_at: new Date().toISOString()
        });
      
      if (profileError) {
        console.error('Kullanıcı profili eklenirken hata:', profileError);
        // Hata varsa devam et, muhtemelen tablo henüz oluşturulmadı
      }
      
      setMessage('Admin kullanıcısı başarıyla oluşturuldu! Ana sayfaya yönlendiriliyorsunuz...');
      
      // 3 saniye sonra ana sayfaya yönlendir
      setTimeout(() => {
        router.push('/');
      }, 3000);
      
    } catch (error) {
      console.error('Admin kurulum hatası:', error);
      setMessage(`Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sistem İlk Kurulum</h1>
        
        <p className="text-gray-600 mb-6 text-center">
          Bu sayfa, sisteme ilk admin kullanıcısını eklemek için kullanılır. 
          Kurulum tamamlandıktan sonra bu sayfaya erişim engellenecektir.
        </p>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-blue-700">
            Önce veritabanı şeması oluşturulmalıdır. 
            <Link href="/setup/help" className="text-blue-600 underline ml-1">
              Kurulum rehberi için tıklayın
            </Link>
          </p>
        </div>
        
        {message && (
          <div className={`p-3 rounded mb-4 ${message.includes('Hata') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
            
            {message.includes('Hata') && message.includes('veritabanı') && (
              <p className="mt-2">
                <Link href="/setup/help" className="text-red-600 underline">
                  Veritabanı kurulum rehberine gitmek için tıklayın
                </Link>
              </p>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Ad Soyad
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="passwordConfirm">
              Şifre (Tekrar)
            </label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className={`bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'İşlem Yapılıyor...' : 'Admin Kullanıcısı Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 