# FoodHub Database Documentation

## 📊 Database Overview

FoodHub, bir yemek sipariş platformunun komplet database yapısıdır. PostgreSQL database'i kullanarak kullanıcılar, mağazalar, ürünler, siparişler ve diğer işlemsel verileri yönetir.

---

## 🗂️ Tables (Tablolar)

### 1. **users** - Kullanıcılar
Sistemdeki tüm kullanıcıların temel bilgilerini tutar.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Birincil anahtar |
| email | varchar | E-posta adresi (unique) |
| first_name | varchar | Ad |
| last_name | varchar | Soyad |
| name | varchar | Otomatik oluşturulan tam ad |
| phone | varchar | Telefon numarası |
| role | varchar | Kullanıcı rolü (user/store/admin) |
| avatar_url | text | Profil fotoğrafı URL'i |
| is_active | boolean | Aktiflik durumu |
| store_id | uuid | Bağlı mağaza ID'si |
| created_at | timestamptz | Oluşturulma tarihi |
| updated_at | timestamptz | Güncelleme tarihi |

**İlişkiler:**
- `users.id` → `auth.users.id`
- `users.store_id` → `stores.id`

---

### 2. **user_settings** - Kullanıcı Ayarları
Kullanıcıların kişisel ayarlarını tutar.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Birincil anahtar |
| user_id | uuid | Kullanıcı ID'si (unique) |
| enable_email_notifications | boolean | E-posta bildirimleri |
| enable_sms_notifications | boolean | SMS bildirimleri |
| enable_push_notifications | boolean | Push bildirimleri |
| enable_order_updates | boolean | Sipariş güncellemeleri |
| enable_promotions | boolean | Promosyon bildirimleri |
| enable_newsletter | boolean | Haber bülteni |
| language | varchar | Dil ayarı |
| currency | varchar | Para birimi |
| timezone | varchar | Saat dilimi |
| theme | varchar | Tema ayarı |
| created_at | timestamptz | Oluşturulma tarihi |
| updated_at | timestamptz | Güncelleme tarihi |

**İlişkiler:**
- `user_settings.user_id` → `users.id`

---

### 3. **categories** - Kategoriler
Mağaza ve ürün kategorilerini tutar.

| Column | Type | Description |
|--------|------|-------------|
| id | integer | Birincil anahtar (serial) |
| name | varchar | Kategori adı |
| slug | varchar | SEO dostu URL |
| description | text | Açıklama |
| parent_id | integer | Üst kategori ID'si |
| image_url | text | Kategori görseli |
| is_active | boolean | Aktiflik durumu |
| sort_order | integer | Sıralama |
| created_at | timestamptz | Oluşturulma tarihi |
| updated_at | timestamptz | Güncelleme tarihi |

**İlişkiler:**
- `categories.parent_id` → `categories.id` (self-reference)

---

### 4. **stores** - Mağazalar
Platformdaki tüm mağazaların bilgilerini tutar.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Birincil anahtar |
| owner_id | uuid | Mağaza sahibi ID'si |
| name | varchar | Mağaza adı |
| slug | varchar | SEO dostu URL |
| description | text | Açıklama |
| email | varchar | E-posta |
| phone | varchar | Telefon |
| address | text | Adres |
| city | varchar | Şehir |
| district | varchar | İlçe |
| postal_code | varchar | Posta kodu |
| category_id | integer | Ana kategori |
| subcategories | integer[] | Alt kategoriler |
| logo_url | text | Logo URL'i |
| banner_url | text | Banner URL'i |
| cover_url | text | Kapak görseli |
| is_approved | boolean | Onay durumu |
| is_active | boolean | Aktiflik durumu |
| status | varchar | Durum (pending/active/inactive/suspended) |
| rating | numeric | Ortalama puan |
| review_count | integer | Değerlendirme sayısı |
| commission_rate | numeric | Komisyon oranı |
| minimum_order_amount | numeric | Minimum sipariş tutarı |
| delivery_fee | numeric | Teslimat ücreti |
| delivery_time_min | integer | Min teslimat süresi |
| delivery_time_max | integer | Max teslimat süresi |
| type | varchar | Mağaza tipi |
| settings | jsonb | Ayarlar |
| created_at | timestamptz | Oluşturulma tarihi |
| updated_at | timestamptz | Güncelleme tarihi |

