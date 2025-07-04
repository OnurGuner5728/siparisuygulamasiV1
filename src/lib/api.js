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
  
  // Rating filtresi
  if (filters.rating && filters.rating > 0) {
    query = query.gte('rating', filters.rating);
  }
  
  // Açık olanlar filtresi için is_active = true ve status = 'active' kontrolü
  if (filters.isOpen) {
    query = query.eq('is_active', true).eq('status', 'active');
  }
  
  // Sonuçları sırala
  query = query.order('name');
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Mağazaları getirirken hata:', error);
    return [];
  }
  
  // is_open alanını dinamik olarak hesapla
  const storesWithOpenStatus = (data || []).map(store => ({
    ...store,
    is_open: store.is_active && store.status === 'active'
  }));
  
  return storesWithOpenStatus;
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

// Product Options (Ürün Seçenekleri)
export const getProductOptions = async (productId) => {
  const { data, error } = await supabase
    .from('product_option_groups')
    .select(`
      *,
      options:product_options(*)
    `)
    .eq('product_id', productId)
    .order('sort_order');
    
  if (error) {
    console.error(`Ürün seçeneklerini getirirken hata (ID: ${productId}):`, error);
    return [];
  }
  return data || [];
};

export const getProductWithOptions = async (productId) => {
  // Ana ürün bilgisini al
  const product = await getProductById(productId);
  if (!product) return null;
  
  // Ürün seçeneklerini al
  const options = await getProductOptions(productId);
  
  return {
    ...product,
    option_groups: options
  };
};

export const createProductOptionGroup = async (groupData) => {
  const { data, error } = await supabase
    .from('product_option_groups')
    .insert(groupData)
    .select()
    .single();
    
  if (error) {
    console.error('Ürün seçenek grubu oluştururken hata:', error);
    throw error;
  }
  return data;
};

export const createProductOption = async (optionData) => {
  const { data, error } = await supabase
    .from('product_options')
    .insert(optionData)
    .select()
    .single();
    
  if (error) {
    console.error('Ürün seçeneği oluştururken hata:', error);
    throw error;
  }
  return data;
};

export const updateProductOptionGroup = async (groupId, updates) => {
  const { data, error } = await supabase
    .from('product_option_groups')
    .update(updates)
    .eq('id', groupId)
    .select()
    .single();
    
  if (error) {
    console.error(`Ürün seçenek grubu güncellenirken hata (ID: ${groupId}):`, error);
    throw error;
  }
  return data;
};

export const updateProductOption = async (optionId, updates) => {
  const { data, error } = await supabase
    .from('product_options')
    .update(updates)
    .eq('id', optionId)
    .select()
    .single();
    
  if (error) {
    console.error(`Ürün seçeneği güncellenirken hata (ID: ${optionId}):`, error);
    throw error;
  }
  return data;
};

export const deleteProductOptionGroup = async (groupId) => {
  const { error } = await supabase
    .from('product_option_groups')
    .delete()
    .eq('id', groupId);
    
  if (error) {
    console.error(`Ürün seçenek grubu silinirken hata (ID: ${groupId}):`, error);
    throw error;
  }
  return { success: true };
};

export const deleteProductOption = async (optionId) => {
  const { error } = await supabase
    .from('product_options')
    .delete()
    .eq('id', optionId);
    
  if (error) {
    console.error(`Ürün seçeneği silinirken hata (ID: ${optionId}):`, error);
    throw error;
  }
  return { success: true };
};

// Orders (Siparişler)
export const getAllOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users!orders_user_id_fkey(id, name, email, phone),
        store:stores!orders_store_id_fkey(id, name, email, phone, category_id)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Tüm siparişler yüklenirken hata:', error);
    throw error;
  }
};

export const getUserOrders = async (userId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      store:stores(name, logo_url, category_id),
      order_items(count)
    `)
    .eq('user_id', userId)
    .order('order_date', { ascending: false });

  if (error) {
    console.error(`Kullanıcı siparişlerini getirirken hata (ID: ${userId}):`, error);
    return [];
  }
  return data || [];
};

export const getOrderById = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users!orders_user_id_fkey(id, name, email, phone),
        store:stores!orders_store_id_fkey(id, name, email, phone, address)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Sipariş ${orderId} yüklenirken hata:`, error);
    throw error;
  }
};

