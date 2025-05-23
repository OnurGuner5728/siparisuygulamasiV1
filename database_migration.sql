-- easysiparis - Eksik Tabloları Oluşturma SQL Komutları
-- Bu dosya Supabase SQL Editor'de çalıştırılacak

-- 1. NOTIFICATIONS TABLOSU
-- Kullanıcı bildirimleri için tablo
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'system',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications tablosu için indexler
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_store_id ON public.notifications(store_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Notifications tablosu için RLS (Row Level Security) politikaları
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi bildirimlerini görebilir
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar kendi bildirimlerini güncelleyebilir (okundu işaretleme)
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Kullanıcılar kendi bildirimlerini silebilir
CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Sistem ve adminler tüm bildirimleri oluşturabilir
CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'system')
        )
    );

-- 2. COMMISSION_CALCULATIONS TABLOSU
-- Komisyon hesaplamaları için tablo
CREATE TABLE IF NOT EXISTS public.commission_calculations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    order_total DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commission calculations tablosu için indexler
CREATE INDEX IF NOT EXISTS idx_commission_calculations_order_id ON public.commission_calculations(order_id);
CREATE INDEX IF NOT EXISTS idx_commission_calculations_store_id ON public.commission_calculations(store_id);
CREATE INDEX IF NOT EXISTS idx_commission_calculations_calculated_at ON public.commission_calculations(calculated_at DESC);

-- 3. STORE_COMMISSION_SUMMARY TABLOSU
-- Mağaza komisyon özetleri için tablo
CREATE TABLE IF NOT EXISTS public.store_commission_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE UNIQUE,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    total_commission DECIMAL(12,2) DEFAULT 0.00,
    total_net_amount DECIMAL(12,2) DEFAULT 0.00,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store commission summary tablosu için indexler
CREATE INDEX IF NOT EXISTS idx_store_commission_summary_store_id ON public.store_commission_summary(store_id);
CREATE INDEX IF NOT EXISTS idx_store_commission_summary_last_updated ON public.store_commission_summary(last_updated DESC);

-- 4. STORES TABLOSUNA EKSİK ALANLAR EKLEME
-- Commission rate alanı yoksa ekle
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 10.00;

-- Delivery time estimation alanı yoksa ekle  
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS delivery_time_estimation VARCHAR(50) DEFAULT '30-45 dk';

-- Tags alanı yoksa ekle (su markaları için)
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Cover image URL alanı yoksa ekle
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- 5. REVIEWS TABLOSUNA EKSİK ALANLAR EKLEME
-- Helpful count alanı yoksa ekle
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;

-- Is verified purchase alanı yoksa ekle
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT FALSE;

-- Order ID alanı yoksa ekle
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL;

-- 6. ORDERS TABLOSUNA EKSİK ALANLAR EKLEME
-- Payment status alanı yoksa ekle
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';

-- Discount alanı yoksa ekle
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2) DEFAULT 0.00;

-- Delivery note alanı yoksa ekle
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_note TEXT;

-- Estimated delivery alanı yoksa ekle
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMP WITH TIME ZONE;

-- 7. ORDER_ITEMS TABLOSUNA EKSİK ALANLAR EKLEME
-- Notes alanı yoksa ekle
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Name alanı yoksa ekle (ürün adını kaydeder)
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Total alanı yoksa ekle
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS total DECIMAL(10,2);

-- 8. PRODUCTS TABLOSUNA EKSİK ALANLAR EKLEME
-- Rating alanı yoksa ekle
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00;

-- Review count alanı yoksa ekle
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 9. USERS TABLOSUNA EKSİK ALANLAR EKLEME
-- Avatar URL alanı yoksa ekle
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Store ID alanı yoksa ekle (mağaza sahipleri için)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL;

-- 10. REAL-TIME SUBSCRIPTIONS İÇİN GEREKLİ FONKSIYONLAR
-- Updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tüm tablolar için updated_at trigger'ları
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_commission_summary_updated_at ON public.store_commission_summary;
CREATE TRIGGER update_store_commission_summary_updated_at
    BEFORE UPDATE ON public.store_commission_summary
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 11. COMMISSION HESAPLAMA FONKSIYONU
CREATE OR REPLACE FUNCTION public.update_store_commission_summary(target_store_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.store_commission_summary (
        store_id,
        total_orders,
        total_revenue,
        total_commission,
        total_net_amount,
        last_updated
    )
    SELECT 
        target_store_id,
        COALESCE(COUNT(cc.id), 0),
        COALESCE(SUM(cc.order_total), 0),
        COALESCE(SUM(cc.commission_amount), 0),
        COALESCE(SUM(cc.net_amount), 0),
        NOW()
    FROM public.commission_calculations cc
    WHERE cc.store_id = target_store_id
    ON CONFLICT (store_id) 
    DO UPDATE SET
        total_orders = EXCLUDED.total_orders,
        total_revenue = EXCLUDED.total_revenue,
        total_commission = EXCLUDED.total_commission,
        total_net_amount = EXCLUDED.total_net_amount,
        last_updated = EXCLUDED.last_updated;
END;
$$ LANGUAGE plpgsql;

-- 12. REAL-TIME İÇİN PUBLICATION OLUŞTURMA
-- Tüm tablolar için real-time etkinleştir
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commission_calculations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_commission_summary;

-- Mevcut tablolar için de real-time etkinleştir
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stores;

-- Bu komutları Supabase SQL Editor'de sırayla çalıştırın
-- Ardından Settings > API > Real-time bölümünden tablolar için real-time'ı aktifleştirin 