**İlişkiler:**
- `stores.owner_id` → `users.id`
- `stores.category_id` → `categories.id`

---

### 5. **products** - Ürünler
Mağazalardaki ürünlerin bilgilerini tutar.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Birincil anahtar |
| store_id | uuid | Mağaza ID'si |
| name | varchar | Ürün adı |
| slug | varchar | SEO dostu URL |
| description | text | Açıklama |
| category | varchar | Kategori |
| price | numeric | Fiyat |
| original_price | numeric | Eski fiyat |
| cost_price | numeric | Maliyet fiyatı |
| sku | varchar | Stok kodu |
| barcode | varchar | Barkod |
| stock_quantity | integer | Stok miktarı |
| min_stock_level | integer | Minimum stok seviyesi |
| is_available | boolean | Satışta mı |
| is_featured | boolean | Öne çıkarılmış mı |
| weight | numeric | Ağırlık |
| dimensions | jsonb | Boyutlar |
| images | text[] | Görseller |
| tags | text[] | Etiketler |
| nutritional_info | jsonb | Besin değerleri |
| allergen_info | text[] | Alerjen bilgisi |
| preparation_time | integer | Hazırlık süresi |
| calories | integer | Kalori |
| rating | numeric | Ortalama puan |
| review_count | integer | Değerlendirme sayısı |
| view_count | integer | Görüntülenme sayısı |
| order_count | integer | Sipariş sayısı |
| created_at | timestamptz | Oluşturulma tarihi |
| updated_at | timestamptz | Güncelleme tarihi |

**İlişkiler:**
- `products.store_id` → `stores.id`

---

### 6. **orders** - Siparişler
Tüm sipariş bilgilerini tutar.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Birincil anahtar |
| user_id | uuid | Müşteri ID'si |
| store_id | uuid | Mağaza ID'si |
| order_number | varchar | Sipariş numarası (unique) |
| status | varchar | Durum (pending/confirmed/preparing/ready/delivering/delivered/cancelled) |
| payment_status | varchar | Ödeme durumu (pending/paid/failed/refunded) |
| payment_method | varchar | Ödeme yöntemi |
| subtotal | numeric | Ara toplam |
| tax_amount | numeric | Vergi tutarı |
| delivery_fee | numeric | Teslimat ücreti |
| discount_amount | numeric | İndirim tutarı |
| total_amount | numeric | Toplam tutar |
| currency | varchar | Para birimi |
| delivery_address | jsonb | Teslimat adresi |
| delivery_notes | text | Teslimat notları |
| estimated_delivery_time | timestamptz | Tahmini teslimat zamanı |
| actual_delivery_time | timestamptz | Gerçek teslimat zamanı |
| cancelled_at | timestamptz | İptal tarihi |
| cancellation_reason | text | İptal nedeni |
| notes | text | Notlar |
| created_at | timestamptz | Oluşturulma tarihi |
| updated_at | timestamptz | Güncelleme tarihi |

**İlişkiler:**
- `orders.user_id` → `users.id`
- `orders.store_id` → `stores.id`

---

### 7. **order_items** - Sipariş Kalemleri
Siparişteki ürünlerin detaylarını tutar.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Birincil anahtar |
| order_id | uuid | Sipariş ID'si |
| product_id | uuid | Ürün ID'si |
| quantity | integer | Miktar |
| unit_price | numeric | Birim fiyat |
| total_price | numeric | Toplam fiyat |
| notes | text | Notlar |
| created_at | timestamptz | Oluşturulma tarihi |

**İlişkiler:**
- `order_items.order_id` → `orders.id`
- `order_items.product_id` → `products.id`

---

### 8. **reviews** - Değerlendirmeler
Ürün ve mağaza değerlendirmelerini tutar.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Birincil anahtar |
| user_id | uuid | Kullanıcı ID'si |
| store_id | uuid | Mağaza ID'si (opsiyonel) |
| product_id | uuid | Ürün ID'si (opsiyonel) |
| order_id | uuid | Sipariş ID'si (opsiyonel) |
| rating | integer | Puan (1-5) |
| title | varchar | Başlık |
| comment | text | Yorum |
| images | text[] | Görseller |
| is_verified | boolean | Doğrulanmış mı |
| is_approved | boolean | Onaylanmış mı |
| helpful_count | integer | Faydalı bulunma sayısı |
| created_at | timestamptz | Oluşturulma tarihi |
| updated_at | timestamptz | Güncelleme tarihi |

