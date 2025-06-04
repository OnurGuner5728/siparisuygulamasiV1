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
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | - | Primary Key |
| email | VARCHAR(255) | NO | - | Unique email adresi |
| first_name | VARCHAR(100) | YES | - | Ad |
| last_name | VARCHAR(100) | YES | - | Soyad |
| name | VARCHAR(255) | YES | Generated | Tam ad (first_name + last_name) |
| phone | VARCHAR(20) | YES | - | Telefon numarası |
| role | VARCHAR(50) | YES | 'user' | Kullanıcı rolü |
| avatar_url | TEXT | YES | - | Avatar URL |
| is_active | BOOLEAN | YES | true | Aktiflik durumu |
| store_id | UUID | YES | - | Mağaza referansı (FK) |
| address | TEXT | YES | - | Adres |
| city | VARCHAR(100) | YES | - | Şehir |
| district | VARCHAR(100) | YES | - | İlçe |
| status | VARCHAR(50) | YES | 'pending' | Durum |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Check Constraints:**
- role: 'user', 'store', 'admin'

**Foreign Keys:**
- store_id → stores.id

#### user_settings - Kullanıcı Ayarları
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | Kullanıcı referansı (FK, Unique) |
| notifications_enabled | BOOLEAN | YES | true | Genel bildirimler |
| email_notifications | BOOLEAN | YES | true | Email bildirimleri |
| sms_notifications | BOOLEAN | YES | false | SMS bildirimleri |
| push_notifications | BOOLEAN | YES | true | Push bildirimleri |
| marketing_emails | BOOLEAN | YES | false | Pazarlama emailleri |
| order_updates | BOOLEAN | YES | true | Sipariş güncellemeleri |
| promo_notifications | BOOLEAN | YES | true | Promosyon bildirimleri |
| profile_visibility | TEXT | YES | 'private' | Profil görünürlüğü |
| show_online_status | BOOLEAN | YES | false | Online durum gösterim |
| allow_friend_requests | BOOLEAN | YES | true | Arkadaşlık istekleri |
| language | VARCHAR(10) | YES | 'tr' | Dil |
| currency | VARCHAR(10) | YES | 'TRY' | Para birimi |
| timezone | VARCHAR(50) | YES | 'Europe/Istanbul' | Zaman dilimi |
| theme | VARCHAR(20) | YES | 'light' | Tema |
| two_factor_enabled | BOOLEAN | YES | false | 2FA aktif |
| login_notifications | BOOLEAN | YES | true | Giriş bildirimleri |
| session_timeout | INTEGER | YES | 30 | Oturum timeout (dk) |
| auto_reorder_enabled | BOOLEAN | YES | false | Otomatik yeniden sipariş |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Foreign Keys:**
- user_id → users.id

#### addresses - Adres Bilgileri
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | Kullanıcı referansı (FK) |
| title | VARCHAR(100) | NO | - | Adres başlığı |
| city | VARCHAR(100) | NO | - | Şehir |
| district | VARCHAR(100) | NO | - | İlçe |
| neighborhood | VARCHAR(255) | YES | - | Mahalle |
| street | VARCHAR(255) | YES | - | Sokak |
| building_number | VARCHAR(10) | YES | - | Bina numarası |
| floor | VARCHAR(10) | YES | - | Kat |
| apartment_number | VARCHAR(10) | YES | - | Daire numarası |
| postal_code | VARCHAR(20) | YES | - | Posta kodu |
| country | VARCHAR(100) | YES | 'Turkey' | Ülke |
| full_address | TEXT | YES | - | Tam adres |
| directions | TEXT | YES | - | Tarif |
| type | VARCHAR(20) | YES | 'home' | Adres tipi |
| full_name | VARCHAR(255) | YES | - | Alıcı adı |
| phone | VARCHAR(20) | YES | - | Telefon |
| is_default | BOOLEAN | YES | false | Varsayılan adres |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Foreign Keys:**
- user_id → users.id

