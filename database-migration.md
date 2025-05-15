# Veritabanı Geçişi İçin Veri Yapısı Değişiklikleri

Bu doküman, mock veriden gerçek veritabanına geçiş yaparken dikkat edilmesi gereken veri yapısı sorunlarını ve çözüm önerilerini içermektedir.

## 1. `order.items` - JSON Yerine İlişkisel Tablo

**Sorun:** Sipariş öğeleri (`order.items`) JSON olarak sipariş tablosunda tutulmuş durumda. Bu, veritabanı sorgularında bu verilere erişimi zorlaştırır.

**Çözüm:** `order_items` adında ayrı bir tablo oluşturarak normalize edilmeli.

**Mevcut Yapı:**
```javascript
// orders tablosunda
{
  id: 1001,
  // ... diğer sipariş alanları
  items: [
    {
      id: 1,
      productId: 1,
      name: 'Adana Kebap',
      quantity: 1,
      price: 120.00,
      total: 120.00,
      notes: 'Acılı olsun'
    },
    // ... diğer ürünler
  ]
}
```

**Önerilen Yapı:**
```sql
-- orders tablosu
CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT,
    store_id INT,
    status VARCHAR(50),
    order_date TIMESTAMP,
    delivery_date TIMESTAMP,
    subtotal DECIMAL(10, 2),
    delivery_fee DECIMAL(10, 2),
    total DECIMAL(10, 2),
    discount DECIMAL(10, 2),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    delivery_address_id INT,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (delivery_address_id) REFERENCES addresses(id)
);

-- order_items tablosu
CREATE TABLE order_items (
    id INT PRIMARY KEY,
    order_id INT,
    product_id INT,
    name VARCHAR(255),
    quantity INT,
    price DECIMAL(10, 2),
    total DECIMAL(10, 2),
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## 2. `store.workingHours` - Object Yerine İlişkisel Tablo

**Sorun:** Çalışma saatleri (`store.workingHours`) obje olarak tutulmuş, gün bazında sorgulamayı zorlaştırıyor.

**Çözüm:** Her gün için ayrı satır olacak şekilde `store_working_hours` tablosu oluşturulabilir.

**Mevcut Yapı:**
```javascript
// stores tablosunda
{
  id: 1,
  // ... diğer mağaza alanları
  workingHours: {
    monday: { open: '09:00', close: '22:00' },
    tuesday: { open: '09:00', close: '22:00' },
    // ... diğer günler
  }
}
```

**Önerilen Yapı:**
```sql
CREATE TABLE store_working_hours (
    id INT PRIMARY KEY,
    store_id INT,
    day_of_week VARCHAR(10), -- 'monday', 'tuesday', ...
    opening_time TIME,
    closing_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (store_id) REFERENCES stores(id)
);
```

## 3. `modulePermissions` - Nested Object Yerine İlişkisel Tablo

**Sorun:** Modül izinleri (`modulePermissions`) iç içe (nested) objeler olarak tutulmuş.

**Çözüm:** `store_permissions` veya `user_permissions` tablolarıyla normalize edilebilir.

**Mevcut Yapı:**
```javascript
// stores veya users tablosunda
{
  id: 1,
  // ... diğer alanlar
  modulePermissions: {
    yemek: true,
    market: false,
    su: false,
    aktuel: false,
    kampanya: {
      view: true,
      create: true
    }
  }
}
```

**Önerilen Yapı:**
```sql
-- modules tablosu (tüm modülleri tanımlar)
CREATE TABLE modules (
    id INT PRIMARY KEY,
    name VARCHAR(50), -- 'yemek', 'market', 'su', 'aktuel', 'kampanya'
    parent_id INT NULL, -- Kampanya gibi alt modüller için
    FOREIGN KEY (parent_id) REFERENCES modules(id)
);

-- permissions tablosu (izin tiplerini tanımlar)
CREATE TABLE permissions (
    id INT PRIMARY KEY,
    name VARCHAR(50), -- 'access', 'view', 'create', 'admin'
    description TEXT
);