export const createOrder = async (orderData, orderItems = []) => {
  if (!orderData.user_id) {
    console.error('Sipariş oluşturmak için user_id gereklidir');
    return { success: false, error: 'User ID gereklidir' };
  }

  try {
    // Sipariş numarası oluştur
    const orderNumber = 'ES' + Date.now() + Math.floor(Math.random() * 1000);

    // Siparişi oluştur
    const { data: orderData_result, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        store_id: orderData.store_id,
        user_id: orderData.user_id,
        status: orderData.status || 'pending',
        payment_status: orderData.payment_status || 'pending',
        payment_method: orderData.payment_method,
        subtotal: orderData.subtotal,
        tax_amount: orderData.tax_amount || 0,
        delivery_fee: orderData.delivery_fee || 0,
        discount_amount: orderData.discount_amount || 0,
        total_amount: orderData.total_amount,
        currency: orderData.currency || 'TRY',
        delivery_address: orderData.delivery_address,
        delivery_notes: orderData.delivery_notes,
        estimated_delivery_time: orderData.estimated_delivery_time,
        notes: orderData.notes,
        order_date: orderData.order_date || new Date().toISOString()
      })
      .select()
      .single();

    if (orderError) {
      console.error('Sipariş oluştururken hata:', orderError);
      return { success: false, error: orderError.message };
    }

    // Sipariş öğelerini ekle
    if (orderItems && orderItems.length > 0) {
      const orderItemsToInsert = await Promise.all(orderItems.map(async (item) => {
        // Ürün bilgilerini al
        let productName = item.name;
        let productPrice = item.price;
        
        if (!productName || !productPrice) {
          try {
            const product = await getProductById(item.product_id);
            if (product) {
              productName = productName || product.name;
              productPrice = productPrice || product.price;
            }
          } catch (e) {
            console.warn('Ürün bilgisi alınamadı:', item.product_id);
          }
        }
        
        return {
          order_id: orderData_result.id,
          product_id: item.product_id,
          quantity: item.quantity,
          name: productName,
          price: productPrice,
          unit_price: item.price, // price yerine unit_price kullan
          total_price: item.total || (item.price * item.quantity), // total yerine total_price kullan
          total: item.total || (item.price * item.quantity),
          notes: item.notes || ''
        };
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) {
        console.error('Sipariş öğeleri eklenirken hata:', itemsError);
        // Siparişi geri al
        await supabase.from('orders').delete().eq('id', orderData_result.id);
        return { success: false, error: itemsError.message };
      }
    }

    // Kullanıcı bilgilerini güncelle
    await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', orderData.user_id);

    // Komisyon özetini güncelle
    try {
      await updateStoreCommissionSummary(orderData.store_id);
      console.log('Yeni sipariş için komisyon özeti güncellendi:', orderData.store_id);
    } catch (commissionError) {
      console.warn('Komisyon özeti güncellenirken hata:', commissionError);
      // Komisyon güncelleme hatası sipariş oluşturmayı engellemez
    }

    return { success: true, data: orderData_result };
  } catch (err) {
    console.error('Sipariş oluşturma sırasında beklenmedik hata:', err);
    return { success: false, error: 'Beklenmedik hata oluştu' };
  }
};

export const updateOrder = async (orderId, updates) => {
  try {
    // delivery_date alanını actual_delivery_time olarak düzelt
    if (updates.delivery_date) {
      updates.actual_delivery_time = updates.delivery_date;
      delete updates.delivery_date;
    }

    // Eğer status_history güncellenmek isteniyorsa, önce mevcut veriyi al
    if (updates.status_history) {
      // Mevcut sipariş verilerini al
      const { data: currentOrder } = await supabase
        .from('orders')
        .select('status_history')
        .eq('id', orderId)
        .single();
        
      let existingHistory = [];
      if (currentOrder?.status_history) {
        try {
          existingHistory = Array.isArray(currentOrder.status_history) 
            ? currentOrder.status_history 
            : JSON.parse(currentOrder.status_history);
        } catch (e) {
          console.warn('Status history parse edilemedi:', e);
          existingHistory = [];
        }
      }
      
      // Yeni history item'ı ekle
      const newHistoryItem = Array.isArray(updates.status_history) 
        ? updates.status_history[0] 
        : updates.status_history;
        
      existingHistory.push(newHistoryItem);
      updates.status_history = JSON.stringify(existingHistory);
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();
      
    if (error) {
      console.error(`Sipariş güncellenirken hata (ID: ${orderId}):`, error);
      throw new Error(error.message || 'Sipariş güncellenemedi');
    }
    
    // Eğer sipariş durumu "delivered" veya "cancelled" olmuşsa komisyon özetini güncelle
    if (updates.status && (updates.status === 'delivered' || updates.status === 'cancelled')) {
      try {
        await updateStoreCommissionSummary(data.store_id);
        console.log('Komisyon özeti güncellendi:', data.store_id);
      } catch (commissionError) {
        console.warn('Komisyon özeti güncellenirken hata:', commissionError);
        // Komisyon güncelleme hatası sipariş güncellemesini engellemez
      }
    }
    
    return data;
  } catch (error) {
    console.error(`Sipariş güncellenirken hata (ID: ${orderId}):`, error);
    throw error;
  }
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
      store:stores (id, name, logo_url, category_id)
    `)
    .eq('is_active', true) // Sadece aktif kampanyalar
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
    .eq('is_active', 'true')
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

// Kampanya afişleri API fonksiyonları
export const getCampaignBanners = async (category = null, useAdmin = false) => {
  const client = useAdmin ? supabaseAdmin : supabase;
  
  let query = client
    .from('campaigns')
    .select('*')
    .eq('is_active', true)
    .not('banner_image_url', 'is', null)
    .not('banner_image_url', 'eq', '')
    .gte('end_date', new Date().toISOString())
    .order('priority_order', { ascending: false })
    .order('created_at', { ascending: false });

  if (category) {
    // Kategori adını normalize et - ilk harfi büyük yap
    const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    query = query.eq('campaign_category', normalizedCategory);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Kampanya afişlerini getirirken hata:', error);
    return [];
  }
  
  return data || [];
};

// Campaign banner fonksiyonları kaldırıldı - artık campaigns.banner_image_url kullanılıyor

// Kampanya başvuruları API fonksiyonları
export const getCampaignApplications = async (filters = {}) => {
  let query = supabase
    .from('campaign_applications')
    .select(`
      *,
      campaign:campaigns (id, name, description, type, value, start_date, end_date, is_active),
      store:stores (id, name, category_id),
      applicant:users!campaign_applications_user_id_fkey (id, name, email)
    `);

  if (filters.campaign_id) {
    query = query.eq('campaign_id', filters.campaign_id);
  }
  
  if (filters.store_id) {
    query = query.eq('store_id', filters.store_id);
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  query = query.order('applied_at', { ascending: false });

  const { data, error } = await query;
  
  if (error) {
    console.error('Kampanya başvurularını getirirken hata:', error);
    return [];
  }
  return data || [];
};

export const createCampaignApplication = async (applicationData) => {
  const { data, error } = await supabase
    .from('campaign_applications')
    .insert(applicationData)
    .select()
    .single();
  
  if (error) {
    console.error('Kampanya başvurusu oluştururken hata:', error);
    throw error;
  }
  return data;
};

export const updateCampaignApplication = async (applicationId, updates) => {
  const { data, error } = await supabase
    .from('campaign_applications')
    .update(updates)
    .eq('id', applicationId)
    .select()
    .single();
  
  if (error) {
    console.error(`Kampanya başvurusu güncellenirken hata (ID: ${applicationId}):`, error);
    throw error;
  }
  return data;
};

export const approveCampaignApplication = async (applicationId, reviewedBy) => {
  const { data, error } = await supabase
    .from('campaign_applications')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy
    })
    .eq('id', applicationId)
    .select()
    .single();
  
  if (error) {
    console.error(`Kampanya başvurusu onaylanırken hata (ID: ${applicationId}):`, error);
    throw error;
  }
  
  // Onaylanan başvuru için store_campaign_participations tablosuna kayıt ekle
  if (data) {
    await createStoreCampaignParticipation({
      store_id: data.store_id,
      campaign_id: data.campaign_id,
      status: 'active'
    });
  }
  
  return data;
};

export const rejectCampaignApplication = async (applicationId, reviewedBy, notes = '') => {
  const { data, error } = await supabase
    .from('campaign_applications')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
      notes: notes
    })
    .eq('id', applicationId)
    .select()
    .single();
  
  if (error) {
    console.error(`Kampanya başvurusu reddedilirken hata (ID: ${applicationId}):`, error);
    throw error;
  }
  return data;
};

// Mağaza kampanya katılımları API fonksiyonları
export const getStoreCampaignParticipations = async (filters = {}) => {
  let query = supabase
    .from('store_campaign_participations')
    .select(`
      *,
      store:stores (id, name, category_id),
      campaign:campaigns (id, name, description, type, value, start_date, end_date, is_active)
    `);

  if (filters.store_id) {
    query = query.eq('store_id', filters.store_id);
  }
  
  if (filters.campaign_id) {
    query = query.eq('campaign_id', filters.campaign_id);
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  query = query.order('joined_at', { ascending: false });

  const { data, error } = await query;
  
  if (error) {
    console.error('Mağaza kampanya katılımlarını getirirken hata:', error);
    return [];
  }
  return data || [];
};

export const createStoreCampaignParticipation = async (participationData) => {
  const { data, error } = await supabase
    .from('store_campaign_participations')
    .insert(participationData)
    .select()
    .single();
  
  if (error) {
    console.error('Mağaza kampanya katılımı oluştururken hata:', error);
    throw error;
  }
  return data;
};

export const updateStoreCampaignParticipation = async (participationId, updates) => {
  const { data, error } = await supabase
    .from('store_campaign_participations')
    .update(updates)
    .eq('id', participationId)
    .select()
    .single();
  
  if (error) {
    console.error(`Mağaza kampanya katılımı güncellenirken hata (ID: ${participationId}):`, error);
    throw error;
  }
  return data;
};

// Kampanya kuralları API fonksiyonları
export const getCampaignRules = async () => {
  const { data, error } = await supabase
    .from('campaign_rules')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Kampanya kurallarını getirirken hata:', error);
    return [];
  }
  return data || [];
};

export const createCampaignRule = async (ruleData) => {
  const { data, error } = await supabase
    .from('campaign_rules')
    .insert(ruleData)
    .select()
    .single();
  
  if (error) {
    console.error('Kampanya kuralı oluştururken hata:', error);
    throw error;
  }
  return data;
};

export const updateCampaignRule = async (ruleId, updates) => {
  const { data, error } = await supabase
    .from('campaign_rules')
    .update(updates)
    .eq('id', ruleId)
    .select()
    .single();
  
  if (error) {
    console.error(`Kampanya kuralı güncellenirken hata (ID: ${ruleId}):`, error);
    throw error;
  }
  return data;
};

export const deleteCampaignRule = async (ruleId) => {
  const { error } = await supabase
    .from('campaign_rules')
    .delete()
    .eq('id', ruleId);
  
  if (error) {
    console.error(`Kampanya kuralı silinirken hata (ID: ${ruleId}):`, error);
    throw error;
  }
  return { success: true };
};

// Kampanya uygunluk kontrolü
export const checkCampaignEligibility = async (storeId, campaignId) => {
  try {
    // Kampanya kurallarını al
    const rules = await getCampaignRules();
    const activeRule = rules.find(rule => rule.id) || rules[0]; // İlk kuralı varsayılan olarak al
    
    if (!activeRule) {
      return { eligible: true, reason: null };
    }
    
    // Mağazanın mevcut aktif kampanyalarını kontrol et
    const activeParticipations = await getStoreCampaignParticipations({
      store_id: storeId,
      status: 'active'
    });
    
    // Çoklu kampanya katılımına izin verilip verilmediğini kontrol et
    if (!activeRule.allow_multiple_campaigns && activeParticipations.length > 0) {
      return {
        eligible: false,
        reason: 'Bu mağaza zaten aktif bir kampanyaya katılıyor ve çoklu kampanya katılımına izin verilmiyor.'
      };
    }
    
    // Maksimum kampanya sayısını kontrol et
    if (activeParticipations.length >= activeRule.max_campaigns_per_store) {
      return {
        eligible: false,
        reason: `Mağaza maksimum ${activeRule.max_campaigns_per_store} kampanyaya katılabilir.`
      };
    }
    
    return { eligible: true, reason: null };
  } catch (error) {
    console.error('Kampanya uygunluk kontrolü sırasında hata:', error);
    return { eligible: false, reason: 'Uygunluk kontrolü yapılamadı.' };
  }
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

export const getUserAddresses = async (userId) => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error(`Kullanıcı adreslerini getirirken hata (ID: ${userId}):`, error);
    return [];
  }
  return data || [];
};

export const createAddress = async (addressData) => {
  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: addressData.user_id,
      title: addressData.title,
      type: addressData.type || 'home',
      full_name: addressData.full_name,
      phone: addressData.phone,
      city: addressData.city,
      district: addressData.district,
      neighborhood: addressData.neighborhood,
      street: addressData.street,
      building_number: addressData.building_number,
      floor: addressData.floor,
      apartment_number: addressData.apartment_number,
      directions: addressData.directions,
      full_address: addressData.full_address,
      postal_code: addressData.postal_code,
      country: addressData.country || 'Turkey',
      is_default: addressData.is_default || false
    })
    .select()
    .single();
    
  if (error) {
    console.error('Adres oluştururken hata:', error);
    throw error;
  }
  return data;
};

export const updateAddress = async (addressId, addressData) => {
  const { data, error } = await supabase
    .from('addresses')
    .update({
      title: addressData.title,
      type: addressData.type,
      full_name: addressData.full_name,
      phone: addressData.phone,
      city: addressData.city,
      district: addressData.district,
      neighborhood: addressData.neighborhood,
      street: addressData.street,
      building_number: addressData.building_number,
      floor: addressData.floor,
      apartment_number: addressData.apartment_number,
      directions: addressData.directions,
      full_address: addressData.full_address,
      postal_code: addressData.postal_code,
      is_default: addressData.is_default
    })
    .eq('id', addressId)
    .select()
    .single();
    
  if (error) {
    console.error('Adres güncellenirken hata:', error);
    throw error;
  }
  return data;
};

export const deleteAddress = async (addressId) => {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId);
    
  if (error) {
    console.error('Adres silinirken hata:', error);
    throw error;
  }
  return { success: true };
};

// Reviews (Değerlendirmeler)
export const getStoreReviews = async (storeId) => {
  const { data, error } = await supabaseApi.getStoreReviews(storeId);
  if (error) {
    console.error(`Mağaza değerlendirmelerini getirirken hata (ID: ${storeId}):`, error);
    return [];
  }
  return data || [];
};

// Tüm yorumları getir (filtrelenebilir) - artık sadece sipariş-based yorumlar
export const getReviews = async (filters = {}) => {
  let query = supabase
    .from('reviews')
    .select(`
      *,
      users(id, name),
      stores!inner(id, name, logo_url),
      orders!inner(id, order_number, created_at, total_amount),
      review_responses(*)
    `)
    .eq('review_type', 'store'); // Sadece store review'lar
    
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
  
  if (filters.review_type) {
    query = query.eq('review_type', filters.review_type);
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

  // Anonim yorumlar için kullanıcı bilgilerini temizle
  const processedData = (data || []).map(review => {
    if (review.is_anonymous) {
      return {
        ...review,
        users: null // Anonim yorumlar için kullanıcı bilgisini tamamen kaldır
      };
    }
    return review;
  });

  return processedData;
};

// Yeni yorum oluştur (sipariş-based)
export const createReview = async (reviewData) => {
  try {
    // Zorunlu alanları kontrol et
    if (!reviewData.order_id) {
      throw new Error('Yorum için sipariş ID\'si gereklidir');
    }
    
    if (!reviewData.user_id || !reviewData.store_id) {
      throw new Error('Kullanıcı ve mağaza ID\'si gereklidir');
    }
    
    // Sipariş için daha önce yorum yapılıp yapılmadığını kontrol et
    const existingReview = await getUserReviewForOrder(reviewData.user_id, reviewData.order_id);
    if (existingReview) {
      throw new Error('Bu sipariş için zaten yorum yapılmış');
    }
    
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        ...reviewData,
        review_type: 'store', // Artık sadece store review var
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        users(id, name),
        stores!inner(id, name),
        orders!inner(id, order_number, created_at)
      `)
      .single();
      
    if (error) {
      console.error('Yorum oluştururken hata:', error.message || error);
      throw new Error(error.message || 'Yorum oluşturulamadı');
    }
    
    return data;
  } catch (error) {
    console.error('Yorum oluştururken beklenmeyen hata:', error.message || error);
    throw error;
  }
};

