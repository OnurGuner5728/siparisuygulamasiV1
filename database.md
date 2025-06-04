# 🗄️ Sipariş Uygulaması - Veritabanı Yapısı

## 📋 Genel Bilgiler

- **Proje ID**: ozqsbbngkkssstmaktou
- **Platform**: Supabase PostgreSQL
- **RLS**: Devre dışı (tüm tablolar)
- **Tablolar**: 30 ana tablo
- **Fonksiyonlar**: 45+ trigger ve utility fonksiyonu
- **İndeksler**: 70+ performans indeksi

## 🔧 PostgreSQL Eklentileri

| Eklenti | Şema | Versiyon | Açıklama |
|---------|------|----------|----------|
| pgcrypto | extensions | 1.3 | Kriptografik fonksiyonlar |
| unaccent | public | 1.1 | Accent kaldırma arama |
| pg_trgm | public | 1.6 | Trigram benzerlik araması |
| uuid-ossp | extensions | 1.1 | UUID üretimi |
| pg_graphql | graphql | 1.5.11 | GraphQL desteği |

## 📊 Ana Tablolar

### 🧑‍💼 Kullanıcı Sistemi

#### users - Sistem Kullanıcıları
- **Primary Key**: id (UUID)
- **Unique**: email
- **Generated**: name (first_name + last_name)
- **Roles**: 'user', 'store', 'admin'
- **Status**: 'pending', 'active', 'inactive'

#### user_settings - Kullanıcı Ayarları
- Bildirim tercihleri (email, SMS, push)
- Gizlilik ayarları
- Sistem ayarları (dil, tema, para birimi)
- Güvenlik ayarları (2FA, session timeout)

#### addresses - Adres Bilgileri
- Detaylı Türkiye adres formatı
- is_default (tek varsayılan adres)
- Teslimat yönergeleri

#### email_confirmations - Email Doğrulama
- Auth.users ile senkron
- Token hash sistemi

### 🏪 Mağaza Sistemi

#### stores - Mağaza Bilgileri
- **Primary Key**: id (UUID)
- **Unique**: slug
- **Owner**: users.id referansı
- **Status**: pending → active/inactive/suspended
- **Commission**: Varsayılan %10
- **Settings**: JSONB konfigürasyon

#### categories - Kategori Ağacı
- Self-referencing hiyerarşi
- parent_id → categories.id
- Ana ve alt kategoriler

### 📦 Ürün Sistemi

#### products - Ürün Kataloğu
- **Store Reference**: stores.id
- **Images**: Çoklu görsel desteği (TEXT[])
- **Nutritional Info**: Besin değerleri (JSONB)
- **Auto Calculated**: rating, review_count

#### product_option_groups - Seçenek Grupları
- Ürün seçenekleri (Boyut, Ekstra vb.)
- min/max_selections
- is_required

#### product_options - Seçenek Değerleri
- price_modifier (+ veya - fiyat)
- group_id referansı

### 🛒 Sepet Sistemi

#### cart_items - Alışveriş Sepeti
- **Unique**: (user_id, product_id)
- **Cache Fields**: name, price, store_name
- Auto-update trigger'ları

#### cart_item_options - Sepet Seçenekleri
- cart_item_id → cart_items.id
- option_group_id, option_id referansları

### 📋 Sipariş Sistemi

#### orders - Ana Sipariş Tablosu
- **Auto Generated**: order_number (ORD-YYYYMMDD-XXXX)
- **Status Flow**: pending → confirmed → preparing → ready → delivering → delivered
- **Payment Status**: pending → paid/failed/refunded
- **History**: status_history (JSONB)

#### order_items - Sipariş Kalemleri
- **Snapshot Data**: name, price (değişmez)
- quantity, unit_price, total_price

#### order_item_options - Sipariş Seçenekleri
- **Denormalized**: option_group_name, option_name
- price_modifier

### 💰 Ödeme Sistemi

#### payment_methods - Ödeme Yöntemleri
- **Types**: cash, card_on_delivery, online_payment
- **Details**: JSONB format
- is_default

#### commission_calculations - Komisyon Hesaplama
- order_id bazında komisyon
- commission_rate, commission_amount
- platform_fee, payment_processing_fee
- net_amount

#### store_commission_summary - Komisyon Özeti
- **Unique**: (store_id, period_start, period_end)
- Aylık ve günlük toplam istatistikler
- total_orders, total_revenue, net_earnings

### 🎯 Kampanya Sistemi

#### campaigns - Kampanyalar
- **Types**: percentage, fixed_amount, free_delivery
- **Categories**: Yemek, Market, Su
- **Admin Created**: Platform kampanyaları
- **Store Created**: Mağaza kampanyaları

#### campaign_applications - Kampanya Başvuruları
- **Unique**: (campaign_id, store_id)
- **Status**: pending → approved/rejected
- reviewed_by admin

#### campaign_banners - Kampanya Bannerları
- Platform ana sayfa bannerları
- priority_order, click_count
- kategori bazlı gösterim

#### store_campaign_participations - Katılım Durumu
- **Active Participations**: store-campaign ilişkisi
- performance_metrics (JSONB)

#### campaign_rules - Kampanya Kuralları
- allow_multiple_campaigns
- excluded_campaign_combinations
- max_campaigns_per_store

### ⭐ Değerlendirme Sistemi

#### reviews - Ana Değerlendirmeler
- **Types**: store, product, order
- **Rating**: 1-5 arası
- **Unique**: (order_id, user_id) - sipariş başına tek review
- **Images**: Fotoğraf desteği (TEXT[])

#### review_responses - Mağaza Yanıtları
- Store'ların müşteri yorumlarına yanıtı
- is_official flag

