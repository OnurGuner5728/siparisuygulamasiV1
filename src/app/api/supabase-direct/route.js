import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  try {
    // Tüm potansiyel tabloları kontrol et
    const potentialTables = [
      'addresses', 'admin_roles', 'campaign_participants', 'campaigns',
      'categories', 'commission_links', 'commissions', 'favorites',
      'help_requests', 'notification_preferences', 'notifications',
      'order_items', 'orders', 'partners', 'payments', 'products',
      'promo_banners', 'reviews', 'settings', 'store_restrictions',
      'store_working_hours', 'users'
    ];
    
    // Her tabloyu kontrol et
    const tableStatuses = await Promise.all(
      potentialTables.map(async (tableName) => {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          return {
            table: tableName,
            exists: !error,
            has_data: data && data.length > 0,
            error: error ? error.message : null
          };
        } catch (err) {
          return {
            table: tableName,
            exists: false,
            has_data: false,
            error: err.message
          };
        }
      })
    );
    
    // Var olan tabloları filtrele
    const existingTables = tableStatuses
      .filter(status => status.exists)
      .map(status => status.table);
    
    return NextResponse.json({ 
      success: true,
      message: 'Veritabanına başarıyla bağlanıldı.',
      existing_tables: existingTables,
      table_count: existingTables.length,
      table_statuses: tableStatuses
    });
  } catch (error) {
    console.error('Supabase bağlantı hatası:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      hint: 'Supabase bağlantınızı kontrol edin. URL ve API anahtarları doğru olmalıdır.'
    }, { status: 500 });
  }
} 