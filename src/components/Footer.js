'use client';
import Link from 'next/link';
import { useModule } from '@/contexts/ModuleContext';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function Footer() {
  const { isModuleEnabled } = useModule();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [categories, setCategories] = useState([]);

    // Kategorileri yükle  
  useEffect(() => {
    async function fetchCategories() {
      try {
        const categoriesData = await api.getCategories(true);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Footer kategorileri yüklenirken hata:', error);
      }
    }
    
    fetchCategories();
  }, []);

  const handleSocialClick = (platform) => {
    if (platform === 'instagram') {
      window.open('https://www.instagram.com/easysiparis?igsh=bDQ4NWdkdzdhMzhl', '_blank');
    } else if (platform === 'whatsapp') {
      window.open('https://whatsapp.com/channel/0029Vb5vRkj77qVV3MeZ9l1z', '_blank');
    } else {
      setShowComingSoon(true);
      setTimeout(() => setShowComingSoon(false), 2000);
    }
  };
   
  const getModuleNameFromCategory = (category) => {
    if (!category || !category.name) return null;
    
    const name = category.name.toLowerCase();
    if (name.includes('yemek')) return 'yemek';
    if (name.includes('market')) return 'market';
    if (name.includes('su')) return 'su';
    if (name.includes('aktüel')) return 'aktuel';
    return null;
  };

  return (
    <>
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Logo ve Açıklama */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center space-x-2 text-2xl font-bold mb-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  easysiparis
                </span>
              </Link>
              <p className="text-gray-300 mt-4 text-sm leading-relaxed">
                Yemekten markete, sudan aktüel ürünlere kadar tüm ihtiyaçlarınız için tek adres. 
                Hızlı, güvenli ve kaliteli hizmet.
              </p>
              
              {/* Sosyal Medya */}
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => handleSocialClick('facebook')}
                  className="bg-gray-700 hover:bg-orange-500 text-gray-300 hover:text-white p-3 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                  </svg>
                </button>
                <button
                  onClick={() => handleSocialClick('twitter')}
                  className="bg-gray-700 hover:bg-orange-500 text-gray-300 hover:text-white p-3 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </button>
                <button
                  onClick={() => handleSocialClick('instagram')}
                  className="bg-gray-700 hover:bg-orange-500 text-gray-300 hover:text-white p-3 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"></path>
                  </svg>
                </button>
                <button
                  onClick={() => handleSocialClick('whatsapp')}
                  className="bg-gray-700 hover:bg-green-500 text-gray-300 hover:text-white p-3 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* İletişim Bilgileri */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-white">İletişim</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-300">info@easysiparis.com</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-gray-400">Telefon desteği yakında</span>
                </li>
              </ul>
            </div>

            {/* Çalışma Saatleri */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Çalışma Saatleri</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-300 text-sm">Pazartesi - Cuma</p>
                    <p className="text-gray-400 text-xs">09:00 - 18:00</p>
                  </div>
                </li>
                <li className="flex items-center space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-300 text-sm">Cumartesi</p>
                    <p className="text-gray-400 text-xs">10:00 - 16:00</p>
                  </div>
                </li>
                <li className="flex items-center space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-400 text-sm">Pazar</p>
                    <p className="text-gray-500 text-xs">Kapalı</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Alt Bilgi */}
          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">&copy; 2025 easysiparis. Tüm hakları saklıdır.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link href="/gizlilik-politikasi" className="text-gray-400 hover:text-orange-400 text-sm transition-colors duration-200">
                Gizlilik Politikası
              </Link>
              <Link href="/cerez-politikasi" className="text-gray-400 hover:text-orange-400 text-sm transition-colors duration-200">
                Çerez Politikası
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Yakında Gelecek!</h3>
              <p className="text-gray-600 text-sm">Bu sosyal medya platformu yakında eklenecek. Takipte kalın!</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 