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
      // API isteği simüle ediliyor
      // Gerçek uygulamada fetch veya axios ile API'ye istek atılacak
      const mockUsers = [
        { id: 1, name: 'Ahmet Yılmaz', email: 'admin@test.com', password: '123456', role: 'admin' },
        { id: 2, name: 'Mehmet Demir', email: 'user@test.com', password: '123456', role: 'user' },
        { id: 3, name: 'Ayşe Şahin', email: 'store@test.com', password: '123456', role: 'store' },
      ];
      
      // Kullanıcı kontrol
      const userFound = mockUsers.find(u => u.email === email && u.password === password);
      
      if (userFound) {
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
      // API isteği simüle ediliyor
      // Gerçek uygulamada fetch veya axios ile API'ye istek atılacak
      const newUser = {
        id: Date.now(), // Rastgele ID
        ...userData,
        role: 'user' // Varsayılan olarak kullanıcı rolü
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

  // Context değeri
  const value = {
    user,
    login,
    register,
    logout,
    loading
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