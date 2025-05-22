-- Modül izinleri tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.module_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enable_yemek BOOLEAN NOT NULL DEFAULT TRUE,
  enable_market BOOLEAN NOT NULL DEFAULT TRUE,
  enable_su BOOLEAN NOT NULL DEFAULT TRUE,
  enable_aktuel BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Politikaları (Row Level Security)
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;

-- Admin rolü tüm izinlere sahiptir
CREATE POLICY "Admin has full access to module_permissions" 
  ON public.module_permissions
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Tüm kullanıcılar izinleri okuyabilir
CREATE POLICY "All users can read module_permissions" 
  ON public.module_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- İlk modül izinlerini varsayılan değerlerle ekle
INSERT INTO public.module_permissions (enable_yemek, enable_market, enable_su, enable_aktuel)
VALUES (true, true, true, false)
ON CONFLICT DO NOTHING;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for module_permissions table
CREATE TRIGGER update_module_permissions_modified
BEFORE UPDATE ON public.module_permissions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 