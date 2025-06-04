'use client'; import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'; import supabase from '@/lib/supabase'; import { signUp, signIn, signOut, getUserProfile, updateUserProfile } from '@/lib/supabaseApi'; import api from '@/lib/api'; import { useLocalStorageWithExpiry } from '@/hooks/useLocalStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);      const [userBackup, setUserBackup] = useLocalStorageWithExpiry('auth_user_backup', null, 24 * 60);

  // Kullanıcı profili yükle - Cache ile optimize edilmiş
  const loadUserProfile = useCallback(async (authUser) => {
    try {
      console.log('🔧 Debug - Loading profile for user ID:', authUser?.id);
      
      // API çağrıları için timeout wrapper
      const withTimeout = (promise, timeoutMs = 5000) => {
        return Promise.race([
          promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeoutMs)
          )
        ]);
      };
      
      // Rol bilgisi öncelik sırası: raw_user_meta_data > user_metadata > default
      const userRole = authUser?.raw_user_meta_data?.role || authUser?.user_metadata?.role || 'user';
      const userName = authUser?.raw_user_meta_data?.name || authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Kullanıcı';

      console.log('🔧 Debug - User role detected from auth:', userRole);

      // Database'den profil bilgilerini yükle
      let profile = null;
      let storeInfo = null;
      
      try {
        console.log('🔧 Debug - Getting user profile...');
        profile = await withTimeout(getUserProfile(authUser.id), 3000);
        console.log('🔧 Debug - Profile loaded successfully:', profile);
      } catch (profileError) {
        console.warn('Profil yüklenirken hata:', profileError.message);
        profile = { data: null };
      }
      
      // Database'deki rol bilgisini öncelikle kullan
      const finalRole = profile?.data?.role || userRole;
      console.log('🔧 Debug - Final role (database vs auth):', profile?.data?.role, 'vs', userRole, '-> using:', finalRole);
      
      // Store bilgilerini al (sadece store rolü için)
      if (finalRole === 'store') {
        try {
          console.log('🔧 Debug - Getting store info...');
          storeInfo = await withTimeout(api.getStoreByOwnerId(authUser.id), 3000);
          console.log('🔧 Debug - Store info loaded:', storeInfo);
        } catch (storeError) {
          console.warn('Store bilgileri alınamadı:', storeError.message);
          storeInfo = null;
        }
      }

      const fullUser = {
        ...authUser,
        ...profile?.data,
        role: finalRole, // Database'den gelen rol bilgisini kullan
        name: profile?.data?.name || userName,
        storeInfo
      };
      
      console.log('🔧 Debug - Profile data:', profile?.data);
      console.log('🔧 Debug - Full user created:', fullUser);
      
      return fullUser;
    } catch (error) {
      console.error('Profil yüklenirken kritik hata:', error);
      // Fallback user oluştur
      const fallbackUser = {
        ...authUser,
        role: authUser?.raw_user_meta_data?.role || authUser?.user_metadata?.role || 'user',
        name: authUser?.raw_user_meta_data?.name || authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Kullanıcı'
      };
      console.log('🔧 Debug - Fallback user created:', fallbackUser);
      return fallbackUser;
    }
  }, []); // Boş dependency - external API kullanıyor

  // Session kontrolü - STABİL REFERANS
  const checkSession = useCallback(async () => {
    try {
      console.log('🔄 Kullanıcı bilgileri güncelleniyor...');
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const fullUser = await loadUserProfile(session.user); 
        setUser(fullUser); 
        setUserBackup(fullUser);
        console.log('✅ Kullanıcı bilgileri güncellendi');
      } else {
        setUser(null); 
        setUserBackup(null);
        console.log('❌ Oturum bulunamadı');
      }
    } catch (error) {
      console.error('Session kontrol hatası:', error);
      setUser(null);
    }
  }, [loadUserProfile]); // Sadece loadUserProfile dependency

  // İlk yükleme ve auth state listener
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && mounted) { 
          const fullUser = await loadUserProfile(session.user); 
          setUser(fullUser); 
          setUserBackup(fullUser); 
        }
      } catch (error) {
        console.error('Auth başlatma hatası:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) { 
        setUser(null); 
        setUserBackup(null); 
      } else if (session?.user) { 
        const fullUser = await loadUserProfile(session.user); 
        setUser(fullUser); 
        setUserBackup(fullUser); 
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [loadUserProfile]); // Sadece loadUserProfile dependency

  // Gelişmiş sekme değişikliği takibi - ANINDA ÇALIŞIR
  useEffect(() => {
    if (!user?.id) return; // Kullanıcı yoksa listener kurma

    let isRefreshing = false;
    let lastRefreshTime = 0;
    const REFRESH_COOLDOWN = 2000; // 2 saniye cooldown

    // Sekme görünür olduğunda kullanıcı bilgilerini yenile
    const handleVisibilityChange = async () => {
      const now = Date.now();
      
      if (document.visibilityState === 'visible' && 
          !isRefreshing && 
          (now - lastRefreshTime) > REFRESH_COOLDOWN) {
        
        isRefreshing = true;
        lastRefreshTime = now;
        
        console.log('👁️ Sekme aktif oldu - Kullanıcı bilgileri kontrol ediliyor...');
        
        // Kısa bir delay ile kullanıcı deneyimini iyileştir
        setTimeout(async () => {
          try {
            await checkSession();
          } finally {
            isRefreshing = false;
          }
        }, 500);
      }
    };

    // Window focus olduğunda da kontrol et
    const handleWindowFocus = async () => {
      const now = Date.now();
      
      if (!isRefreshing && (now - lastRefreshTime) > REFRESH_COOLDOWN) {
        isRefreshing = true;
        lastRefreshTime = now;
        
        console.log('🎯 Window focus - Kullanıcı bilgileri kontrol ediliyor...');
        
        setTimeout(async () => {
          try {
            await checkSession();
          } finally {
            isRefreshing = false;
          }
        }, 500);
      }
    };

    // Page show event - Geri tuşu ile dönüşlerde de çalışır
    const handlePageShow = async (event) => {
      const now = Date.now();
      
      if (!isRefreshing && (now - lastRefreshTime) > REFRESH_COOLDOWN) {
        isRefreshing = true;
        lastRefreshTime = now;
        
        console.log('📄 Sayfa gösterildi - Kullanıcı bilgileri kontrol ediliyor...');
        
        setTimeout(async () => {
          try {
            await checkSession();
          } finally {
            isRefreshing = false;
          }
        }, 500);
      }
    };

    // Event listener'ları ekle
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('pageshow', handlePageShow);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [user?.id, checkSession]); // user.id dependency'si ile sadece giriş yaptığında aktif olur

  // Login
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await signIn(email, password);
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register
  const register = useCallback(async (fullName, email, password, userRole, formData) => {
    setLoading(true);
    try {
      let userData, businessData;
      
      if (userRole === 'store') {
        // İş ortağı kaydı - formData.userData ve formData.businessData olarak gelir
        userData = formData.userData;
        businessData = formData.businessData;
      } else {
        // Normal kullanıcı kaydı - formData.userData olarak gelir
        userData = formData.userData;
      }
      
      // Auth için userData oluştur
      const authUserData = {
        name: fullName,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        role: userRole,
        // Adres bilgileri sadece normal kullanıcılar için
        ...(userRole === 'user' ? {
          address: userData.address,
          city: userData.city,
          district: userData.district
        } : {})
      };
      
      // Kullanıcı kaydını oluştur
      const { data, error } = await signUp(email, password, authUserData);
      if (error) throw error;
      
      // Normal kullanıcı için addresses tablosuna da kayıt ekle
      if (userRole === 'user' && data.user && userData.fullAddress) {
        try {
          const addressData = {
            user_id: data.user.id,
            title: 'Ana Adres',
            type: 'home',
            full_name: `${userData.firstName} ${userData.lastName}`,
            phone: userData.phone,
            city: userData.city,
            district: userData.district,
            neighborhood: userData.neighborhood,
            street: userData.street,
            building_number: userData.buildingNo || null,
            floor: userData.floor || null,
            apartment_number: userData.apartmentNo || null,
            directions: userData.directions || null,
            full_address: userData.fullAddress,
            is_default: true
          };
          
          const addressResult = await api.createAddress(addressData);
          console.log('Kullanıcı adresi oluşturuldu:', addressResult);
        } catch (addressError) {
          console.error('Kullanıcı adresi oluşturulurken hata:', addressError);
          // Kullanıcı kaydı başarılı olduğu için hatayı sadece logla
        }
      }
      
      // İş ortağı için yetkili kişi adresini addresses tablosuna ekle
      if (userRole === 'store' && data.user && userData.fullAddress) {
        try {
          const ownerAddressData = {
            user_id: data.user.id,
            title: 'Yetkili Kişi Adresi',
            type: 'home',
            full_name: `${userData.firstName} ${userData.lastName}`,
            phone: userData.phone,
            city: userData.city,
            district: userData.district,
            neighborhood: userData.neighborhood,
            street: userData.street,
            building_number: userData.buildingNo || null,
            floor: userData.floor || null,
            apartment_number: userData.apartmentNo || null,
            directions: userData.directions || null,
            full_address: userData.fullAddress,
            is_default: true
          };
          
          const ownerAddressResult = await api.createAddress(ownerAddressData);
          console.log('Yetkili kişi adresi oluşturuldu:', ownerAddressResult);
        } catch (addressError) {
          console.error('Yetkili kişi adresi oluşturulurken hata:', addressError);
          // Kullanıcı kaydı başarılı olduğu için hatayı sadece logla
        }
      }
      
      // Eğer store rolü ise, kullanıcı oluşturulduktan sonra mağaza kaydını da oluştur
      if (userRole === 'store' && data.user && businessData) {
        try {
          const storeDataForDB = {
            name: businessData.name,
            phone: businessData.phone,
            email: businessData.email,
            city: businessData.city,
            district: businessData.district,
            address: businessData.address,
            description: businessData.description,
            category_id: businessData.category_id,
            subcategories: businessData.subcategories,
            owner_id: data.user.id,
            status: businessData.status,
            is_approved: businessData.is_approved,
            logo_url: businessData.logo_url,
            banner_url: businessData.banner_url,
            type: businessData.type
          };
          
          const storeResult = await api.createStore(storeDataForDB);
          console.log('Mağaza kaydı oluşturuldu:', storeResult);
          
          // Admin'lere mağaza kayıt bildirimi gönder
          try {
            await api.createStoreRegistrationNotification(
              businessData.name,
              `${userData.firstName} ${userData.lastName}`,
              storeResult.id
            );
            console.log('✅ Mağaza kayıt bildirimi admin\'lere gönderildi');
          } catch (notificationError) {
            console.error('❌ Mağaza kayıt bildirimi gönderilemedi:', notificationError);
            // Bildirim hatası ana işlemi etkilemesin
          }
          
          return { success: true, user: data.user, data };
        } catch (storeError) {
          console.error('Mağaza kaydı oluşturulurken hata:', storeError);
          // Kullanıcı kaydı başarılı olduğu için hatayı sadece logla
          return { success: false, error: storeError };
        }
      }
      
      return { success: true, user: data.user, data };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await signOut();
      if (error) throw error;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates) => {
    if (!user?.id) throw new Error('Kullanıcı oturumu bulunamadı');

    setLoading(true);
    try {
      const { updateUser } = await import('@/lib/api');
      const updatedUser = await updateUser(user.id, updates);
      
      const fullUser = await loadUserProfile(user);
      setUser(fullUser);
      setUserBackup(fullUser);
      return { success: true, user: fullUser };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, loadUserProfile]);

  // Update avatar
  const updateAvatar = useCallback(async (avatarFile) => {
    if (!user?.id) throw new Error('Kullanıcı oturumu bulunamadı');

    setLoading(true);
    try {
      const { updateUserAvatar } = await import('@/lib/api');
      const result = await updateUserAvatar(user.id, avatarFile);
      
      if (result.success) {
        const fullUser = await loadUserProfile(user);
        setUser(fullUser);
        setUserBackup(fullUser);
        return { success: true, avatarUrl: result.avatarUrl, user: fullUser };
      }
      
      throw new Error('Avatar güncellenemedi');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, loadUserProfile]);

  // Permission check
  const hasPermission = useCallback((module) => {
    if (!user) return false;
    if (module === 'any_auth') return true;
    if (user.role === 'admin') return true;

    switch (module) {
      case 'admin': return user.role === 'admin';
      case 'store': return user.role === 'store' || user.role === 'store_owner';
      case 'store_owner': return user.role === 'store' || user.role === 'store_owner';
      case 'user': return user.role === 'user' || user.role === 'admin';
      default: return false;
    }
  }, [user]);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    updateAvatar,
    hasPermission,
    checkSession,  // Manuel session kontrolü için
    refreshUser: checkSession  // refreshUser alias olarak checkSession kullan
  }), [user, loading, login, register, logout, updateProfile, updateAvatar, hasPermission, checkSession]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth hook AuthProvider içinde kullanılmalıdır');
  }
  return context;
} 