// Yorumu güncelle
export const updateReview = async (reviewId, updates) => {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', reviewId)
    .select(`
      *,
      users(id, name),
      stores!inner(id, name)
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

// Kullanıcının belirli sipariş için yorum yapıp yapmadığını kontrol et
export const getUserReviewForOrder = async (userId, orderId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('order_id', orderId)
    .single();
    
  if (error && error.code !== 'PGRST116') { // 'PGRST116' is "not found" error
    console.error(`Kullanıcı sipariş yorumu kontrol edilirken hata:`, error);
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
      stores!inner(id, name, category_id),
      orders!inner(id, order_number, created_at, total_amount)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error(`Kullanıcı değerlendirmeleri getirirken hata (User ID: ${userId}):`, error);
    return [];
  }
  return data || [];
};

// Kullanıcının değerlendirme yapabileceği siparişleri getir
export const getUserReviewableOrders = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        stores!inner(id, name, logo_url)
      `)
      .eq('user_id', userId)
      .eq('status', 'delivered')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error(`Değerlendirilebilir siparişler getirirken hata (User ID: ${userId}):`, error);
      return [];
    }
    
    // Her sipariş için ayrı ayrı review kontrolü yap
    const ordersWithReviewStatus = await Promise.all(
      (data || []).map(async (order) => {
        const existingReview = await getUserReviewForOrder(userId, order.id);
        return {
          ...order,
          has_review: !!existingReview,
          review: existingReview
        };
      })
    );
    
    // Henüz değerlendirilmemiş siparişleri döndür
    return ordersWithReviewStatus.filter(order => !order.has_review);
  } catch (error) {
    console.error(`Değerlendirilebilir siparişler getirirken beklenmeyen hata (User ID: ${userId}):`, error);
    return [];
  }
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

