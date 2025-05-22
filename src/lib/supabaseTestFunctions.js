import supabase from './supabase';

// Kampanya fonksiyonunu test et
export const testGetActiveCampaigns = async (categoryId = 1) => {
  try {
    console.log(`get_active_campaigns_by_category fonksiyonu test ediliyor (category_id: ${categoryId})...`);
    
    const { data, error } = await supabase
      .rpc('get_active_campaigns_by_category', { 
        category_id_param: categoryId 
      });
    
    if (error) {
      console.error("Kampanya fonksiyonu hatası:", error);
      return { success: false, error };
    }
    
    console.log("Kampanya fonksiyonu başarılı:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Beklenmeyen hata:", error);
    return { success: false, error };
  }
};

// Kullanıcı sipariş özeti fonksiyonunu test et
export const testGetUserOrderSummary = async (userId) => {
  try {
    console.log(`get_user_order_summary fonksiyonu test ediliyor (user_id: ${userId})...`);
    
    const { data, error } = await supabase
      .rpc('get_user_order_summary', { 
        user_id_param: userId 
      });
    
    if (error) {
      console.error("Sipariş özeti fonksiyonu hatası:", error);
      return { success: false, error };
    }
    
    console.log("Sipariş özeti fonksiyonu başarılı:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Beklenmeyen hata:", error);
    return { success: false, error };
  }
};

// Mağaza müşteri fonksiyonunu test et
export const testGetStoreTopCustomers = async (storeId, limit = 5) => {
  try {
    console.log(`get_store_top_customers fonksiyonu test ediliyor (store_id: ${storeId})...`);
    
    const { data, error } = await supabase
      .rpc('get_store_top_customers', { 
        store_id_param: storeId,
        limit_count: limit
      });
    
    if (error) {
      console.error("Mağaza müşteri fonksiyonu hatası:", error);
      return { success: false, error };
    }
    
    console.log("Mağaza müşteri fonksiyonu başarılı:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Beklenmeyen hata:", error);
    return { success: false, error };
  }
};

// Mağaza ürün fonksiyonunu test et
export const testGetStoreTopProducts = async (storeId, limit = 5) => {
  try {
    console.log(`get_store_top_products fonksiyonu test ediliyor (store_id: ${storeId})...`);
    
    const { data, error } = await supabase
      .rpc('get_store_top_products', { 
        store_id_param: storeId,
        limit_count: limit
      });
    
    if (error) {
      console.error("Mağaza ürün fonksiyonu hatası:", error);
      return { success: false, error };
    }
    
    console.log("Mağaza ürün fonksiyonu başarılı:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Beklenmeyen hata:", error);
    return { success: false, error };
  }
}; 