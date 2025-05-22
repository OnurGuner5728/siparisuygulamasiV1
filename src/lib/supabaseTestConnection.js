import supabase from './supabase';

// Supabase bağlantı testi
const testSupabaseConnection = async () => {
  try {
    console.log('Supabase bağlantısı test ediliyor...');
    
    // public tablosundan basit bir sorgu yapma
    const { data, error } = await supabase
      .from('users')
      .select('count()')
      .limit(1);
    
    if (error) {
      console.error('Supabase bağlantı hatası:', error);
      return { success: false, error };
    }
    
    console.log('Supabase bağlantısı başarılı! Veri:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Supabase bağlantısında beklenmeyen hata:', error);
    return { success: false, error };
  }
};

export default testSupabaseConnection; 