// Review Responses (Mağaza Cevapları) API Fonksiyonları

// Yoruma cevap ekle
export const createReviewResponse = async (responseData) => {
  const { data, error } = await supabase
    .from('review_responses')
    .insert({
      ...responseData,
      created_at: new Date().toISOString()
    })
    .select(`
      *,
      responder:users(id, name, role),
      store:stores(id, name)
    `)
    .single();
    
  if (error) {
    console.error('Review response oluştururken hata:', error);
    throw error;
  }
  
  // Response sayısını güncelle
  await updateReview(responseData.review_id, { 
    response_count: await getReviewResponseCount(responseData.review_id)
  });
  
  return data;
};

// Yorumun cevaplarını getir
export const getReviewResponses = async (reviewId) => {
  try {
    const { data, error } = await supabase
      .from('review_responses')
      .select(`
        *,
        responder:users(id, name, role),
        store:stores(id, name)
      `)
      .eq('review_id', reviewId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error(`Review responses getirirken hata (Review ID: ${reviewId}):`, error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error(`Review responses getirirken beklenmeyen hata (Review ID: ${reviewId}):`, error);
    return [];
  }
};

// Review response güncelle
export const updateReviewResponse = async (responseId, updates) => {
  const { data, error } = await supabase
    .from('review_responses')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', responseId)
    .select(`
      *,
      responder:users(id, name, role),
      store:stores(id, name)
    `)
    .single();
    
  if (error) {
    console.error(`Review response güncellenirken hata (ID: ${responseId}):`, error);
    throw error;
  }
  return data;
};

// Review response sil
export const deleteReviewResponse = async (responseId, reviewId) => {
  const { error } = await supabase
    .from('review_responses')
    .delete()
    .eq('id', responseId);
    
  if (error) {
    console.error(`Review response silinirken hata (ID: ${responseId}):`, error);
    throw error;
  }
  
  // Response sayısını güncelle
  await updateReview(reviewId, { 
    response_count: await getReviewResponseCount(reviewId)
  });
  
  return { success: true };
};

// Review response sayısını getir
export const getReviewResponseCount = async (reviewId) => {
  const { count, error } = await supabase
    .from('review_responses')
    .select('*', { count: 'exact', head: true })
    .eq('review_id', reviewId);
    
  if (error) {
    console.error(`Review response sayısı getirirken hata (Review ID: ${reviewId}):`, error);
    return 0;
  }
  return count || 0;
};

// Sipariş yorumlarını getir (artık sadece sipariş-based yorumlar var)
export const getOrderReviews = async (orderId) => {
  return await getReviews({ 
    order_id: orderId
  });
};

// Mağaza yorumlarını getir (artık sadece store review'lar var)
export const getStoreReviewsByType = async (storeId) => {
  return await getReviews({ 
    store_id: storeId
  });
};

// Review Like/Unlike fonksiyonları
export const likeReview = async (reviewId, userId) => {
  try {
    // Önce var olan like var mı kontrol et
    const { data: existingLike } = await supabase
      .from('review_likes')
      .select('*')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .single();
    
    if (existingLike) {
      // Zaten beğenmişse unlike yap
      await supabase
        .from('review_likes')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', userId);
      
      return { action: 'unliked' };
    } else {
      // Beğeni ekle
      await supabase
        .from('review_likes')
        .insert({
          review_id: reviewId,
          user_id: userId,
          created_at: new Date().toISOString()
        });
      
      return { action: 'liked' };
    }
  } catch (error) {
    console.error(`Review beğeni işlemi hatası (Review ID: ${reviewId}):`, error);
    throw error;
  }
};

// Review beğeni durumunu kontrol et
export const checkReviewLike = async (reviewId, userId) => {
  try {
    const { data, error } = await supabase
      .from('review_likes')
      .select('*')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Review beğeni kontrolü hatası (Review ID: ${reviewId}):`, error);
    return false;
  }
};

// Review beğeni sayısını getir
export const getReviewLikeCount = async (reviewId) => {
  try {
    const { count, error } = await supabase
      .from('review_likes')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', reviewId);
    
    if (error) {
      throw error;
    }
    
    return count || 0;
  } catch (error) {
    console.error(`Review beğeni sayısı getirme hatası (Review ID: ${reviewId}):`, error);
    return 0;
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
// Cache store for debugging 
let cartCache = new Map();

export const getUserCartItems = async (userId, skipCache = false) => {
  console.log('🔄 getUserCartItems çağrıldı:', { userId, skipCache, cacheSize: cartCache.size });
  
  // Cache bypass için
  if (skipCache) {
    console.log('⚡ Cache atlanıyor, direkt API çağrısı');
    cartCache.delete(userId);
  }
  
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(
        *,
        store:stores(*)
      ),
      cart_item_options(
        *,
        option_group:product_option_groups(name),
        option:product_options(name)
      )
    `)
    .eq('user_id', userId);
    
  if (error) {
    console.error(`Kullanıcı sepet öğelerini getirirken hata (ID: ${userId}):`, error);
    return [];
  }
  
  const result = data || [];
  cartCache.set(userId, result);
  console.log('💾 Sepet cache güncellendi:', result.length, 'öğe');
  return result;
};

// Cache temizleme fonksiyonu
export const clearCartCache = (userId) => {
  console.log('🗑️ Cart cache temizleniyor userId için:', userId);
  if (userId) {
    cartCache.delete(userId);
  } else {
    cartCache.clear();
  }
};

export const addToCart = async (cartItem, selectedOptions = []) => {
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
    
    const cartItemData = data[0];
    
    // Seçenekleri ekle
    if (selectedOptions.length > 0) {
      const cartItemOptions = selectedOptions.map(option => ({
        cart_item_id: cartItemData.id,
        option_group_id: option.option_group_id,
        option_id: option.option_id,
        option_group_name: option.option_group_name,
        option_name: option.option_name,
        price_modifier: option.price_modifier || 0
      }));
      
      const { error: optionsError } = await supabase
        .from('cart_item_options')
        .insert(cartItemOptions);
        
      if (optionsError) {
        console.error('Sepet öğesi seçenekleri eklenirken hata:', optionsError);
        // Cart item'ı da geri al
        await supabase.from('cart_items').delete().eq('id', cartItemData.id);
        return { success: false, error: optionsError.message };
      }
    }
      
    return { success: true, data: cartItemData };
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
  try {
    const { data, error } = await supabase
      .from('module_permissions')
      .select('module_name, is_enabled')
      .order('created_at', { ascending: false });
      
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
    
    // Veriyi düzenle ve enable_* formatına dönüştür
    const permissions = {
      enable_yemek: true,
      enable_market: true,
      enable_su: true,
      enable_aktuel: false
    };
    
    if (data && data.length > 0) {
      data.forEach(permission => {
        const key = `enable_${permission.module_name}`;
        permissions[key] = permission.is_enabled;
      });
    }
    
    return permissions;
  } catch (error) {
    console.error('Modül izinleri alma işleminde hata:', error);
    return {
      enable_yemek: true,
      enable_market: true,
      enable_su: true,
      enable_aktuel: false
    };
  }
};

export const updateModulePermissions = async (permissions) => {
  try {
    // permissions objesi: { enable_yemek: true, enable_market: false, ... }
    // Bu formatı module_permissions tablosuna uygun hale getir
    
    const updates = Object.entries(permissions).map(([key, value]) => {
      const moduleName = key.replace('enable_', '');
      return { module_name: moduleName, is_enabled: value };
    });
    
    // Her modül için ayrı ayrı güncelle
    const results = [];
    for (const update of updates) {
      const { data, error } = await supabase
        .from('module_permissions')
        .update({ is_enabled: update.is_enabled, updated_at: new Date().toISOString() })
        .eq('module_name', update.module_name)
        .select();
        
      if (error) {
        console.error(`Modül ${update.module_name} güncellenirken hata:`, error);
        return { success: false, error };
      }
      
      results.push(data);
    }
    
    return { success: true, data: results };
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
      .eq('is_active', true);

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
    const { data, error } = await supabase
      .from('store_commission_summary')
      .select('*')
      .eq('store_id', storeId)
      .order('period_end', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`Mağaza komisyon özeti bulunamadı (Store ID: ${storeId}). Özet tablosu güncellenecek.`);
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Mağaza komisyon özeti getirilirken hata:', error);
    throw error;
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
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read);
    }

    const { data, error } = await query.limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Bildirimler getirilirken hata:', error);
    throw error;
  }
};

