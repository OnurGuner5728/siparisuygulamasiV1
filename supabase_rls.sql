-- Supabase RLS Politikaları

-- Öncelikle tüm tablolar için RLS'yi aktif hale getirelim
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_working_hours ENABLE ROW LEVEL SECURITY;

-- Şimdi her tablo için okuma/yazma/silme politikalarını ekleyelim

-- Categories tablosu: Herkes okuyabilir
CREATE POLICY "Herkes kategorileri okuyabilir" ON categories
  FOR SELECT USING (true);
  
-- Users tablosu: Herkes kendi verilerini okuyabilir/düzenleyebilir, admin tümünü görebilir
CREATE POLICY "Kullanıcılar kendi verilerini okuyabilir" ON users
  FOR SELECT USING (auth.uid() = id OR auth.role() = 'service_role');
  
CREATE POLICY "Kullanıcılar kendi verilerini güncelleyebilir" ON users
  FOR UPDATE USING (auth.uid() = id OR auth.role() = 'service_role');

-- Stores tablosu: Herkes aktif mağazaları görebilir, mağaza sahipleri kendi mağazalarını yönetebilir
CREATE POLICY "Herkes aktif mağazaları okuyabilir" ON stores
  FOR SELECT USING (status = 'active' OR auth.role() = 'service_role' OR owner_id = auth.uid());
  
CREATE POLICY "Mağaza sahipleri kendi mağazalarını güncelleyebilir" ON stores
  FOR UPDATE USING (owner_id = auth.uid() OR auth.role() = 'service_role');
  
CREATE POLICY "Mağaza sahipleri kendi mağazalarını silebilir" ON stores
  FOR DELETE USING (owner_id = auth.uid() OR auth.role() = 'service_role');

-- Products tablosu: Herkes ürünleri görebilir, mağaza sahipleri kendi ürünlerini yönetebilir
CREATE POLICY "Herkes ürünleri okuyabilir" ON products
  FOR SELECT USING (true);
  
CREATE POLICY "Mağaza sahipleri kendi ürünlerini ekleyebilir" ON products
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid()
  ) OR auth.role() = 'service_role');
  
CREATE POLICY "Mağaza sahipleri kendi ürünlerini güncelleyebilir" ON products
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid()
  ) OR auth.role() = 'service_role');
  
CREATE POLICY "Mağaza sahipleri kendi ürünlerini silebilir" ON products
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid()
  ) OR auth.role() = 'service_role');

-- Campaigns tablosu: Herkes aktif kampanyaları görebilir
CREATE POLICY "Herkes aktif kampanyaları okuyabilir" ON campaigns
  FOR SELECT USING (status = 'active' OR auth.role() = 'service_role');

-- Orders tablosu: Kullanıcılar kendi siparişlerini, mağaza sahipleri kendi mağazalarının siparişlerini görebilir
CREATE POLICY "Kullanıcılar kendi siparişlerini okuyabilir" ON orders
  FOR SELECT USING (
    customer_id = auth.uid() OR 
    auth.role() = 'service_role' OR
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
  );
  
CREATE POLICY "Kullanıcılar sipariş oluşturabilir" ON orders
  FOR INSERT WITH CHECK (customer_id = auth.uid() OR auth.role() = 'service_role');
  
CREATE POLICY "Mağaza sahipleri sipariş durumunu güncelleyebilir" ON orders
  FOR UPDATE USING (
    auth.role() = 'service_role' OR
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
  );

-- Order Items tablosu: Kullanıcılar kendi sipariş kalemlerini görebilir
CREATE POLICY "Kullanıcılar kendi sipariş kalemlerini okuyabilir" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND customer_id = auth.uid()) OR
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM orders o
      JOIN stores s ON o.store_id = s.id
      WHERE o.id = order_id AND s.owner_id = auth.uid()
    )
  );
  
CREATE POLICY "Kullanıcılar sipariş kalemi ekleyebilir" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND customer_id = auth.uid()) OR
    auth.role() = 'service_role'
  );

-- Addresses tablosu: Kullanıcılar kendi adreslerini yönetebilir
CREATE POLICY "Kullanıcılar kendi adreslerini okuyabilir" ON addresses
  FOR SELECT USING (user_id = auth.uid() OR auth.role() = 'service_role');
  
CREATE POLICY "Kullanıcılar adres ekleyebilir" ON addresses
  FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');
  
CREATE POLICY "Kullanıcılar kendi adreslerini güncelleyebilir" ON addresses
  FOR UPDATE USING (user_id = auth.uid() OR auth.role() = 'service_role');
  
CREATE POLICY "Kullanıcılar kendi adreslerini silebilir" ON addresses
  FOR DELETE USING (user_id = auth.uid() OR auth.role() = 'service_role');

-- Reviews tablosu: Herkes değerlendirmeleri okuyabilir, kullanıcılar kendi değerlendirmelerini yönetebilir
CREATE POLICY "Herkes değerlendirmeleri okuyabilir" ON reviews
  FOR SELECT USING (true);
  
CREATE POLICY "Kullanıcılar değerlendirme ekleyebilir" ON reviews
  FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');
  
CREATE POLICY "Kullanıcılar kendi değerlendirmelerini güncelleyebilir" ON reviews
  FOR UPDATE USING (user_id = auth.uid() OR auth.role() = 'service_role');
  
CREATE POLICY "Kullanıcılar kendi değerlendirmelerini silebilir" ON reviews
  FOR DELETE USING (user_id = auth.uid() OR auth.role() = 'service_role');

-- Cart Items tablosu: Kullanıcılar kendi sepetlerini yönetebilir
CREATE POLICY "Kullanıcılar kendi sepet ürünlerini okuyabilir" ON cart_items
  FOR SELECT USING (user_id = auth.uid() OR auth.role() = 'service_role');
  
CREATE POLICY "Kullanıcılar sepete ürün ekleyebilir" ON cart_items
  FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');
  
CREATE POLICY "Kullanıcılar sepet ürünlerini güncelleyebilir" ON cart_items
  FOR UPDATE USING (user_id = auth.uid() OR auth.role() = 'service_role');
  
CREATE POLICY "Kullanıcılar sepet ürünlerini silebilir" ON cart_items
  FOR DELETE USING (user_id = auth.uid() OR auth.role() = 'service_role');

-- Store Working Hours tablosu: Herkes çalışma saatlerini görebilir, mağaza sahipleri kendi mağazalarının saatlerini yönetebilir
CREATE POLICY "Herkes çalışma saatlerini okuyabilir" ON store_working_hours
  FOR SELECT USING (true);
  
CREATE POLICY "Mağaza sahipleri çalışma saati ekleyebilir" ON store_working_hours
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid()) OR
    auth.role() = 'service_role'
  );
  
CREATE POLICY "Mağaza sahipleri çalışma saatlerini güncelleyebilir" ON store_working_hours
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid()) OR
    auth.role() = 'service_role'
  );
  
CREATE POLICY "Mağaza sahipleri çalışma saatlerini silebilir" ON store_working_hours
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid()) OR
    auth.role() = 'service_role'
  ); 