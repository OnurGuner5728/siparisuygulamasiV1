# 🏦 Komisyon Sistemi Kurulum Rehberi

## 📋 Özet
Bu sistem, her sipariş için otomatik komisyon hesaplaması yapar ve veritabanında saklar. Performans için özet tablolar kullanır.

## 🗄️ Database Kurulumu

### 1. Tabloları Oluştur
```bash
# Supabase SQL Editor'da çalıştır:
psql -f src/scripts/create_commission_tables.sql
```

### 2. Mevcut Siparişleri Migrate Et
```bash
# Sadece bir kez çalıştır:
psql -f src/scripts/migrate_existing_orders.sql
```

## 🔧 Özellikler

### ✅ Otomatik Komisyon Hesaplama
- Her yeni sipariş için trigger devreye girer
- Komisyon oranı stores tablosundan alınır
- commission_calculations tablosuna kayıt eklenir

### ✅ Performans Optimizasyonu
- store_commission_summary özet tablosu
- Günlük ve toplam veriler ayrı tutulur
- İndeksler ile hızlı sorgular

### ✅ Veri Bütünlüğü
- Foreign key constraints
- Unique constraints (order_id)
- COALESCE ile null safety

## 📊 Tablolar

### commission_calculations
```sql
- id: UUID (Primary Key)
- order_id: UUID (Foreign Key → orders.id)
- store_id: UUID (Foreign Key → stores.id)
- order_total: DECIMAL(10,2)
- commission_rate: DECIMAL(5,2)
- commission_amount: DECIMAL(10,2)
- net_amount: DECIMAL(10,2)
- calculated_at: TIMESTAMP
```

### store_commission_summary
```sql
- id: UUID (Primary Key)
- store_id: UUID (Foreign Key → stores.id)
- total_revenue: DECIMAL(12,2)
- total_commission: DECIMAL(12,2)
- net_revenue: DECIMAL(12,2)
- total_orders: INTEGER
- today_revenue: DECIMAL(10,2)
- today_commission: DECIMAL(10,2)
- today_net_revenue: DECIMAL(10,2)
- today_orders: INTEGER
- last_updated: TIMESTAMP
```

## 🚀 API Fonksiyonları

### getStoreCommissionSummary(storeId)
Mağaza komisyon özetini getirir.

### getCommissionCalculations(filters)
Komisyon hesaplama detaylarını getirir.

### updateStoreCommissionSummary(storeId)
Özet tabloyu manuel günceller.

## 💡 Kullanım

### Mağaza Paneli
- Otomatik olarak database'den veri çeker
- Fallback: Eski hesaplama yöntemi
- Gerçek zamanlı günlük veriler

### Admin Paneli
- Tüm mağaza komisyon özetleri
- Detaylı finansal raporlar
- Komisyon takibi

## ⚠️ Önemli Notlar

1. **Migration**: `migrate_existing_orders.sql` sadece bir kez çalıştırın
2. **Performance**: Günlük job ile summary tablolarını güncelleyin
3. **Backup**: Değişiklik öncesi database backup alın
4. **Testing**: Test ortamında önce deneyin

## 🔄 Maintenance

### Günlük Summary Güncelleme
```sql
-- Tüm mağazalar için
DO $$
DECLARE store_record RECORD;
BEGIN
  FOR store_record IN SELECT id FROM stores LOOP
    PERFORM update_store_commission_summary(store_record.id);
  END LOOP;
END $$;
```

### Performans İzleme
```sql
-- En çok komisyon alan mağazalar
SELECT s.name, scs.total_commission, scs.total_orders
FROM store_commission_summary scs
JOIN stores s ON scs.store_id = s.id
ORDER BY scs.total_commission DESC
LIMIT 10;
```

## 🐛 Troubleshooting

### Trigger Çalışmıyorsa
```sql
-- Trigger'ı yeniden oluştur
DROP TRIGGER IF EXISTS trigger_calculate_commission ON orders;
CREATE TRIGGER trigger_calculate_commission
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_commission_on_order();
```

### Summary Güncel Değilse
```sql
-- Belirli mağaza için güncelle
SELECT update_store_commission_summary('store-id-here');
``` 