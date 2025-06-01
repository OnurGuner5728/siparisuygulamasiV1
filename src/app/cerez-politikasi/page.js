'use client';

import { useState } from 'react';

export default function CookiePolicyPage() {
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    functional: true,
    analytics: false,
    marketing: false
  });

  const handlePreferenceChange = (category) => {
    if (category === 'necessary') return; // Cannot disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleSavePreferences = () => {
    // Save preferences to localStorage
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    
    // Show success message
    alert('Çerez tercihleriniz kaydedildi!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Çerez Politikası
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 mb-4">
              Web Sitemizde Çerez Kullanımı
            </p>
            <p className="text-lg text-orange-100">
              Son güncellenme: 20 Ocak 2025
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="prose prose-lg max-w-none">
                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Çerez Nedir?</h2>
                    <p className="text-gray-700 mb-4">
                      Çerezler, web sitelerinin bilgisayarınızda veya mobil cihazınızda sakladığı küçük metin dosyalarıdır. 
                      Bu dosyalar, web sitesinin işlevselliğini artırmak, kullanım analizi yapmak ve kişiselleştirilmiş 
                      deneyim sunmak için kullanılır.
                    </p>
                    <p className="text-gray-700 mb-4">
                      easysiparis olarak, kullanıcı deneyimini iyileştirmek ve hizmetlerimizi geliştirmek için 
                      çerezleri kullanıyoruz. Bu politika, hangi çerezleri kullandığımızı ve bunları nasıl 
                      kontrol edebileceğinizi açıklar.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Çerez Türleri</h2>
                    <div className="space-y-6">
                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center mb-3">
                          <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                          <h3 className="text-xl font-semibold text-gray-900">Zorunlu Çerezler</h3>
                          <span className="ml-auto bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                            Gerekli
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4">
                          Web sitesinin temel işlevselliği için mutlaka gerekli olan çerezlerdir. Bu çerezler olmadan 
                          site düzgün çalışamaz.
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                          <li>Güvenlik ve kimlik doğrulama</li>
                          <li>Sepet ve oturum yönetimi</li>
                          <li>Dil ve tercih ayarları</li>
                          <li>CSRF koruması</li>
                        </ul>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center mb-3">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <h3 className="text-xl font-semibold text-gray-900">İşlevsellik Çerezleri</h3>
                          <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                            Tercihe Bağlı
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4">
                          Gelişmiş özellikler ve kişiselleştirme sağlayan çerezlerdir. Bu çerezler olmadan 
                          bazı işlevler çalışmayabilir.
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                          <li>Favori restoranlar ve ürünler</li>
                          <li>Adres kaydetme</li>
                          <li>Görüntüleme tercihleri</li>
                          <li>Form verilerini hatırlama</li>
                        </ul>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center mb-3">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <h3 className="text-xl font-semibold text-gray-900">Performans Çerezleri</h3>
                          <span className="ml-auto bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                            Analitik
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4">
                          Web sitesinin performansını izlemek ve iyileştirmek için kullanılan çerezlerdir. 
                          Anonim veri toplar.
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                          <li>Sayfa görüntüleme istatistikleri</li>
                          <li>Site kullanım analizi</li>
                          <li>Hata raporlama</li>
                          <li>Performans metrikleri</li>
                        </ul>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center mb-3">
                          <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                          <h3 className="text-xl font-semibold text-gray-900">Pazarlama Çerezleri</h3>
                          <span className="ml-auto bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full">
                            Reklam
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4">
                          Kişiselleştirilmiş reklamlar ve pazarlama içerikleri göstermek için kullanılan çerezlerdir.
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                          <li>Hedefli reklamlar</li>
                          <li>Sosyal medya entegrasyonu</li>
                          <li>Yeniden pazarlama</li>
                          <li>Reklam etkinliği ölçümü</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Kullandığımız Çerezler</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Çerez Adı
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amaç
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Süre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Kategori
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">auth_token</td>
                            <td className="px-6 py-4 text-sm text-gray-700">Kullanıcı giriş durumu</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">7 gün</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Zorunlu</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">cart_session</td>
                            <td className="px-6 py-4 text-sm text-gray-700">Sepet bilgileri</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">24 saat</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Zorunlu</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">user_preferences</td>
                            <td className="px-6 py-4 text-sm text-gray-700">Kullanıcı tercihleri</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">1 yıl</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">İşlevsellik</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">_ga</td>
                            <td className="px-6 py-4 text-sm text-gray-700">Google Analytics</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">2 yıl</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Analitik</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">_fbp</td>
                            <td className="px-6 py-4 text-sm text-gray-700">Facebook Pixel</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">3 ay</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Pazarlama</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Çerez Süresi</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Oturum Çerezleri</h3>
                        <p className="text-gray-700">
                          Tarayıcıyı kapattığınızda otomatik olarak silinir. Geçici işlemler için kullanılır.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Kalıcı Çerezler</h3>
                        <p className="text-gray-700">
                          Belirli bir süre boyunca cihazınızda kalır. Tercihlerinizi hatırlamak için kullanılır.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Çerezleri Nasıl Kontrol Edebilirsiniz?</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Tarayıcı Ayarları</h3>
                        <p className="text-gray-700 mb-4">
                          Çoğu tarayıcı, çerezleri kabul etme, reddetme veya uyarı alma seçenekleri sunar:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                          <li><strong>Chrome:</strong> Ayarlar &gt; Gizlilik ve güvenlik &gt; Çerezler</li>
                          <li><strong>Firefox:</strong> Ayarlar &gt; Gizlilik ve güvenlik &gt; Çerezler</li>
                          <li><strong>Safari:</strong> Tercihler &gt; Gizlilik &gt; Çerezler</li>
                          <li><strong>Edge:</strong> Ayarlar &gt; Çerezler ve site izinleri</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Tercih Merkezi</h3>
                        <p className="text-gray-700">
                          Sağ taraftaki tercih merkezinden çerez kategorilerini açıp kapatabilirsiniz.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Üçüncü Taraf Çerezleri</h2>
                    <p className="text-gray-700 mb-4">
                      Web sitemizde aşağıdaki üçüncü taraf hizmetlerinin çerezleri kullanılabilir:
                    </p>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Google Analytics</h4>
                        <p className="text-gray-700 text-sm">
                          Web sitesi kullanım istatistiklerini toplama. 
                          <a href="https://policies.google.com/privacy" className="text-orange-500 hover:underline" target="_blank" rel="noopener noreferrer">
                            Gizlilik Politikası
                          </a>
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Facebook Pixel</h4>
                        <p className="text-gray-700 text-sm">
                          Reklam performansı ölçümü ve hedefli reklamlar. 
                          <a href="https://www.facebook.com/privacy/explanation" className="text-orange-500 hover:underline" target="_blank" rel="noopener noreferrer">
                            Gizlilik Politikası
                          </a>
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Intercom</h4>
                        <p className="text-gray-700 text-sm">
                          Müşteri destek sohbeti. 
                          <a href="https://www.intercom.com/privacy" className="text-orange-500 hover:underline" target="_blank" rel="noopener noreferrer">
                            Gizlilik Politikası
                          </a>
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">15. İletişim</h2>
                    <p className="text-gray-700 mb-4">
                      Çerez politikası hakkında sorularınız için:
                    </p>
                    <div className="bg-gray-100 p-6 rounded-lg">
                      <p className="text-gray-700 mb-2"><strong>KVKK Sorumlusu:</strong> **** ******</p>
                      <p className="text-gray-700 mb-2"><strong>E-posta:</strong> ****@*****.com</p>
                      <p className="text-gray-700 mb-2"><strong>Telefon:</strong> 0*** *** ** **</p>
                      <p className="text-gray-700">
                        <strong>Adres:</strong> ***** Mahallesi, ***** Caddesi No: ***/*, *****, *****
                      </p>
                    </div>
                  </section>

                  <div className="border-t border-gray-200 pt-8 mt-12">
                    <p className="text-gray-600 text-center">
                      Bu çerez politikası 20 Ocak 2025 tarihinde güncellenmiştir ve bu tarihten itibaren yürürlüktedir.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cookie Preferences Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Çerez Tercihleri</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Zorunlu Çerezler</h4>
                      <p className="text-sm text-gray-600">Sitenin çalışması için gerekli</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.necessary}
                        disabled
                        className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 opacity-50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">İşlevsellik Çerezleri</h4>
                      <p className="text-sm text-gray-600">Gelişmiş özellikler</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.functional}
                        onChange={() => handlePreferenceChange('functional')}
                        className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Analitik Çerezler</h4>
                      <p className="text-sm text-gray-600">Kullanım istatistikleri</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={() => handlePreferenceChange('analytics')}
                        className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Pazarlama Çerezleri</h4>
                      <p className="text-sm text-gray-600">Kişiselleştirilmiş reklamlar</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={() => handlePreferenceChange('marketing')}
                        className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    onClick={handleSavePreferences}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                  >
                    Tercihleri Kaydet
                  </button>
                  <button
                    onClick={() => setPreferences({ necessary: true, functional: true, analytics: true, marketing: true })}
                    className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
                  >
                    Tümünü Kabul Et
                  </button>
                  <button
                    onClick={() => setPreferences({ necessary: true, functional: false, analytics: false, marketing: false })}
                    className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
                  >
                    Sadece Zorunlu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
