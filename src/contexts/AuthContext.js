'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '@/app/data/mockdatas';

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

  // Kullanıcı girişi işlemi
  const login = async (email, password) => {
    try {
      // mockdatas.js'den alınan kullanıcı verileri ile giriş kontrolü
      const userFound = mockUsers.find(u => u.email === email);
      
      // Basit bir şifre kontrolü (gerçek uygulamada şifreler hash'lenecektir)
      // Gerçek projelerde bu şekilde plain text şifre kontrolü yapmayın
      // Burada sadece mock veri olduğu için bu şekilde yapıyoruz
      if (userFound && password === '123456') { // Tüm kullanıcılar için ortak şifre kullanıyoruz
        // Kullanıcı bilgilerini güvenlik için şifresiz saklıyoruz
        const { password, ...userWithoutPassword } = userFound;
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        setUser(userWithoutPassword);
        return { success: true, message: 'Giriş başarılı' };
      } else {
        return { success: false, message: 'Hatalı e-posta veya şifre' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Bir hata oluştu. Lütfen tekrar deneyin.' };
    }
  };

  // Kullanıcı kaydı işlemi
  const register = async (userData) => {
    try {
      // E-posta kontrolü (benzersiz olmalı)
      const existingUser = mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        return { success: false, message: 'Bu e-posta adresi zaten kullanımda' };
      }
      
      // Gerçek uygulamada bir API isteği yapılır
      // Burada mockUsers'a ekleme yapmıyoruz çünkü bunu gerçek bir API'ye gönderecek şekilde düşünüyoruz
      const newUser = {
        id: mockUsers.length + 1, // Rastgele ID
        ...userData,
        role: 'user', // Varsayılan olarak kullanıcı rolü
        status: 'active',
        registrationDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString(),
        ordersCount: 0,
        activeOrder: 0,
        totalSpent: 0,
        addresses: []
      };
      
      // Şifre gizleme
      const { password, ...userWithoutPassword } = newUser;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      
      return { success: true, message: 'Kayıt başarılı' };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.' };
    }
  };

  // Çıkış işlemi
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Yetki kontrolü
  const hasPermission = (requiredRole) => {
    if (!user) return false;
    
    // Admin her sayfaya erişebilir
    if (user.role === 'admin') return true;
    
    // Mağaza rolü kontrolü
    if (requiredRole === 'store' && user.role === 'store') return true;
    
    // Kullanıcı rolü kontrolü
    if (requiredRole === 'user' && (user.role === 'user' || user.role === 'admin' || user.role === 'store')) return true;
    
    // Özel modül kontrolü (örneğin, yemek, market, vb.)
    if (user.modulePermissions && user.modulePermissions[requiredRole]) return true;
    
    return false;
  };

  // Context değeri
  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Context kullanımı için hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 