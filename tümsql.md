-- Supabase Veritabanı Kurulumu
-- Aşağıdaki SQL betiği, sipariş uygulaması için tüm tabloları, ilişkileri, RLS politikalarını ve örnek verileri içerir

-- ===============================================
-- SCHEMA TANIMLAMALARI
-- ===============================================

-- Public şeması sıfırlama (dikkatli kullanın, varolan verileri siler)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

COMMENT ON SCHEMA public IS 'Sipariş Uygulaması Veritabanı';

-- ===============================================
-- EXTENSION TANIMLAMALARI
-- ===============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ===============================================
-- TABLOLAR
-- ===============================================

-- USERS TABLOSU
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    name TEXT,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'store', 'courier')) DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CATEGORIES TABLOSU
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STORES TABLOSU
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    subcategories INTEGER[] DEFAULT '{}',
    logo TEXT,
    cover_image TEXT,
    rating NUMERIC(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    description TEXT,
    type TEXT,
    tags TEXT[] DEFAULT '{}',
    is_approved BOOLEAN DEFAULT FALSE,
    is_open BOOLEAN DEFAULT TRUE,
    min_order_amount NUMERIC(10,2) DEFAULT 0,
    delivery_time_estimation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STORE_WORKING_HOURS TABLOSU
CREATE TABLE store_working_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    opening_time TIME WITHOUT TIME ZONE,
    closing_time TIME WITHOUT TIME ZONE,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, day_of_week)
);

-- PRODUCTS TABLOSU
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    image TEXT,
    category TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ADDRESSES TABLOSU
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT,
    full_name TEXT,
    phone TEXT,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    neighborhood TEXT,
    full_address TEXT NOT NULL,
    postal_code TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ORDERS TABLOSU
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_date TIMESTAMP WITH TIME ZONE,
    subtotal NUMERIC(10,2) NOT NULL,
    delivery_fee NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    discount NUMERIC(10,2) DEFAULT 0,
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'credit_card', 'wallet')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    delivery_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    status_history JSONB DEFAULT '[]',
    courier_id UUID REFERENCES users(id) ON DELETE SET NULL,
    courier_name TEXT,
    courier_phone TEXT,
    courier_photo TEXT,
    courier_location JSONB,
    courier_rating NUMERIC(3,2),
    estimated_delivery TEXT,
    delivery_coordinates JSONB,
    delivery_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ORDER_ITEMS TABLOSU
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CART_ITEMS TABLOSU
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    image TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- CAMPAIGNS TABLOSU
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    discount NUMERIC(10,2) NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    min_order_amount NUMERIC(10,2) DEFAULT 0,
    max_discount_amount NUMERIC(10,2),
    code TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    usage INTEGER DEFAULT 0,
    max_usage INTEGER,
    main_category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- REVIEWS TABLOSU
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AKTUEL_PRODUCTS TABLOSU (Aktüel Ürünler)
CREATE TABLE aktuel_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    original_price NUMERIC(10,2) NOT NULL,
    discount_price NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    category TEXT,
    features TEXT[],
    stock INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    related_product_ids UUID[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- INDEX TANIMLAMALARI (Performans için)
-- ===============================================

-- Genel İndeksler
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_stores_category_id ON stores(category_id);
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_reviews_store_id ON reviews(store_id);
CREATE INDEX idx_campaigns_store_id ON campaigns(store_id);
CREATE INDEX idx_campaigns_code ON campaigns(code);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_store_working_hours_store_id ON store_working_hours(store_id);

-- Full-text Arama İndeksleri
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX idx_stores_name_trgm ON stores USING gin (name gin_trgm_ops);
CREATE INDEX idx_categories_name_trgm ON categories USING gin (name gin_trgm_ops);

-- ===============================================
-- TRİGGER FONKSİYONLARI
-- ===============================================

-- Güncelleme zamanını otomatik güncelleyen trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger tanımlamaları
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_stores_updated_at
BEFORE UPDATE ON stores
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_addresses_updated_at
BEFORE UPDATE ON addresses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_cart_items_updated_at
BEFORE UPDATE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_campaigns_updated_at
BEFORE UPDATE ON campaigns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_store_working_hours_updated_at
BEFORE UPDATE ON store_working_hours
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_aktuel_products_updated_at
BEFORE UPDATE ON aktuel_products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Sipariş durum geçmişini güncelleyen trigger
CREATE OR REPLACE FUNCTION update_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        NEW.status_history = 
            (NEW.status_history::jsonb || 
             jsonb_build_object(
                'status', NEW.status, 
                'timestamp', EXTRACT(EPOCH FROM NOW())
             )
            );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_status_history_trigger
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_order_status_history();

-- Mağaza rating ortalamasını güncelleyen trigger
CREATE OR REPLACE FUNCTION update_store_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating NUMERIC;
    count_reviews INTEGER;
BEGIN
    SELECT COUNT(*), COALESCE(AVG(rating), 0)
    INTO count_reviews, avg_rating
    FROM reviews
    WHERE store_id = NEW.store_id;
    
    UPDATE stores
    SET rating = avg_rating, review_count = count_reviews
    WHERE id = NEW.store_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER store_rating_update_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_store_rating();

-- ===============================================
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ===============================================

-- RLS'yi tüm tablolar için etkinleştir
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE aktuel_products ENABLE ROW LEVEL SECURITY;

-- Admin her şeyi yapabilir politikası
CREATE POLICY admin_all_policy ON users FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_policy ON stores FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_policy ON products FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_policy ON addresses FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_policy ON orders FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_policy ON order_items FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_policy ON cart_items FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_policy ON campaigns FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_policy ON reviews FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_policy ON categories FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_policy ON store_working_hours FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_policy ON aktuel_products FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

-- Kullanıcılar kendi verileri için politikalar
CREATE POLICY users_self_select ON users FOR SELECT USING (true);
CREATE POLICY users_self_update ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY users_address_select ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY users_address_insert ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY users_address_update ON addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY users_address_delete ON addresses FOR DELETE USING (auth.uid() = user_id);

-- Mağaza sahipleri politikaları
CREATE POLICY store_owners_select ON stores FOR SELECT USING (true);
CREATE POLICY store_owners_update ON stores FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY store_owners_products_select ON products FOR SELECT USING (true);
CREATE POLICY store_owners_products_insert ON products FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
);
CREATE POLICY store_owners_products_update ON products FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
);
CREATE POLICY store_owners_products_delete ON products FOR DELETE USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
);

