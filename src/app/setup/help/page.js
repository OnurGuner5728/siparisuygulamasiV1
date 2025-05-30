'use client';

import Link from 'next/link';
import { useState } from 'react';
import supabase from '@/lib/supabase';

export default function SetupHelpPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  
  // Şema dosyasını okuyup içeriğini alıyoruz
  const schemaContent = `-- Tablolarımızı oluşturmadan önce UUID eklentisini etkinleştirelim
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Kullanıcılar Tablosu
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS Politikaları (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar için RLS politikaları
CREATE POLICY "Kullanıcılar kendilerini görebilir" ON public.users
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Kullanıcılar kendilerini güncelleyebilir" ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admin tüm kullanıcıları görebilir" ON public.users
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );`;
    
  // Şemayı kontrol et - temel users tablosunu arıyoruz
  const checkSchema = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (error) {
        setStatus('error');
        console.error('Tablo kontrolü hatası:', error);
      } else {
        setStatus('success');
      }
    } catch (error) {
      setStatus('error');
      console.error('Tablo kontrolü hatası:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Veritabanı Şema Kurulumu</h1>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">
          Sistem kurulumunu tamamlamak için önce veritabanı şemasını oluşturmanız gerekmektedir.
          Aşağıdaki adımları takip edin.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">1. Supabase SQL Editörü'nü Açın</h2>
          <p className="mb-4">
            Supabase Dashboard'da <strong>SQL Editör</strong> menüsüne tıklayın ve yeni bir sorgu oluşturun.
          </p>
          <a 
            href="https://app.supabase.com/project/_/sql" 
            target="_blank"
            rel="noopener noreferrer" 
            className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded transition-colors"
          >
            Supabase SQL Editörüne Git
          </a>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">2. Şema SQL Kodunu Kopyalayın</h2>
          <p className="mb-4">
            Aşağıdaki SQL kodunu kopyalayın. Bu kod veritabanınızda gerekli tabloları oluşturacaktır.
            Bu örnekte yalnızca <strong>users</strong> tablosu gösterilmektedir. Tüm şema için <code>src/lib/schema.sql</code> dosyasını kullanın.
          </p>
          
          <div className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-auto max-h-96">
            <pre className="whitespace-pre-wrap">{schemaContent}</pre>
          </div>
          
          <button
            onClick={() => {
              navigator.clipboard.writeText(schemaContent);
              alert('SQL kodu panoya kopyalandı!');
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
          >
            Kodu Kopyala
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">3. SQL Kodunu Çalıştırın</h2>
          <p className="mb-4">
            Kopyaladığınız SQL kodunu Supabase SQL Editörü'ne yapıştırın ve çalıştırın.
            Bu işlem veritabanınızda gerekli tabloları oluşturacaktır.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">4. Şema Kurulumunu Kontrol Edin</h2>
          <p className="mb-4">
            Şema başarıyla kurulduysa, aşağıdaki buton ile kontrol edebilirsiniz.
          </p>
          
          <button
            onClick={checkSchema}
            disabled={loading}
            className={`bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Kontrol Ediliyor...' : 'Şema Kurulumunu Kontrol Et'}
          </button>
          
          {status === 'success' && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
              <p>Tebrikler! Şema başarıyla kuruldu. Artık admin kullanıcısı oluşturabilirsiniz.</p>
              <Link href="/setup" className="inline-block mt-2 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm">
                Admin Oluşturma Sayfasına Git
              </Link>
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              <p>Şema kurulumu henüz tamamlanmamış görünüyor. Lütfen yukarıdaki adımları takip edin.</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">5. Admin Kullanıcısı Oluşturun</h2>
          <p className="mb-4">
            Şema kurulumu tamamlandıktan sonra, admin kullanıcısı oluşturmak için kurulum sayfasına gidin.
          </p>
          
          <Link href="/setup" className="inline-block bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition-colors">
            Admin Oluşturma Sayfasına Git
          </Link>
        </div>
      </div>
    </div>
  );
} 