#### email_confirmations - Email Doğrulama
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | Kullanıcı referansı (FK) |
| email | TEXT | NO | - | Email adresi |
| token_hash | TEXT | YES | - | Token hash |
| confirmed_at | TIMESTAMPTZ | YES | - | Onay tarihi |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |

**Foreign Keys:**
- user_id → users.id

### 🏪 Mağaza Sistemi

#### stores - Mağaza Bilgileri
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| owner_id | UUID | NO | - | Mağaza sahibi (FK) |
| name | VARCHAR(255) | NO | - | Mağaza adı |
| slug | VARCHAR(255) | YES | - | URL slug (Unique) |
| description | TEXT | YES | - | Açıklama |
| email | VARCHAR(255) | YES | - | Email |
| phone | VARCHAR(20) | YES | - | Telefon |
| address | TEXT | YES | - | Adres |
| city | VARCHAR(100) | YES | - | Şehir |
| district | VARCHAR(100) | YES | - | İlçe |
| neighborhood | VARCHAR(255) | YES | - | Mahalle |
| postal_code | VARCHAR(20) | YES | - | Posta kodu |
| category_id | INTEGER | YES | - | Kategori referansı (FK) |
| subcategories | INTEGER[] | YES | {} | Alt kategoriler |
| logo_url | TEXT | YES | - | Logo URL |
| banner_url | TEXT | YES | - | Banner URL |
| cover_url | TEXT | YES | - | Kapak URL |
| is_approved | BOOLEAN | YES | false | Admin onayı |
| is_active | BOOLEAN | YES | true | Aktiflik |
| status | VARCHAR(50) | YES | 'pending' | Durum |
| rating | NUMERIC | YES | 0.0 | Puan (auto-calculated) |
| review_count | INTEGER | YES | 0 | Yorum sayısı |
| commission_rate | NUMERIC | YES | 10.0 | Komisyon oranı (%) |
| minimum_order_amount | NUMERIC | YES | 0 | Min sipariş tutarı |
| minimum_order_for_free_delivery | NUMERIC | YES | 150.00 | Ücretsiz teslimat sınırı |
| delivery_fee | NUMERIC | YES | 0 | Teslimat ücreti |
| delivery_time_min | INTEGER | YES | 30 | Min teslimat süresi (dk) |
| delivery_time_max | INTEGER | YES | 60 | Max teslimat süresi (dk) |
| type | VARCHAR(100) | YES | - | Mağaza tipi |
| payment_link | TEXT | YES | - | Ödeme linki |
| workingHours | TEXT | YES | - | Çalışma saatleri |
| settings | JSONB | YES | {} | Ayarlar |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Check Constraints:**
- status: 'pending', 'active', 'inactive', 'suspended'

**Foreign Keys:**
- owner_id → users.id
- category_id → categories.id

#### categories - Kategori Ağacı
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | INTEGER | NO | nextval() | Primary Key (Serial) |
| name | VARCHAR(255) | NO | - | Kategori adı |
| slug | VARCHAR(255) | YES | - | URL slug |
| description | TEXT | YES | - | Açıklama |
| parent_id | INTEGER | YES | - | Üst kategori (FK, Self-ref) |
| image_url | TEXT | YES | - | Kategori görseli |
| is_active | BOOLEAN | YES | true | Aktif mi |
| sort_order | INTEGER | YES | 0 | Sıralama |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Foreign Keys:**
- parent_id → categories.id (Self-reference)

### 📦 Ürün Sistemi

