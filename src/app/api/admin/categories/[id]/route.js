import { NextResponse } from 'next/server';
import * as api from '../../../../../lib/api';

// GET - Belirli bir kategoriyi getir
export async function GET(request, { params }) {
  try {
    const categoryId = params.id;
    const category = await api.getCategoryById(categoryId);
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error(`Kategori getirilirken hata (ID: ${params.id}):`, error);
    return NextResponse.json(
      { success: false, error: 'Kategori getirilemedi' },
      { status: 500 }
    );
  }
}

// PUT - Kategoriyi güncelle
export async function PUT(request, { params }) {
  try {
    const categoryId = params.id;
    const body = await request.json();
    const { name, description, parent_id, image_url, is_active, sort_order } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Kategori adı gereklidir' },
        { status: 400 }
      );
    }

    const updateData = {
      name,
      description: description || '',
      parent_id: parent_id || null,
      image_url: image_url || null,
      is_active: is_active !== undefined ? is_active : true,
      sort_order: sort_order || 1,
      slug: name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-'),
      updated_at: new Date().toISOString()
    };

    const updatedCategory = await api.updateCategory(categoryId, updateData);
    return NextResponse.json({ success: true, data: updatedCategory });
  } catch (error) {
    console.error(`Kategori güncellenirken hata (ID: ${params.id}):`, error);
    return NextResponse.json(
      { success: false, error: 'Kategori güncellenemedi' },
      { status: 500 }
    );
  }
}

// DELETE - Kategoriyi sil
export async function DELETE(request, { params }) {
  try {
    const categoryId = params.id;
    
    // Alt kategorileri kontrol et
    const subCategories = await api.getSubcategoriesByParentId(categoryId, true);
    if (subCategories && subCategories.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Bu kategori silinemiyor çünkü alt kategorileri var. Önce alt kategorileri silin.' },
        { status: 400 }
      );
    }

    await api.deleteCategory(categoryId);
    return NextResponse.json({ success: true, message: 'Kategori başarıyla silindi' });
  } catch (error) {
    console.error(`Kategori silinirken hata (ID: ${params.id}):`, error);
    return NextResponse.json(
      { success: false, error: 'Kategori silinemedi' },
      { status: 500 }
    );
  }
} 