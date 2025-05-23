-- Categories tablosuna image sütunu ekle
ALTER TABLE categories 
ADD COLUMN image TEXT;

-- Mevcut kategorilere varsayılan değerler ekle (isteğe bağlı)
UPDATE categories 
SET image = NULL 
WHERE image IS NULL; 