#### products - Ürün Kataloğu
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| store_id | UUID | NO | - | Mağaza referansı (FK) |
| name | VARCHAR(255) | NO | - | Ürün adı |
| slug | VARCHAR(255) | YES | - | URL slug |
| description | TEXT | YES | - | Açıklama |
| category | VARCHAR(100) | YES | - | Kategori |
| price | NUMERIC | NO | - | Fiyat |
| original_price | NUMERIC | YES | - | Eski fiyat |
| cost_price | NUMERIC | YES | - | Maliyet fiyatı |
| sku | VARCHAR(100) | YES | - | Stok kodu |
| barcode | VARCHAR(100) | YES | - | Barkod |
| stock_quantity | INTEGER | YES | 0 | Stok adedi |
| min_stock_level | INTEGER | YES | 0 | Min stok seviyesi |
| is_available | BOOLEAN | YES | true | Mevcut mu |
| is_featured | BOOLEAN | YES | false | Öne çıkan |
| weight | NUMERIC | YES | - | Ağırlık |
| dimensions | JSONB | YES | - | Boyutlar |
| image | TEXT | YES | - | Ana görsel |
| images | TEXT[] | YES | {} | Ek görseller |
| tags | TEXT[] | YES | {} | Etiketler |
| nutritional_info | JSONB | YES | - | Besin değerleri |
| allergen_info | TEXT[] | YES | - | Allerjen bilgileri |
| preparation_time | INTEGER | YES | - | Hazırlanma süresi (dk) |
| calories | INTEGER | YES | - | Kalori |
| rating | NUMERIC | YES | 0.0 | Puan (auto-calculated) |
| review_count | INTEGER | YES | 0 | Yorum sayısı |
| view_count | INTEGER | YES | 0 | Görüntülenme sayısı |
| order_count | INTEGER | YES | 0 | Sipariş sayısı |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Foreign Keys:**
- store_id → stores.id

#### product_option_groups - Seçenek Grupları
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| product_id | UUID | NO | - | Ürün referansı (FK) |
| name | VARCHAR(255) | NO | - | Grup adı |
| description | TEXT | YES | - | Açıklama |
| is_required | BOOLEAN | YES | false | Zorunlu mu |
| min_selections | INTEGER | YES | 0 | Min seçim sayısı |
| max_selections | INTEGER | YES | 1 | Max seçim sayısı |
| sort_order | INTEGER | YES | 0 | Sıralama |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Foreign Keys:**
- product_id → products.id

#### product_options - Seçenek Değerleri
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| group_id | UUID | NO | - | Grup referansı (FK) |
| name | VARCHAR(255) | NO | - | Seçenek adı |
| description | TEXT | YES | - | Açıklama |
| price_modifier | NUMERIC | YES | 0 | Fiyat değişimi |
| is_available | BOOLEAN | YES | true | Mevcut mu |
| sort_order | INTEGER | YES | 0 | Sıralama |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Foreign Keys:**
- group_id → product_option_groups.id

### 🛒 Sepet Sistemi

#### cart_items - Alışveriş Sepeti
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | Kullanıcı referansı (FK) |
| product_id | UUID | NO | - | Ürün referansı (FK) |
| store_id | UUID | YES | - | Mağaza referansı (FK) |
| quantity | INTEGER | NO | - | Adet |
| name | VARCHAR(255) | YES | - | Ürün adı (cache) |
| store_name | VARCHAR(255) | YES | - | Mağaza adı (cache) |
| store_type | VARCHAR(100) | YES | - | Mağaza tipi (cache) |
| category | VARCHAR(100) | YES | - | Kategori (cache) |
| price | NUMERIC | YES | 0 | Fiyat (cache) |
| total | NUMERIC | YES | 0 | Toplam (cache) |
| image | TEXT | YES | - | Ürün görseli (cache) |
| notes | TEXT | YES | - | Notlar |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Check Constraints:**
- quantity > 0

**Unique Constraints:**
- (user_id, product_id)

**Foreign Keys:**
- user_id → users.id
- product_id → products.id
- store_id → stores.id

#### cart_item_options - Sepet Seçenekleri
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| cart_item_id | UUID | NO | - | Sepet ürünü referansı (FK) |
| option_group_id | UUID | NO | - | Seçenek grubu referansı (FK) |
| option_id | UUID | NO | - | Seçenek referansı (FK) |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |

**Foreign Keys:**
- cart_item_id → cart_items.id
- option_group_id → product_option_groups.id
- option_id → product_options.id

