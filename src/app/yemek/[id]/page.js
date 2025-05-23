'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function YemekRedirectPage(props) {
  const params = use(props.params);
  const router = useRouter();
  const { id } = params;
  const [error, setError] = useState(false);

  useEffect(() => {
    const redirectToCorrectPage = async () => {
      try {
        // Mağaza sayfasına yönlendir
        router.replace(`/yemek/store/${id}`);
      } catch (err) {
        console.error('Yönlendirme hatası:', err);
        setError(true);
      }
    };
    
    if (id) {
      redirectToCorrectPage();
    }
  }, [id, router]);

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen flex-col">
        <div className="text-red-500 text-xl mb-4">😕</div>
        <p className="text-gray-700 font-medium">Yönlendirme sırasında bir hata oluştu.</p>
        <button 
          onClick={() => router.push('/yemek')}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Yemek Sayfasına Dön
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      <p className="ml-3 text-gray-600">Yönlendiriliyor...</p>
    </div>
  );
} 