import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Admin client oluştur (server-side)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

console.log('Admin client oluşturuldu. URL:', supabaseUrl);
console.log('Service key mevcut:', !!supabaseServiceKey);

export async function DELETE(request, { params }) {
  try {
    console.log('DELETE /api/admin/users/[userId] çağrıldı');
    console.log('Params:', params);
    
    const { userId } = params;
    
    if (!userId) {
      console.error('User ID eksik');
      return NextResponse.json(
        { error: 'User ID gerekli' },
        { status: 400 }
      );
    }

    console.log(`Kullanıcı siliniyor: ${userId}`);

    // Admin yetkisi kontrolü (isteğe bağlı - frontend'de de kontrol ediliyor)
    // Burada ek güvenlik kontrolü yapılabilir

    // Kullanıcıyı auth'dan sil
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    console.log('Supabase yanıtı:', { data, error });

    if (error) {
      console.error('Supabase auth.admin.deleteUser hatası:', error);
      return NextResponse.json(
        { error: error.message || 'Kullanıcı silinemedi' },
        { status: 400 }
      );
    }

    console.log('Kullanıcı başarıyla silindi');
    return NextResponse.json(
      { message: 'Kullanıcı başarıyla silindi', data },
      { status: 200 }
    );

  } catch (error) {
    console.error('API beklenmeyen hatası:', error);
    return NextResponse.json(
      { error: `Sunucu hatası: ${error.message}` },
      { status: 500 }
    );
  }
} 