### 📋 Sipariş Sistemi

#### orders - Ana Sipariş Tablosu
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | Müşteri referansı (FK) |
| store_id | UUID | NO | - | Mağaza referansı (FK) |
| order_number | VARCHAR(50) | NO | - | Sipariş numarası (Unique, Auto-gen) |
| status | VARCHAR(50) | YES | 'pending' | Sipariş durumu |
| payment_status | VARCHAR(50) | YES | 'pending' | Ödeme durumu |
| payment_method | VARCHAR(50) | YES | - | Ödeme yöntemi |
| subtotal | NUMERIC | NO | - | Ara toplam |
| tax_amount | NUMERIC | YES | 0 | Vergi tutarı |
| delivery_fee | NUMERIC | YES | 0 | Teslimat ücreti |
| discount_amount | NUMERIC | YES | 0 | İndirim tutarı |
| total_amount | NUMERIC | NO | - | Toplam tutar |
| currency | VARCHAR(10) | YES | 'TRY' | Para birimi |
| delivery_address | JSONB | YES | - | Teslimat adresi |
| delivery_notes | TEXT | YES | - | Teslimat notları |
| estimated_delivery_time | TEXT | YES | - | Tahmini teslimat |
| actual_delivery_time | TIMESTAMPTZ | YES | - | Gerçek teslimat |
| cancelled_at | TIMESTAMPTZ | YES | - | İptal tarihi |
| cancellation_reason | TEXT | YES | - | İptal nedeni |
| notes | TEXT | YES | - | Notlar |
| order_date | TIMESTAMPTZ | NO | now() | Sipariş tarihi |
| status_history | JSONB | YES | [] | Durum geçmişi |
| payment_method_details | JSONB | YES | - | Ödeme detayları |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Check Constraints:**
- status: 'pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'
- payment_status: 'pending', 'paid', 'failed', 'refunded'
- payment_method: 'cash', 'card_on_delivery', 'online_payment'

**Foreign Keys:**
- user_id → users.id
- store_id → stores.id

#### order_items - Sipariş Kalemleri
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| order_id | UUID | NO | - | Sipariş referansı (FK) |
| product_id | UUID | NO | - | Ürün referansı (FK) |
| quantity | INTEGER | NO | - | Adet |
| unit_price | NUMERIC | NO | - | Birim fiyat |
| total_price | NUMERIC | NO | - | Toplam fiyat |
| name | TEXT | YES | - | Ürün adı (snapshot) |
| price | NUMERIC | YES | - | Fiyat (snapshot) |
| total | NUMERIC | YES | - | Toplam (snapshot) |
| notes | TEXT | YES | - | Notlar |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | CURRENT_TIMESTAMP | Güncelleme tarihi |

**Check Constraints:**
- quantity > 0

**Foreign Keys:**
- order_id → orders.id
- product_id → products.id

#### order_item_options - Sipariş Seçenekleri
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| order_item_id | UUID | NO | - | Sipariş ürünü referansı (FK) |
| option_group_name | VARCHAR(255) | NO | - | Grup adı (denormalized) |
| option_name | VARCHAR(255) | NO | - | Seçenek adı (denormalized) |
| price_modifier | NUMERIC | YES | 0 | Fiyat değişimi |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |

**Foreign Keys:**
- order_item_id → order_items.id

### 💰 Ödeme Sistemi

#### payment_methods - Ödeme Yöntemleri
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | Kullanıcı referansı (FK) |
| type | VARCHAR(50) | NO | - | Ödeme tipi |
| name | VARCHAR(255) | NO | - | Ödeme yöntemi adı |
| details | JSONB | NO | - | Detaylar |
| is_default | BOOLEAN | YES | false | Varsayılan |
| is_active | BOOLEAN | YES | true | Aktif |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Check Constraints:**
- type: 'cash', 'card_on_delivery', 'online_payment', 'credit_card', 'debit_card', 'bank_transfer'

**Foreign Keys:**
- user_id → users.id

