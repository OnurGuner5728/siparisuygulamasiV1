email confirmation linki yönlendirme hatası: http://localhost:3000/#error=server_error&error_code=unexpected_failure&error_description=Error+confirming+user

**✅ ÇÖZÜLDÜ:**
**Sorun:** Supabase email confirmation URL'i localhost:3000 olarak ayarlanmış ve redirect URL'leri doğru yapılandırılmamış.
**Çözüm:**
1. **Site URL yapılandırması:** Supabase dashboard -> Authentication -> URL Configuration:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/confirm`, `http://localhost:3000/login`

2. **Email template güncelleme:** Supabase dashboard -> Authentication -> Email Templates -> Confirm signup:
   ```html
   <h2>Confirm your signup</h2>
   <p>Follow this link to confirm your user:</p>
   <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your email</a></p>
   ```

3. **Confirmation handler sayfası güncellendi:** `src/app/auth/confirm/page.js`
   - Email confirmation token'ını işler
   - Başarılı/başarısız durumları yönetir  
   - Kullanıcıyı uygun sayfaya yönlendirir
   - Debug bilgileri eklendi - URL'de hata varsa direkt gösterir
   - OTP verification detaylı loglanıyor

4. **Database trigger eklendi:** Email confirm edildiğinde user status'unu 'active' yapar

⚠️ **Manuel Supabase Ayarları Gerekli:**
- Supabase dashboard'da yukarıdaki URL ayarlarını yapmanız gerekiyor
- Email template'ini güncelleyin

---

campaigns logo hatası: column "logo" of relation "stores_1" does not exist

**✅ ÇÖZÜLDÜ:**
**Sorun:** getCampaigns API fonksiyonunda stores tablosundan 'logo' sütunu çekilmeye çalışılıyor ama bu sütun 'logo_url' olarak adlandırılmış.
**Çözüm:**
1. **API güncellendi:** `src/lib/api.js` ve `src/lib/supabaseApi.js` dosyalarında campaigns için:
   - `status` yerine `is_active` kullanılıyor
   - `logo` yerine `logo_url` kullanılıyor
2. **Doğru sütun adı:** 
   ```javascript
   .select(`
     *,
     store:stores (id, name, logo_url, category_id)
   `)
   .eq('is_active', true)
   ```

---

modül izinleri hatası: JSON object requested, multiple (or no) rows returned

**✅ ÇÖZÜLDÜ:**
**Sorun:** module_permissions tablosunda birden fazla kayıt var ve .single() kullanılıyor.
**Çözüm:**
1. **Database düzenlendi:** Default modül kayıtları eklendi:
   - yemek: true (aktif)
   - market: true (aktif)  
   - su: true (aktif)
   - aktuel: false (pasif)

2. **API güncellendi:** `src/lib/api.js` dosyasında:
   - `.single()` yerine array döndürüyor
   - Hata durumunda varsayılan değerler döndürülüyor
   - Module_permissions tablosunun yeni yapısına uygun güncellendi

3. **Mevcut yapı:** module_name, is_enabled, display_name, description, roles, settings

---

register form yapısı karmaşıklığı: kişisel ve mağaza bilgileri karışık

**✅ TAMAMEN YENİDEN YAZILDI:**
**Sorun:** Register formunda kişisel bilgiler ve mağaza bilgileri karışık, email senkronizasyonu sorunlu.
**Çözüm:**

1. **Form State Ayrıldı:** `src/app/register/page.js`
   ```javascript
   // Ayrı state'ler:
   const [accountType, setAccountType] = useState('customer');
   const [personalInfo, setPersonalInfo] = useState({...});
   const [addressInfo, setAddressInfo] = useState({...});
   const [businessInfo, setBusinessInfo] = useState({...});
   ```

2. **Handler Fonksiyonları Ayrıldı:**
   - `handlePersonalInfoChange()` - Kişisel bilgiler
   - `handleAddressInfoChange()` - Müşteri adres bilgileri  
   - `handleBusinessInfoChange()` - Mağaza bilgileri
   - `handleSubcategoryChange()` - Alt kategori seçimi

3. **Validation Düzenlendi:**
   - Kişisel bilgiler her iki rol için de zorunlu
   - Adres bilgileri sadece müşteri için
   - Mağaza bilgileri sadece iş ortağı için
   - Email'lerin farklı olması zorunlu (kişisel ≠ mağaza)
   - 10-11 haneli telefon kontrolü

4. **UI/UX İyileştirmeleri:**
   - Modern tasarım (rounded-xl, gradientler)
   - Hata gösterimi iyileştirildi
   - Loading state'leri
   - Alt kategori seçimi grid layout
   - Responsive tasarım

5. **Kayıt Süreci:**
   - Önce kullanıcı kaydı (auth.users + public.users)
   - Sonra mağaza kaydı (public.stores) - sadece iş ortağı için
   - Admin onayı bekleyen status
   - Detaylı başarı mesajları

**Test Edilmesi Gerekenler:**
- [x] Kampanyalar API'si düzgün çalışıyor
- [x] Modül izinleri düzgün çalışıyor  
- [x] Register formu hem müşteri hem iş ortağı için çalışıyor
- [x] Kişisel ve mağaza bilgileri ayrı tutuluyor
- [ ] Email confirmation linki çalışıyor mu? (Manuel Supabase ayarı gerekli)

**Kalan Manuel İşlemler:**
1. Supabase dashboard'da Authentication -> URL Configuration ayarları
2. Email Templates güncelleme
3. Site URL ve Redirect URL'leri ayarlama

