import * as supabaseApi from './supabaseApi';
import { getUserProfile as supabaseGetUserProfile } from './supabaseApi';
import supabase from './supabase';
import { supabaseAdmin } from './supabase';

// Stores (Mağazalar)
export const getStores = async (filters = {}, useAdmin = false) => {
  const client = useAdmin ? supabaseAdmin : supabase;
  
  let query = client.from('stores').select('*');
  
  // Filtreleri uygula
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.category_id) {
    query = query.eq('category_id', filters.category_id);
  }
  
  if (filters.owner_id) {
    query = query.eq('owner_id', filters.owner_id);
  }
  
  // Sonuçları sırala
  query = query.order('name');
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Mağazaları getirirken hata:', error);
    return [];
  }
  return data || [];
};

export const getStoreById = async (storeId) => {
  const { data, error } = await supabase
    .from('stores')
    .select(`
      *,
      owner:users!owner_id (id, name, email, phone),
      category:categories (id, name, slug)
    `)
    .eq('id', storeId)
    .single();
    
  if (error) {
    console.error(`Mağaza bilgisini getirirken hata (ID: ${storeId}):`, error);
    return null;
  }
  
  return data;
};

export const getStoreByOwnerId = async (ownerId) => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select(`
        *,
        owner:users!owner_id (id, name, email, phone),
        category:categories (id, name, slug)
      `)
      .eq('owner_id', ownerId)
      .single();
      
    if (error) {
      console.error(`Mağaza bilgisini getirirken hata (Owner ID: ${ownerId}):`, error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Mağaza bilgisini getirirken beklenmeyen hata:', error);
    return null;
  }
};

// getStoreByUserId da aynı şeyi yapıyor - alias olarak kullan
export const getStoreByUserId = getStoreByOwnerId;

export const getStoresByCategory = async (categoryId) => {
  return getStores({ category_id: categoryId });
};

export const createStore = async (storeData) => {
  const { data, error } = await supabase
    .from('stores')
    .insert(storeData)
    .select()
    .single();
    
  if (error) {
    console.error('Mağaza oluştururken hata:', error);
    throw error;
  }
  return data;
};

export const updateStore = async (storeId, updates) => {
  console.log('updateStore called with:', { storeId, updates });
  
  try {
    const response = await fetch(`/api/admin/stores/${storeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Mağaza güncellenemedi');
    }

    console.log('updateStore successful, returned data:', result.data);
    return result.data;
  } catch (error) {
    console.error(`Mağaza güncellenirken hata (ID: ${storeId}):`, error);
    throw error;
  }
};

export const updateStoreStatus = async (storeId, status) => {
  const { data, error } = await supabase
    .from('stores')
    .update({ status })
    .eq('id', storeId)
    .select()
    .single();
    
  if (error) {
    console.error(`Mağaza durumu güncellenirken hata (ID: ${storeId}):`, error);
    throw error;
  }
  return data;
};

export const deleteStore = async (storeId) => {
  try {
    const response = await fetch(`/api/admin/stores/${storeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Mağaza silinemedi');
    }

    return { success: true };
  } catch (error) {
    console.error(`Mağaza silinirken hata (ID: ${storeId}):`, error);
    throw error;
  }
};

// Products (Ürünler)
export const getProducts = async (filters = {}) => {
  let query = supabase.from('products').select('*, store:stores(name)');
  
  // Filtreleri uygula
  if (filters.store_id) {
    query = query.eq('store_id', filters.store_id);
  }
  
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters.is_available !== undefined) {
    query = query.eq('is_available', filters.is_available);
  }
  
  // Sonuçları sırala
  query = query.order('name');
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Ürünleri getirirken hata:', error);
    return [];
  }
  return data || [];
};

export const getProductsByStoreId = async (storeId) => {
  return getProducts({ store_id: storeId, is_available: true });
};

export const getProductById = async (productId) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
    
  if (error) {
    console.error(`Ürün bilgisini getirirken hata (ID: ${productId}):`, error);
    return null;
  }
  return data;
};

export const createProduct = async (productData) => {
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();
    
  if (error) {
    console.error('Ürün oluştururken hata:', error);
    throw error;
  }
  return data;
};

export const updateProduct = async (productId, updates) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single();
    
  if (error) {
    console.error(`Ürün güncellenirken hata (ID: ${productId}):`, error);
    throw error;
  }
  return data;
};

export const deleteProduct = async (productId) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);
    
  if (error) {
    console.error(`Ürün silinirken hata (ID: ${productId}):`, error);
    throw error;
  }
  return { success: true };
};