#### commission_calculations - Komisyon Hesaplama
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| order_id | UUID | NO | - | Sipariş referansı (FK) |
| store_id | UUID | NO | - | Mağaza referansı (FK) |
| order_total | NUMERIC | NO | - | Sipariş toplamı |
| commission_rate | NUMERIC | NO | - | Komisyon oranı |
| commission_amount | NUMERIC | NO | - | Komisyon tutarı |
| platform_fee | NUMERIC | YES | 0 | Platform ücreti |
| payment_processing_fee | NUMERIC | YES | 0 | Ödeme işlem ücreti |
| net_amount | NUMERIC | NO | - | Net tutar |
| status | VARCHAR(50) | YES | 'pending' | Durum |
| calculated_at | TIMESTAMPTZ | YES | now() | Hesaplama tarihi |
| paid_at | TIMESTAMPTZ | YES | - | Ödeme tarihi |

**Check Constraints:**
- status: 'pending', 'calculated', 'paid'

**Foreign Keys:**
- order_id → orders.id
- store_id → stores.id

#### store_commission_summary - Komisyon Özeti
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| store_id | UUID | NO | - | Mağaza referansı (FK) |
| period_start | DATE | NO | - | Dönem başlangıcı |
| period_end | DATE | NO | - | Dönem sonu |
| total_orders | INTEGER | YES | 0 | Toplam sipariş |
| total_revenue | NUMERIC | YES | 0 | Toplam gelir |
| net_revenue | NUMERIC | YES | 0 | Net gelir |
| total_commission | NUMERIC | YES | 0 | Toplam komisyon |
| total_fees | NUMERIC | YES | 0 | Toplam ücretler |
| net_earnings | NUMERIC | YES | 0 | Net kazanç |
| today_orders | INTEGER | YES | 0 | Bugünkü siparişler |
| today_revenue | NUMERIC | YES | 0 | Bugünkü gelir |
| today_net_revenue | NUMERIC | YES | 0 | Bugünkü net gelir |
| today_commission | NUMERIC | YES | 0 | Bugünkü komisyon |
| commission_rate | NUMERIC | YES | 0 | Komisyon oranı |
| status | VARCHAR(50) | YES | 'pending' | Durum |
| last_updated | TIMESTAMPTZ | YES | CURRENT_TIMESTAMP | Son güncelleme |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Check Constraints:**
- status: 'pending', 'calculated', 'paid'

**Unique Constraints:**
- (store_id, period_start, period_end)

**Foreign Keys:**
- store_id → stores.id

### 🎯 Kampanya Sistemi

#### campaigns - Kampanyalar
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| store_id | UUID | YES | - | Mağaza referansı (FK) |
| name | VARCHAR(255) | NO | - | Kampanya adı |
| description | TEXT | YES | - | Açıklama |
| code | VARCHAR(50) | YES | - | Kampanya kodu (Unique) |
| type | VARCHAR(50) | NO | - | Kampanya tipi |
| value | NUMERIC | NO | - | İndirim değeri |
| min_order_amount | NUMERIC | YES | 0 | Min sipariş tutarı |
| minimum_order_amount | NUMERIC | YES | 0 | Min sipariş tutarı (dup) |
| max_discount_amount | NUMERIC | YES | - | Max indirim tutarı |
| usage_limit | INTEGER | YES | - | Kullanım sınırı |
| usage_count | INTEGER | YES | 0 | Kullanım sayısı |
| user_usage_limit | INTEGER | YES | 1 | Kullanıcı başı sınır |
| is_active | BOOLEAN | YES | true | Aktif mi |
| is_admin_created | BOOLEAN | YES | false | Admin kampanyası |
| priority_order | INTEGER | YES | 0 | Öncelik sırası |
| start_date | TIMESTAMPTZ | NO | - | Başlama tarihi |
| end_date | TIMESTAMPTZ | NO | - | Bitiş tarihi |
| applicable_products | UUID[] | YES | {} | Geçerli ürünler |
| applicable_categories | INTEGER[] | YES | {} | Geçerli kategoriler |
| categories | TEXT[] | YES | {} | Kategori listesi |
| banner_image_url | TEXT | YES | - | Banner URL |
| campaign_category | VARCHAR(50) | YES | - | Kampanya kategorisi |
| discount_type_new | VARCHAR(50) | YES | 'percentage' | İndirim tipi |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Check Constraints:**
- type: 'percentage', 'fixed_amount', 'free_delivery'
- campaign_category: 'Yemek', 'Market', 'Su'
- discount_type_new: 'fixed_amount', 'percentage'