-- user/store_permissions tablosu
CREATE TABLE entity_permissions (
    id INT PRIMARY KEY,
    entity_type VARCHAR(10), -- 'user' veya 'store'
    entity_id INT, -- user_id veya store_id
    module_id INT,
    permission_id INT,
    is_granted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (module_id) REFERENCES modules(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
);
```

## 4. `user.addressIds` ve `defaultAddressId` - Fazlalık Bilgi

**Sorun:** Kullanıcılarda hem adres ID'leri listesi (`addressIds`) hem de varsayılan adres ID'si (`defaultAddressId`) tutulmakta.

**Çözüm:** Adres tablosunda `user_id` ve `is_default` alanları tutarak bu sorunu çözebiliriz.

**Mevcut Yapı:**
```javascript
// users tablosunda
{
  id: 5,
  // ... diğer kullanıcı alanları
  addressIds: [5, 9],
  defaultAddressId: 5
}

// addresses tablosunda
{
  id: 5,
  userId: 5,
  // ... diğer adres alanları
  isDefault: true
}
```

**Önerilen Yapı:**
```sql
CREATE TABLE addresses (
    id INT PRIMARY KEY,
    user_id INT,
    title VARCHAR(100),
    type VARCHAR(20),
    full_name VARCHAR(255),
    phone VARCHAR(20),
    city VARCHAR(100),
    district VARCHAR(100),
    neighborhood VARCHAR(100),
    full_address TEXT,
    postal_code VARCHAR(10),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Bir kullanıcının sadece bir varsayılan adresi olmasını sağlamak için trigger
CREATE TRIGGER set_default_address
BEFORE UPDATE ON addresses
FOR EACH ROW
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE addresses 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
END;
```

## 5. `campaign.createdBy` - Nested Object Yerine Foreign Key

**Sorun:** Kampanyalarda oluşturan kişi bilgisi (`createdBy`) nested object olarak tutulmuş.

**Çözüm:** Foreign key kullanılarak users tablosuna bağlanmalı.

**Mevcut Yapı:**
```javascript
// campaigns tablosunda
{
  id: 1,
  // ... diğer kampanya alanları
  createdBy: {
    id: 3,
    name: 'Kebapçı Ahmet',
    role: 'store'
  }
}
```

**Önerilen Yapı:**
```sql
CREATE TABLE campaigns (
    id INT PRIMARY KEY,
    title VARCHAR(100),
    description TEXT,
    store_id INT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    discount DECIMAL(10, 2),
    discount_type VARCHAR(20),
    min_order_amount DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2),
    code VARCHAR(50),
    status VARCHAR(20),
    usage INT DEFAULT 0,
    max_usage INT,
    created_at TIMESTAMP,
    created_by_id INT, -- user veya store id'si
    creator_role VARCHAR(20), -- 'admin', 'store'
    category_id INT,
    conditions TEXT,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (created_by_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

## 6. Kategori İsimleri ve ID'leri İlişkisi

**Sorun:** Ürünlerde kategori için hem `categoryId` hem de `mainCategory` ve `category` gibi isim alanları kullanılmış.

**Çözüm:** Kategori isimleri yerine her zaman ID'ler kullanılmalı, frontend'de gösterim için ayrı bir mapping oluşturulmalı.

**Mevcut Yapı:**
```javascript
// products tablosunda
{
  id: 1,
  name: 'Adana Kebap',
  // ... diğer ürün alanları
  storeId: 1,
  storeName: 'Kebapçı Ahmet',
  category: 'Ana Yemekler',
  mainCategory: 'Yemek',
  // ... diğer alanlar
}
```

**Önerilen Yapı:**
```sql
CREATE TABLE categories (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    parent_id INT NULL, -- Ana kategoriler için NULL, alt kategoriler için parent_id
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10, 2),
    store_id INT,
    category_id INT, -- Alt kategori ID'si
    status VARCHAR(20),
    image VARCHAR(255),
    rating DECIMAL(3, 1),
    review_count INT,
    created_at TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

## 7. Sipariş Status Enumları

**Sorun:** Sipariş durumları (`status`) farklı yerlerde farklı değerlerle kullanılmış: `onway`, `in_progress`, `preparing`.

**Çözüm:** Ortak bir `order_status_types` tablosu ile standartlaştırılmalı.

**Mevcut Yapı:**
```javascript
// Farklı yerlerde farklı status değerleri
// orders tablosunda
status: 'delivered'
// storeOrders tablosunda
status: 'onway'
// statusHistory içinde
status: 'preparing'
```

**Önerilen Yapı:**
```sql
CREATE TABLE order_status_types (
    id VARCHAR(20) PRIMARY KEY, -- 'pending', 'processing', 'shipping', 'delivered', 'cancelled'
    name VARCHAR(50), -- Kullanıcı dostu isim: 'Beklemede', 'İşleniyor', 'Kargoda', 'Teslim Edildi', 'İptal Edildi'
    description TEXT,
    color VARCHAR(20), -- UI gösterimi için 'red', 'green', 'blue' gibi renkler
    order_index INT -- Sıralama için
);

-- orders tablosunda status alanı için foreign key
ALTER TABLE orders 
ADD CONSTRAINT fk_order_status 
FOREIGN KEY (status) REFERENCES order_status_types(id);

-- order_status_history tablosu
CREATE TABLE order_status_history (
    id INT PRIMARY KEY,
    order_id INT,
    status VARCHAR(20),
    timestamp TIMESTAMP,
    note TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (status) REFERENCES order_status_types(id)
);
```

## Genel Tavsiyeler

1. **Yabancı Anahtar İlişkileri:** Tüm ilişkiler Foreign Key kısıtlamaları ile güvence altına alınmalı
2. **Enum Değerleri:** Statik veriler (enum değerleri) için ayrı tablolar oluşturulmalı
3. **Veri Tipleri:** Uygun veri tipleri kullanılmalı (örn. fiyatlar için DECIMAL(10,2))
4. **Normalizasyon:** Veritabanı en az 3NF seviyesinde normalize edilmeli
5. **İndeksler:** Performans için sık sorgulanan alanlara indeks eklenmeli
6. **Soft Delete:** Veri silme işlemleri için soft delete (deleted_at) kullanılabilir
7. **Migration Araçları:** Sequelize, TypeORM, Knex.js gibi migration araçları kullanılarak veritabanı geçişi yapılabilir
8. **Veri Testi:** Migrasyon sonrası veri tutarlılığı kontrol edilmeli

## Örnek Migrasyon Kodu

Örnek bir Node.js/Express uygulaması için Sequelize ORM kullanarak migrasyon kodu:

```javascript
// models/Order.js
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['pending', 'processing', 'shipping', 'delivered', 'cancelled']]
      }
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    deliveryFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
    // ... diğer alanlar
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'customerId' });
    Order.belongsTo(models.Store, { foreignKey: 'storeId' });
    Order.belongsTo(models.Address, { foreignKey: 'deliveryAddressId' });
    Order.hasMany(models.OrderItem, { foreignKey: 'orderId' });
    Order.hasMany(models.OrderStatusHistory, { foreignKey: 'orderId' });
  };

  return Order;
};

// models/OrderItem.js
module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT
    }
  });

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, { foreignKey: 'orderId' });
    OrderItem.belongsTo(models.Product, { foreignKey: 'productId' });
  };

  return OrderItem;
};
``` 