#### review_likes - Beğeni Sistemi
- **Unique**: (review_id, user_id)
- Yorum beğeni sistemi

### 🔔 Bildirim Sistemi

#### notifications - Bildirimler
- **Types**: order_status, campaign, system, promotion
- **Data**: JSONB metadata
- is_read, read_at

#### favorites - Favori Sistemi
- **Types**: store, product
- **Unique**: (user_id, item_type, item_id)

### 🏷️ Özel Tablolar

#### aktuel_products - Aktüel Ürünler
- Süpermarket aktüel/indirimli ürünler
- discount_percentage
- valid_from, valid_until

#### module_permissions - Modül İzinleri
- Sistem modül erişim kontrolü
- roles (JSONB array)
- is_enabled

## 🔧 Database Fonksiyonları

### Trigger Fonksiyonları

#### update_updated_at_column()
Tüm tablolarda updated_at otomatik güncellemesi

#### generate_order_number()
Sipariş numarası otomatik üretimi: ORD-YYYYMMDD-XXXX

#### update_store_rating()
Review değişikliklerinde store rating otomatik hesaplama

#### update_product_rating()
Review değişikliklerinde product rating otomatik hesaplama

#### handle_new_user()
Auth.users → public.users senkronizasyonu ve user_settings oluşturma

#### handle_store_created()
Yeni mağaza oluşturulduğunda owner'ın store_id güncelleme

#### handle_email_confirmation()
Email doğrulandığında user status aktif yapma

### Utility Fonksiyonları

#### get_user_stats(user_id)
Kullanıcı istatistikleri (sipariş, favori, adres sayıları)

#### auto_expire_campaigns()
Süresi dolmuş kampanyaları otomatik pasifleştirme

#### update_store_commission_summary(store_id)
Mağaza komisyon özetlerini güncelleme

#### get_active_campaigns_by_category(category_id)
Kategoriye göre aktif kampanyalar

## ⚡ Database Trigger'ları

### Updated At Trigger'ları (30+ Trigger)
Her ana tabloda updated_at otomatik güncelleme

### Özel İş Mantığı Trigger'ları

#### Sipariş Sistemi
- `on_order_created`: Sipariş numarası üretimi

#### Rating Sistemi
- `on_store_review_change`: Store rating güncelleme
- `on_product_review_change`: Product rating güncelleme
- Multiple safety triggers

#### Validasyon
- `trigger_check_store_review_has_order`: Store review'ların sipariş ile ilişkili olması

#### User Management
- `trigger_sync_user_address`: User-Address senkronizasyonu

## 📊 Database İndeksleri

### Primary Key İndeksleri
Her tabloda otomatik _pkey indeksi

### Unique İndeksler
- users_email_key
- stores_slug_key
- orders_order_number_key
- campaigns_code_key

### Composite Unique İndeksler
- cart_items: (user_id, product_id)
- favorites: (user_id, item_type, item_id)
- unique_review_per_order: (order_id, user_id)
- campaign_applications: (campaign_id, store_id)

### Performans İndeksleri

#### Notifications
```sql
idx_notifications_user_id, idx_notifications_is_read,
idx_notifications_type, idx_notifications_created_at
```

#### Reviews
```sql
idx_reviews_product_id (WHERE product_id IS NOT NULL),
idx_reviews_order_id (WHERE order_id IS NOT NULL),
idx_reviews_review_type
```

#### Campaigns
```sql
idx_campaign_applications_campaign_id,
idx_campaign_applications_store_id,
idx_campaign_applications_status
```

## 🚀 Performans Optimizasyonları

### 1. Conditional İndeksler
```sql
-- Sadece aktif kayıtlar için
CREATE INDEX idx_campaigns_active ON campaigns(end_date) 
WHERE is_active = true;
```

### 2. JSONB GIN İndeksleri
```sql
CREATE INDEX idx_stores_settings_gin ON stores 
USING GIN(settings);
```

### 3. Trigger Optimizasyonu
Rating hesaplamaları sadece ilgili review type'lar için çalışır

### 4. Partial İndeksler
Image URL'leri için conditional indeks (NULL olmayan, geçerli HTTP)

## 📈 Önerilen Geliştirmeler

### 1. Partitioning
```sql
-- Orders monthly partitioning
CREATE TABLE orders_y2025m01 PARTITION OF orders
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

### 2. Materialized Views
```sql
CREATE MATERIALIZED VIEW store_summary AS
SELECT s.id, s.name, COUNT(o.id) as total_orders
FROM stores s LEFT JOIN orders o ON s.id = o.store_id
GROUP BY s.id, s.name;
```

### 3. Archiving Strategy
1 yıldan eski verileri archive tablolarına taşıma

### 4. Real-time Notifications
```sql
-- Order status değişikliklerinde pg_notify
PERFORM pg_notify('order_status_changed', json_data);
```

## 🔒 Güvenlik

- **RLS**: Şu anda devre dışı, application-level security
- **SSL**: Zorunlu şifreleme
- **Encryption**: Rest'te AES-256
- **Access Control**: Role-based permissions

## 📝 Backup & Recovery

- **Supabase**: Günlük otomatik backup
- **Retention**: 7 gün (Free tier)
- **Point-in-time**: Son 24 saat

## 📊 İstatistikler

- **Toplam Tablo**: 30
- **Toplam Fonksiyon**: 45+
- **Toplam İndeks**: 70+
- **Toplam Trigger**: 40+

---

*Bu dokümantasyon ozqsbbngkkssstmaktou Supabase projesinden Ocak 2025'te otomatik generate edilmiştir.* 
