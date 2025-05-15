'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { BiCheck } from 'react-icons/bi';
import { FiHome, FiShoppingBag } from 'react-icons/fi';

export default function CheckoutSuccess() {
  const router = useRouter();
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sipariş bilgilerini almak için kullanılacak
  useEffect(() => {
    // Gerçek bir uygulamada burada query param'dan sipariş ID'sini alıp API'dan sipariş detaylarını çekersiniz
    // Demo amacıyla localStorage'dan sepet verilerini almayı simüle ediyoruz
    
    const simulateOrderFetch = () => {
      // Simüle edilmiş sipariş verileri
      const demoOrder = {
        id: 'ORD' + Math.floor(Math.random() * 1000000),
        date: new Date().toISOString(),
        totalAmount: localStorage.getItem('lastOrderTotal') || '159.90',
        estimatedDelivery: '30-45 dakika',
        items: JSON.parse(localStorage.getItem('cartItems') || '[]'),
        deliveryAddress: JSON.parse(localStorage.getItem('selectedAddress') || '{"text": "Varsayılan Teslimat Adresi"}'),
        paymentMethod: localStorage.getItem('paymentMethod') || 'Kredi Kartı'
      };
      
      setTimeout(() => {
        setOrderDetails(demoOrder);
        setLoading(false);
      }, 1000);
    };
    
    simulateOrderFetch();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Başarı Animasyonu */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <BiCheck className="text-green-600 text-5xl" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Siparişiniz Alındı!</h1>
          <p className="text-gray-600 mb-6">
            Siparişiniz başarıyla alındı ve hazırlanmaya başlandı.
          </p>
          
          <div className="border border-dashed border-gray-300 rounded-lg p-4 mb-6 max-w-xs mx-auto">
            <p className="text-sm text-gray-500 mb-2">Sipariş Numarası</p>
            <p className="text-lg font-semibold text-gray-800">{orderDetails.id}</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 text-left">
            <p className="text-blue-700 font-medium mb-2">Tahmini Teslimat Süresi</p>
            <p className="text-blue-900 font-bold text-xl">{orderDetails.estimatedDelivery}</p>
          </div>
        </div>
        
        {/* Sipariş Özeti */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sipariş Özeti</h2>
          
          <div className="border-b pb-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tarih</span>
              <span className="font-medium">{new Date(orderDetails.date).toLocaleString('tr-TR')}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Teslimat Adresi</span>
              <span className="font-medium text-right">{orderDetails.deliveryAddress.text}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ödeme Yöntemi</span>
              <span className="font-medium">{orderDetails.paymentMethod}</span>
            </div>
          </div>
          
          {/* Ürünler */}
          <div className="mb-4">
            {orderDetails.items && orderDetails.items.map((item, index) => (
              <div key={index} className="flex justify-between py-2 border-b last:border-b-0">
                <div className="flex items-start">
                  <div className="font-medium mr-2">{item.quantity}x</div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    {item.storeName && <div className="text-sm text-gray-500">{item.storeName}</div>}
                  </div>
                </div>
                <div className="font-medium">{(item.price * item.quantity).toFixed(2)} TL</div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between font-bold text-lg">
            <span>Toplam</span>
            <span>{orderDetails.totalAmount} TL</span>
          </div>
        </div>
        
        {/* Aksiyonlar */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <Link 
            href="/"
            className="flex-1 bg-white text-gray-800 font-semibold py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-center hover:bg-gray-50 flex items-center justify-center"
          >
            <FiHome className="mr-2" />
            Ana Sayfaya Dön
          </Link>
          <Link 
            href="/profil/siparisler"
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-3 px-4 rounded-lg shadow-sm text-center hover:from-orange-600 hover:to-red-700 flex items-center justify-center"
          >
            <FiShoppingBag className="mr-2" />
            Siparişlerime Git
          </Link>
        </div>
      </div>
    </div>
  );
} 