// Yeni bildirim oluştur
export const createNotification = async (notificationData) => {
  try {
    // Kullanıcının bildirim ayarlarını kontrol et
    if (notificationData.user_id) {
      try {
        const userSettings = await getUserSettings(notificationData.user_id);
        
        if (userSettings) {
          // Genel bildirim ayarı kapalıysa hiç bildirim gönderme
          if (!userSettings.notifications_enabled) {
            console.log('🔕 Kullanıcının bildirimleri kapalı, bildirim gönderilmiyor:', notificationData.user_id);
            return null;
          }
          
          // Bildirim tipine göre özel kontroller
          switch (notificationData.type) {
            case 'order_pending':
            case 'order_processing':
            case 'order_shipped':
            case 'order_delivered':
            case 'order_cancelled':
              if (!userSettings.order_updates) {
                console.log('🔕 Kullanıcının sipariş güncellemeleri kapalı, bildirim gönderilmiyor');
                return null;
              }
              break;
            case 'promo_notification':
            case 'campaign':
              if (!userSettings.promo_notifications) {
                console.log('🔕 Kullanıcının promosyon bildirimleri kapalı, bildirim gönderilmiyor');
                return null;
              }
              break;
            case 'marketing':
              if (!userSettings.marketing_emails) {
                console.log('🔕 Kullanıcının pazarlama bildirimleri kapalı, bildirim gönderilmiyor');
                return null;
              }
              break;
            case 'new_review':
            case 'review_response':
              // Değerlendirme bildirimleri varsayılan olarak gönderilir
              // Mağaza sahipleri için önemli bildirimlerdir
              console.log('📝 Değerlendirme bildirimi gönderiliyor:', notificationData.type);
              break;
          }
        }
      } catch (settingsError) {
        console.warn('Kullanıcı ayarları kontrol edilirken hata, bildirim yine de gönderiliyor:', settingsError.message || settingsError);
        // Ayarlar kontrol edilemezse bildirim göndermeye devam et
      }
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notificationData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error('Bildirim oluştururken hata:', error.message || error);
      throw new Error(error.message || 'Bildirim oluşturulamadı');
    }
    return data;
  } catch (error) {
    console.error('Bildirim oluştururken beklenmeyen hata:', error.message || error);
    throw error;
  }
};

