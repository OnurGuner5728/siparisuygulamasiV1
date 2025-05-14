'use client';
import { createContext, useContext, useState, useEffect } from 'react';

// Mock kullanıcı verileri
const MOCK_USERS = [
  {
    id: 1,
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    password: '123456',
    role: 'user',
    addresses: [
      { 
        id: 1, 
        title: 'Ev', 
        fullName: 'Ahmet Yılmaz',
        phone: '0555 111 2233',
        city: 'İstanbul',
        district: 'Kadıköy',
        neighborhood: 'Göztepe',
        fullAddress: 'Örnek Sokak No:1 D:5',
        isDefault: true 
      }
    ]
  },
  {
    id: 2,
    name: 'Admin Kullanıcı',
    email: 'admin@example.com',
    password: '123456',
    role: 'admin'
  },
  {
    id: 3,
    name: 'Kebapçı Ahmet',
    email: 'kebapci@example.com',
    password: '123456',
    role: 'store',
    storeInfo: {
      id: 1,
      category: 'Yemek',
      description: 'En lezzetli kebaplar',
      rating: 4.7,
      approved: true
    }
  },
  {
    id: 4,
    name: 'Yeni Mağaza',
    email: 'store@example.com',
    password: '123456',
    role: 'store',
    storeInfo: {
      id: 4,
      category: 'Market',
      description: 'Yeni açılan market',
      rating: 0,
      approved: false
    }
  }
];

// Auth Context oluşturma
const AuthContext = createContext();

// Auth Provider bileşeni
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgisini kontrol etme
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Stored user parsing error:', error);
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  // Giriş yapma fonksiyonu
  const login = (email, password) => {
    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );
    
    if (foundUser) {
      // Şifreyi client tarafına göndermeyelim
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));

      // Yönlendirme için localStorage'dan redirect path'i kontrol et
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin');
        // Burada yönlendirme yapılabilir ama biz sadece return değeri döndüreceğiz
      }

      return { success: true };
    }
    
    return { 
      success: false, 
      error: 'E-posta veya şifre hatalı'
    };
  };

  // Çıkış yapma fonksiyonu
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  // Kayıt olma fonksiyonu
  const register = (name, email, password, role = 'user') => {
    // E-posta kontrolü
    if (MOCK_USERS.some((u) => u.email === email)) {
      return { 
        success: false, 
        error: 'Bu e-posta adresi zaten kullanılıyor' 
      };
    }
    
    // Yeni kullanıcı oluşturma
    const newUser = {
      id: MOCK_USERS.length + 1,
      name,
      email,
      role,
      addresses: []
    };
    
    // Store rolü için ek bilgiler
    if (role === 'store') {
      newUser.storeInfo = {
        id: Date.now(), // Benzersiz ID
        category: '',
        description: '',
        rating: 0,
        approved: false // Yeni mağazalar varsayılan olarak onaylanmamış durumda
      };
    }

    // Gerçek bir backend'de bu noktada veritabanına kayıt yapılır
    // Mock sistemde sadece memory'de tutulan diziye ekliyoruz
    MOCK_USERS.push({...newUser, password});

    // Kullanıcı şifresini client tarafında saklamak güvenli değil
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    
    return { success: true };
  };

  // Yetki kontrolü
  const hasPermission = (requiredRole) => {
    if (!user) return false;
    
    // any_auth değeri sadece giriş yapılmış olmasını kontrol eder
    if (requiredRole === 'any_auth') return true;
    
    // Admin tüm sayfalara erişebilir
    if (user.role === 'admin') return true;
    
    // Kullanıcının rolü istenen rolle aynı mı?
    return user.role === requiredRole;
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook oluşturma
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth hook must be used within an AuthProvider');
  }
  return context;
}; 