// Orders (Siparişler)
export const getAllOrders = async (filters = {}) => {
  let query = supabase.from('orders').select(`
    *,
    customer:users!customer_id(id, name, email, phone),
    store:stores(name, category_id)
  `);

  if (filters.customer_id) {
    query = query.eq('customer_id', filters.customer_id);
  }
  if (filters.store_id) {
    query = query.eq('store_id', filters.store_id);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  // Kategoriye göre filtreleme için store tablosundaki category_id kullanılabilir,
  // ancak bu doğrudan orders tablosunda bir alan değil.
  // Bu nedenle, getAllOrders çağrılırken mağaza verileriyle birleştirme (join) yapılmalı
  // ve filtreleme istemci tarafında veya daha karmaşık bir Supabase sorgusuyla yapılmalıdır.

  query = query.order('order_date', { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error('Tüm siparişleri getirirken hata:', error);
    return [];
  }
  return data || [];
};

export const getUserOrders = async (userId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      store:stores(name, logo, category_id),
      order_items(count)
    `)
    .eq('customer_id', userId)
    .order('order_date', { ascending: false });

  if (error) {
    console.error(`Kullanıcı siparişlerini getirirken hata (ID: ${userId}):`, error);
    return [];
  }
  return data || [];
};

export const getOrderById = async (orderId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:users!customer_id(name, email, phone, avatar_url),
      store:stores(name, phone, address, logo),
      delivery_address:addresses(*),
      order_items(*, product:products(name, image))
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    console.error(`Sipariş detayını getirirken hata (ID: ${orderId}):`, error);
    return null;
  }
  return data;
};

export const createOrder = async (orderData, orderItems) => {
  // Giriş verilerini doğrula
  if (!orderData.customer_id) {
    return { error: { message: 'Customer ID gerekli' } };
  }
  
  if (!orderData.store_id) {
    return { error: { message: 'Store ID gerekli' } };
  }
  
  // Sipariş oluştur
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: orderData.customer_id,
      store_id: orderData.store_id,
      status: 'pending',
      subtotal: orderData.subtotal,
      delivery_fee: orderData.delivery_fee,
      total: orderData.total,
      discount: orderData.discount || 0,
      payment_method: orderData.payment_method,
      payment_status: orderData.payment_method === 'cash' ? 'pending' : 'paid',
      delivery_address_id: orderData.delivery_address_id,
      estimated_delivery: orderData.estimated_delivery,
      delivery_note: orderData.delivery_note || null
    })
    .select()
    .single();
  
  if (orderError) {
    console.error('Sipariş oluştururken hata:', orderError);
    return { error: orderError };
  }
  
  // Sipariş kalemleri oluştur
  for (const item of orderItems) {
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        notes: item.notes
      });
    
    if (itemError) {
      console.error(`Sipariş kalemi oluştururken hata (${item.name}):`, itemError);
      return { error: itemError };
    }
  }

  // Mağaza sahibine yeni sipariş bildirimi gönder
  try {
    // Mağaza sahibini bul
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('owner_id, name')
      .eq('id', orderData.store_id)
      .single();
    
    if (!storeError && store?.owner_id) {
      // Müşteri bilgisini al
      const { data: customer, error: customerError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', orderData.customer_id)
        .single();
      
      const customerName = customer ? (customer.name || customer.email) : 'Müşteri';
      
      await createNewOrderNotification(
        order.id, 
        store.owner_id, 
        customerName, 
        orderData.total
      );
      
      console.log('✅ Mağaza sahibine yeni sipariş bildirimi gönderildi');
    } else {
      console.warn('⚠️ Mağaza sahibi bulunamadı, bildirim gönderilemedi');
    }
  } catch (notificationError) {
    console.error('❌ Yeni sipariş bildirimi gönderilirken hata:', notificationError);
    // Bildirim hatası sipariş oluşturulmasını engellemez
  }
  
  return { data: order, error: null };
};

export const updateOrder = async (orderId, updates) => {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();
  if (error) {
    console.error(`Sipariş güncellenirken hata (ID: ${orderId}):`, error);
    throw error;
  }
  return data;
};

// Campaigns (Kampanyalar)
export const getCampaigns = async (filters = {}, useAdmin = false) => {
  const client = useAdmin ? supabaseAdmin : supabase;
  
  // Kullanıcı arayüzünde sadece aktif kampanyalar gösterilir.
  // Admin panelinde bu filtreler esnetilebilir.
  let query = client
    .from('campaigns')
    .select(`
      *,
      store:stores (id, name, logo, category_id)
    `)
    .eq('status', 'active') // Sadece aktif kampanyalar
    .gte('end_date', new Date().toISOString()) // Bitiş tarihi geçmemiş
    .lte('start_date', new Date().toISOString()); // Başlangıç tarihi geçmiş veya bugün

  // Admin panelinden geliyorsa tümünü veya farklı filtrelerle çekebiliriz.
  // Şimdilik genel kullanıcı için bu filtreler varsayılan.
  if (filters.store_id) {
    query = query.eq('store_id', filters.store_id);
  }
  
  if (filters.category_id) {
    query = query.eq('main_category_id', filters.category_id);
  }
  
  // Diğer olası filtreler eklenebilir.
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Kampanyaları getirirken hata:', error);
    return [];
  }
  return data || [];
};

export const getCampaignById = async (campaignId) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*, store:stores(name, category_id)')
    .eq('id', campaignId)
    .single();

  if (error) {
    console.error(`Kampanya detayını getirirken hata (ID: ${campaignId}):`, error);
    return null;
  }
  return data;
};

export const getCampaignByCode = async (code) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('code', code)
    .eq('status', 'active')
    .gte('end_date', new Date().toISOString()) // Bitiş tarihi geçmemiş
    .lte('start_date', new Date().toISOString()) // Başlangıç tarihi geçmiş veya bugün
    .single();
    
  if (error) {
    console.error(`Kampanya kodunu getirirken hata (${code}):`, error);
    return null;
  }
  return data;
};

export const createCampaign = async (campaignData) => {
  const { data, error } = await supabase
    .from('campaigns')
    .insert(campaignData)
    .select()
    .single();
  if (error) {
    console.error('Kampanya oluşturulurken hata:', error);
    throw error;
  }
  return data;
};

export const updateCampaign = async (campaignId, updates) => {
  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', campaignId)
    .select()
    .single();
  if (error) {
    console.error(`Kampanya güncellenirken hata (ID: ${campaignId}):`, error);
    throw error;
  }
  return data;
};

export const deleteCampaign = async (campaignId) => {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', campaignId);
  if (error) {
    console.error(`Kampanya silinirken hata (ID: ${campaignId}):`, error);
    throw error;
  }
  return { success: true };
};

// User (Kullanıcı)
export const getUserProfile = async (userId) => {
  const { data, error } = await supabaseApi.getUserProfile(userId);
  if (error) {
    console.error(`Kullanıcı profilini getirirken hata (ID: ${userId}):`, error);
    return null;
  }
  return data;
};

export const getUserAddresses = async (userId) => {  const { data, error } = await supabase    .from('addresses')    .select('*')    .eq('user_id', userId)    .order('is_default', { ascending: false })    .order('created_at', { ascending: false });      if (error) {    console.error(`Kullanıcı adreslerini getirirken hata (ID: ${userId}):`, error);    return [];  }  return data || [];};export const createAddress = async (addressData) => {  const { data, error } = await supabase    .from('addresses')    .insert(addressData)    .select()    .single();      if (error) {    console.error('Adres oluştururken hata:', error);    throw error;  }  return data;};export const updateAddress = async (addressId, addressData) => {  const { data, error } = await supabase    .from('addresses')    .update(addressData)    .eq('id', addressId)    .select()    .single();      if (error) {    console.error('Adres güncellenirken hata:', error);    throw error;  }  return data;};export const deleteAddress = async (addressId) => {  const { error } = await supabase    .from('addresses')    .delete()    .eq('id', addressId);      if (error) {    console.error('Adres silinirken hata:', error);    throw error;  }  return { success: true };};// Reviews (Değerlendirmeler)
export const getStoreReviews = async (storeId) => {
  const { data, error } = await supabaseApi.getStoreReviews(storeId);
  if (error) {
    console.error(`Mağaza değerlendirmelerini getirirken hata (ID: ${storeId}):`, error);
    return [];
  }
  return data || [];
};

// Tüm yorumları getir (filtrelenebilir)
export const getReviews = async (filters = {}) => {
  let query = supabase
    .from('reviews')
    .select(`
      *,
      user:users(id, name),
      store:stores(id, name)
    `);
    
  // Filtreleri uygula
  if (filters.store_id) {
    query = query.eq('store_id', filters.store_id);
  }
  
  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id);
  }
  
  if (filters.rating) {
    query = query.eq('rating', filters.rating);
  }
  
  if (filters.order_id) {
    query = query.eq('order_id', filters.order_id);
  }
  
  // Sıralama
  const sortBy = filters.sort || 'newest';
  switch (sortBy) {
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'highest':
      query = query.order('rating', { ascending: false });
      break;
    case 'lowest':
      query = query.order('rating', { ascending: true });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Yorumları getirirken hata:', error);
    return [];
  }
  return data || [];
};

// Yeni yorum oluştur
export const createReview = async (reviewData) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      ...reviewData,
      created_at: new Date().toISOString()
    })
    .select(`
      *,
      user:users(id, name),
      store:stores(id, name)
    `)
    .single();
    
  if (error) {
    console.error('Yorum oluştururken hata:', error);
    throw error;
  }
  return data;
};

// Yorumu güncelle
export const updateReview = async (reviewId, updates) => {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', reviewId)
    .select(`
      *,
      user:users(id, name),
      store:stores(id, name)
    `)
    .single();
    
  if (error) {
    console.error(`Yorum güncellenirken hata (ID: ${reviewId}):`, error);
    throw error;
  }
  return data;
};

// Yorumu sil
export const deleteReview = async (reviewId) => {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);
    
  if (error) {
    console.error(`Yorum silinirken hata (ID: ${reviewId}):`, error);
    throw error;
  }
  return { success: true };
};

// Kullanıcının belirli mağaza için yorum yapıp yapmadığını kontrol et
export const getUserReviewForStore = async (userId, storeId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('store_id', storeId)
    .single();
    
  if (error && error.code !== 'PGRST116') { // 'PGRST116' is "not found" error
    console.error(`Kullanıcı yorumu kontrol edilirken hata:`, error);
    return null;
  }
  return data;
};

// Kullanıcının tüm değerlendirmelerini getir
export const getUserReviews = async (userId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      store:stores(id, name, category_id)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error(`Kullanıcı değerlendirmeleri getirirken hata (User ID: ${userId}):`, error);
    return [];
  }
  return data || [];
};

// Mağaza rating istatistiklerini güncelle
export const updateStoreRating = async (storeId) => {
  try {
    // Mağazanın tüm yorumlarını al
    const reviews = await getReviews({ store_id: storeId });
    
    if (reviews.length === 0) {
      // Hiç yorum yoksa rating'i 0 yap
      await updateStore(storeId, { 
        rating: 0, 
        review_count: 0 
      });
      return;
    }
    
    // Ortalama rating hesapla
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));
    
    // Mağaza rating'ini güncelle
    await updateStore(storeId, { 
      rating: averageRating, 
      review_count: reviews.length 
    });
    
    return { averageRating, reviewCount: reviews.length };
  } catch (error) {
    console.error(`Mağaza rating'i güncellenirken hata (ID: ${storeId}):`, error);
    throw error;
  }
};

/*
// Ürün Değerlendirmeleri
// Bu fonksiyon, ürüne ait değerlendirmeleri getirmeyi amaçlar.
// Ancak mevcut 'reviews' tablosunda product_id alanı bulunmadığından,
// bu fonksiyonun doğru çalışması için şema değişikliği veya RPC gereklidir.
// Şimdilik yorum satırına alınmıştır.
export const getProductReviews = async (productId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:users(name, avatar_url)') // avatar_url olarak düzeltildi
    // .eq('product_id', productId) // reviews tablosunda product_id yok!
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error(`Ürün değerlendirmelerini getirirken hata (ID: ${productId}):`, error);
    return [];
  }
  return data || [];
};
*/

// Cart (Sepet)
export const getUserCartItems = async (userId) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*),
      store:stores(*)
    `)
    .eq('user_id', userId);
    
  if (error) {
    console.error(`Kullanıcı sepet öğelerini getirirken hata (ID: ${userId}):`, error);
    return [];
  }
  return data || [];
};

export const addToCart = async (cartItem) => {
  try {
    // cartItem validasyonu
    if (!cartItem.user_id || !cartItem.product_id || !cartItem.store_id) {
      console.error('Sepete ekleme hatası: Gerekli alanlar eksik', cartItem);
      return { success: false, error: 'Gerekli alanlar eksik' };
    }

  const { data, error } = await supabase
    .from('cart_items')
    .insert(cartItem)
    .select();
    
  if (error) {
      console.error('Sepete ürün eklerken hata:', error.message || error);
      return { success: false, error: error.message || 'Sepete ekleme hatası' };
  }
    
  return { success: true, data: data[0] };
  } catch (err) {
    console.error('Sepete ekleme sırasında beklenmedik hata:', err);
    return { success: false, error: 'Beklenmedik hata oluştu' };
  }
};

export const updateCartItem = async (itemId, updates) => {
  const { data, error } = await supabase
    .from('cart_items')
    .update(updates)
    .eq('id', itemId)
    .select();
    
  if (error) {
    console.error(`Sepet öğesini güncellerken hata (ID: ${itemId}):`, error);
    return { success: false, error };
  }
  return { success: true, data: data[0] };
};

export const removeFromCart = async (itemId) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId);
    
  if (error) {
    console.error(`Sepetten ürün kaldırırken hata (ID: ${itemId}):`, error);
    return { success: false, error };
  }
  return { success: true };
};

// Categories (Kategoriler)
export const getCategories = async (useAdmin = false) => {
  const client = useAdmin ? supabaseAdmin : supabase;
  
  const { data, error } = await client
    .from('categories')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Kategorileri getirirken hata:', error);
    return [];
  }
  return data || [];
};

export const getMainCategories = async (useAdmin = false) => {
  const client = useAdmin ? supabaseAdmin : supabase;
  
  const { data, error } = await client
    .from('categories')
    .select('*')
    .is('parent_id', null) // Ana kategorileri getirmek için parent_id'si null olanları filtrele
    .order('name');
    
  if (error) {
    console.error('Ana kategorileri getirirken hata:', error);
    return [];
  }
  return data || [];
};

// Alt kategorileri getir
export const getAllSubcategories = async (useAdmin = false) => {
  const client = useAdmin ? supabaseAdmin : supabase;
  
  const { data, error } = await client
    .from('categories')
    .select('*')
    .not('parent_id', 'is', null) // Alt kategorileri getirmek için parent_id'si null olmayanları filtrele
    .order('name');
    
  if (error) {
    console.error('Alt kategorileri getirirken hata:', error);
    return [];
  }
  return data || [];
};

// Belirli bir ana kategorinin alt kategorilerini getir
export const getSubcategoriesByParentId = async (parentId, useAdmin = false) => {
  const client = useAdmin ? supabaseAdmin : supabase;
  
  const { data, error } = await client
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .order('name');
    
  if (error) {
    console.error(`Alt kategorileri getirirken hata (Parent ID: ${parentId}):`, error);
    return [];
  }
  return data || [];
};

export const getCategoryById = async (categoryId) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single();
    
  if (error) {
    console.error(`Kategori bilgisini getirirken hata (ID: ${categoryId}):`, error);
    return null;
  }
  return data;
};

export const createCategory = async (categoryData) => {
  // Admin işlemleri için admin client kullan
  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert(categoryData)
    .select()
    .single();
    
  if (error) {
    console.error('Kategori oluştururken hata:', error);
    throw error;
  }
  return data;
};

export const updateCategory = async (categoryId, updates) => {
  // Admin işlemleri için admin client kullan
  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(updates)
    .eq('id', categoryId)
    .select()
    .single();
    
  if (error) {
    console.error(`Kategori güncellenirken hata (ID: ${categoryId}):`, error);
    throw error;
  }
  return data;
};

export const deleteCategory = async (categoryId) => {
  // Admin işlemleri için admin client kullan
  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', categoryId);
    
  if (error) {
    console.error(`Kategori silinirken hata (ID: ${categoryId}):`, error);
    throw error;
  }
  return { success: true };
};

// Module Permissions (Modül İzinleri)
export const getModulePermissions = async () => {
  const { data, error } = await supabase
    .from('module_permissions')
    .select('*')
    .single();
    
  if (error) {
    console.error('Modül izinlerini getirirken hata:', error);
    // Varsayılan izinleri dön (hata durumunda)
    return {
      enable_yemek: true,   // Yemek modülü her zaman aktif
      enable_market: true,  // Market modülü her zaman aktif
      enable_su: true,      // Su modülü her zaman aktif
      enable_aktuel: false  // Aktüel modülü varsayılan olarak pasif
    };
  }
  return data || {
    enable_yemek: true,
    enable_market: true,
    enable_su: true,
    enable_aktuel: false
  };
};

export const updateModulePermissions = async (permissions) => {
  // Veritabanında mevcut kayıt var mı kontrol et
  const { data: existingPermissions, error: checkError } = await supabase
    .from('module_permissions')
    .select('id')
    .limit(1);
    
  if (checkError) {
    console.error('Modül izinleri kontrol edilirken hata:', checkError);
    return { success: false, error: checkError };
  }
  
  try {
    let result;
    
    if (existingPermissions && existingPermissions.length > 0) {
      // Mevcut kaydı güncelle
      const { data, error } = await supabase
        .from('module_permissions')
        .update(permissions)
        .eq('id', existingPermissions[0].id)
        .select();
        
      if (error) throw error;
      result = data;
    } else {
      // Yeni kayıt oluştur
      const { data, error } = await supabase
        .from('module_permissions')
        .insert(permissions)
        .select();
        
      if (error) throw error;
      result = data;
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Modül izinleri güncellenirken hata:', error);
    return { success: false, error };
  }
};

// Bir modülün aktif olup olmadığını kontrol et
export const isModuleEnabled = async (moduleName, userRole = 'user') => {
  // Admin her zaman tüm modüllere erişebilir
  if (userRole === 'admin') return true;
  
  // Modül adını doğrula
  const validModules = ['yemek', 'market', 'su', 'aktuel'];
  if (!validModules.includes(moduleName)) {
    console.error(`Geçersiz modül adı: ${moduleName}`);
    return false;
  }
  
  const permissions = await getModulePermissions();
  return permissions[`enable_${moduleName}`] === true;
};

// Users (Kullanıcılar)
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Kullanıcıları getirirken hata:', error);
    return [];
  }
  return data || [];
};

export const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error(`Kullanıcı bilgisini getirirken hata (ID: ${userId}):`, error);
    return null;
  }
  return data;
};

export const createUser = async (email, password, userMetaData) => {
  // userMetaData: { name, first_name, last_name, phone, role, avatar_url etc. }
  // Bu bilgiler supabase.auth.signUp içinde options.data olarak gönderilir
  // ve handle_new_user trigger'ı tarafından public.users tablosuna yazılırken kullanılır.
  const { user, error } = await supabaseApi.signUp(email, password, userMetaData);

  if (error) {
    console.error('Kullanıcı oluşturulurken (Auth):', error);
    // İstemciye hatayı döndür, orada uygun şekilde işlensin.
    return { user: null, error };
  }
  // Başarılı durumda { user, session } içeren bir nesne döner (Supabase v2)
  // veya sadece { user } (eski versiyon veya supabaseApi.signUp'ın dönüşüne bağlı)
  // supabaseApi.signUp { user, error } döndürüyor.
  return { user, error: null };
};

export const updateUser = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) {
    console.error(`Kullanıcı güncellenirken hata (ID: ${userId}):`, error);
    throw error;
  }
  return data;
};

export const deleteUser = async (userId) => {
  try {
    console.log(`Kullanıcı silme işlemi başlatılıyor (ID: ${userId})`);
    
    // Bu fonksiyon, kullanıcıyı hem supabase.auth'dan hem de public.users'dan (trigger aracılığıyla) siler.
    // supabaseApi.deleteAuthUser fonksiyonunu kullanır, o da API route'u kullanır.
    const { data, error } = await supabaseApi.deleteAuthUser(userId);

    if (error) {
      console.error(`Kullanıcı silinirken (Auth & DB) (ID: ${userId}):`, error);
      return { success: false, error: error.message || error };
    }
    
    console.log(`Kullanıcı başarıyla silindi (ID: ${userId})`);
    // handle_user_delete trigger'ı public.users tablosundan silme işlemini gerçekleştirir.
    return { success: true, data };
  } catch (error) {
    console.error(`Kullanıcı silme işleminde beklenmeyen hata (ID: ${userId}):`, error);
    return { success: false, error: error.message || 'Beklenmeyen hata oluştu' };
  }
};

// Ürün ID'sinden mağaza ID'sini bul
export const getStoreIdByProductId = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('store_id')
      .eq('id', productId)
      .single();
    
    if (error) {
      console.error('Ürün mağaza bilgisi alınamadı:', error);
      return null;
    }
    
    return data?.store_id || null;
  } catch (error) {
    console.error('Ürün mağaza bilgisi alırken hata:', error);
    return null;
  }
};

// Storage (Dosya Yükleme)
export const uploadImage = async (file, bucketName = 'products') => {
  try {
    // Kullanıcı authentication durumunu kontrol et
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Upload - Auth User:', user);
    console.log('Upload - Auth Error:', authError);
    
    if (authError) {
      throw new Error(`Authentication hatası: ${authError.message}`);
    }
    
    if (!user) {
      throw new Error('Kullanıcı giriş yapmamış');
    }

    // Dosya formatını kontrol et
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Sadece JPG, PNG, GIF ve WebP formatındaki resimler yüklenebilir.');
    }

    // Dosya boyutunu kontrol et (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Dosya boyutu 5MB\'dan küçük olmalıdır.');
    }

    // Dosya adını oluştur (zaman damgası + orijinal dosya adı)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;

    console.log(`Upload details:`, {
      bucketName,
      fileName,
      fileSize: file.size,
      fileType: file.type,
      userId: user.id
    });

    // Bucket'in var olup olmadığını kontrol et
    const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets();
    console.log('Available buckets:', buckets);
    console.log('Bucket list error:', bucketListError);
    
    if (bucketListError) {
      console.warn('Bucket listesi alınamadı, devam ediliyor:', bucketListError);
    }
    
    // Desteklenen bucket'ları kontrol et
    const supportedBuckets = ['products', 'stores', 'categories', 'avatars', 'pub'];
    if (!supportedBuckets.includes(bucketName)) {
      console.warn(`Desteklenmeyen bucket: ${bucketName}. Varsayılan olarak products kullanılıyor.`);
      bucketName = 'products';
    }
    
    if (buckets && buckets.length > 0) {
      const bucketExists = buckets.find(bucket => bucket.name === bucketName);
      if (!bucketExists) {
        console.warn(`Bucket '${bucketName}' bulunamadı. Mevcut bucket'ler: ${buckets.map(b => b.name).join(', ')}`);
        console.log('Yine de upload işlemi deneniyor...');
      }
    } else {
      console.warn('Bucket listesi boş veya alınamadı, yine de upload işlemi deneniyor...');
    }

    // Supabase Storage'a yükle
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error details:', {
        error,
        message: error.message,
        statusCode: error.statusCode,
        error_description: error.error_description
      });
      throw new Error(`Dosya yüklenirken hata: ${error.message}`);
    }

    console.log('Upload successful, storage data:', data);

    // Public URL'i al
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    console.log('Upload successful, public URL:', urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error('uploadImage error:', error);
    throw error;
  }
};

