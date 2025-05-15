# SiparişApp Tasarım Planı

Bu dosya, uygulamanın tasarım durumunu takip etmek için oluşturulmuştur. Tasarım klasöründeki PNG dosyaları referans alınarak her bir sayfa ve bileşenin tasarım durumu güncellenecektir.

## Genel Tasarım İyileştirmeleri

- [x] Font ailesini özelleştirme (Google Fonts entegrasyonu ile daha modern fontlar ekleme)
- [x] Tema renkleri için CSS değişkenleri oluşturma
- [x] Animasyonlar ve geçiş efektleri
- [x] Karanlık/Aydınlık mod desteği
- [x] Responsive tasarım iyileştirmeleri
- [ ] Erişilebilirlik iyileştirmeleri

## Sayfalar

### Temel Sayfalar
- [x] Giriş Sayfası (Login sayfası) - `/src/app/login/page.js`
- [x] Kayıt Sayfası (Register sayfası) - `/src/app/register/page.js`
- [x] Ana Sayfa (Home sayfası) - `/src/app/page.js`
- [ ] Şifremi Unuttum Sayfası - `/src/app/forgot-password/page.js` (oluşturulması gerekiyor)
- [ ] Şifre Sıfırlama Sayfası - `/src/app/reset-password/page.js` (oluşturulması gerekiyor)

### Onboarding
- [ ] Onboarding Sayfası 01 - `/src/app/onboarding/page.js` (oluşturulması gerekiyor)
- [ ] Onboarding Sayfası 02 - Onboarding içine adım olarak eklenecek
- [ ] Onboarding Sayfası 03 - Onboarding içine adım olarak eklenecek
- [ ] Onboarding Sayfası 04 - Onboarding içine adım olarak eklenecek
- [ ] Splash Page 01 - `/src/app/splash/page.js` (oluşturulması gerekiyor)
- [ ] Splash Page 02 - Alternatif splash tasarımı

### Kullanıcı Profili ve Hesap
- [ ] Profil Sayfası - `/src/app/profil/page.js`
- [ ] Profil Düzenleme Sayfası - `/src/app/profil/edit/page.js`
- [ ] Adreslerim Sayfası - `/src/app/profil/adresler/page.js`
- [ ] Yeni Adres Ekleme Sayfası - `/src/app/profil/adresler/yeni/page.js`
- [ ] Ödeme Yöntemleri Sayfası - `/src/app/profil/payment-methods/page.js`
- [ ] Kart Ekleme Sayfası - `/src/app/profil/payment-methods/add-card/page.js`

### Sipariş ve Alışveriş
- [ ] Sepet Sayfası - `/src/app/sepet/page.js`
- [ ] Sepet Düzenleme Sayfası - `/src/app/sepet/edit/page.js`
- [ ] Ödeme Başarılı Sayfası - `/src/app/checkout/success/page.js`
- [ ] Ödeme Çekme Başarılı Sayfası - `/src/app/store/withdraw/success/page.js`
- [ ] Değerlendirme Ekranı - `/src/app/review/page.js`
- [ ] Siparişlerim Sayfası 01 - `/src/app/profil/siparisler/page.js`
- [ ] Siparişlerim Sayfası 02 - İkinci bir tasarım alternatifi
- [ ] Sipariş Takip Sayfası 01 - `/src/app/profil/siparisler/[id]/tracking/page.js`
- [ ] Sipariş Takip Sayfası 02 - İkinci bir tasarım alternatifi

### Arama ve Filtreleme
- [ ] Arama Sayfası - `/src/app/search/page.js`
- [ ] Filtreleme Sayfası - `/src/app/search/filter/page.js`

### Restoran ve Ürün
- [ ] Restoran Görünümü 01 - `/src/app/yemek/store/[id]/page.js`
- [ ] Restoran Görünümü 02 - İkinci bir tasarım alternatifi
- [ ] Yemek Detay Sayfası 01 - `/src/app/yemek/[storeId]/[productId]/page.js`
- [ ] Yemek Detay Sayfası 02 - İkinci bir tasarım alternatifi
- [ ] Yemek Kategorisi (Food - Burgers) - `/src/app/yemek/kategori/[categoryId]/page.js`
- [ ] Şef Yemek Detayları - `/src/app/store/products/[id]/page.js`

### Satıcı (Mağaza)
- [ ] Satıcı Ana Sayfası - `/src/app/store/page.js`
- [ ] Devam Eden Siparişler - `/src/app/store/orders/page.js`
- [ ] Yeni Ürün Ekleme - `/src/app/store/products/new/page.js`

