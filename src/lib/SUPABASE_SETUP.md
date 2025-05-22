# Supabase Kurulum ve Yapılandırma Rehberi

Bu rehber, Sipariş Uygulaması için Supabase kurulumu ve yapılandırmasını açıklar.

## 1. Supabase Hesabı Oluşturma

1. [Supabase](https://supabase.com) web sitesine gidin
2. "Start your project" butonuna tıklayın
3. GitHub hesabınızla giriş yapın veya e-posta ile kayıt olun

## 2. Yeni Proje Oluşturma

1. Supabase Dashboard'a giriş yaptıktan sonra "New Project" butonuna tıklayın
2. Proje için bir isim belirleyin (örn: `siparis-uygulamasi`)
3. Veritabanı şifresi oluşturun (güvenli bir şifre belirleyin ve kaydedin)
4. Bölge seçin (kullanıcılarınıza en yakın bölge önerilir, örn: Türkiye için "Frankfurt, EU Central" iyi bir seçim olabilir)
5. "Create new project" butonuna tıklayın ve projenin oluşturulmasını bekleyin

## 3. Veritabanı Şeması Oluşturma

1. Proje oluşturulduktan sonra, sol menüden "SQL Editor" seçeneğine tıklayın
2. "New Query" butonuna tıklayın
3. Projedeki `src/lib/schema.sql` dosyasının içeriğini kopyalayıp SQL editörüne yapıştırın
4. "Run" butonuna tıklayarak şema oluşturma işlemini başlatın
5. Sorguların başarıyla çalıştığından emin olun

## 4. Authentication Ayarları

1. Sol menüden "Authentication" seçeneğine tıklayın
2. "Settings" sekmesinden:
   - "Site URL" kısmına uygulamanızın URL'sini girin (geliştirme ortamı için `http://localhost:3000`)
   - "Redirect URLs" kısmına `http://localhost:3000/login` ve `http://localhost:3000/register` adreslerini ekleyin
   - Gerekirse diğer yönlendirme URL'lerini ekleyin
3. "Email Templates" sekmesinden e-posta şablonlarını düzenleyin

## 5. Storage Ayarları

1. Sol menüden "Storage" seçeneğine tıklayın
2. "Create new bucket" butonuna tıklayın
3. `public` adında bir bucket oluşturun ve "Public" olarak işaretleyin
4. Aynı şekilde aşağıdaki bucket'ları da oluşturun:
   - `avatars` (kullanıcı profil resimleri için)
   - `stores` (mağaza logoları ve kapak resimleri için)
   - `products` (ürün görselleri için)

## 6. RLS (Row Level Security) Politikalarını Kontrol Etme

1. Sol menüden "Table Editor" seçeneğine tıklayın
2. Oluşturulan tabloları listeden seçin
3. Her tablo için "Policies" sekmesine tıklayın ve güvenlik politikalarının doğru şekilde uygulandığından emin olun

## 7. API Anahtarlarını Alma

1. Sol menüden "Project Settings" seçeneğine tıklayın
2. "API" sekmesinden "Project URL" ve "anon public" anahtarını kopyalayın
3. Bu bilgileri projenizin kök dizininde `.env.local` dosyasına ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 8. Next.js Uygulamasını Yapılandırma

1. Projenin kök dizininde `.env.local` dosyasını oluşturun ve Supabase bilgilerinizi ekleyin
2. Uygulamayı başlatın: `npm run dev`
3. Tarayıcıda `http://localhost:3000` adresine giderek uygulamanın çalıştığını doğrulayın

## 9. Test Kullanıcıları Oluşturma

1. Uygulamada yeni bir kullanıcı oluşturmak için kayıt formunu kullanın
2. Farklı rollerde test kullanıcıları oluşturmak için:
   - Normal kullanıcı (role: 'user')
   - Mağaza sahibi (role: 'store')
   - Admin (role: 'admin')
3. Admin kullanıcısını oluşturmak için Supabase Dashboard'dan manuel olarak kullanıcı rolünü 'admin' olarak ayarlayın

## 10. Ek Özellikler ve Yapılandırmalar

### E-posta Doğrulama

1. Sol menüden "Authentication" > "Settings" > "Email" sekmesine gidin
2. "Enable email confirmations" seçeneğini etkinleştirin

### Sosyal Giriş Sağlayıcıları

1. Sol menüden "Authentication" > "Providers" sekmesine gidin
2. Etkinleştirmek istediğiniz sosyal giriş sağlayıcılarını (Google, Facebook, Apple, vb.) yapılandırın

### Edge Functions (Serverless)

1. Sol menüden "Edge Functions" seçeneğine tıklayın
2. Gerektiğinde sunucu tarafı işlemler için Supabase Edge Functions'ı kullanabilirsiniz

## Hata Ayıklama

Yaygın hatalar ve çözümleri:

### RLS Politikası Hataları
- Eğer "permission denied for table X" hatası alıyorsanız, ilgili tablonun RLS politikalarını kontrol edin
- Tablo üzerinde doğru politikaların tanımlandığından emin olun

### Authentication Hataları
- Redirect URL'lerin doğru yapılandırıldığından emin olun
- CORS ayarlarının doğru olduğunu kontrol edin

### Storage Hataları
- Bucket izinlerinin doğru şekilde ayarlandığından emin olun
- Dosya yükleme limitlerini kontrol edin

## Faydalı Kaynaklar

- [Supabase Dokümantasyonu](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Next.js ile Supabase Kullanımı](https://supabase.com/docs/guides/with-nextjs) 