// E-posta bildirimi gönder
export const sendEmailNotification = async (userId, emailData) => {
  try {
    const userSettings = await getUserSettings(userId);
    
    if (!userSettings?.notifications_enabled || !userSettings?.email_notifications) {
      console.log('🔕 Kullanıcının e-posta bildirimleri kapalı:', userId);
      return { success: false, reason: 'email_notifications_disabled' };
    }
    
    // E-posta gönderme mantığı burada olacak
    console.log('📧 E-posta bildirimi gönderildi:', userId, emailData);
    return { success: true };
  } catch (error) {
    console.error('E-posta bildirimi gönderilirken hata:', error);
    return { success: false, error: error.message };
  }
};

// SMS bildirimi gönder
export const sendSMSNotification = async (userId, smsData) => {
  try {
    const userSettings = await getUserSettings(userId);
    
    if (!userSettings?.notifications_enabled || !userSettings?.sms_notifications) {
      console.log('🔕 Kullanıcının SMS bildirimleri kapalı:', userId);
      return { success: false, reason: 'sms_notifications_disabled' };
    }
    
    // SMS gönderme mantığı burada olacak
    console.log('📱 SMS bildirimi gönderildi:', userId, smsData);
    return { success: true };
  } catch (error) {
    console.error('SMS bildirimi gönderilirken hata:', error);
    return { success: false, error: error.message };
  }
};

// Push bildirimi gönder
export const sendPushNotification = async (userId, pushData) => {
  try {
    const userSettings = await getUserSettings(userId);
    
    if (!userSettings?.notifications_enabled || !userSettings?.push_notifications) {
      console.log('🔕 Kullanıcının push bildirimleri kapalı:', userId);
      return { success: false, reason: 'push_notifications_disabled' };
    }
    
    // Push bildirim gönderme mantığı burada olacak
    console.log('🔔 Push bildirimi gönderildi:', userId, pushData);
    return { success: true };
  } catch (error) {
    console.error('Push bildirimi gönderilirken hata:', error);
    return { success: false, error: error.message };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Bildirim okundu işaretlenirken hata:', error);
    throw error;
  }
};

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

export const markAllNotificationsAsRead = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Tüm bildirimler okundu işaretlenirken hata:', error);
    throw error;
  }
};

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

