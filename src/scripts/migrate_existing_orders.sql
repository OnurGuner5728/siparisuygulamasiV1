-- Mevcut siparişler için komisyon hesaplamalarını oluştur
-- Bu script sadece bir kez çalıştırılmalıdır

INSERT INTO commission_calculations (order_id, store_id, order_total, commission_rate, commission_amount, net_amount, calculated_at)
SELECT 
  o.id as order_id,
  o.store_id,
  o.total as order_total,
  COALESCE(s.commission_rate, 0) as commission_rate,
  (o.total * COALESCE(s.commission_rate, 0)) / 100 as commission_amount,
  o.total - ((o.total * COALESCE(s.commission_rate, 0)) / 100) as net_amount,
  o.created_at as calculated_at
FROM orders o
JOIN stores s ON o.store_id = s.id
WHERE NOT EXISTS (
  SELECT 1 FROM commission_calculations cc WHERE cc.order_id = o.id
);

-- Tüm mağazalar için komisyon özetlerini güncelle
DO $$
DECLARE
  store_record RECORD;
BEGIN
  FOR store_record IN SELECT id FROM stores LOOP
    PERFORM update_store_commission_summary(store_record.id);
  END LOOP;
END $$; 