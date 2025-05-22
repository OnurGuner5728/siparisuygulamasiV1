# Mock Verilerden Supabase'e Geçiş Rehberi

Bu rehber, uygulamanızı mock veri kullanımından Supabase veritabanı entegrasyonuna geçirme sürecini adım adım açıklar.

## Ön Koşullar

1. Supabase projeniz kurulmuş olmalıdır
2. `.env.local` dosyanızda doğru Supabase bağlantı bilgileri bulunmalıdır
3. `supabase.js` ve `supabaseApi.js` dosyalarınız hazır olmalıdır
4. `dataMigration.js` aracılığıyla veriler Supabase'e aktarılmış olmalıdır

## Adım 1: API Hizmetini Oluşturun

Uygulama genelinde kullanılacak olan `api.js` dosyasını aşağıdaki gibi oluşturun:

```javascript
// src/lib/api.js
import * as supabaseApi from './supabaseApi';
import supabase from './supabase';

// Burada tüm veri erişim fonksiyonlarınız olacak
// Örnek: getStores, getProducts, getOrders, vb.
```

Bu dosyada, uygulamanızın mock veriler yerine kullanacağı tüm veri erişim fonksiyonlarını tanımlayın.

## Adım 2: Her Sayfayı Güncelleyin

Uygulamanızdaki her sayfayı Supabase entegrasyonu için güncelleyin:

1. Mock veri importlarını kaldırın:
   ```javascript
   // Eski
   import { mockStores, mockProducts } from '@/app/data/mockdatas';
   
   // Yeni
   import api from '@/lib/api';
   ```

2. Veri yükleme fonksiyonlarını async/await ile güncelleyin:
   ```javascript
   // Eski
   useEffect(() => {
     const filteredStores = mockStores.filter(...);
     setStores(filteredStores);
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

3. Veri yapısı değişikliklerini kontrol edin:
   - `storeId` → `store_id`
   - `isOpen` → `is_open`
   - `minOrder` → `min_order`
   - vb.

## Adım 3: Eksik API Fonksiyonlarını Ekleyin

`supabaseApi.js` dosyasında olmayan ancak uygulamanız için gerekli olan tüm API fonksiyonlarını ekleyin:

```javascript
// src/lib/supabaseApi.js

// Eksik fonksiyonları ekleyin
export const getProductReviews = async (productId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:users(name, avatar)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};
```

## Adım 4: Sayfa Sayfa Test Edin

1. Her sayfayı teker teker Supabase entegrasyonu için güncelleyin
2. Her güncelleme sonrası sayfayı test edin
3. Hataları giderin
4. Tüm özellikler doğru çalışana kadar devam edin

## Adım 5: Mock Veri Dosyalarını Temizleyin

Uygulama tam olarak Supabase ile çalıştığında:

1. `src/app/data/mockdatas.js` dosyasını kaldırın veya `_mockdatas.js.bak` olarak yeniden adlandırın
2. Tüm referansları kaldırdığınızdan emin olun

## Örnek Dönüşüm: Yemek Sayfası

Örnek olarak, yemek sayfasının dönüşümünü inceleyebilirsiniz:

```javascript
// src/app/yemek/page.js

// Eski
import { mockStores, mockCampaigns } from '@/app/data/mockdatas';

// Yeni
import api from '@/lib/api';

// Eski veri yükleme
useEffect(() => {
  const yemekStores = mockStores.filter(store => 
    store.modulePermissions?.yemek === true && 
    store.status === 'active'
  );
  setRestaurants(yemekStores);
}, []);

// Yeni veri yükleme
useEffect(() => {
  async function fetchData() {
    try {
      const storesData = await api.getStores({ category: 1 });
      const yemekStores = storesData.filter(store => 
        store.status === 'active'
      );
      setRestaurants(yemekStores);
      
      const campaignsData = await api.getCampaigns();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    }
  }
  fetchData();
}, []);
```

## Sorun Giderme

- **Veri Gelmiyor**: Supabase bağlantı bilgilerinizi kontrol edin
- **Hata Mesajları**: Konsol hatalarını inceleyerek sorunları belirleyin
- **RLS Politikaları**: Supabase'de Row Level Security politikalarınızı kontrol edin
- **Veri Yapısı**: Tablo adları, sütun adları ve ilişkileri kontrol edin

Bu rehberi takip ederek, uygulamanızı adım adım mock verilerden gerçek bir Supabase backend'ine geçirebilirsiniz. 