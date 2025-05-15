# Sipariş Uygulaması Veri Modeli

Bu belge, sipariş uygulamasındaki veri modelini ve yapılan iyileştirmeleri açıklar.

## Ana Veri Modelleri

### 1. Mağaza Verileri
- **mockStores**: Tüm mağaza türleri için ortak veri modeli
- **mockRestaurants**: Yemek kategorisine özel detaylar
- **mockMarkets**: Market kategorisine özel detaylar
- **mockWaterVendors**: Su kategorisine özel detaylar

### 2. Kullanıcı ve Adres Verileri
- **mockUsers**: Kullanıcı verileri
- **mockAddresses**: Adres verileri (yeni eklendi)

### 3. Sipariş ve Ürün Verileri
- **mockOrders**: Sipariş verileri
- **mockProducts**: Ürün verileri

### 4. Kampanya ve Kategori Verileri
- **mockCampaigns**: Kampanya verileri
- **mockCategories**: Kategori verileri
- **categoryMap**: String-ID eşleşme tablosu (dönüşüm için)

## Yapılan İyileştirmeler

### 1. Veri Normalizasyonu
- Mağaza verileri için **mockStores** ana veri kaynağı olarak tanımlandı
- **mockRestaurants**, **mockMarkets** ve **mockWaterVendors** tablo kayıtları sadece ilgili kategoriye özgü alanları içerecek şekilde güncellendi
- Adres bilgileri **mockAddresses** tablosuna taşındı ve diğer tablolardaki adres bilgileri referans olarak güncellendi

### 2. İlişki Yönetimi
- E-mail tabanlı ilişkiler yerine ID tabanlı ilişkilere geçildi
- Her mağazaya bir **ownerId** eklendi ve kullanıcı-mağaza eşleştirmesi ID ile yapılıyor
- Adres tekrarı önlendi, **addressId** ile ilişkiler kuruldu
- Storename yerine **storeId** kullanılmaya başlandı
- Kategori bilgileri string yerine **categoryId** ile tanımlandı

### 3. Format Standardizasyonu
- Durum alanları **status** olarak standartlaştırıldı ('active', 'inactive', 'pending')
- isOpen kullanımı yerine status alanı kullanılıyor
- Tüm tarih alanları ISO 8601 formatında **YYYY-MM-DDThh:mm:ss**

## Veri Modeli İlişkileri

1. **Kullanıcı -> Mağaza**: Bir kullanıcı birden fazla mağaza sahibi olabilir. Mağazaların **ownerId** alanı kullanıcıya referans verir.

2. **Mağaza -> Kategori**: Her mağaza sadece bir kategoriye aittir. Mağazanın **categoryId** alanı kategoriye referans verir.

3. **Kullanıcı/Mağaza -> Adres**: Kullanıcı ve mağazalar adres bilgilerini **addressId** ile referans olarak tutar. Bir kullanıcının birden fazla adresi olabilir.

4. **Sipariş -> Ürün/Mağaza/Adres**: Siparişler, ürün, mağaza ve adres bilgilerini ID ile referans olarak tutar.

5. **Kampanya -> Mağaza**: Kampanyalar, ilgili oldukları mağazayı **storeId** ile referans olarak tutar.

## Gelecek İyileştirmeler

1. ID formatlarının standardizasyonu
2. Fiyat formatlarının standardizasyonu
3. Foreign key ilişkilerinin detaylı kontrolü
4. İzin yapısının iyileştirilmesi
5. Veri modüllerinin ayrılması
6. Veritabanı şema tasarımı

## Veri Yapısı Örneği

```javascript
// Mağaza
{
  id: 1,
  name: "Kebapçı Ahmet",
  categoryId: 1, // Yemek
  ownerId: 3, // Kullanıcı ID'si
  addressId: 1, // Adres ID'si
  status: "active",
  // ...diğer alanlar
}

// Kullanıcı 
{
  id: 3,
  name: "Ahmet Yılmaz",
  addressIds: [5, 9], // Birden fazla adres
  defaultAddressId: 5,
  favoriteCategoryId: 1, // Yemek
  // ...diğer alanlar
}

// Adres
{
  id: 1,
  userId: 3,
  title: "İş Yeri",
  // ...adres detayları
}

// Sipariş
{
  id: 1001,
  customerId: 5,
  storeId: 1,
  deliveryAddressId: 5,
  categoryId: 1, // Yemek
  // ...diğer alanlar
}

// Kampanya
{
  id: 1,
  storeId: 1,
  categoryId: 1, // Yemek
  // ...diğer alanlar
}
``` 