'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">SiparişApp</h3>
            <p className="text-gray-600">Tüm ihtiyaçlarınız için tek adres.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Kategoriler</h3>
            <ul className="space-y-2">
              <li><Link href="/yemek" className="text-gray-600 hover:text-blue-600">Yemek</Link></li>
              <li><Link href="/market" className="text-gray-600 hover:text-blue-600">Market</Link></li>
              <li><Link href="/su" className="text-gray-600 hover:text-blue-600">Su</Link></li>
              <li><Link href="/aktuel" className="text-gray-600 hover:text-blue-600">Aktüel</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">İletişim</h3>
            <ul className="space-y-2">
              <li><Link href="/hakkimizda" className="text-gray-600 hover:text-blue-600">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="text-gray-600 hover:text-blue-600">İletişim</Link></li>
              <li><Link href="/yardim" className="text-gray-600 hover:text-blue-600">Yardım</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; 2025 SiparişApp. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
} 