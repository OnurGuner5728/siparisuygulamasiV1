# Sipariş Uygulaması - Supabase Entegrasyonu

Bu doküman, Sipariş Uygulaması'nın Supabase ile entegrasyonunu ve veri göçü sürecini açıklamaktadır.

## Yapılan Değişiklikler

1. **Supabase Bağlantı Kurulumu**
   - `@supabase/supabase-js` kütüphanesi projeye eklendi
   - `src/lib/supabase.js` dosyası oluşturularak Supabase bağlantısı yapılandırıldı
   - Çevre değişkenleri için `src/env.example.js` dosyası oluşturuldu

2. **Veritabanı Şeması**
   - `src/lib/schema.sql` dosyası oluşturularak normalize edilmiş veritabanı tabloları tanımlandı
   - Kullanıcılar, adresler, mağazalar, ürünler, siparişler, sepet öğeleri, kampanyalar ve değerlendirmeler için tablolar oluşturuldu
   - Güvenlik politikaları (RLS) ve ilişkiler tanımlandı

3. **API İşlemleri**
   - `src/lib/supabaseApi.js` dosyası oluşturularak Supabase ile iletişim kuran API fonksiyonları tanımlandı
   - Kullanıcı yönetimi, profil, adres, mağaza, ürün, sipariş, kampanya ve değerlendirme işlemleri için yardımcı fonksiyonlar eklendi

4. **Context Entegrasyonları**
   - `AuthContext.js`: Supabase Auth kullanılarak kimlik doğrulama işlemleri güncellendi
   - `CartContext.js`: Sepet verilerinin Supabase'de saklanması için güncellendi
   - `FileContext.js`: Supabase Storage kullanımı için entegre edildi

5. **Veri Göçü İşlemleri**
   - `src/lib/dataMigration.js` dosyası oluşturularak mock verilerden Supabase'e veri göçü sağlandı
   - `src/app/admin/data-migration/page.js` sayfası oluşturularak yöneticilere web arayüzünden veri göçü imkanı sunuldu

6. **Admin Kurulum Sayfası**
   - `src/app/setup/page.js` sayfası oluşturularak sistem için ilk admin kullanıcısını eklemek üzere özel bir form sunuldu
   - Bu sayfa, sistemde hiç kullanıcı olmadığında ilk admin kullanıcısını oluşturmak için kullanılır

7. **Kurulum Rehberi**
   - `src/lib/SUPABASE_SETUP.md` dosyası oluşturularak Supabase projesinin kurulumu için adım adım rehber hazırlandı

## Nasıl Kullanılır

### 1. Supabase Kurulumu

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. `src/lib/SUPABASE_SETUP.md` dosyasındaki adımları takip edin
4. Supabase projenizden URL ve Anonim anahtarınızı alın

### 2. Çevre Değişkenleri

Projenin kök dizininde `.env.local` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Sipariş Uygulaması
```

### 3. Veritabanı Şeması Oluşturma

1. Supabase Dashboard'da SQL Editörü'nü açın
2. `src/lib/schema.sql` dosyasını kopyalayıp yapıştırın ve çalıştırın

### 4. Admin Kullanıcısı Oluşturma

1. Uygulamayı başlatın: `npm run dev`
2. Tarayıcıda `http://localhost:3000/setup` adresine gidin
3. Formu doldurarak ilk admin kullanıcısını oluşturun
4. Admin hesabınız oluşturulduğunda otomatik olarak giriş sayfasına yönlendirileceksiniz

### 5. Veri Göçü

1. Admin kullanıcısı ile giriş yapın
2. Tarayıcıda `http://localhost:3000/admin/data-migration` adresine gidin
3. "Göç İşlemini Başlat" butonuna tıklayarak veri göçünü başlatın

## İleriye Dönük Yapılacaklar

1. **Auth Entegrasyonu İyileştirmeleri**
   - Sosyal giriş sağlayıcıları entegrasyonu (Google, Facebook)
   - E-posta doğrulama süreci iyileştirmeleri
   - Şifre sıfırlama sürecinin entegrasyonu

2. **Storage İyileştirmeleri**
   - Kullanıcı avatarları için daha etkin bir yükleme sistemi
   - Mağaza logoları ve ürün görselleri için optimize edilmiş depolama

3. **Realtime Özellikleri**
   - Sipariş durumu güncellemeleri için realtime abonelikler
   - Anlık bildirimler için Supabase Realtime kullanımı

4. **Edge Functions**
   - Ödeme işlemleri için Supabase Edge Functions kullanımı
   - Bildirim gönderme için serverless fonksiyonlar

## Sorun Giderme

**Veri göçü sırasında hatalar alıyorsanız:**

1. Tarayıcı konsolunda detaylı hata mesajlarını kontrol edin
2. Supabase projesinde RLS politikalarının doğru yapılandırıldığından emin olun
3. `src/lib/schema.sql` dosyasının başarıyla çalıştırıldığını kontrol edin
4. Supabase proje URL'si ve anahtarının doğru olduğundan emin olun

**Auth sorunları:**

1. RLS politikalarını kontrol edin
2. Kullanıcı rollerinin doğru tanımlandığından emin olun
3. Supabase Dashboard'da "Authentication" > "Users" bölümünden kullanıcı verilerini kontrol edin 