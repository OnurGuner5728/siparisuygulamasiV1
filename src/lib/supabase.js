import { createClient } from '@supabase/supabase-js'

// Çevre değişkenleri yerine doğrudan değerleri kullanıyoruz
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
// Singleton pattern - Tek bir global instance oluştur
let supabaseInstance = null;
let supabaseAdminInstance = null;

// Supabase client oluşturma fonksiyonu
const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;
  
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storageKey: 'easysiparis-auth-storage'
    }
  });
  
  return supabaseInstance;
};

// Admin client oluşturma fonksiyonu
const getSupabaseAdmin = () => {
  if (supabaseAdminInstance) return supabaseAdminInstance;
  
  // Sunucu tarafında çalışıyorsa admin client oluştur
  if (typeof window === 'undefined') {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    return supabaseAdminInstance;
  }
  
  // Tarayıcıda çalışıyorsa, admin işlemleri API routes üzerinden yapılmalı
  // Bu durumda normal client döndürülür ama admin işlemler API'ye yönlendirilir
  console.warn('Admin client tarayıcıda kullanılamaz. Admin işlemler API routes üzerinden yapılmalı.');
  return getSupabase();
};

// İstemcileri oluştur
const supabase = getSupabase();
const supabaseAdmin = getSupabaseAdmin();

// Test etme fonksiyonu (sadece geliştirme amaçlı)
async function testClients() {
  try {
    console.log("Test başlatılıyor...");
    
    // Anonim client testi
    const { data: anonData, error: anonError } = await supabase
      .from('categories')
      .select('count')
      .limit(1);
      
    console.log("Anonim client test:", anonError ? "Hata" : "Başarılı");
    console.log("Anonim sonuç:", anonData);
    if (anonError) console.error("Anonim hata:", anonError);
    
    // Admin client testi
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('categories')
      .select('count')
      .limit(1);
      
    console.log("Admin client test:", adminError ? "Hata" : "Başarılı");
    console.log("Admin sonuç:", adminData);
    if (adminError) console.error("Admin hata:", adminError);
  } catch (e) {
    console.error("Test hatası:", e);
  }
}

// Tarayıcıda çalışıyorsa, testi çalıştır ve auth state değişikliklerini dinle
if (typeof window !== 'undefined') {
  // Sessiz çalışması için kaldırıldı: testClients();
  
  // Sessiz log için kaldırıldı:
  // supabase.auth.onAuthStateChange((event, session) => {
  //   console.log("Auth state changed:", event);
  //   console.log("Session:", session ? "Session exists" : "No session");
  // });
  
  // Sayfa yüklendiğinde oturum olup olmadığını kontrol et
  supabase.auth.getSession().catch(err => {
    console.warn("Session check error:", err);
  });
}

export default supabase 
export { supabaseAdmin } 
