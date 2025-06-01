'use client';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Gizlilik Politikası
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 mb-4">
              Kişisel Verilerinizin Korunması
            </p>
            <p className="text-lg text-orange-100">
              Son güncellenme: 01 Haziran 2025
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Giriş</h2>
              <p className="text-gray-700 mb-4">
                easysiparis olarak, kişisel verilerinizin gizliliği ve güvenliği bizim için son derece önemlidir. 
                Bu gizlilik politikası, kişisel verilerinizin nasıl toplandığı, kullanıldığı, saklandığı ve 
                korunduğu hakkında bilgi vermektedir.
              </p>
              <p className="text-gray-700 mb-4">
                Bu politika, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuat 
                uyarınca hazırlanmıştır. Hizmetlerimizi kullanarak bu politikayı kabul etmiş sayılırsınız.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Veri Sorumlusu</h2>
              <div className="bg-gray-100 p-6 rounded-lg mb-4">
                <p className="text-gray-700 mb-2"><strong>Şirket Unvanı:</strong> easysiparis Teknoloji A.Ş.</p>
                <p className="text-gray-700 mb-2"><strong>Adres:</strong> Atatürk Mahallesi, Cumhuriyet Caddesi No: 123/5, Bahçelievler, İstanbul</p>
                <p className="text-gray-700 mb-2"><strong>E-posta:</strong> kvkk@easysiparis.com</p>
                <p className="text-gray-700"><strong>Telefon:</strong> +90 (212) 123 45 67</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Toplanan Kişisel Veriler</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">3.1 Kimlik Bilgileri</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Ad ve soyad</li>
                    <li>Doğum tarihi</li>
                    <li>Cinsiyet</li>
                    <li>Profil fotoğrafı</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">3.2 İletişim Bilgileri</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>E-posta adresi</li>
                    <li>Telefon numarası</li>
                    <li>Adres bilgileri</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">3.3 İşlem Bilgileri</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Sipariş geçmişi</li>
                    <li>Ödeme bilgileri</li>
                    <li>Teslimat tercihleri</li>
                    <li>Yorum ve değerlendirmeler</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">3.4 Teknik Bilgiler</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>IP adresi</li>
                    <li>Cihaz bilgileri</li>
                    <li>Tarayıcı bilgileri</li>
                    <li>Konum bilgileri (izin verildiğinde)</li>
                    <li>Uygulama kullanım istatistikleri</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Kişisel Verilerin Toplanma Yöntemleri</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Hesap oluşturma ve profil düzenleme</li>
                <li>Sipariş verme ve ödeme işlemleri</li>
                <li>Müşteri hizmetleri ile iletişim</li>
                <li>Anket ve araştırmalar</li>
                <li>Web sitesi ve mobil uygulama kullanımı</li>
                <li>Çerezler (cookies) ve benzeri teknolojiler</li>
                <li>Sosyal medya entegrasyonları</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Kişisel Verilerin İşlenme Amaçları</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">5.1 Temel Hizmet Sunumu</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Hesap oluşturma ve yönetimi</li>
                    <li>Sipariş alma ve işleme</li>
                    <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
                    <li>Teslimat hizmetinin sağlanması</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">5.2 İletişim ve Bilgilendirme</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Sipariş durumu bildirimleri</li>
                    <li>Müşteri hizmetleri desteği</li>
                    <li>Kampanya ve promosyon bildirimleri</li>
                    <li>Güvenlik bildirimleri</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">5.3 Geliştirme ve İyileştirme</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Hizmet kalitesinin artırılması</li>
                    <li>Kullanıcı deneyiminin iyileştirilmesi</li>
                    <li>Yeni ürün ve hizmet geliştirme</li>
                    <li>Analiz ve raporlama</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">5.4 Güvenlik ve Uyum</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Dolandırıcılık tespiti ve önleme</li>
                    <li>Hesap güvenliğini sağlama</li>
                    <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                    <li>Uyuşmazlıkların çözümü</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Kişisel Verilerin İşlenme Hukuki Sebepleri</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Sözleşmenin kurulması ve ifası:</strong> Sipariş ve teslimat hizmetleri</li>
                <li><strong>Yasal yükümlülük:</strong> Vergi, muhasebe ve ticari kayıtlar</li>
                <li><strong>Meşru menfaat:</strong> Güvenlik, dolandırıcılık önleme, analitik</li>
                <li><strong>Açık rıza:</strong> Pazarlama iletişimi, konum servisleri</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Kişisel Verilerin Paylaşılması</h2>
              <div className="space-y-4">
                <p className="text-gray-700 mb-4">
                  Kişisel verileriniz, aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:
                </p>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">7.1 Hizmet Sağlayıcıları</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Ödeme işleme firmaları</li>
                    <li>Teslimat ve lojistik şirketleri</li>
                    <li>Bulut hizmet sağlayıcıları</li>
                    <li>Teknik destek ve bakım hizmetleri</li>
                    <li>Analitik ve pazarlama hizmetleri</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">7.2 Yasal Yükümlülükler</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Mahkeme kararları</li>
                    <li>Savcılık soruşturmaları</li>
                    <li>Vergi dairesi talepleri</li>
                    <li>Diğer yasal mercii talepleri</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Kişisel Verilerin Saklanması</h2>
              <div className="space-y-4">
                <p className="text-gray-700 mb-4">
                  Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve yasal saklama 
                  süreleri dikkate alınarak saklanır:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li><strong>Hesap bilgileri:</strong> Hesap silinene kadar</li>
                  <li><strong>İşlem kayıtları:</strong> 10 yıl (Ticaret Kanunu gereği)</li>
                  <li><strong>Pazarlama iletişimi:</strong> Rıza geri alınana kadar</li>
                  <li><strong>Teknik loglar:</strong> 1 yıl</li>
                  <li><strong>Güvenlik kayıtları:</strong> 2 yıl</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Veri Güvenliği</h2>
              <p className="text-gray-700 mb-4">
                Kişisel verilerinizin güvenliği için teknik ve idari tedbirler alıyoruz:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Teknik Tedbirler</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>SSL/TLS şifreleme</li>
                    <li>Güvenli veri merkezleri</li>
                    <li>Düzenli güvenlik testleri</li>
                    <li>Güvenlik duvarları</li>
                    <li>Erişim logları</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">İdari Tedbirler</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Erişim yetkilendirmeleri</li>
                    <li>Personel gizlilik eğitimleri</li>
                    <li>Veri işleme politikaları</li>
                    <li>İnsident müdahale planları</li>
                    <li>Düzenli güvenlik denetimleri</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. KVKK Kapsamındaki Haklarınız</h2>
              <p className="text-gray-700 mb-4">
                6698 sayılı KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">📄 Bilgi Talep Etme</h3>
                    <p className="text-gray-700">Hangi verilerinizin işlendiğini öğrenme</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 Erişim Talep Etme</h3>
                    <p className="text-gray-700">İşlenen verilerinizin kopyasını alma</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">✏️ Düzeltme Talep Etme</h3>
                    <p className="text-gray-700">Hatalı verilerin düzeltilmesini isteme</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">🗑️ Silme Talep Etme</h3>
                    <p className="text-gray-700">Verilerinizin silinmesini isteme</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">⛔ İşlemeye İtiraz</h3>
                    <p className="text-gray-700">Veri işlenmesine karşı çıkma</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">📤 Veri Taşınabilirliği</h3>
                    <p className="text-gray-700">Verilerinizi başka platforma taşıma</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Çerezler (Cookies)</h2>
              <p className="text-gray-700 mb-4">
                Web sitemizde kullanıcı deneyimini iyileştirmek için çerezler kullanıyoruz:
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Çerez Türleri</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li><strong>Zorunlu çerezler:</strong> Temel işlevsellik için gerekli</li>
                    <li><strong>Performans çerezleri:</strong> Site kullanım analizi</li>
                    <li><strong>İşlevsellik çerezleri:</strong> Tercihlerinizi hatırlama</li>
                    <li><strong>Pazarlama çerezleri:</strong> Kişiselleştirilmiş reklamlar</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Başvuru Yolları</h2>
              <p className="text-gray-700 mb-4">
                KVKK haklarınızı kullanmak için aşağıdaki yollarla başvurabilirsiniz:
              </p>
              <div className="bg-gray-100 p-6 rounded-lg">
                <div className="space-y-3">
                  <p className="text-gray-700"><strong>E-posta:</strong> kvkk@easysiparis.com</p>
                  <p className="text-gray-700"><strong>Posta:</strong> easysiparis Teknoloji A.Ş. - KVKK Sorumlusu, Atatürk Mahallesi, Cumhuriyet Caddesi No: 123/5, Bahçelievler, İstanbul</p>
                  <p className="text-gray-700"><strong>Başvuru Formu:</strong> Web sitemizdeki KVKK başvuru formu</p>
                </div>
              </div>
              <p className="text-gray-700 mt-4">
                <strong>Not:</strong> Başvurularınız 30 gün içinde yanıtlanır. Kimlik doğrulama gerekebilir.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Politika Güncellemeleri</h2>
              <p className="text-gray-700 mb-4">
                Bu gizlilik politikası gerektiğinde güncellenebilir. Önemli değişikliklerde 
                e-posta yoluyla bilgilendirilirsiniz.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Güncellemeler web sitesinde yayınlanır</li>
                <li>Önemli değişikliklerde bildirim gönderilir</li>
                <li>Hizmet kullanımına devam etmek güncellemeleri kabul etmek anlamına gelir</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. İletişim</h2>
              <p className="text-gray-700 mb-4">
                Gizlilik politikası hakkında sorularınız için:
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
                Bu gizlilik politikası 01 Haziran 2025 tarihinde güncellenmiştir ve bu tarihten itibaren yürürlüktedir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