export const createOrderStatusNotification = async (orderId, status, userId) => {
  try {
    const statusMessages = {
      pending: 'Siparişiniz beklemede',
      confirmed: 'Siparişiniz onaylandı',
      preparing: 'Siparişiniz hazırlanıyor',
      ready: 'Siparişiniz hazır! Kurye yola çıkacak',
      delivering: 'Siparişiniz yolda',
      delivered: 'Siparişiniz teslim edildi',
      cancelled: 'Siparişiniz iptal edildi'
    };

    const statusTitles = {
      pending: 'Sipariş Alındı',
      confirmed: 'Sipariş Onaylandı', 
      preparing: 'Sipariş Hazırlanıyor',
      ready: 'Sipariş Hazır',
      delivering: 'Sipariş Yolda',
      delivered: 'Sipariş Teslim Edildi',
      cancelled: 'Sipariş İptal Edildi'
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type: 'order_status',
        title: statusTitles[status] || 'Sipariş Durumu Güncellendi',
        message: statusMessages[status] || 'Sipariş durumunuz güncellendi',
        data: {
          order_id: orderId,
          status: status
        },
        is_read: false
      }]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Sipariş durumu bildirimi oluşturulurken hata:', error);
    throw error;
  }
};

export const createNewOrderNotification = async (orderId, storeOwnerId, customerName, totalAmount) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: storeOwnerId,
        type: 'new_order',
        title: 'Yeni Sipariş Aldınız!',
        message: `${customerName} adlı müşteriden ${Number(totalAmount).toFixed(2)} TL tutarında yeni bir sipariş geldi.`,
        data: {
          order_id: orderId,
          customer_name: customerName,
          total_amount: totalAmount
        },
        is_read: false
      }]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Yeni sipariş bildirimi oluşturulurken hata:', error);
    throw error;
  }
};

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

export const createStoreApprovalNotification = async (storeId, storeName, ownerId, isApproved) => {
  try {
    const title = isApproved ? 'Mağazanız Onaylandı!' : 'Mağaza Onayı Kaldırıldı';
    const message = isApproved 
      ? `"${storeName}" adlı mağazanız onaylandı! Artık sipariş almaya başlayabilirsiniz.`
      : `"${storeName}" adlı mağazanızın onayı kaldırıldı. Daha fazla bilgi için destek ekibimizle iletişime geçin.`;
    
    return await createNotification({
      user_id: ownerId,
      type: isApproved ? 'store_approved' : 'store_approval_revoked',
      title: title,
      message: message,
      data: { 
        store_name: storeName,
        store_id: storeId,
        is_approved: isApproved
      },
      is_read: false
    });
  } catch (error) {
    console.error('Mağaza onay bildirimi oluştururken hata:', error);
    throw error;
  }
};

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
        .select('total_amount')
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
    const monthlyRevenue = revenueResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

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

export const getDailyOrderStats = async (days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('orders')
      .select('order_date, total_amount, status')
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
        dailyStats[dateKey].revenue += order.total_amount || 0;
        
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

export const getCategoryStats = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        total_amount,
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
      categoryStats[categoryName].revenue += order.total_amount || 0;
    });

    return Object.values(categoryStats);
  } catch (error) {
    console.error('Kategori istatistikleri alınırken hata:', error);
    return [];
  }
};

export const getTopStores = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        store_id,
        total_amount,
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
      storeStats[storeId].revenue += order.total_amount || 0;
    });

    return Object.values(storeStats)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, limit);
  } catch (error) {
    console.error('En çok sipariş alan mağazalar alınırken hata:', error);
    return [];
  }
};

export const getRecentUserActivities = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_date,
        total_amount,
        status,
        user_id,
        store_id,
        users!user_id(name, email),
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
      total: order.total_amount || 0,
      status: order.status
    }));
  } catch (error) {
    console.error('Son kullanıcı aktiviteleri alınırken hata:', error);
    return [];
  }
};

export const getUserFavorites = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        item_type,
        item_id,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Favoriler yüklenirken hata:', error);
    return [];
  }
};

export const addToFavorites = async (userId, itemType, itemId) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        item_type: itemType,
        item_id: itemId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Favorilere eklenirken hata:', error);
    throw error;
  }
};

export const removeFromFavorites = async (userId, itemType, itemId) => {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq('item_id', itemId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Favorilerden çıkarılırken hata:', error);
    throw error;
  }
};

export const checkIsFavorite = async (userId, itemType, itemId) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('Favori kontrolü sırasında hata:', error);
    return false;
  }
};

export const getUserPaymentMethods = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Ödeme yöntemleri yüklenirken hata:', error);
    return [];
  }
};

export const createPaymentMethod = async (paymentData) => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert(paymentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Ödeme yöntemi oluşturulurken hata:', error);
    throw error;
  }
};

export const updatePaymentMethod = async (paymentId, updates) => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Ödeme yöntemi güncellenirken hata:', error);
    throw error;
  }
};

export const deletePaymentMethod = async (paymentId) => {
  try {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Ödeme yöntemi silinirken hata:', error);
    throw error;
  }
};

export const getUserSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Kullanıcı ayarları yoksa varsayılan ayarları oluştur
      return await createUserSettings(userId);
    }
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Kullanıcı ayarları yüklenirken hata:', error);
    return null;
  }
};

export const createUserSettings = async (userId, settings = {}) => {
  try {
    const defaultSettings = {
      user_id: userId,
      notifications_enabled: true,
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
      marketing_emails: false,
      order_updates: true,
      promo_notifications: true,
      profile_visibility: 'private',
      show_online_status: false,
      allow_friend_requests: true,
      language: 'tr',
      currency: 'TRY',
      timezone: 'Europe/Istanbul',
      theme: 'light',
      two_factor_enabled: false,
      login_notifications: true,
      session_timeout: 30,
      auto_reorder_enabled: false,
      ...settings
    };

    const { data, error } = await supabase
      .from('user_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Kullanıcı ayarları oluşturulurken hata:', error);
    throw error;
  }
};

export const updateUserSettings = async (userId, settings) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Kullanıcı ayarları güncellenirken hata:', error);
    throw error;
  }
};

