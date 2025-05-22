'use client';
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { 
  signUp, 
  signIn, 
  signOut, 
  getUser, 
  getUserProfile, 
  updateUserProfile 
} from '@/lib/supabaseApi';

// Auth Context oluşturma
const AuthContext = createContext(null);

// Auth Provider bileşeni
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
        // Supabase Auth kullanıcı durumunu dinle    const { data: { subscription } } = supabase.auth.onAuthStateChange(      async (event, session) => {        setLoading(true);                if (session && session.user) {          try {            // Kullanıcı oturum açmış, profil bilgilerini al            const { data: profile, error: profileError } = await getUserProfile(session.user.id);                        if (profileError) {              // Profil bilgileri alınamazsa sadece auth bilgileriyle devam et              setUser({                ...session.user,                role: session.user.user_metadata?.role || 'user',                name: session.user.user_metadata?.name || 'Kullanıcı'              });            } else {              // Rolü auth'dan veya veritabanından al, auth öncelikli              const userRole = session.user.user_metadata?.role || profile?.role || 'user';                            // Kullanıcı bilgilerini ve profilini birleştir              const userWithProfile = {                ...session.user,                ...profile,                role: userRole              };                            setUser(userWithProfile);            }          } catch (error) {            // Hata durumunda en azından temel auth bilgilerini ayarla            setUser({              ...session.user,              role: session.user.user_metadata?.role || 'user',              name: session.user.user_metadata?.name || 'Kullanıcı'            });          }        } else {          // Kullanıcı oturum açmamış          setUser(null);        }                setLoading(false);      }    );

      // Sayfa yüklendiğinde mevcut kullanıcıyı kontrol et
  const fetchUser = async () => {
    try {
      setLoading(true);
      console.log("Fetching initial user...");
      
      const { user: authUser, error: authError } = await getUser();
      
      if (authError) {
        // AuthSessionMissingError gibi hatalar normal durumlardır - session yoksa
        if (authError.message.includes('Auth session missing')) {
          console.log("Auth session missing - kullanıcı giriş yapmamış");
          setUser(null);
          return;
        }
        console.error("Auth user error:", authError);
        setUser(null);
        return;
      }
        
        if (authUser) {
          console.log("Initial Auth User:", authUser);
          console.log("Initial Auth Metadata:", authUser.user_metadata);
          
          try {
            // Kullanıcı profil bilgilerini al
            const { data: profile, error: profileError } = await getUserProfile(authUser.id);
            
            if (profileError) {
              console.error("Profil bilgileri alınamadı:", profileError);
              
              // Profil bilgileri alınamazsa sadece auth bilgileriyle devam et
              setUser({
                ...authUser,
                role: authUser.user_metadata?.role || 'user',
                name: authUser.user_metadata?.name || 'Kullanıcı'
              });
            } else {
              console.log("Initial DB Profile:", profile);
              
              // Rolü auth'dan veya veritabanından al, auth öncelikli
              const userRole = authUser.user_metadata?.role || profile?.role || 'user';
              console.log("Initial Determined Role:", userRole);
              
              // Kullanıcı bilgilerini ve profilini birleştir
              const userWithProfile = {
                ...authUser,
                ...profile,
                role: userRole
              };
              
              setUser(userWithProfile);
            }
          } catch (error) {
            console.error("Fetch user profile error:", error);
            // Hata durumunda en azından temel auth bilgilerini ayarla
            setUser({
              ...authUser,
              role: authUser.user_metadata?.role || 'user',
              name: authUser.user_metadata?.name || 'Kullanıcı'
            });
          }
        } else {
          console.log("No initial user found");
          setUser(null);
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri alınamadı:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Cleanup
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Kullanıcı girişi işlemi - useCallback ile memoization
  const login = useCallback(async (email, password) => {
    try {
      console.log("Login attempt for:", email);
      const { data, error } = await signIn(email, password);
      
      if (error) {
        console.error("Login auth error:", error);
        throw error;
      }
      
      if (!data || !data.user) {
        console.error("Login succeeded but no user data returned");
        throw new Error("Kullanıcı bilgileri alınamadı");
      }
      
      console.log("Login Auth User:", data.user);
      console.log("Login Metadata:", data.user.user_metadata);
      
      try {
        // Kullanıcı profil bilgilerini al
        const { data: profile, error: profileError } = await getUserProfile(data.user.id);
        
        if (profileError) {
          console.error("Login - profil bilgileri alınamadı:", profileError);
          
          // Profil bilgileri alınamazsa sadece auth bilgileriyle devam et
          const basicUser = {
            ...data.user,
            role: data.user.user_metadata?.role || 'user',
            name: data.user.user_metadata?.name || 'Kullanıcı'
          };
          
          setUser(basicUser);
          return { success: true, user: basicUser };
        }
        
        console.log("Login DB Profile:", profile);
        
        // Rolü auth'dan veya veritabanından al, auth öncelikli
        const userRole = data.user.user_metadata?.role || profile?.role || 'user';
        console.log("Login Determined Role:", userRole);
        
        // Kullanıcı bilgilerini ve profilini birleştir
        const userWithProfile = {
          ...data.user,
          ...profile,
          role: userRole
        };
        
        setUser(userWithProfile);
        
        return { success: true, user: userWithProfile };
      } catch (error) {
        console.error("Login - profil alma hatası:", error);
        
        // Hata durumunda en azından temel auth bilgilerini ayarla
        const basicUser = {
          ...data.user,
          role: data.user.user_metadata?.role || 'user',
          name: data.user.user_metadata?.name || 'Kullanıcı'
        };
        
        setUser(basicUser);
        return { success: true, user: basicUser };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Giriş sırasında bir hata oluştu' };
    }
  }, []);

  // Kullanıcı çıkışı işlemi
  const logout = useCallback(async () => {
    try {
      const { error } = await signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Yeni kullanıcı kaydı işlemi - store sahipleri ve normal kullanıcılar için
  const register = useCallback(async (name, email, password, role = 'user', businessData = null) => {
    try {
      // İsimi parçalara ayırma
      const nameParts = name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      // User metadata
      const userData = {
        name,
        firstName,
        lastName,
        role,
        phone: businessData?.phone || '',
      };

      // Supabase Auth'a kullanıcı kaydet
      const { user: authUser, error: signUpError } = await signUp(email, password, userData);
      
      if (signUpError) {
        throw signUpError;
      }
      
      if (!authUser) {
        throw new Error('Kullanıcı oluşturulamadı');
      }

      // Profil tablosuna ek bilgileri kaydet
      const profileData = {
        id: authUser.id,
        name,
        email,
        first_name: firstName,
        last_name: lastName,
        phone: businessData?.phone || '',
        role,
        updated_at: new Date().toISOString(),
      };

      // Profil tablosuna kaydet
      const { error: profileError } = await supabase
        .from('users')
        .insert(profileData);
      
      if (profileError) {
        throw profileError;
      }
      
      // Store sahibi kaydı ise mağaza bilgilerini de ekle
      if (role === 'store' && businessData) {
        const storeData = {
          owner_id: authUser.id,
          name: businessData.businessName,
          email: businessData.businessEmail,
          phone: businessData.businessPhone,
          address: businessData.businessAddress,
          category_id: parseInt(businessData.categoryId),
          subcategories: businessData.subcategories || [],
          logo: "https://placehold.co/400x400/png",
          cover_image: "https://placehold.co/1200x300/png",
          rating: 0,
          review_count: 0,
          status: 'pending', // Yeni mağaza onay bekliyor durumunda
          created_at: new Date().toISOString(),
          description: `${businessData.businessName} mağazası`
        };
        
        // Stores tablosuna kaydet
        const { error: storeError } = await supabase
          .from('stores')
          .insert(storeData);
        
        if (storeError) {
          throw storeError;
        }
      }
      
      return { success: true, user: { ...authUser, ...profileData } };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message || 'Kayıt sırasında bir hata oluştu' };
    }
  }, []);

  // Kullanıcı verisini güncelle (adres, profil bilgileri, vb.)
  const updateUserData = useCallback(async (updatedUserData) => {
    try {
      if (!user) {
        throw new Error('Kullanıcı oturum açmamış');
      }
      
      // Sadece profil bilgilerini güncelle
      const { 
        email, password, id, created_at, updated_at, 
        role, ...profileData 
      } = updatedUserData;
      
      // updated_at ekle
      profileData.updated_at = new Date().toISOString();
      
      // Profil bilgilerini güncelle
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id)
        .select();
      
      if (error) {
        throw error;
      }
      
      // Kullanıcı bilgilerini güncelle
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Update user data error:', error);
      return { success: false, error: error.message || 'Profil güncellenirken bir hata oluştu' };
    }
  }, [user]);

  // Kullanıcı yetkisini kontrol et
  const hasPermission = useCallback((module, action) => {
    if (!user) return false;
    
    // Admin her şeye erişebilir
    if (user.role === 'admin') return true;
    
    // Modül bazlı yetkilendirme
    switch (module) {
      case 'kampanya':
        // Mağaza sahipleri kampanya oluşturabilir
        if (action === 'create' && user.role === 'store') return true;
        
        // Kampanyaları herkes görüntüleyebilir
        if (action === 'view') return true;
        
        // Admin olmayan kullanıcılar admin sayfasına erişemez
        if (action === 'admin') return false;
        
        return false;
        
      case 'siparis':
        // Kullanıcılar kendi siparişlerini görüntüleyebilir
        if (action === 'view' && (user.role === 'user' || user.role === 'store')) return true;
        
        // Mağaza sahipleri kendilerine gelen siparişleri yönetebilir
        if ((action === 'manage' || action === 'update') && user.role === 'store') return true;
        
        return false;
        
      case 'magaza':
        // Mağaza sahipleri kendi mağazalarını düzenleyebilir
        if ((action === 'edit' || action === 'manage') && user.role === 'store') return true;
        
        // Herkes mağazaları görüntüleyebilir
        if (action === 'view') return true;
        
        return false;
        
      default:
        return false;
    }
  }, [user]);

  // Memoize edilen context değeri
  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateUserData,
    hasPermission,
    getUserProfile,
    isAdmin: user?.role === 'admin',
    isStore: user?.role === 'store',
    isUser: user?.role === 'user',
  }), [user, loading, login, logout, register, updateUserData, hasPermission, getUserProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Auth Context hook'u
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 