-- Sepet politikaları
CREATE POLICY cart_select ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY cart_insert ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY cart_update ON cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY cart_delete ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- Sipariş politikaları
CREATE POLICY orders_select ON orders FOR SELECT USING (
    auth.uid() = customer_id OR 
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid()) OR
    auth.uid() = courier_id
);
CREATE POLICY orders_insert ON orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY orders_items_select ON order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE id = order_id AND (
            customer_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM stores WHERE id = orders.store_id AND owner_id = auth.uid()) OR
            courier_id = auth.uid()
        )
    )
);

-- Kategori politikaları
CREATE POLICY categories_select ON categories FOR SELECT USING (true);

-- Kampanya politikaları
CREATE POLICY campaigns_select ON campaigns FOR SELECT USING (true);

-- İnceleme politikaları
CREATE POLICY reviews_select ON reviews FOR SELECT USING (true);
CREATE POLICY reviews_insert ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY reviews_update ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY reviews_delete ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Çalışma saatleri politikaları
CREATE POLICY store_hours_select ON store_working_hours FOR SELECT USING (true);
CREATE POLICY store_hours_update ON store_working_hours FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
);

-- Aktüel ürünler politikaları
CREATE POLICY aktuel_products_select ON aktuel_products FOR SELECT USING (true);

-- ===============================================
-- ÖRNEK VERİLER (MOCK DATA)
-- ===============================================

-- Kategoriler
INSERT INTO categories (id, name, slug, parent_id) VALUES
(1, 'Yemek', 'yemek', NULL),
(2, 'Market', 'market', NULL),
(3, 'Su', 'su', NULL),
(4, 'Çiçek', 'cicek', NULL),
(5, 'Fast Food', 'fast-food', 1),
(6, 'Kebap', 'kebap', 1),
(7, 'Pizza', 'pizza', 1),
(8, 'Tatlı', 'tatli', 1),
(9, 'Kahvaltı', 'kahvalti', 1),
(10, 'Bakkal', 'bakkal', 2),
(11, 'Şarküteri', 'sarkuteri', 2),
(12, 'Manav', 'manav', 2),
(13, 'Damacana Su', 'damacana-su', 3),
(14, 'Pet Şişe Su', 'pet-sise-su', 3),
(15, 'Buket', 'buket', 4),
(16, 'Saksı Çiçeği', 'saksi-cicegi', 4),
(17, 'Aranjman', 'aranjman', 4);


