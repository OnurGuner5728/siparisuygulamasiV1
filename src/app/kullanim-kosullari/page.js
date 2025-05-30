'use client';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Kullanım Koşulları
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 mb-4">
              easysiparis Hizmet Kullanım Şartları
            </p>
            <p className="text-lg text-orange-100">
              Son güncellenme: 20 Ocak 2025
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Genel Hükümler</h2>
              <p className="text-gray-700 mb-4">
                Bu kullanım koşulları ("Koşullar"), easysiparis mobil uygulaması ve web sitesi ("Platform") 
                üzerinden sunulan hizmetlerin kullanımını düzenler. Platformu kullanarak bu koşulları 
                kabul etmiş sayılırsınız.
              </p>
              <p className="text-gray-700 mb-4">
                easysiparis, yemek siparişi, market alışverişi, su teslimatı ve aktüel ürün satışı 
                hizmetlerini sunan bir platformdur. Hizmetlerimiz, kullanıcılarımıza çeşitli 
                satıcılardan ürün sipariş etme imkanı sağlar.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Hesap Oluşturma ve Kullanım</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">2.1 Hesap Gereksinimleri</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Hizmetlerimizi kullanmak için 18 yaşında veya daha büyük olmalısınız</li>
                    <li>Doğru ve güncel bilgiler sağlamalısınız</li>
                    <li>Hesap güvenliğinizden siz sorumlusunuz</li>
                    <li>Hesabınızı başkalarıyla paylaşmamalısınız</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">2.2 Yasaklı Kullanım</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Platformu yasa dışı amaçlarla kullanmak</li>
                    <li>Sahte veya yanıltıcı bilgiler vermek</li>
                    <li>Başkalarının hesaplarına yetkisiz erişim sağlamaya çalışmak</li>
                    <li>Platformun güvenliğini tehlikeye atacak faaliyetlerde bulunmak</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Sipariş ve Ödeme</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">3.1 Sipariş Süreci</h3>
                  <p className="text-gray-700 mb-4">
                    Sipariş verdiğinizde, satıcı ile aranızda bir satış sözleşmesi oluşur. 
                    easysiparis, bu işlemde aracı konumundadır.
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Tüm siparişler onay sürecinden geçer</li>
                    <li>Fiyatlar ve ürün bilgileri değişebilir</li>
                    <li>Stok durumuna göre siparişiniz iptal edilebilir</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">3.2 Ödeme</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Kapıda nakit ödeme</li>
                    <li>Kapıda kredi kartı ile ödeme</li>
                    <li>Online kredi kartı ödemesi (yakında)</li>
                    <li>Tüm ödemeler güvenli olarak işlenir</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Teslimat</h2>
              <div className="space-y-4">
                <p className="text-gray-700 mb-4">
                  Teslimat süreleri tahminidir ve çeşitli faktörlere bağlı olarak değişebilir. 
                  Hava koşulları, trafik durumu ve sipariş yoğunluğu teslimat sürelerini etkileyebilir.
                </p>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">4.1 Teslimat Süreleri</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Yemek siparişleri: 20-40 dakika</li>
                    <li>Market alışverişi: 45-60 dakika</li>
                    <li>Su teslimatı: 2-3 saat</li>
                    <li>Aktüel ürünler: 1-2 gün</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">4.2 Teslimat Sorumlulukları</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Doğru adres bilgisi vermeniz gerekmektedir</li>
                    <li>Teslimat sırasında ulaşılabilir olmalısınız</li>
                    <li>Ürünleri teslim alırken kontrol etmeniz önerilir</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. İptal ve İade</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">5.1 Sipariş İptali</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Sipariş onaylanmadan önce ücretsiz iptal edilebilir</li>
                    <li>Hazırlık başladıktan sonra iptal için satıcı onayı gerekir</li>
                    <li>İptal edilen siparişler için ödeme iadesi yapılır</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">5.2 İade Koşulları</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Bozuk veya eksik ürünler için iade yapılır</li>
                    <li>Yanlış teslimat durumunda tam iade</li>
                    <li>İade talepleri 24 saat içinde bildirilmelidir</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Gizlilik</h2>
              <p className="text-gray-700 mb-4">
                Kişisel verilerinizin korunması bizim için önemlidir. Gizlilik politikamız, 
                verilerinizin nasıl toplandığı, kullanıldığı ve korunduğunu açıklar.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Kişisel verileriniz güvenli olarak saklanır</li>
                <li>Verileriniz üçüncü taraflarla paylaşılmaz</li>
                <li>Pazarlama iletişimi için onayınız alınır</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Fikri Mülkiyet</h2>
              <p className="text-gray-700 mb-4">
                Platform üzerindeki tüm içerik, tasarım, logo ve markalar easysiparis'in 
                fikri mülkiyetidir. İzinsiz kullanım yasaktır.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Platform içeriğini kopyalayamazsınız</li>
                <li>Ticari amaçla kullanım yapılamaz</li>
                <li>Tersine mühendislik yasaktır</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Sorumluluk Sınırları</h2>
              <div className="space-y-4">
                <p className="text-gray-700 mb-4">
                  easysiparis, platform üzerinde sunulan hizmetlerin kullanımından doğabilecek 
                  zararlardan sorumlu değildir.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Üçüncü taraf satıcıların ürün kalitesi</li>
                  <li>Teslimat gecikmelerinden doğan zararlar</li>
                  <li>Teknik arızalar ve kesintiler</li>
                  <li>Üçüncü taraf hizmetlerindeki sorunlar</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Hesap Feshi</h2>
              <p className="text-gray-700 mb-4">
                easysiparis, kullanım koşullarını ihlal eden hesapları önceden bildirimde bulunmaksızın 
                feshetme hakkını saklı tutar.
              </p>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fesih Sebepleri:</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Kullanım koşullarının ihlali</li>
                  <li>Sahte bilgi sağlama</li>
                  <li>Platformu kötüye kullanma</li>
                  <li>Yasal olmayan faaliyetler</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Değişiklikler</h2>
              <p className="text-gray-700 mb-4">
                easysiparis, bu kullanım koşullarını istediği zaman güncelleyebilir. 
                Önemli değişiklikler için kullanıcılar bilgilendirilir.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Güncellemeler platform üzerinde yayınlanır</li>
                <li>Önemli değişiklikler için e-posta bildirimi gönderilir</li>
                <li>Platform kullanımına devam etmek değişiklikleri kabul etmek anlamına gelir</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Uygulanacak Hukuk</h2>
              <p className="text-gray-700 mb-4">
                Bu kullanım koşulları Türkiye Cumhuriyeti kanunlarına tabidir. 
                Uyuşmazlıklar İstanbul mahkemelerinde çözülür.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. İletişim</h2>
              <p className="text-gray-700 mb-4">
                Bu kullanım koşulları hakkında sorularınız için bizimle iletişime geçebilirsiniz:
              </p>
              <div className="bg-gray-100 p-6 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>E-posta:</strong> hukuk@easysiparis.com</p>
                <p className="text-gray-700 mb-2"><strong>Telefon:</strong> +90 (212) 123 45 67</p>
                <p className="text-gray-700">
                  <strong>Adres:</strong> Atatürk Mahallesi, Cumhuriyet Caddesi No: 123/5, Bahçelievler, İstanbul
                </p>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-8 mt-12">
              <p className="text-gray-600 text-center">
                Bu kullanım koşulları 20 Ocak 2025 tarihinde güncellenmiştir ve bu tarihten itibaren yürürlüktedir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
