# Supabase Geçişi ve Mock Veri Temizleme Kılavuzu

Bu kılavuz, uygulamanın mock verilerden Supabase veritabanına geçişi için gereken adımları ve yapılan çalışmaları içermektedir.

## Hazırlık

1. Veri göçü tamamlandı ve Supabase veritabanında artık gerekli veriler mevcut.
2. İhtiyaç duyulan API fonksiyonları `src/lib/api.js` dosyasında tanımlandı.
3. Örnek sayfa dönüşümü `src/app/yemek/page.js` dosyasında gerçekleştirildi.
4. Mock veri kullanımlarını tespit etmek için bir betik oluşturuldu.

## Tamamlanan Dönüşümler

Aşağıdaki sayfalar ve bileşenler mock verilerden Supabase veritabanına geçirildi:

### Ana Sayfalar:
- `src/app/yemek/page.js`: Yemek kategorisi ana sayfası
- `src/app/market/page.js`: Market kategorisi ana sayfası
- `src/app/su/page.js`: Su kategorisi ana sayfası
- `src/app/cicek/page.js`: Çiçek kategorisi ana sayfası

### Detay Sayfaları:
- `src/app/yemek/store/[id]/page.js`: Restoran detay sayfası
- `src/app/market/[id]/page.js`: Market detay sayfası
- `src/app/su/[id]/page.js`: Su satıcısı detay sayfası
- `src/app/cicek/[id]/page.js`: Çiçek satıcısı detay sayfası
- `src/app/aktuel/[id]/page.js`: Aktüel ürün detay sayfası

### Kategori Sayfaları:
- `src/app/yemek/kategori/[categoryId]/page.js`: Yemek kategorisi sayfası

### Profil ve Kullanıcı Sayfaları:
- `src/app/profil/siparisler/page.js`: Kullanıcı siparişleri sayfası
- `src/app/profil/yorumlar/page.js`: Kullanıcı yorumları sayfası
- `src/app/profil/siparisler/[id]/tracking/page.js`: Sipariş takip sayfası
- `src/app/register/page.js`: Kayıt sayfası

### Mağaza Yönetimi Sayfaları:
- `src/app/store/products/page.js`: Mağaza ürünleri yönetim sayfası
- `src/app/store/products/[id]/page.js`: Ürün düzenleme sayfası
- `src/app/store/orders/page.js`: Mağaza siparişleri sayfası
- `src/app/store/orders/[id]/page.js`: Sipariş detay sayfası

### Kampanya Sayfaları:
- `src/app/kampanyalar/page.js`: Kampanyalar sayfası
- `src/app/kampanyalar/olustur/page.js`: Kampanya oluşturma sayfası
- `src/app/kampanyalar/duzenle/[id]/page.js`: Kampanya düzenleme sayfası
- `src/components/CampaignBanner.js`: Kampanya banner bileşeni

## Temizleme Süreci

### 1. Mock Veri Kullanımını Tespit Edin

Aşağıdaki komutu çalıştırarak projenizdeki tüm mock veri kullanımlarını listeleyebilirsiniz:

```bash
node scripts/clean-mock-data.js
```

Bu komut, mock veri kullanılan tüm dosyaları ve içe aktarılan veri nesnelerini listeleyecektir.

### 2. Sayfa Sayfa Dönüşüm Yapın

Her sayfayı tek tek güncelleyin:

1. Mock veri importlarını kaldırın ve API hizmetini import edin:

```javascript
// Eski
import { mockStores, mockProducts } from '@/app/data/mockdatas';

// Yeni
import api from '@/lib/api';
```

2. Veri yükleme kodunu güncelleyin:

```javascript
// Eski
useEffect(() => {
  const stores = mockStores.filter(...);
  setStores(stores);
}, []);

// Yeni
useEffect(() => {
  async function fetchData() {
    try {
      const storesData = await api.getStores({ category: 1 });
      setStores(storesData);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    }
  }
  fetchData();
}, []);
```

3. Veri yapısı değişikliklerini düzeltin:
   - `storeId` → `store_id`
   - `isOpen` → `is_open`
   - `minOrder` → `min_order`
   - `createdAt` → `created_at`

### 3. Tüm Dönüşümler Tamamlandı

✅ Tebrikler! Tüm sayfalar mock verilerden Supabase veritabanına geçirildi.

### 4. Mock Veri Dosyasını Kaldırın

Tüm sayfalar Supabase'e geçirildiğinde, `src/app/data/mockdatas.js` dosyasını silebilir veya yedek olarak tutabilirsiniz.

## Önemli Notlar ve Öneriler

1. RLS (Row Level Security) politikalarının doğru yapılandırıldığından emin olun.
2. Performans için büyük veri setlerinde sayfalama (pagination) kullanmayı düşünün.
3. Hataları yakalamak ve kullanıcıya göstermek için tüm API çağrılarında try-catch bloklarını kullanın.
4. URL yapılarını standardize edin (örneğin, tüm kategori sayfaları için aynı yapıyı kullanın).
5. Görsel yükleme işlemleri için Supabase Storage kullanmayı unutmayın.

## Veritabanı Eksikleri

1. `stores` tablosunda:
   - `type` alanı (kategori adını içerecek şekilde)
   - `tags` alanı (dizi olarak mağaza etiketleri)
   - `is_approved` alanı (mağaza onay durumu)

2. Eksik tabloları kontrol edin ve gerekli alanlara sahip olduklarından emin olun.

## Yardımcı Kaynaklar

- Detaylı adımlar için: `README-SUPABASE-MIGRATION.md`
- API Fonksiyonları: `src/lib/api.js` ve `src/lib/supabaseApi.js`
- Veritabanı şeması: `tablolar.md`

Tüm bu adımları izleyerek, uygulamanızı mock verilerden gerçek bir Supabase veritabanına sorunsuzca geçirebilirsiniz. 