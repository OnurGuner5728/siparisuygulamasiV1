'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSend, FiArrowLeft, FiPhone, FiMapPin } from 'react-icons/fi';
import { mockOrders } from '@/app/data/mockdatas';
import React from 'react';

export default function CourierMessage({ params }) {
  const router = useRouter();
  const id = React.use(params).id;
  const [courier, setCourier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  
  // Mesajları aşağı doğru kaydır
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Kurye bilgilerini yükle
  useEffect(() => {
    const loadData = () => {
      try {
        // Gerçek uygulamada API'dan getirme işlemi yapılır
        setTimeout(() => {
          // Sipariş bilgisini almak için
          const order = mockOrders.find(order => order.id === id);
          
          if (!order) {
            setLoading(false);
            router.replace('/profil/siparisler');
            return;
          }
          
          // Demo kurye bilgileri
          const courierData = {
            id: 'CRR123',
            name: 'Mehmet K.',
            phone: '+90 555 987 65 43',
            photo: '/images/couriers/courier-placeholder.jpg',
            rating: 4.8,
            lastSeen: 'şimdi çevrimiçi'
          };
          
          setCourier(courierData);
          
          // Demo mesajlar
          const demoMessages = [
            {
              id: 1,
              sender: 'courier',
              text: 'Merhaba, siparişinizi aldım. 10-15 dakika içinde teslimat adresinde olacağım.',
              time: new Date(Date.now() - 900000).toISOString() // 15 dakika önce
            },
            {
              id: 2,
              sender: 'user',
              text: 'Tamam, teşekkürler. Bina girişinde sizi bekliyor olacağım.',
              time: new Date(Date.now() - 600000).toISOString() // 10 dakika önce
            },
            {
              id: 3,
              sender: 'courier',
              text: 'Merhaba, binanızın önündeyim.',
              time: new Date(Date.now() - 60000).toISOString() // 1 dakika önce
            }
          ];
          
          setMessages(demoMessages);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
        setLoading(false);
        router.replace('/profil/siparisler');
      }
    };
    
    if (id) {
      loadData();
    }
  }, [id, router]);
  
  // Mesajlar yüklendiğinde ve yeni mesaj eklendiğinde aşağı kaydır
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Mesaj gönder
  const sendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const newMsg = {
      id: messages.length + 1,
      sender: 'user',
      text: newMessage,
      time: new Date().toISOString()
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    // Kurye cevabı simülasyonu
    if (messages.length > 0 && messages[messages.length - 1].sender === 'courier') {
      setTimeout(() => {
        const courierReply = {
          id: messages.length + 2,
          sender: 'courier',
          text: 'Tamam, teşekkürler 👍',
          time: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, courierReply]);
      }, 2000);
    }
  };
  
  // Mesaj gönder (Enter tuşu ile)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Tarih formatlama
  const formatMessageTime = (dateString) => {
    const messageDate = new Date(dateString);
    return messageDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full mb-4"></div>
            <div className="h-4 w-24 bg-gray-300 rounded mb-3"></div>
            <div className="h-3 w-32 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Başlık */}
      <div className="bg-white shadow-sm z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              aria-label="Geri Dön"
            >
              <FiArrowLeft size={20} />
            </button>
            
            <div className="flex items-center flex-1">
              <div className="w-10 h-10 bg-blue-100 rounded-full mr-3 flex items-center justify-center text-blue-600">
                {courier?.name?.charAt(0) || "K"}
              </div>
              
              <div className="flex-1">
                <h1 className="text-base font-semibold text-gray-800">{courier?.name || "Kurye"}</h1>
                <p className="text-xs text-green-600">{courier?.lastSeen}</p>
              </div>
            </div>
            
            <button 
              onClick={() => router.push(`/delivery/${id}/call`)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 ml-2"
              aria-label="Kuryeyi Ara"
            >
              <FiPhone size={20} />
            </button>
            
            <button 
              onClick={() => router.push(`/profil/siparisler/${id}/tracking`)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 ml-2"
              aria-label="Siparişi Takip Et"
            >
              <FiMapPin size={20} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Bilgi mesajı */}
          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm text-center">
            <p>Bu görüşmede sipariş bilgilerinizi veya kredi kartı bilgilerinizi paylaşmayın.</p>
          </div>
          
          {/* Mesaj baloncukları */}
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs rounded-lg p-3 ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' 
                    : 'bg-white text-gray-800 shadow'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p 
                  className={`text-xs mt-1 text-right ${
                    msg.sender === 'user' ? 'text-orange-100' : 'text-gray-400'
                  }`}
                >
                  {formatMessageTime(msg.time)}
                </p>
              </div>
            </div>
          ))}
          
          {/* Görüldü göstergesi */}
          {messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
            <div className="flex justify-end">
              <div className="text-xs text-gray-500">
                Görüldü
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Mesaj giriş alanı */}
      <div className="bg-white border-t border-gray-200 p-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-end">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full border border-gray-300 rounded-full px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none max-h-24"
                placeholder="Mesajınızı yazın..."
                rows={1}
                style={{ minHeight: '44px' }}
              />
            </div>
            
            <button 
              onClick={sendMessage}
              disabled={newMessage.trim() === ''}
              className={`ml-2 w-10 h-10 flex items-center justify-center rounded-full ${
                newMessage.trim() === '' 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
              }`}
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 