**Foreign Keys:**
- store_id → stores.id

#### campaign_applications - Kampanya Başvuruları
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| campaign_id | UUID | NO | - | Kampanya referansı (FK) |
| store_id | UUID | NO | - | Mağaza referansı (FK) |
| user_id | UUID | NO | - | Başvuran kullanıcı (FK) |
| status | VARCHAR(20) | YES | 'pending' | Başvuru durumu |
| applied_at | TIMESTAMPTZ | YES | now() | Başvuru tarihi |
| reviewed_at | TIMESTAMPTZ | YES | - | İnceleme tarihi |
| reviewed_by | UUID | YES | - | İnceleyen admin (FK) |
| notes | TEXT | YES | - | Notlar |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Check Constraints:**
- status: 'pending', 'approved', 'rejected'

**Unique Constraints:**
- (campaign_id, store_id)

**Foreign Keys:**
- campaign_id → campaigns.id
- store_id → stores.id
- user_id → users.id
- reviewed_by → users.id

#### campaign_banners - Kampanya Bannerları
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| campaign_id | UUID | YES | - | Kampanya referansı (FK) |
| title | VARCHAR(255) | NO | - | Banner başlığı |
| description | TEXT | YES | - | Açıklama |
| banner_image_url | TEXT | NO | - | Banner görsel URL |
| category | VARCHAR(50) | NO | - | Kategori |
| priority_order | INTEGER | YES | 0 | Öncelik sırası |
| is_active | BOOLEAN | YES | true | Aktif mi |
| click_count | INTEGER | YES | 0 | Tıklama sayısı |
| start_date | TIMESTAMPTZ | YES | now() | Başlama tarihi |
| end_date | TIMESTAMPTZ | YES | - | Bitiş tarihi |
| created_by | UUID | YES | - | Oluşturan admin (FK) |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Check Constraints:**
- category: 'Yemek', 'Market', 'Su'

**Foreign Keys:**
- campaign_id → campaigns.id
- created_by → users.id

#### store_campaign_participations - Katılım Durumu
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| store_id | UUID | NO | - | Mağaza referansı (FK) |
| campaign_id | UUID | NO | - | Kampanya referansı (FK) |
| status | VARCHAR(20) | YES | 'active' | Katılım durumu |
| joined_at | TIMESTAMPTZ | YES | now() | Katılım tarihi |
| left_at | TIMESTAMPTZ | YES | - | Ayrılış tarihi |
| performance_metrics | JSONB | YES | {} | Performans metrikleri |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Check Constraints:**
- status: 'active', 'inactive', 'suspended'

**Foreign Keys:**
- store_id → stores.id
- campaign_id → campaigns.id

#### campaign_rules - Kampanya Kuralları
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| name | VARCHAR(255) | NO | - | Kural adı |
| description | TEXT | YES | - | Açıklama |
| allow_multiple_campaigns | BOOLEAN | YES | false | Çoklu kampanya izni |
| excluded_campaign_combinations | JSONB | YES | [] | Hariç tutulan kombinasyonlar |
| min_gap_between_campaigns | INTEGER | YES | 0 | Kampanyalar arası min süre |
| max_campaigns_per_store | INTEGER | YES | 1 | Mağaza başı max kampanya |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

### ⭐ Değerlendirme Sistemi