-- Kullanıcılar
INSERT INTO users (id, email, first_name, last_name, name, phone, role, avatar_url) VALUES
('ca7716d0-10f0-4bce-a633-3c122d8fe14d', 'mehmet@example.com', 'Mehmet', 'Kaya', 'Mehmet Kaya', '0555 666 7788', 'user', NULL),
('31ad2b07-9c5c-4aab-a0de-35caa5f6c579', 'ayse@example.com', 'Ayşe', 'Demir', 'Ayşe Demir', '0533 555 6677', 'user', NULL),
('466a69be-6ce1-43c8-bc7f-070b6c791a00', 'kelapo@example.com', 'Kelapo', 'Ahmet', 'Kelapo Ahmet', '0552 333 4455', 'store', NULL),
('52fa642c-b3d9-4ac9-9a54-4bc94dc77900', 'durum@example.com', 'Yiğit', 'Yılmaz', 'Yiğit Yılmaz', '0544 222 3344', 'user', NULL),
('5067dd4c-d764-43ae-a97f-380a190d3b64', 'onurguner.06@gmail.com', 'Onur', 'Güner', 'Onur Güner', '05539562003', 'admin', NULL),
('76ba313e-c390-4b24-a12f-f6fc8a9ff7d0', 'market@example.com', 'Market', 'B', 'Market B', '0556 000 1122', 'store', NULL),
('8f4c33a0-5b5a-4698-a00d-c00d61798220', 'admin@example.com', 'Admin', 'Kullanıcı', 'Admin Kullanıcı', '0533 222 3344', 'admin', NULL),
('9c1e98d0-2a07-4000-a55a-aefaadaf3122', 'ahmet@example.com', 'Ahmet', 'Yılmaz', 'Ahmet Yılmaz', '0555 111 2233', 'user', NULL),
('a28c1182-2a65-4aa6-a57c-c7a0771401e0', 'zeynep@example.com', 'Zeynep', 'Şahin', 'Zeynep Şahin', '0533 777 8899', 'user', NULL),
('c7d444a0-096f-431c-ac0f-696bc07a8990', 'store@example.com', 'Yeni', 'Mağaza', 'Yeni Mağaza', '0544 444 5566', 'store', NULL),
('d63237b0-75f0-4ec5-a335-ef2e9ca57370', 'restoran@example.com', 'Restoran', 'A', 'Restoran A', '0555 999 0011', 'store', NULL),
('fc5da590-253b-4cfa-ac65-b942d2824ea1', 'gizem@example.com', 'Gizem', 'Öztürk', 'Gizem Öztürk', '0537 111 2233', 'user', NULL);

-- Mağazalar
INSERT INTO stores (id, owner_id, name, email, phone, address, category_id, logo, cover_image, rating, review_count, status, description, is_approved, is_open, min_order_amount, delivery_time_estimation) VALUES
('1a2b3c4d-1234-5678-abcd-1234567890ab', '466a69be-6ce1-43c8-bc7f-070b6c791a00', 'Kelapo Kebap', 'kelapo@example.com', '0552 333 4455', 'Atatürk Mah. Cumhuriyet Cad. No: 123, Ankara', 6, 'https://example.com/logos/kelapo.jpg', 'https://example.com/covers/kelapo.jpg', 4.5, 24, 'active', 'En lezzetli kebap çeşitleri', TRUE, TRUE, 50.00, '30-45 dk'),
('2c3d4e5f-2345-6789-bcde-2345678901bc', '76ba313e-c390-4b24-a12f-f6fc8a9ff7d0', 'Market B', 'market@example.com', '0556 000 1122', 'Bahçelievler Mah. 7. Cadde No: 45, İstanbul', 10, 'https://example.com/logos/marketb.jpg', 'https://example.com/covers/marketb.jpg', 4.2, 18, 'active', 'Geniş ürün yelpazesi ile hizmetinizdeyiz', TRUE, TRUE, 30.00, '20-30 dk'),
('3d4e5f60-3456-789a-cdef-3456789012cd', 'd63237b0-75f0-4ec5-a335-ef2e9ca57370', 'Restoran A', 'restoran@example.com', '0555 999 0011', 'Çankaya Mah. Tunalı Hilmi Cad. No: 78, Ankara', 5, 'https://example.com/logos/restorana.jpg', 'https://example.com/covers/restorana.jpg', 4.7, 36, 'active', 'Fast food lezzetleri', TRUE, TRUE, 40.00, '25-40 dk'),
('f3217a4e-90d4-4372-91e7-3b28de542a18', 'c7d444a0-096f-431c-ac0f-696bc07a8990', 'Su Dünyası', 'su@example.com', '0544 444 5566', 'Keçiören Mah. İvedik Cad. No: 56, Ankara', 13, 'https://example.com/logos/sudunyasi.jpg', 'https://example.com/covers/sudunyasi.jpg', 4.0, 12, 'active', 'Kaliteli su markaları', TRUE, TRUE, 20.00, '15-25 dk');