// Kullanıcı istatistikleri
export const getUserStats = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_stats', { p_user_id: userId });

    if (error) {
      console.error('Kullanıcı istatistikleri alınırken hata:', error);
      // Hata durumunda basit query ile verileri al
      const [orders, favorites, addresses, payments, reviews, settings] = await Promise.all([
        supabase.from('orders').select('id').eq('user_id', userId),
        supabase.from('favorites').select('id').eq('user_id', userId),
        supabase.from('addresses').select('id').eq('user_id', userId),
        supabase.from('payment_methods').select('id').eq('user_id', userId),
        supabase.from('reviews').select('id').eq('user_id', userId),
        supabase.from('user_settings').select('theme, language').eq('user_id', userId).single()
      ]);

      return {
        total_orders: orders.data?.length || 0,
        total_favorites: favorites.data?.length || 0,
        total_addresses: addresses.data?.length || 0,
        total_payment_methods: payments.data?.length || 0,
        total_reviews: reviews.data?.length || 0,
        theme: settings.data?.theme || 'light',
        language: settings.data?.language || 'tr'
      };
    }

    // RPC'den gelen veriyi doğru formata çevir
    const rpcData = data?.[0];
    return {
      total_orders: rpcData?.order_count || 0,
      total_favorites: rpcData?.favorite_count || 0,
      total_addresses: rpcData?.address_count || 0,
      total_payment_methods: rpcData?.payment_method_count || 0,
      total_reviews: rpcData?.review_count || 0,
      theme: rpcData?.theme || 'light',
      language: rpcData?.language || 'tr'
    };
  } catch (error) {
    console.error('Kullanıcı istatistikleri yüklenirken beklenmeyen hata:', error);
    console.log('🔧 Debug - getUserStats catch block triggered');
    return {
      total_orders: 0,
      total_favorites: 0,
      total_addresses: 0,
      total_payment_methods: 0,
      total_reviews: 0,
      theme: 'light',
      language: 'tr'
    };
  }
};

export const updateUserAvatar = async (userId, avatarFile) => {
  try {
    console.log('Avatar güncelleme başlatılıyor:', { userId, fileName: avatarFile.name });
    
    // Eski avatar varsa sil
    const user = await getUserById(userId);
    if (user?.avatar_url) {
      try {
        await deleteImage(user.avatar_url, 'avatars');
        console.log('Eski avatar silindi');
      } catch (deleteError) {
        console.warn('Eski avatar silinirken hata (devam ediliyor):', deleteError);
      }
    }
    
    // Yeni avatar yükle
    const avatarUrl = await uploadImage(avatarFile, 'avatars');
    console.log('Yeni avatar yüklendi:', avatarUrl);
    
    // Database'i güncelle
    const updatedUser = await updateUser(userId, { avatar_url: avatarUrl });
    console.log('Kullanıcı avatar URL\'si güncellendi');
    
    return { success: true, avatarUrl, user: updatedUser };
  } catch (error) {
    console.error('Avatar güncellenirken hata:', error);
    throw error;
  }
};

// Sipariş öğelerini getir
export const getOrderItems = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products(id, name, image, price)
      `)
      .eq('order_id', orderId);

    if (error) throw error;
    
    // Eğer order_items.name null ise product.name'i kullan
    const processedData = (data || []).map(item => ({
      ...item,
      name: item.name || item.product?.name || 'Ürün adı bulunamadı',
      price: item.price || item.unit_price || item.product?.price || 0,
      total: item.total || item.total_price || (item.quantity * (item.unit_price || item.price || 0))
    }));

    return processedData;
  } catch (error) {
    console.error('Sipariş öğeleri getirilirken hata:', error);
    throw error;
  }
};

export default {
  getStores,
  getStoreById,
  getStoreByOwnerId,
  getStoreByUserId,
  getStoresByCategory,
  createStore,
  updateStore,
  updateStoreStatus,
  deleteStore,
  
  getProducts,
  getProductsByStoreId,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductOptions,
  getProductWithOptions,
  createProductOptionGroup,
  createProductOption,
  updateProductOptionGroup,
  updateProductOption,
  deleteProductOptionGroup,
  deleteProductOption,
  
  getAllOrders,
  getUserOrders,
  getOrderById,
  getOrderItems,
  createOrder,
  updateOrder,
  
  getCampaigns,
  getCampaignById,
  getCampaignByCode,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  
  // Kampanya afişleri
  getCampaignBanners,
  
  // Kampanya başvuruları
  getCampaignApplications,
  createCampaignApplication,
  updateCampaignApplication,
  approveCampaignApplication,
  rejectCampaignApplication,
  
  // Mağaza kampanya katılımları
  getStoreCampaignParticipations,
  createStoreCampaignParticipation,
  updateStoreCampaignParticipation,
  
  // Kampanya kuralları
  getCampaignRules,
  createCampaignRule,
  updateCampaignRule,
  deleteCampaignRule,
  checkCampaignEligibility,
  
  getUserProfile,
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  
  getStoreReviews,
  getReviews,
  getUserReviews,
  getUserReviewableOrders, // Yeni fonksiyon
  getUserReviewForOrder, // Yeni fonksiyon
  createReview,
  updateReview,
  deleteReview,
  getUserReviewForStore,
  updateStoreRating,
  
  // Review Responses
  createReviewResponse,
  getReviewResponses,
  updateReviewResponse,
  deleteReviewResponse,
  getReviewResponseCount,
  
  // Order Reviews (artık sadece sipariş-based)
  getOrderReviews,
  getStoreReviewsByType,
  
  // Review Likes
  likeReview,
  checkReviewLike,
  getReviewLikeCount,
  
  getUserCartItems,
  clearCartCache,
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
  
  getModulePermissions,
  updateModulePermissions,
  isModuleEnabled,
  
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  
  getStoreIdByProductId,
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
  sendEmailNotification,
  sendSMSNotification,
  sendPushNotification,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
  createOrderStatusNotification,
  createNewOrderNotification,
  createStoreRegistrationNotification,
  createStoreApprovalNotification,
  
  getAdminStats,
  getDailyOrderStats,
  getCategoryStats,
  getTopStores,
  getRecentUserActivities,
  
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  checkIsFavorite,
  
  getUserPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  
  getUserSettings,
  createUserSettings,
  updateUserSettings,
  getUserStats,
  updateUserAvatar
}; 