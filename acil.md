# Veritabanına Geçiş İçin Acil Yapılması Gerekenler

## 1. Mağaza Veri Tekrarı Sorunları

- [x] **1.1. Ana Mağaza Verisi Standardizasyonu**: mockStores ana veri olarak kullanılmalı, diğer koleksiyonlarda tekrar eden veriler kaldırılmalı
- [x] **1.2. mockRestaurants Yapısı Düzenlemesi**: Temel mağaza verilerini mockStores'dan referans almalı, sadece yemek kategorisine özgü alanları içermeli
- [x] **1.3. mockMarkets Yapısı Düzenlemesi**: Temel mağaza verilerini mockStores'dan referans almalı, sadece market kategorisine özgü alanları içermeli
- [x] **1.4. mockWaterVendors Yapısı Düzenlemesi**: Temel mağaza verilerini mockStores'dan referans almalı, sadece su kategorisine özgü alanları içermeli
- [x] **1.5. mockWaterVendors'daki ID:10 Sorunu**: mockStores'da olmayan ID:10 ile mağaza tanımı düzeltilmeli veya silinmeli

## 2. Kullanıcı-Mağaza İlişkisi Sorunları

- [x] **2.1. E-mail Tabanlı İlişki Düzeltme**: E-mail tabanlı mağaza-kullanıcı ilişkileri ID tabanlı hale getirilmeli
- [x] **2.2. Kampanya-Mağaza İlişkisi Tutarsızlığı**: Kampanya 6'da, oluşturan kişi ID:3 (Kebapçı Ahmet) ancak kampanya Lezzetli Burger (ID:6) mağazası için tanımlanmış. Bu tutarsızlık düzeltilmeli

## 3. Adres Yapısı Sorunları

- [x] **3.1. Adres Tekrarı**: Siparişlerde, kullanıcılarda ve mağazalarda tekrarlanan adres yapısı normalize edilmeli
- [x] **3.2. Adres Referansı**: Sipariş, kullanıcı ve mağaza verilerinde adres bilgisini object olarak tekrarlamak yerine adres ID'si kullanılmalı

## 4. Ürün-Mağaza İlişkisi Sorunları

- [x] **4.1. Ürün-Mağaza İsim Referansı**: Ürünlerde mağaza bilgisi isim (storeName) yerine ID (storeId) üzerinden referans verilmeli

## 5. Format Tutarsızlıkları

- [x] **5.1. Status Alanı Standardizasyonu**: Durum alanları status:'active'/'inactive'/'pending' şeklinde standartlaştırılmalı, isOpen:true/false kullanımları değiştirilmeli
- [x] **5.2. Tarih Formatı Standardizasyonu**: Tüm tarih alanları ISO 8601 formatında (YYYY-MM-DDThh:mm:ss) olmalı
- [ ] **5.3. ID Formatı Standardizasyonu**: Tüm ID'ler sayısal (number) formatta olmalı, string olan ID'ler değiştirilmeli
- [ ] **5.4. Fiyat Formatı Standardizasyonu**: Tüm fiyat bilgileri number olarak saklanmalı

## 6. Genel İyileştirmeler

- [x] **6.1. Kategori Referansları**: Kategori bilgileri string yerine ID referansı ile saklanmalı
- [ ] **6.2. Veri İlişkileri Kontrolü**: Tüm foreign key ilişkileri (storeId, categoryId vs.) karşılıklı olarak kontrol edilmeli
- [ ] **6.3. İzin (Permission) Yapısı**: Modül izinleri daha tutarlı ve kolay yönetilebilir bir yapıya getirilmeli

## 7. Mockdatas Dosya Yapısı İyileştirmeleri

- [ ] **7.1. Veri Modüllerinin Ayrılması**: mockdatas.js dosyası çok büyük, veri modüllerine göre ayrılması gerekebilir
- [x] **7.2. Veri İlişkileri Dokümantasyonu**: Veri modelleri arası ilişkiler belgelenmeli
- [ ] **7.3. Veritabanı Şema Tasarımı**: Gerçek veritabanı geçişi için şema tasarımı yapılmalı 