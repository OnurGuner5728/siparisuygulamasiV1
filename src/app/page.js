import React from 'react';
import Link from 'next/link';

export default function Home() {
  // Ana kategoriler
  const categories = [
    { id: 1, name: 'Yemek', icon: '🍔', path: '/yemek' },
    { id: 2, name: 'Market', icon: '🛒', path: '/market' },
    { id: 3, name: 'Su', icon: '💧', path: '/su' },
    { id: 4, name: 'Aktüel', icon: '🔥', path: '/aktuel' },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Sipariş Uygulaması</h1>
        <p className="text-xl text-gray-600">İhtiyacınız olan her şey için</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {categories.map((category) => (
          <Link 
            key={category.id}
            href={category.path}
            className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <div className="text-5xl mb-4">{category.icon}</div>
            <h2 className="text-2xl font-semibold">{category.name}</h2>
          </Link>
        ))}
      </div>
      
      <div className="mt-12">
        <div className="flex space-x-4">
          <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Giriş Yap
          </Link>
          <Link href="/register" className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
            Kayıt Ol
          </Link>
        </div>
      </div>
    </main>
  );
}