-- Mağaza Çalışma Saatleri
INSERT INTO store_working_hours (store_id, day_of_week, opening_time, closing_time, is_closed) VALUES
('1a2b3c4d-1234-5678-abcd-1234567890ab', 'Monday', '09:00', '22:00', FALSE),
('1a2b3c4d-1234-5678-abcd-1234567890ab', 'Tuesday', '09:00', '22:00', FALSE),
('1a2b3c4d-1234-5678-abcd-1234567890ab', 'Wednesday', '09:00', '22:00', FALSE),
('1a2b3c4d-1234-5678-abcd-1234567890ab', 'Thursday', '09:00', '22:00', FALSE),
('1a2b3c4d-1234-5678-abcd-1234567890ab', 'Friday', '09:00', '23:00', FALSE),
('1a2b3c4d-1234-5678-abcd-1234567890ab', 'Saturday', '10:00', '23:00', FALSE),
('1a2b3c4d-1234-5678-abcd-1234567890ab', 'Sunday', '10:00', '22:00', FALSE),
('2c3d4e5f-2345-6789-bcde-2345678901bc', 'Monday', '08:00', '21:00', FALSE),
('2c3d4e5f-2345-6789-bcde-2345678901bc', 'Tuesday', '08:00', '21:00', FALSE),
('2c3d4e5f-2345-6789-bcde-2345678901bc', 'Wednesday', '08:00', '21:00', FALSE),
('2c3d4e5f-2345-6789-bcde-2345678901bc', 'Thursday', '08:00', '21:00', FALSE),
('2c3d4e5f-2345-6789-bcde-2345678901bc', 'Friday', '08:00', '21:00', FALSE),
('2c3d4e5f-2345-6789-bcde-2345678901bc', 'Saturday', '09:00', '21:00', FALSE),
('2c3d4e5f-2345-6789-bcde-2345678901bc', 'Sunday', '09:00', '20:00', FALSE);

-- Ürünler
INSERT INTO products (id, store_id, name, description, price, image, category, is_available) VALUES
('1a1a1a1a-1111-1111-1111-111111111111', '1a2b3c4d-1234-5678-abcd-1234567890ab', 'Adana Kebap', 'Lezzetli zırh kıyma kebabı', 120.00, 'https://example.com/products/adana.jpg', 'Kebap', TRUE),
('2b2b2b2b-2222-2222-2222-222222222222', '1a2b3c4d-1234-5678-abcd-1234567890ab', 'Urfa Kebap', 'Acısız zırh kıyma kebabı', 110.00, 'https://example.com/products/urfa.jpg', 'Kebap', TRUE),
('3c3c3c3c-3333-3333-3333-333333333333', '1a2b3c4d-1234-5678-abcd-1234567890ab', 'İskender Kebap', 'Döner, yoğurt ve tereyağlı sos ile', 150.00, 'https://example.com/products/iskender.jpg', 'Kebap', TRUE),
('4d4d4d4d-4444-4444-4444-444444444444', '2c3d4e5f-2345-6789-bcde-2345678901bc', 'Ekmek', 'Günlük taze', 5.00, 'https://example.com/products/ekmek.jpg', 'Temel Gıda', TRUE),
('5e5e5e5e-5555-5555-5555-555555555555', '2c3d4e5f-2345-6789-bcde-2345678901bc', 'Süt', '1 litre günlük', 15.00, 'https://example.com/products/sut.jpg', 'Süt Ürünleri', TRUE),
('6f6f6f6f-6666-6666-6666-666666666666', '3d4e5f60-3456-789a-cdef-3456789012cd', 'Hamburger', 'Dana eti, cheddar peyniri, özel sos', 90.00, 'https://example.com/products/hamburger.jpg', 'Fast Food', TRUE),
('7a7a7a7a-7777-7777-7777-777777777777', '3d4e5f60-3456-789a-cdef-3456789012cd', 'Pizza', 'Karışık malzemeli', 120.00, 'https://example.com/products/pizza.jpg', 'Fast Food', TRUE),
('8a8a8a8a-8888-8888-8888-888888888888', 'f3217a4e-90d4-4372-91e7-3b28de542a18', 'Damacana Su', '19 litre', 25.00, 'https://example.com/products/damacana.jpg', 'Su', TRUE),
('9a9a9a9a-9999-9999-9999-999999999999', 'f3217a4e-90d4-4372-91e7-3b28de542a18', 'Pet Şişe Su', '0.5 litre x 12 adet', 40.00, 'https://example.com/products/pet-sise.jpg', 'Su', TRUE);

