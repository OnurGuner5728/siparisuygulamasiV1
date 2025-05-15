'use client';
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { mockUsers, mockStores } from '@/app/data/mockdatas';

// Auth Context oluşturma
const AuthContext = createContext(null);

// Auth Provider bileşeni
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgisini al
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Kullanıcı girişi işlemi - useCallback ile memoization
  const login = useCallback(async (email, password) => {
    try {
      // mockdatas.js'den alınan kullanıcı verileri ile giriş kontrolü
      const userFound = mockUsers.find(u => u.email === email);
      
      if (userFound) {
        // Gerçek uygulamada şifre hashlenerek kontrol edilecektir
        // Bu örnek için sadece giriş var kabul ediyoruz
        // Bu kısım ileride backend entegrasyonu ile değiştirilecek
        
        localStorage.setItem('user', JSON.stringify(userFound));
        setUser(userFound);
        return { success: true, user: userFound };
      } else {
        return { success: false, message: 'Kullanıcı bulunamadı.' };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: 'Bir hata oluştu.' };
    }
  }, []);

  // Kullanıcı kaydı işlemi - useCallback ile memoization
  const register = useCallback((fullName, email, password, role = 'user', businessData = null) => {
    try {
      // Email kontrolü
      const userExists = mockUsers.find(u => u.email === email);
      if (userExists) {
        return { success: false, error: 'Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var.' };
      }

      // Yeni kullanıcı ID'si (en yüksek ID + 1)
      const newId = Math.max(...mockUsers.map(u => u.id)) + 1;
      
      // Varsayılan kullanıcı izinleri
      const defaultPermissions = {
        yemek: true,
        market: true,
        su: true,
        aktuel: role === 'admin',
        kampanya: {
          view: true,
          create: role === 'store' || role === 'admin',
          admin: role === 'admin'
        }
      };

      // Yeni kullanıcı nesnesi
      const newUser = {
        id: newId,
        name: fullName,
        email: email,
        phone: businessData?.phone || '',
        role: role,
        status: role === 'store' ? 'pending' : 'active',
        addressIds: [],
        registrationDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        orderCount: 0,
        activeOrder: 0,
        totalSpent: 0,
        modulePermissions: defaultPermissions
      };

      // Mağaza kaydı için ek bilgiler
      if (role === 'store' && businessData) {
        // Yeni mağaza ID'si (en yüksek ID + 1)
        const newStoreId = Math.max(...mockStores.map(s => s.id)) + 1;
        
        // Mock mağaza verisi
        const newStore = {
          id: newStoreId,
          name: businessData.businessName,
          ownerName: fullName,
          email: businessData.businessEmail,
          phone: businessData.businessPhone,
          ownerId: newId,
          categoryId: parseInt(businessData.categoryId),
          description: '', // Varsayılan boş açıklama
          addressId: null, // Gerçek uygulamada adres kaydı yapılacak
          rating: 0,
          status: 'pending', // Mağaza onay bekliyor
          isOpen: false,
          approved: false,
          registrationDate: new Date().toISOString(),
          ordersCount: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          image: '/default-store.jpg',
          modulePermissions: defaultPermissions,
          // Alt kategorileri diziye dönüştür
          subcategories: businessData.subcategories || []
        };

        // Mağaza kategorisine göre modül izinlerini ayarla
        if (parseInt(businessData.categoryId) === 1) { // Yemek
          newStore.modulePermissions.yemek = true;
          newStore.modulePermissions.market = false;
          newStore.modulePermissions.su = false;
        } else if (parseInt(businessData.categoryId) === 2) { // Market
          newStore.modulePermissions.yemek = false;
          newStore.modulePermissions.market = true;
          newStore.modulePermissions.su = false;
        } else if (parseInt(businessData.categoryId) === 3) { // Su
          newStore.modulePermissions.yemek = false;
          newStore.modulePermissions.market = false;
          newStore.modulePermissions.su = true;
        }

        // Mağaza verilerini mockStores dizisine ekle
        mockStores.push(newStore);
        console.log('Yeni mağaza kaydı:', newStore);
        
        // Kullanıcı izinlerini mağaza verisiyle uyumlu olacak şekilde güncelle
        newUser.modulePermissions = newStore.modulePermissions;
      }

      // Kullanıcıyı mockUsers'a ekle
      mockUsers.push(newUser);
      console.log('Yeni kullanıcı kaydı:', newUser);
      
      // Giriş yap (mağaza kullanıcıları onaylanıncaya kadar giriş yapamaz)
      if (role !== 'store') {
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
      }
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: 'Kayıt işlemi sırasında bir hata oluştu.' };
    }
  }, []);

  // Kullanıcı çıkışı işlemi - useCallback ile memoization
  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // İzin kontrolü fonksiyonu - useCallback ile memoization
  const hasPermission = useCallback((moduleName, permissionType = 'view') => {
    if (!user) return false;
    
    // Admin her modüle erişebilir
    if (user.role === 'admin') return true;
    
    // any_auth kontrolü (yalnızca giriş yapmış herhangi bir kullanıcı yeterli)
    if (moduleName === 'any_auth') {
      return Boolean(user);
    }
    
    // Standart modül erişimi (aktüel, yemek, market, su)
    if (typeof user.modulePermissions[moduleName] === 'boolean') {
      return user.modulePermissions[moduleName];
    }
    
    // Kampanya gibi detaylı izin kontrolü için
    if (typeof user.modulePermissions[moduleName] === 'object') {
      // Eğer istenen izin 'admin' ise, sadece admin kullanıcıları için izin ver
      if (permissionType === 'admin' && user.role !== 'admin') {
        return false;
      }
      
      // Eğer istenen izin 'create' ve kullanıcı 'user' rolündeyse, izin verme
      if (permissionType === 'create' && user.role === 'user') {
        return false; // Müşteri kullanıcılar kampanya oluşturamaz
      }
      
      return user.modulePermissions[moduleName][permissionType] || false;
    }
    
    return false;
  }, [user]);

  // Kullanıcı hesabını doğrulama 
  const isAuthenticated = !!user;

  // Context değerlerini useMemo ile memoize etme
  const contextValue = useMemo(() => ({ 
    user, 
    login, 
    logout, 
    register,
    isAuthenticated, 
    loading,
    hasPermission 
  }), [user, login, logout, register, isAuthenticated, loading, hasPermission]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Auth hook
export function useAuth() {
  return useContext(AuthContext);
} 