**İlişkiler:**
- `reviews.user_id` → `users.id`
- `reviews.store_id` → `stores.id`
- `reviews.product_id` → `products.id`
- `reviews.order_id` → `orders.id`

---

## 🔗 Storage Buckets

### 1. **avatars**
- **Public:** Yes
- **Purpose:** Kullanıcı profil fotoğrafları
- **Size Limit:** Unlimited
- **MIME Types:** All allowed

### 2. **stores**
- **Public:** Yes  
- **Purpose:** Mağaza logoları, bannerları, kapak görselleri
- **Size Limit:** Unlimited
- **MIME Types:** All allowed

### 3. **products**
- **Public:** Yes
- **Purpose:** Ürün görselleri
- **Size Limit:** Unlimited
- **MIME Types:** All allowed

### 4. **categories**
- **Public:** Yes
- **Purpose:** Kategori görselleri
- **Size Limit:** Unlimited
- **MIME Types:** All allowed

### 5. **pub**
- **Public:** Yes
- **Purpose:** Genel dosyalar
- **Size Limit:** Unlimited
- **MIME Types:** All allowed

---

## ⚡ Database Functions

### 1. **generate_order_number()**
- **Type:** Trigger Function
- **Purpose:** Yeni sipariş oluşturulduğunda otomatik sipariş numarası üretir
- **Format:** ORD-YYYYMMDD-XXXX

### 2. **update_store_rating()**
- **Type:** Trigger Function
- **Purpose:** Yeni değerlendirme eklendiğinde mağaza puanını günceller

### 3. **update_product_rating()**
- **Type:** Trigger Function
- **Purpose:** Yeni değerlendirme eklendiğinde ürün puanını günceller

### 4. **handle_new_user()**
- **Type:** Trigger Function
- **Purpose:** Yeni kullanıcı kaydında user_settings tablosuna varsayılan değerler ekler

### 5. **handle_store_created()**
- **Type:** Trigger Function
- **Purpose:** Yeni mağaza oluşturulduğunda kullanıcının store_id'sini günceller

### 6. **update_updated_at_column()**
- **Type:** Trigger Function
- **Purpose:** UPDATE işlemlerinde updated_at sütununu otomatik günceller

---

## 🔥 Triggers

### Updated At Triggers
Tüm tablolarda `updated_at` sütununu otomatik güncelleyen tetikleyiciler:
- `update_users_updated_at`
- `update_stores_updated_at`
- `update_products_updated_at`
- `update_orders_updated_at`
- `update_reviews_updated_at`
- Ve diğer tüm tablolar için...

### Business Logic Triggers
- `on_order_created` → Sipariş numarası üretimi
- `on_store_review_change` → Mağaza puanı güncelleme
- `on_product_review_change` → Ürün puanı güncelleme
- `on_store_created` → Kullanıcı-mağaza ilişkisi kurma

---

## 📋 Key Features

### ✅ Implemented Features
- ✅ User management with role-based access
- ✅ Store management with approval workflow
- ✅ Product catalog with variants and options
- ✅ Order management with status tracking
- ✅ Review and rating system
- ✅ Shopping cart functionality
- ✅ Commission calculation system
- ✅ Notification system
- ✅ File storage for images
- ✅ Automated triggers for business logic

### 🔧 Technical Features
- ✅ UUID primary keys
- ✅ Automatic timestamp management
- ✅ JSONB for flexible data storage
- ✅ Array columns for multi-value fields
- ✅ Comprehensive foreign key relationships
- ✅ Optimized indexes for performance
- ✅ Row Level Security (currently disabled)

---

## 🏗️ Database Schema Summary

**Total Tables:** 24
**Storage Buckets:** 5
**Custom Functions:** 15+
**Triggers:** 30+
**Relationships:** 25+

Bu database yapısı, tam özellikli bir yemek sipariş platformunu destekleyecek şekilde tasarlanmıştır ve tüm temel e-ticaret işlevlerini içermektedir. 