// Resim silme fonksiyonu
export const deleteImage = async (imageUrl, bucketName = 'products') => {
  try {
    if (!imageUrl) return { success: true };

    // URL'den dosya yolunu çıkar
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    if (!fileName) {
      throw new Error('Geçersiz resim URL\'si');
    }

    console.log(`Deleting file from bucket: ${bucketName}, fileName: ${fileName}`);

    // Supabase Storage'dan sil
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      console.error('Storage delete error:', error);
      throw new Error(`Dosya silinirken hata: ${error.message}`);
    }

    console.log('Delete successful');
    return { success: true };

  } catch (error) {
    console.error('deleteImage error:', error);
    throw error;
  }
};

// Search fonksiyonları
export const searchStores = async (searchParams) => {
  try {
    let query = supabase
      .from('stores')
      .select(`
        *,
        category:categories (id, name, slug)
      `)
      .eq('is_approved', true)
      .eq('status', 'active');

    // Arama sorgusu
    if (searchParams.query && searchParams.query.trim() !== '') {
      const searchTerm = searchParams.query.trim();
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // Kategori filtresi - category_id kullanarak
    if (searchParams.category && searchParams.category !== 'Hepsi') {
      // Önce kategori adından ID'yi bul
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', searchParams.category)
        .single();
      
      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
      }
    }

    // Sıralama
    switch (searchParams.sort) {
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'deliveryTime':
        query = query.order('delivery_time', { ascending: true });
        break;
      case 'minPrice':
        query = query.order('min_order_amount', { ascending: true });
        break;
      case 'distance':
        // Mesafe sıralaması için koordinat gerekir - şimdilik name'e göre sırala
        query = query.order('name', { ascending: true });
        break;
      case 'relevance':
      default:
        query = query.order('name', { ascending: true });
        break;
    }

    const { data, error } = await query;

    if (error) {
      console.error('Mağaza arama hatası:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Mağaza arama beklenmeyen hatası:', error);
    return [];
  }
};

export const searchProducts = async (searchParams) => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        store:stores!inner (id, name, status, category_id, is_approved)
      `)
      .eq('is_available', true)
      .eq('store.status', 'active')
      .eq('store.is_approved', true);

    // Arama sorgusu
    if (searchParams.query && searchParams.query.trim() !== '') {
      const searchTerm = searchParams.query.trim();
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // Kategori filtresi
    if (searchParams.category && searchParams.category !== 'Hepsi') {
      query = query.eq('category', searchParams.category);
    }

    // Sıralama
    switch (searchParams.sort) {
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'minPrice':
        query = query.order('price', { ascending: true });
        break;
      case 'maxPrice':
        query = query.order('price', { ascending: false });
        break;
      case 'relevance':
      default:
        query = query.order('name', { ascending: true });
        break;
    }

    const { data, error } = await query;

    if (error) {
      console.error('Ürün arama hatası:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Ürün arama beklenmeyen hatası:', error);
    return [];
  }
};

// Commission (Komisyon) API fonksiyonları
export const getStoreCommissionSummary = async (storeId) => {
  try {
    if (!storeId) {
      console.warn('getStoreCommissionSummary: storeId parametresi eksik');
      return null;
    }

    const { data, error } = await supabase
      .from('store_commission_summary')
      .select('*')
      .eq('store_id', storeId)
      .single();
      
    if (error) {
      // Eğer kayıt bulunamadıysa, bu normal bir durum olabilir
      if (error.code === 'PGRST116') {
        console.log(`Mağaza komisyon özeti bulunamadı (Store ID: ${storeId}). Özet tablosu güncellenecek.`);
        return null;
      }
      console.warn(`Mağaza komisyon özeti getirirken hata (Store ID: ${storeId}):`, error.message || error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Komisyon özeti getirirken beklenmeyen hata:', error.message || error);
    return null;
  }
};

export const getCommissionCalculations = async (filters = {}) => {
  try {
    let query = supabase
      .from('commission_calculations')
      .select(`
        *,
        order:orders(order_date, status, customer_id),
        store:stores(name)
      `)
      .order('calculated_at', { ascending: false });

    if (filters.store_id) {
      query = query.eq('store_id', filters.store_id);
    }
    
    if (filters.order_id) {
      query = query.eq('order_id', filters.order_id);
    }
    
    if (filters.date_from) {
      query = query.gte('calculated_at', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.lte('calculated_at', filters.date_to);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Komisyon hesaplamaları getirirken hata:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Komisyon hesaplamaları getirirken beklenmeyen hata:', error);
    return [];
  }
};

export const updateStoreCommissionSummary = async (storeId) => {
  try {
    const { error } = await supabase.rpc('update_store_commission_summary', {
      target_store_id: storeId
    });
    
    if (error) {
      console.error(`Mağaza komisyon özeti güncellenirken hata (Store ID: ${storeId}):`, error);
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Komisyon özeti güncellenirken beklenmeyen hata:', error);
    throw error;
  }
};

export const createCommissionCalculation = async (orderData) => {
  try {
    // Mağazanın komisyon oranını al
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('commission_rate')
      .eq('id', orderData.store_id)
      .single();
      
    if (storeError) {
      console.error('Mağaza komisyon oranı alınırken hata:', storeError);
      throw storeError;
    }
    
    const commissionRate = store.commission_rate || 0;
    const commissionAmount = (orderData.total * commissionRate) / 100;
    const netAmount = orderData.total - commissionAmount;
    
    const { data, error } = await supabase
      .from('commission_calculations')
      .insert({
        order_id: orderData.order_id,
        store_id: orderData.store_id,
        order_total: orderData.total,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        net_amount: netAmount
      })
      .select()
      .single();
      
    if (error) {
      console.error('Komisyon hesaplama kaydı oluştururken hata:', error);
      throw error;
    }
    
    // Özet tabloyu güncelle
    await updateStoreCommissionSummary(orderData.store_id);
    
    return data;
  } catch (error) {
    console.error('Komisyon hesaplama oluştururken beklenmeyen hata:', error);
    throw error;
  }
};

export const getAllCommissionSummaries = async () => {
  try {
    const { data, error } = await supabase
      .from('store_commission_summary')
      .select(`
        *,
        store:stores(name, email, phone, status, is_approved)
      `)
      .order('total_revenue', { ascending: false });
      
    if (error) {
      console.error('Tüm komisyon özetleri getirirken hata:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Komisyon özetleri getirirken beklenmeyen hata:', error);
    return [];
  }
};

// Notifications (Bildirimler)
export const getNotifications = async (filters = {}) => {
  let query = supabase
    .from('notifications')
    .select('*');
    
  // Filtreleri uygula
  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id);
  }
  
  if (filters.store_id) {
    query = query.eq('store_id', filters.store_id);
  }
  
  if (filters.type) {
    query = query.eq('type', filters.type);
  }
  
  if (filters.is_read !== undefined) {
    query = query.eq('is_read', filters.is_read);
  }
  
  // Tarihe göre sırala (en yeni önce)
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Bildirimleri getirirken hata:', error);
    return [];
  }
  return data || [];
};

// Yeni bildirim oluştur
export const createNotification = async (notificationData) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      ...notificationData,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error('Bildirim oluştururken hata:', error);
    throw error;
  }
  return data;
};

// Bildirimi okundu olarak işaretle
export const markNotificationAsRead = async (notificationId) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ 
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('id', notificationId)
    .select()
    .single();
    
  if (error) {
    console.error(`Bildirim okundu işaretlenirken hata (ID: ${notificationId}):`, error);
    throw error;
  }
  return data;
};

// Bildirimi okunmadı olarak işaretle
export const markNotificationAsUnread = async (notificationId) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ 
      is_read: false,
      read_at: null
    })
    .eq('id', notificationId)
    .select()
    .single();
    
  if (error) {
    console.error(`Bildirim okunmadı işaretlenirken hata (ID: ${notificationId}):`, error);
    throw error;
  }
  return data;
};

// Tüm bildirimleri okundu olarak işaretle
export const markAllNotificationsAsRead = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ 
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('is_read', false);
    
  if (error) {
    console.error(`Tüm bildirimler okundu işaretlenirken hata (User ID: ${userId}):`, error);
    throw error;
  }
  return data;
};

// Bildirimi sil
export const deleteNotification = async (notificationId) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
    
  if (error) {
    console.error(`Bildirim silinirken hata (ID: ${notificationId}):`, error);
    throw error;
  }
  return { success: true };
};

// Okunmamış bildirim sayısını getir
export const getUnreadNotificationCount = async (userId) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
    
  if (error) {
    console.error(`Okunmamış bildirim sayısı getirirken hata (User ID: ${userId}):`, error);
    return 0;
  }
  return count || 0;
};

// Sipariş durumu değiştiğinde bildirim oluştur
export const createOrderStatusNotification = async (orderId, status, userId) => {
  const statusMessages = {
    pending: {
      title: 'Siparişiniz Beklemede',
      message: 'Siparişiniz alındı ve onay bekliyor.',
      type: 'order_pending'
    },
    processing: {
      title: 'Siparişiniz Hazırlanıyor',
      message: 'Siparişiniz onaylandı ve şu anda hazırlanıyor.',
      type: 'order_processing'
    },
    shipped: {
      title: 'Kurye Yola Çıktı',
      message: 'Siparişiniz kurye tarafından teslim edilmek üzere yola çıktı.',
      type: 'order_shipped'
    },
    delivered: {
      title: 'Siparişiniz Teslim Edildi',
      message: 'Siparişiniz başarıyla teslim edildi. Afiyet olsun!',
      type: 'order_delivered'
    },
    cancelled: {
      title: 'Siparişiniz İptal Edildi',
      message: 'Siparişiniz iptal edildi. Ödeme iadesi yapılacaktır.',
      type: 'order_cancelled'
    }
  };

  const statusConfig = statusMessages[status];
  if (!statusConfig) {
    console.error(`Geçersiz sipariş durumu: ${status}`);
    return;
  }

  try {
    const result = await createNotification({
      user_id: userId,
      type: statusConfig.type,
      title: statusConfig.title,
      message: statusConfig.message,
      data: { order_id: orderId },
      is_read: false
    });
    
    console.log(`✅ Sipariş durumu bildirimi gönderildi: ${status} -> ${userId}`);
    return result;
  } catch (error) {
    console.error('❌ Sipariş durumu bildirimi oluştururken hata:', error);
    throw error;
  }
};

// Mağaza sahibine yeni sipariş bildirimi gönder
export const createNewOrderNotification = async (orderId, storeOwnerId, customerName, totalAmount) => {
  try {
    return await createNotification({
      user_id: storeOwnerId,
      type: 'new_order',
      title: 'Yeni Sipariş Geldi',
      message: `${customerName} adlı müşteriden yeni bir sipariş geldi. Toplam tutar: ${totalAmount.toFixed(2)} TL`,
      data: { 
        order_id: orderId, 
        customer_name: customerName, 
        amount: totalAmount 
      },
      is_read: false
    });
  } catch (error) {
    console.error('Yeni sipariş bildirimi oluştururken hata:', error);
    throw error;
  }
};

// Admin'e yeni mağaza kaydı bildirimi gönder
export const createStoreRegistrationNotification = async (storeName, ownerName, storeId) => {
  try {
    // Admin kullanıcılarını al
    const { data: admins, error } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin');

    if (error) {
      console.error('Admin kullanıcıları getirirken hata:', error);
      throw error;
    }

    // Her admin'e bildirim oluştur
    const notifications = admins.map(admin => 
      createNotification({
        user_id: admin.id,
        type: 'store_registered',
        title: 'Yeni Mağaza Kaydı',
        message: `"${storeName}" adlı mağaza kaydoldu ve onay bekliyor.`,
        data: { 
          store_name: storeName, 
          owner_name: ownerName,
          store_id: storeId
        },
        is_read: false
      })
    );

    return await Promise.all(notifications);
  } catch (error) {
    console.error('Mağaza kayıt bildirimi oluştururken hata:', error);
    throw error;
  }
};

// Admin Statistics (Admin İstatistikleri)
export const getAdminStats = async () => {
  try {
    // Paralel olarak tüm istatistikleri al
    const [
      usersResult,
      storesResult,
      ordersResult,
      pendingOrdersResult,
      pendingStoresResult,
      revenueResult
    ] = await Promise.all([
      // Toplam kullanıcı sayısı
      supabase.from('users').select('*', { count: 'exact', head: true }),
      
      // Toplam mağaza sayısı
      supabase.from('stores').select('*', { count: 'exact', head: true }),
      
      // Toplam sipariş sayısı
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      
      // Onay bekleyen siparişler
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      
      // Onay bekleyen mağazalar
      supabase.from('stores').select('*', { count: 'exact', head: true }).eq('is_approved', false),
      
      // Bu ayın toplam geliri
      supabase.from('orders')
        .select('total')
        .eq('payment_status', 'paid')
        .gte('order_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    ]);

    // Hataları kontrol et
    if (usersResult.error) throw usersResult.error;
    if (storesResult.error) throw storesResult.error;
    if (ordersResult.error) throw ordersResult.error;
    if (pendingOrdersResult.error) throw pendingOrdersResult.error;
    if (pendingStoresResult.error) throw pendingStoresResult.error;
    if (revenueResult.error) throw revenueResult.error;

    // Gelir hesaplama
    const monthlyRevenue = revenueResult.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

    return {
      totalUsers: usersResult.count || 0,
      totalStores: storesResult.count || 0,
      totalOrders: ordersResult.count || 0,
      pendingOrders: pendingOrdersResult.count || 0,
      pendingStores: pendingStoresResult.count || 0,
      monthlyRevenue: monthlyRevenue
    };
  } catch (error) {
    console.error('Admin istatistikleri alınırken hata:', error);
    return {
      totalUsers: 0,
      totalStores: 0,
      totalOrders: 0,
      pendingOrders: 0,
      pendingStores: 0,
      monthlyRevenue: 0
    };
  }
};

// Günlük sipariş istatistikleri (son 7 gün)
export const getDailyOrderStats = async (days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('orders')
      .select('order_date, total, status')
      .gte('order_date', startDate.toISOString())
      .order('order_date', { ascending: true });

    if (error) throw error;

    // Günlere göre grupla
    const dailyStats = {};
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyStats[dateKey] = {
        date: dateKey,
        orders: 0,
        revenue: 0,
        completed: 0,
        cancelled: 0
      };
    }

    // Verileri işle
    data.forEach(order => {
      const dateKey = order.order_date.split('T')[0];
      if (dailyStats[dateKey]) {
        dailyStats[dateKey].orders++;
        dailyStats[dateKey].revenue += order.total || 0;
        
        if (order.status === 'delivered') {
          dailyStats[dateKey].completed++;
        } else if (order.status === 'cancelled') {
          dailyStats[dateKey].cancelled++;
        }
      }
    });

    return Object.values(dailyStats).reverse();
  } catch (error) {
    console.error('Günlük sipariş istatistikleri alınırken hata:', error);
    return [];
  }
};

// Kategori bazlı sipariş istatistikleri
export const getCategoryStats = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        total,
        store_id,
        stores!store_id(category_id, categories!category_id(name))
      `)
      .eq('payment_status', 'paid');

    if (error) throw error;

    const categoryStats = {};
    
    data.forEach(order => {
      const categoryName = order.stores?.categories?.name || 'Diğer';
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = {
          name: categoryName,
          orders: 0,
          revenue: 0
        };
      }
      categoryStats[categoryName].orders++;
      categoryStats[categoryName].revenue += order.total || 0;
    });

    return Object.values(categoryStats);
  } catch (error) {
    console.error('Kategori istatistikleri alınırken hata:', error);
    return [];
  }
};