#### reviews - Ana Değerlendirmeler
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | Kullanıcı referansı (FK) |
| store_id | UUID | YES | - | Mağaza referansı (FK) |
| product_id | UUID | YES | - | Ürün referansı (FK) |
| order_id | UUID | YES | - | Sipariş referansı (FK) |
| rating | INTEGER | NO | - | Puan (1-5) |
| title | VARCHAR(255) | YES | - | Başlık |
| comment | TEXT | YES | - | Yorum |
| images | TEXT[] | YES | {} | Fotoğraflar |
| is_verified | BOOLEAN | YES | false | Doğrulanmış |
| is_approved | BOOLEAN | YES | true | Onaylanmış |
| is_anonymous | BOOLEAN | YES | false | Anonim |
| helpful_count | INTEGER | YES | 0 | Yararlı sayısı |
| response_count | INTEGER | YES | 0 | Yanıt sayısı |
| like_count | INTEGER | YES | 0 | Beğeni sayısı |
| review_type | VARCHAR(20) | YES | 'store' | Review tipi |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Check Constraints:**
- rating: 1 <= rating <= 5
- review_type: 'store', 'product', 'order'
- Store veya product'tan biri null olmalı

**Unique Constraints:**
- (order_id, user_id) - Sipariş başına tek review

**Foreign Keys:**
- user_id → users.id
- store_id → stores.id
- product_id → products.id
- order_id → orders.id

#### review_responses - Mağaza Yanıtları
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| review_id | UUID | NO | - | Yorum referansı (FK) |
| store_id | UUID | NO | - | Mağaza referansı (FK) |
| responder_id | UUID | NO | - | Yanıtlayan kişi (FK) |
| response_text | TEXT | NO | - | Yanıt metni |
| is_official | BOOLEAN | YES | true | Resmi yanıt |
| is_approved | BOOLEAN | YES | true | Onaylanmış |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Foreign Keys:**
- review_id → reviews.id
- store_id → stores.id
- responder_id → users.id

#### review_likes - Beğeni Sistemi
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| review_id | UUID | NO | - | Yorum referansı (FK) |
| user_id | UUID | NO | - | Kullanıcı referansı (FK) |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |

**Unique Constraints:**
- (review_id, user_id)

**Foreign Keys:**
- review_id → reviews.id
- user_id → users.id

### 🔔 Bildirim Sistemi

#### notifications - Bildirimler
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | YES | - | Kullanıcı referansı (FK) |
| store_id | UUID | YES | - | Mağaza referansı (FK) |
| type | VARCHAR(100) | NO | - | Bildirim tipi |
| title | VARCHAR(255) | NO | - | Başlık |
| message | TEXT | NO | - | Mesaj |
| data | JSONB | YES | {} | Ek veri |
| is_read | BOOLEAN | YES | false | Okundu mu |
| read_at | TIMESTAMPTZ | YES | - | Okunma tarihi |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

**Foreign Keys:**
- user_id → users.id
- store_id → stores.id

#### favorites - Favori Sistemi
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | Kullanıcı referansı (FK) |
| item_type | VARCHAR(50) | NO | - | Öğe tipi |
| item_id | UUID | NO | - | Öğe referansı |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |

**Check Constraints:**
- item_type: 'store', 'product'

**Unique Constraints:**
- (user_id, item_type, item_id)

**Foreign Keys:**
- user_id → users.id

### 🏷️ Özel Tablolar

#### aktuel_products - Süpermarket Aktüel Ürünleri
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| name | VARCHAR(255) | NO | - | Ürün adı |
| description | TEXT | YES | - | Açıklama |
| brand | VARCHAR(100) | YES | - | Marka |
| category | VARCHAR(100) | YES | - | Kategori |
| price | NUMERIC | YES | - | Fiyat |
| original_price | NUMERIC | YES | - | Eski fiyat |
| discount_percentage | INTEGER | YES | - | İndirim yüzdesi |
| barcode | VARCHAR(100) | YES | - | Barkod |
| images | TEXT[] | YES | {} | Görseller |
| specifications | JSONB | YES | - | Özellikler |
| is_active | BOOLEAN | YES | true | Aktif mi |
| valid_from | DATE | YES | - | Geçerlilik başlangıcı |
| valid_until | DATE | YES | - | Geçerlilik sonu |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | YES | now() | Güncelleme tarihi |

