import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  try {
    // İkinci bir yöntem olarak tüm tabloları Supabase Dashboard'dan alınan listeye göre taramayı deneyelim
    const potentialTables = [
      'addresses', 'admin_roles', 'campaign_participants', 'campaigns', 
      'categories', 'commission_links', 'commissions', 'favorites',
      'help_requests', 'notification_preferences', 'notifications', 
      'order_items', 'orders', 'partners', 'payments', 'products',
      'promo_banners', 'reviews', 'settings', 'store_restrictions', 
      'store_working_hours', 'users'
    ];
    
    // Her tabloyu kontrol et ve var olanları listeye ekle
    const tableChecks = await Promise.all(
      potentialTables.map(async (tableName) => {
        try {
          const { error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          return { 
            tableName, 
            exists: !error,
            error: error ? error.message : null
          };
        } catch (err) {
          return { 
            tableName, 
            exists: false,
            error: err.message
          };
        }
      })
    );
    
    // Var olan tabloları filtrele
    const existingTables = tableChecks
      .filter(table => table.exists)
      .map(table => table.tableName);
    
    return NextResponse.json({ 
      tables: existingTables,
      message: 'Mevcut tablolar başarıyla tespit edildi.',
      details: tableChecks
    });
  } catch (error) {
    console.error('Supabase bağlantı hatası:', error);
    return NextResponse.json({ 
      error: error.message,
      details: 'Veritabanı bağlantısı sağlanamadı veya sorgu başarısız oldu.',
      suggestion: 'Supabase Dashboard üzerinden tablolarınızı kontrol edin ve tabloları manuel olarak oluşturun.'
    }, { status: 500 });
  }
} 