// En çok sipariş alan mağazalar (top 10)
export const getTopStores = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        store_id,
        total,
        stores!store_id(name, rating, review_count)
      `)
      .eq('payment_status', 'paid');

    if (error) throw error;

    const storeStats = {};
    
    data.forEach(order => {
      const storeId = order.store_id;
      if (!storeStats[storeId]) {
        storeStats[storeId] = {
          id: storeId,
          name: order.stores?.name || 'Bilinmeyen Mağaza',
          rating: order.stores?.rating || 0,
          reviewCount: order.stores?.review_count || 0,
          orders: 0,
          revenue: 0
        };
      }
      storeStats[storeId].orders++;
      storeStats[storeId].revenue += order.total || 0;
    });

    return Object.values(storeStats)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, limit);
  } catch (error) {
    console.error('En çok sipariş alan mağazalar alınırken hata:', error);
    return [];
  }
};

// Son kullanıcı aktiviteleri
export const getRecentUserActivities = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_date,
        total,
        status,
        customer_id,
        store_id,
        users!customer_id(name, email),
        stores!store_id(name)
      `)
      .order('order_date', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map(order => ({
      id: order.id,
      date: order.order_date,
      customerName: order.users?.name || 'Bilinmeyen Kullanıcı',
      customerEmail: order.users?.email || '',
      storeName: order.stores?.name || 'Bilinmeyen Mağaza',
      total: order.total || 0,
      status: order.status
    }));
  } catch (error) {
    console.error('Son kullanıcı aktiviteleri alınırken hata:', error);
    return [];
  }
};

