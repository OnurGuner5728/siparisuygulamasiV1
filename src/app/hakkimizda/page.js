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
      <div className="py-16">
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
      <div className="bg-white py-16">
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
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 0a1 1 0 100 2h.01a1 1 0 100-2H9zm2 0a1 1 0 100 2h.01a1 1 0 100-2H11z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Market Alışverişi</h3>
              <p className="text-gray-600 text-sm">
                Günlük ihtiyaçlarınızı marketlerden hızlıca temin edin
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Su Teslimatı</h3>
              <p className="text-gray-600 text-sm">
                Temiz içme suyu ve damacana teslimatı hizmeti
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
                Kampanyalı ve indirimli ürünleri keşfedin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center text-white">
            <div>
              <FiUsers className="text-4xl mx-auto mb-4" />
              <div className="text-3xl font-bold mb-2">50K+</div>
              <div className="text-orange-100">Aktif Kullanıcı</div>
            </div>
            <div>
              <FiTruck className="text-4xl mx-auto mb-4" />
              <div className="text-3xl font-bold mb-2">100K+</div>
              <div className="text-orange-100">Teslim Edilen Sipariş</div>
            </div>
            <div>
              <FiSmartphone className="text-4xl mx-auto mb-4" />
              <div className="text-3xl font-bold mb-2">1000+</div>
              <div className="text-orange-100">Partner İş Yeri</div>
            </div>
            <div>
              <svg className="w-10 h-10 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div className="text-3xl font-bold mb-2">25+</div>
              <div className="text-orange-100">Hizmet Verdiğimiz Şehir</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
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
                AY
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ahmet Yılmaz</h3>
              <p className="text-orange-500 font-medium mb-2">Kurucu & CEO</p>
              <p className="text-gray-600 text-sm">
                15 yıllık teknoloji deneyimi ile easysiparis'i hayata geçiren vizyoner lider
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                SD
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Seda Demir</h3>
              <p className="text-orange-500 font-medium mb-2">CTO</p>
              <p className="text-gray-600 text-sm">
                Güçlü teknik altyapı ve yenilikçi çözümlerden sorumlu teknoloji lideri
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                MK
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mehmet Kaya</h3>
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
              <a 
                href="tel:+902121234567" 
                className="border border-orange-500 text-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition-all duration-200"
              >
                (0212) 123 45 67
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
