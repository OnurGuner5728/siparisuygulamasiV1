import supabase from './supabase'
import { supabaseAdmin } from './supabase'

// Kullanıcı işlemleri
export const signUp = async (email, password, userData) => {
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { user, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Profil işlemleri
export const getUserProfile = async (userId) => {
  if (!userId) {
    return { data: null, error: new Error("User ID belirtilmedi") };
  }
  
  try {
    // Önce service_role ile deneyelim (RLS bypass)
    let { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      // Admin başarısız olursa normal client ile deneyelim
      const result = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      data = result.data;
      error = result.error;
      
      if (error) {
        // Eğer hata status: 406 (Not Acceptable) ise, muhtemelen kayıt bulunamadı demektir
        if (error.code === 'PGRST116') {
          // Otomatik profil oluşturmayı deneyebiliriz
          try {
            const { data: authUser, error: authError } = await supabase.auth.getUser();
            
            if (authUser && authUser.user) {
              const { data: insertData, error: insertError } = await supabaseAdmin
                .from('users')
                .insert([{
                  id: userId,
                  name: authUser.user.user_metadata?.name || authUser.user.email.split('@')[0],
                  first_name: authUser.user.user_metadata?.firstName || '',
                  last_name: authUser.user.user_metadata?.lastName || '',
                  email: authUser.user.email,
                  role: authUser.user.user_metadata?.role || 'user',
                  updated_at: new Date()
                }])
                .select('*')
                .single();
                
              if (!insertError) {
                data = insertData;
                error = null;
              }
            }
          } catch (createError) {
            // Sessizce devam et
          }
        }
      }
    }
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()

  return { data, error }
}

// Adres işlemleri
export const getUserAddresses = async (userId) => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })

  return { data, error }
}

export const addAddress = async (addressData) => {
  const { data, error } = await supabase
    .from('addresses')
    .insert(addressData)
    .select()

  return { data, error }
}

export const updateAddress = async (addressId, updates) => {
  const { data, error } = await supabase
    .from('addresses')
    .update(updates)
    .eq('id', addressId)
    .select()

  return { data, error }
}

export const deleteAddress = async (addressId) => {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId)

  return { error }
}

// Mağaza işlemleri
export const getStores = async (filters = {}) => {
  let query = supabase.from('stores').select('*')
  
  // Filtreleri uygula
  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  
  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  const { data, error } = await query

  return { data, error }
}

export const getStoreById = async (storeId) => {
  const { data, error } = await supabase
    .from('stores')
    .select('*, products(*)')
    .eq('id', storeId)
    .single()

  return { data, error }
}

// Ürün işlemleri
export const getProductsByStoreId = async (storeId) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)

  return { data, error }
}

export const getProductById = async (productId) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  return { data, error }
}

// Sipariş işlemleri
export const createOrder = async (orderData) => {
  // Önce ana sipariş kaydı oluştur
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: orderData.customerId,
      store_id: orderData.storeId,
      status: 'pending',
      order_date: new Date(),
      subtotal: orderData.subtotal,
      delivery_fee: orderData.deliveryFee,
      total: orderData.total,
      discount: orderData.discount,
      payment_method: orderData.paymentMethod,
      payment_status: 'pending',
      delivery_address_id: orderData.deliveryAddressId
    })
    .select()
    .single()

  if (orderError) return { error: orderError }

  // Sipariş öğelerini ekle
  for (const item of orderData.items) {
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        notes: item.notes
      })

    if (itemError) return { error: itemError }
  }

  return { data: order, error: null }
}

export const getUserOrders = async (userId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      store:stores(*),
      items:order_items(*)
    `)
    .eq('customer_id', userId)
    .order('order_date', { ascending: false })

  return { data, error }
}

export const getOrderById = async (orderId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      store:stores(*),
      items:order_items(*),
      delivery_address:addresses(*)
    `)
    .eq('id', orderId)
    .single()

  return { data, error }
}

// Kampanya işlemleri
export const getCampaigns = async () => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .gte('end_date', new Date().toISOString())
    .eq('status', 'active')

  return { data, error }
}

export const getCampaignByCode = async (code) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('code', code)
    .gte('end_date', new Date().toISOString())
    .eq('status', 'active')
    .single()

  return { data, error }
}

// Değerlendirme işlemleri
export const addReview = async (reviewData) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(reviewData)
    .select()

  return { data, error }
}

export const getStoreReviews = async (storeId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:users(name, avatar_url)')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Admin işlemleri (Sadece sunucu tarafında veya güvenli bir şekilde çağrılmalı)
export const deleteAuthUser = async (userId) => {
  const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  // public.users tablosundan silme işini handle_user_delete trigger'ı yapar.
  if (error) {
    console.error(`Auth kullanıcısı silinirken hata (ID: ${userId}):`, error);
  }
  return { data, error };
}; 