export default {
  getStores,
  getStoreById,
  getStoreByOwnerId,
  getStoreByUserId,
  getStoresByCategory,
  getProducts,
  getProductById,
  getProductsByStoreId,
  getAllOrders,
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrder,
  getCampaigns,
  getCampaignById,
  getCampaignByCode,
  getUserProfile,
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getStoreReviews,
  getReviews,
  getUserReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReviewForStore,
  updateStoreRating,
  getUserCartItems,
  addToCart,
  updateCartItem,
  removeFromCart,
  getCategories,
  getMainCategories,
  getAllSubcategories,
  getSubcategoriesByParentId,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateModulePermissions,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  createStore,
  updateStore,
  updateStoreStatus,
  deleteStore,
  getStoreIdByProductId,
  getModulePermissions,
  isModuleEnabled,
  uploadImage,
  deleteImage,
  searchStores,
  searchProducts,
  getStoreCommissionSummary,
  getCommissionCalculations,
  updateStoreCommissionSummary,
  createCommissionCalculation,
  getAllCommissionSummaries,
  getNotifications,
  createNotification,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
  createOrderStatusNotification,
  createNewOrderNotification,
  createStoreRegistrationNotification,
  getAdminStats,
  getDailyOrderStats,
  getCategoryStats,
  getTopStores,
  getRecentUserActivities
}; 