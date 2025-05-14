'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import AuthGuard from '../../components/AuthGuard';

export default function Cart() {
  return (
    <AuthGuard requiredRole="user">
      <CartContent />
    </AuthGuard>
  );
}

function CartContent() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    // Mock veri yükleniyor - gerçek uygulamada bir API isteği yapılabilir
    setTimeout(() => {
      setCartItems([
        {
          id: 1,
          name: 'Adana Kebap',
          price: 120.00,
          quantity: 1,
          image: 'https://placehold.co/100',
          storeName: 'Kebapçı Ahmet'
        },
        {
          id: 2,
          name: 'Ayran',
          price: 15.00,
          quantity: 2,
          image: 'https://placehold.co/100',
          storeName: 'Kebapçı Ahmet'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleApplyCoupon = () => {
    // Mock kupon kodu kontrolü
    if (couponCode === 'INDIRIM20') {
      setDiscount(20);
      alert('Kupon kodu başarıyla uygulandı!');
    } else {
      setDiscount(0);
      alert('Geçersiz kupon kodu!');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = subtotal > 150 ? 0 : 15;
    return subtotal + deliveryFee - discount;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h2 className="mt-4 text-2xl font-bold text-gray-700">Sepetiniz Boş</h2>
        <p className="mt-2 text-gray-500">Sepetinizde ürün bulunmuyor.</p>
        <Link href="/" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Sepetim</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adet
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src={item.image} alt={item.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.storeName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.price.toFixed(2)} ₺</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="text-gray-500 focus:outline-none focus:text-gray-600 p-1"
                        >
                          <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M20 12H4"></path>
                          </svg>
                        </button>
                        <span className="text-gray-700 mx-2">{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="text-gray-500 focus:outline-none focus:text-gray-600 p-1"
                        >
                          <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M12 4v16m8-8H4"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{(item.price * item.quantity).toFixed(2)} ₺</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleRemoveItem(item.id)} className="text-red-600 hover:text-red-900">
                        Kaldır
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Sipariş Özeti</h2>
            
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Ara Toplam</span>
              <span className="font-medium">{calculateSubtotal().toFixed(2)} ₺</span>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Teslimat Ücreti</span>
              <span className="font-medium">{calculateSubtotal() > 150 ? 'Ücretsiz' : '15.00 ₺'}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between mb-2 text-green-600">
                <span>İndirim</span>
                <span>-{discount.toFixed(2)} ₺</span>
              </div>
            )}
            
            <hr className="my-4" />
            
            <div className="flex justify-between mb-6">
              <span className="text-lg font-semibold">Toplam</span>
              <span className="text-lg font-semibold">{calculateTotal().toFixed(2)} ₺</span>
            </div>
            
            <div className="mb-6">
              <div className="flex">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="İndirim Kodu"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-r hover:bg-gray-300 focus:outline-none"
                >
                  Uygula
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Deneme için: INDIRIM20</p>
            </div>
            
            <Link href="/checkout">
              <button className="bg-blue-600 text-white w-full py-3 rounded-md hover:bg-blue-700 transition duration-300">
                Siparişi Tamamla
              </button>
            </Link>
            
            <div className="mt-4">
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Alışverişe Devam Et
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 