# 🛒 Sipariş Uygulaması

Modern, çok rollü e-ticaret platformu - Next.js 14 ve Supabase ile geliştirilmiş kapsamlı sipariş yönetim sistemi.

## 📋 Proje Hakkında

Bu uygulama, müşteriler, mağaza sahipleri ve sistem yöneticileri için tasarlanmış kapsamlı bir e-ticaret platformudur. Yemek, market, su ve aktüel ürün kategorilerinde hizmet veren mağazaları tek platformda birleştiren modern bir çözümdür.

### ✨ Ana Özellikler

- 🔐 **Çok Rollü Kullanıcı Sistemi** (Müşteri, Mağaza, Admin)
- 🏪 **Mağaza Onay ve Yönetim Sistemi**
- 🎯 **Kampanya Yönetimi ve Başvuru Sistemi**
- 💳 **Sipariş ve Ödeme Yönetimi**
- 📊 **Real-time Dashboard ve İstatistikler**
- 🔔 **Anlık Bildirim Sistemi**
- 📱 **Responsive ve Modern UI/UX**
- 🌐 **4 Ana Kategori** (Yemek, Market, Su, Aktüel)

## 🚀 Teknoloji Stack

### Frontend
- **Next.js 14.2.18** - React framework with App Router
- **React 18.3.1** - UI library
- **TailwindCSS 3.3.0** - Utility-first CSS framework
- **React Icons 5.5.0** - İkon kütüphanesi
- **React Hot Toast 2.5.2** - Bildirim sistemi

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL veritabanı
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication sistemi
- **SWR 2.3.3** - Data fetching ve cache yönetimi

### Deployment
- **Netlify** - Hosting ve CI/CD
- **Next.js Plugin** - Optimized deployment

## 📁 Proje Yapısı

```
src/
├── app/                        # Next.js 14 App Router
│   ├── admin/                  # Admin panel sayfaları
│   ├── store/                  # Mağaza panel sayfaları
│   ├── kampanyalar/           # Kampanya sayfaları
│   ├── register/              # Kayıt sayfası
│   ├── login/                 # Giriş sayfası
│   └── [kategori]/            # Dinamik kategori sayfaları
├── components/                 # Yeniden kullanılabilir bileşenler
│   ├── ui/                    # UI components
│   ├── cards/                 # Kart bileşenleri
│   └── AuthGuard.js           # Yetkilendirme koruması
├── contexts/                   # React Context providers
│   ├── AuthContext.js         # Kullanıcı authentication
│   └── ModuleContext.js       # Modül yönetimi
├── hooks/                      # Custom React hooks
├── lib/                        # API ve konfigürasyon
│   ├── api.js                 # Ana API functions
│   ├── supabase.js            # Supabase client
│   └── schema.sql             # Veritabanı şeması
└── utils/                      # Yardımcı fonksiyonlar
```

## 🔧 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm, yarn, pnpm veya bun
- Supabase hesabı

### 1. Projeyi klonlayın
```bash
git clone [repository-url]
cd siparisuygulamasi
```

### 2. Bağımlılıkları yükleyin
```bash
npm install
# veya
yarn install
# veya
pnpm install
```

### 3. Environment variables ayarlayın
`.env.local` dosyası oluşturun:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Veritabanını kurulum
```bash
# Supabase CLI kullanarak şemayı import edin
supabase db reset
```

### 5. Geliştirme sunucusunu başlatın
```bash
npm run dev
# veya
yarn dev
# veya
pnpm dev
```

Uygulamayı [http://localhost:3000](http://localhost:3000) adresinde görüntüleyin.

## 👥 Kullanıcı Rolleri

### 🛍️ Müşteri (user)
- Ürün görüntüleme ve sipariş verme
- Profil ve adres yönetimi
- Sipariş takibi
- Mağaza değerlendirme

### 🏪 Mağaza Sahibi (store)
- Mağaza kaydı ve admin onay süreci
- Ürün yönetimi
- Sipariş yönetimi
- Kampanya başvuruları
- Müşteri yorumlarına yanıt

### 👨‍💼 Admin (admin)
- Kullanıcı ve mağaza yönetimi
- Mağaza onay/red işlemleri
- Kampanya oluşturma ve yönetimi
- Sistem geneli raporlar
- Modül erişim kontrolü

## 🎯 Ana İş Akışları

### Kullanıcı Kaydı
1. **Müşteri**: Direkt kayıt → Aktif hesap
2. **Mağaza**: Kayıt → Admin onayı → Aktif hesap

### Kampanya Sistemi
1. **Admin** kampanya oluşturur
2. **Mağazalar** kampanyaya başvuru yapar
3. **Admin** başvuruları onaylar/reddeder
4. Onaylanan mağazalar kampanya sayfasında görünür

### Sipariş Süreci
1. Müşteri ürün seçer ve sepete ekler
2. Sipariş onayı ve ödeme
3. Mağaza siparişi işleme alır
4. Sipariş durumu güncellenir

## 🔒 Güvenlik

- **Row Level Security (RLS)** aktif
- **Role-based Access Control (RBAC)**
- **API endpoint yetkilendirme**
- **SQL injection koruması**
- **XSS koruması**

## 📊 Özellikler

### Real-time Özellikler
- Anlık sipariş bildirimleri
- Live sipariş durumu güncellemeleri
- Real-time mağaza onay bildirimleri

### Dashboard
- Mağaza sahipleri için detaylı istatistikler
- Admin için sistem geneli analytics
- Komisyon hesaplamaları
- Performans metrikleri

## 🛠️ Development

### Geliştirme Komutları
```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run start        # Production sunucu
npm run lint         # ESLint kontrolü
```

### Debug Modu
```bash
npm run dev:debug    # Node.js inspector ile debug
```

## 📱 Responsive Tasarım

Uygulama tüm cihaz boyutlarında optimize edilmiştir:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)  
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🌟 Gelecek Özellikler

- [x] Progressive Web App (PWA) desteği
- [x] Yapay zeka chat entegrasyonu  
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode desteği

## 📈 Performans

- ⚡ SWR ile optimized data fetching
- 🗄️ Intelligent caching strategies
- 📦 Code splitting ve lazy loading
- 🔄 Real-time updates
- 📱 Mobile-first approach

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje [MIT License](LICENSE) ile lisanslanmıştır.

## 📞 İletişim

Proje hakkında sorularınız için:
- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](issues-link)
- 📖 Docs: [Proje Dokümantasyonu](proje.md)

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org) - React framework
- [Supabase](https://supabase.com) - Backend infrastructure  
- [TailwindCSS](https://tailwindcss.com) - CSS framework
- [React Icons](https://react-icons.github.io/react-icons/) - İkon kütüphanesi

---

⭐ Eğer bu proje işinize yaradıysa, lütfen bir yıldız verin!
