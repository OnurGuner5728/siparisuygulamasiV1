'use client';

import { useState } from 'react';
import { FiSearch, FiChevronDown, FiChevronUp, FiPhone, FiMail, FiMessageCircle, FiUser, FiShoppingCart, FiTruck, FiCreditCard, FiSettings } from 'react-icons/fi';

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFAQ, setOpenFAQ] = useState(null);

  const categories = [
    { id: 'all', label: 'Tümü', icon: FiUser },
    { id: 'siparis', label: 'Sipariş Verme', icon: FiShoppingCart },
    { id: 'teslimat', label: 'Teslimat', icon: FiTruck },
    { id: 'odeme', label: 'Ödeme', icon: FiCreditCard },
    { id: 'hesap', label: 'Hesap İşlemleri', icon: FiUser },
    { id: 'teknik', label: 'Teknik Sorunlar', icon: FiSettings }
  ];

  const faqs = [
    {
      id: 1,
      category: 'siparis',
      question: 'Nasıl sipariş verebilirim?',
      answer: 'Sipariş vermek için öncelikle uygulamamıza giriş yapın. Ana sayfadan istediğiniz kategoriyi (Yemek, Market, Su, Aktüel) seçin. Mağazayı seçtikten sonra ürünleri sepetinize ekleyin ve checkout sayfasından siparişinizi tamamlayın.'
    },
    {
      id: 2,
      category: 'siparis',
      question: 'Siparişimi nasıl iptal edebilirim?',
      answer: 'Siparişinizi vermeden önce iptal edebilirsiniz. Sipariş verdikten sonra, eğer henüz hazırlanmaya başlanmamışsa Profilim > Siparişlerim sayfasından iptal edebilirsiniz. Hazırlık başladıysa müşteri hizmetlerini arayın.'
    },
    {
      id: 3,
      category: 'teslimat',
      question: 'Teslimat süresi ne kadar?',
      answer: 'Teslimat süreleri kategori ve konuma göre değişir. Yemek siparişleri genellikle 20-40 dakika, market alışverişi 45-60 dakika, su teslimatı 2-3 saat içinde gerçekleşir. Sipariş verirken tahmini teslimat süresi gösterilir.'
    },
    {
      id: 4,
      category: 'teslimat',
      question: 'Siparişimi nasıl takip edebilirim?',
      answer: 'Sipariş verdikten sonra Profilim > Siparişlerim sayfasından siparişinizi takip edebilirsiniz. Ayrıca push bildirim ve SMS ile sipariş durumu hakkında bilgilendirilirsiniz.'
    },
    {
      id: 5,
      category: 'odeme',
      question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
      answer: 'Şu anda kapıda nakit ödeme ve kapıda kredi kartı ile ödeme seçeneklerini kabul ediyoruz. Online kredi kartı ödemesi yakında eklenecek.'
    },
    {
      id: 6,
      category: 'odeme',
      question: 'Ödeme güvenli mi?',
      answer: 'Evet, tüm ödeme işlemleriniz SSL sertifikası ile şifrelenir. Kredi kartı bilgileriniz güvenli bir şekilde işlenir ve saklanmaz.'
    },
    {
      id: 7,
      category: 'hesap',
      question: 'Hesap nasıl oluşturabilirim?',
      answer: 'Uygulamanın sağ üst köşesindeki "Kayıt Ol" butonuna tıklayın. E-posta adresinizi ve telefon numaranızla hızlıca hesap oluşturabilirsiniz.'
    },
    {
      id: 8,
      category: 'hesap',
      question: 'Şifremi unuttum, ne yapmalıyım?',
      answer: 'Giriş sayfasında "Şifremi Unuttum" linkine tıklayın. E-posta adresinizi girin, size şifre sıfırlama linki gönderilecek.'
    },
    {
      id: 9,
      category: 'teknik',
      question: 'Uygulama açılmıyor/çöküyor, ne yapmalıyım?',
      answer: 'Önce uygulamayı kapatıp yeniden açmayı deneyin. Sorun devam ederse cihazınızı yeniden başlatın. Hala sorun yaşıyorsanız uygulama mağazasından güncelleme olup olmadığını kontrol edin.'
    },
    {
      id: 10,
      category: 'teknik',
      question: 'Bildirimler gelmiyor, nasıl düzeltebilirim?',
      answer: 'Cihazınızın ayarlarından easysiparis için bildirimlerin açık olduğundan emin olun. Android: Ayarlar > Uygulamalar > easysiparis > Bildirimler. iOS: Ayarlar > Bildirimler > easysiparis'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Yardım Merkezi
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 mb-8">
              Size nasıl yardımcı olabiliriz?
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Sorunuzu yazın veya anahtar kelime girin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-lg text-lg focus:ring-2 focus:ring-orange-300 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPhone className="text-orange-500 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Telefon Desteği</h3>
              <p className="text-gray-600 mb-4">7/24 müşteri hizmetleri</p>
              <a 
                href="tel:+902121234567"
                className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200"
              >
                (0212) 123 45 67
              </a>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMail className="text-blue-500 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">E-posta Desteği</h3>
              <p className="text-gray-600 mb-4">24 saat içinde yanıt</p>
              <a 
                href="mailto:destek@easysiparis.com"
                className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200"
              >
                E-posta Gönder
              </a>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMessageCircle className="text-green-500 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Canlı Destek</h3>
              <p className="text-gray-600 mb-4">Anında yardım alın</p>
              <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200">
                Sohbet Başlat
              </button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Sıkça Sorulan Sorular
              </h2>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        activeCategory === category.id
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <IconComponent className="mr-2" />
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FAQ List */}
            <div className="p-8">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiSearch className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Sonuç bulunamadı
                  </h3>
                  <p className="text-gray-600">
                    Aradığınız kriterlere uygun soru bulunamadı. Lütfen farklı anahtar kelimeler deneyin.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
                      >
                        <span className="font-semibold text-gray-900">{faq.question}</span>
                        {openFAQ === faq.id ? (
                          <FiChevronUp className="text-gray-500 flex-shrink-0 ml-2" />
                        ) : (
                          <FiChevronDown className="text-gray-500 flex-shrink-0 ml-2" />
                        )}
                      </button>
                      {openFAQ === faq.id && (
                        <div className="px-6 pb-4 text-gray-600 border-t border-gray-100">
                          <p className="pt-4">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                Sorunuz çözülmedi mi?
              </h3>
              <p className="text-orange-100 mb-6">
                Müşteri hizmetlerimiz size yardımcı olmak için burada. 
                Bizimle iletişime geçin, sorununuzu birlikte çözelim.
              </p>
              <a 
                href="/iletisim"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 px-6 py-3 rounded-lg font-semibold inline-block"
              >
                İletişime Geç
              </a>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Mobil Uygulamayı İndirin
              </h3>
              <p className="text-gray-600 mb-6">
                En iyi deneyim için mobil uygulamalarımızı kullanın. 
                Daha hızlı, daha kolay sipariş verme imkanı.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex items-center justify-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09-.17-.01-.33-.01-.49-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  App Store
                </button>
                <button className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  Google Play
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