-- Adresler
INSERT INTO addresses (id, user_id, title, type, full_name, phone, city, district, neighborhood, full_address, postal_code, is_default) VALUES
('aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'ca7716d0-10f0-4bce-a633-3c122d8fe14d', 'Ev', 'home', 'Mehmet Kaya', '0555 666 7788', 'Ankara', 'Çankaya', 'Bahçelievler', 'Bahçelievler Mah. 7. Cad. No: 5 D: 10', '06500', TRUE),
('bbbb2222-bbbb-2222-bbbb-2222bbbb2222', '31ad2b07-9c5c-4aab-a0de-35caa5f6c579', 'İş', 'work', 'Ayşe Demir', '0533 555 6677', 'İstanbul', 'Kadıköy', 'Caferağa', 'Caferağa Mah. Moda Cad. No: 123 Kat: 4', '34710', TRUE),
('cccc3333-cccc-3333-cccc-3333cccc3333', '9c1e98d0-2a07-4000-a55a-aefaadaf3122', 'Ev', 'home', 'Ahmet Yılmaz', '0555 111 2233', 'İzmir', 'Konak', 'Alsancak', 'Alsancak Mah. Kıbrıs Şehitleri Cad. No: 45 D: 8', '35220', TRUE),
('dddd4444-dddd-4444-dddd-4444dddd4444', '5067dd4c-d764-43ae-a97f-380a190d3b64', 'Ev', 'home', 'Onur Güner', '05539562003', 'Ankara', 'Keçiören', 'Etlik', 'Etlik Mah. Ayvalı Cad. No: 67 D: 15', '06010', TRUE);

-- Kampanyalar
INSERT INTO campaigns (id, title, description, store_id, created_by, start_date, end_date, discount, discount_type, min_order_amount, max_discount_amount, code, status, main_category_id, image_url) VALUES
('aaaabbbb-cccc-dddd-1111-111111111111', 'Yeni Üye İndirimi', 'Yeni üyelere özel %20 indirim', NULL, '8f4c33a0-5b5a-4698-a00d-c00d61798220', NOW(), NOW() + INTERVAL '30 days', 20.00, 'percentage', 50.00, 100.00, 'NEWUSER20', 'active', NULL, 'https://example.com/campaigns/newuser.jpg'),
('bbbbcccc-dddd-eeee-2222-222222222222', 'Kebap Festivali', 'Tüm kebap çeşitlerinde %15 indirim', '1a2b3c4d-1234-5678-abcd-1234567890ab', '466a69be-6ce1-43c8-bc7f-070b6c791a00', NOW(), NOW() + INTERVAL '14 days', 15.00, 'percentage', 100.00, 50.00, 'KEBAP15', 'active', 6, 'https://example.com/campaigns/kebap.jpg'),
('ccccdddd-eeee-ffff-3333-333333333333', 'Su İndirimi', 'Damacana sularda %10 indirim', 'f3217a4e-90d4-4372-91e7-3b28de542a18', 'c7d444a0-096f-431c-ac0f-696bc07a8990', NOW(), NOW() + INTERVAL '21 days', 10.00, 'percentage', 20.00, NULL, 'SU10', 'active', 3, 'https://example.com/campaigns/su.jpg');

-- Siparişler
INSERT INTO orders (id, customer_id, store_id, status, order_date, delivery_date, subtotal, delivery_fee, total, discount, payment_method, payment_status, delivery_address_id, courier_id, courier_name, courier_phone, estimated_delivery, delivery_note) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ca7716d0-10f0-4bce-a633-3c122d8fe14d', '1a2b3c4d-1234-5678-abcd-1234567890ab', 'delivered', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 240.00, 10.00, 250.00, 0.00, 'cash', 'paid', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', NULL, 'Ahmet Kaya', '0555 123 4567', '30-45 dk', 'Kapıda zil çalınız'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '31ad2b07-9c5c-4aab-a0de-35caa5f6c579', '2c3d4e5f-2345-6789-bcde-2345678901bc', 'delivered', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', 35.00, 5.00, 40.00, 0.00, 'credit_card', 'paid', 'bbbb2222-bbbb-2222-bbbb-2222bbbb2222', NULL, 'Mehmet Demir', '0533 987 6543', '20-30 dk', 'Resepsiyona bırakılabilir'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '9c1e98d0-2a07-4000-a55a-aefaadaf3122', '3d4e5f60-3456-789a-cdef-3456789012cd', 'processing', NOW() - INTERVAL '1 day', NULL, 180.00, 15.00, 195.00, 0.00, 'credit_card', 'paid', 'cccc3333-cccc-3333-cccc-3333cccc3333', NULL, NULL, NULL, '25-40 dk', NULL),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '5067dd4c-d764-43ae-a97f-380a190d3b64', 'f3217a4e-90d4-4372-91e7-3b28de542a18', 'pending', NOW(), NULL, 75.00, 5.00, 80.00, 0.00, 'cash', 'pending', 'dddd4444-dddd-4444-dddd-4444dddd4444', NULL, NULL, NULL, '15-25 dk', 'Dikkatli taşıyınız');

-- Sipariş Kalemleri
INSERT INTO order_items (order_id, product_id, name, quantity, price, total, notes) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '1a1a1a1a-1111-1111-1111-111111111111', 'Adana Kebap', 1, 120.00, 120.00, 'Az acılı'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2b2b2b2b-2222-2222-2222-222222222222', 'Urfa Kebap', 1, 110.00, 110.00, NULL),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '4d4d4d4d-4444-4444-4444-444444444444', 'Ekmek', 1, 5.00, 5.00, NULL),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '5e5e5e5e-5555-5555-5555-555555555555', 'Süt', 2, 15.00, 30.00, NULL),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '6f6f6f6f-6666-6666-6666-666666666666', 'Hamburger', 2, 90.00, 180.00, 'Turşusuz'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '8a8a8a8a-8888-8888-8888-888888888888', 'Damacana Su', 3, 25.00, 75.00, NULL);

-- Sepet Öğeleri
INSERT INTO cart_items (user_id, product_id, store_id, name, price, quantity, image, notes) VALUES
('a28c1182-2a65-4aa6-a57c-c7a0771401e0', '3c3c3c3c-3333-3333-3333-333333333333', '1a2b3c4d-1234-5678-abcd-1234567890ab', 'İskender Kebap', 150.00, 1, 'https://example.com/products/iskender.jpg', 'Bol soslu'),
('fc5da590-253b-4cfa-ac65-b942d2824ea1', '7a7a7a7a-7777-7777-7777-777777777777', '3d4e5f60-3456-789a-cdef-3456789012cd', 'Pizza', 120.00, 2, 'https://example.com/products/pizza.jpg', 'Ekstra peynirli'),
('52fa642c-b3d9-4ac9-9a54-4bc94dc77900', '9a9a9a9a-9999-9999-9999-999999999999', 'f3217a4e-90d4-4372-91e7-3b28de542a18', 'Pet Şişe Su', 40.00, 1, 'https://example.com/products/pet-sise.jpg', NULL);

-- Değerlendirmeler
INSERT INTO reviews (user_id, store_id, order_id, rating, comment) VALUES
('ca7716d0-10f0-4bce-a633-3c122d8fe14d', '1a2b3c4d-1234-5678-abcd-1234567890ab', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, 'Muhteşem lezzet, hızlı teslimat.'),
('31ad2b07-9c5c-4aab-a0de-35caa5f6c579', '2c3d4e5f-2345-6789-bcde-2345678901bc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 4, 'Ürünler taze, teslimat zamanında.'),
('9c1e98d0-2a07-4000-a55a-aefaadaf3122', '3d4e5f60-3456-789a-cdef-3456789012cd', NULL, 5, 'Çok lezzetli, kesinlikle tavsiye ederim.');

-- Aktüel Ürünler
INSERT INTO aktuel_products (name, description, original_price, discount_price, image_url, category, features, stock, start_date, end_date) VALUES
('Akıllı Bileklik', 'Nabız ölçer, adımsayar özellikleri', 499.99, 299.99, 'https://example.com/aktuel/bileklik.jpg', 'Elektronik', ARRAY['Su geçirmez', 'Bluetooth bağlantı', 'Uzun pil ömrü'], 50, NOW(), NOW() + INTERVAL '7 days'),
('Kahve Makinesi', 'Otomatik filtre kahve makinesi', 899.99, 599.99, 'https://example.com/aktuel/kahve.jpg', 'Ev Aletleri', ARRAY['1.5 litre kapasite', 'Zamanlayıcı', 'Otomatik kapanma'], 30, NOW(), NOW() + INTERVAL '7 days'),
('Yüz Temizleme Cihazı', 'Derin temizlik için', 299.99, 199.99, 'https://example.com/aktuel/cilt.jpg', 'Kişisel Bakım', ARRAY['Şarj edilebilir', '3 farklı başlık', 'Su geçirmez'], 75, NOW(), NOW() + INTERVAL '7 days');

-- ===============================================
-- FONKSIYONLAR
-- ===============================================

-- Mağazaya en çok sipariş veren kullanıcıları bulma
CREATE OR REPLACE FUNCTION get_store_top_customers(store_id_param UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    customer_id UUID,
    customer_name TEXT,
    total_orders INTEGER,
    total_spent NUMERIC(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.customer_id,
        u.name AS customer_name,
        COUNT(o.id) AS total_orders,
        SUM(o.total) AS total_spent
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    WHERE o.store_id = store_id_param
    GROUP BY o.customer_id, u.name
    ORDER BY total_spent DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Mağazanın en çok satan ürünlerini bulma
CREATE OR REPLACE FUNCTION get_store_top_products(store_id_param UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    total_quantity INTEGER,
    total_revenue NUMERIC(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        oi.product_id,
        p.name AS product_name,
        SUM(oi.quantity) AS total_quantity,
        SUM(oi.total) AS total_revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    WHERE o.store_id = store_id_param
    GROUP BY oi.product_id, p.name
    ORDER BY total_quantity DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Kullanıcının sipariş geçmişini özet olarak getirme
CREATE OR REPLACE FUNCTION get_user_order_summary(user_id_param UUID)
RETURNS TABLE (
    total_orders INTEGER,
    total_spent NUMERIC(10,2),
    favorite_store_id UUID,
    favorite_store_name TEXT,
    most_ordered_category TEXT
) AS $$
DECLARE
    fav_store_id UUID;
    fav_store_name TEXT;
    most_cat TEXT;
BEGIN
    -- En çok sipariş verilen mağaza
    SELECT o.store_id, s.name INTO fav_store_id, fav_store_name
    FROM orders o
    JOIN stores s ON o.store_id = s.id
    WHERE o.customer_id = user_id_param
    GROUP BY o.store_id, s.name
    ORDER BY COUNT(*) DESC
    LIMIT 1;
    
    -- En çok sipariş edilen kategori
    SELECT p.category INTO most_cat
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    WHERE o.customer_id = user_id_param
    GROUP BY p.category
    ORDER BY SUM(oi.quantity) DESC
    LIMIT 1;
    
    RETURN QUERY
    SELECT 
        COUNT(o.id)::INTEGER AS total_orders,
        COALESCE(SUM(o.total), 0) AS total_spent,
        fav_store_id AS favorite_store_id,
        fav_store_name AS favorite_store_name,
        most_cat AS most_ordered_category
    FROM orders o
    WHERE o.customer_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Belirli bir kategorideki aktif kampanyaları getirme
CREATE OR REPLACE FUNCTION get_active_campaigns_by_category(category_id_param INTEGER)
RETURNS TABLE (
    campaign_id UUID,
    title TEXT,
    description TEXT,
    store_name TEXT,
    discount NUMERIC(10,2),
    discount_type TEXT,
    code TEXT,
    end_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id AS campaign_id,
        c.title,
        c.description,
        s.name AS store_name,
        c.discount,
        c.discount_type,
        c.code,
        c.end_date
    FROM campaigns c
    LEFT JOIN stores s ON c.store_id = s.id
    WHERE (c.main_category_id = category_id_param OR c.main_category_id IS NULL)
      AND c.status = 'active'
      AND c.end_date > NOW()
      AND c.start_date <= NOW();
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- VIEWS (GÖRÜNÜMLER)
-- ===============================================

-- Aktif Mağazalar Görünümü
CREATE OR REPLACE VIEW active_stores AS
SELECT 
    s.id, 
    s.name, 
    s.category_id,
    c.name AS category_name,
    s.rating,
    s.review_count,
    s.logo,
    s.cover_image,
    s.min_order_amount,
    s.delivery_time_estimation,
    s.address,
    u.name AS owner_name,
    u.phone AS owner_phone
FROM stores s
JOIN categories c ON s.category_id = c.id
JOIN users u ON s.owner_id = u.id
WHERE s.status = 'active' AND s.is_approved = TRUE AND s.is_open = TRUE;

-- Popüler Ürünler Görünümü
CREATE OR REPLACE VIEW popular_products AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.image,
    p.category,
    s.id AS store_id,
    s.name AS store_name,
    COUNT(oi.id) AS order_count,
    SUM(oi.quantity) AS total_quantity
FROM products p
JOIN stores s ON p.store_id = s.id
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE p.is_available = TRUE
GROUP BY p.id, s.id, s.name
ORDER BY total_quantity DESC;

-- Aktif Kampanyalar Görünümü
CREATE OR REPLACE VIEW active_campaigns AS
SELECT 
    c.id,
    c.title,
    c.description,
    c.discount,
    c.discount_type,
    c.min_order_amount,
    c.max_discount_amount,
    c.code,
    c.end_date,
    c.image_url,
    s.id AS store_id,
    s.name AS store_name,
    cat.id AS category_id,
    cat.name AS category_name
FROM campaigns c
LEFT JOIN stores s ON c.store_id = s.id
LEFT JOIN categories cat ON c.main_category_id = cat.id
WHERE c.status = 'active'
  AND c.end_date > NOW()
  AND c.start_date <= NOW();

-- Son Siparişler Görünümü
CREATE OR REPLACE VIEW recent_orders AS
SELECT 
    o.id,
    o.customer_id,
    u.name AS customer_name,
    o.store_id,
    s.name AS store_name,
    o.status,
    o.order_date,
    o.delivery_date,
    o.total,
    o.payment_method,
    o.payment_status,
    COUNT(oi.id) AS total_items,
    o.delivery_address_id,
    a.full_address
FROM orders o
JOIN users u ON o.customer_id = u.id
JOIN stores s ON o.store_id = s.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN addresses a ON o.delivery_address_id = a.id
GROUP BY o.id, u.name, s.name, a.full_address
ORDER BY o.order_date DESC;

-- ===============================================
-- AUTH HOOKS (Kimlik Doğrulama için Otomatik İşlemler)
-- ===============================================

-- Yeni kayıt olan kullanıcı için public profil oluşturma
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url, role)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı otomatik olarak tetiklemek için
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Kullanıcı silindiğinde public profilini silme
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.users WHERE id = old.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı otomatik olarak tetiklemek için
CREATE OR REPLACE TRIGGER on_auth_user_deleted
AFTER DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- ===============================================
-- SAĞLAMA VE BAŞLAT
-- ===============================================

-- RLS politikalarını geçersiz kılma (isteğe bağlı, sadece geliştirme ortamında)
-- ALTER TABLE users FORCE ROW LEVEL SECURITY;
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Otomatik artan değerleri yeniden başlatma (isteğe bağlı)
-- SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- Veritabanı ve kullanıcı bilgilerini görüntüleme
SELECT current_database() AS "Veritabanı";
SELECT current_user AS "Kullanıcı";
SELECT COUNT(*) AS "Kategori Sayısı" FROM categories;
SELECT COUNT(*) AS "Kullanıcı Sayısı" FROM users;
SELECT COUNT(*) AS "Mağaza Sayısı" FROM stores;
SELECT COUNT(*) AS "Ürün Sayısı" FROM products;

-- ===============================================
-- SONUÇ
-- ===============================================

-- Kurulum tamamlandı
DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Sipariş Uygulaması Veritabanı Başarıyla Kuruldu';
    RAISE NOTICE '================================================';
END $$;