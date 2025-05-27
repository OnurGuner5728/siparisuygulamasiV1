'use client'; import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'; import supabase from '@/lib/supabase'; import { signUp, signIn, signOut, getUserProfile, updateUserProfile } from '@/lib/supabaseApi'; import api from '@/lib/api'; import { useLocalStorageWithExpiry } from '@/hooks/useLocalStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);      const [userBackup, setUserBackup] = useLocalStorageWithExpiry('auth_user_backup', null, 24 * 60);

  // Kullanıcı profili yükle - Cache ile optimize edilmiş
  const loadUserProfile = useCallback(async (authUser) => {
    try {
      // Eğer kullanıcı bilgileri zaten yeterliyse, API çağrısı yapma
      const userRole = authUser?.user_metadata?.role || 'user';
      const userName = authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Kullanıcı';

      // Her zaman database'den profil bilgilerini yükle
      let profile = null;
      let storeInfo = null;
      
      profile = await getUserProfile(authUser.id).catch(error => {
        console.warn('Profil yüklenirken hata:', error);
        return { data: null };
      });
      
      // Store bilgilerini al (sadece store rolü için)
      if (userRole === 'store') {
        storeInfo = await api.getStoreByOwnerId(authUser.id).catch(error => {
          console.warn('Store bilgileri alınamadı:', error);
          return null;
        });
      }

      const fullUser = {
        ...authUser,
        ...profile?.data,
        role: userRole,
        name: profile?.data?.name || userName,
        storeInfo
      };
      
      console.log('🔧 Debug - Profile data:', profile?.data);
      console.log('🔧 Debug - Full user:', fullUser);
      

      
      return fullUser;
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
      return {
        ...authUser,
        role: authUser?.user_metadata?.role || 'user',
        name: authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Kullanıcı'
      };
    }
  }, []); // Boş dependency - external API kullanıyor

  // Session kontrolü - STABİL REFERANS
  const checkSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const fullUser = await loadUserProfile(session.user); setUser(fullUser); setUserBackup(fullUser);

      } else {
        setUser(null); setUserBackup(null);

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

  // Page visibility kontrolü - AYRI useEffect
  useEffect(() => {
    let lastVisibilityChange = Date.now();

    const handleVisibilityChange = () => {
      // En az 5 dakika geçtiyse ve user varsa kontrol et
      const now = Date.now();
      if (document.visibilityState === 'visible' &&
        user?.id &&
        (now - lastVisibilityChange) > 5 * 60 * 1000) {
        lastVisibilityChange = now;
        setTimeout(checkSession, 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkSession]); // user dependency'den çıkarıldı

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
  const register = useCallback(async (fullName, email, password, userRole, additionalData) => {
    setLoading(true);
    try {
      // userData formatını düzgün şekilde oluştur
      const userData = {
        name: fullName,
        firstName: additionalData.firstName,
        lastName: additionalData.lastName,
        role: userRole,
        // Store rolü için sadece kullanıcı bilgilerini auth'a gönder
        ...(userRole === 'store' ? {
          phone: additionalData.owner_phone
        } : {
          phone: additionalData.phone,
          address: additionalData.address,
          city: additionalData.city,
          district: additionalData.district
        })
      };
      
      const { data, error } = await signUp(email, password, userData);
      if (error) throw error;
      
      // Eğer store rolü ise, kullanıcı oluşturulduktan sonra mağaza kaydını da oluştur
      if (userRole === 'store' && data.user) {
        try {
          const storeData = {
            name: additionalData.name,
            phone: additionalData.phone,
            email: additionalData.email,
            address: additionalData.address,
            category_id: additionalData.category_id,
            subcategories: additionalData.subcategories,
            owner_id: data.user.id,
            owner_phone: additionalData.owner_phone,
            is_approved: false,
            status: 'pending',
            logo: additionalData.logo,
            type: additionalData.type
          };
          
          const storeResult = await api.createStore(storeData);
          console.log('Mağaza kaydı oluşturuldu:', storeResult);
        } catch (storeError) {
          console.error('Mağaza kaydı oluşturulurken hata:', storeError);
          // Kullanıcı kaydı başarılı olduğu için hatayı sadece logla
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
      const { data, error } = await updateUserProfile(user.id, updates);
      if (error) throw error;

      const fullUser = await loadUserProfile(user); setUser(fullUser); setUserBackup(fullUser); return { success: true, user: fullUser };
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
      case 'store': return user.role === 'store';
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
    hasPermission,
    checkSession,  // Manuel session kontrolü için
    refreshUser: checkSession  // refreshUser alias olarak checkSession kullan
  }), [user, loading, login, register, logout, updateProfile, hasPermission, checkSession]);

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