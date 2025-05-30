import supabase from './supabase'
import { supabaseAdmin } from './supabase'

// Kullanıcı işlemleri
export const signUp = async (email, password, userData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  
  // Supabase v2'de user data.user içinde geliyor
  return { data, error }
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
    console.log('📋 Debug - Profil sorgulanıyor, UserID:', userId);
    
    // Önce normal client ile deneyelim
    let { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    console.log('📋 Debug - Normal client sonucu:', { data, error });
    
    if (error) {
      // Eğer kayıt bulunamadıysa otomatik oluşturmaya çalış
      if (error.code === 'PGRST116') {
        console.log('📋 Debug - Kullanıcı kaydı bulunamadı, otomatik oluşturuluyor...');
        
        try {
          const { data: authUser, error: authError } = await supabase.auth.getUser();
          
          if (authUser?.user && !authError) {
            console.log('📋 Debug - Auth user data:', authUser.user);
            
            // Admin client varsa kullan, yoksa normal client ile dene
            const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
            
            const { data: insertData, error: insertError } = await client
              .from('users')
              .insert([{
                id: userId,
                name: authUser.user.user_metadata?.name || authUser.user.raw_user_meta_data?.name || authUser.user.email?.split('@')[0],
                first_name: authUser.user.user_metadata?.first_name || authUser.user.raw_user_meta_data?.first_name || '',
                last_name: authUser.user.user_metadata?.last_name || authUser.user.raw_user_meta_data?.last_name || '',
                email: authUser.user.email,
                phone: authUser.user.user_metadata?.phone || authUser.user.raw_user_meta_data?.phone || '',
                address: authUser.user.user_metadata?.address || authUser.user.raw_user_meta_data?.address || '',
                city: authUser.user.user_metadata?.city || authUser.user.raw_user_meta_data?.city || '',
                district: authUser.user.user_metadata?.district || authUser.user.raw_user_meta_data?.district || '',
                role: authUser.user.user_metadata?.role || authUser.user.raw_user_meta_data?.role || 'user',
                updated_at: new Date()
              }])
              .select('*')
              .single();
              
            console.log('📋 Debug - Insert sonucu:', { insertData, insertError });
              
            if (!insertError) {
              data = insertData;
              error = null;
              console.log('📋 Debug - Kullanıcı kaydı oluşturuldu');
            } else {
              console.warn('📋 Debug - Kullanıcı kaydı oluşturulamadı:', insertError);
            }
          } else {
            console.warn('📋 Debug - Auth user alınamadı:', authError);
          }
        } catch (createError) {
          console.warn('📋 Debug - Otomatik kayıt oluşturma hatası:', createError);
        }
      }
    }
    
    console.log('📋 Debug - getUserProfile final result:', { data, error, userId });
    return { data, error };
    
  } catch (error) {
    console.error('📋 Debug - getUserProfile catch error:', error);
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
export const createOrder = async (orderData, orderItems) => {
  try {
    // Sipariş oluştur
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        ...orderData,
        user_id: orderData.customerId,
        order_number: `ORD-${Date.now()}`,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      console.error('Sipariş oluştururken hata:', orderError)
      return { error: orderError }
    }

    // Sipariş öğelerini ekle
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId)

    if (itemsError) {
      console.error('Sipariş öğeleri oluştururken hata:', itemsError)
      return { error: itemsError }
    }

    return { data: order, error: null }
  } catch (error) {
    console.error('Sipariş oluşturma işlemi başarısız:', error)
    return { error }
  }
}

export const getUserOrders = async (userId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      store:stores(*),
      items:order_items(*)
    `)
    .eq('user_id', userId)
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
    .eq('is_active', true)

  return { data, error }
}

export const getCampaignByCode = async (code) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('code', code)
    .gte('end_date', new Date().toISOString())
    .eq('is_active', true)
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

// Admin işlemleri (API route üzerinden yapılır)
export const deleteAuthUser = async (userId) => {
  try {
    console.log(`API çağrısı başlatılıyor: DELETE /api/admin/users/${userId}`);
    
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`API yanıtı alındı. Status: ${response.status}`);

    let result;
    try {
      result = await response.json();
      console.log('API yanıt içeriği:', result);
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError);
      return { 
        data: null, 
        error: { 
          message: `API yanıtı parse edilemedi: ${response.status} ${response.statusText}` 
        } 
      };
    }

    if (!response.ok) {
      const errorMessage = result?.error || `API hatası: ${response.status} ${response.statusText}`;
      console.error('API hatası:', errorMessage);
      return { data: null, error: { message: errorMessage } };
    }

    console.log('Kullanıcı başarıyla silindi:', result);
    // public.users tablosundan silme işini handle_user_delete trigger'ı yapar.
    return { data: result.data, error: null };
  } catch (error) {
    console.error(`Auth kullanıcısı silinirken beklenmeyen hata (ID: ${userId}):`, error);
    return { 
      data: null, 
      error: { 
        message: error.message || 'Beklenmeyen hata oluştu',
        stack: error.stack 
      } 
    };
  }
}; 