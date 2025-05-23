-- Tablolarımızı oluşturmadan önce UUID eklentisini etkinleştirelim
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Kategoriler Tablosu
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    parent_id INTEGER REFERENCES public.categories(id) ON DELETE CASCADE,
    image TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Kategoriler için RLS politikaları
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes kategorileri görebilir" ON public.categories
    FOR SELECT
    USING (true);

CREATE POLICY "Admin kategorileri yönetebilir" ON public.categories
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Kullanıcılar Tablosu
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS Politikaları (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar için RLS politikaları
CREATE POLICY "Kullanıcılar kendilerini görebilir" ON public.users
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Kullanıcılar kendilerini güncelleyebilir" ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admin tüm kullanıcıları görebilir" ON public.users
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Adresler Tablosu
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT,
    full_name TEXT,
    phone TEXT,
    city TEXT,
    district TEXT,
    neighborhood TEXT,
    full_address TEXT,
    postal_code TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adresler için RLS politikaları
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi adreslerini görebilir" ON public.addresses
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi adreslerini ekleyebilir" ON public.addresses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi adreslerini güncelleyebilir" ON public.addresses
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi adreslerini silebilir" ON public.addresses
    FOR DELETE
    USING (auth.uid() = user_id);

-- Adresler için trigger (bir kullanıcının birden fazla varsayılan adresi olmaması için)
CREATE OR REPLACE FUNCTION public.set_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE public.addresses
        SET is_default = FALSE
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_default_address_trigger
BEFORE INSERT OR UPDATE ON public.addresses
FOR EACH ROW
EXECUTE FUNCTION public.set_default_address();

-- Mağazalar Tablosu
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    category_id INTEGER,
    subcategories TEXT[],
    logo TEXT,
    cover_image TEXT,
    rating NUMERIC(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    is_approved BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mağazalar için RLS politikaları
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes mağazaları görebilir" ON public.stores
    FOR SELECT
    USING (true);

CREATE POLICY "Mağaza sahipleri kendi mağazalarını ekleyebilir" ON public.stores
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Mağaza sahipleri kendi mağazalarını güncelleyebilir" ON public.stores
    FOR UPDATE
    USING (auth.uid() = owner_id);

-- Mağaza Çalışma Saatleri Tablosu
CREATE TABLE IF NOT EXISTS public.store_working_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL,
    opening_time TIME,
    closing_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Çalışma saatleri için RLS politikaları
ALTER TABLE public.store_working_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes mağaza çalışma saatlerini görebilir" ON public.store_working_hours
    FOR SELECT
    USING (true);

CREATE POLICY "Mağaza sahipleri kendi çalışma saatlerini ekleyebilir" ON public.store_working_hours
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE id = store_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Mağaza sahipleri kendi çalışma saatlerini güncelleyebilir" ON public.store_working_hours
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE id = store_id AND owner_id = auth.uid()
        )
    );

-- Ürünler Tablosu
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image TEXT,
    category TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ürünler için RLS politikaları
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes ürünleri görebilir" ON public.products
    FOR SELECT
    USING (true);

CREATE POLICY "Mağaza sahipleri ürünlerini ekleyebilir" ON public.products
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE id = store_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Mağaza sahipleri ürünlerini güncelleyebilir" ON public.products
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE id = store_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Mağaza sahipleri ürünlerini silebilir" ON public.products
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE id = store_id AND owner_id = auth.uid()
        )
    );

-- Sepet Öğeleri Tablosu
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    image TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sepet öğeleri için RLS politikaları
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi sepet öğelerini görebilir" ON public.cart_items
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi sepet öğelerini ekleyebilir" ON public.cart_items
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi sepet öğelerini güncelleyebilir" ON public.cart_items
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi sepet öğelerini silebilir" ON public.cart_items
    FOR DELETE
    USING (auth.uid() = user_id);

