import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST() {
  return NextResponse.json({
    success: false,
    message: 'SQL çalıştırma yetkisi olmadığı için tablolar oluşturulamıyor.',
    manualSetupInstructions: true,
    operations: [
      {
        table: 'users',
        status: 'error',
        message: 'SQL çalıştırma yetkisi yok. Manüel oluşturulmalı.'
      },
      {
        table: 'stores',
        status: 'error',
        message: 'SQL çalıştırma yetkisi yok. Manüel oluşturulmalı.'
      },
      {
        table: 'products',
        status: 'error',
        message: 'SQL çalıştırma yetkisi yok. Manüel oluşturulmalı.'
      },
      {
        table: 'orders',
        status: 'error',
        message: 'SQL çalıştırma yetkisi yok. Manüel oluşturulmalı.'
      },
      {
        table: 'order_items',
        status: 'error',
        message: 'SQL çalıştırma yetkisi yok. Manüel oluşturulmalı.'
      }
    ],
    setupInstructions: {
      dashboard_url: 'https://app.supabase.io',
      steps: [
        'Supabase Dashboard\'una giriş yapın (https://app.supabase.io)',
        'Projenizi seçin',
        'Sol menüden "Table Editor" seçeneğine tıklayın',
        'Yeni bir tablo oluşturmak için "New Table" butonuna tıklayın',
        'Aşağıdaki SQL komutlarını "SQL Editor" bölümünde çalıştırabilirsiniz'
      ],
      table_schemas: [
        {
          name: 'users',
          sql: `CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`
        },
        {
          name: 'stores',
          sql: `CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES users(id),
  category_id INTEGER NOT NULL,
  description TEXT,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  is_approved BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  logo_url TEXT,
  banner_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`
        },
        {
          name: 'products',
          sql: `CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_price DECIMAL(10, 2),
  image_url TEXT,
  category VARCHAR(100),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`
        },
        {
          name: 'orders',
          sql: `CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  store_id UUID REFERENCES stores(id),
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_address TEXT,
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`
        },
        {
          name: 'order_items',
          sql: `CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`
        }
      ]
    }
  });
} 