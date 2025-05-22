'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiSend, FiArrowLeft, FiPhone, FiMapPin } from 'react-icons/fi';
import api from '@/lib/api';

export default function OrderMessagePage() {
  return <OrderMessageContent />;
}

function OrderMessageContent() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;
  
  const [recipient, setRecipient] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    const loadOrderAndRecipientData = async () => {
      if (!orderId) {
        setError('Sipariş ID\'si bulunamadı.');
        setLoading(false);
        router.replace('/profil/siparisler');
        return;
      }
      setLoading(true);
      try {
        const orderData = await api.getOrderById(orderId);
        
        if (!orderData) {
          setError('Sipariş bulunamadı.');
          setLoading(false);
          router.replace('/profil/siparisler');
          return;
        }
        setOrder(orderData);
        
        if (orderData.customer) {
          setRecipient({
            id: orderData.customer.id,
            name: orderData.customer.name || 'Müşteri',
            avatar_url: orderData.customer.avatar_url || '/images/avatar-placeholder.png'
          });
        } else {
          setError('Mesajlaşılacak kişi bilgisi (müşteri) bulunamadı.');
        }

        const demoMessages = [
          {
            id: 1,
            sender: recipient?.name || 'Karşı Taraf',
            text: `Merhaba, ${orderData.id.substring(0,8)}... numaralı siparişiniz hakkında. Teslimata çıkmak üzereyim.`,
            time: new Date(Date.now() - 900000).toISOString()
          },
          {
            id: 2,
            sender: 'user',
            text: 'Harika, teşekkürler! Adresteyim.',
            time: new Date(Date.now() - 600000).toISOString()
          }
        ];
        setMessages(demoMessages);

      } catch (err) {
        console.error('Sipariş ve alıcı verileri yüklenirken hata:', err);
        setError('Veriler yüklenirken bir sorun oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      loadOrderAndRecipientData();
    }
  }, [orderId, router]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
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
    
    if (recipient && messages.length > 0 && messages[messages.length - 1].sender !== recipient.name) {
      setTimeout(() => {
        const reply = {
          id: messages.length + 2,
          sender: recipient.name,
          text: 'Anlaşıldı, teşekkürler! 🚗',
          time: new Date().toISOString()
        };
        setMessages(prev => [...prev, reply]);
      }, 1500);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const formatMessageTime = (dateString) => {
    const messageDate = new Date(dateString);
    return messageDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex flex-col items-center justify-center z-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="animate-pulse flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full mb-4"></div>
            <div className="h-4 w-28 bg-gray-300 rounded mb-3"></div>
            <div className="h-3 w-36 bg-gray-300 rounded"></div>
            <p className="mt-4 text-gray-500">Mesajlar yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipient) {
     return (
      <div className="fixed inset-0 bg-gray-100 flex flex-col items-center justify-center z-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-sm mx-auto">
            <FiSend size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Mesaj Hatası</h2>
            <p className="text-gray-600 mb-6">
                {error || 'Mesajlaşılacak kişi bilgisi bulunamadı.'}
            </p>
            <button 
                onClick={() => router.back()}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
            >
                Geri Dön
            </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 antialiased">
      <div className="bg-white shadow-md z-10 sticky top-0">
        <div className="container mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              className="mr-2 sm:mr-3 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Geri Dön"
            >
              <FiArrowLeft size={20} />
            </button>
            
            <div className="flex items-center flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full mr-3 flex-shrink-0">
                {recipient.avatar_url ? (
                    <img src={recipient.avatar_url} alt={recipient.name} className="w-full h-full rounded-full object-cover"/>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {recipient.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-semibold text-gray-800 truncate">{recipient.name}</h1>
              </div>
            </div>
            
            {orderId && order && (
              <>
                <button 
                  onClick={() => router.push(`/delivery/${orderId}/call`)}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 ml-1 sm:ml-2 transition-colors"
                  aria-label={`${recipient.name} kişisini ara`}
                  title={`${recipient.name} kişisini ara`}
                >
                  <FiPhone size={20} />
                </button>
                
                <button 
                  onClick={() => router.push(`/profil/siparisler/${orderId}/tracking`)}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 ml-1 sm:ml-2 transition-colors"
                  aria-label="Siparişi Takip Et"
                  title="Siparişi Takip Et"
                >
                  <FiMapPin size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-lg text-sm text-center shadow-sm">
            <p>Bu bir sipariş görüşmesidir. Lütfen kişisel bilgilerinizi (kredi kartı vb.) paylaşmayınız.</p>
          </div>
          
          {messages.map((msg, index) => (
            <div 
              key={msg.id || index} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end max-w-xs sm:max-w-md md:max-w-lg">
                {msg.sender !== 'user' && recipient.avatar_url && (
                   <img src={recipient.avatar_url} alt={recipient.name} className="w-6 h-6 rounded-full object-cover mr-2 mb-1 flex-shrink-0"/>
                )}
                 {msg.sender !== 'user' && !recipient.avatar_url && (
                   <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 mr-2 mb-1 flex-shrink-0">
                    {recipient.name?.charAt(0)?.toUpperCase() || '?'}
                   </div>
                )}
                <div 
                  className={`rounded-xl p-3 shadow-md break-words ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p 
                    className={`text-xs mt-1.5 text-right ${
                      msg.sender === 'user' ? 'text-orange-100 opacity-80' : 'text-gray-400'
                    }`}
                  >
                    {formatMessageTime(msg.time)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="bg-white border-t border-gray-200 p-3 sm:p-4 sticky bottom-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 border-none bg-transparent rounded-full px-3 py-2.5 focus:outline-none focus:ring-0 resize-none max-h-28 text-sm placeholder-gray-500"
              placeholder="Bir mesaj yazın..."
              rows={1}
              onInput={(e) => {
                e.target.rows = 1;
                const scrollHeight = e.target.scrollHeight;
                const maxHeight = 112;
                if (scrollHeight > e.target.clientHeight && scrollHeight <= maxHeight) {
                   e.target.rows = Math.min(Math.ceil(scrollHeight / 24), 4);
                }
              }}
            />
            <button 
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="ml-2 p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Mesajı Gönder"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 