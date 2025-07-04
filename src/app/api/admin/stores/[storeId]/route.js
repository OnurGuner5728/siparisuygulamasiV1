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

export async function PUT(request, { params }) {
  try {
    const { storeId } = params;
    const updates = await request.json();
    
    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID gerekli' },
        { status: 400 }
      );
    }

    // Mağazayı güncelle
    const { data, error } = await supabaseAdmin
      .from('stores')
      .update(updates)
      .eq('id', storeId)
      .select()
      .single();

    if (error) {
      console.error('Mağaza güncellenirken hata:', error);
      return NextResponse.json(
        { error: error.message || 'Mağaza güncellenemedi' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Mağaza başarıyla güncellendi', data },
      { status: 200 }
    );

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { storeId } = params;
    
    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID gerekli' },
        { status: 400 }
      );
    }

    // Mağazayı sil
    const { error } = await supabaseAdmin
      .from('stores')
      .delete()
      .eq('id', storeId);

    if (error) {
      console.error('Mağaza silinirken hata:', error);
      return NextResponse.json(
        { error: error.message || 'Mağaza silinemedi' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Mağaza başarıyla silindi' },
      { status: 200 }
    );

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 
