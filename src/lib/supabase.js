import { createClient } from '@supabase/supabase-js'

// Çevre değişkenleri yerine doğrudan değerleri kullanıyoruz
const supabaseUrl = 'https://ozqsbbngkkssstmaktou.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cXNiYm5na2tzc3N0bWFrdG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTkzMDIsImV4cCI6MjA2MzQ3NTMwMn0.q3uI3MPupzQVt5QAgxqEjJB0ro-IPNQJR2XC2i5-nAY'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cXNiYm5na2tzc3N0bWFrdG91Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg5OTMwMiwiZXhwIjoyMDYzNDc1MzAyfQ.H0pMW6qyeO4aXVVhwDfahzIkKoIJ-DyEMWdoui08v50'

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
  
  // Tarayıcıda çalışıyorsa, sadece normal client'ı dön
  if (typeof window !== 'undefined') {
    return getSupabase();
  }
  
  // Sunucu tarafında çalışıyorsa admin client oluştur
  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  return supabaseAdminInstance;
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