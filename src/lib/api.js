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
      owner:users (id, name, email, phone),
      category:categories (id, name, slug)
    `)
    .eq('id', storeId)
    .single();
    
  if (error) {
    console.error(`Mağaza bilgisini getirirken hata (ID: ${storeId}):`, error);
    return null;
  }
  
  // Çalışma saatlerini ayrıca çek
  const { data: workingHours, error: workingHoursError } = await supabase
    .from('store_working_hours')
    .select('*')
    .eq('store_id', storeId)
    .order('day_of_week');
  
  if (workingHoursError) {
    console.error(`Mağaza çalışma saatlerini getirirken hata (ID: ${storeId}):`, workingHoursError);
  } else {
    data.working_hours = workingHours || [];
  }
  
  return data;
};

export const getStoreByOwnerId = async (ownerId) => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select(`
        *,
        owner:users (id, name, email, phone),
        category:categories (id, name, slug)
      `)
      .eq('owner_id', ownerId)
      .single();
      
    if (error) {
      console.error(`Mağaza bilgisini getirirken hata (Owner ID: ${ownerId}):`, error);
      return null;
    }
    
    // Çalışma saatlerini ayrıca çek
    const { data: workingHours, error: workingHoursError } = await supabase
      .from('store_working_hours')
      .select('*')
      .eq('store_id', data.id)
      .order('day_of_week');
    
    if (workingHoursError) {
      console.error(`Mağaza çalışma saatlerini getirirken hata (Store ID: ${data.id}):`, workingHoursError);
    } else {
      data.working_hours = workingHours || [];
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
  
  const { data, error } = await supabase
    .from('stores')
    .update(updates)
    .eq('id', storeId)
    .select()
    .single();
    
  if (error) {
    console.error(`Mağaza güncellenirken hata (ID: ${storeId}):`, error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }
  
  console.log('updateStore successful, returned data:', data);
  return data;
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
  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id', storeId);
    
  if (error) {
    console.error(`Mağaza silinirken hata (ID: ${storeId}):`, error);
    throw error;
  }
  return { success: true };
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
  const { data, error } = await supabase
    .from('cart_items')
    .insert(cartItem)
    .select();
    
  if (error) {
    console.error('Sepete ürün eklerken hata:', error);
    return { success: false, error };
  }
  return { success: true, data: data[0] };
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
  // Bu fonksiyon, kullanıcıyı hem supabase.auth'dan hem de public.users'dan (trigger aracılığıyla) siler.
  // supabaseApi.deleteAuthUser fonksiyonunu kullanır, o da supabaseAdmin client'ını kullanır.
  const { error } = await supabaseApi.deleteAuthUser(userId);

  if (error) {
    console.error(`Kullanıcı silinirken (Auth & DB) (ID: ${userId}):`, error);
    return { success: false, error };
  }
  // handle_user_delete trigger'ı public.users tablosundan silme işlemini gerçekleştirir.
  return { success: true, error: null };
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
    getUserProfile,  getUserAddresses,  createAddress,  updateAddress,  deleteAddress,  getStoreReviews,
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
  createProduct,
  updateProduct,
  deleteProduct,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getStoreIdByProductId,
  getModulePermissions,
  isModuleEnabled,
  uploadImage,
  deleteImage,
  searchStores,
  searchProducts
}; 