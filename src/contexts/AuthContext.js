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
      // API çağrısı simülasyonu
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Geçersiz e-posta veya şifre');
      }
      
      // Şifreyi kullanıcı nesnesinden çıkar
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Kullanıcıyı set et
      setUser(userWithoutPassword);
      
      // LocalStorage'a kaydet
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Kullanıcı çıkışı işlemi
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  // Yeni kullanıcı kaydı işlemi - store sahipleri ve normal kullanıcılar için
  const register = useCallback(async (name, email, password, role = 'user', businessData = null) => {
    try {
      // E-posta kullanılıyor mu kontrolü
      const emailExists = mockUsers.some(u => u.email === email);
      
      if (emailExists) {
        throw new Error('Bu e-posta adresi zaten kullanılıyor');
      }
      
      // Yeni kullanıcı için ID oluştur
      const newUserId = Math.max(...mockUsers.map(u => u.id)) + 1;
      
      // İsimi parçalara ayırma
      const nameParts = name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      let newUserData = {
        id: newUserId,
        name,
        firstName,
        lastName,
        email,
        password, // Gerçek uygulamada hashlenmelidir
        phone: businessData?.phone || '',
        address: '',
        role: role,
        createdAt: new Date().toISOString(),
        addresses: [],
        favorites: [],
        modulePermissions: {}
      };
      
      // Mock users dizisine ekle
      mockUsers.push(newUserData);
      
      // Store sahibi kaydı ise mağaza bilgilerini de ekle
      if (role === 'store' && businessData) {
        // Yeni mağaza için ID oluştur
        const newStoreId = Math.max(...mockStores.map(s => s.id)) + 1;
        
        const newStore = {
          id: newStoreId,
          ownerId: newUserId,
          name: businessData.businessName,
          email: businessData.businessEmail,
          phone: businessData.businessPhone,
          address: businessData.businessAddress,
          categoryId: parseInt(businessData.categoryId),
          subcategories: businessData.subcategories || [],
          logo: "https://placehold.co/400x400/png",
          coverImage: "https://placehold.co/1200x300/png",
          rating: 0,
          reviewCount: 0,
          status: 'pending', // Yeni mağaza onay bekliyor durumunda
          createdAt: new Date().toISOString(),
          description: `${businessData.businessName} mağazası`
        };
        
        // Mock stores dizisine ekle
        mockStores.push(newStore);
      }
      
      // Şifreyi kullanıcı nesnesinden çıkar
      const { password: _, ...userWithoutPassword } = newUserData;
      
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Kullanıcı verisini güncelle (adres, profil bilgileri, vb.)
  const updateUserData = useCallback(async (updatedUserData) => {
    try {
      // Kullanıcıyı mockUsers dizisinde bul ve güncelle
      const userIndex = mockUsers.findIndex(u => u.id === updatedUserData.id);
      
      if (userIndex === -1) {
        throw new Error('Kullanıcı bulunamadı');
      }
      
      // mockUsers içindeki kullanıcıyı güncelle (şifre korunmalı)
      const passwordFromMock = mockUsers[userIndex].password;
      mockUsers[userIndex] = { ...updatedUserData, password: passwordFromMock };
      
      // Şifreyi kullanıcı nesnesinden çıkar
      const { password, ...userWithoutPassword } = updatedUserData;
      
      // State ve localStorage güncelleme
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Update user data error:', error);
      return { success: false, error: error.message };
    }
  }, []);

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
    isAdmin: user?.role === 'admin',
    isStore: user?.role === 'store',
    isUser: user?.role === 'user',
  }), [user, loading, login, logout, register, updateUserData, hasPermission]);

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