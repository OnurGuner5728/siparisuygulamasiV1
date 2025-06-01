import { NextResponse } from 'next/server';
import * as api from '../../../../lib/api';

// GET - Tüm kategorileri getir
export async function GET() {
  try {
    const categories = await api.getCategories(true); // admin=true
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Kategoriler getirilirken hata:', error);
    return NextResponse.json(
      { success: false, error: 'Kategoriler getirilemedi' },
      { status: 500 }
    );
  }
}

// POST - Yeni kategori oluştur
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, parent_id, image_url, is_active, sort_order } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Kategori adı gereklidir' },
        { status: 400 }
      );
    }

    const categoryData = {
      name,
      description: description || '',
      parent_id: parent_id || null,
      image_url: image_url || null,
      is_active: is_active !== undefined ? is_active : true,
      sort_order: sort_order || 1,
      slug: name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
    };

    const newCategory = await api.createCategory(categoryData);
    return NextResponse.json({ success: true, data: newCategory });
  } catch (error) {
    console.error('Kategori oluşturulurken hata:', error);
    return NextResponse.json(
      { success: false, error: 'Kategori oluşturulamadı' },
      { status: 500 }
    );
  }
} 