### 🔧 Sistem Yönetimi

#### module_permissions - Modül İzinleri
| Kolon | Tip | Null | Default | Açıklama |
|-------|-----|------|---------|----------|
| id | INTEGER | NO | nextval() | Primary Key (Serial) |
| module_name | VARCHAR(100) | NO | - | Modül adı |
| display_name | VARCHAR(255) | NO | - | Görünen ad |
| description | TEXT | YES | - | Açıklama |
| is_enabled | BOOLEAN | YES | true | Etkin mi |
| roles | JSONB | YES | ["admin"] | Yetkili roller |
| settings | JSONB | YES | {} | Ayarlar |
| created_at | TIMESTAMPTZ | YES | now() | Oluşturma tarihi |
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

## 📋 Tüm Tablolar Özet Listesi

| # | Tablo | Kolonlar | Açıklama |
|---|-------|----------|----------|
| 1 | addresses | 22 | Kullanıcı adres bilgileri |
| 2 | aktuel_products | 16 | Süpermarket aktüel ürünleri |
| 3 | campaign_applications | 11 | Kampanya başvuruları |
| 4 | campaign_banners | 14 | Kampanya bannerları |
| 5 | campaign_rules | 9 | Kampanya kuralları |
| 6 | campaigns | 26 | Ana kampanya tablosu |
| 7 | cart_item_options | 5 | Sepet ürün seçenekleri |
| 8 | cart_items | 15 | Alışveriş sepeti |
| 9 | categories | 10 | Kategori hiyerarşisi |
| 10 | commission_calculations | 12 | Komisyon hesaplamaları |
| 11 | email_confirmations | 6 | Email doğrulamaları |
| 12 | favorites | 5 | Kullanıcı favorileri |
| 13 | module_permissions | 9 | Modül izinleri |
| 14 | notifications | 11 | Sistem bildirimleri |
| 15 | order_item_options | 6 | Sipariş ürün seçenekleri |
| 16 | order_items | 12 | Sipariş kalemleri |
| 17 | orders | 25 | Ana sipariş tablosu |
| 18 | payment_methods | 9 | Ödeme yöntemleri |
| 19 | product_option_groups | 10 | Ürün seçenek grupları |
| 20 | product_options | 9 | Ürün seçenekleri |
| 21 | products | 30 | Ürün kataloğu |
| 22 | review_likes | 4 | Yorum beğenileri |
| 23 | review_responses | 9 | Mağaza yorum yanıtları |
| 24 | reviews | 18 | Değerlendirmeler |
| 25 | store_campaign_participations | 9 | Mağaza kampanya katılımları |
| 26 | store_commission_summary | 19 | Mağaza komisyon özetleri |
| 27 | stores | 34 | Mağaza bilgileri |
| 28 | user_settings | 28 | Kullanıcı ayarları |
| 29 | users | 16 | Sistem kullanıcıları |

## 🔗 Foreign Key İlişkileri Özeti

### Ana Referans Tabloları
- **users** → 15 tablo tarafından referans ediliyor
- **stores** → 10 tablo tarafından referans ediliyor  
- **orders** → 3 tablo tarafından referans ediliyor
- **products** → 5 tablo tarafından referans ediliyor

### Kritik İlişkiler
- users.store_id → stores.id (Store sahipleri)
- stores.owner_id → users.id (Mağaza sahipliği)
- orders.user_id/store_id → users.id/stores.id (Sipariş ilişkisi)
- reviews → orders.id (Sipariş bazlı değerlendirme)

---

*Bu dokümantasyon ozqsbbngkkssstmaktou Supabase projesinden Ocak 2025'te otomatik generate edilmiştir.* 
