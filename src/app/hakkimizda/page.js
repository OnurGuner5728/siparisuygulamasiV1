'use client';

import { FiTarget, FiEye, FiHeart, FiUsers, FiTruck, FiSmartphone } from 'react-icons/fi';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              easysiparis Hakkında
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 mb-8">
              Türkiye'nin en yenilikçi sipariş ve teslimat platformu
            </p>
            <p className="text-lg text-orange-100 max-w-3xl mx-auto">
              2025 yılında kurulan easysiparis, yemekten markete, sudan aktüel ürünlere kadar 
              tüm ihtiyaçlarınızı kapınıza kadar getiren modern bir platform olarak hizmet veriyor.
            </p>
          </div>
        </div>
      </div>

      {/* Mission, Vision, Values */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiTarget className="text-3xl text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Misyonumuz</h3>
              <p className="text-gray-600">
                İnsanların günlük ihtiyaçlarını en hızlı, güvenilir ve kaliteli şekilde 
                karşılamak. Teknoloji ile hayatı kolaylaştırmak.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiEye className="text-3xl text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Vizyonumuz</h3>
              <p className="text-gray-600">
                Türkiye'nin en büyük ve güvenilir sipariş platformu olmak. 
                Her şehirde, her mahallede ulaşılabilir olmak.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiHeart className="text-3xl text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Değerlerimiz</h3>
              <p className="text-gray-600">
                Müşteri memnuniyeti, kalite, güvenilirlik, yenilikçilik ve 
                sürdürülebilirlik temel değerlerimizdir.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hizmetlerimiz
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Geniş hizmet yelpazemizle tüm ihtiyaçlarınızı karşılıyoruz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Yemek Siparişi</h3>
              <p className="text-gray-600 text-sm">
                Binlerce restoran ve kafeden favori yemeklerinizi sipariş edin
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiTruck className="text-green-500 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Market Alışverişi</h3>
              <p className="text-gray-600 text-sm">
                Günlük ihtiyaçlarınızı kapınıza kadar getiriyoruz
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Su Teslimatı</h3>
              <p className="text-gray-600 text-sm">
                Temiz içme suyu ve damacana servisi
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aktüel Ürünler</h3>
              <p className="text-gray-600 text-sm">
                Kampanyalı ürünler ve özel fırsatlar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Neden easysiparis?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Müşterilerimizin bizi tercih etme nedenleri
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiTruck className="text-orange-500 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hızlı Teslimat</h3>
              <p className="text-gray-600 text-sm">
                Ortalama 30 dakikada kapınızda
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiUsers className="text-green-500 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">7/24 Destek</h3>
              <p className="text-gray-600 text-sm">
                Her zaman yanınızdayız
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiSmartphone className="text-blue-500 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Kolay Kullanım</h3>
              <p className="text-gray-600 text-sm">
                Basit ve kullanıcı dostu arayüz
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ekibimiz
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Deneyimli ve tutkulu ekibimizle size en iyi hizmeti sunuyoruz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                **
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">**** ******</h3>
              <p className="text-orange-500 font-medium mb-2">Kurucu & CEO</p>
              <p className="text-gray-600 text-sm">
                Yıllık teknoloji deneyimi ile easysiparis'i hayata geçiren vizyoner lider
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                **
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">**** ******</h3>
              <p className="text-orange-500 font-medium mb-2">CTO</p>
              <p className="text-gray-600 text-sm">
                Güçlü teknik altyapı ve yenilikçi çözümlerden sorumlu teknoloji lideri
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                **
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">**** ******</h3>
              <p className="text-orange-500 font-medium mb-2">Operasyon Müdürü</p>
              <p className="text-gray-600 text-sm">
                Sorunsuz teslimat ve müşteri deneyiminden sorumlu operasyon uzmanı
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Bizimle İletişime Geçin
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Sorularınız, önerileriniz veya iş birliği teklifleriniz için bize ulaşın
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/iletisim" 
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200"
              >
                İletişim Formu
              </a>
              <div className="border border-orange-500 text-orange-500 px-8 py-3 rounded-lg font-semibold">
                0*** *** ** **
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