-- Siparişler Tablosu
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.users(id),
    store_id UUID NOT NULL REFERENCES public.stores(id),
    status TEXT NOT NULL DEFAULT 'pending',
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivery_date TIMESTAMP WITH TIME ZONE,
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    delivery_address_id UUID REFERENCES public.addresses(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Siparişler için RLS politikaları
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi siparişlerini görebilir" ON public.orders
    FOR SELECT
    USING (auth.uid() = customer_id);

CREATE POLICY "Mağaza sahipleri kendi mağazalarının siparişlerini görebilir" ON public.orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE id = store_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Kullanıcılar sipariş oluşturabilir" ON public.orders
    FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Mağaza sahipleri kendi mağazalarının siparişlerini güncelleyebilir" ON public.orders
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE id = store_id AND owner_id = auth.uid()
        )
    );

-- Sipariş Öğeleri Tablosu
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sipariş öğeleri için RLS politikaları
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi sipariş öğelerini görebilir" ON public.order_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_id AND customer_id = auth.uid()
        )
    );

CREATE POLICY "Mağaza sahipleri kendi sipariş öğelerini görebilir" ON public.order_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            JOIN public.stores s ON o.store_id = s.id
            WHERE o.id = order_id AND s.owner_id = auth.uid()
        )
    );

-- Kampanyalar Tablosu
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    store_id UUID REFERENCES public.stores(id),
    created_by UUID REFERENCES public.users(id),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    discount NUMERIC(10, 2),
    discount_type TEXT,
    min_order_amount NUMERIC(10, 2) DEFAULT 0,
    max_discount_amount NUMERIC(10, 2),
    code TEXT UNIQUE,
    status TEXT DEFAULT 'active',
    usage INTEGER DEFAULT 0,
    max_usage INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Kampanyalar için RLS politikaları
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes aktif kampanyaları görebilir" ON public.campaigns
    FOR SELECT
    USING (status = 'active');

CREATE POLICY "Mağaza sahipleri kendi kampanyalarını görebilir" ON public.campaigns
    FOR SELECT
    USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE id = store_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Mağaza sahipleri kampanya oluşturabilir" ON public.campaigns
    FOR INSERT
    WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('store', 'admin')
        )
    );

CREATE POLICY "Mağaza sahipleri kendi kampanyalarını güncelleyebilir" ON public.campaigns
    FOR UPDATE
    USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE id = store_id AND owner_id = auth.uid()
        )
    );

-- Değerlendirmeler Tablosu
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    store_id UUID NOT NULL REFERENCES public.stores(id),
    order_id UUID REFERENCES public.orders(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Değerlendirmeler için RLS politikaları
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes değerlendirmeleri görebilir" ON public.reviews
    FOR SELECT
    USING (true);

CREATE POLICY "Kullanıcılar değerlendirme ekleyebilir" ON public.reviews
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi değerlendirmelerini güncelleyebilir" ON public.reviews
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi değerlendirmelerini silebilir" ON public.reviews
    FOR DELETE
    USING (auth.uid() = user_id);

-- Tetikleyiciler

-- Mağaza değerlendirmesi eklendiğinde puan hesaplama
CREATE OR REPLACE FUNCTION public.calculate_store_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.stores
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0)::numeric(3,2)
            FROM public.reviews
            WHERE store_id = NEW.store_id
        ),
        review_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE store_id = NEW.store_id
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.store_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER calculate_store_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.calculate_store_rating();

-- Audit logu için güncellenme zamanı değiştirme
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Her tablo için updated_at trigger'ı
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('users', 'addresses', 'stores', 'store_working_hours', 'products', 'cart_items', 'orders', 'campaigns')
    LOOP
        EXECUTE format('
            CREATE TRIGGER set_updated_at_trigger
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION public.set_updated_at();
        ', t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Auth trigger'ları
-- Yeni kullanıcı kayıt olduğunda public.users tablosuna da ekle
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, first_name, last_name, phone, role, avatar_url, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
        COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        NEW.raw_user_meta_data->>'avatar_url',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, public.users.name),
        email = EXCLUDED.email,
        first_name = COALESCE(EXCLUDED.first_name, public.users.first_name),
        last_name = COALESCE(EXCLUDED.last_name, public.users.last_name),
        phone = COALESCE(EXCLUDED.phone, public.users.phone),
        role = COALESCE(EXCLUDED.role, public.users.role),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Kullanıcı silindiğinde public.users tablosundan da sil
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_deleted
AFTER DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete(); 