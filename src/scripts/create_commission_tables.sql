-- Komisyon hesaplamaları için tablolar
-- 1. Her sipariş için komisyon detayı
CREATE TABLE IF NOT EXISTS commission_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  order_total DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(order_id)
);

-- 2. Mağaza komisyon özeti (performans için)
CREATE TABLE IF NOT EXISTS store_commission_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_commission DECIMAL(12,2) DEFAULT 0,
  net_revenue DECIMAL(12,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  today_revenue DECIMAL(10,2) DEFAULT 0,
  today_commission DECIMAL(10,2) DEFAULT 0,
  today_net_revenue DECIMAL(10,2) DEFAULT 0,
  today_orders INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(store_id)
);

-- 3. İndeksler performans için
CREATE INDEX IF NOT EXISTS idx_commission_calculations_store_id ON commission_calculations(store_id);
CREATE INDEX IF NOT EXISTS idx_commission_calculations_order_id ON commission_calculations(order_id);
CREATE INDEX IF NOT EXISTS idx_commission_calculations_calculated_at ON commission_calculations(calculated_at);

-- 4. Mevcut mağazalar için özet kayıtları oluştur
INSERT INTO store_commission_summary (store_id, total_revenue, total_commission, net_revenue, total_orders)
SELECT 
  s.id as store_id,
  0 as total_revenue,
  0 as total_commission, 
  0 as net_revenue,
  0 as total_orders
FROM stores s
WHERE NOT EXISTS (
  SELECT 1 FROM store_commission_summary scs WHERE scs.store_id = s.id
);

-- 5. Trigger fonksiyonu - sipariş oluşturulduğunda komisyon hesapla
CREATE OR REPLACE FUNCTION calculate_commission_on_order()
RETURNS TRIGGER AS $$
DECLARE
  store_commission_rate DECIMAL(5,2);
  commission_amount DECIMAL(10,2);
  net_amount DECIMAL(10,2);
BEGIN
  -- Mağazanın komisyon oranını al
  SELECT commission_rate INTO store_commission_rate
  FROM stores 
  WHERE id = NEW.store_id;
  
  -- Komisyon oranı null ise 0 olarak varsay
  IF store_commission_rate IS NULL THEN
    store_commission_rate := 0;
  END IF;
  
  -- Komisyon tutarını hesapla
  commission_amount := (NEW.total * store_commission_rate) / 100;
  net_amount := NEW.total - commission_amount;
  
  -- Komisyon kaydını oluştur
  INSERT INTO commission_calculations (
    order_id, 
    store_id, 
    order_total, 
    commission_rate, 
    commission_amount, 
    net_amount
  ) VALUES (
    NEW.id,
    NEW.store_id,
    NEW.total,
    store_commission_rate,
    commission_amount,
    net_amount
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger oluştur
DROP TRIGGER IF EXISTS trigger_calculate_commission ON orders;
CREATE TRIGGER trigger_calculate_commission
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_commission_on_order();

-- 7. Özet tabloyu güncelleyen fonksiyon
CREATE OR REPLACE FUNCTION update_store_commission_summary(target_store_id UUID)
RETURNS VOID AS $$
DECLARE
  total_rev DECIMAL(12,2);
  total_comm DECIMAL(12,2);
  total_net DECIMAL(12,2);
  total_ord INTEGER;
  today_rev DECIMAL(10,2);
  today_comm DECIMAL(10,2);
  today_net DECIMAL(10,2);
  today_ord INTEGER;
BEGIN
  -- Toplam hesaplamalar
  SELECT 
    COALESCE(SUM(order_total), 0),
    COALESCE(SUM(commission_amount), 0),
    COALESCE(SUM(net_amount), 0),
    COUNT(*)
  INTO total_rev, total_comm, total_net, total_ord
  FROM commission_calculations 
  WHERE store_id = target_store_id;
  
  -- Bugünkü hesaplamalar
  SELECT 
    COALESCE(SUM(cc.order_total), 0),
    COALESCE(SUM(cc.commission_amount), 0),
    COALESCE(SUM(cc.net_amount), 0),
    COUNT(*)
  INTO today_rev, today_comm, today_net, today_ord
  FROM commission_calculations cc
  JOIN orders o ON cc.order_id = o.id
  WHERE cc.store_id = target_store_id 
    AND DATE(o.order_date) = CURRENT_DATE;
  
  -- Özet tabloyu güncelle
  INSERT INTO store_commission_summary (
    store_id, total_revenue, total_commission, net_revenue, total_orders,
    today_revenue, today_commission, today_net_revenue, today_orders, last_updated
  ) VALUES (
    target_store_id, total_rev, total_comm, total_net, total_ord,
    today_rev, today_comm, today_net, today_ord, NOW()
  )
  ON CONFLICT (store_id) DO UPDATE SET
    total_revenue = EXCLUDED.total_revenue,
    total_commission = EXCLUDED.total_commission,
    net_revenue = EXCLUDED.net_revenue,
    total_orders = EXCLUDED.total_orders,
    today_revenue = EXCLUDED.today_revenue,
    today_commission = EXCLUDED.today_commission,
    today_net_revenue = EXCLUDED.today_net_revenue,
    today_orders = EXCLUDED.today_orders,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql; 