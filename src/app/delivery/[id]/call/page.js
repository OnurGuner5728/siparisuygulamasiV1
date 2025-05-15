'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiPhoneOff, FiMic, FiMicOff, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { mockOrders } from '@/app/data/mockdatas';

export default function CourierCall({ params }) {
  const router = useRouter();
  const { id } = params;
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('connecting'); // 'connecting', 'connected', 'ended'
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [courier, setCourier] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  
  // Çağrı süresini hesapla
  useEffect(() => {
    if (callStatus === 'connected') {
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [callStatus]);
  
  // Kurye verilerini yükle
  useEffect(() => {
    const loadCourierData = () => {
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
            rating: 4.8
          };
          
          setCourier(courierData);
          setLoading(false);
          
          // Kurye ile bağlantı simülasyonu
          setTimeout(() => {
            setCallStatus('connected');
            // Arka plan ses efekti (isteğe bağlı)
            if (audioRef.current) {
              audioRef.current.play().catch(e => console.log('Ses otomatik oynatılamadı:', e));
            }
          }, 2000);
        }, 1000);
      } catch (error) {
        console.error('Kurye verileri yüklenirken hata:', error);
        setLoading(false);
        router.replace('/profil/siparisler');
      }
    };
    
    if (id) {
      loadCourierData();
    }
    
    // Sayfa terk edildiğinde çağrıyı sonlandır
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [id, router]);
  
  // Çağrıyı sonlandır
  const endCall = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setCallStatus('ended');
    
    // Arama ekranından çık
    setTimeout(() => {
      router.back();
    }, 1000);
  };
  
  // Mikrofonu aç/kapat
  const toggleMute = () => {
    setMuted(!muted);
  };
  
  // Hoparlörü aç/kapat
  const toggleSpeaker = () => {
    setSpeaker(!speaker);
  };
  
  // Çağrı süresini formatla
  const formatCallDuration = () => {
    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-pulse flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gray-700 mb-4 flex items-center justify-center">
              <FiPhoneOff className="w-12 h-12 text-gray-500" />
            </div>
            <p className="text-xl font-semibold mb-2">Bağlanıyor...</p>
            <p className="text-gray-400">Lütfen bekleyin</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col">
      {/* Ses efekti (sessiz bir dosya) */}
      <audio ref={audioRef} loop className="hidden">
        <source src="/sounds/call-ambient.mp3" type="audio/mpeg" />
      </audio>
      
      {/* Üst bilgi bölümü */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-white">
        {/* Kurye bilgileri ve durum */}
        <div className="relative w-32 h-32 rounded-full bg-gray-800 overflow-hidden mb-6">
          <div className="w-full h-full bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center">
            <span className="text-5xl font-semibold text-blue-300">
              {courier?.name?.charAt(0) || "K"}
            </span>
          </div>
          
          {/* Bağlantı durumu animasyonu */}
          {callStatus === 'connected' && (
            <div className="absolute inset-0 border-4 border-blue-400 rounded-full animate-pulse"></div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold mb-1">{courier?.name || "Kurye"}</h2>
        
        <div className="text-blue-300 mb-6">
          {callStatus === 'connecting' && 'Bağlanıyor...'}
          {callStatus === 'connected' && formatCallDuration()}
          {callStatus === 'ended' && 'Arama sonlandı'}
        </div>
        
        {/* Bağlantı durumu göstergesi */}
        {callStatus === 'connecting' && (
          <div className="flex space-x-1 mb-10">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>
      
      {/* Alt kontrol bölümü */}
      <div className="p-8 pb-12">
        <div className="flex justify-center space-x-6">
          {/* Mikrofon kontrolü */}
          <button 
            onClick={toggleMute}
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              muted ? 'bg-gray-800 text-white' : 'bg-gray-700 text-blue-400'
            }`}
          >
            {muted ? <FiMicOff size={24} /> : <FiMic size={24} />}
          </button>
          
          {/* Aramayı sonlandır */}
          <button 
            onClick={endCall}
            className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white"
          >
            <FiPhoneOff size={28} />
          </button>
          
          {/* Hoparlör kontrolü */}
          <button 
            onClick={toggleSpeaker}
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              speaker ? 'bg-gray-700 text-blue-400' : 'bg-gray-800 text-white'
            }`}
          >
            {speaker ? <FiVolume2 size={24} /> : <FiVolumeX size={24} />}
          </button>
        </div>
      </div>
      
      {/* Güvenlik notu */}
      <div className="absolute bottom-0 inset-x-0 pb-6 text-center text-gray-500 text-xs">
        <p>Bu görüşme SiparişApp üzerinden gerçekleştirilmektedir.</p>
        <p>Güvenliğiniz için görüşmeler kaydedilmektedir.</p>
      </div>
    </div>
  );
} 