### İletişim ve Bildirimler
- [ ] Bildirimler Sayfası - `/src/app/notifications/page.js`
- [ ] Mesajlar Sayfası - `/src/app/messages/page.js`
- [ ] Kurye Mesaj Ekranı - `/src/app/delivery/[id]/message/page.js`
- [ ] Kurye Arama Ekranı - `/src/app/delivery/[id]/call/page.js`

### Diğer Sayfalar
- [ ] Konum Erişim İzni Sayfası - `/src/app/location-access/page.js`
- [ ] Doğrulama Sayfası - `/src/app/verification/page.js`
- [ ] Teklif/Fırsat Sayfası - `/src/app/offers/page.js`
- [ ] Menü Sayfası (Alternatif 1) - `/src/app/menu/page.js`
- [ ] Menü Sayfası (Alternatif 2) - İkinci bir tasarım alternatifi

## Komponentler

### Temel Bileşenler
- [x] Header - `/src/components/HeaderWrapper.js`
- [x] Footer - `/src/components/Footer.js`
- [x] Kampanya Banner - `/src/components/CampaignBanner.js`
- [ ] Sepet Sidebar - `/src/components/CartSidebar.js`

### Form Bileşenleri
- [x] Input - `/src/components/ui/Input.js`
- [x] Button - `/src/components/ui/Button.js`
- [x] Checkbox - `/src/components/ui/Checkbox.js`
- [ ] Select - `/src/components/ui/Select.js` (oluşturulması gerekiyor)
- [x] Radio Button - `/src/components/ui/RadioButton.js`
- [ ] Textarea - `/src/components/ui/Textarea.js` (oluşturulması gerekiyor)

### Kart Bileşenleri
- [x] Kategori Kartı - `/src/components/cards/CategoryCard.js`
- [x] Restoran Kartı - `/src/components/cards/RestaurantCard.js`
- [x] Ürün Kartı - `/src/components/cards/ProductCard.js`
- [ ] Sipariş Kartı - `/src/components/cards/OrderCard.js` (oluşturulması gerekiyor)

### Modal ve Popup Bileşenleri
- [ ] Modal Temel Bileşeni - `/src/components/ui/Modal.js` (oluşturulması gerekiyor)
- [ ] Uyarı Modalı - `/src/components/modals/AlertModal.js` (oluşturulması gerekiyor)
- [ ] Filtreleme Modalı - `/src/components/modals/FilterModal.js` (oluşturulması gerekiyor)

### Diğer Bileşenler
- [x] Yıldız Değerlendirme - `/src/components/ui/Rating.js`
- [ ] Sayfa Numaralandırma - `/src/components/ui/Pagination.js` (oluşturulması gerekiyor)
- [ ] Dosya Yükleyici - `/src/components/FileUploader.js`

## Tasarım İçin Notlar ve Fikirler

### Font Seçimleri
- Başlıklar için: Poppins veya Montserrat gibi temiz, modern fontlar düşünülebilir
- İçerik için: Inter veya Nunito Sans gibi okunabilirliği yüksek fontlar kullanılabilir
- Logo ve vurgu için: Codec Pro veya Gilroy gibi karakteristik fontlar tercih edilebilir

### Özgün UI İyileştirmeleri
- Scroll animasyonları (AOS.js kütüphanesi ile entegre edilebilir)
- Mikro-etkileşimler (buton hover efektleri, tıklama animasyonları)
- Gradient renk geçişleri (mevcut turuncu-kırmızı gradient'in diğer elementlere de uygulanması)
- Özel hamburger menü animasyonu (açılırken çizgilerin X'e dönüşmesi)
- Loading state animasyonları (skeleton loader veya özel spinner)
- Kart hover efektleri (3D tilt efekti, shadow artışı)

### Responsive Tasarım Stratejisi
- Mobile-first yaklaşım (öncelikle mobil tasarımın tamamlanması)
- Breakpoint bazlı komponent varyasyonları
- Farklı ekran boyutları için özelleştirilmiş görünümler

### Erişilebilirlik İyileştirmeleri
- ARIA etiketleri
- Klavye navigasyonu desteği
- Yüksek kontrast modu desteği
- Screen reader uyumluluğu

## İlerleme Durumu
- Başlangıç: 28.10.2023
- Öncelikli komponentler: Header, Footer, Ana Sayfa (tamamlandı)
- Temel UI bileşenleri oluşturuldu: Button, Input, Rating, Checkbox, RadioButton (tamamlandı)
- Kart bileşenleri oluşturuldu: CategoryCard, RestaurantCard, ProductCard (tamamlandı)
- Sıradaki görev: Sayfaların oluşturulması ve tasarımın uygulanması 